package com.acousafe.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ---------------------------------------------------------------------------
// Palette – authority-grade dark theme
// ---------------------------------------------------------------------------

val CyanPrimary     = Color(0xFF00C8FF)
val GreenSecondary  = Color(0xFF00FF9D)
val RedAlert        = Color(0xFFFF3B30)
val OrangeWarn      = Color(0xFFFFAA00)
val BackgroundDeep  = Color(0xFF0A0E1A)
val SurfaceCard     = Color(0xFF111827)
val SurfaceVariant  = Color(0xFF1E2A3A)
val OnBackground    = Color(0xFFE0E6F0)

private val DarkColorScheme = darkColorScheme(
    primary         = CyanPrimary,
    secondary       = GreenSecondary,
    tertiary        = RedAlert,
    background      = BackgroundDeep,
    surface         = SurfaceCard,
    surfaceVariant  = SurfaceVariant,
    onPrimary       = Color(0xFF000000),
    onSecondary     = Color(0xFF000000),
    onTertiary      = Color(0xFFFFFFFF),
    onBackground    = OnBackground,
    onSurface       = OnBackground,
    onSurfaceVariant = OnBackground.copy(alpha = 0.7f),
    error           = RedAlert,
    onError         = Color(0xFFFFFFFF),
)

@Composable
fun AcousafeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content     = content
    )
}
