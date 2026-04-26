# Mode Switch UI Refactor - Summary

## Overview
Successfully modernized the Mode Switching UI in `SettingsScreen` to a side-by-side segmented control style, providing an instant-response, authority-grade user experience.

## Details of Changes

1.  **Layout Evolution**:
    *   Replaced the vertical `Column` of `InputModeOption` items.
    *   Implemented a horizontal `Row` container with `Arrangement.spacedBy(12.dp)`.

2.  **Visual Styling (Capsule Design)**:
    *   **Shape**: Used `CircleShape` (fully rounded corners) for a modern, pill-shaped aesthetic.
    *   **Dimensions**: Set a fixed `height(56.dp)` and equal `weight(1f)` for symmetry.
    *   **Colors**:
        *   **Active**: `InfoBlue` (Primary) background, `White` text.
        *   **Inactive**: `SecondaryBackground` (Light Gray) background, `TextSecondary` text.
    *   **Animations**: utilized `animateColorAsState` for smooth transitions between selected and unselected states.
    *   **Depth**: Added dynamic shadow elevation (6.dp for usage, 0.dp for inactive) to emphasize the active mode.

3.  **Interaction**:
    *   Directly tied `clickable` handlers to `AppModeManager.setMode()`.
    *   Ensured touch targets are large and accessible (full button area).

## Verification
*   **Build**: `assembleDebug` passed successfully.
*   **Compliance**: strict adherence to "No changes outside this component" rule.

The new UI provides clear, instant visual feedback for mode selection while keeping the underlying extensive audio engine logic intact.
