package com.acousafe.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.acousafe.ui.MainViewModel
import com.acousafe.ui.screens.ConnectionScreen
import com.acousafe.ui.screens.DashboardScreen
import com.acousafe.ui.screens.HistoryScreen

// ---------------------------------------------------------------------------
// Screen descriptors
// ---------------------------------------------------------------------------

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Dashboard  : Screen("dashboard",  "Dashboard",   Icons.Default.GraphicEq)
    object History    : Screen("history",    "History",     Icons.Default.History)
    object Connection : Screen("connection", "Connection",  Icons.Default.Wifi)
}

private val SCREENS = listOf(Screen.Dashboard, Screen.History, Screen.Connection)

// ---------------------------------------------------------------------------
// Navigation host
// ---------------------------------------------------------------------------

@Composable
fun AppNavigation(viewModel: MainViewModel) {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            NavigationBar {
                val backStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute   = backStackEntry?.destination?.route

                SCREENS.forEach { screen ->
                    NavigationBarItem(
                        selected = currentRoute == screen.route,
                        onClick  = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.startDestinationId)
                                launchSingleTop = true
                            }
                        },
                        icon  = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController        = navController,
            startDestination     = Screen.Dashboard.route,
            modifier             = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route)  { DashboardScreen(viewModel) }
            composable(Screen.History.route)    { HistoryScreen(viewModel) }
            composable(Screen.Connection.route) { ConnectionScreen(viewModel) }
        }
    }
}
