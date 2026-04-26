import { motion } from "motion/react";
import { Shield, Activity, TrendingUp, TrendingDown, Wifi, Clock, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export function Dashboard() {
  const [soundLevel, setSoundLevel] = useState(42);
  const [deviceMode, setDeviceMode] = useState<"iot" | "mobile">("iot");
  const [riskTrend, setRiskTrend] = useState<"increasing" | "decreasing" | "stable">("stable");
  const [todayAlerts, setTodayAlerts] = useState(0);

  // Simulate real-time sound level updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newLevel = Math.floor(Math.random() * (75 - 35) + 35);
      setSoundLevel(newLevel);
      
      // Trigger emergency alert if threshold crossed (simulated)
      if (newLevel > 85 && Math.random() > 0.95) {
        (window as any).triggerEmergencyAlert?.({
          message: "Excessive noise detected at 14:32. Risk level is Critical.",
          time: new Date().toLocaleTimeString(),
          level: "CRITICAL",
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level: number) => {
    if (level < 50) return "#22C55E";
    if (level < 70) return "#3B82F6";
    if (level < 85) return "#F59E0B";
    return "#EF4444";
  };

  const getRiskLabel = (level: number) => {
    if (level < 50) return "Safe";
    if (level < 70) return "Normal";
    if (level < 85) return "Elevated";
    return "Critical";
  };

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[#111827] font-bold text-xl">Acoustic Shield</h1>
            <p className="text-[#6B7280] text-sm">Ultra Monitoring</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
          style={{ boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)" }}
        >
          <Activity className="w-5 h-5 text-[#6B7280]" />
        </motion.button>
      </div>

      {/* Mode Indicator Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-6"
        style={{ boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)" }}
      >
        <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
        <span className="text-[#111827] text-sm font-semibold uppercase tracking-wide">
          {deviceMode === "iot" ? "IoT Mode" : "Mobile Mic Mode"}
        </span>
      </motion.div>

      {/* Main Sound Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[20px] p-8 mb-6 relative overflow-hidden"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            background: [
              `radial-gradient(circle at 50% 50%, ${getRiskColor(soundLevel)} 0%, transparent 70%)`,
              `radial-gradient(circle at 60% 40%, ${getRiskColor(soundLevel)} 0%, transparent 70%)`,
              `radial-gradient(circle at 40% 60%, ${getRiskColor(soundLevel)} 0%, transparent 70%)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <div className="relative z-10">
          <p className="text-[#6B7280] text-sm uppercase tracking-wide mb-2">
            Current Sound Level
          </p>
          
          {/* Big Sound Number with Animated Ring */}
          <div className="flex items-center justify-center my-8 relative">
            {/* Animated Ring */}
            <svg className="absolute w-48 h-48" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#F4F6F8"
                strokeWidth="4"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getRiskColor(soundLevel)}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * soundLevel) / 100}
                transform="rotate(-90 50 50)"
                animate={{
                  strokeDashoffset: 283 - (283 * soundLevel) / 100,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
            
            {/* Sound Level Number */}
            <motion.div
              key={soundLevel}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <span className="text-[#111827] font-bold text-6xl">
                {soundLevel}
              </span>
              <span className="text-[#6B7280] text-2xl ml-2">dB</span>
            </motion.div>
          </div>

          {/* Risk Status */}
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getRiskColor(soundLevel) }}
            />
            <span
              className="font-semibold text-lg"
              style={{ color: getRiskColor(soundLevel) }}
            >
              {getRiskLabel(soundLevel)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Risk Trend Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[20px] p-6 mb-6"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#6B7280] text-sm mb-1">Risk Trend</p>
            <div className="flex items-center gap-2">
              {riskTrend === "increasing" && (
                <>
                  <TrendingUp className="w-5 h-5 text-[#EF4444]" />
                  <span className="text-[#111827] font-semibold">Increasing</span>
                </>
              )}
              {riskTrend === "decreasing" && (
                <>
                  <TrendingDown className="w-5 h-5 text-[#22C55E]" />
                  <span className="text-[#111827] font-semibold">Decreasing</span>
                </>
              )}
              {riskTrend === "stable" && (
                <>
                  <div className="w-5 h-5 flex items-center">
                    <div className="w-full h-0.5 bg-[#3B82F6]" />
                  </div>
                  <span className="text-[#111827] font-semibold">Stable</span>
                </>
              )}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const trends: ("increasing" | "decreasing" | "stable")[] = ["increasing", "decreasing", "stable"];
              const currentIndex = trends.indexOf(riskTrend);
              setRiskTrend(trends[(currentIndex + 1) % trends.length]);
            }}
            className="px-4 py-2 bg-[#F4F6F8] rounded-[18px] text-[#3B82F6] font-semibold text-sm"
          >
            Update
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Status Strip */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[20px] p-4 text-center"
          style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
        >
          <Wifi className="w-6 h-6 text-[#22C55E] mx-auto mb-2" />
          <p className="text-[#6B7280] text-xs mb-1">Device</p>
          <p className="text-[#111827] font-semibold text-sm">Connected</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-[20px] p-4 text-center"
          style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
        >
          <AlertTriangle className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
          <p className="text-[#6B7280] text-xs mb-1">Today</p>
          <p className="text-[#111827] font-semibold text-sm">{todayAlerts} Alerts</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[20px] p-4 text-center"
          style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
        >
          <Clock className="w-6 h-6 text-[#F59E0B] mx-auto mb-2" />
          <p className="text-[#6B7280] text-xs mb-1">Last Data</p>
          <p className="text-[#111827] font-semibold text-sm">2s ago</p>
        </motion.div>
      </div>

      {/* Test Emergency Button (for demo) */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          (window as any).triggerEmergencyAlert?.({
            message: "Fight sound detected at 14:32. Risk level is Critical.",
            time: new Date().toLocaleTimeString(),
            level: "CRITICAL",
          });
        }}
        className="w-full mt-6 bg-[#EF4444] text-white py-4 rounded-[18px] font-semibold"
        style={{ boxShadow: "0 4px 16px rgba(239, 68, 68, 0.2)" }}
      >
        Test Emergency Alert
      </motion.button>
    </div>
  );
}
