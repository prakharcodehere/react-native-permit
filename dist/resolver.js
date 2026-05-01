import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
function pick(path) {
    return path.filter(Boolean);
}
export function normalizeStatus(value) {
    switch (value) {
        case RESULTS.GRANTED:
            return 'granted';
        case RESULTS.LIMITED:
            return 'limited';
        case RESULTS.BLOCKED:
            return 'blocked';
        case RESULTS.UNAVAILABLE:
            return 'unavailable';
        case RESULTS.DENIED:
            return 'denied';
        default:
            return 'unknown';
    }
}
export function notificationOptions(options) {
    var _a, _b, _c, _d, _e, _f, _g;
    return {
        alert: (_a = options === null || options === void 0 ? void 0 : options.alert) !== null && _a !== void 0 ? _a : true,
        badge: (_b = options === null || options === void 0 ? void 0 : options.badge) !== null && _b !== void 0 ? _b : true,
        sound: (_c = options === null || options === void 0 ? void 0 : options.sound) !== null && _c !== void 0 ? _c : true,
        provisional: (_d = options === null || options === void 0 ? void 0 : options.provisional) !== null && _d !== void 0 ? _d : false,
        criticalAlert: (_e = options === null || options === void 0 ? void 0 : options.criticalAlert) !== null && _e !== void 0 ? _e : false,
        announcement: (_f = options === null || options === void 0 ? void 0 : options.announcement) !== null && _f !== void 0 ? _f : false,
        carPlay: (_g = options === null || options === void 0 ? void 0 : options.carPlay) !== null && _g !== void 0 ? _g : false,
    };
}
export function resolvePermission(permission) {
    var _a, _b;
    const ios = PERMISSIONS.IOS;
    const android = PERMISSIONS.ANDROID;
    if (Platform.OS === 'ios') {
        switch (permission) {
            case 'camera':
                return pick([ios.CAMERA]);
            case 'microphone':
                return pick([ios.MICROPHONE]);
            case 'location':
                return pick([ios.LOCATION_WHEN_IN_USE]);
            case 'location-always':
                return pick([ios.LOCATION_WHEN_IN_USE, ios.LOCATION_ALWAYS]);
            case 'photo-library':
                return pick([ios.PHOTO_LIBRARY]);
            case 'photo-library-add':
                return pick([ios.PHOTO_LIBRARY_ADD_ONLY]);
            case 'contacts':
                return pick([ios.CONTACTS]);
            case 'calendar':
                return pick([ios.CALENDARS]);
            case 'reminders':
                return pick([ios.REMINDERS]);
            case 'bluetooth':
                return pick([ios.BLUETOOTH]);
            case 'motion':
                return pick([ios.MOTION]);
            case 'face-id':
                return pick([ios.FACE_ID]);
            case 'tracking':
                return pick([ios.APP_TRACKING_TRANSPARENCY]);
            case 'speech-recognition':
                return pick([ios.SPEECH_RECOGNITION]);
            default:
                return [];
        }
    }
    switch (permission) {
        case 'camera':
            return pick([android.CAMERA]);
        case 'microphone':
            return pick([android.RECORD_AUDIO]);
        case 'location':
            return pick([android.ACCESS_FINE_LOCATION]);
        case 'location-coarse':
            return pick([android.ACCESS_COARSE_LOCATION]);
        case 'location-always':
            return pick([android.ACCESS_FINE_LOCATION, android.ACCESS_BACKGROUND_LOCATION]);
        case 'photo-library':
            return pick([(_a = android.READ_MEDIA_IMAGES) !== null && _a !== void 0 ? _a : android.READ_EXTERNAL_STORAGE]);
        case 'contacts':
            return pick([android.READ_CONTACTS]);
        case 'calendar':
            return pick([android.READ_CALENDAR]);
        case 'bluetooth':
            return pick([android.BLUETOOTH_SCAN, android.BLUETOOTH_CONNECT]);
        case 'body-sensors':
            return pick([android.BODY_SENSORS]);
        case 'activity-recognition':
        case 'motion':
            return pick([android.ACTIVITY_RECOGNITION]);
        case 'nearby-wifi-devices':
            return pick([(_b = android.NEARBY_WIFI_DEVICES) !== null && _b !== void 0 ? _b : android.ACCESS_FINE_LOCATION]);
        case 'media-location':
            return pick([android.ACCESS_MEDIA_LOCATION]);
        default:
            return [];
    }
}
export function mergeStatuses(statuses) {
    var _a;
    if (statuses.length === 0)
        return 'unavailable';
    if (statuses.includes('blocked'))
        return 'blocked';
    if (statuses.includes('denied'))
        return 'denied';
    if (statuses.includes('unavailable'))
        return 'unavailable';
    if (statuses.includes('limited'))
        return 'limited';
    if (statuses.every((status) => status === 'granted'))
        return 'granted';
    return (_a = statuses[0]) !== null && _a !== void 0 ? _a : 'unknown';
}
