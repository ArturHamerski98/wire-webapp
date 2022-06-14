import { Account } from './Account';
import * as auth from './auth/';
import * as conversation from './conversation/';
import { CoreError } from './CoreError';
import * as cryptography from './cryptography/';
import * as util from './util';
import { MessageBuilder } from './conversation/message/MessageBuilder';
declare const _default: {
    Account: typeof Account;
    MessageBuilder: typeof MessageBuilder;
    CoreError: typeof CoreError;
    auth: typeof auth;
    conversation: typeof conversation;
    cryptography: typeof cryptography;
    util: typeof util;
};
export = _default;
