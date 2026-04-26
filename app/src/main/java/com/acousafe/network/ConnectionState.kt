package com.acousafe.network

/**
 * Represents the three possible states of the ESP32 → Android connection.
 */
enum class ConnectionState {
    WAITING,       // Server is up, waiting for ESP32 to connect
    CONNECTED,     // ESP32 is actively connected
    DISCONNECTED   // Connection was established but dropped
}
