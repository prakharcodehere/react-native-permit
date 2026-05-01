import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Permit } from '../core/Permit';
export function usePermit(permission, options = {}) {
    const [status, setStatus] = useState('unknown');
    const [result, setResult] = useState(null);
    const mounted = useRef(true);
    const runCheck = useCallback(async () => {
        const next = await Permit.check(permission);
        if (mounted.current)
            setStatus(next);
        return next;
    }, [permission]);
    const runRequest = useCallback(async (requestOptions = {}) => {
        const next = await Permit.request(permission, requestOptions);
        if (mounted.current) {
            setResult(next);
            if (next !== 'cancelled' && next !== 'skipped' && next !== 'exhausted')
                setStatus(next);
        }
        return next;
    }, [permission]);
    useEffect(() => {
        var _a;
        mounted.current = true;
        const unsubscribe = Permit.subscribe(permission, setStatus);
        if ((_a = options.recheckOnMount) !== null && _a !== void 0 ? _a : true)
            void runCheck();
        return () => {
            mounted.current = false;
            unsubscribe();
        };
    }, [options.recheckOnMount, permission, runCheck]);
    useEffect(() => {
        if (options.recheckOnForeground === false)
            return undefined;
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active')
                void runCheck();
        });
        return () => subscription.remove();
    }, [options.recheckOnForeground, runCheck]);
    return useMemo(() => ({
        status,
        result,
        isGranted: status === 'granted',
        isLimited: status === 'limited',
        isProvisional: status === 'provisional',
        isBlocked: status === 'blocked',
        isExhausted: result === 'exhausted',
        isUnavailable: status === 'unavailable',
        request: runRequest,
        check: runCheck,
        openSettings: () => Permit.openSettings(permission),
        clearExhaustion: () => Permit.clearExhaustion(permission),
    }), [permission, result, runCheck, runRequest, status]);
}
