# ACOUSAFE — Acoustic Shield Ultra

**Authority-grade real-time acoustic threat monitoring — Android + ESP32**

---

## Architecture Overview

```
ESP32 (I2S mic + LEDs + buzzer)
   │  TCP client  →  VALUE:<rms>\n  (continuous, ~20 Hz)
   │              →  AUDIO_START\n + PCM bytes + AUDIO_END\n  (on alert)
   ▼
Android app  (TCP server, port 5000)
   ├─ Dashboard  : live circular arc gauge + level bar
   ├─ History    : list of saved .wav recordings with play/stop
   └─ Connection : device IP, port, ESP32 status, setup guide
```

---

## Android App

### Requirements
| Item | Version |
|------|---------|
| Android SDK compile | 34 |
| Min SDK | 26 (Android 8.0) |
| Kotlin | 1.9.22 |
| Compose BOM | 2024.02.00 |
| Gradle | 8.4 |

### Features
- **TCP server on port 5000** — binds `0.0.0.0`, accepts ESP32 connection, auto-resumes `accept()` after disconnect
- **Real-time VALUE parsing** — no smoothing, no delay, UI updates on every packet (~20×/s)
- **Audio framing** — `AUDIO_START` / `AUDIO_END` binary protocol with sliding-window marker detection
- **PCM → WAV conversion** — 16-bit, 16 kHz, mono WAV header prepended before saving
- **Recordings stored** as `audio_<timestamp>.wav` in app internal storage (`files/recordings/`)
- **MediaPlayer playback** with play/stop toggle per recording
- **Live IP detection** via `NetworkInterface` (not `WifiManager`)
- **Dark authority theme** — deep navy background, cyan primary, green normal, red alert

### Build & Run
```bash
# Generate Gradle wrapper (first time only)
gradle wrapper --gradle-version 8.4

# Build debug APK
./gradlew assembleDebug

# Install to connected device
./gradlew installDebug
```

### Permissions declared in Manifest
- `INTERNET` — TCP server
- `ACCESS_NETWORK_STATE` / `ACCESS_WIFI_STATE` — IP detection
- `CHANGE_WIFI_STATE` — hotspot compatibility

---

## ESP32 Firmware

### Hardware Wiring

| ESP32 GPIO | Component |
|------------|-----------|
| 14 | INMP441 SCK (BCLK) |
| 15 | INMP441 WS  (LRCLK) |
| 32 | INMP441 SD  (Data) |
| 2  | Green LED (normal) |
| 4  | Red LED   (alert) |
| 5  | Buzzer |

INMP441 power: **3.3 V**, GND, L/R pin → GND (left channel).

### Configuration (edit before flashing)
Open `esp32/acousafe_esp32/acousafe_esp32.ino` and set:

```cpp
const char* WIFI_SSID     = "YOUR_HOTSPOT_SSID";
const char* WIFI_PASSWORD = "YOUR_HOTSPOT_PASSWORD";
const char* SERVER_IP     = "192.168.43.1";   // shown in Connection tab of app
```

### Required Arduino Libraries
- **ESP32 Arduino core** ≥ 2.0 (includes `driver/i2s.h` and `WiFi.h`)

### Behaviour
| Condition | Green LED | Red LED | Buzzer | TCP |
|-----------|-----------|---------|--------|-----|
| Normal (RMS < 1500) | ON | OFF | OFF | `VALUE:<rms>` |
| Alert  (RMS ≥ 1500) | OFF | ON | pulse | `VALUE:<rms>` then audio clip |

Alert threshold (`ALERT_THRESHOLD`) and recording duration (`RECORD_SECONDS`) are `#define`d constants at the top of the sketch.

---

## Communication Protocol

```
VALUE:845
VALUE:900
...
AUDIO_START
<48000 bytes of raw 16-bit PCM little-endian at 16 kHz>
AUDIO_END
VALUE:1200
...
```

All text lines are `\r\n` terminated (Arduino `println`). The Android parser handles both `\n` and `\r\n`.

---

## Quick Start

1. **Enable Mobile Hotspot** on your Android device.
2. Edit the firmware constants and flash the ESP32.
3. Install the app on your Android device.
4. Open the **Connection** tab — note the displayed IP.
5. Ensure `SERVER_IP` in the firmware matches that IP, reflash if needed.
6. Once the ESP32 connects, the **Connection** tab shows **CONNECTED** and the **Dashboard** gauge updates in real time.
7. Make a loud noise — the ESP32 triggers a 3-second recording; check the **History** tab to play it back.
