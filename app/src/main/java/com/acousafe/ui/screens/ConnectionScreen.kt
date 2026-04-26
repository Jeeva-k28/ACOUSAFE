package com.acousafe.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cable
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Router
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.acousafe.network.ConnectionState
import com.acousafe.ui.MainViewModel
import com.acousafe.ui.theme.GreenSecondary
import com.acousafe.ui.theme.OrangeWarn
import com.acousafe.ui.theme.RedAlert

// ---------------------------------------------------------------------------
// Connection screen  (replaces the old Alerts page)
// ---------------------------------------------------------------------------

/**
 * Displays the Android device's current TCP server details and the ESP32
 * connection status. Also provides setup instructions for flashing the ESP32.
 */
@Composable
fun ConnectionScreen(viewModel: MainViewModel) {
    val deviceIp        by viewModel.deviceIp.collectAsState()
    val connectionState by viewModel.connectionState.collectAsState()

    val statusColor = when (connectionState) {
        ConnectionState.CONNECTED    -> GreenSecondary
        ConnectionState.WAITING      -> OrangeWarn
        ConnectionState.DISCONNECTED -> RedAlert
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // ── Header ────────────────────────────────────────────────────────────
        Text(
            text       = "CONNECTION",
            fontSize   = 20.sp,
            fontWeight = FontWeight.ExtraBold,
            color      = MaterialTheme.colorScheme.primary
        )
        Text(
            text     = "TCP server details & ESP32 status",
            fontSize = 11.sp,
            color    = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f)
        )

        Spacer(Modifier.height(20.dp))

        // ── Status card ───────────────────────────────────────────────────────
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors   = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(modifier = Modifier.padding(20.dp)) {

                // ESP32 status row
                Row(
                    modifier          = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector        = Icons.Default.Memory,
                        contentDescription = null,
                        tint               = statusColor,
                        modifier           = Modifier.size(26.dp)
                    )
                    Spacer(Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "ESP32",
                            fontSize = 12.sp,
                            color    = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                        Text(
                            connectionState.name,
                            fontSize   = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color      = statusColor
                        )
                    }
                    // Status indicator dot
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .background(statusColor, CircleShape)
                    )
                }

                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 16.dp),
                    color    = MaterialTheme.colorScheme.surfaceVariant
                )

                InfoRow(icon = Icons.Default.Smartphone, label = "Device IP",    value = deviceIp)
                Spacer(Modifier.height(14.dp))
                InfoRow(icon = Icons.Default.Router,     label = "Server Port",  value = "5000")
                Spacer(Modifier.height(14.dp))
                InfoRow(icon = Icons.Default.Cable,      label = "Protocol",     value = "TCP")
            }
        }

        Spacer(Modifier.height(16.dp))

        // ── Refresh button ────────────────────────────────────────────────────
        OutlinedButton(
            onClick  = { viewModel.refreshIp() },
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Default.Refresh, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("Refresh IP Address")
        }

        Spacer(Modifier.height(16.dp))

        // ── Setup instructions ────────────────────────────────────────────────
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors   = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    "Setup Instructions",
                    fontWeight = FontWeight.SemiBold,
                    fontSize   = 14.sp,
                    color      = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = """
                        1. Enable Mobile Hotspot on this device.
                        2. Connect the ESP32 to your hotspot.
                        3. Open esp32/acousafe_esp32.ino and set:
                               WIFI_SSID     → your hotspot name
                               WIFI_PASSWORD → your hotspot password
                               SERVER_IP     → $deviceIp
                        4. Flash the sketch to the ESP32 and reset.
                        5. The status above will change to CONNECTED.
                    """.trimIndent(),
                    color      = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.70f),
                    fontSize   = 12.sp,
                    lineHeight = 20.sp
                )
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Shared info row composable
// ---------------------------------------------------------------------------

@Composable
fun InfoRow(icon: ImageVector, label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector        = icon,
            contentDescription = null,
            tint               = MaterialTheme.colorScheme.primary,
            modifier           = Modifier.size(20.dp)
        )
        Spacer(Modifier.width(12.dp))
        Column {
            Text(
                label,
                fontSize = 11.sp,
                color    = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f)
            )
            Text(
                value,
                fontSize   = 15.sp,
                fontWeight = FontWeight.Medium,
                color      = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
