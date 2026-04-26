package com.acousafe.ui.screens

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AudioFile
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.acousafe.audio.AudioRecording
import com.acousafe.ui.MainViewModel
import com.acousafe.ui.theme.RedAlert

// ---------------------------------------------------------------------------
// History screen
// ---------------------------------------------------------------------------

/**
 * Lists all saved audio recordings with play / stop controls.
 *
 * The list is refreshed every time this screen becomes visible via [LaunchedEffect].
 */
@Composable
fun HistoryScreen(viewModel: MainViewModel) {
    val recordings  by viewModel.recordings.collectAsState()
    val playingFile by viewModel.playingFile.collectAsState()
    val isPlaying   by viewModel.isPlaying.collectAsState()

    LaunchedEffect(Unit) { viewModel.loadRecordings() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // ── Header ────────────────────────────────────────────────────────────
        Text(
            text       = "RECORDINGS",
            fontSize   = 20.sp,
            fontWeight = FontWeight.ExtraBold,
            color      = MaterialTheme.colorScheme.primary
        )
        Text(
            text     = "${recordings.size} file(s) stored",
            fontSize = 11.sp,
            color    = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f)
        )

        Spacer(Modifier.height(16.dp))

        if (recordings.isEmpty()) {
            // ── Empty state ───────────────────────────────────────────────────
            Box(
                modifier         = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector        = Icons.Default.AudioFile,
                        contentDescription = null,
                        tint               = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.25f),
                        modifier           = Modifier.size(72.dp)
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "No recordings yet",
                        color    = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.45f),
                        fontSize = 15.sp
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Recordings appear here when the ESP32\ntriggers an audio alert.",
                        color    = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.30f),
                        fontSize = 12.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        } else {
            // ── Recording list ─────────────────────────────────────────────────
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(recordings, key = { it.filePath }) { recording ->
                    RecordingItem(
                        recording = recording,
                        isPlaying = isPlaying && playingFile == recording.filePath,
                        onToggle  = {
                            if (isPlaying && playingFile == recording.filePath) {
                                viewModel.stopPlayback()
                            } else {
                                viewModel.playRecording(recording.filePath)
                            }
                        }
                    )
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Recording list item
// ---------------------------------------------------------------------------

@Composable
fun RecordingItem(
    recording : AudioRecording,
    isPlaying : Boolean,
    onToggle  : () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors   = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier          = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector        = Icons.Default.Mic,
                contentDescription = null,
                tint               = if (isPlaying) RedAlert
                                     else MaterialTheme.colorScheme.primary,
                modifier           = Modifier.size(28.dp)
            )
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text       = recording.displayName,
                    fontWeight = FontWeight.SemiBold,
                    color      = MaterialTheme.colorScheme.onSurface,
                    fontSize   = 14.sp
                )
                Text(
                    text     = recording.fileName,
                    color    = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.45f),
                    fontSize = 11.sp
                )
            }
            IconButton(onClick = onToggle) {
                Icon(
                    imageVector        = if (isPlaying) Icons.Default.Stop
                                         else Icons.Default.PlayArrow,
                    contentDescription = if (isPlaying) "Stop" else "Play",
                    tint               = if (isPlaying) RedAlert
                                         else MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}
