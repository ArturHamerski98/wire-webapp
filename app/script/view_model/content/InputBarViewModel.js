/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

'use strict';

window.z = window.z || {};
window.z.viewModel = z.viewModel || {};
window.z.viewModel.content = z.viewModel.content || {};

// Parent: z.viewModel.ContentViewModel
z.viewModel.content.InputBarViewModel = class InputBarViewModel {
  static get CONFIG() {
    return {
      ASSETS: {
        CONCURRENT_UPLOAD_LIMIT: 10,
      },
      GIPHY_TEXT_LENGTH: 256,
      IMAGE: {
        FILE_TYPES: ['image/bmp', 'image/gif', 'image/jpeg', 'image/jpg', 'image/png', '.jpg-large'],
      },
      PING_TIMEOUT: z.util.TimeUtil.UNITS_IN_MILLIS.SECOND * 2,
    };
  }

  constructor(mainViewModel, contentViewModel, repositories, messageHasher) {
    this.addedToView = this.addedToView.bind(this);
    this.addMention = this.addMention.bind(this);
    this.clickToPing = this.clickToPing.bind(this);
    this.endMentionFlow = this.endMentionFlow.bind(this);
    this.onDropFiles = this.onDropFiles.bind(this);
    this.onPasteFiles = this.onPasteFiles.bind(this);
    this.onWindowClick = this.onWindowClick.bind(this);
    this.setElements = this.setElements.bind(this);
    this.updateSelectionState = this.updateSelectionState.bind(this);

    this.messageHasher = messageHasher;

    this.shadowInput = null;
    this.textarea = null;

    this.selectionStart = ko.observable(0);
    this.selectionEnd = ko.observable(0);

    this.emojiInput = contentViewModel.emojiInput;

    this.eventRepository = repositories.event;
    this.conversationRepository = repositories.conversation;
    this.searchRepository = repositories.search;
    this.userRepository = repositories.user;
    this.logger = new z.util.Logger('z.viewModel.content.InputBarViewModel', z.config.LOGGER.OPTIONS);

    this.conversationEntity = this.conversationRepository.active_conversation;
    this.selfUser = this.userRepository.self;

    this.conversationHasFocus = ko.observable(true).extend({notify: 'always'});

    this.editMessageEntity = ko.observable();
    this.replyMessageEntity = ko.observable();

    const handleRepliedMessageDeleted = messageId => {
      if (this.replyMessageEntity() && this.replyMessageEntity().id === messageId) {
        this.replyMessageEntity(undefined);
      }
    };

    const handleRepliedMessageUpdated = (originalMessageId, messageEntity) => {
      if (this.replyMessageEntity() && this.replyMessageEntity().id === originalMessageId) {
        this.replyMessageEntity(messageEntity);
      }
    };

    ko.pureComputed(() => !!this.replyMessageEntity())
      .extend({notify: 'always', rateLimit: 100})
      .subscribeChanged((isReplyingToMessage, wasReplyingToMessage) => {
        if (isReplyingToMessage !== wasReplyingToMessage) {
          this.triggerInputChangeEvent();
          if (isReplyingToMessage) {
            amplify.subscribe(z.event.WebApp.CONVERSATION.MESSAGE.REMOVED, handleRepliedMessageDeleted);
            amplify.subscribe(z.event.WebApp.CONVERSATION.MESSAGE.UPDATED, handleRepliedMessageUpdated);
          } else {
            amplify.unsubscribe(z.event.WebApp.CONVERSATION.MESSAGE.REMOVED, handleRepliedMessageDeleted);
            amplify.unsubscribe(z.event.WebApp.CONVERSATION.MESSAGE.UPDATED, handleRepliedMessageUpdated);
          }
        }
      });

    this.replyAsset = ko.pureComputed(() => {
      return this.replyMessageEntity() && this.replyMessageEntity().assets() && this.replyMessageEntity().assets()[0];
    });

    this.isEditing = ko.pureComputed(() => !!this.editMessageEntity());
    this.isReplying = ko.pureComputed(() => !!this.replyMessageEntity());
    this.replyMessageId = ko.pureComputed(() => (this.replyMessageEntity() ? this.replyMessageEntity().id : undefined));

    this.pastedFile = ko.observable();
    this.pastedFilePreviewUrl = ko.observable();
    this.pastedFileName = ko.observable();

    this.pingDisabled = ko.observable(false);

    this.editedMention = ko.observable(undefined);
    this.currentMentions = ko.observableArray();

    this.hasFocus = ko.pureComputed(() => this.isEditing() || this.conversationHasFocus()).extend({notify: 'always'});
    this.hasTextInput = ko.pureComputed(() => this.input().length);

    this.input = ko.observable('');

    this.input.subscribeChanged((newValue, oldValue) => {
      const difference = newValue.length - oldValue.length;
      const updatedMentions = this.updateMentionRanges(
        this.currentMentions(),
        this.selectionStart(),
        this.selectionEnd(),
        difference
      );
      this.currentMentions(updatedMentions);
      this.updateSelectionState();
    });

    this.draftMessage = ko
      .pureComputed(() => {
        const text = this.input();
        const mentions = this.currentMentions();
        const reply = this.replyMessageEntity();
        return {mentions, reply, text};
      })
      .extend({rateLimit: {method: 'notifyWhenChangesStop', timeout: 1}});

    this.mentionSuggestions = ko.pureComputed(() => {
      if (!this.editedMention() || !this.conversationEntity()) {
        return [];
      }

      const candidates = this.conversationEntity()
        .participating_user_ets()
        .filter(userEntity => !userEntity.isService);
      return this.searchRepository.searchUserInSet(this.editedMention().term, candidates);
    });

    this.richTextInput = ko.pureComputed(() => {
      const mentionAttributes = ' class="input-mention" data-uie-name="item-input-mention"';
      const pieces = this.currentMentions()
        .slice()
        .reverse()
        .reduce(
          (currentPieces, mentionEntity) => {
            const currentPiece = currentPieces.shift();
            currentPieces.unshift(currentPiece.substr(mentionEntity.endIndex));
            currentPieces.unshift(currentPiece.substr(mentionEntity.startIndex, mentionEntity.length));
            currentPieces.unshift(currentPiece.substr(0, mentionEntity.startIndex));
            return currentPieces;
          },
          [this.input()]
        );

      return pieces
        .map((piece, index) => {
          const textPiece = z.util.SanitizationUtil.escapeString(piece).replace(/[\r\n]/g, '<br>');
          return `<span${index % 2 ? mentionAttributes : ''}>${textPiece}</span>`;
        })
        .join('')
        .replace(/<br><\/span>$/, '<br>&nbsp;</span>');
    });

    this.richTextInput.subscribe(() => {
      if (this.textarea && this.shadowInput) {
        z.util.afterRender(() => {
          if (this.shadowInput.scrollTop !== this.textarea.scrollTop) {
            this.shadowInput.scrollTop = this.textarea.scrollTop;
          }
        });
      }
    });

    this.inputPlaceholder = ko.pureComputed(() => {
      if (this.showAvailabilityTooltip()) {
        const userEntity = this.conversationEntity().firstUserEntity();
        const availabilityStrings = {
          [z.user.AvailabilityType.AVAILABLE]: z.string.tooltipConversationInputPlaceholderAvailable,
          [z.user.AvailabilityType.AWAY]: z.string.tooltipConversationInputPlaceholderAway,
          [z.user.AvailabilityType.BUSY]: z.string.tooltipConversationInputPlaceholderBusy,
        };

        return z.l10n.text(availabilityStrings[userEntity.availability()], userEntity.first_name());
      }

      const stringId = this.conversationEntity().messageTimer()
        ? z.string.tooltipConversationEphemeral
        : z.string.tooltipConversationInputPlaceholder;

      return z.l10n.text(stringId);
    });

    this.showAvailabilityTooltip = ko.pureComputed(() => {
      if (this.conversationEntity() && this.conversationEntity().firstUserEntity()) {
        const isOne2OneConversation = this.conversationEntity().is1to1();
        const firstUserEntity = this.conversationEntity().firstUserEntity();
        const availabilityIsNone = firstUserEntity.availability() === z.user.AvailabilityType.NONE;
        return this.selfUser().inTeam() && isOne2OneConversation && !availabilityIsNone;
      }

      return false;
    });

    this.showGiphyButton = ko.pureComputed(() => {
      return this.hasTextInput() && this.input().length <= InputBarViewModel.CONFIG.GIPHY_TEXT_LENGTH;
    });

    const pingShortcut = z.ui.Shortcut.getShortcutTooltip(z.ui.ShortcutType.PING);
    this.pingTooltip = z.l10n.text(z.string.tooltipConversationPing, pingShortcut);

    this.isEditing.subscribe(isEditing => {
      if (isEditing) {
        return window.addEventListener('click', this.onWindowClick);
      }

      window.removeEventListener('click', this.onWindowClick);
    });

    this.pastedFile.subscribe(blob => {
      if (blob) {
        const isSupportedFileType = InputBarViewModel.CONFIG.IMAGE.FILE_TYPES.includes(blob.type);
        if (isSupportedFileType) {
          this.pastedFilePreviewUrl(URL.createObjectURL(blob));
        }

        const date = moment(blob.lastModifiedDate).format('MMMM Do YYYY, h:mm:ss a');
        return this.pastedFileName(z.l10n.text(z.string.conversationSendPastedFile, date));
      }

      this.pastedFilePreviewUrl(null);
      this.pastedFileName(null);
    });

    this.hasLocalEphemeralTimer = ko.pureComputed(() => {
      const conversationEntity = this.conversationEntity();
      return conversationEntity.localMessageTimer() && !conversationEntity.hasGlobalMessageTimer();
    });

    this.conversationEntity.subscribe(this.loadInitialStateForConversation.bind(this));
    this.draftMessage.subscribe(message => {
      if (this.conversationEntity()) {
        this._saveDraftState(this.conversationEntity(), message.text, message.mentions, message.reply);
      }
    });

    this._initSubscriptions();
  }

  _initSubscriptions() {
    amplify.subscribe(z.event.WebApp.CONVERSATION.IMAGE.SEND, this.uploadImages.bind(this));
    amplify.subscribe(z.event.WebApp.CONVERSATION.MESSAGE.EDIT, this.editMessage.bind(this));
    amplify.subscribe(z.event.WebApp.CONVERSATION.MESSAGE.REPLY, this.replyMessage.bind(this));
    amplify.subscribe(z.event.WebApp.EXTENSIONS.GIPHY.SEND, this.sendGiphy.bind(this));
    amplify.subscribe(z.event.WebApp.SEARCH.SHOW, () => this.conversationHasFocus(false));
    amplify.subscribe(z.event.WebApp.SEARCH.HIDE, () => {
      window.requestAnimationFrame(() => this.conversationHasFocus(true));
    });
  }

  setElements(nodes) {
    this.textarea = nodes.find(node => node.id === 'conversation-input-bar-text');
    this.shadowInput = nodes.find(node => node.classList && node.classList.contains('shadow-input'));
    this.updateSelectionState();
  }

  loadInitialStateForConversation(conversationEntity) {
    this.conversationHasFocus(true);
    this.pastedFile(null);
    this.cancelMessageEditing();
    this.cancelMessageReply();

    if (conversationEntity) {
      const previousSessionData = this._loadDraftState(conversationEntity);
      this.input(previousSessionData.text);
      this.currentMentions(previousSessionData.mentions);

      if (previousSessionData.replyEntityPromise) {
        previousSessionData.replyEntityPromise.then(replyEntity => {
          if (replyEntity && replyEntity.isReplyable()) {
            if (!replyEntity.user().id) {
              this.userRepository.get_user_by_id(replyEntity.from).then(userEntity => {
                replyEntity.user(userEntity);
                this.replyMessageEntity(replyEntity);
              });
            } else {
              this.replyMessageEntity(replyEntity);
            }
          }
        });
      }
    }
  }

  _saveDraftState(conversationEntity, text, mentions, reply) {
    if (!this.isEditing()) {
      // we only save state for newly written messages
      reply = reply && reply.id ? {messageId: reply.id} : {};
      const storageKey = this._generateStorageKey(conversationEntity);
      z.util.StorageUtil.setValue(storageKey, {mentions, reply, text});
    }
  }

  _generateStorageKey(conversationEntity) {
    return `${z.storage.StorageKey.CONVERSATION.INPUT}|${conversationEntity.id}`;
  }

  _loadDraftState(conversationEntity) {
    const storageKey = this._generateStorageKey(conversationEntity);
    const storageValue = z.util.StorageUtil.getValue(storageKey);

    if (typeof storageValue === 'undefined') {
      return {mentions: [], reply: {}, text: ''};
    }

    if (typeof storageValue === 'string') {
      return {mentions: [], reply: {}, text: storageValue};
    }

    storageValue.mentions = storageValue.mentions.map(mention => {
      return new z.message.MentionEntity(mention.startIndex, mention.length, mention.userId);
    });

    const replyMessageId = storageValue.reply ? storageValue.reply.messageId : undefined;

    if (replyMessageId) {
      storageValue.replyEntityPromise = this.conversationRepository.get_message_in_conversation_by_id(
        conversationEntity,
        replyMessageId
      );
    }

    return storageValue;
  }

  _resetDraftState() {
    this.currentMentions.removeAll();
    this.input('');
  }

  _createMentionEntity(userEntity) {
    const mentionLength = userEntity.name().length + 1;
    return new z.message.MentionEntity(this.editedMention().startIndex, mentionLength, userEntity.id);
  }

  addMention(userEntity, inputElement) {
    const mentionEntity = this._createMentionEntity(userEntity);

    // keep track of what is before and after the mention being edited
    const beforeMentionPartial = this.input().slice(0, mentionEntity.startIndex);
    const afterMentionPartial = this.input()
      .slice(mentionEntity.startIndex + this.editedMention().term.length + 1)
      .replace(/^ /, '');

    // insert the mention in between
    this.input(`${beforeMentionPartial}@${userEntity.name()} ${afterMentionPartial}`);

    this.currentMentions.push(mentionEntity);
    this.currentMentions.sort((mentionA, mentionB) => mentionA.startIndex - mentionB.startIndex);

    const caretPosition = mentionEntity.endIndex + 1;
    inputElement.selectionStart = caretPosition;
    inputElement.selectionEnd = caretPosition;
    this.endMentionFlow();
  }

  endMentionFlow() {
    this.editedMention(undefined);
    this.updateSelectionState();
  }

  addedToView() {
    amplify.subscribe(z.event.WebApp.SHORTCUT.PING, this.clickToPing);
  }

  cancelMessageEditing(resetDraft = true) {
    this.editMessageEntity(undefined);
    this.replyMessageEntity(undefined);
    if (resetDraft) {
      this._resetDraftState();
    }
  }

  cancelMessageReply(resetDraft = true) {
    this.replyMessageEntity(undefined);
    if (resetDraft) {
      this._resetDraftState();
    }
  }

  handleCancelReply() {
    if (!this.mentionSuggestions().length) {
      this.cancelMessageReply(false);
    }
    this.textarea.focus();
  }

  clickToCancelPastedFile() {
    this.pastedFile(null);
  }

  clickToShowGiphy() {
    amplify.publish(z.event.WebApp.EXTENSIONS.GIPHY.SHOW, this.input());
  }

  clickToPing() {
    if (this.conversationEntity() && !this.pingDisabled()) {
      this.pingDisabled(true);
      this.conversationRepository.sendKnock(this.conversationEntity()).then(() => {
        window.setTimeout(() => this.pingDisabled(false), InputBarViewModel.CONFIG.PING_TIMEOUT);
      });
    }
  }

  editMessage(messageEntity) {
    if (messageEntity && messageEntity.is_editable() && messageEntity !== this.editMessageEntity()) {
      this.cancelMessageReply();
      this.cancelMessageEditing();
      this.editMessageEntity(messageEntity);

      this.input(messageEntity.get_first_asset().text);
      const newMentions = messageEntity
        .get_first_asset()
        .mentions()
        .slice();
      this.currentMentions(newMentions);

      if (messageEntity.quote) {
        this.conversationRepository
          .get_message_in_conversation_by_id(this.conversationEntity(), messageEntity.quote().messageId)
          .then(quotedMessage => this.replyMessageEntity(quotedMessage));
      }

      this._moveCursorToEnd();
    }
  }

  replyMessage(messageEntity) {
    if (messageEntity && messageEntity.isReplyable() && messageEntity !== this.replyMessageEntity()) {
      this.cancelMessageReply(false);
      this.cancelMessageEditing(!!this.editMessageEntity());
      this.replyMessageEntity(messageEntity);
      this.textarea.focus();
    }
  }

  onDropFiles(droppedFiles) {
    const images = [];
    const files = [];

    const tooManyConcurrentUploads = this._isHittingUploadLimit(droppedFiles);
    if (!tooManyConcurrentUploads) {
      Array.from(droppedFiles).forEach(file => {
        const isSupportedImage = InputBarViewModel.CONFIG.IMAGE.FILE_TYPES.includes(file.type);
        if (isSupportedImage) {
          return images.push(file);
        }
        files.push(file);
      });

      this.uploadImages(images);
      this.uploadFiles(files);
    }
  }

  onPasteFiles(pastedFiles) {
    const [pastedFile] = pastedFiles;
    this.pastedFile(pastedFile);
  }

  onWindowClick(event) {
    if (!$(event.target).closest('.conversation-input-bar, .conversation-input-bar-mention-suggestion').length) {
      this.cancelMessageEditing();
      this.cancelMessageReply();
    }
  }

  onInputEnter(data, event) {
    if (this.pastedFile()) {
      return this.sendPastedFile();
    }

    const beforeLength = this.input().length;
    const messageTrimmedStart = z.util.StringUtil.trimStart(this.input());
    const afterLength = messageTrimmedStart.length;

    const updatedMentions = this.updateMentionRanges(this.currentMentions(), 0, 0, afterLength - beforeLength);
    this.currentMentions(updatedMentions);

    const messageText = z.util.StringUtil.trimEnd(messageTrimmedStart);

    const isMessageTextTooLong = messageText.length > z.config.MAXIMUM_MESSAGE_LENGTH;
    if (isMessageTextTooLong) {
      return amplify.publish(z.event.WebApp.WARNING.MODAL, z.viewModel.ModalsViewModel.TYPE.ACKNOWLEDGE, {
        text: {
          message: z.l10n.text(z.string.modalConversationMessageTooLongMessage, z.config.MAXIMUM_MESSAGE_LENGTH),
          title: z.l10n.text(z.string.modalConversationMessageTooLongHeadline),
        },
      });
    }

    if (this.isEditing()) {
      this.sendMessageEdit(messageText, this.editMessageEntity(), this.replyMessageEntity());
    } else {
      this.sendMessage(messageText, this.replyMessageEntity());
    }

    this._resetDraftState();
    $(event.target).focus();
  }

  onInputKeyDown(data, keyboardEvent) {
    const inputHandledByEmoji = !this.editedMention() && this.emojiInput.onInputKeyDown(data, keyboardEvent);

    if (!inputHandledByEmoji) {
      switch (keyboardEvent.key) {
        case z.util.KeyboardUtil.KEY.ARROW_UP: {
          if (!z.util.KeyboardUtil.isFunctionKey(keyboardEvent) && !this.input().length) {
            this.editMessage(this.conversationEntity().get_last_editable_message());
            this.updateMentions(data, keyboardEvent);
          }
          break;
        }

        case z.util.KeyboardUtil.KEY.ESC: {
          if (this.mentionSuggestions().length) {
            this.endMentionFlow();
          } else if (this.pastedFile()) {
            this.pastedFile(null);
          } else if (this.isEditing()) {
            this.cancelMessageEditing();
          } else if (this.isReplying()) {
            this.cancelMessageReply(false);
          }
          break;
        }

        case z.util.KeyboardUtil.KEY.ENTER: {
          if (keyboardEvent.altKey || keyboardEvent.metaKey) {
            z.util.KeyboardUtil.insertAtCaret(keyboardEvent.target, '\n');
            $(keyboardEvent.target).change();
            keyboardEvent.preventDefault();
          }
          break;
        }

        default:
          break;
      }

      return true;
    }
  }

  /**
   * Returns a term which is a mention match together with its starting position.
   * If nothing could be matched, it returns `undefined`.
   *
   * @param {number} selectionStart - Current caret position or start of selection  (if text is marked)
   * @param {number} selectionEnd - Current caret position or end of selection (if text is marked)
   * @param {string} value - Text input
   * @returns {undefined|{startIndex: number, term: string}} Matched mention info
   */
  getMentionCandidate(selectionStart, selectionEnd, value) {
    const textInSelection = value.substring(selectionStart, selectionEnd);
    const wordBeforeSelection = value.substring(0, selectionStart).replace(/[^]*\s/, '');
    const isSpaceSelected = /\s/.test(textInSelection);

    const startOffset = wordBeforeSelection.length ? wordBeforeSelection.length - 1 : 1;
    const isSelectionStartMention = this.findMentionAtPosition(selectionStart - startOffset, this.currentMentions());
    const isSelectionEndMention = this.findMentionAtPosition(selectionEnd, this.currentMentions());
    const isOverMention = isSelectionStartMention || isSelectionEndMention;
    const isOverValidMentionString = /^@\S*$/.test(wordBeforeSelection);

    if (!isSpaceSelected && !isOverMention && isOverValidMentionString) {
      const wordAfterSelection = value.substring(selectionEnd).replace(/\s[^]*/, '');

      const term = `${wordBeforeSelection.replace(/^@/, '')}${textInSelection}${wordAfterSelection}`;
      const startIndex = selectionStart - wordBeforeSelection.length;
      return {startIndex, term};
    }

    return undefined;
  }

  handleMentionFlow() {
    const {selectionStart, selectionEnd, value} = this.textarea;
    const mentionCandidate = this.getMentionCandidate(selectionStart, selectionEnd, value);
    this.editedMention(mentionCandidate);
    this.updateSelectionState();
  }

  updateSelectionState() {
    if (!this.textarea) {
      return;
    }
    const {selectionStart, selectionEnd} = this.textarea;
    const defaultRange = {endIndex: 0, startIndex: Infinity};

    const firstMention = this.findMentionAtPosition(selectionStart, this.currentMentions()) || defaultRange;
    const lastMention = this.findMentionAtPosition(selectionEnd, this.currentMentions()) || defaultRange;

    const mentionStart = Math.min(firstMention.startIndex, lastMention.startIndex);
    const mentionEnd = Math.max(firstMention.endIndex, lastMention.endIndex);

    const newStart = Math.min(mentionStart, selectionStart);
    const newEnd = Math.max(mentionEnd, selectionEnd);
    if (newStart !== selectionStart || newEnd !== selectionEnd) {
      this.textarea.selectionStart = newStart;
      this.textarea.selectionEnd = newEnd;
    }
    this.selectionStart(newStart);
    this.selectionEnd(newEnd);
  }

  updateMentions(data, event) {
    const textarea = event.target;
    const value = textarea.value;
    const previousValue = this.input();

    const lengthDifference = value.length - previousValue.length;
    const edgeMention = this.detectMentionEdgeDeletion(textarea, lengthDifference);
    if (edgeMention) {
      textarea.value = this.input();
      textarea.selectionStart = edgeMention.startIndex;
      textarea.selectionEnd = edgeMention.endIndex;
    }
  }

  detectMentionEdgeDeletion(textarea, lengthDifference) {
    const hadSelection = this.selectionStart() !== this.selectionEnd();
    if (hadSelection) {
      return null;
    }
    if (lengthDifference >= 0) {
      return null;
    }
    const currentSelectionStart = textarea.selectionStart;
    const forwardDeleted = currentSelectionStart === this.selectionStart();
    const checkPosition = forwardDeleted ? currentSelectionStart + 1 : currentSelectionStart;
    return this.findMentionAtPosition(checkPosition, this.currentMentions());
  }

  updateMentionRanges(mentions, start, end, difference) {
    const remainingMentions = mentions.filter(({startIndex, endIndex}) => endIndex <= start || startIndex >= end);

    remainingMentions.forEach(mention => {
      if (mention.startIndex >= end) {
        mention.startIndex += difference;
      }
    });

    return remainingMentions;
  }

  findMentionAtPosition(position, mentions) {
    return mentions.find(({startIndex, endIndex}) => position > startIndex && position < endIndex);
  }

  onInputKeyUp(data, keyboardEvent) {
    if (!this.editedMention()) {
      this.emojiInput.onInputKeyUp(data, keyboardEvent);
    }
    if (keyboardEvent.key !== z.util.KeyboardUtil.KEY.ESC) {
      this.handleMentionFlow();
    }
  }

  removedFromView() {
    amplify.unsubscribeAll(z.event.WebApp.SHORTCUT.PING);
  }

  triggerInputChangeEvent(newInputHeight = 0, previousInputHeight = 0) {
    amplify.publish(z.event.WebApp.INPUT.RESIZE, newInputHeight - previousInputHeight);
  }

  sendGiphy() {
    this._resetDraftState();
  }

  _generateQuote(replyMessageEntity) {
    return !replyMessageEntity
      ? Promise.resolve()
      : this.eventRepository
          .loadEvent(replyMessageEntity.conversation_id, replyMessageEntity.id)
          .then(this.messageHasher.hashEvent)
          .then(messageHash => {
            return new z.message.QuoteEntity({
              hash: messageHash,
              messageId: replyMessageEntity.id,
              userId: replyMessageEntity.from,
            });
          });
  }

  sendMessage(messageText, replyMessageEntity) {
    if (messageText.length) {
      const mentionEntities = this.currentMentions.slice();

      this._generateQuote(replyMessageEntity).then(quoteEntity => {
        this.conversationRepository.sendTextWithLinkPreview(
          this.conversationEntity(),
          messageText,
          mentionEntities,
          quoteEntity
        );
        this.cancelMessageReply();
      });
    }
  }

  sendMessageEdit(messageText, messageEntity, replyMessageEntity) {
    const mentionEntities = this.currentMentions.slice();
    this.cancelMessageEditing();

    if (!messageText.length) {
      return this.conversationRepository.deleteMessageForEveryone(this.conversationEntity(), messageEntity);
    }

    this._generateQuote(replyMessageEntity).then(quoteEntity => {
      this.conversationRepository
        .sendMessageEdit(this.conversationEntity(), messageText, messageEntity, mentionEntities, quoteEntity)
        .catch(error => {
          if (error.type !== z.error.ConversationError.TYPE.NO_MESSAGE_CHANGES) {
            throw error;
          }
        });
      this.cancelMessageReply();
    });
  }

  sendPastedFile() {
    this.onDropFiles([this.pastedFile()]);
    this.pastedFile(null);
  }

  /**
   * Post images to a conversation.
   * @param {Array|FileList} images - Images
   * @returns {undefined} No return value
   */
  uploadImages(images) {
    if (!this._isHittingUploadLimit(images)) {
      for (const image of Array.from(images)) {
        const isTooLarge = image.size > z.config.MAXIMUM_IMAGE_FILE_SIZE;
        if (isTooLarge) {
          return this._showUploadWarning(image);
        }
      }

      this.conversationRepository.upload_images(this.conversationEntity(), images);
    }
  }

  /**
   * Post files to a conversation.
   * @param {Array|FileList} files - Images
   * @returns {undefined} No return value
   */
  uploadFiles(files) {
    const uploadLimit = this.selfUser().inTeam()
      ? z.config.MAXIMUM_ASSET_FILE_SIZE_TEAM
      : z.config.MAXIMUM_ASSET_FILE_SIZE_PERSONAL;
    if (!this._isHittingUploadLimit(files)) {
      for (const file of Array.from(files)) {
        const isTooLarge = file.size > uploadLimit;
        if (isTooLarge) {
          const fileSize = z.util.formatBytes(uploadLimit);
          const options = {
            text: {
              message: z.l10n.text(z.string.modalAssetTooLargeMessage, fileSize),
              title: z.l10n.text(z.string.modalAssetTooLargeHeadline),
            },
          };

          return amplify.publish(z.event.WebApp.WARNING.MODAL, z.viewModel.ModalsViewModel.TYPE.ACKNOWLEDGE, options);
        }
      }

      this.conversationRepository.upload_files(this.conversationEntity(), files);
    }
  }

  _isHittingUploadLimit(files) {
    const concurrentUploadLimit = InputBarViewModel.CONFIG.ASSETS.CONCURRENT_UPLOAD_LIMIT;
    const concurrentUploads = files.length + this.conversationRepository.get_number_of_pending_uploads();
    const isHittingUploadLimit = concurrentUploads > InputBarViewModel.CONFIG.ASSETS.CONCURRENT_UPLOAD_LIMIT;

    if (isHittingUploadLimit) {
      const modalOptions = {
        text: {
          message: z.l10n.text(z.string.modalAssetParallelUploadsMessage, concurrentUploadLimit),
          title: z.l10n.text(z.string.modalAssetParallelUploadsHeadline),
        },
      };

      amplify.publish(z.event.WebApp.WARNING.MODAL, z.viewModel.ModalsViewModel.TYPE.ACKNOWLEDGE, modalOptions);
    }

    return isHittingUploadLimit;
  }

  _moveCursorToEnd() {
    z.util.afterRender(() => {
      if (this.textarea) {
        const endPosition = this.textarea.value.length;
        this.textarea.setSelectionRange(endPosition, endPosition);
        this.updateSelectionState();
      }
    });
  }

  _showUploadWarning(image) {
    const isGif = image.type === 'image/gif';
    const messageStringId = isGif ? z.string.modalGifTooLargeMessage : z.string.modalPictureTooLargeMessage;
    const titleStringId = isGif ? z.string.modalGifTooLargeHeadline : z.string.modalPictureTooLargeHeadline;

    const modalOptions = {
      text: {
        message: z.l10n.text(messageStringId, z.config.MAXIMUM_IMAGE_FILE_SIZE / 1024 / 1024),
        title: z.l10n.text(titleStringId),
      },
    };

    amplify.publish(z.event.WebApp.WARNING.MODAL, z.viewModel.ModalsViewModel.TYPE.ACKNOWLEDGE, modalOptions);
  }
};
