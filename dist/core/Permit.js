import { Platform } from 'react-native';
import { RESULTS, check, checkMultiple, openSettings as rnOpenSettings, request, requestMultiple, checkNotifications, requestNotifications, } from 'react-native-permissions';
import { emit, emitStatus, subscribeEvent, subscribeStatus } from './events';
import { clearExhaustion, isExhausted, rememberExhausted, setPermitStorage } from './storage';
import { mergeStatuses, normalizeStatus, notificationOptions, resolvePermission } from '../resolver';
const queues = new Map();
function delay(ms) {
    return ms ? new Promise((resolveDelay) => setTimeout(resolveDelay, ms)) : Promise.resolve();
}
async function requestNative(permission, options) {
    var _a;
    try {
        if (permission === 'notifications') {
            if (Platform.OS === 'android' && Number(Platform.Version) < 33)
                return 'granted';
            const result = await requestNotifications(notificationOptions(options.notifications));
            return result.status === RESULTS.GRANTED && ((_a = options.notifications) === null || _a === void 0 ? void 0 : _a.provisional) ? 'provisional' : normalizeStatus(result.status);
        }
        const permissions = resolvePermission(permission);
        if (permissions.length === 0)
            return 'unavailable';
        if (permissions.length === 1)
            return normalizeStatus(await request(permissions[0]));
        const results = await requestMultiple(permissions);
        return mergeStatuses(permissions.map((item) => normalizeStatus(results[item])));
    }
    catch {
        return 'unavailable';
    }
}
async function performRequest(permission, options = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const retry = options.retry;
    const maxAttempts = Math.max(1, (_a = retry === null || retry === void 0 ? void 0 : retry.maxAttempts) !== null && _a !== void 0 ? _a : 1);
    if ((_b = options.signal) === null || _b === void 0 ? void 0 : _b.aborted)
        return 'cancelled';
    if (await isExhausted(permission, retry))
        return 'exhausted';
    const current = await Permit.check(permission, options);
    if (current === 'granted' || current === 'limited' || current === 'provisional' || current === 'blocked' || current === 'unavailable') {
        return current;
    }
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        if ((_c = options.signal) === null || _c === void 0 ? void 0 : _c.aborted)
            return 'cancelled';
        (_d = retry === null || retry === void 0 ? void 0 : retry.onAttempt) === null || _d === void 0 ? void 0 : _d.call(retry, attempt, maxAttempts);
        emit({ type: 'system_prompt_shown', permission, attempt });
        const result = await requestNative(permission, options);
        emitStatus(permission, result);
        if (result === 'granted')
            (_e = options.onGranted) === null || _e === void 0 ? void 0 : _e.call(options);
        if (result === 'denied')
            (_f = options.onDenied) === null || _f === void 0 ? void 0 : _f.call(options);
        if (result === 'blocked')
            (_g = options.onBlocked) === null || _g === void 0 ? void 0 : _g.call(options);
        emit({ type: result === 'unknown' ? 'unavailable' : result, permission, attempt });
        if (result !== 'denied' || attempt === maxAttempts) {
            if (result === 'denied' && attempt === maxAttempts) {
                await rememberExhausted(permission, retry);
                (_h = retry === null || retry === void 0 ? void 0 : retry.onRetriesExhausted) === null || _h === void 0 ? void 0 : _h.call(retry, permission);
                (_j = options.onExhausted) === null || _j === void 0 ? void 0 : _j.call(options);
                emit({ type: 'exhausted', permission, totalAttempts: maxAttempts });
                return 'exhausted';
            }
            return result;
        }
        await delay(retry === null || retry === void 0 ? void 0 : retry.cooldownMs);
    }
    return 'exhausted';
}
export const Permit = {
    async check(permission, options) {
        var _a;
        try {
            if (permission === 'notifications') {
                if (Platform.OS === 'android' && Number(Platform.Version) < 33)
                    return 'granted';
                const result = await checkNotifications();
                return result.status === RESULTS.GRANTED && ((_a = options === null || options === void 0 ? void 0 : options.notifications) === null || _a === void 0 ? void 0 : _a.provisional) ? 'provisional' : normalizeStatus(result.status);
            }
            const permissions = resolvePermission(permission);
            if (permissions.length === 0)
                return 'unavailable';
            if (permissions.length === 1)
                return normalizeStatus(await check(permissions[0]));
            const results = await checkMultiple(permissions);
            return mergeStatuses(permissions.map((item) => normalizeStatus(results[item])));
        }
        catch {
            return 'unavailable';
        }
    },
    async checkAll(permissions) {
        const entries = await Promise.all(permissions.map(async (permission) => [permission, await Permit.check(permission)]));
        return Object.fromEntries(entries);
    },
    request(permission, options = {}) {
        const existing = queues.get(permission);
        if (existing)
            return existing;
        const next = performRequest(permission, options).finally(() => {
            queues.delete(permission);
        });
        queues.set(permission, next);
        return next;
    },
    async openSettings(permission) {
        await rnOpenSettings();
        if (permission)
            emit({ type: 'settings_opened', permission });
    },
    clearExhaustion(permission, retry) {
        return clearExhaustion(permission, retry);
    },
    configure(next) {
        if (next.storage)
            setPermitStorage(next.storage);
        return next.onEvent ? subscribeEvent(next.onEvent) : () => undefined;
    },
    subscribe: subscribeStatus,
};
