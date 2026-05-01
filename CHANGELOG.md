# Changelog

All notable changes to `react-native-permit` will be documented in this file.

## 0.1.1

- Removed local publish provenance requirement so `npm publish` works from a developer terminal.
- Kept package contents and public API unchanged from `0.1.0`.

## 0.1.0

- Initial package metadata and build setup.
- Added `Permit` core API for `check`, `checkAll`, `request`, `openSettings`, and exhaustion reset.
- Added retry and persisted exhaustion support.
- Added event hooks for analytics.
- Added `usePermit`, `usePermits`, and `usePermitListener`.
- Added headless `usePermitSequence` for custom multi-permission onboarding.
- Added `PermitDialog` for modal, bottom-sheet, screen, and inline permission UI.
- Added `PermitStepper` with dots, bar, and numbers variants.
- Added `react-native-permit/testing` with `PermitMock`.
- Added SVG documentation diagrams.
- Added example files for direct API, hooks, built-in UI, custom sequences, persistence, analytics, and tests.
