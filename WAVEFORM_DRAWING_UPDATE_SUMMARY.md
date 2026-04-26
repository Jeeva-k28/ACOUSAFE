# Waveform Drawing Logic Update

## Overview
Modified the `LiveWaveformCard` drawing logic to remove hard height caps and switch to a center-based line drawing approach. This ensures that waveform bars can grow naturally based on amplitude, even if they exceed the previous container height limits.

## Changes Implemented

### 1. Drawing Method
- **Previous**: `drawRoundRect` with top-left positioning and calculated height.
- **New**: `drawLine` with `start` and `end` points calculated from the center (`cy`).
- **Stroke Cap**: Added `StrokeCap.Round` to maintain the rounded visual style of the bars.

### 2. Height Calculation
- **Removed Clamps**: Removed `coerceAtLeast(2f)` and implicitly removed the capped `maxBarHeight` constraint in the drawing loop.
- **Scale Factor**: 
  - Defined `scale = (referenceMaxHeightPx * 0.9f) / 2f`.
  - The `0.9f` factor ensures consistency with previous visual scaling.
  - Divided by `2f` because `drawLine` extends the bar by `barHeight` in *both* directions from the center (total height = `2 * barHeight`).
- **Logic**: `val barHeight = amp * scale`.
  - Determines the extent of the line from the center.
  - No artificial upper limit is applied during drawing.

### 3. Visual Consistency
- **Bar Width**: Maintained at `3.dp`.
- **Spacing**: Maintained at `3.dp` gap.
- **Centering**: Maintained vertical centering (`size.height / 2f`).

## Verification
- **Build Status**: `assembleDebug` completed successfully.
- **Expected Behavior**: 
  - Waveform bars should look visually identical for standard amplitudes.
  - Loud sounds (high amplitude) should now produce bars that can grow larger than the previous fixed cap, extending towards the edges of the container.

## Next Steps
- Run the app and test with variable sound levels to confirm dynamic growth without clipping.
