import { motion } from "motion/react";
import { Calendar, Filter, Volume2, AlertTriangle, Users, Clock } from "lucide-react";
import { useState } from "react";

interface HistoryEvent {
  id: number;
  date: string;
  time: string;
  soundType: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  location: string;
  duration: string;
}

export function History() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const mockHistory: HistoryEvent[] = [
    {
      id: 1,
      date: "Today",
      time: "14:32",
      soundType: "Fight Detected",
      riskLevel: "critical",
      location: "Main Hall",
      duration: "45s",
    },
    {
      id: 2,
      date: "Today",
      time: "13:15",
      soundType: "Elevated Voices",
      riskLevel: "high",
      location: "Cafeteria",
      duration: "2m 18s",
    },
    {
      id: 3,
      date: "Today",
      time: "12:48",
      soundType: "Loud Impact",
      riskLevel: "high",
      location: "Corridor B",
      duration: "12s",
    },
    {
      id: 4,
      date: "Yesterday",
      time: "18:20",
      soundType: "Alarm Sound",
      riskLevel: "medium",
      location: "North Wing",
      duration: "1m 5s",
    },
    {
      id: 5,
      date: "Yesterday",
      time: "15:42",
      soundType: "Sudden Noise",
      riskLevel: "medium",
      location: "Parking Lot",
      duration: "8s",
    },
    {
      id: 6,
      date: "Feb 10",
      time: "11:15",
      soundType: "Glass Breaking",
      riskLevel: "high",
      location: "Storage Room",
      duration: "3s",
    },
    {
      id: 7,
      date: "Feb 10",
      time: "09:30",
      soundType: "Normal Activity",
      riskLevel: "low",
      location: "Reception",
      duration: "N/A",
    },
    {
      id: 8,
      date: "Feb 09",
      time: "16:45",
      soundType: "Elevated Voices",
      riskLevel: "medium",
      location: "Conference Room",
      duration: "5m 12s",
    },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
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

  const getRiskBg = (level: string) => {
    switch (level) {
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

  const getIcon = (soundType: string) => {
    if (soundType.includes("Fight")) return Users;
    if (soundType.includes("Voice")) return Volume2;
    return AlertTriangle;
  };

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Top Bar */}
      <div className="mb-6">
        <h1 className="text-[#111827] font-bold text-2xl mb-2">History</h1>
        <p className="text-[#6B7280] text-sm">Review past threat events</p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] p-4 mb-6"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[#6B7280]" />
          <p className="text-[#6B7280] text-sm font-semibold">Filters</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "today", "week", "critical", "high"].map((filter) => (
            <motion.button
              key={filter}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-[18px] text-sm font-semibold whitespace-nowrap transition-all ${
                selectedFilter === filter
                  ? "bg-[#3B82F6] text-white"
                  : "bg-[#F4F6F8] text-[#6B7280]"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="space-y-6">
        {mockHistory.reduce((acc, event, index) => {
          const showDateHeader = index === 0 || event.date !== mockHistory[index - 1].date;
          
          return [
            ...acc,
            ...(showDateHeader
              ? [
                  <motion.div
                    key={`header-${event.date}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-3 mt-2"
                  >
                    <Calendar className="w-4 h-4 text-[#6B7280]" />
                    <p className="text-[#111827] font-semibold">{event.date}</p>
                    <div className="flex-1 h-px bg-[#E5E7EB]" />
                  </motion.div>,
                ]
              : []),
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 + 0.1 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-[20px] p-4 relative overflow-hidden cursor-pointer"
              style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
            >
              {/* Risk Level Indicator */}
              <div
                className="absolute top-0 right-0 w-20 h-20 opacity-10"
                style={{
                  background: `radial-gradient(circle at top right, ${getRiskColor(event.riskLevel)} 0%, transparent 70%)`,
                }}
              />

              <div className="flex items-start gap-4">
                {/* Time Badge */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <Clock className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-[#6B7280] text-xs font-semibold">
                    {event.time}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = getIcon(event.soundType);
                        return (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: getRiskBg(event.riskLevel) }}
                          >
                            <Icon
                              className="w-4 h-4"
                              style={{ color: getRiskColor(event.riskLevel) }}
                            />
                          </div>
                        );
                      })()}
                      <div>
                        <p className="text-[#111827] font-semibold text-sm">
                          {event.soundType}
                        </p>
                        <p className="text-[#6B7280] text-xs">{event.location}</p>
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                      style={{
                        backgroundColor: getRiskBg(event.riskLevel),
                        color: getRiskColor(event.riskLevel),
                      }}
                    >
                      {event.riskLevel}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                    <span>Duration: {event.duration}</span>
                  </div>
                </div>
              </div>
            </motion.div>,
          ];
        }, [] as JSX.Element[])}
      </div>

      {/* Load More Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 bg-white text-[#3B82F6] py-4 rounded-[18px] font-semibold"
        style={{ boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)" }}
      >
        Load More
      </motion.button>
    </div>
  );
}
