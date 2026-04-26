package com.acousafe.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.net.ServerSocket
import java.net.Socket
import java.net.SocketException

/**
 * TCP server that listens on [PORT] for the ESP32 client.
 *
 * Protocol handled:
 *  - Text line  "VALUE:<int>\n"        → onSoundLevel callback
 *  - Framed     "AUDIO_START\n"
 *               <raw PCM binary bytes>
 *               "AUDIO_END\n"          → onAudioReceived callback (raw PCM bytes)
 *
 * The server keeps the ServerSocket open permanently so it can accept a new
 * connection immediately after the previous client disconnects.
 */
class TcpServer(
    private val onConnectionStateChange: (ConnectionState) -> Unit,
    private val onSoundLevel: (Int) -> Unit,
    private val onAudioReceived: (ByteArray) -> Unit
) {
    companion object {
        const val PORT = 5000

        // ASCII bytes for the end-of-audio sentinel.
        private val AUDIO_END_MARKER = "AUDIO_END".toByteArray(Charsets.US_ASCII)

        // Sliding-window size: marker length + room for trailing \r\n + 1 safety byte.
        private val WINDOW_SIZE = AUDIO_END_MARKER.size + 3  // = 12
    }

    @Volatile
    private var running = false
    private var serverSocket: ServerSocket? = null

    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------

    /** Starts the server loop (suspends on the IO dispatcher until [stop] is called). */
    suspend fun start() = withContext(Dispatchers.IO) {
        running = true
        try {
            serverSocket = ServerSocket(PORT).apply {
                reuseAddress = true
                soTimeout = 0   // block forever on accept()
            }
            onConnectionStateChange(ConnectionState.WAITING)

            while (running) {
                try {
                    val client = serverSocket!!.accept()
                    onConnectionStateChange(ConnectionState.CONNECTED)
                    handleClient(client)
                } catch (e: SocketException) {
                    // serverSocket was closed by stop() – exit gracefully
                    if (!running) break
                } catch (_: Exception) {
                    // Client error – fall through to DISCONNECTED / WAITING cycle
                }
                if (running) {
                    onConnectionStateChange(ConnectionState.DISCONNECTED)
                    Thread.sleep(500)   // brief pause before waiting for next connect
                    onConnectionStateChange(ConnectionState.WAITING)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            serverSocket?.close()
        }
    }

    /** Stops the server and closes all sockets. */
    fun stop() {
        running = false
        serverSocket?.close()
    }

    // ---------------------------------------------------------------------------
    // Client handler
    // ---------------------------------------------------------------------------

    /**
     * Reads the byte stream from [socket] byte-by-byte (from a chunked read buffer
     * for efficiency).
     *
     * Text mode:  bytes accumulate in a line buffer until '\n'; the completed line
     *             is dispatched via [processTextLine].
     *
     * Audio mode: entered on "AUDIO_START".  Every incoming byte is appended to
     *             [audioBuffer] and a small sliding window [tailBuf] is updated.
     *             When the window contains "AUDIO_END" the PCM data (everything
     *             before the marker) is dispatched and text mode resumes.
     */
    private fun handleClient(socket: Socket) {
        socket.use { s ->
            s.tcpNoDelay = true

            val inputStream = s.getInputStream()
            val lineBuffer  = ByteArrayOutputStream(256)
            val audioBuffer = ByteArrayOutputStream(96_000)   // ~3 s at 16 kHz 16-bit

            var inAudioMode = false

            // Sliding window over the last WINDOW_SIZE bytes received in audio mode.
            val tailBuf = ByteArray(WINDOW_SIZE)
            var tailCount = 0   // grows up to WINDOW_SIZE then stays there

            try {
                val readBuf = ByteArray(2048)
                while (running) {
                    val n = inputStream.read(readBuf)
                    if (n == -1) break

                    for (i in 0 until n) {
                        val b = readBuf[i]

                        if (inAudioMode) {
                            // --- Audio mode -------------------------------------------
                            audioBuffer.write(b.toInt())

                            // Update sliding window
                            if (tailCount < WINDOW_SIZE) {
                                tailBuf[tailCount++] = b
                            } else {
                                System.arraycopy(tailBuf, 1, tailBuf, 0, WINDOW_SIZE - 1)
                                tailBuf[WINDOW_SIZE - 1] = b
                                // tailCount stays at WINDOW_SIZE
                            }

                            // Scan window for AUDIO_END marker
                            if (tailCount >= AUDIO_END_MARKER.size) {
                                val maxStart = tailCount - AUDIO_END_MARKER.size
                                for (pos in 0..maxStart) {
                                    var match = true
                                    for (j in AUDIO_END_MARKER.indices) {
                                        if (tailBuf[pos + j] != AUDIO_END_MARKER[j]) {
                                            match = false
                                            break
                                        }
                                    }
                                    if (match) {
                                        // markerStart = index in audioBuffer where AUDIO_END begins
                                        val markerStart =
                                            audioBuffer.size() - tailCount + pos
                                        val raw = audioBuffer.toByteArray()
                                        val pcm = raw.copyOfRange(
                                            0,
                                            markerStart.coerceAtLeast(0)
                                        )
                                        if (pcm.isNotEmpty()) onAudioReceived(pcm)
                                        audioBuffer.reset()
                                        inAudioMode = false
                                        tailCount = 0
                                        break
                                    }
                                }
                            }

                        } else {
                            // --- Text mode --------------------------------------------
                            if (b == '\n'.code.toByte()) {
                                val line = lineBuffer.toString(Charsets.UTF_8.name()).trim()
                                lineBuffer.reset()
                                if (processTextLine(line)) {
                                    inAudioMode = true
                                    tailCount = 0
                                    audioBuffer.reset()
                                }
                            } else if (b != '\r'.code.toByte()) {
                                lineBuffer.write(b.toInt())
                            }
                        }
                    }
                }
            } catch (_: Exception) {
                // Connection closed or IO error – exit silently
            }
        }
    }

    /**
     * Handles one complete text line received from the ESP32.
     * @return true when the line is "AUDIO_START" (caller switches to audio mode).
     */
    private fun processTextLine(line: String): Boolean {
        return when {
            line.startsWith("VALUE:") -> {
                line.removePrefix("VALUE:").trim().toIntOrNull()?.let(onSoundLevel)
                false
            }
            line == "AUDIO_START" -> true
            else -> false
        }
    }
}
