# react-native-permit examples

Practical examples for building permission flows with `react-native-permit`.

This folder is local documentation and sample code. It is not published to npm:
the package ships only `dist`, `README.md`, `LICENSE`, and `package.json`.

> Permission examples should show the awkward states too. Granted is the easy part.

## Install

```bash
npm install react-native-permit react-native-permissions
```

`react-native-permit` is JavaScript only. Native permission support comes from
`react-native-permissions`, so configure iOS and Android permissions there.

## How to read this folder

Start with the file that matches what you are building:

| I want to build... | Start here |
| --- | --- |
| A quick button that asks for camera/location/mic | `direct-api.ts` |
| A React component that reacts to permission state | `hooks.tsx` |
| A wrapper that only renders children after access is granted | `permission-gate.tsx` |
| A first-run onboarding flow for several permissions | `custom-sequence.tsx` |
| A built-in permission modal or bottom sheet | `built-in-ui.tsx` |
| Notification permission flows | `notifications.ts` |
| Retry limits that persist across app launches | `persistent-retry.ts` |
| Analytics for permission events | `analytics.ts` |
| AsyncStorage/MMKV/SecureStore persistence | `custom-storage.ts` |
| Jest tests without native OS prompts | `permit.test.ts` |
| Native plist/manifest examples | `platform-config.md` |

## Files

| File | What it demonstrates | Copy into app? |
| --- | --- | --- |
| `App.tsx` | A small screen that renders several examples together | Optional |
| `direct-api.ts` | Headless checks, requests, retries, settings, and aborts | Yes |
| `hooks.tsx` | `usePermit`, `usePermits`, loading states, and foreground re-checking | Yes |
| `permission-gate.tsx` | A practical gate component built from `usePermit` | Yes |
| `custom-sequence.tsx` | Fully custom permission onboarding with `usePermitSequence` and `PermitStepper` | Yes |
| `built-in-ui.tsx` | Built-in modal, bottom-sheet, screen, and inline UI options | Yes |
| `notifications.ts` | Standard and provisional notification requests | Yes |
| `persistent-retry.ts` | Persisted exhaustion and reset behavior | Yes |
| `custom-storage.ts` | AsyncStorage/MMKV/SecureStore-style storage adapter | Adapt |
| `listener.tsx` | Permission status subscriptions | Yes |
| `analytics.ts` | Event tracking via `Permit.configure` | Adapt |
| `platform-config.md` | Example iOS plist and Android manifest entries | Reference |
| `jest.setup.ts` | Test helper setup | Yes |
| `permit.test.ts` | Example tests using `PermitMock` | Yes |

## Recommended learning path

1. Read `direct-api.ts` to understand the base API.
2. Read `hooks.tsx` to see the React component pattern.
3. Read `permission-gate.tsx` if a feature should be hidden until permission is granted.
4. Read `built-in-ui.tsx` if you want modal, bottom sheet, screen, or inline UI.
5. Read `custom-sequence.tsx` for onboarding flows with multiple permissions.
6. Read `persistent-retry.ts` before using `persistExhaustion`.
7. Read `permit.test.ts` before writing feature tests.

## Common product flows

### QR scanner

Use:

- `permission-gate.tsx`
- `built-in-ui.tsx`
- `direct-api.ts`

Flow:

```text
Screen mounts
  -> check camera
  -> if granted, render scanner
  -> if denied, show permission UI
  -> if blocked, open Settings
```

### Voice note recorder

Use:

- `hooks.tsx`
- `permission-gate.tsx`

Flow:

```text
Check camera + microphone
  -> request missing permissions
  -> render recorder only when both are granted
```

### First-run onboarding

Use:

- `custom-sequence.tsx`
- `PermitStepper`
- `persistent-retry.ts`

Flow:

```text
Start onboarding
  -> show camera rationale
  -> request camera
  -> show notifications rationale
  -> optional skip allowed
  -> complete with results map
```

### Notifications prompt

Use:

- `notifications.ts`
- `built-in-ui.tsx`

Flow:

```text
Show your own value prop first
  -> request notifications
  -> iOS may return provisional
  -> Android below API 33 returns granted
```

### Blocked permission fallback

Use:

- `permission-gate.tsx`
- `Permit.openSettings`

Flow:

```text
Check permission
  -> blocked
  -> do not request again
  -> show Settings button
```

## Result handling

Handle more than `granted` and `denied`.

```ts
const result = await Permit.request('camera');

if (result === 'granted') {
  // Continue with the feature.
}

if (result === 'blocked') {
  // Show a Settings button. The OS prompt will not appear again.
}

if (result === 'exhausted') {
  // Stop asking until your app decides to reset exhaustion.
}

if (result === 'unavailable') {
  // Hide or disable the feature on this device.
}
```

Result reference:

| Result | Typical UI |
| --- | --- |
| `granted` | Continue to feature |
| `limited` | Continue, but offer a way to expand photo access |
| `provisional` | Continue, maybe show notification settings later |
| `denied` | Show retry UI if appropriate |
| `blocked` | Show Settings button |
| `skipped` | Continue without the optional feature |
| `exhausted` | Stop prompting and show fallback |
| `unavailable` | Hide/disable unsupported feature |
| `cancelled` | Ignore result because the flow was abandoned |

## Built-in UI choices

`PermitDialog` supports four presentation modes.

| Presentation | Use when |
| --- | --- |
| `modal` | You need a centered prompt before a feature action |
| `bottom-sheet` | You want a mobile-native rationale sheet |
| `screen` | You are building a full onboarding page |
| `inline` | The permission prompt belongs inside existing content |

See `built-in-ui.tsx` for all four.

## Custom UI choices

Use `usePermitSequence` when the UI is yours:

- custom illustrations
- branded onboarding
- animated transitions
- step-specific copy
- optional permissions
- retry screens
- exhausted screens

Use `PermitStepper` when you want a tiny progress indicator:

- dots
- bar
- numbers

## Storage examples

`persistent-retry.ts` shows retry configuration.

`custom-storage.ts` shows the storage adapter shape:

```ts
type PermitStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};
```

Replace the sample adapter with one of:

- AsyncStorage
- MMKV
- SecureStore
- your app's existing persistence layer

## Testing examples

Use `PermitMock` when testing permission-gated screens.

```ts
PermitMock.mockGranted('camera');
PermitMock.mockBlocked('notifications');
PermitMock.mockAll('unavailable');
```

Test the hard states:

| State | Why test it |
| --- | --- |
| `granted` | Happy path |
| `denied` | Retry UI |
| `blocked` | Settings fallback |
| `exhausted` | No-more-prompts state |
| `unavailable` | Unsupported device/platform |

## Copying examples

The examples import from `react-native-permit` as an installed dependency. When
working inside this repository, those imports are illustrative; in a consuming
app they work after installing the package and its peer dependency.

## Notes

- Add native iOS/Android permission declarations only for permissions your app uses.
- Do not request permissions at app launch unless the permission is immediately relevant.
- Show your own rationale before the OS prompt when the permission is important.
- Treat `blocked` differently from `denied`; blocked usually needs Settings.
- Keep optional permissions optional in your UI.
