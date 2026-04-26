# Waveform Drawing Update: Unclipped Growth

## Overview
Modified the `LiveWaveformCard` to remove all clipping constraints, allowing the waveform bars to grow naturally beyond the container's bounds when amplitude is high. This addresses the issue where strong sounds resulted in "capped" or truncated bars.

## Changes Implemented

### 1. Removed Container Clipping
- **Before**: `Box(... .clip(RoundedCornerShape(20.dp)).background(...))`
- **After**: `Box(... .background(Color.Black, RoundedCornerShape(20.dp)))`
- **Effect**: By applying the shape directly to the background modifier instead of using a separate `.clip()` modifier, the background maintains its rounded appearance, but the children (waveform bars) are no longer clipped to the box's bounds.

### 2. Explicitly Disabled Canvas Clipping
- Added `.graphicsLayer { clip = false }` to the `Canvas` modifier.
- This instructs the rendering engine to allow drawing operations to extend outside the layout bounds of the canvas.

### 3. Updated Drawing Logic
- **Drawing Method**: `drawLine` from center (`cy`) outwards.
- **Reference Scale**: `scale = (260.dp * 0.9f) / 2f`. 
- **Height Calculation**: `val barHeight = amp * scale`.
- **No Limit**: Removed all artificial height limiting methodology (e.g., `min`, `maxBarHeight`, `coerceAtMost`). The bar height is now purely a function of amplitude and scale.

## Verification
- **Build Status**: `assembleDebug` completed successfully.
- **Visual Result**: High-amplitude sounds should now produce bars that extend fully, potentially overlapping surrounding elements if they get loud enough, which is the desired "natural growth" behavior.
- **Design Integrity**: The black container remains present and rounded. The waveform remains vertically centered.

## Next Steps
- Verify on device.
