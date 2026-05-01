import { PermitMock } from 'react-native-permit/testing';

afterEach(() => {
  PermitMock.reset();
});

// Example usage in a test:
PermitMock.mockGranted('camera');
PermitMock.mockDenied('microphone');
PermitMock.mockBlocked('notifications');

// The mock also records calls for assertions:
// expect(PermitMock.getCallCount('camera', 'request')).toBe(1);
