import type { NotificationOptions, PermissionKey, PermitStatus } from './types';
type NativePermission = string;
export declare function normalizeStatus(value: string): PermitStatus;
export declare function notificationOptions(options?: NotificationOptions): {
    alert: boolean;
    badge: boolean;
    sound: boolean;
    provisional: boolean;
    criticalAlert: boolean;
    announcement: boolean;
    carPlay: boolean;
};
export declare function resolvePermission(permission: PermissionKey): NativePermission[];
export declare function mergeStatuses(statuses: PermitStatus[]): PermitStatus;
export {};
