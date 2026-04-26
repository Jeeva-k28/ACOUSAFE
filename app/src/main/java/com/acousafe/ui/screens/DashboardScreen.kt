package com.acousafe.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.acousafe.network.ConnectionState
import com.acousafe.ui.MainViewModel
import com.acousafe.ui.theme.GreenSecondary
import com.acousafe.ui.theme.OrangeWarn
import com.acousafe.ui.theme.RedAlert

// ---------------------------------------------------------------------------
// Dashboard screen
// ---------------------------------------------------------------------------

/**
 * Real-time sound monitoring dashboard.
 *
 * Displays:
 *  - App title & live connection badge
 *  - Device IP / port sub-header
 *  - Circular arc gauge showing normalised sound level
 *  - Numeric value + NORMAL / ALERT label
 *  - Horizontal progress bar with scale labels
 */
@Composable
fun DashboardScreen(viewModel: MainViewModel) {
    val soundLevel      by viewModel.soundLevel.collectAsState()
    val connectionState by viewModel.connectionState.collectAsState()
    val deviceIp        by viewModel.deviceIp.collectAsState()

    // Threshold above which we consider the environment abnormal (0–1024 RMS range)
    val isAlert         = soundLevel > 800
    val normalized      = (soundLevel / 1024f).coerceIn(0f, 1f)

    val statusColor = when (connectionState) {
        ConnectionState.CONNECTED    -> GreenSecondary
        ConnectionState.WAITING      -> OrangeWarn
        ConnectionState.DISCONNECTED -> RedAlert
    }
    val levelColor = if (isAlert) RedAlert else MaterialTheme.colorScheme.primary

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // ── Header ───────────────────────────────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text       = "ACOUSTIC SHIELD",
                fontSize   = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color      = MaterialTheme.colorScheme.primary
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector     = if (connectionState == ConnectionState.CONNECTED)
                        Icons.Default.Wifi else Icons.Default.WifiOff,
                    contentDescription = null,
                    tint            = statusColor,
                    modifier        = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(4.dp))
                Text(
                    text     = connectionState.name,
                    color    = statusColor,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(Modifier.height(4.dp))

        Text(
            text     = "IP: $deviceIp  •  Port: 5000",
            color    = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f),
            fontSize = 11.sp
        )

        Spacer(Modifier.height(16.dp))

        // ── Arc gauge ────────────────────────────────────────────────────────
        Box(
            modifier        = Modifier
                .fillMaxWidth()
                .weight(1f),
            contentAlignment = Alignment.Center
        ) {
            SoundGauge(level = normalized, color = levelColor)
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text       = "$soundLevel",
                    fontSize   = 60.sp,
                    fontWeight = FontWeight.Bold,
                    color      = levelColor
                )
                Text(
                    text       = if (isAlert) "⚠  ALERT" else "●  NORMAL",
                    fontSize   = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color      = if (isAlert) RedAlert else GreenSecondary
                )
            }
        }

        Spacer(Modifier.height(12.dp))

        // ── Level bar card ────────────────────────────────────────────────────
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors   = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier              = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "Sound Level",
                        color    = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f),
                        fontSize = 12.sp
                    )
                    Text(
                        "$soundLevel / 1024",
                        color      = levelColor,
                        fontSize   = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Spacer(Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress     = { normalized },
                    modifier     = Modifier
                        .fillMaxWidth()
                        .height(8.dp),
                    color        = levelColor,
                    trackColor   = MaterialTheme.colorScheme.surfaceVariant
                )
                Spacer(Modifier.height(6.dp))
                Row(
                    modifier              = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf("0", "256", "512", "768", "1024").forEach { label ->
                        Text(
                            label,
                            color    = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.35f),
                            fontSize = 9.sp
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(12.dp))
    }
}

// ---------------------------------------------------------------------------
// Circular arc gauge
// ---------------------------------------------------------------------------

/**
 * Draws a 240° arc gauge (150° start, clockwise) using a cyan→alert gradient.
 * The background track is drawn at low opacity; the filled arc shows [level] (0..1).
 */
@Composable
fun SoundGauge(level: Float, color: Color) {
    Canvas(modifier = Modifier.size(220.dp)) {
        val strokeWidth = 22f
        val radius      = (size.minDimension / 2f) - strokeWidth
        val topLeft     = Offset(center.x - radius, center.y - radius)
        val arcSize     = Size(radius * 2f, radius * 2f)
        val sweep       = 240f

        // Background track
        drawArc(
            color      = color.copy(alpha = 0.12f),
            startAngle = 150f,
            sweepAngle = sweep,
            useCenter  = false,
            topLeft    = topLeft,
            size       = arcSize,
            style      = Stroke(width = strokeWidth, cap = StrokeCap.Round)
        )

        // Filled arc
        if (level > 0f) {
            drawArc(
                brush      = Brush.sweepGradient(
                    colors = listOf(color.copy(alpha = 0.5f), color),
                    center = center
                ),
                startAngle = 150f,
                sweepAngle = sweep * level,
                useCenter  = false,
                topLeft    = topLeft,
                size       = arcSize,
                style      = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )
        }
    }
}
