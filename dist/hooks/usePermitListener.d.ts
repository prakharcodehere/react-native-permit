import type { PermissionKey, PermitListener } from '../types';
export declare function usePermitListener(permission: PermissionKey, listener: PermitListener, options?: {
    fireImmediately?: boolean;
}): void;
