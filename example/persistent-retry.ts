import { Permit } from 'react-native-permit';

export async function requestLocationWithPersistentExhaustion() {
  return Permit.request('location', {
    retry: {
      maxAttempts: 3,
      persistExhaustion: true,
      resetExhaustionAfterDays: 30,
      cooldownMs: 500,
      onAttempt: (attempt, maxAttempts) => {
        console.log(`location attempt ${attempt}/${maxAttempts}`);
      },
      onRetriesExhausted: (permission) => {
        console.log(`${permission} will not be requested again for 30 days`);
      },
    },
    onGranted: () => console.log('location granted'),
    onDenied: () => console.log('location denied'),
    onBlocked: () => console.log('location blocked'),
    onExhausted: () => console.log('location exhausted'),
  });
}

export function resetLocationExhaustion() {
  return Permit.clearExhaustion('location');
}

export function resetCameraExhaustionWithCustomKey() {
  return Permit.clearExhaustion('camera', {
    persistenceKey: '@my-app/permissions/',
  });
}
