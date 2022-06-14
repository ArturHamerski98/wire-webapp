"use strict";
/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageToProtoMapper = void 0;
const protocol_messaging_1 = require("@wireapp/protocol-messaging");
const GenericMessageType_1 = require("../GenericMessageType");
class MessageToProtoMapper {
    static mapLinkPreviews(linkPreviews) {
        const builtLinkPreviews = [];
        for (const linkPreview of linkPreviews) {
            const linkPreviewMessage = protocol_messaging_1.LinkPreview.create({
                permanentUrl: linkPreview.permanentUrl,
                summary: linkPreview.summary,
                title: linkPreview.title,
                url: linkPreview.url,
                urlOffset: linkPreview.urlOffset,
            });
            if (linkPreview.tweet) {
                linkPreviewMessage.tweet = protocol_messaging_1.Tweet.create({
                    author: linkPreview.tweet.author,
                    username: linkPreview.tweet.username,
                });
                linkPreviewMessage.metaData = 'tweet';
            }
            if (linkPreview.imageUploaded) {
                const { asset, image } = linkPreview.imageUploaded;
                const imageMetadata = protocol_messaging_1.Asset.ImageMetaData.create({
                    height: image.height,
                    width: image.width,
                });
                const original = protocol_messaging_1.Asset.Original.create({
                    [GenericMessageType_1.GenericMessageType.IMAGE]: imageMetadata,
                    mimeType: image.type,
                    size: image.data.length,
                });
                const remoteData = protocol_messaging_1.Asset.RemoteData.create({
                    assetId: asset.key,
                    assetToken: asset.token,
                    assetDomain: asset.domain,
                    otrKey: asset.keyBytes,
                    sha256: asset.sha256,
                });
                const assetMessage = protocol_messaging_1.Asset.create({
                    original,
                    uploaded: remoteData,
                });
                linkPreviewMessage.image = assetMessage;
            }
            linkPreviewMessage.article = protocol_messaging_1.Article.create({
                image: linkPreviewMessage.image,
                permanentUrl: linkPreviewMessage.permanentUrl,
                summary: linkPreviewMessage.summary,
                title: linkPreviewMessage.title,
            });
            builtLinkPreviews.push(linkPreviewMessage);
        }
        return builtLinkPreviews;
    }
    static mapText(payloadBundle) {
        const { expectsReadConfirmation, legalHoldStatus, linkPreviews, mentions, quote, text } = payloadBundle.content;
        const textMessage = protocol_messaging_1.Text.create({
            content: text,
            expectsReadConfirmation,
            legalHoldStatus,
        });
        if (linkPreviews === null || linkPreviews === void 0 ? void 0 : linkPreviews.length) {
            textMessage.linkPreview = MessageToProtoMapper.mapLinkPreviews(linkPreviews);
        }
        if (mentions === null || mentions === void 0 ? void 0 : mentions.length) {
            textMessage.mentions = mentions.map(mention => protocol_messaging_1.Mention.create(mention));
        }
        if (quote) {
            textMessage.quote = protocol_messaging_1.Quote.create({
                quotedMessageId: quote.quotedMessageId,
                quotedMessageSha256: quote.quotedMessageSha256,
            });
        }
        return textMessage;
    }
}
exports.MessageToProtoMapper = MessageToProtoMapper;
//# sourceMappingURL=MessageToProtoMapper.js.map