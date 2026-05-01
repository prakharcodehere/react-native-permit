import type { PermissionKey, PermitEvent, PermitEventListener, PermitListener, PermitStatus } from '../types';
export declare function emit(event: PermitEvent): void;
export declare function emitStatus(permission: PermissionKey, status: PermitStatus): void;
export declare function subscribeStatus(permission: PermissionKey, listener: PermitListener): () => boolean;
export declare function subscribeEvent(listener: PermitEventListener): () => boolean;
