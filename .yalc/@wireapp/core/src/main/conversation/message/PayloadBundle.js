"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadBundleType = exports.PayloadBundleState = exports.PayloadBundleSource = void 0;
var PayloadBundleSource;
(function (PayloadBundleSource) {
    PayloadBundleSource["LOCAL"] = "PayloadBundleSource.LOCAL";
    PayloadBundleSource["NOTIFICATION_STREAM"] = "PayloadBundleSource.NOTIFICATION_STREAM";
    PayloadBundleSource["WEBSOCKET"] = "PayloadBundleSource.WEBSOCKET";
})(PayloadBundleSource = exports.PayloadBundleSource || (exports.PayloadBundleSource = {}));
var PayloadBundleState;
(function (PayloadBundleState) {
    PayloadBundleState["INCOMING"] = "PayloadBundleState.INCOMING";
    PayloadBundleState["OUTGOING_SENT"] = "PayloadBundleState.OUTGOING_SENT";
    PayloadBundleState["OUTGOING_UNSENT"] = "PayloadBundleState.OUTGOING_UNSENT";
    PayloadBundleState["CANCELLED"] = "PayloadBundleState.CANCELLED";
})(PayloadBundleState = exports.PayloadBundleState || (exports.PayloadBundleState = {}));
var PayloadBundleType;
(function (PayloadBundleType) {
    PayloadBundleType["ASSET"] = "PayloadBundleType.ASSET";
    PayloadBundleType["ASSET_ABORT"] = "PayloadBundleType.ASSET_ABORT";
    PayloadBundleType["ASSET_IMAGE"] = "PayloadBundleType.ASSET_IMAGE";
    PayloadBundleType["ASSET_META"] = "PayloadBundleType.ASSET_META";
    PayloadBundleType["BUTTON_ACTION"] = "PayloadBundleType.BUTTON_ACTION";
    PayloadBundleType["BUTTON_ACTION_CONFIRMATION"] = "PayloadBundleType.BUTTON_ACTION_CONFIRMATION";
    PayloadBundleType["CALL"] = "PayloadBundleType.CALL";
    PayloadBundleType["CLIENT_ACTION"] = "PayloadBundleType.CLIENT_ACTION";
    PayloadBundleType["CLIENT_ADD"] = "PayloadBundleType.CLIENT_ADD";
    PayloadBundleType["CLIENT_REMOVE"] = "PayloadBundleType.CLIENT_REMOVE";
    PayloadBundleType["COMPOSITE"] = "PayloadBundleType.COMPOSITE";
    PayloadBundleType["CONFIRMATION"] = "PayloadBundleType.CONFIRMATION";
    PayloadBundleType["CONNECTION_REQUEST"] = "PayloadBundleType.CONNECTION_REQUEST";
    PayloadBundleType["CONVERSATION_CLEAR"] = "PayloadBundleType.CONVERSATION_CLEAR";
    PayloadBundleType["CONVERSATION_RENAME"] = "PayloadBundleType.CONVERSATION_RENAME";
    PayloadBundleType["LOCATION"] = "PayloadBundleType.LOCATION";
    PayloadBundleType["MEMBER_JOIN"] = "PayloadBundleType.MEMBER_JOIN";
    PayloadBundleType["MESSAGE_DELETE"] = "PayloadBundleType.MESSAGE_DELETE";
    PayloadBundleType["MESSAGE_EDIT"] = "PayloadBundleType.MESSAGE_EDIT";
    PayloadBundleType["MESSAGE_HIDE"] = "PayloadBundleType.MESSAGE_HIDE";
    PayloadBundleType["PING"] = "PayloadBundleType.PING";
    PayloadBundleType["REACTION"] = "PayloadBundleType.REACTION";
    PayloadBundleType["TEAM_CONVERSATION_CREATE"] = "PayloadBundleType.TEAM_CONVERSATION_CREATE";
    PayloadBundleType["TEAM_CONVERSATION_DELETE"] = "PayloadBundleType.TEAM_CONVERSATION_DELETE";
    PayloadBundleType["TEAM_DELETE"] = "PayloadBundleType.TEAM_DELETE";
    PayloadBundleType["TEAM_MEMBER_JOIN"] = "PayloadBundleType.TEAM_MEMBER_JOIN";
    PayloadBundleType["TEAM_MEMBER_LEAVE"] = "PayloadBundleType.TEAM_MEMBER_LEAVE";
    PayloadBundleType["TEAM_UPDATE"] = "PayloadBundleType.TEAM_UPDATE";
    PayloadBundleType["TEXT"] = "PayloadBundleType.TEXT";
    PayloadBundleType["TIMER_UPDATE"] = "PayloadBundleType.TIMER_UPDATE";
    PayloadBundleType["TYPING"] = "PayloadBundleType.TYPING";
    PayloadBundleType["UNKNOWN"] = "PayloadBundleType.UNKNOWN";
    PayloadBundleType["USER_ACTIVATE"] = "PayloadBundleType.USER_ACTIVATE";
    PayloadBundleType["USER_CLIENT_ADD"] = "PayloadBundleType.USER_CLIENT_ADD";
    PayloadBundleType["USER_CLIENT_REMOVE"] = "PayloadBundleType.USER_CLIENT_REMOVE";
    PayloadBundleType["USER_CONNECTION"] = "PayloadBundleType.USER_CONNECTION";
    PayloadBundleType["USER_DELETE"] = "PayloadBundleType.USER_DELETE";
    PayloadBundleType["USER_LEGAL_HOLD_DISABLE"] = "PayloadBundleType.USER_LEGAL_HOLD_DISABLE";
    PayloadBundleType["USER_LEGAL_HOLD_ENABLE"] = "PayloadBundleType.USER_LEGAL_HOLD_ENABLE";
    PayloadBundleType["USER_LEGAL_HOLD_REQUEST"] = "PayloadBundleType.USER_LEGAL_HOLD_REQUEST";
    PayloadBundleType["USER_PROPERTIES_SET"] = "PayloadBundleType.USER_PROPERTIES_SET";
    PayloadBundleType["USER_UPDATE"] = "PayloadBundleType.USER_UPDATE";
})(PayloadBundleType = exports.PayloadBundleType || (exports.PayloadBundleType = {}));
//# sourceMappingURL=PayloadBundle.js.map