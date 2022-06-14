import type { QualifiedUserClients, UserClients } from '@wireapp/api-client/src/conversation/';
import type { QualifiedId } from '@wireapp/api-client/src/user/';
export declare function isStringArray(obj: any): obj is string[];
export declare function isQualifiedId(obj: any): obj is QualifiedId;
export declare function isQualifiedIdArray(obj: any): obj is QualifiedId[];
export declare function isQualifiedUserClients(obj: any): obj is QualifiedUserClients;
export declare function isUserClients(obj: any): obj is UserClients;
