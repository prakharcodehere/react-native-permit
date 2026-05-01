import type { PermissionKey, PermitStatus } from '../types';
export declare function usePermits(permissions: PermissionKey[]): {
    statuses: Record<PermissionKey, PermitStatus>;
    allGranted: boolean;
    someGranted: boolean;
    check: () => Promise<Record<PermissionKey, PermitStatus>>;
};
