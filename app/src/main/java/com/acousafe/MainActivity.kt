package com.acousafe

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.acousafe.ui.MainViewModel
import com.acousafe.ui.navigation.AppNavigation
import com.acousafe.ui.theme.AcousafeTheme

/**
 * Single-activity entry point.
 *
 * Sets up the Compose theme, creates the shared [MainViewModel] (which starts the
 * TCP server and IP detection on creation), then hands off to [AppNavigation].
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AcousafeTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color    = MaterialTheme.colorScheme.background
                ) {
                    val viewModel: MainViewModel = viewModel()
                    AppNavigation(viewModel)
                }
            }
        }
    }
}
