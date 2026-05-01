import { PermitMock } from 'react-native-permit/testing';

beforeEach(() => {
  PermitMock.reset();
});

it('mocks a granted camera permission', async () => {
  PermitMock.mockGranted('camera');

  await expect(PermitMock.check('camera')).resolves.toBe('granted');
  await expect(PermitMock.request('camera')).resolves.toBe('granted');
  expect(PermitMock.getCallCount('camera', 'request')).toBe(1);
});

it('mocks a blocked notification permission', async () => {
  PermitMock.mockBlocked('notifications');

  await expect(PermitMock.request('notifications')).resolves.toBe('blocked');
  expect(PermitMock.getCalls('notifications')).toEqual([
    { type: 'request', permission: 'notifications', attempt: 1 },
  ]);
});

it('can mock all permissions as unavailable', async () => {
  PermitMock.mockAll('unavailable');

  await expect(PermitMock.check('camera')).resolves.toBe('unavailable');
  await expect(PermitMock.check('location')).resolves.toBe('unavailable');
});
