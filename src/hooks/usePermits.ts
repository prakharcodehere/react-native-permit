import { useCallback, useEffect, useState } from 'react';
import { Permit } from '../core/Permit';
import type { PermissionKey, PermitStatus } from '../types';

export function usePermits(permissions: PermissionKey[]) {
  const [statuses, setStatuses] = useState<Record<string, PermitStatus>>({});

  const checkStatuses = useCallback(async () => {
    const next = await Permit.checkAll(permissions);
    setStatuses(next);
    return next;
  }, [permissions]);

  useEffect(() => {
    void checkStatuses();
  }, [checkStatuses]);

  return {
    statuses: statuses as Record<PermissionKey, PermitStatus>,
    allGranted: permissions.every((permission) => statuses[permission] === 'granted'),
    someGranted: permissions.some((permission) => statuses[permission] === 'granted'),
    check: checkStatuses,
  };
}
