# Global Detection Mode Implementation Summary

## Overview
Successfully implemented a robust Global Detection Mode architecture as requested. The application now uses a centralized `AppModeManager` to handle `DetectionMode` (IoT/Mobile), enforcing strict rules on where the mode can be changed and how it affects the application state.

## Components Created

1.  **`DetectionMode.kt` (Enum)**:
    - Located in `data/model`.
    - Defines `IOT` and `MOBILE` states.

2.  **`AppModeManager.kt` (Singleton)**:
    - Located in `utils`.
    - Manages the single source of truth for the application's detection mode.
    - Exposes a `StateFlow<DetectionMode>` for reactive UI updates.
    - Provides `setMode()` which is now the *only* way to change modes.

3.  **`MicStateHolder.kt` (Singleton)**:
    - Located in `utils`.
    - Acts as a shared data bus for microphone decibel levels.
    - Allowing the Dashboard to display real-time mic data without direct dependency on the Monitor screen's internal state.

## Screen Updates

### 1. `SettingsScreen.kt`
- **Role**: Controller.
- **Change**: Replaced `MainViewModel` toggles with `AppModeManager.setMode()`.
- **Behavior**: This is now the exclusive location for changing the detection mode.

### 2. `MonitoringScreen.kt`
- **Role**: Consumer & Executor.
- **Change**:
  - Observes `AppModeManager.mode`.
  - **Read-Only**: The on-screen toggle buttons are now display-only (clicks disabled).
  - **Mic Control**: The microphone logic (in `LiveWaveformCard`) now automatically starts/stops based on the global mode.
  - **Data Push**: Calculates real-time decibel (dB) levels from RMS amplitude and pushes them to `MicStateHolder`.

### 3. `DashboardScreen.kt`
- **Role**: Consumer / Display.
- **Change**:
  - Observes `AppModeManager.mode`.
  - **Visual Indication**: Added a dynamic badge (Green "IoT MODE" / Blue "MOBILE MIC") below the context label.
  - **Real-Time Data**: 
    - In **Mobile Mode**: Displays the live dB values from `MicStateHolder`.
    - In **IoT Mode**: Falls back to the standard ViewModel simulated/IoT data stream.

## Verification
- **Architecture Compliance**: STRICT adherence to the rule "Mode change only in Settings".
- **Build Status**: `assembleDebug` completed successfully.
- **Safety**: Start/Stop logic for microphone ensures it only runs when needed.

The application is now ready for testing. The global mode switch in Settings will instantaneously propagate state changes to both the Dashboard and Monitor screens without requiring manual refreshes or navigation tricks.
