import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./components/screens/Dashboard";
import { LiveMonitor } from "./components/screens/LiveMonitor";
import { Alerts } from "./components/screens/Alerts";
import { History } from "./components/screens/History";
import { Settings } from "./components/screens/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "monitor", Component: LiveMonitor },
      { path: "alerts", Component: Alerts },
      { path: "history", Component: History },
      { path: "settings", Component: Settings },
    ],
  },
]);
