import { motion } from "motion/react";
import { AlertTriangle, Volume2, Users, Siren } from "lucide-react";

interface Alert {
  id: number;
  soundType: string;
  time: string;
  threatScore: number;
  severity: "low" | "medium" | "high" | "critical";
  icon: typeof AlertTriangle;
}

export function Alerts() {
  const mockAlerts: Alert[] = [
    {
      id: 1,
      soundType: "Fight Detected",
      time: "14:32",
      threatScore: 94,
      severity: "critical",
      icon: Users,
    },
    {
      id: 2,
      soundType: "Elevated Voices",
      time: "13:15",
      threatScore: 78,
      severity: "high",
      icon: Volume2,
    },
    {
      id: 3,
      soundType: "Loud Impact",
      time: "12:48",
      threatScore: 82,
      severity: "high",
      icon: AlertTriangle,
    },
    {
      id: 4,
      soundType: "Alarm Sound",
      time: "11:20",
      threatScore: 65,
      severity: "medium",
      icon: Siren,
    },
    {
      id: 5,
      soundType: "Sudden Noise",
      time: "10:05",
      threatScore: 58,
      severity: "medium",
      icon: Volume2,
    },
    {
      id: 6,
      soundType: "Glass Breaking",
      time: "09:42",
      threatScore: 72,
      severity: "high",
      icon: AlertTriangle,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#EF4444";
      case "high":
        return "#F59E0B";
      case "medium":
        return "#3B82F6";
      case "low":
        return "#22C55E";
      default:
        return "#6B7280";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#FEF2F2";
      case "high":
        return "#FEF3C7";
      case "medium":
        return "#EFF6FF";
      case "low":
        return "#F0FDF4";
      default:
        return "#F9FAFB";
    }
  };

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Top Bar */}
      <div className="mb-6">
        <h1 className="text-[#111827] font-bold text-2xl mb-2">Alerts</h1>
        <p className="text-[#6B7280] text-sm">Recent threat detections</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[20px] p-4"
          style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
        >
          <p className="text-[#6B7280] text-xs mb-1">Today</p>
          <p className="text-[#111827] font-bold text-3xl">6</p>
          <p className="text-[#EF4444] text-xs mt-1">2 Critical</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-[20px] p-4"
          style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
        >
          <p className="text-[#6B7280] text-xs mb-1">This Week</p>
          <p className="text-[#111827] font-bold text-3xl">24</p>
          <p className="text-[#F59E0B] text-xs mt-1">8 High</p>
        </motion.div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {mockAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-[20px] p-4 flex items-center gap-4 cursor-pointer relative overflow-hidden"
            style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
          >
            {/* Severity Color Strip */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: getSeverityColor(alert.severity) }}
            />

            {/* Icon */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: getSeverityBg(alert.severity) }}
            >
              <alert.icon
                className="w-6 h-6"
                style={{ color: getSeverityColor(alert.severity) }}
                strokeWidth={2}
              />
            </div>

            {/* Alert Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[#111827] font-semibold truncate">
                  {alert.soundType}
                </p>
                <span className="text-[#6B7280] text-sm">{alert.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#F4F6F8] rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${alert.threatScore}%` }}
                    transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                    className="h-full"
                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                  />
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: getSeverityColor(alert.severity) }}
                >
                  {alert.threatScore}%
                </span>
              </div>
            </div>

            {/* Severity Badge */}
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: getSeverityBg(alert.severity),
                color: getSeverityColor(alert.severity),
              }}
            >
              {alert.severity}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State (if no alerts) */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <div className="w-24 h-24 bg-[#F4F6F8] rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-[#6B7280]" />
        </div>
        <p className="text-[#111827] font-semibold text-lg mb-2">No Alerts</p>
        <p className="text-[#6B7280] text-sm">All clear! No threats detected.</p>
      </motion.div> */}
    </div>
  );
}
