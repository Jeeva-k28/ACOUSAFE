package com.acousafe.audio

import android.content.Context
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Metadata for a saved audio recording.
 */
data class AudioRecording(
    val filePath: String,
    val fileName: String,
    val timestamp: Long,
    val displayName: String
)

/**
 * Handles saving raw 16-bit PCM data as WAV files and loading the file list.
 *
 * WAV parameters match the INMP441 capture settings:
 *  - Sample rate : 16 000 Hz
 *  - Bit depth   : 16-bit
 *  - Channels    : 1 (mono)
 */
class AudioManager(private val context: Context) {

    companion object {
        private const val SAMPLE_RATE    = 16_000
        private const val BITS_PER_SAMPLE = 16
        private const val CHANNELS        = 1
    }

    private val audioDir: File
        get() = File(context.filesDir, "recordings").also { it.mkdirs() }

    // ---------------------------------------------------------------------------
    // Save
    // ---------------------------------------------------------------------------

    /**
     * Wraps [pcmData] in a standard WAV header and writes it to internal storage.
     * @return [AudioRecording] on success, null on error.
     */
    fun savePcmAsWav(pcmData: ByteArray): AudioRecording? {
        if (pcmData.isEmpty()) return null

        val timestamp = System.currentTimeMillis()
        val fileName  = "audio_$timestamp.wav"
        val file      = File(audioDir, fileName)

        return try {
            FileOutputStream(file).use { fos ->
                fos.write(buildWavHeader(pcmData.size))
                fos.write(pcmData)
            }
            AudioRecording(
                filePath    = file.absolutePath,
                fileName    = fileName,
                timestamp   = timestamp,
                displayName = formatTimestamp(timestamp)
            )
        } catch (e: Exception) {
            e.printStackTrace()
            file.delete()
            null
        }
    }

    // ---------------------------------------------------------------------------
    // Load
    // ---------------------------------------------------------------------------

    /** Returns all saved recordings sorted newest-first. */
    fun loadRecordings(): List<AudioRecording> =
        audioDir
            .listFiles { f -> f.extension == "wav" }
            ?.sortedByDescending { it.lastModified() }
            ?.map { file ->
                val ts = file.nameWithoutExtension
                    .removePrefix("audio_")
                    .toLongOrNull() ?: file.lastModified()
                AudioRecording(
                    filePath    = file.absolutePath,
                    fileName    = file.name,
                    timestamp   = ts,
                    displayName = formatTimestamp(ts)
                )
            }
            ?: emptyList()

    /** Deletes a recording by file path. */
    fun deleteRecording(filePath: String): Boolean = File(filePath).delete()

    // ---------------------------------------------------------------------------
    // WAV header builder
    // ---------------------------------------------------------------------------

    /**
     * Builds a 44-byte standard WAV/RIFF header for the given [pcmSize] (bytes).
     *
     * Byte layout (all multi-byte values are little-endian):
     *   Offset  Size  Content
     *    0       4    "RIFF"
     *    4       4    total file size – 8
     *    8       4    "WAVE"
     *   12       4    "fmt "
     *   16       4    16  (PCM chunk size)
     *   20       2    1   (PCM format)
     *   22       2    channels
     *   24       4    sample rate
     *   28       4    byte rate
     *   32       2    block align
     *   34       2    bits per sample
     *   36       4    "data"
     *   40       4    PCM data size
     */
    private fun buildWavHeader(pcmSize: Int): ByteArray {
        val byteRate   = SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE / 8
        val blockAlign = (CHANNELS * BITS_PER_SAMPLE / 8).toShort()

        return ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN).apply {
            put("RIFF".toByteArray(Charsets.US_ASCII))
            putInt(pcmSize + 36)                       // RIFF chunk size
            put("WAVE".toByteArray(Charsets.US_ASCII))
            put("fmt ".toByteArray(Charsets.US_ASCII))
            putInt(16)                                  // fmt chunk size (PCM)
            putShort(1)                                 // AudioFormat = PCM
            putShort(CHANNELS.toShort())
            putInt(SAMPLE_RATE)
            putInt(byteRate)
            putShort(blockAlign)
            putShort(BITS_PER_SAMPLE.toShort())
            put("data".toByteArray(Charsets.US_ASCII))
            putInt(pcmSize)
        }.array()
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    private fun formatTimestamp(ts: Long): String =
        SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date(ts))
}
