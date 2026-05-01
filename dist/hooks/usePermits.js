import { useCallback, useEffect, useState } from 'react';
import { Permit } from '../core/Permit';
export function usePermits(permissions) {
    const [statuses, setStatuses] = useState({});
    const checkStatuses = useCallback(async () => {
        const next = await Permit.checkAll(permissions);
        setStatuses(next);
        return next;
    }, [permissions]);
    useEffect(() => {
        void checkStatuses();
    }, [checkStatuses]);
    return {
        statuses: statuses,
        allGranted: permissions.every((permission) => statuses[permission] === 'granted'),
        someGranted: permissions.some((permission) => statuses[permission] === 'granted'),
        check: checkStatuses,
    };
}
