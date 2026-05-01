import { Permit } from 'react-native-permit';

export async function requestStandardNotifications() {
  return Permit.request('notifications', {
    notifications: {
      alert: true,
      badge: true,
      sound: true,
    },
  });
}

export async function requestQuietNotificationsOnIos() {
  return Permit.request('notifications', {
    notifications: {
      provisional: true,
      alert: true,
      badge: true,
      sound: true,
    },
  });
}

export async function checkNotificationsBeforeShowingUi() {
  const status = await Permit.check('notifications');

  if (status === 'granted' || status === 'provisional') {
    return 'ready';
  }

  if (status === 'blocked') {
    return 'show-settings-button';
  }

  return 'show-enable-button';
}
