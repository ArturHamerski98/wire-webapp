import type { APIClient } from '@wireapp/api-client';
import type { Notification } from '@wireapp/api-client/src/notification/';
export declare class NotificationBackendRepository {
    private readonly apiClient;
    constructor(apiClient: APIClient);
    getAllNotifications(clientId?: string, lastNotificationId?: string): Promise<{
        notifications: Notification[];
        missedNotification?: string | undefined;
    }>;
    getLastNotification(clientId?: string): Promise<Notification>;
}
