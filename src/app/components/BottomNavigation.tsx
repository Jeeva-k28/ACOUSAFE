import { Link, useLocation } from "react-router";
import { Home, Activity, Bell, History, Settings } from "lucide-react";
import { motion } from "motion/react";

export function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/monitor", icon: Activity, label: "Monitor" },
    { path: "/alerts", icon: Bell, label: "Alerts" },
    { path: "/history", icon: History, label: "History" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-6 px-6 pointer-events-none">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[32px] px-4 py-3 flex gap-2 pointer-events-auto"
        style={{
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`relative px-5 py-3 rounded-[18px] transition-all ${
                  isActive ? "bg-[#3B82F6]" : "hover:bg-[#F4F6F8]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-[18px] bg-[#3B82F6]"
                    style={{
                      boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 ${
                    isActive ? "text-white" : "text-[#6B7280]"
                  }`}
                  strokeWidth={2}
                  fill={isActive ? "currentColor" : "none"}
                />
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}