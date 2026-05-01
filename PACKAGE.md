# react-native-permit

> The complete permission layer for React Native. Rationale UI, denial handling, retry logic, persistence, analytics hooks, multi-step sequences, headless mode, and full custom UI — built on `react-native-permissions`. One install, every scenario handled.

---

## Why this exists

Every production React Native app needs the same things on top of `react-native-permissions`:

- A rationale screen before the system prompt (required by Apple HIG, strongly recommended by Google)
- Detection of the "blocked forever" state and a redirect to Settings
- Retry logic — show the rationale again after a first denial
- A custom "you've denied too many times" screen for critical permissions
- A multi-step onboarding sequence that walks through 2–10 permissions
- Re-checking status when the user returns from Settings
- Never showing a system prompt when one is already in-flight (queue management)
- Persistent tracking of exhaustion across sessions
- Two-step handling for `location-always` and background location on Android
- iOS photo library "limited" access state
- iOS notification options (provisional, critical, sound, badge)
- Android API-level differences (notifications on API 33+, Bluetooth split on API 31+, background location on API 29+)
- Testing utilities to mock permission outcomes in Jest
- Analytics events for every state transition

Every app builds this from scratch. Every app gets 3–4 of these wrong. This package gets all of them right, with an escape hatch at every layer.

---

## The complete state machine

```
Permit.request('camera', options)
              │
              ▼
    ┌─────────────────────┐
    │ Already granted?    │──── YES ──→ resolve 'granted' (no UI shown)
    └─────────────────────┘
              │ NO
              ▼
    ┌─────────────────────┐
    │ Already blocked?    │──── YES ──→ DeniedSheet → resolve 'blocked'
    └─────────────────────┘
              │ NO
              ▼
    ┌─────────────────────┐
    │ Exhausted in prior  │──── YES ──→ ExhaustedView → resolve 'exhausted'
    │ session? (if        │           (if persistExhaustion: true)
    │ persistence on)     │
    └─────────────────────┘
              │ NO
              ▼
    ┌─────────────────────┐
    │  Show Rationale     │◄──────────────────────────────────────────┐
    │  (your text, icon,  │                                           │
    │   CTA button)       │                                           │
    └─────────────────────┘                                           │
         │           │                                                │
      "Not now"   "Continue"                                          │
         │           │                                                │
         ▼           ▼                                                │
    resolve      System prompt (OS native dialog)                     │
    'skipped'         │                                               │
                 ┌────┴─────────────────────┐                        │
               GRANTED                   DENIED / BLOCKED            │
                 │                            │                       │
                 ▼                            ▼                       │
     ┌───────────────────────┐    attempt < maxAttempts?              │
     │ iOS photo limited?    │         │           │                  │
     │ → resolve 'limited'   │        YES          NO                 │
     │ iOS notif provisional?│         │           │                  │
     │ → resolve 'provisional│         └───────────┘                 │
     │ Otherwise:            │               │                        │
     │ → resolve 'granted'   │         ┌─────▼──────┐               │
     └───────────────────────┘         │ Show Denied │               │
                                       │ interstitial│               │
                                       │ (attempt X  │               │
                                       │ of Y)       │               │
                                       └─────┬───────┘               │
                                         "Try again" ────────────────┘
                                             │
                                          "Skip" (optional only)
                                             │
                                         resolve 'denied'
                                             │
                              maxAttempts reached? → ExhaustedView
                                             │
                                  ┌──────────┴───────────┐
                              'settings'             'silent'/'custom'
                                  │                       │
                               DeniedSheet          resolve 'exhausted'
                               → resolve 'exhausted'
```

---

## Installation

```bash
npm install react-native-permit react-native-permissions
# or
yarn add react-native-permit react-native-permissions
```

`react-native-permissions` is a peer dependency. `react-native-permit` is a pure TypeScript UI + logic layer on top — no native modules, no linking, works with Expo managed and bare workflows.

### iOS: Info.plist keys

Only add keys for permissions you actually use. `react-native-permit` does not validate these at runtime — missing keys cause silent failures on iOS.

```xml
<key>NSCameraUsageDescription</key>
<string>$(PRODUCT_NAME) uses the camera to scan QR codes.</string>

<key>NSMicrophoneUsageDescription</key>
<string>$(PRODUCT_NAME) uses the microphone for voice messages.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>$(PRODUCT_NAME) uses your location to show nearby results.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>$(PRODUCT_NAME) uses your location in the background to track deliveries.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>$(PRODUCT_NAME) reads your photo library to let you upload images.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>$(PRODUCT_NAME) saves photos to your library.</string>

<key>NSContactsUsageDescription</key>
<string>$(PRODUCT_NAME) uses your contacts to help you find friends.</string>

<key>NSUserNotificationsUsageDescription</key>
<string>$(PRODUCT_NAME) sends you reminders and order updates.</string>

<key>NSBluetoothAlwaysUsageDescription</key>
<string>$(PRODUCT_NAME) uses Bluetooth to connect to nearby devices.</string>

<key>NSMotionUsageDescription</key>
<string>$(PRODUCT_NAME) uses motion data for fitness tracking.</string>

<key>NSFaceIDUsageDescription</key>
<string>$(PRODUCT_NAME) uses Face ID for secure login.</string>

<key>NSUserTrackingUsageDescription</key>
<string>$(PRODUCT_NAME) uses tracking to show you relevant ads.</string>
```

### Android: AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" /> <!-- API 29+ -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />           <!-- API 33+ -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />                                                  <!-- API ≤32 -->
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />           <!-- API 33+ -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
    android:usesPermissionFlags="neverForLocation" />                              <!-- API 31+ -->
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />           <!-- API 31+ -->
<uses-permission android:name="android.permission.BLUETOOTH"
    android:maxSdkVersion="30" />                                                  <!-- API ≤30 -->
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="android.permission.BODY_SENSORS" />
```

---

## Quick start

### Simplest case

```tsx
import { Permit } from 'react-native-permit';

const result = await Permit.request('camera', {
  rationale: {
    title: 'Camera access',
    message: 'To scan QR codes, we need access to your camera.',
    icon: '📷',
  },
});
// result: 'granted' | 'denied' | 'blocked' | 'skipped' | 'limited' | 'unavailable'
```

### With retry + persistent exhaustion

```tsx
const result = await Permit.request('camera', {
  rationale: {
    title: 'Camera access',
    message: 'Camera is required to scan items.',
    icon: '📷',
  },
  retry: {
    maxAttempts: 3,           // 3 total tries
    persistExhaustion: true,  // remember across sessions — won't ask a 4th time ever
    onExhausted: 'settings',  // show DeniedSheet when exhausted
    onRetriesExhausted: (permission) => {
      analytics.track('permission_exhausted', { permission });
    },
  },
});
```

### Two-permission onboarding

Pass only the permissions your app uses. The library does not have a fixed list — you define the flow.

```tsx
import { PermitSequence } from 'react-native-permit';

<PermitSequence
  permissions={[
    {
      permission: 'camera',
      rationale: {
        title: 'Scan items',
        message: 'We need your camera to scan barcodes.',
        icon: '📷',
        continueLabel: 'Allow Camera',
        accentColor: '#6366f1',
      },
      retry: { maxAttempts: 2, onExhausted: 'settings' },
    },
    {
      permission: 'notifications',
      optional: true,
      rationale: {
        title: 'Stay updated',
        message: "We'll notify you when your order ships.",
        icon: '🔔',
        continueLabel: 'Turn on Notifications',
        skipLabel: 'Maybe later',
      },
    },
  ]}
  onComplete={(results) => navigation.navigate('Home')}
/>
```

---

## Wrap your app once

```tsx
import { PermitProvider } from 'react-native-permit';

export default function App() {
  return (
    <PermitProvider
      theme={{
        accentColor: '#6366f1',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        secondaryTextColor: '#6b7280',
        buttonRadius: 12,
        font: {
          title: { fontSize: 20, fontWeight: '700' },
          message: { fontSize: 15, fontWeight: '400' },
          button: { fontSize: 16, fontWeight: '600' },
        },
        dark: {
          backgroundColor: '#1c1c1e',
          textColor: '#f2f2f7',
          secondaryTextColor: '#ebebf5',
        },
      }}
      onEvent={(event) => analytics.track(event.type, event)}
      onError={(error, ctx) => Sentry.captureException(error, { extra: ctx })}
    >
      <NavigationContainer>{/* ... */}</NavigationContainer>
    </PermitProvider>
  );
}
```

---

## API Reference

---

### `Permit.request(permission, options)`

The main entry point. Handles the full flow: rationale → system prompt → denial handling → retry → exhaustion.

```typescript
Permit.request(
  permission: PermissionKey,
  options: PermitRequestOptions
): Promise<PermitResult>
```

```typescript
interface PermitRequestOptions {
  rationale: RationaleConfig;

  // Retry behavior when user denies
  retry?: RetryConfig;

  // Override default denied sheet text
  deniedSheet?: DeniedSheetConfig;

  // iOS notifications: sound, badge, provisional, etc.
  notifications?: NotificationOptions;

  // iOS photo library: access level + limited access callback
  photoLibrary?: PhotoLibraryOptions;

  // location-always: separate rationale per step
  twoStepRationale?: TwoStepRationaleConfig;

  // Skip rationale modal if already granted (default: true)
  skipRationaleIfGranted?: boolean;

  // Cancellation signal — resolves 'cancelled' when aborted
  signal?: PermitAbortSignal;

  // Callbacks
  onGranted?: () => void;
  onDenied?: () => void;
  onBlocked?: () => void;
  onSkipped?: () => void;
  onExhausted?: () => void;
}
```

**Return values:**

```typescript
type PermitResult =
  | 'granted'      // full access granted
  | 'limited'      // iOS 14+ photo library: user selected specific photos only
  | 'provisional'  // iOS 12+ notifications: quiet delivery, no system prompt shown
  | 'denied'       // denied this attempt, retries remain (or none configured)
  | 'blocked'      // permanently denied — system prompt won't show again
  | 'skipped'      // user tapped "Not now" on rationale
  | 'exhausted'    // all retry attempts used and user still denied
  | 'unavailable'  // feature not available on this device or OS version
  | 'cancelled';   // aborted via PermitAbortController
```

| Result | What to do |
|---|---|
| `'granted'` | Proceed — user has access |
| `'limited'` | Proceed with limited scope — offer UI to expand access |
| `'provisional'` | Proceed — user receives notifications silently until they decide |
| `'denied'` | Retry later, or degrade gracefully |
| `'blocked'` | Show instructions to open Settings |
| `'skipped'` | Degrade gracefully — user is aware but chose not to grant |
| `'exhausted'` | Hard block or degrade — user has been asked the maximum number of times |
| `'unavailable'` | Feature doesn't exist on this device — hide the feature |
| `'cancelled'` | Request was aborted mid-flow |

---

### `RetryConfig`

```typescript
interface RetryConfig {
  // Total times to attempt (first try counts). Default: 1 (no retry)
  maxAttempts?: number;

  // What to show when all attempts are used:
  // 'settings' — DeniedSheet with Open Settings button (default)
  // 'custom'   — render exhaustedComponent in a full-screen modal
  // 'silent'   — resolve 'exhausted' immediately, no UI
  onExhausted?: 'settings' | 'custom' | 'silent';

  // Render function for 'custom' exhausted state
  exhaustedComponent?: (ctx: ExhaustedContext) => React.ReactElement;

  // Remember exhaustion across app sessions using AsyncStorage.
  // If true, Permit.request() resolves 'exhausted' immediately on future launches
  // without showing any UI.
  persistExhaustion?: boolean;

  // How many days before a persisted exhaustion resets. Default: never
  resetExhaustionAfterDays?: number;

  // Custom storage key prefix. Default: '@permit/exhausted/'
  persistenceKey?: string;

  // Milliseconds to wait between attempts within the same session.
  // Useful to avoid looking like a spam loop. Default: 0
  cooldownMs?: number;

  // Called on every denial before retry UI is shown
  onAttempt?: (attempt: number, maxAttempts: number) => void;

  // Called once when all attempts are exhausted
  onRetriesExhausted?: (permission: PermissionKey) => void;
}

interface ExhaustedContext {
  permission: PermissionKey;
  totalAttempts: number;
  openSettings: () => Promise<void>;
  dismiss: () => void;
}
```

**Example — 3 retries, custom blocked screen, remembered forever:**

```tsx
await Permit.request('location', {
  rationale: {
    title: 'Location needed',
    message: 'We use your location to find nearby stores.',
    icon: '📍',
  },
  retry: {
    maxAttempts: 3,
    persistExhaustion: true,
    onExhausted: 'custom',
    exhaustedComponent: ({ permission, openSettings, dismiss }) => (
      <View style={styles.hardBlocker}>
        <Image source={require('./assets/blocked-location.png')} style={styles.icon} />
        <Text style={styles.title}>Location is required</Text>
        <Text style={styles.body}>
          This app cannot function without location access. Please enable it in Settings.
        </Text>
        <Pressable style={styles.primaryBtn} onPress={openSettings}>
          <Text>Open Settings</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => BackHandler.exitApp()}>
          <Text>Exit app</Text>
        </Pressable>
      </View>
    ),
    onRetriesExhausted: (perm) => analytics.track('permission_exhausted', { perm }),
  },
});
```

**Example — silent exhaustion with manual handling:**

```tsx
const result = await Permit.request('notifications', {
  rationale: { title: 'Notifications', message: '...', icon: '🔔' },
  retry: {
    maxAttempts: 2,
    onExhausted: 'silent',
    persistExhaustion: true,
    resetExhaustionAfterDays: 30, // ask again after a month
  },
});

if (result === 'exhausted') {
  // User has been asked twice. Don't show any more prompts.
  // The library will auto-skip on future launches for 30 days.
}
```

---

### `usePermit(permission, options?)`

React hook for a single permission. Automatically re-checks status when the app comes to the foreground (e.g., after the user changes a setting and returns).

```typescript
const permit = usePermit(permission: PermissionKey, options?: UsePermitOptions);

interface UsePermitOptions {
  recheckOnForeground?: boolean; // re-check when app becomes active. Default: true
  recheckOnMount?: boolean;      // check status on first mount. Default: true
}

// Return value
interface UsePermitReturn {
  status: PermitStatus;   // current known status
  result: PermitResult | null; // result of the last request() call, null if not yet called

  // Status shorthands
  isGranted: boolean;
  isLimited: boolean;       // iOS 14+ photo library partial
  isProvisional: boolean;   // iOS notifications provisional
  isBlocked: boolean;       // permanently denied
  isExhausted: boolean;     // retries used up this session
  isUnavailable: boolean;

  // Actions
  request: (options: PermitRequestOptions) => Promise<PermitResult>;
  check: () => Promise<PermitStatus>;           // check without showing UI
  openSettings: () => Promise<void>;
  clearExhaustion: () => Promise<void>;         // reset persistent exhaustion
}
```

```typescript
type PermitStatus =
  | 'granted'
  | 'limited'
  | 'provisional'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'unknown';   // haven't checked yet this session
```

**Example — camera gate component:**

```tsx
function CameraGate({ children }: { children: React.ReactNode }) {
  const camera = usePermit('camera');

  if (camera.status === 'unknown') return <LoadingSpinner />;

  if (camera.isGranted) return <>{children}</>;

  if (camera.isBlocked || camera.isExhausted) {
    return (
      <View style={styles.blocker}>
        <Text style={styles.title}>Camera access is disabled</Text>
        <Text style={styles.body}>Open Settings to re-enable it.</Text>
        <Button title="Open Settings" onPress={camera.openSettings} />
      </View>
    );
  }

  if (camera.isUnavailable) {
    return <Text>Camera is not available on this device.</Text>;
  }

  return (
    <Button
      title="Grant Camera Access"
      onPress={() =>
        camera.request({
          rationale: {
            title: 'Camera needed',
            message: 'Enable camera access to continue scanning.',
            icon: '📷',
          },
          retry: { maxAttempts: 2, onExhausted: 'settings' },
        })
      }
    />
  );
}
```

---

### `usePermits(permissions, options?)`

Check the status of multiple permissions at once. Useful for pre-checking before mounting a feature screen.

```typescript
const permits = usePermits(permissions: PermissionKey[], options?: UsePermitOptions);

interface UsePermitsReturn {
  statuses: Record<PermissionKey, PermitStatus>;
  allGranted: boolean;       // every permission in the list is 'granted'
  someGranted: boolean;
  check: () => Promise<void>;
}
```

**Example:**

```tsx
function RecordingGate() {
  const { statuses, allGranted } = usePermits(['camera', 'microphone']);

  if (!allGranted) {
    return (
      <PermitSequence
        permissions={[
          {
            permission: 'camera',
            skipIfGranted: true,
            rationale: { title: 'Camera', message: '...', icon: '📷' },
          },
          {
            permission: 'microphone',
            skipIfGranted: true,
            rationale: { title: 'Microphone', message: '...', icon: '🎙️' },
          },
        ]}
        onComplete={() => {}} // statuses will update automatically via AppState
      />
    );
  }

  return <RecordingScreen />;
}
```

---

### `usePermitSequence(steps, options?)`

**Headless hook.** The full sequence state machine with no UI. Use this when you want a completely custom onboarding experience — your own animations, your own layout, your own brand — but don't want to build the state machine yourself.

`<PermitSequence />` is built on top of this hook.

```typescript
const seq = usePermitSequence(steps: PermitStep[], options?: SequenceOptions);

interface SequenceOptions {
  onComplete?: (results: PermitSequenceResults) => void;
  onRequiredDenied?: (permission: PermissionKey, results: PermitSequenceResults) => void;
  onAbandon?: (at: PermissionKey, results: PermitSequenceResults) => void;
}

interface UsePermitSequenceReturn {
  // Current position
  stepIndex: number;       // 0-based
  totalSteps: number;      // total steps in the sequence (including skipped-if-granted)
  visibleStepIndex: number; // index among steps that are actually shown (skipped steps excluded)
  visibleTotalSteps: number;

  // Current step data
  currentStep: PermitStep | null;          // null when complete
  currentPermission: PermissionKey | null;

  // Retry state for current step
  attempt: number;    // 1-based — which attempt we're on
  maxAttempts: number;

  // Flow state
  state:
    | 'idle'          // not started
    | 'checking'      // checking if already granted
    | 'rationale'     // showing (or ready to show) the rationale
    | 'requesting'    // system prompt is in flight
    | 'denied'        // user denied, retries remain
    | 'exhausted'     // all retries used for current step
    | 'complete';     // all steps done

  // Results accumulated so far
  results: Partial<PermitSequenceResults>;

  // Actions
  start: () => void;                  // begin the sequence (if idle)
  proceed: () => void;                // from rationale → trigger system prompt
  skip: () => void;                   // skip current optional step
  retry: () => void;                  // retry after denial (from 'denied' state)
  advance: () => void;                // manually advance to next step (after exhausted optional)
  openSettings: () => Promise<void>;
  cancel: () => void;                 // abort the sequence
}
```

**Example — fully custom onboarding with Lottie and custom animations:**

```tsx
function CustomOnboarding({ onDone }: { onDone: () => void }) {
  const seq = usePermitSequence(
    [
      {
        permission: 'camera',
        rationale: { title: 'Scan products', message: 'Point at any barcode to scan.' },
        retry: { maxAttempts: 2, persistExhaustion: true },
      },
      {
        permission: 'location',
        optional: false,
        rationale: { title: 'Find nearby stores', message: 'We show stores closest to you.' },
        retry: { maxAttempts: 3, onExhausted: 'silent' },
      },
      {
        permission: 'notifications',
        optional: true,
        rationale: { title: "Don't miss updates", message: "Order status delivered to you." },
      },
    ],
    { onComplete: onDone }
  );

  if (seq.state === 'complete') return null;

  if (seq.state === 'exhausted') {
    const isOptional = seq.currentStep?.optional;
    return (
      <SafeAreaView style={styles.screen}>
        <LottieView source={require('./blocked.json')} autoPlay loop={false} />
        <Text style={styles.h1}>{seq.currentStep?.rationale.title} is required</Text>
        <Text style={styles.body}>
          You've declined {seq.attempt - 1} times.
          {isOptional ? ' You can skip this one.' : ' Please enable it in Settings.'}
        </Text>
        {!isOptional && (
          <Pressable style={styles.primaryBtn} onPress={seq.openSettings}>
            <Text>Open Settings</Text>
          </Pressable>
        )}
        {isOptional && (
          <Pressable style={styles.secondaryBtn} onPress={seq.advance}>
            <Text>Skip</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  if (seq.state === 'denied') {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.h1}>We really need this</Text>
        <Text style={styles.body}>
          Attempt {seq.attempt} of {seq.maxAttempts}. Try again?
        </Text>
        <Pressable style={styles.primaryBtn} onPress={seq.retry}>
          <Text>Try again</Text>
        </Pressable>
        {seq.currentStep?.optional && (
          <Pressable style={styles.ghostBtn} onPress={seq.skip}>
            <Text>Skip for now</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  // states: 'idle', 'checking', 'rationale', 'requesting'
  return (
    <SafeAreaView style={styles.screen}>
      <StepDots current={seq.visibleStepIndex} total={seq.visibleTotalSteps} />
      <Animated.View entering={FadeInUp}>
        <Text style={styles.h1}>{seq.currentStep?.rationale.title}</Text>
        <Text style={styles.body}>{seq.currentStep?.rationale.message}</Text>
      </Animated.View>
      <Pressable
        style={[styles.primaryBtn, seq.state === 'requesting' && styles.disabled]}
        onPress={seq.state === 'idle' ? seq.start : seq.proceed}
        disabled={seq.state === 'requesting' || seq.state === 'checking'}
      >
        <Text>{seq.state === 'requesting' ? 'Waiting...' : 'Continue'}</Text>
      </Pressable>
      {seq.currentStep?.optional && seq.state !== 'requesting' && (
        <Pressable style={styles.ghostBtn} onPress={seq.skip}>
          <Text>Skip</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}
```

---

### `<PermitSequence />`

Component built on `usePermitSequence`. Handles rendering with built-in default UI and render prop overrides at every state.

```typescript
interface PermitSequenceProps {
  permissions: PermitStep[];

  // Callbacks
  onComplete: (results: PermitSequenceResults) => void;
  onRequiredDenied?: (permission: PermissionKey, results: PermitSequenceResults) => void;

  // Layout
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;

  // Built-in step progress indicator
  stepIndicator?: 'dots' | 'bar' | 'numbers' | 'none'; // default: 'dots'
  stepIndicatorStyle?: ViewStyle;

  // Transition animation between steps
  stepAnimation?: 'fade' | 'slide' | 'none'; // default: 'fade'

  // Render prop overrides — override one, some, or all layers
  // If provided, replaces the default UI for that state entirely
  renderStep?: (props: RenderStepProps) => React.ReactElement;
  renderDenied?: (props: RenderDeniedProps) => React.ReactElement;
  renderExhausted?: (props: RenderExhaustedProps) => React.ReactElement;
}

interface PermitStep {
  permission: PermissionKey;
  rationale: RationaleConfig;
  optional?: boolean;       // default: false
  skipIfGranted?: boolean;  // silently advance if already granted. Default: true
  retry?: RetryConfig;

  // permission-specific options (passed through to Permit.request)
  notifications?: NotificationOptions;
  photoLibrary?: PhotoLibraryOptions;
  twoStepRationale?: TwoStepRationaleConfig;
}

// Render prop shapes
interface RenderStepProps {
  step: PermitStep;
  stepIndex: number;
  totalSteps: number;
  visibleStepIndex: number;
  visibleTotalSteps: number;
  attempt: number;
  maxAttempts: number;
  state: 'rationale' | 'requesting' | 'checking';
  onContinue: () => void;
  onSkip: () => void;   // no-op if step is required
}

interface RenderDeniedProps {
  step: PermitStep;
  permission: PermissionKey;
  attempt: number;
  maxAttempts: number;
  onRetry: () => void;
  onSkip: () => void;         // only meaningful if step.optional
  onOpenSettings: () => void;
}

interface RenderExhaustedProps {
  step: PermitStep;
  permission: PermissionKey;
  totalAttempts: number;
  isOptional: boolean;
  onOpenSettings: () => void;
  onSkip: () => void;         // only meaningful if step.optional
}

type PermitSequenceResults = Record<PermissionKey, PermitResult>;
```

**Default — 2 permissions, styled:**

```tsx
<PermitSequence
  stepIndicator="bar"
  stepAnimation="slide"
  permissions={[
    {
      permission: 'camera',
      rationale: {
        title: 'Scan items',
        message: 'Camera is needed to scan product barcodes.',
        icon: '📷',
        continueLabel: 'Allow Camera',
        accentColor: '#6366f1',
      },
      retry: { maxAttempts: 2, onExhausted: 'settings' },
    },
    {
      permission: 'notifications',
      optional: true,
      rationale: {
        title: 'Stay in the loop',
        message: "We'll notify you about order updates.",
        icon: '🔔',
        continueLabel: 'Enable Notifications',
        skipLabel: 'Maybe later',
        accentColor: '#f59e0b',
      },
    },
  ]}
  onComplete={(results) => navigation.navigate('Home')}
/>
```

**Custom denied state UI:**

```tsx
<PermitSequence
  permissions={steps}
  renderDenied={({ permission, attempt, maxAttempts, onRetry, onSkip, step }) => (
    <View style={styles.card}>
      <PermissionIcon permission={permission} size={56} />
      <Text style={styles.title}>Access Denied</Text>
      <Text style={styles.sub}>
        Attempt {attempt} of {maxAttempts}. We still need this to continue.
      </Text>
      <Pressable style={styles.primaryBtn} onPress={onRetry}>
        <Text>Try Again</Text>
      </Pressable>
      {step.optional && (
        <Pressable style={styles.ghostBtn} onPress={onSkip}>
          <Text>Skip for now</Text>
        </Pressable>
      )}
    </View>
  )}
  renderExhausted={({ permission, totalAttempts, onOpenSettings, isOptional, onSkip }) => (
    <View style={styles.blocker}>
      <Image source={require('./assets/blocked.png')} />
      <Text style={styles.title}>Please enable {permission}</Text>
      <Text style={styles.body}>
        You've declined {totalAttempts} times. Enable it manually in Settings.
      </Text>
      <Pressable style={styles.primaryBtn} onPress={onOpenSettings}>
        <Text>Open Settings</Text>
      </Pressable>
      {isOptional && (
        <Pressable style={styles.ghostBtn} onPress={onSkip}>
          <Text>Skip</Text>
        </Pressable>
      )}
    </View>
  )}
  onComplete={(results) => navigation.navigate('Home')}
/>
```

---

### `<PermitGate />`

Wrap any screen or component. Shows a permission request flow inline — no navigation needed. Resolves to `children` once granted.

```typescript
interface PermitGateProps {
  permission: PermissionKey;
  rationale: RationaleConfig;
  retry?: RetryConfig;
  notifications?: NotificationOptions;
  photoLibrary?: PhotoLibraryOptions;

  children: React.ReactNode;

  // Shown while checking initial status
  loading?: React.ReactElement;

  // Shown when blocked or exhausted
  fallback?: React.ReactElement | ((ctx: PermitGateFallbackContext) => React.ReactElement);
}

interface PermitGateFallbackContext {
  status: PermitStatus;
  result: PermitResult | null;
  openSettings: () => Promise<void>;
  clearExhaustion: () => Promise<void>;
}
```

**Example:**

```tsx
<PermitGate
  permission="camera"
  rationale={{ title: 'Camera needed', message: 'Scan items to get started.', icon: '📷' }}
  retry={{ maxAttempts: 2, onExhausted: 'settings' }}
  loading={<LoadingSpinner />}
  fallback={({ openSettings }) => (
    <View>
      <Text>Camera access is required.</Text>
      <Button title="Open Settings" onPress={openSettings} />
    </View>
  )}
>
  <CameraScreen />
</PermitGate>
```

---

### `withPermit(Component, options)` HOC

Wraps a component with a permission gate. The wrapped component only mounts when the permission is granted.

```typescript
function withPermit<P>(
  Component: React.ComponentType<P>,
  options: WithPermitOptions
): React.ComponentType<P>

interface WithPermitOptions {
  permission: PermissionKey;
  rationale: RationaleConfig;
  retry?: RetryConfig;
  loading?: React.ComponentType;
  fallback?: React.ComponentType<{ openSettings: () => void }>;
}
```

**Example:**

```tsx
const ProtectedCameraScreen = withPermit(CameraScreen, {
  permission: 'camera',
  rationale: {
    title: 'Camera required',
    message: 'Scan items to continue.',
    icon: '📷',
  },
  retry: { maxAttempts: 2, onExhausted: 'settings' },
  fallback: ({ openSettings }) => (
    <View>
      <Text>Camera is blocked.</Text>
      <Button title="Settings" onPress={openSettings} />
    </View>
  ),
});

// Use normally — permission check happens on mount
<ProtectedCameraScreen />
```

---

### `<RationaleModal />`

Low-level. Use when you want to control exactly when the rationale appears.

```typescript
interface RationaleModalProps {
  visible: boolean;
  config: RationaleConfig;
  onContinue: () => void;
  onSkip: () => void;
  onDismiss: () => void;
}
```

---

### `<DeniedSheet />`

Low-level. Show when a permission is blocked — guides user to Settings.

```typescript
interface DeniedSheetProps {
  visible: boolean;
  permission: PermissionKey;
  config?: DeniedSheetConfig;
  onOpenSettings: () => void;
  onDismiss: () => void;
}
```

---

### `<RationaleCard />`

Inline rationale — renders inside your own layout as a card, not as a modal overlay.

```typescript
interface RationaleCardProps {
  permission: PermissionKey;
  config: RationaleConfig;
  retry?: RetryConfig;
  onGranted?: () => void;
  onSkipped?: () => void;
  onDenied?: (result: PermitResult) => void;
  style?: ViewStyle;
}
```

**Example:**

```tsx
<ScrollView>
  <Text style={styles.h1}>Before you continue</Text>
  <RationaleCard
    permission="location"
    config={{
      title: 'Enable location',
      message: 'We show stores near you.',
      icon: '📍',
      presentationStyle: 'inline',
      accentColor: '#10b981',
    }}
    retry={{ maxAttempts: 2, onExhausted: 'settings' }}
    onGranted={loadNearbyStores}
    onSkipped={loadAllStores}
  />
</ScrollView>
```

---

### `Permit.check(permission)`

Check current status without any UI. Resolves immediately.

```typescript
Permit.check(permission: PermissionKey): Promise<PermitStatus>
```

---

### `Permit.checkAll(permissions)`

Check multiple permissions in parallel.

```typescript
Permit.checkAll(permissions: PermissionKey[]): Promise<Record<PermissionKey, PermitStatus>>
```

---

### `Permit.openSettings()`

Deep link to app's settings page on both platforms.

```typescript
Permit.openSettings(): Promise<void>
// iOS: UIApplication.openSettingsURL
// Android: Settings.ACTION_APPLICATION_DETAILS_SETTINGS
```

---

### `Permit.clearExhaustion(permission)`

Reset persisted exhaustion state for a permission. Call this if you want to re-enable prompting after a feature gate change or forced upgrade.

```typescript
Permit.clearExhaustion(permission: PermissionKey): Promise<void>
Permit.clearAllExhaustion(): Promise<void>
```

---

### `usePermitListener(permission, callback)`

Fires whenever the permission status changes — including when the user returns from Settings after enabling/disabling a permission.

```typescript
usePermitListener(
  permission: PermissionKey,
  callback: (status: PermitStatus) => void,
  options?: { fireImmediately?: boolean } // default: false
): void
```

**Example:**

```tsx
function App() {
  usePermitListener('location', (status) => {
    if (status === 'granted') {
      locationStore.start();
    } else {
      locationStore.stop();
    }
  });
}
```

---

### Cancellation

Use `PermitAbortController` to cancel an in-flight request (e.g., user navigates away mid-flow).

```typescript
import { PermitAbortController } from 'react-native-permit';

const controller = new PermitAbortController();

// Start the request
Permit.request('camera', {
  rationale: { title: 'Camera', message: '...' },
  signal: controller.signal,
});

// Cancel it — resolves with 'cancelled'
controller.abort();
```

In hooks, this is handled automatically: if a component using `usePermit` unmounts while a request is in flight, the request is cancelled and no state is set.

---

## Special permission handling

### `notifications` — iOS options

On iOS, notification authorization includes sound, badge, and alert individually. You can also request provisional authorization (iOS 12+), which delivers notifications silently without showing a system prompt.

```typescript
interface NotificationOptions {
  alert?: boolean;        // default: true
  badge?: boolean;        // default: true
  sound?: boolean;        // default: true
  provisional?: boolean;  // iOS 12+: deliver quietly, no system prompt. Default: false
  criticalAlert?: boolean; // requires Apple entitlement
  announcement?: boolean; // Siri announcements
  carPlay?: boolean;
}
```

```tsx
// Standard
await Permit.request('notifications', {
  rationale: { title: 'Notifications', message: 'Stay updated on orders.', icon: '🔔' },
  notifications: { alert: true, badge: true, sound: true },
});

// Provisional — no system prompt, no rationale needed
const result = await Permit.request('notifications', {
  rationale: { title: 'Notifications', message: '...' },
  notifications: { provisional: true },
});
// result === 'provisional' — deliver silently until user upgrades or downgrades in Settings

// On Android API < 33, resolves 'granted' immediately regardless of options
```

---

### `photo-library` — iOS 14+ limited access

On iOS 14+, users can grant access to only selected photos. The result is `'limited'` instead of `'granted'`. The library surfaces this state and provides a hook to open the photo picker for selection changes.

```typescript
interface PhotoLibraryOptions {
  // 'readWrite' — read and write access (default)
  // 'addOnly'   — add-only, no read (maps to NSPhotoLibraryAddUsageDescription)
  accessLevel?: 'readWrite' | 'addOnly';

  // Called when user grants limited access.
  // openPicker() opens PHPickerViewController to let them change their selection.
  onLimited?: (openPicker: () => void) => void;
}
```

```tsx
const result = await Permit.request('photo-library', {
  rationale: {
    title: 'Photo access',
    message: 'Choose photos to include in your post.',
    icon: '🖼️',
  },
  photoLibrary: {
    accessLevel: 'readWrite',
    onLimited: (openPicker) => {
      // Show a banner: "You've given access to X photos. Want to change?"
      showLimitedAccessBanner({
        onChangeTap: openPicker,
      });
    },
  },
});

if (result === 'limited') {
  // Proceed, but inform user they can expand access
}
if (result === 'granted') {
  // Full access
}
```

---

### `location-always` — two-step flow

iOS and Android both require a two-step flow for background location. The library handles this automatically.

**iOS:**
1. Request `whenInUse` authorization first
2. If granted, prompt for `always` authorization
3. On iOS 13+, the system shows a separate prompt for the `always` upgrade

**Android 10+ (API 29+):**
1. Request `ACCESS_FINE_LOCATION` first
2. If granted, request `ACCESS_BACKGROUND_LOCATION` separately (system requires this in two separate dialogs)

You can provide separate rationale for each step, or a single rationale for the whole flow:

```tsx
// Single rationale (simpler)
await Permit.request('location-always', {
  rationale: {
    title: 'Background Location',
    message: 'We track your delivery even when the app is closed.',
    icon: '🗺️',
  },
});

// Separate rationale per step (recommended for better UX)
await Permit.request('location-always', {
  rationale: {
    title: 'Background Location',
    message: 'We track your delivery even when the app is closed.',
  },
  twoStepRationale: {
    step1: {
      title: 'Location while using the app',
      message: 'First, allow location access while the app is open.',
      icon: '📍',
      continueLabel: 'Allow While Using App',
    },
    step2: {
      title: 'Background location',
      message: 'Now allow access all the time, so we can track your delivery.',
      icon: '🗺️',
      continueLabel: 'Change to Always Allow',
    },
  },
});
```

---

### `bluetooth` — Android 12+ split permissions

On Android 12+ (API 31+), `bluetooth` maps to `BLUETOOTH_SCAN` + `BLUETOOTH_CONNECT`. On older Android, it maps to `BLUETOOTH`. The library handles this automatically based on the running API level — you just use `'bluetooth'`.

```tsx
// Works on all Android versions
await Permit.request('bluetooth', {
  rationale: {
    title: 'Bluetooth access',
    message: 'We need Bluetooth to connect to your device.',
    icon: '📡',
  },
});
```

---

## Config types

### `RationaleConfig`

```typescript
interface RationaleConfig {
  title: string;
  message: string;

  // Icon — emoji string, image require(), URL string, or React element
  icon?: string | ImageSourcePropType | React.ReactElement;

  // Button labels
  continueLabel?: string;   // default: 'Continue'
  skipLabel?: string;       // default: 'Not now'

  // Accent color for CTA button and icon background
  accentColor?: string;     // default: system blue

  // Layout style
  // 'bottom-sheet' — slides up from bottom (default)
  // 'modal'        — centered card
  // 'inline'       — use with RationaleCard, no overlay
  presentationStyle?: 'bottom-sheet' | 'modal' | 'inline';

  // Override modal backdrop behavior
  dismissOnBackdropPress?: boolean; // default: true — tap outside = "Not now"
}
```

### `DeniedSheetConfig`

```typescript
interface DeniedSheetConfig {
  title?: string;               // default: '{Permission} access is off'
  message?: string;             // default: 'To use this feature, enable {permission} in Settings.'
  openSettingsLabel?: string;   // default: 'Open Settings'
  dismissLabel?: string;        // default: 'Not now'
  showPermissionIcon?: boolean; // default: true
  icon?: React.ReactElement;    // custom icon, overrides default
}
```

---

## Theming

### Global theme

```tsx
<PermitProvider
  theme={{
    // Colors
    accentColor: '#6366f1',
    backgroundColor: '#ffffff',
    surfaceColor: '#f9fafb',         // sheet / card background
    textColor: '#111827',
    secondaryTextColor: '#6b7280',
    destructiveColor: '#ef4444',
    dividerColor: '#e5e7eb',
    overlayColor: 'rgba(0,0,0,0.5)',

    // Shape
    buttonRadius: 12,
    sheetRadius: 20,                 // bottom sheet corner radius
    iconRadius: 16,

    // Typography
    font: {
      title: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
      message: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
      button: { fontSize: 16, fontWeight: '600' },
      caption: { fontSize: 13, fontWeight: '400' },
      // Custom font families — applied to all text
      family: 'Inter',
      familyBold: 'Inter-Bold',
    },

    // Animation
    animationDuration: 280,          // ms for all transitions
    reducedMotion: false,            // set true to disable animations (also auto-respects system setting)

    // Dark mode (auto-switches with system Appearance)
    dark: {
      accentColor: '#818cf8',
      backgroundColor: '#1c1c1e',
      surfaceColor: '#2c2c2e',
      textColor: '#f2f2f7',
      secondaryTextColor: '#ebebf5',
      dividerColor: '#3a3a3c',
      overlayColor: 'rgba(0,0,0,0.7)',
    },
  }}
>
```

### Global custom components

Replace the default UI for any layer across the entire app:

```tsx
<PermitProvider
  customRationale={(props) => (
    <MyRationaleModal
      title={props.config.title}
      body={props.config.message}
      icon={props.config.icon}
      onAllow={props.onContinue}
      onSkip={props.onSkip}
    />
  )}
  customDeniedSheet={(props) => (
    <MyBlockerSheet
      permission={props.permission}
      config={props.config}
      onOpenSettings={props.onOpenSettings}
      onDismiss={props.onDismiss}
    />
  )}
  customExhausted={(props) => (
    <MyHardBlocker
      permission={props.permission}
      totalAttempts={props.totalAttempts}
      onSettings={props.openSettings}
      onDismiss={props.dismiss}
    />
  )}
>
```

---

## Analytics

`PermitProvider` emits a typed event for every state transition. Hook into your analytics system once at the provider level — you never miss an event.

```typescript
type PermitEvent =
  | { type: 'rationale_shown'; permission: PermissionKey; attempt: number }
  | { type: 'rationale_skipped'; permission: PermissionKey; attempt: number }
  | { type: 'rationale_dismissed'; permission: PermissionKey; attempt: number }
  | { type: 'system_prompt_shown'; permission: PermissionKey; attempt: number }
  | { type: 'granted'; permission: PermissionKey; attempt: number; durationMs: number }
  | { type: 'limited'; permission: PermissionKey; attempt: number }
  | { type: 'provisional'; permission: PermissionKey }
  | { type: 'denied'; permission: PermissionKey; attempt: number }
  | { type: 'blocked'; permission: PermissionKey }
  | { type: 'settings_opened'; permission: PermissionKey }
  | { type: 'exhausted'; permission: PermissionKey; totalAttempts: number }
  | { type: 'sequence_started'; permissions: PermissionKey[] }
  | { type: 'sequence_step_complete'; permission: PermissionKey; result: PermitResult; stepIndex: number }
  | { type: 'sequence_complete'; results: PermitSequenceResults }
  | { type: 'sequence_abandoned'; at: PermissionKey; results: Partial<PermitSequenceResults> };
```

```tsx
<PermitProvider
  onEvent={(event) => {
    // Segment
    analytics.track(`permit_${event.type}`, event);

    // Custom funnel tracking
    if (event.type === 'exhausted') {
      analytics.track('permission_hard_blocked', { permission: event.permission });
    }
  }}
>
```

---

## Error handling

Errors in `react-native-permissions` (e.g., native crash, missing plist key, AsyncStorage failure) are caught internally. They never surface as uncaught exceptions. Instead:

- The request resolves with `'unavailable'`
- The `onError` callback on `PermitProvider` fires with the error and context

```tsx
<PermitProvider
  onError={(error: PermitError, context: PermitErrorContext) => {
    // Log to Sentry, Crashlytics, etc.
    Sentry.captureException(error, {
      extra: {
        permission: context.permission,
        phase: context.phase,   // 'check' | 'request' | 'storage' | 'settings'
        platform: Platform.OS,
      },
    });
  }}
>
```

---

## Testing

`react-native-permit/testing` exports a mock that intercepts all `Permit.*` calls. Use it in Jest to test your permission-gated screens without real device permission dialogs.

```typescript
import { PermitMock } from 'react-native-permit/testing';

beforeEach(() => {
  PermitMock.reset(); // clear all mocks between tests
});

// Mock specific results
PermitMock.mockGranted('camera');
PermitMock.mockDenied('location');
PermitMock.mockBlocked('notifications');
PermitMock.mockLimited('photo-library');
PermitMock.mockUnavailable('tracking');     // e.g., not iOS 14+
PermitMock.mockExhausted('camera');         // as if retries already ran

// Mock entire app as "first install" (all unknown)
PermitMock.mockAll('unknown');

// Mock entire app as "already granted" (for testing happy path)
PermitMock.mockAll('granted');

// Mock denial-then-grant flow (denies first N times, then grants)
PermitMock.mockDeniedThenGranted('camera', { denials: 2 });

// Simulate real device latency (useful for testing loading states)
PermitMock.mockGranted('camera', { delayMs: 500 });

// Inspect what happened
const calls = PermitMock.getCalls('camera');
// [{ type: 'check' }, { type: 'request', attempt: 1 }, ...]

expect(PermitMock.getCallCount('camera', 'request')).toBe(1);
```

**Jest setup (add to `jest.setup.ts`):**

```typescript
import { PermitMock } from 'react-native-permit/testing';

// Auto-reset between tests
afterEach(() => PermitMock.reset());
```

**Example test:**

```typescript
it('shows blocked screen when camera is permanently denied', async () => {
  PermitMock.mockBlocked('camera');

  const { getByText } = render(<CameraGate><CameraScreen /></CameraGate>);

  await waitFor(() => {
    expect(getByText('Camera access is disabled')).toBeTruthy();
    expect(getByText('Open Settings')).toBeTruthy();
  });
});

it('renders camera screen when already granted', async () => {
  PermitMock.mockGranted('camera');

  const { getByTestId } = render(<CameraGate><CameraScreen /></CameraGate>);

  await waitFor(() => {
    expect(getByTestId('camera-screen')).toBeTruthy();
  });
});

it('retries up to maxAttempts then shows exhausted screen', async () => {
  PermitMock.mockDenied('camera'); // always deny

  const { getByText } = render(
    <PermitGate
      permission="camera"
      rationale={{ title: 'Camera', message: '...' }}
      retry={{ maxAttempts: 2, onExhausted: 'settings' }}
      fallback={<Text>Camera Blocked</Text>}
    >
      <CameraScreen />
    </PermitGate>
  );

  // Trigger the request
  fireEvent.press(getByText('Continue'));
  await waitFor(() => expect(getByText('Try again')).toBeTruthy());

  fireEvent.press(getByText('Try again'));
  await waitFor(() => expect(getByText('Open Settings')).toBeTruthy());
});
```

---

## Supported permissions

| Key | iOS | Android | Notes |
|---|---|---|---|
| `'camera'` | ✅ | ✅ | |
| `'microphone'` | ✅ | ✅ | |
| `'location'` | ✅ | ✅ | `WHEN_IN_USE` / `ACCESS_FINE_LOCATION` |
| `'location-coarse'` | — | ✅ | `ACCESS_COARSE_LOCATION` only |
| `'location-always'` | ✅ | ✅ | Two-step flow handled automatically |
| `'notifications'` | ✅ | ✅ | Android: API 33+ only; older → 'granted' |
| `'photo-library'` | ✅ | ✅ | iOS 14+: limited access supported |
| `'photo-library-add'` | ✅ | — | Add-only, no read |
| `'contacts'` | ✅ | ✅ | |
| `'calendar'` | ✅ | ✅ | |
| `'reminders'` | ✅ | — | iOS only |
| `'bluetooth'` | ✅ | ✅ | Android 12+: split permissions handled |
| `'motion'` | ✅ | ✅ | Pedometer / CMMotionActivity |
| `'face-id'` | ✅ | — | iOS only |
| `'tracking'` | ✅ | — | iOS 14+ ATT; older → 'granted' |
| `'speech-recognition'` | ✅ | — | iOS only |
| `'health'` | ✅ | — | iOS HealthKit (read/write per type) |
| `'body-sensors'` | — | ✅ | Android only |
| `'activity-recognition'` | — | ✅ | Android only; iOS: use 'motion' |
| `'nearby-wifi-devices'` | — | ✅ | Android 13+ |
| `'media-location'` | — | ✅ | Android: ACCESS_MEDIA_LOCATION |

---

## Platform behavior reference

This is the definitive table of what actually happens on each platform and OS version. The library handles all of these silently.

### iOS

| Scenario | What the library does |
|---|---|
| First request, never asked before | Shows rationale → system prompt |
| Already granted | Resolves `'granted'` immediately, no UI |
| Previously denied (can ask again) | Shows rationale → system prompt (iOS shows prompt again if not permanently blocked) |
| Permanently denied (tapped "Don't Allow" once) | Detects `BLOCKED`, skips system prompt, shows DeniedSheet → `'blocked'` |
| Photo library — full access | `'granted'` |
| Photo library — limited access (iOS 14+) | `'limited'` + `onLimited` callback fires |
| Notifications — provisional (iOS 12+) | `'provisional'` — delivers quietly without a system prompt |
| `tracking` on iOS < 14 | Resolves `'granted'` immediately (ATT not available) |
| `notifications` — all options denied | `'blocked'` |
| `location-always` | Two-step: first `whenInUse`, then `always` upgrade |

### Android

| Scenario | What the library does |
|---|---|
| First request | Shows rationale → system prompt |
| First denial | `'denied'` — can ask again |
| Second denial OR "Don't ask again" checked | `BLOCKED` detected → skips system prompt, shows DeniedSheet → `'blocked'` |
| Already granted | Resolves `'granted'` immediately, no UI |
| `notifications` on API < 33 | Resolves `'granted'` immediately (not a runtime permission) |
| `bluetooth` on API < 31 | Uses legacy `BLUETOOTH` permission |
| `bluetooth` on API 31+ | Uses `BLUETOOTH_SCAN` + `BLUETOOTH_CONNECT` |
| `location-always` on API < 29 | Single prompt — background location not separated |
| `location-always` on API 29+ | Two-step: `ACCESS_FINE_LOCATION` first, then `ACCESS_BACKGROUND_LOCATION` |
| `photo-library` on API < 33 | Uses `READ_EXTERNAL_STORAGE` |
| `photo-library` on API 33+ | Uses `READ_MEDIA_IMAGES` |
| `nearby-wifi-devices` on API < 33 | Uses `ACCESS_FINE_LOCATION` (required for Wi-Fi scanning pre-33) |

### App lifecycle

| Scenario | What the library does |
|---|---|
| User opens Settings, enables permission, returns to app | `usePermit` re-checks on `AppState` change to `'active'`, fires `usePermitListener` callback |
| User opens Settings, revokes permission, returns to app | Same as above — status updates to `'blocked'` |
| Component unmounts while request in flight | Request is cancelled (`PermitAbortController`), no state update |
| Two components request the same permission simultaneously | Second call queues behind first — no double system prompt |
| App killed mid-flow | On next launch: persisted exhaustion state is respected; in-flight state is reset |
| StrictMode double-invoke | Safe — requests are deduplicated by the permission queue |

---

## Customization layers

Pick the level that fits your use case. You can mix levels — e.g., use the built-in `PermitSequence` with a custom `renderExhausted`, while also customizing theme globally via `PermitProvider`.

| Layer | What you control | API |
|---|---|---|
| **1 — Content only** | Text, icons, button labels | `RationaleConfig.title/message/icon/continueLabel` |
| **2 — Accent color** | CTA color per-request | `RationaleConfig.accentColor` |
| **3 — Global theme** | Fonts, radii, colors, dark mode | `PermitProvider theme` |
| **4 — Retry logic** | Attempts, exhausted behavior, persistence | `RetryConfig` |
| **5 — Render props** | Custom UI for rationale / denied / exhausted per sequence | `renderStep`, `renderDenied`, `renderExhausted` on `<PermitSequence>` |
| **6 — Global UI swap** | Replace modal, sheet, or exhausted screen app-wide | `customRationale`, `customDeniedSheet`, `customExhausted` on `<PermitProvider>` |
| **7 — Headless** | Bring your own UI for everything | `usePermitSequence` hook |
| **8 — Primitive** | Build your own flow using low-level components | `<RationaleModal>`, `<DeniedSheet>`, `Permit.check()`, `Permit.openSettings()` |

---

## Accessibility

All built-in components:

- Set correct `accessibilityRole` and `accessibilityLabel` on every interactive element
- Announce modal appearance to screen readers (VoiceOver / TalkBack)
- Respect `reduceMotion` system setting — animations are disabled automatically
- Support Dynamic Type (iOS) — font sizes scale with system text size setting
- Work in both LTR and RTL layouts
- Maintain focus order that makes sense for sequential permission flows
- Bottom sheets use `accessibilityViewIsModal` on iOS

---

## File structure

```
react-native-permit/
├── src/
│   ├── index.ts                          Public exports
│   │
│   ├── core/
│   │   ├── Permit.ts                     request(), check(), checkAll(), openSettings(), clearExhaustion()
│   │   ├── PermitQueue.ts                Concurrent request deduplication per permission key
│   │   ├── PermitStorage.ts              Persistence adapter (AsyncStorage by default, swappable)
│   │   └── PermitEventBus.ts            Internal event emitter feeding onEvent / usePermitListener
│   │
│   ├── resolver/
│   │   ├── PermitResolver.ts             Maps 'camera' → platform constant, API-level aware
│   │   ├── ios/
│   │   │   ├── IosPermitResolver.ts
│   │   │   ├── IosNotificationHandler.ts → provisional, sound, badge, critical
│   │   │   ├── IosPhotoLibraryHandler.ts → limited access, addOnly, openPicker
│   │   │   └── IosLocationHandler.ts     → whenInUse → always two-step
│   │   └── android/
│   │       ├── AndroidPermitResolver.ts
│   │       ├── AndroidNotificationHandler.ts → API 33+ gate
│   │       ├── AndroidLocationHandler.ts     → background location API 29+ two-step
│   │       └── AndroidBluetoothHandler.ts    → API 31+ split permissions
│   │
│   ├── flow/
│   │   ├── RetryController.ts            Retry state machine, exhaustion tracking
│   │   ├── FlowController.ts             Single-permission flow orchestration
│   │   └── SequenceController.ts         Multi-step sequence state machine
│   │
│   ├── hooks/
│   │   ├── usePermit.ts                  Single permission hook with AppState re-check
│   │   ├── usePermits.ts                 Multi-permission status hook
│   │   ├── usePermitSequence.ts          Headless sequence hook
│   │   └── usePermitListener.ts          Status change listener (AppState aware)
│   │
│   ├── components/
│   │   ├── PermitProvider.tsx            Theme + global UI overrides + analytics + error boundary
│   │   ├── PermitSequence.tsx            Multi-step sequence component (uses usePermitSequence)
│   │   ├── PermitGate.tsx                Single-permission gate wrapper
│   │   ├── RationaleModal.tsx            Bottom sheet / centered modal rationale
│   │   ├── RationaleCard.tsx             Inline rationale card
│   │   ├── DeniedSheet.tsx               Settings redirect bottom sheet
│   │   ├── ExhaustedView.tsx             All-retries-used full-screen UI
│   │   ├── DeniedInterstitial.tsx        Mid-retry "try again?" screen
│   │   ├── LimitedAccessBanner.tsx       iOS photo library limited access indicator
│   │   └── StepIndicator.tsx             Dots / bar / numbers progress
│   │
│   ├── theme/
│   │   ├── defaults.ts                   Default light + dark theme values
│   │   ├── ThemeContext.ts
│   │   └── useTheme.ts
│   │
│   ├── hoc/
│   │   └── withPermit.tsx
│   │
│   └── types.ts                          All exported TypeScript types
│
├── testing/
│   └── index.ts                          PermitMock — Jest utilities
│
├── example/
│   ├── App.tsx
│   └── screens/
│       ├── SinglePermissionScreen.tsx
│       ├── RetryScreen.tsx
│       ├── TwoPermissionOnboarding.tsx
│       ├── FullSequenceOnboarding.tsx
│       ├── HeadlessOnboarding.tsx         uses usePermitSequence
│       ├── PermitGateScreen.tsx
│       ├── LocationAlwaysScreen.tsx
│       ├── NotificationsScreen.tsx
│       ├── PhotoLibraryScreen.tsx
│       ├── ThemingScreen.tsx
│       ├── CustomUIScreen.tsx
│       └── PersistenceScreen.tsx
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Build plan

### Phase 1 — Core single-permission flow (4 days)

**Goal:** `Permit.request()` working end-to-end with retry and exhaustion on both platforms.

**Deliverables:**
- [ ] `PermitResolver.ts` + all platform handlers (iOS, Android, API-level aware)
- [ ] `Permit.ts` — `check()`, `request()`, `openSettings()`, `clearExhaustion()`
- [ ] `PermitQueue.ts` — deduplication for concurrent calls
- [ ] `PermitStorage.ts` — AsyncStorage adapter for persistence
- [ ] `RetryController.ts` — retry state machine
- [ ] `RationaleModal.tsx` — bottom sheet and modal variants
- [ ] `DeniedSheet.tsx`
- [ ] `ExhaustedView.tsx`
- [ ] `DeniedInterstitial.tsx`
- [ ] `PermitAbortController`
- [ ] Full TypeScript types

**Definition of done:**
```tsx
// These all work, on both platforms, all result values correct
await Permit.request('camera', { rationale: {...} });
await Permit.request('location-always', { rationale: {...} });
await Permit.request('notifications', { rationale: {...}, notifications: { provisional: true } });
await Permit.request('photo-library', { rationale: {...}, photoLibrary: { onLimited: ... } });
await Permit.request('camera', { rationale: {...}, retry: { maxAttempts: 3, persistExhaustion: true, onExhausted: 'custom', exhaustedComponent: ... } });
```

---

### Phase 2 — Hooks and provider (2 days)

**Goal:** React hook API, theme provider, analytics, error handling.

**Deliverables:**
- [ ] `usePermit()` — status, request, isGranted, isBlocked, isExhausted, isLimited, AppState re-check
- [ ] `usePermits()` — allGranted
- [ ] `usePermitListener()` — AppState aware
- [ ] `PermitProvider` — theme, customRationale, customDeniedSheet, customExhausted, onEvent, onError
- [ ] Default theme — light + dark, reduced motion support, RTL support

---

### Phase 3 — Sequence + headless hook (3 days)

**Goal:** Multi-permission flows with full render prop and headless support.

**Deliverables:**
- [ ] `usePermitSequence` — full state machine, all states
- [ ] `PermitSequence` — uses headless hook, all render props
- [ ] `renderStep`, `renderDenied`, `renderExhausted` all working
- [ ] `optional`, `skipIfGranted`, per-step `retry`
- [ ] `stepIndicator` variants (dots, bar, numbers)
- [ ] Animated step transitions (fade, slide)
- [ ] `onComplete`, `onRequiredDenied`, `onAbandon`

---

### Phase 4 — Gate, HOC, inline card (1 day)

**Deliverables:**
- [ ] `PermitGate` component
- [ ] `withPermit` HOC
- [ ] `RationaleCard` inline component
- [ ] `LimitedAccessBanner` for iOS photo library

---

### Phase 5 — Testing utilities + example app + CI (2 days)

**Deliverables:**
- [ ] `PermitMock` — all mock methods, call tracking
- [ ] Example app covering all 12 scenarios with documented flows
- [ ] Jest tests — PermitResolver, RetryController, SequenceController, status transitions, AppState behavior
- [ ] GitHub Actions CI — TypeScript check + tests on PR
- [ ] npm publish

---

## Why no one else built this right

Every existing solution falls into one of two failure modes:

1. **No UI** — `react-native-permissions`, `expo-permissions`. Raw API. You still write every state, every modal, every denied screen yourself.

2. **Abandoned UI wrappers** — old packages from 2018–2020 with no TypeScript, no dark mode, no retry, no sequence, broken on RN 0.70+, no limited access support, no provisional notifications.

The gap isn't the permission check. It's everything around it: the rationale UX, the retry state machine, the limited access path on iOS, the two-step flows, the "never ask again" persistence, the AppState re-check, the analytics, the testing story. This package covers all of it.
