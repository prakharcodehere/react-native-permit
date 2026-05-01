import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Permit } from '../core/Permit';
import type { PermissionKey, PermitRequestOptions, PermitResult, PermitStatus } from '../types';

export function usePermit(permission: PermissionKey, options: { recheckOnForeground?: boolean; recheckOnMount?: boolean } = {}) {
  const [status, setStatus] = useState<PermitStatus>('unknown');
  const [result, setResult] = useState<PermitResult | null>(null);
  const mounted = useRef(true);

  const runCheck = useCallback(async () => {
    const next = await Permit.check(permission);
    if (mounted.current) setStatus(next);
    return next;
  }, [permission]);

  const runRequest = useCallback(
    async (requestOptions: PermitRequestOptions = {}) => {
      const next = await Permit.request(permission, requestOptions);
      if (mounted.current) {
        setResult(next);
        if (next !== 'cancelled' && next !== 'skipped' && next !== 'exhausted') setStatus(next);
      }
      return next;
    },
    [permission],
  );

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = Permit.subscribe(permission, setStatus);
    if (options.recheckOnMount ?? true) void runCheck();
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [options.recheckOnMount, permission, runCheck]);

  useEffect(() => {
    if (options.recheckOnForeground === false) return undefined;
    const subscription = AppState.addEventListener('change', (state: string) => {
      if (state === 'active') void runCheck();
    });
    return () => subscription.remove();
  }, [options.recheckOnForeground, runCheck]);

  return useMemo(
    () => ({
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
    }),
    [permission, result, runCheck, runRequest, status],
  );
}
