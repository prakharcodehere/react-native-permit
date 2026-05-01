import { Permit } from 'react-native-permit';

export function configurePermissionAnalytics() {
  return Permit.configure({
    onEvent: (event) => {
      switch (event.type) {
        case 'system_prompt_shown':
          console.log('permission prompt shown', event.permission, event.attempt);
          break;
        case 'granted':
        case 'limited':
        case 'provisional':
          console.log('permission success', event.type, event.permission);
          break;
        case 'denied':
        case 'blocked':
        case 'exhausted':
        case 'unavailable':
          console.log('permission not available', event.type, event.permission);
          break;
        case 'settings_opened':
          console.log('settings opened', event.permission);
          break;
      }
    },
  });
}
