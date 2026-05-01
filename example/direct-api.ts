import { Permit, PermitAbortController } from 'react-native-permit';

export async function checkCamera() {
  return Permit.check('camera');
}

export async function checkRecordingPermissions() {
  return Permit.checkAll(['camera', 'microphone']);
}

export async function requestCameraWithRetry() {
  return Permit.request('camera', {
    retry: {
      maxAttempts: 2,
      cooldownMs: 300,
      onAttempt: (attempt, maxAttempts) => {
        console.log(`camera attempt ${attempt}/${maxAttempts}`);
      },
      onRetriesExhausted: (permission) => {
        console.log(`${permission} exhausted`);
      },
    },
  });
}

export async function requestLocationAlways() {
  return Permit.request('location-always', {
    retry: { maxAttempts: 1 },
  });
}

export async function requestAndAbort() {
  const controller = new PermitAbortController();
  const promise = Permit.request('camera', { signal: controller.signal });

  controller.abort();

  return promise;
}

export function openAppSettings() {
  return Permit.openSettings();
}
