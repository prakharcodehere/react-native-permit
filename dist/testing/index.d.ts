import type { PermissionKey, PermitResult, PermitStatus } from '../types';
type Call = {
    type: 'check' | 'request';
    permission: PermissionKey;
    attempt?: number;
};
export declare const PermitMock: {
    reset(): void;
    mockAll(status: PermitStatus | PermitResult): void;
    mockGranted(permission: PermissionKey, options?: {
        delayMs?: number;
    }): void;
    mockDenied(permission: PermissionKey, options?: {
        delayMs?: number;
    }): void;
    mockBlocked(permission: PermissionKey, options?: {
        delayMs?: number;
    }): void;
    mockLimited(permission: PermissionKey, options?: {
        delayMs?: number;
    }): void;
    mockUnavailable(permission: PermissionKey, options?: {
        delayMs?: number;
    }): void;
    mockExhausted(permission: PermissionKey, options?: {
        delayMs?: number;
    }): void;
    check(permission: PermissionKey): Promise<PermitStatus>;
    request(permission: PermissionKey): Promise<PermitResult>;
    getCalls(permission?: PermissionKey): Call[];
    getCallCount(permission: PermissionKey, type?: Call["type"]): number;
};
export {};
