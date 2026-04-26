package com.acousafe.ui

import android.app.Application
import android.media.MediaPlayer
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.acousafe.audio.AudioManager
import com.acousafe.audio.AudioRecording
import com.acousafe.network.ConnectionState
import com.acousafe.network.TcpServer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.net.Inet4Address
import java.net.NetworkInterface

/**
 * Central state holder for the AcouSafe application.
 *
 * Owns the [TcpServer] and bridges its callbacks into Compose-observable [StateFlow]s.
 * All StateFlow mutations are thread-safe (MutableStateFlow accepts writes from any thread).
 */
class MainViewModel(application: Application) : AndroidViewModel(application) {

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    private val _connectionState = MutableStateFlow(ConnectionState.WAITING)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()

    private val _soundLevel = MutableStateFlow(0)
    val soundLevel: StateFlow<Int> = _soundLevel.asStateFlow()

    private val _deviceIp = MutableStateFlow("Detecting…")
    val deviceIp: StateFlow<String> = _deviceIp.asStateFlow()

    private val _recordings = MutableStateFlow<List<AudioRecording>>(emptyList())
    val recordings: StateFlow<List<AudioRecording>> = _recordings.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _playingFile = MutableStateFlow<String?>(null)
    val playingFile: StateFlow<String?> = _playingFile.asStateFlow()

    // ---------------------------------------------------------------------------
    // Dependencies
    // ---------------------------------------------------------------------------

    private val audioManager = AudioManager(application)

    private val tcpServer = TcpServer(
        onConnectionStateChange = { state ->
            _connectionState.value = state
        },
        onSoundLevel = { level ->
            // Called ~20×/s from IO thread – direct StateFlow write is thread-safe.
            _soundLevel.value = level
        },
        onAudioReceived = { pcmData ->
            viewModelScope.launch(Dispatchers.IO) {
                audioManager.savePcmAsWav(pcmData)
                _recordings.value = audioManager.loadRecordings()
            }
        }
    )

    private var mediaPlayer: MediaPlayer? = null

    // ---------------------------------------------------------------------------
    // Initialisation
    // ---------------------------------------------------------------------------

    init {
        startServer()
        refreshIp()
        loadRecordings()
    }

    private fun startServer() {
        viewModelScope.launch(Dispatchers.IO) {
            tcpServer.start()
        }
    }

    // ---------------------------------------------------------------------------
    // Public actions
    // ---------------------------------------------------------------------------

    /** Re-detects the device's IPv4 address using NetworkInterface (not WifiManager). */
    fun refreshIp() {
        viewModelScope.launch(Dispatchers.IO) {
            _deviceIp.value = detectLocalIp()
        }
    }

    /** Loads (or reloads) the saved recordings list from disk. */
    fun loadRecordings() {
        viewModelScope.launch(Dispatchers.IO) {
            _recordings.value = audioManager.loadRecordings()
        }
    }

    /** Starts playback of the recording at [filePath]. */
    fun playRecording(filePath: String) {
        stopPlayback()
        try {
            mediaPlayer = MediaPlayer().apply {
                setDataSource(filePath)
                prepare()
                start()
                setOnCompletionListener {
                    _isPlaying.value  = false
                    _playingFile.value = null
                }
            }
            _isPlaying.value  = true
            _playingFile.value = filePath
        } catch (e: Exception) {
            e.printStackTrace()
            _isPlaying.value  = false
            _playingFile.value = null
        }
    }

    /** Stops any active playback. */
    fun stopPlayback() {
        mediaPlayer?.stop()
        mediaPlayer?.release()
        mediaPlayer    = null
        _isPlaying.value  = false
        _playingFile.value = null
    }

    override fun onCleared() {
        super.onCleared()
        tcpServer.stop()
        stopPlayback()
    }

    // ---------------------------------------------------------------------------
    // IP detection
    // ---------------------------------------------------------------------------

    /**
     * Iterates NetworkInterface entries to find the first non-loopback IPv4 address.
     * Uses NetworkInterface directly (NOT WifiManager) as required by the spec.
     */
    private fun detectLocalIp(): String {
        return try {
            NetworkInterface.getNetworkInterfaces()
                ?.asSequence()
                ?.filter { iface -> iface.isUp && !iface.isLoopback }
                ?.flatMap { iface -> iface.inetAddresses.asSequence() }
                ?.filterIsInstance<Inet4Address>()
                ?.filterNot { addr -> addr.isLoopbackAddress }
                ?.firstOrNull()
                ?.hostAddress
                ?: "Unknown"
        } catch (e: Exception) {
            e.printStackTrace()
            "Unknown"
        }
    }
}
