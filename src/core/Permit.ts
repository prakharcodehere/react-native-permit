import { Platform } from 'react-native';
import {
  RESULTS,
  check,
  checkMultiple,
  openSettings as rnOpenSettings,
  request,
  requestMultiple,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
import { emit, emitStatus, subscribeEvent, subscribeStatus } from './events';
import { clearExhaustion, isExhausted, rememberExhausted, setPermitStorage } from './storage';
import { mergeStatuses, normalizeStatus, notificationOptions, resolvePermission } from '../resolver';
import type {
  PermissionKey,
  PermitEventListener,
  PermitRequestOptions,
  PermitResult,
  PermitStatus,
  PermitStorage,
  RetryConfig,
} from '../types';

const queues = new Map<PermissionKey, Promise<PermitResult>>();

function delay(ms?: number) {
  return ms ? new Promise((resolveDelay) => setTimeout(resolveDelay, ms)) : Promise.resolve();
}

async function requestNative(permission: PermissionKey, options: PermitRequestOptions): Promise<PermitStatus> {
  try {
    if (permission === 'notifications') {
      if (Platform.OS === 'android' && Number(Platform.Version) < 33) return 'granted';
      const result = await requestNotifications(notificationOptions(options.notifications));
      return result.status === RESULTS.GRANTED && options.notifications?.provisional ? 'provisional' : normalizeStatus(result.status);
    }

    const permissions = resolvePermission(permission);
    if (permissions.length === 0) return 'unavailable';
    if (permissions.length === 1) return normalizeStatus(await request(permissions[0]));

    const results = await requestMultiple(permissions);
    return mergeStatuses(permissions.map((item) => normalizeStatus(results[item])));
  } catch {
    return 'unavailable';
  }
}

async function performRequest(permission: PermissionKey, options: PermitRequestOptions = {}) {
  const retry = options.retry;
  const maxAttempts = Math.max(1, retry?.maxAttempts ?? 1);

  if (options.signal?.aborted) return 'cancelled';
  if (await isExhausted(permission, retry)) return 'exhausted';

  const current = await Permit.check(permission, options);
  if (current === 'granted' || current === 'limited' || current === 'provisional' || current === 'blocked' || current === 'unavailable') {
    return current;
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (options.signal?.aborted) return 'cancelled';
    retry?.onAttempt?.(attempt, maxAttempts);
    emit({ type: 'system_prompt_shown', permission, attempt });

    const result = await requestNative(permission, options);
    emitStatus(permission, result);

    if (result === 'granted') options.onGranted?.();
    if (result === 'denied') options.onDenied?.();
    if (result === 'blocked') options.onBlocked?.();

    emit({ type: result === 'unknown' ? 'unavailable' : result, permission, attempt });

    if (result !== 'denied' || attempt === maxAttempts) {
      if (result === 'denied' && attempt === maxAttempts) {
        await rememberExhausted(permission, retry);
        retry?.onRetriesExhausted?.(permission);
        options.onExhausted?.();
        emit({ type: 'exhausted', permission, totalAttempts: maxAttempts });
        return 'exhausted';
      }
      return result;
    }

    await delay(retry?.cooldownMs);
  }

  return 'exhausted';
}

export const Permit = {
  async check(permission: PermissionKey, options?: Pick<PermitRequestOptions, 'notifications'>): Promise<PermitStatus> {
    try {
      if (permission === 'notifications') {
        if (Platform.OS === 'android' && Number(Platform.Version) < 33) return 'granted';
        const result = await checkNotifications();
        return result.status === RESULTS.GRANTED && options?.notifications?.provisional ? 'provisional' : normalizeStatus(result.status);
      }

      const permissions = resolvePermission(permission);
      if (permissions.length === 0) return 'unavailable';
      if (permissions.length === 1) return normalizeStatus(await check(permissions[0]));

      const results = await checkMultiple(permissions);
      return mergeStatuses(permissions.map((item) => normalizeStatus(results[item])));
    } catch {
      return 'unavailable';
    }
  },

  async checkAll(permissions: PermissionKey[]) {
    const entries = await Promise.all(permissions.map(async (permission) => [permission, await Permit.check(permission)] as const));
    return Object.fromEntries(entries) as Record<PermissionKey, PermitStatus>;
  },

  request(permission: PermissionKey, options: PermitRequestOptions = {}): Promise<PermitResult> {
    const existing = queues.get(permission);
    if (existing) return existing;

    const next = performRequest(permission, options).finally(() => {
      queues.delete(permission);
    });
    queues.set(permission, next);
    return next;
  },

  async openSettings(permission?: PermissionKey) {
    await rnOpenSettings();
    if (permission) emit({ type: 'settings_opened', permission });
  },

  clearExhaustion(permission: PermissionKey, retry?: RetryConfig) {
    return clearExhaustion(permission, retry);
  },

  configure(next: { storage?: PermitStorage; onEvent?: PermitEventListener }) {
    if (next.storage) setPermitStorage(next.storage);
    return next.onEvent ? subscribeEvent(next.onEvent) : () => undefined;
  },

  subscribe: subscribeStatus,
};
