# API Reference

## Exports

| Export | Type | Description |
| --- | --- | --- |
| `Permit` | Object | Core check/request/settings/config API |
| `usePermit` | Hook | Single-permission hook |
| `usePermits` | Hook | Multi-permission hook |
| `usePermitListener` | Hook | Status listener hook |
| `usePermitSequence` | Hook | Headless multi-step permission sequence |
| `PermitDialog` | Component | Built-in modal, bottom-sheet, screen, and inline UI |
| `PermitStepper` | Component | Dots, bar, or numbers step indicator |
| `PermitAbortController` | Class | Cancels an in-flight request |
| `PermitAbortSignal` | Class | Abort signal used by request options |
| `react-native-permit/testing` | Subpath | Jest/test helper exports |

## Permit

| Method | Signature | Description |
| --- | --- | --- |
| `Permit.check` | `(permission, options?) => Promise<PermitStatus>` | Checks one permission without showing a system prompt |
| `Permit.checkAll` | `(permissions) => Promise<Record<PermissionKey, PermitStatus>>` | Checks multiple permissions |
| `Permit.request` | `(permission, options?) => Promise<PermitResult>` | Requests one permission with retry/exhaustion support |
| `Permit.openSettings` | `(permission?) => Promise<void>` | Opens app settings |
| `Permit.clearExhaustion` | `(permission, retry?) => Promise<void>` | Clears persisted exhaustion for a permission |
| `Permit.configure` | `({ storage?, onEvent? }) => () => void` | Configures storage and event listener |
| `Permit.subscribe` | `(permission, listener) => () => void` | Subscribes to status changes |

## Types

```ts
type PermissionKey =
  | 'camera'
  | 'microphone'
  | 'location'
  | 'location-coarse'
  | 'location-always'
  | 'notifications'
  | 'photo-library'
  | 'photo-library-add'
  | 'contacts'
  | 'calendar'
  | 'reminders'
  | 'bluetooth'
  | 'motion'
  | 'face-id'
  | 'tracking'
  | 'speech-recognition'
  | 'body-sensors'
  | 'activity-recognition'
  | 'nearby-wifi-devices'
  | 'media-location';
```

```ts
type PermitStatus =
  | 'granted'
  | 'limited'
  | 'provisional'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'unknown';
```

```ts
type PermitResult =
  | PermitStatus
  | 'skipped'
  | 'exhausted'
  | 'cancelled';
```

## Permit.request Options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `retry` | `RetryConfig` | `undefined` | Retry and exhaustion behavior |
| `notifications` | `NotificationOptions` | `undefined` | Notification-specific request options |
| `signal` | `PermitAbortSignal` | `undefined` | Cancels an in-flight request |
| `onGranted` | `() => void` | `undefined` | Called when result is `granted` |
| `onDenied` | `() => void` | `undefined` | Called when result is `denied` |
| `onBlocked` | `() => void` | `undefined` | Called when result is `blocked` |
| `onSkipped` | `() => void` | `undefined` | Reserved for custom UI flows |
| `onExhausted` | `() => void` | `undefined` | Called when retry attempts are exhausted |

## RetryConfig

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxAttempts` | `number` | `1` | Total request attempts |
| `persistExhaustion` | `boolean` | `false` | Stores exhausted state across sessions |
| `resetExhaustionAfterDays` | `number` | `undefined` | Automatically clears stored exhaustion after N days |
| `persistenceKey` | `string` | `@permit/exhausted/` | Storage key prefix |
| `cooldownMs` | `number` | `0` | Delay between attempts |
| `onAttempt` | `(attempt, maxAttempts) => void` | `undefined` | Called before each attempt |
| `onRetriesExhausted` | `(permission) => void` | `undefined` | Called once when attempts are exhausted |

## NotificationOptions

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `alert` | `boolean` | `true` | Request alert notifications |
| `badge` | `boolean` | `true` | Request badge notifications |
| `sound` | `boolean` | `true` | Request sound notifications |
| `provisional` | `boolean` | `false` | Request provisional iOS authorization |
| `criticalAlert` | `boolean` | `false` | iOS critical alerts, requires entitlement |
| `announcement` | `boolean` | `false` | iOS announcement notifications |
| `carPlay` | `boolean` | `false` | iOS CarPlay notifications |

## usePermit

```tsx
const camera = usePermit('camera');
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `recheckOnForeground` | `boolean` | `true` | Re-check when app returns to active state |
| `recheckOnMount` | `boolean` | `true` | Check when the hook mounts |

| Field | Type | Description |
| --- | --- | --- |
| `status` | `PermitStatus` | Current known status |
| `result` | `PermitResult \| null` | Last request result |
| `isGranted` | `boolean` | `status === 'granted'` |
| `isLimited` | `boolean` | `status === 'limited'` |
| `isProvisional` | `boolean` | `status === 'provisional'` |
| `isBlocked` | `boolean` | `status === 'blocked'` |
| `isExhausted` | `boolean` | Last result was `exhausted` |
| `isUnavailable` | `boolean` | `status === 'unavailable'` |
| `request` | `(options?) => Promise<PermitResult>` | Requests the permission |
| `check` | `() => Promise<PermitStatus>` | Re-checks the permission |
| `openSettings` | `() => Promise<void>` | Opens settings |
| `clearExhaustion` | `() => Promise<void>` | Clears persisted exhaustion |

## usePermitSequence

| Field | Type | Description |
| --- | --- | --- |
| `stepIndex` | `number` | Current zero-based step index |
| `totalSteps` | `number` | Number of configured steps |
| `visibleStepIndex` | `number` | Index among visible/non-skipped steps |
| `visibleTotalSteps` | `number` | Number of visible/non-skipped steps |
| `currentStep` | `PermitStep \| null` | Current step config |
| `currentPermission` | `PermissionKey \| null` | Current permission |
| `attempt` | `number` | Current attempt number |
| `maxAttempts` | `number` | Max attempts for current step |
| `state` | `PermitSequenceState` | Current sequence state |
| `results` | `Partial<Record<PermissionKey, PermitResult>>` | Results collected so far |
| `start` | `() => void` | Starts the sequence |
| `proceed` | `() => Promise<void>` | Requests current permission |
| `retry` | `() => Promise<void>` | Retries current permission |
| `skip` | `() => void` | Skips current optional step |
| `advance` | `() => void` | Moves to the next step |
| `openSettings` | `() => Promise<void>` | Opens settings for current permission |
| `cancel` | `() => void` | Cancels the sequence |

## PermitDialog

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `true` | Controls modal visibility |
| `presentation` | `bottom-sheet \| modal \| screen \| inline` | `bottom-sheet` | Display mode |
| `title` | `string` | Required | Title text |
| `message` | `string` | `undefined` | Body text |
| `icon` | `ReactNode` | `undefined` | Optional icon/content above the title |
| `primaryLabel` | `string` | `Continue` | Primary button text |
| `secondaryLabel` | `string` | `Not now` | Secondary button text |
| `accentColor` | `string` | `#2563eb` | Primary button color |
| `onPrimary` | `() => void` | Required | Primary action |
| `onSecondary` | `() => void` | `undefined` | Secondary action |
| `onDismiss` | `() => void` | `undefined` | Backdrop/system dismiss action |
| `style` | `ViewStyle` | `undefined` | Panel style override |
| `titleStyle` | `TextStyle` | `undefined` | Title style override |
| `messageStyle` | `TextStyle` | `undefined` | Message style override |

## PermitStepper

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `current` | `number` | Required | Zero-based current step |
| `total` | `number` | Required | Total number of steps |
| `variant` | `dots \| bar \| numbers` | `dots` | Stepper style |
| `activeColor` | `string` | `#2563eb` | Active color |
| `inactiveColor` | `string` | `#d1d5db` | Inactive color |
| `style` | `ViewStyle` | `undefined` | Container style |
| `textStyle` | `TextStyle` | `undefined` | Numbers variant text style |
