import { Permit, type PermitStorage } from 'react-native-permit';

// Replace this object with AsyncStorage, MMKV, SecureStore, or your own adapter.
const appStorage: PermitStorage = {
  async getItem(key) {
    return globalThis.localStorage?.getItem(key) ?? null;
  },
  async setItem(key, value) {
    globalThis.localStorage?.setItem(key, value);
  },
  async removeItem(key) {
    globalThis.localStorage?.removeItem(key);
  },
};

export function configurePermit() {
  return Permit.configure({
    storage: appStorage,
    onEvent: (event) => {
      console.log('permit event', event);
    },
  });
}
