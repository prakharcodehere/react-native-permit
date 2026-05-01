import type { PermissionKey, PermitStorage, RetryConfig } from '../types';

const memory = new Map<string, string>();

let storage: PermitStorage = {
  async getItem(key) {
    return memory.get(key) ?? null;
  },
  async setItem(key, value) {
    memory.set(key, value);
  },
  async removeItem(key) {
    memory.delete(key);
  },
};

export function setPermitStorage(next: PermitStorage) {
  storage = next;
}

export function exhaustionKey(permission: PermissionKey, retry?: RetryConfig) {
  return `${retry?.persistenceKey ?? '@permit/exhausted/'}${permission}`;
}

export async function isExhausted(permission: PermissionKey, retry?: RetryConfig) {
  if (!retry?.persistExhaustion) return false;
  const raw = await storage.getItem(exhaustionKey(permission, retry));
  if (!raw) return false;
  const savedAt = Number(raw);
  const days = retry.resetExhaustionAfterDays;
  if (!days || Number.isNaN(savedAt)) return true;
  const expired = Date.now() - savedAt > days * 86400000;
  if (expired) await storage.removeItem(exhaustionKey(permission, retry));
  return !expired;
}

export async function rememberExhausted(permission: PermissionKey, retry?: RetryConfig) {
  if (retry?.persistExhaustion) {
    await storage.setItem(exhaustionKey(permission, retry), String(Date.now()));
  }
}

export function clearExhaustion(permission: PermissionKey, retry?: RetryConfig) {
  return storage.removeItem(exhaustionKey(permission, retry));
}
