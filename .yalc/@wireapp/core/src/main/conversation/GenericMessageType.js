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
exports.GenericMessageType = void 0;
// Enum values come from "IGenericMessage" properties in "Protobuf.d.ts"
var GenericMessageType;
(function (GenericMessageType) {
    GenericMessageType["ASSET"] = "asset";
    GenericMessageType["ASSET_ABORT"] = "assetAbort";
    GenericMessageType["ASSET_META"] = "assetMeta";
    GenericMessageType["AVAILABILITY"] = "availability";
    GenericMessageType["BUTTON_ACTION"] = "buttonAction";
    GenericMessageType["BUTTON_ACTION_CONFIRMATION"] = "buttonActionConfirmation";
    GenericMessageType["CALLING"] = "calling";
    GenericMessageType["CLEARED"] = "cleared";
    GenericMessageType["CLIENT_ACTION"] = "clientAction";
    GenericMessageType["COMPOSITE"] = "composite";
    GenericMessageType["CONFIRMATION"] = "confirmation";
    GenericMessageType["DATA_TRANSFER"] = "dataTransfer";
    GenericMessageType["DELETED"] = "deleted";
    GenericMessageType["EDITED"] = "edited";
    GenericMessageType["EPHEMERAL"] = "ephemeral";
    GenericMessageType["EXTERNAL"] = "external";
    GenericMessageType["HIDDEN"] = "hidden";
    GenericMessageType["IMAGE"] = "image";
    GenericMessageType["KNOCK"] = "knock";
    GenericMessageType["LAST_READ"] = "lastRead";
    GenericMessageType["LOCATION"] = "location";
    GenericMessageType["REACTION"] = "reaction";
    GenericMessageType["TEXT"] = "text";
})(GenericMessageType = exports.GenericMessageType || (exports.GenericMessageType = {}));
//# sourceMappingURL=GenericMessageType.js.map