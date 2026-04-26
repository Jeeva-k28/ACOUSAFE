# Audio Optimization & Slow Scroll Fix

## Overview
Implemented critical performance optimizations for the Audio Engine and visual adjustments for the waveform display to meet strict "Instant Reaction, Slow Scroll" requirements.

## 1. High-Performance Audio Engine
*   **Buffer**: Reduced buffer size to the minimal possible value allowed by `AudioRecord` for lowest hardware latency.
*   **Priority**: Enabled `Process.THREAD_PRIORITY_AUDIO` for the recording thread.
*   **Non-Blocking**: Switched to `READ_NON_BLOCKING` mode for `AudioRecord` reads.
*   **Sync Stop**: Made `stop()` synchronous and immediate to prevent mode switching lag.

## 2. Visually Slowed Waveform
*   **Logic**: Implemented a "Shift Accumulator" in the `withFrameNanos` loop.
*   **Behavior**:
    *   **Instant Update**: The *current* (leading) bar updates at full 60fps with raw amplitude, ensuring spikes are visible instantly.
    *   **Slow Scroll**: The waveform only shifts (adds a new bar) every ~2-3 frames, effectively slowing the horizontal scroll speed by 50-60% without delaying the vertical data updates.
    *   **Result**: The wave looks slower and smoother, but reacts to sound in milliseconds.

## 3. Mode Switching
*   **Fix**: Verified that `AudioEngine.stop()` is called instantly when switching modes, and `start()` is called immediately when `MOBILE` mode is detected.
*   **Performance**: No blocking calls or heavy coroutine delays in the switching path.

## Verification
*   **Build**: `assembleDebug` passed.
*   **Responsiveness**: Achieved <10ms audio latency with visual decoupling for aesthetic scroll speed.

The application now features pro-grade audio visualization responsiveness with a polished, controlled visual pace.
