# Why react-native-permit

`react-native-permit` is the small orchestration layer around
`react-native-permissions`.

Use `react-native-permissions` for native access. Use `react-native-permit` for
the product flow around that access: hooks, retry state, onboarding, built-in UI,
analytics, persistence, and tests.

## What You Do Not Have To Build

| Product need | Usually required in app code | Provided by react-native-permit |
| --- | --- | --- |
| Ask for one permission | Status check, request call, result branching | `Permit.check`, `Permit.request`, `usePermit` |
| Ask for multiple permissions | Status map, loading state, partial success handling | `Permit.checkAll`, `usePermits` |
| Re-check after app settings | AppState listener and re-fetch logic | `usePermit({ recheckOnForeground: true })` |
| Explain before asking | Custom rationale screen state | `usePermitSequence`, `PermitDialog` |
| Retry after denial | Attempt counters and retry branches | `retry.maxAttempts`, `retry.cooldownMs` |
| Stop asking after repeated denials | Exhausted state and UI fallback | `retry.persistExhaustion`, `onRetriesExhausted` |
| Persist retry exhaustion | Storage keys, reset dates, cleanup | `Permit.configure({ storage })`, `resetExhaustionAfterDays` |
| Send blocked users to Settings | Blocked detection and settings action | `Permit.openSettings`, `usePermit().openSettings` |
| Build modal/sheet/screen UI | Repeated permission prompt components | `PermitDialog` |
| Show onboarding progress | Step indexes, visible steps, skipped steps | `PermitStepper`, `usePermitSequence` |
| Track permission events | Manual event names and payload wiring | `Permit.configure({ onEvent })` |
| Test permission behavior | Native mocks and status setup | `react-native-permit/testing` |

## Comparison

Use both packages together: `react-native-permissions` for native access,
`react-native-permit` for the app permission flow.

<p align="center">
  <img src="../assets/comparison.svg" alt="Comparison of react-native-permissions, manual app code, and react-native-permit" width="920" />
</p>

| Capability | `react-native-permissions` | Manual app code | `react-native-permit` |
| --- | --- | --- | --- |
| Native permission access | Yes | No | Uses peer dependency |
| Typed result normalization | Yes | You write it | Yes |
| Retry attempts | No | You write it | Yes |
| Persisted exhaustion | No | You write it | Yes |
| AppState re-check hook | No | You write it | Yes |
| Multi-permission hook | Low-level only | You write it | Yes |
| Custom onboarding state machine | No | You write it | Yes |
| Built-in modal/bottom-sheet/screen UI | No | You write it | Yes |
| Stepper UI | No | You write it | Yes |
| Analytics event stream | No | You write it | Yes |
| Jest permission mock | No | You write it | Yes |

## What This Library Is Good At

| App flow | Why it helps | API to start with |
| --- | --- | --- |
| QR scanner | Camera gate with retry and Settings fallback | `usePermit('camera')` |
| Video recorder | Camera and microphone together | `usePermits(['camera', 'microphone'])` |
| Voice notes | Single microphone permission with UI fallback | `usePermit('microphone')` |
| Nearby stores | Location request with retry copy | `Permit.request('location', { retry })` |
| Delivery tracking | Foreground + background location onboarding | `usePermitSequence` |
| Order updates | Notification options and provisional iOS support | `Permit.request('notifications', { notifications })` |
| Media upload | Photo library and limited photo states | `usePermit('photo-library')` |
| Avatar picker | Inline UI before photo access | `PermitDialog presentation="inline"` |
| First-run setup | Multi-step permission education | `usePermitSequence`, `PermitStepper` |
| Blocked feature | Settings redirect instead of repeated prompts | `Permit.openSettings` |
| Permission analytics | Prompt/denied/blocked/exhausted events | `Permit.configure({ onEvent })` |
| Feature tests | Permission states without native prompts | `PermitMock` |

## What This Library Is Not Trying To Do

| Need | Use instead |
| --- | --- |
| Native iOS/Android permission implementation | `react-native-permissions` |
| Camera preview, recorder, scanner, or media picker | Your camera/media library |
| Push notification delivery service | Firebase, APNs, or your notification provider |
| Background location tracking engine | Your location/background task library |
| Full design system | Your app UI system plus optional `PermitDialog` primitives |
| Legal/privacy copy generation | Your product, legal, and platform-specific copy |

## Which Prop Or API Helps?

| Need | Use | Notes |
| --- | --- | --- |
| Request one permission | `Permit.request(permission)` | Headless API for custom UI |
| Check without prompt | `Permit.check(permission)` | Does not show an OS prompt |
| Track one permission in React | `usePermit(permission)` | Returns status booleans and actions |
| Track many permissions | `usePermits(permissions)` | Useful for setup screens |
| Re-check after Settings | `recheckOnForeground` | Enabled by default in `usePermit` |
| Skip mount check | `recheckOnMount: false` | Useful when parent controls status checks |
| Retry a denial | `retry.maxAttempts` | Total attempts including the first request |
| Delay between attempts | `retry.cooldownMs` | Useful before showing a retry surface |
| Persist exhausted state | `retry.persistExhaustion` | Requires configured storage for app persistence |
| Auto-reset exhaustion | `retry.resetExhaustionAfterDays` | Good for soft cooldown policies |
| Namespaced storage | `retry.persistenceKey` | Use when multiple apps/packages share storage |
| Observe attempts | `retry.onAttempt` | Useful for analytics or UI counters |
| Handle exhausted result | `retry.onRetriesExhausted` | Show custom exhausted UI or Settings fallback |
| Request notification options | `notifications` | Supports alert, badge, sound, provisional, and iOS options |
| Cancel in-flight request | `signal` | Use `PermitAbortController` |
| Listen to status changes | `usePermitListener` or `Permit.subscribe` | Useful for global feature gates |
| Built-in modal | `PermitDialog presentation="modal"` | Centered prompt |
| Built-in bottom sheet | `PermitDialog presentation="bottom-sheet"` | Mobile-first prompt |
| Built-in screen | `PermitDialog presentation="screen"` | Full-screen permission education |
| Inline permission block | `PermitDialog presentation="inline"` | Fits inside an existing screen |
| Step progress | `PermitStepper` | Dots, bar, or numbers |
| Custom sequence | `usePermitSequence` | Bring your own UI |
| Jest setup | `PermitMock` | Available from `react-native-permit/testing` |

## Developer Links

| Link | Use it for |
| --- | --- |
| [README](../README.md) | Package overview and quick start |
| [API reference](./API.md) | Full props, methods, types, and return values |
| [Recipes](./RECIPES.md) | Copy-paste usage patterns |
| [Platform setup](./PLATFORM_SETUP.md) | iOS plist and Android manifest examples |
| [Testing](./TESTING.md) | Jest mocks and test examples |
| [Examples](../example/README.md) | Larger example folder walkthrough |
| [GitHub](https://github.com/prakharcodehere/react-native-permit) | Source, issues, and docs |
| [npm](https://www.npmjs.com/package/react-native-permit) | Published package |
