import { subscribeStatus } from './events';
import type { PermissionKey, PermitEventListener, PermitRequestOptions, PermitResult, PermitStatus, PermitStorage, RetryConfig } from '../types';
export declare const Permit: {
    check(permission: PermissionKey, options?: Pick<PermitRequestOptions, "notifications">): Promise<PermitStatus>;
    checkAll(permissions: PermissionKey[]): Promise<Record<PermissionKey, PermitStatus>>;
    request(permission: PermissionKey, options?: PermitRequestOptions): Promise<PermitResult>;
    openSettings(permission?: PermissionKey): Promise<void>;
    clearExhaustion(permission: PermissionKey, retry?: RetryConfig): Promise<void>;
    configure(next: {
        storage?: PermitStorage;
        onEvent?: PermitEventListener;
    }): (() => boolean) | (() => undefined);
    subscribe: typeof subscribeStatus;
};
