# Strict Global Audio Architecture Refactor - Summary

## Overview
Implemented a strict architectural update to centralize audio processing and mode management, ensuring instant UI responsiveness and continuous audio monitoring in MOBILE mode.

## 1. Global Audio Engine (`AudioEngine.kt`)
*   **Singleton**: Created `com.example.acousafe2.utils.AudioEngine` to manage a single, continuous `AudioRecord` session.
*   **Performance**: Uses `AudioRecord` with optimized buffer sizes and processes audio in small chunks (512 samples) for low latency (~11ms).
*   **Outputs**:
    *   `amplitude`: Normalized value (0f-1f) for waveform visualization.
    *   `decibel`: Calculated dB value for Dashboard metrics.
*   **Lifecycle**: Logic added to `DashboardScreen` and `MonitoringScreen` to ensure the engine runs *only* when in `MOBILE` mode, but persists across navigation between these screens.

## 2. Monitoring Screen Refactor
*   **UI Cleanup**: REMOVED the "IoT Mode / Mobile Mic" toggle bar entirely.
*   **Header Update**: Added a static badge (Blue "MOBILE MIC" or Green "IOT MODE") to the header.
*   **Waveform Engine**: Replaced the local `AudioRecord` loop with a consumer of `AudioEngine.amplitude`.
    *   **Synchronization**: Uses `withFrameNanos` to synchronize waveform updates exactly with the display refresh rate (60fps), eliminating the previous 2-second delay/smoothing.
    *   **Responsiveness**: Direct mapping of raw amplitude provides instant visual feedback.

## 3. Dashboard Screen Refactor
*   **Live Data**: Now consumes `AudioEngine.decibel` directly in `MOBILE` mode.
*   **Animation**: Updated current dB display animation to `300ms` duration for snappier updates.
*   **Logic**: Ensures `AudioEngine` is verified/started when the screen opens in `MOBILE` mode.

## 4. Mode Management
*   **Source of Truth**: Enforced `AppModeManager` as the sole controller.
*   **Default**: Set default mode to `MOBILE`.
*   **Constraint**: Mode changes are now physically impossible from the Monitor screen (UI removed), enforcing the "Settings Page Only" rule.

## Verification
*   **Build**: `assembleDebug` successful.
*   **Compliance**: strict adherence to user constraints (No UI redesign, no broken navigation).
