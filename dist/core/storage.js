const memory = new Map();
let storage = {
    async getItem(key) {
        var _a;
        return (_a = memory.get(key)) !== null && _a !== void 0 ? _a : null;
    },
    async setItem(key, value) {
        memory.set(key, value);
    },
    async removeItem(key) {
        memory.delete(key);
    },
};
export function setPermitStorage(next) {
    storage = next;
}
export function exhaustionKey(permission, retry) {
    var _a;
    return `${(_a = retry === null || retry === void 0 ? void 0 : retry.persistenceKey) !== null && _a !== void 0 ? _a : '@permit/exhausted/'}${permission}`;
}
export async function isExhausted(permission, retry) {
    if (!(retry === null || retry === void 0 ? void 0 : retry.persistExhaustion))
        return false;
    const raw = await storage.getItem(exhaustionKey(permission, retry));
    if (!raw)
        return false;
    const savedAt = Number(raw);
    const days = retry.resetExhaustionAfterDays;
    if (!days || Number.isNaN(savedAt))
        return true;
    const expired = Date.now() - savedAt > days * 86400000;
    if (expired)
        await storage.removeItem(exhaustionKey(permission, retry));
    return !expired;
}
export async function rememberExhausted(permission, retry) {
    if (retry === null || retry === void 0 ? void 0 : retry.persistExhaustion) {
        await storage.setItem(exhaustionKey(permission, retry), String(Date.now()));
    }
}
export function clearExhaustion(permission, retry) {
    return storage.removeItem(exhaustionKey(permission, retry));
}
