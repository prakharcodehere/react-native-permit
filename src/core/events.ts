import type { PermissionKey, PermitEvent, PermitEventListener, PermitListener, PermitStatus } from '../types';

const statusListeners = new Map<PermissionKey, Set<PermitListener>>();
const eventListeners = new Set<PermitEventListener>();

export function emit(event: PermitEvent) {
  eventListeners.forEach((listener) => listener(event));
}

export function emitStatus(permission: PermissionKey, status: PermitStatus) {
  statusListeners.get(permission)?.forEach((listener) => listener(status));
}

export function subscribeStatus(permission: PermissionKey, listener: PermitListener) {
  const listeners = statusListeners.get(permission) ?? new Set<PermitListener>();
  listeners.add(listener);
  statusListeners.set(permission, listeners);
  return () => listeners.delete(listener);
}

export function subscribeEvent(listener: PermitEventListener) {
  eventListeners.add(listener);
  return () => eventListeners.delete(listener);
}
