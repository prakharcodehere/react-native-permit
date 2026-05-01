import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
import type { NotificationOptions, PermissionKey, PermitStatus } from './types';

type NativePermission = string;

function pick(path: Array<string | undefined>): NativePermission[] {
  return path.filter(Boolean) as NativePermission[];
}

export function normalizeStatus(value: string): PermitStatus {
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

export function notificationOptions(options?: NotificationOptions) {
  return {
    alert: options?.alert ?? true,
    badge: options?.badge ?? true,
    sound: options?.sound ?? true,
    provisional: options?.provisional ?? false,
    criticalAlert: options?.criticalAlert ?? false,
    announcement: options?.announcement ?? false,
    carPlay: options?.carPlay ?? false,
  };
}

export function resolvePermission(permission: PermissionKey): NativePermission[] {
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
      return pick([android.READ_MEDIA_IMAGES ?? android.READ_EXTERNAL_STORAGE]);
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
      return pick([android.NEARBY_WIFI_DEVICES ?? android.ACCESS_FINE_LOCATION]);
    case 'media-location':
      return pick([android.ACCESS_MEDIA_LOCATION]);
    default:
      return [];
  }
}

export function mergeStatuses(statuses: PermitStatus[]): PermitStatus {
  if (statuses.length === 0) return 'unavailable';
  if (statuses.includes('blocked')) return 'blocked';
  if (statuses.includes('denied')) return 'denied';
  if (statuses.includes('unavailable')) return 'unavailable';
  if (statuses.includes('limited')) return 'limited';
  if (statuses.every((status) => status === 'granted')) return 'granted';
  return statuses[0] ?? 'unknown';
}
