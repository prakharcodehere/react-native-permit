# Recipes

## Camera Gate

```tsx
const camera = usePermit('camera');

if (camera.status === 'unknown') return <Text>Checking...</Text>;
if (camera.isGranted) return <CameraScreen />;

return <Button title="Allow camera" onPress={() => camera.request()} />;
```

## Location With Retry

```tsx
await Permit.request('location', {
  retry: {
    maxAttempts: 3,
    persistExhaustion: true,
    resetExhaustionAfterDays: 30,
  },
});
```

## Notifications

```tsx
await Permit.request('notifications', {
  notifications: {
    alert: true,
    badge: true,
    sound: true,
  },
});
```

## Built-In Bottom Sheet

```tsx
<PermitDialog
  presentation="bottom-sheet"
  visible={visible}
  title="Use your location"
  message="Location helps show nearby results."
  primaryLabel="Allow location"
  secondaryLabel="Skip"
  onPrimary={() => Permit.request('location')}
  onSecondary={() => setVisible(false)}
/>;
```

## Custom Sequence

```tsx
const sequence = usePermitSequence(steps, {
  onComplete: (results) => console.log(results),
});
```

See [example/custom-sequence.tsx](../example/custom-sequence.tsx).
