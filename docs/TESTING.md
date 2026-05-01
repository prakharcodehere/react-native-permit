# Testing

`react-native-permit/testing` exports `PermitMock` for Jest tests.

```tsx
import { PermitMock } from 'react-native-permit/testing';

beforeEach(() => PermitMock.reset());
```

## Mock Results

```tsx
PermitMock.mockGranted('camera');
PermitMock.mockDenied('location');
PermitMock.mockBlocked('notifications');
PermitMock.mockLimited('photo-library');
PermitMock.mockUnavailable('tracking');
PermitMock.mockExhausted('camera');
PermitMock.mockAll('unavailable');
```

## Assertions

```tsx
await expect(PermitMock.request('camera')).resolves.toBe('granted');
expect(PermitMock.getCallCount('camera', 'request')).toBe(1);
expect(PermitMock.getCalls('camera')).toEqual([
  { type: 'request', permission: 'camera', attempt: 1 },
]);
```

## Recommended Test States

| State | Why test it |
| --- | --- |
| `granted` | Happy path |
| `denied` | Retry/degraded UI |
| `blocked` | Settings fallback |
| `exhausted` | No-more-prompts state |
| `unavailable` | Unsupported platform/device |
