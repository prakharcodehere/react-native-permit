import type { PermissionKey, PermitRequestOptions, PermitResult, PermitStatus } from '../types';
export declare function usePermit(permission: PermissionKey, options?: {
    recheckOnForeground?: boolean;
    recheckOnMount?: boolean;
}): {
    status: PermitStatus;
    result: PermitResult | null;
    isGranted: boolean;
    isLimited: boolean;
    isProvisional: boolean;
    isBlocked: boolean;
    isExhausted: boolean;
    isUnavailable: boolean;
    request: (requestOptions?: PermitRequestOptions) => Promise<PermitResult>;
    check: () => Promise<PermitStatus>;
    openSettings: () => Promise<void>;
    clearExhaustion: () => Promise<void>;
};
