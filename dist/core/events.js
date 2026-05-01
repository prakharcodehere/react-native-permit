const statusListeners = new Map();
const eventListeners = new Set();
export function emit(event) {
    eventListeners.forEach((listener) => listener(event));
}
export function emitStatus(permission, status) {
    var _a;
    (_a = statusListeners.get(permission)) === null || _a === void 0 ? void 0 : _a.forEach((listener) => listener(status));
}
export function subscribeStatus(permission, listener) {
    var _a;
    const listeners = (_a = statusListeners.get(permission)) !== null && _a !== void 0 ? _a : new Set();
    listeners.add(listener);
    statusListeners.set(permission, listeners);
    return () => listeners.delete(listener);
}
export function subscribeEvent(listener) {
    eventListeners.add(listener);
    return () => eventListeners.delete(listener);
}
