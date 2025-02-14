/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import {ConversationStatus} from '../../conversation/ConversationStatus';
import {ConversationVerificationState} from '../../conversation/ConversationVerificationState';
import {
  ACCESS_ROLE_V2,
  DefaultConversationRoleName,
  CONVERSATION_ACCESS,
  CONVERSATION_ACCESS_ROLE,
  CONVERSATION_TYPE,
} from '@wireapp/api-client/src/conversation';
import type {QualifiedId} from '@wireapp/api-client/src/user/';
import {LegalHoldStatus} from '@wireapp/protocol-messaging';
import {RECEIPT_MODE} from '@wireapp/api-client/src/conversation/data';

export interface ConversationRecord {
  access: CONVERSATION_ACCESS[];
  access_role: CONVERSATION_ACCESS_ROLE | ACCESS_ROLE_V2[];
  archived_state: boolean;
  archived_timestamp: number;
  cleared_timestamp: number;
  creator: string;
  domain: string | null;
  ephemeral_timer: number;
  global_message_timer: number;
  id: string;
  is_guest: boolean;
  is_managed: boolean;
  last_event_timestamp: number;
  last_read_timestamp: number;
  last_server_timestamp: number;
  legal_hold_status: LegalHoldStatus;
  muted_state: number;
  muted_timestamp: number;
  name: string;
  others: string[];
  qualified_others: QualifiedId[];
  receipt_mode: RECEIPT_MODE | null;
  roles: {[userId: string]: DefaultConversationRoleName | string};
  status: ConversationStatus;
  team_id: string;
  type: CONVERSATION_TYPE;
  verification_state: ConversationVerificationState;
}
