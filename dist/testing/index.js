const statuses = new Map();
const calls = [];
let delayMs = 0;
function wait() {
    return delayMs ? new Promise((resolve) => setTimeout(resolve, delayMs)) : Promise.resolve();
}
function set(permission, status, options) {
    var _a;
    statuses.set(permission, status);
    delayMs = (_a = options === null || options === void 0 ? void 0 : options.delayMs) !== null && _a !== void 0 ? _a : 0;
}
function get(permission) {
    var _a, _b;
    return (_b = (_a = statuses.get(permission)) !== null && _a !== void 0 ? _a : statuses.get('*')) !== null && _b !== void 0 ? _b : 'unknown';
}
export const PermitMock = {
    reset() {
        statuses.clear();
        calls.length = 0;
        delayMs = 0;
    },
    mockAll(status) {
        set('*', status);
    },
    mockGranted(permission, options) {
        set(permission, 'granted', options);
    },
    mockDenied(permission, options) {
        set(permission, 'denied', options);
    },
    mockBlocked(permission, options) {
        set(permission, 'blocked', options);
    },
    mockLimited(permission, options) {
        set(permission, 'limited', options);
    },
    mockUnavailable(permission, options) {
        set(permission, 'unavailable', options);
    },
    mockExhausted(permission, options) {
        set(permission, 'exhausted', options);
    },
    async check(permission) {
        calls.push({ type: 'check', permission });
        await wait();
        const status = get(permission);
        return status === 'exhausted' || status === 'skipped' || status === 'cancelled' ? 'unknown' : status;
    },
    async request(permission) {
        calls.push({ type: 'request', permission, attempt: this.getCallCount(permission, 'request') + 1 });
        await wait();
        return get(permission);
    },
    getCalls(permission) {
        return permission ? calls.filter((call) => call.permission === permission) : [...calls];
    },
    getCallCount(permission, type) {
        return this.getCalls(permission).filter((call) => !type || call.type === type).length;
    },
};
