import { useEffect } from 'react';
import { Permit } from '../core/Permit';
import type { PermissionKey, PermitListener } from '../types';

export function usePermitListener(permission: PermissionKey, listener: PermitListener, options: { fireImmediately?: boolean } = {}) {
  useEffect(() => {
    const unsubscribe = Permit.subscribe(permission, listener);
    if (options.fireImmediately) void Permit.check(permission).then(listener);
    return unsubscribe;
  }, [listener, options.fireImmediately, permission]);
}
