import type { APIClient } from '@wireapp/api-client';
import { Connection } from '@wireapp/api-client/src/connection/';
import { QualifiedId } from '@wireapp/api-client/src/user';
export declare class ConnectionService {
    private readonly apiClient;
    constructor(apiClient: APIClient);
    getConnections(): Promise<Connection[]>;
    acceptConnection(userId: string): Promise<Connection>;
    ignoreConnection(userId: string): Promise<Connection>;
    createConnection(userId: QualifiedId): Promise<Connection>;
}
