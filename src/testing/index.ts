import type { PermissionKey, PermitResult, PermitStatus } from '../types';

type Call = { type: 'check' | 'request'; permission: PermissionKey; attempt?: number };

const statuses = new Map<PermissionKey | '*', PermitStatus | PermitResult>();
const calls: Call[] = [];
let delayMs = 0;

function wait() {
  return delayMs ? new Promise((resolve) => setTimeout(resolve, delayMs)) : Promise.resolve();
}

function set(permission: PermissionKey | '*', status: PermitStatus | PermitResult, options?: { delayMs?: number }) {
  statuses.set(permission, status);
  delayMs = options?.delayMs ?? 0;
}

function get(permission: PermissionKey) {
  return statuses.get(permission) ?? statuses.get('*') ?? 'unknown';
}

export const PermitMock = {
  reset() {
    statuses.clear();
    calls.length = 0;
    delayMs = 0;
  },

  mockAll(status: PermitStatus | PermitResult) {
    set('*', status);
  },

  mockGranted(permission: PermissionKey, options?: { delayMs?: number }) {
    set(permission, 'granted', options);
  },

  mockDenied(permission: PermissionKey, options?: { delayMs?: number }) {
    set(permission, 'denied', options);
  },

  mockBlocked(permission: PermissionKey, options?: { delayMs?: number }) {
    set(permission, 'blocked', options);
  },

  mockLimited(permission: PermissionKey, options?: { delayMs?: number }) {
    set(permission, 'limited', options);
  },

  mockUnavailable(permission: PermissionKey, options?: { delayMs?: number }) {
    set(permission, 'unavailable', options);
  },

  mockExhausted(permission: PermissionKey, options?: { delayMs?: number }) {
    set(permission, 'exhausted', options);
  },

  async check(permission: PermissionKey): Promise<PermitStatus> {
    calls.push({ type: 'check', permission });
    await wait();
    const status = get(permission);
    return status === 'exhausted' || status === 'skipped' || status === 'cancelled' ? 'unknown' : status;
  },

  async request(permission: PermissionKey): Promise<PermitResult> {
    calls.push({ type: 'request', permission, attempt: this.getCallCount(permission, 'request') + 1 });
    await wait();
    return get(permission);
  },

  getCalls(permission?: PermissionKey) {
    return permission ? calls.filter((call) => call.permission === permission) : [...calls];
  },

  getCallCount(permission: PermissionKey, type?: Call['type']) {
    return this.getCalls(permission).filter((call) => !type || call.type === type).length;
  },
};
