import type { PermissionKey, PermitStorage, RetryConfig } from '../types';
export declare function setPermitStorage(next: PermitStorage): void;
export declare function exhaustionKey(permission: PermissionKey, retry?: RetryConfig): string;
export declare function isExhausted(permission: PermissionKey, retry?: RetryConfig): Promise<boolean>;
export declare function rememberExhausted(permission: PermissionKey, retry?: RetryConfig): Promise<void>;
export declare function clearExhaustion(permission: PermissionKey, retry?: RetryConfig): Promise<void>;
