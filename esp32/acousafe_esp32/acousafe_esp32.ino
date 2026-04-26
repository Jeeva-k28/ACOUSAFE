/**
 * AcouSafe – ESP32 Firmware
 * ──────────────────────────────────────────────────────────────────────────
 * Hardware
 *   • ESP32 dev board
 *   • INMP441 I2S MEMS microphone
 *   • Green LED  (normal-state indicator)
 *   • Red LED    (alert-state indicator)
 *   • Buzzer     (piezo, active-low or active-high – see PIN_BUZZER_ACTIVE_HIGH)
 *
 * Protocol (TCP, Android acts as server on port 5000)
 *   Normal  →  "VALUE:<rms>\n"          (sent every I2S read cycle, ~20 Hz)
 *   Alert   →  "AUDIO_START\n"
 *               <3 s of raw 16-bit PCM, little-endian, 16000 Hz, mono>
 *              "AUDIO_END\n"
 *
 * Audio format matches Android AudioManager expectations:
 *   Sample rate : 16 000 Hz
 *   Bit depth   : 16-bit signed PCM
 *   Channels    : 1 (mono – INMP441 left channel only)
 * ──────────────────────────────────────────────────────────────────────────
 */

#include <WiFi.h>
#include <driver/i2s.h>
#include <math.h>

// ═══════════════════════════════════════════════════════════════════════════
//  USER CONFIGURATION  ← edit these before flashing
// ═══════════════════════════════════════════════════════════════════════════

const char* WIFI_SSID      = "YOUR_HOTSPOT_SSID";
const char* WIFI_PASSWORD  = "YOUR_HOTSPOT_PASSWORD";
const char* SERVER_IP      = "192.168.43.1";   // Default Android hotspot IP
const int   SERVER_PORT    = 5000;

// ═══════════════════════════════════════════════════════════════════════════
//  PIN DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

// I2S – INMP441
#define I2S_WS_PIN   15   // Word Select (LRCLK)
#define I2S_SCK_PIN  14   // Bit Clock   (BCLK)
#define I2S_SD_PIN   32   // Serial Data (SD)

// Indicators
#define PIN_GREEN_LED  2
#define PIN_RED_LED    4
#define PIN_BUZZER     5

// Set to true if the buzzer fires on HIGH, false if it fires on LOW
#define BUZZER_ACTIVE_HIGH true

// ═══════════════════════════════════════════════════════════════════════════
//  AUDIO CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

#define SAMPLE_RATE       16000
#define I2S_PORT          I2S_NUM_0
#define DMA_BUF_COUNT     8
#define DMA_BUF_LEN       512          // samples per DMA buffer

// RMS samples per measurement window (one DMA buffer worth)
#define RMS_WINDOW        DMA_BUF_LEN

// Alert threshold – tune for your environment (0–32767 range for 16-bit PCM)
#define ALERT_THRESHOLD   1500

// Recording length: 3 seconds
#define RECORD_SECONDS    3
#define RECORD_SAMPLES    (SAMPLE_RATE * RECORD_SECONDS)  // 48 000 samples

// ═══════════════════════════════════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════════════════════════════════

WiFiClient tcpClient;

// Reusable read buffer (one DMA buffer worth)
int16_t  readBuf[DMA_BUF_LEN];

// Recording buffer – allocated once to avoid heap fragmentation
int16_t* recordBuf = nullptr;

// ═══════════════════════════════════════════════════════════════════════════
//  I2S INITIALISATION
// ═══════════════════════════════════════════════════════════════════════════

void initI2S() {
    i2s_config_t cfg = {
        .mode                 = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
        .sample_rate          = SAMPLE_RATE,
        .bits_per_sample      = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format       = I2S_CHANNEL_FMT_ONLY_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags     = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count        = DMA_BUF_COUNT,
        .dma_buf_len          = DMA_BUF_LEN,
        .use_apll             = false,
        .tx_desc_auto_clear   = false,
        .fixed_mclk           = 0
    };
    i2s_pin_config_t pins = {
        .bck_io_num   = I2S_SCK_PIN,
        .ws_io_num    = I2S_WS_PIN,
        .data_out_num = I2S_PIN_NO_CHANGE,
        .data_in_num  = I2S_SD_PIN
    };
    ESP_ERROR_CHECK(i2s_driver_install(I2S_PORT, &cfg, 0, NULL));
    ESP_ERROR_CHECK(i2s_set_pin(I2S_PORT, &pins));
    i2s_start(I2S_PORT);
    Serial.println("[I2S] driver started");
}

// ═══════════════════════════════════════════════════════════════════════════
//  WI-FI
// ═══════════════════════════════════════════════════════════════════════════

void connectWiFi() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.printf("[WiFi] connecting to %s", WIFI_SSID);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 40) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\n[WiFi] connected  IP: %s\n", WiFi.localIP().toString().c_str());
    } else {
        Serial.println("\n[WiFi] failed – restarting");
        ESP.restart();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  TCP CONNECTION
// ═══════════════════════════════════════════════════════════════════════════

bool connectTCP() {
    if (tcpClient.connect(SERVER_IP, SERVER_PORT)) {
        tcpClient.setNoDelay(true);
        Serial.printf("[TCP] connected to %s:%d\n", SERVER_IP, SERVER_PORT);
        return true;
    }
    Serial.println("[TCP] connection failed");
    return false;
}

// ═══════════════════════════════════════════════════════════════════════════
//  I2S HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Reads up to [maxSamples] 16-bit samples from I2S into [buf].
 * Returns the actual number of samples read.
 */
int i2sRead(int16_t* buf, size_t maxSamples) {
    size_t bytesRead = 0;
    i2s_read(I2S_PORT, buf, maxSamples * sizeof(int16_t), &bytesRead, portMAX_DELAY);
    return (int)(bytesRead / sizeof(int16_t));
}

/**
 * Calculates the Root-Mean-Square of [len] 16-bit samples.
 * Returns an integer in the 0–32767 range.
 */
int calcRMS(const int16_t* buf, int len) {
    if (len <= 0) return 0;
    double sum = 0.0;
    for (int i = 0; i < len; i++) {
        sum += (double)buf[i] * buf[i];
    }
    return (int)sqrt(sum / len);
}

// ═══════════════════════════════════════════════════════════════════════════
//  LED / BUZZER HELPERS
// ═══════════════════════════════════════════════════════════════════════════

inline void buzzerOn()  { digitalWrite(PIN_BUZZER, BUZZER_ACTIVE_HIGH ? HIGH : LOW); }
inline void buzzerOff() { digitalWrite(PIN_BUZZER, BUZZER_ACTIVE_HIGH ? LOW  : HIGH); }

void setNormal() {
    digitalWrite(PIN_GREEN_LED, HIGH);
    digitalWrite(PIN_RED_LED,   LOW);
    buzzerOff();
}

void setAlert() {
    digitalWrite(PIN_GREEN_LED, LOW);
    digitalWrite(PIN_RED_LED,   HIGH);
    buzzerOn();
}

// ═══════════════════════════════════════════════════════════════════════════
//  AUDIO RECORDING & TRANSMISSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Records [RECORD_SAMPLES] samples from the INMP441 and sends them to the
 * Android app framed by AUDIO_START / AUDIO_END markers.
 *
 * No delay() used – the blocking comes from i2s_read() which yields to the
 * RTOS scheduler while waiting for DMA data.
 */
void recordAndSendAudio() {
    if (!tcpClient.connected()) return;

    Serial.println("[Audio] recording…");

    // Fill the record buffer
    int totalSamples = 0;
    while (totalSamples < RECORD_SAMPLES) {
        int remaining = RECORD_SAMPLES - totalSamples;
        int toRead    = min(remaining, DMA_BUF_LEN);
        int got       = i2sRead(recordBuf + totalSamples, toRead);
        totalSamples += got;
    }

    Serial.printf("[Audio] %d samples captured – sending…\n", totalSamples);

    // Frame & transmit
    tcpClient.println("AUDIO_START");

    const uint8_t* bytePtr    = reinterpret_cast<const uint8_t*>(recordBuf);
    const int      totalBytes = totalSamples * sizeof(int16_t);
    const int      CHUNK      = 512;

    for (int offset = 0; offset < totalBytes; offset += CHUNK) {
        int chunkSize = min(CHUNK, totalBytes - offset);
        tcpClient.write(bytePtr + offset, chunkSize);
    }

    tcpClient.println("AUDIO_END");
    Serial.println("[Audio] sent");
}

// ═══════════════════════════════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════════════════════════════

void setup() {
    Serial.begin(115200);

    // GPIO
    pinMode(PIN_GREEN_LED, OUTPUT);
    pinMode(PIN_RED_LED,   OUTPUT);
    pinMode(PIN_BUZZER,    OUTPUT);
    setNormal();

    // Allocate recording buffer in PSRAM if available, else heap
    recordBuf = (int16_t*)ps_malloc(RECORD_SAMPLES * sizeof(int16_t));
    if (!recordBuf) {
        recordBuf = (int16_t*)malloc(RECORD_SAMPLES * sizeof(int16_t));
    }
    if (!recordBuf) {
        Serial.println("[ERROR] recordBuf allocation failed!");
        // Reduce recording length if memory is tight – do not crash
    }

    initI2S();
    connectWiFi();
    connectTCP();
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════════

void loop() {
    // ── Reconnect if needed ───────────────────────────────────────────────
    if (!tcpClient.connected()) {
        setNormal();
        Serial.println("[TCP] disconnected – retrying in 2 s");
        delay(2000);
        if (WiFi.status() != WL_CONNECTED) connectWiFi();
        connectTCP();
        return;
    }

    // ── Read one DMA buffer from the microphone ───────────────────────────
    int samplesRead = i2sRead(readBuf, DMA_BUF_LEN);
    if (samplesRead <= 0) return;

    // ── Calculate RMS ─────────────────────────────────────────────────────
    int rms = calcRMS(readBuf, samplesRead);

    // ── Send VALUE to Android (~20 Hz, limited by DMA block time) ─────────
    tcpClient.print("VALUE:");
    tcpClient.println(rms);

    // ── React to sound level ──────────────────────────────────────────────
    if (rms >= ALERT_THRESHOLD) {
        setAlert();

        // Short buzzer pulse (blocking delay only in alert path, not in VALUE loop)
        delay(80);
        buzzerOff();

        // Record & stream 3-second audio clip
        if (recordBuf) {
            recordAndSendAudio();
        }

        setNormal();
    } else {
        setNormal();
    }
}
