import { Outlet } from "react-router";
import { BottomNavigation } from "./BottomNavigation";
import { EmergencyAlertOverlay } from "./EmergencyAlertOverlay";
import { useState, useEffect } from "react";

export function RootLayout() {
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [alertData, setAlertData] = useState<{
    message: string;
    time: string;
    level: string;
  } | null>(null);

  // Global emergency alert trigger function
  useEffect(() => {
    // Make trigger function available globally
    (window as any).triggerEmergencyAlert = (data: { message: string; time: string; level: string }) => {
      setAlertData(data);
      setShowEmergencyAlert(true);
    };

    return () => {
      delete (window as any).triggerEmergencyAlert;
    };
  }, []);

  return (
    <div className="h-screen w-full bg-[#F4F6F8] flex flex-col overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Main content area with bottom padding for nav */}
      <div className="flex-1 overflow-auto pb-24">
        <Outlet />
      </div>

      {/* Floating Bottom Navigation */}
      <BottomNavigation />

      {/* Emergency Alert Overlay */}
      <EmergencyAlertOverlay
        isOpen={showEmergencyAlert}
        onClose={() => setShowEmergencyAlert(false)}
        alertData={alertData}
      />
    </div>
  );
}
