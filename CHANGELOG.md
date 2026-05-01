# Changelog

All notable changes to `react-native-permit` will be documented in this file.

## 0.1.3

- Added focused docs for comparison, use cases, props, and what app code no longer has to build.
- Added a detailed comparison SVG for `react-native-permissions`, manual app code, and `react-native-permit`.
- Added the comparison SVG and short one-line product quotes to the README.
- Added README contribution, project links, and clearer package-size notes.
- Included `docs` in the published package so README links work from npm.

## 0.1.2

- Documentation release.

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
