import { motion } from "motion/react";
import { Smartphone, Wifi, MapPin, Phone, Bell, Volume2, Vibrate, User, Shield } from "lucide-react";
import { useState } from "react";

export function Settings() {
  const [inputMode, setInputMode] = useState<"iot" | "mobile">("iot");
  const [contextMode, setContextMode] = useState<"mall" | "library" | "campus" | "home">("campus");
  const [voiceAlert, setVoiceAlert] = useState(true);
  const [vibration, setVibration] = useState(true);

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Top Bar */}
      <div className="mb-6">
        <h1 className="text-[#111827] font-bold text-2xl mb-2">Settings</h1>
        <p className="text-[#6B7280] text-sm">Configure monitoring preferences</p>
      </div>

      {/* Input Mode Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] p-6 mb-6"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#3B82F6] bg-opacity-10 rounded-full flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-[#111827] font-semibold">Input Mode</p>
            <p className="text-[#6B7280] text-xs">Select audio source</p>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setInputMode("iot")}
            className={`w-full p-4 rounded-[18px] flex items-center justify-between transition-all ${
              inputMode === "iot"
                ? "bg-[#3B82F6] text-white"
                : "bg-[#F4F6F8] text-[#6B7280]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold text-sm">IoT Device Mode</p>
                <p className={`text-xs ${inputMode === "iot" ? "text-white opacity-80" : "text-[#6B7280]"}`}>
                  ESP32 audio monitoring
                </p>
              </div>
            </div>
            {inputMode === "iot" && (
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-[#3B82F6] rounded-full" />
              </div>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setInputMode("mobile")}
            className={`w-full p-4 rounded-[18px] flex items-center justify-between transition-all ${
              inputMode === "mobile"
                ? "bg-[#3B82F6] text-white"
                : "bg-[#F4F6F8] text-[#6B7280]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold text-sm">Mobile Microphone Mode</p>
                <p className={`text-xs ${inputMode === "mobile" ? "text-white opacity-80" : "text-[#6B7280]"}`}>
                  Use device microphone
                </p>
              </div>
            </div>
            {inputMode === "mobile" && (
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-[#3B82F6] rounded-full" />
              </div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Context Detection Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[20px] p-6 mb-6"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#22C55E] bg-opacity-10 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <p className="text-[#111827] font-semibold">Context Mode</p>
            <p className="text-[#6B7280] text-xs">Environment detection profile</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "mall", label: "Mall", icon: "🏬" },
            { value: "library", label: "Library", icon: "📚" },
            { value: "campus", label: "Campus", icon: "🏫" },
            { value: "home", label: "Home", icon: "🏠" },
          ].map((mode) => (
            <motion.button
              key={mode.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setContextMode(mode.value as any)}
              className={`p-4 rounded-[18px] flex flex-col items-center gap-2 transition-all ${
                contextMode === mode.value
                  ? "bg-[#22C55E] text-white"
                  : "bg-[#F4F6F8] text-[#6B7280]"
              }`}
            >
              <span className="text-2xl">{mode.icon}</span>
              <span className="font-semibold text-sm">{mode.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[20px] p-6 mb-6"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#EF4444] bg-opacity-10 rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div>
            <p className="text-[#111827] font-semibold">Emergency Contacts</p>
            <p className="text-[#6B7280] text-xs">Add authority contacts</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-[#F4F6F8] rounded-[18px]">
            <User className="w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Authority Contact Name"
              className="flex-1 bg-transparent text-[#111827] text-sm outline-none placeholder:text-[#6B7280]"
            />
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#F4F6F8] rounded-[18px]">
            <Phone className="w-5 h-5 text-[#6B7280]" />
            <input
              type="tel"
              placeholder="Contact Number"
              className="flex-1 bg-transparent text-[#111827] text-sm outline-none placeholder:text-[#6B7280]"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#EF4444] text-white py-3 rounded-[18px] font-semibold text-sm"
          >
            Save Emergency Contact
          </motion.button>
        </div>

        <div className="mt-4 p-3 bg-[#FEF2F2] rounded-[18px] border-l-4 border-[#EF4444]">
          <p className="text-[#EF4444] text-xs">
            SOS Contact: +1 (555) 911-0000
          </p>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[20px] p-6 mb-6"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#F59E0B] bg-opacity-10 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-[#111827] font-semibold">Notifications</p>
            <p className="text-[#6B7280] text-xs">Alert preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setVoiceAlert(!voiceAlert)}
            className="flex items-center justify-between p-4 bg-[#F4F6F8] rounded-[18px] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-[#6B7280]" />
              <div>
                <p className="text-[#111827] font-semibold text-sm">Voice Alert</p>
                <p className="text-[#6B7280] text-xs">Spoken emergency messages</p>
              </div>
            </div>
            <div
              className={`w-12 h-6 rounded-full transition-all relative ${
                voiceAlert ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"
              }`}
            >
              <motion.div
                layout
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                animate={{
                  left: voiceAlert ? "calc(100% - 20px)" : "4px",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </motion.div>

          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setVibration(!vibration)}
            className="flex items-center justify-between p-4 bg-[#F4F6F8] rounded-[18px] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Vibrate className="w-5 h-5 text-[#6B7280]" />
              <div>
                <p className="text-[#111827] font-semibold text-sm">Vibration</p>
                <p className="text-[#6B7280] text-xs">Haptic feedback alerts</p>
              </div>
            </div>
            <div
              className={`w-12 h-6 rounded-full transition-all relative ${
                vibration ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"
              }`}
            >
              <motion.div
                layout
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                animate={{
                  left: vibration ? "calc(100% - 20px)" : "4px",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#FAFBFC] rounded-[20px] p-6 text-center"
      >
        <div className="w-16 h-16 bg-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <p className="text-[#111827] font-bold text-lg mb-1">Acoustic Shield Ultra</p>
        <p className="text-[#6B7280] text-sm mb-1">Version 1.0.0</p>
        <p className="text-[#6B7280] text-xs">Authority Grade Monitoring</p>
      </motion.div>
    </div>
  );
}
