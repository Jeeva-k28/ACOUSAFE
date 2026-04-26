import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Smartphone, Wifi, Radio } from "lucide-react";

export function LiveMonitor() {
  const [mode, setMode] = useState<"iot" | "mobile">("iot");
  const [currentLevel, setCurrentLevel] = useState(45);
  const [frequency, setFrequency] = useState(420);
  const [aiClass, setAiClass] = useState("Normal Speech");
  const [confidence, setConfidence] = useState(94);
  const [waveformData, setWaveformData] = useState(
    Array.from({ length: 80 }, () => Math.random() * 0.3 + 0.1)
  );
  const [isReceiving, setIsReceiving] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  // Simulate real-time data updates - slower interval
  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = Math.random() * 40 + 30;
      setCurrentLevel(Math.round(newValue));
      setFrequency(Math.round(Math.random() * 600 + 200));
      setConfidence(Math.round(Math.random() * 20 + 80));

      // Update waveform data - shift left and add new bar at the end
      setWaveformData((prev) => {
        // Remove first element and add new one at the end
        const newData = [...prev.slice(1)];
        // Create amplitude based on current level with more variation
        const baseAmplitude = newValue / 100;
        const randomVariation = Math.random() * 0.4 + 0.3;
        const amplitude = baseAmplitude * randomVariation;
        newData.push(amplitude);
        return newData;
      });

      // Simulate threshold crossing
      if (newValue > 65 && Math.random() > 0.95) {
        setIsReceiving(true);
        setAnalysisStatus("Receiving Audio Clip…");
        
        setTimeout(() => {
          setAnalysisStatus("Analyzing Sound Pattern…");
        }, 1500);
        
        setTimeout(() => {
          setAnalysisStatus("Result Detected");
          setAiClass("Elevated Voices");
        }, 3000);
        
        setTimeout(() => {
          setIsReceiving(false);
          setAnalysisStatus(null);
        }, 4500);
      }
    }, 300); // Slower update: 300ms instead of 100ms

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level: number) => {
    if (level < 50) return "#22C55E";
    if (level < 65) return "#3B82F6";
    if (level < 80) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Top Bar */}
      <div className="mb-6">
        <h1 className="text-[#111827] font-bold text-2xl mb-2">Live Monitor</h1>
        <p className="text-[#6B7280] text-sm">Real-time acoustic threat monitoring</p>
      </div>

      {/* Mode Switch */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] p-2 mb-6 flex gap-2"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode("iot")}
          className={`flex-1 py-3 px-4 rounded-[18px] font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            mode === "iot"
              ? "bg-[#3B82F6] text-white"
              : "bg-transparent text-[#6B7280]"
          }`}
        >
          <Wifi className="w-4 h-4" />
          IoT Mode
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode("mobile")}
          className={`flex-1 py-3 px-4 rounded-[18px] font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            mode === "mobile"
              ? "bg-[#3B82F6] text-white"
              : "bg-transparent text-[#6B7280]"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Mobile Mic
        </motion.button>
      </motion.div>

      {/* Live Graph Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[20px] p-6 mb-6 relative overflow-hidden"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        {/* Danger Aura Glow */}
        {currentLevel > 65 && (
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              background: [
                `radial-gradient(circle at center, ${getRiskColor(currentLevel)} 0%, transparent 70%)`,
                `radial-gradient(circle at center, ${getRiskColor(currentLevel)} 30%, transparent 70%)`,
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#6B7280] text-sm font-semibold uppercase tracking-wide">
              Live Waveform
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#EF4444] rounded-full animate-pulse" />
              <span className="text-[#EF4444] text-sm font-semibold">LIVE</span>
            </div>
          </div>

          {/* Audio Waveform Visualization */}
          <div className="h-48 flex items-center justify-center bg-gradient-to-b from-[#FAFBFC] to-white rounded-[16px] p-4">
            <div className="flex items-center justify-center gap-[2px] h-full w-full">
              {waveformData.map((amplitude, index) => {
                const height = Math.max(2, amplitude * 100);
                const opacity = 0.3 + (index / waveformData.length) * 0.7;
                const isNewest = index === waveformData.length - 1;
                
                return (
                  <motion.div
                    key={`bar-${index}`}
                    className="flex-1 rounded-full"
                    style={{
                      height: `${height}%`,
                      backgroundColor: getRiskColor(currentLevel),
                      opacity,
                      minWidth: "2px",
                    }}
                    // Only animate the newest bar
                    animate={isNewest ? { height: `${height}%` } : undefined}
                    transition={isNewest ? { duration: 0.3, ease: "easeOut" } : undefined}
                  />
                );
              })}
            </div>
          </div>

          {/* Center line reference */}
          <div className="absolute left-6 right-6 top-[50%] h-px bg-[#E5E7EB] opacity-30 pointer-events-none" style={{ marginTop: "calc(1.5rem + 96px)" }} />
        </div>
      </motion.div>

      {/* Analysis Status (when threshold crossed) */}
      {isReceiving && analysisStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-[#3B82F6] text-white rounded-[20px] p-4 mb-6 flex items-center gap-3"
          style={{ boxShadow: "0 8px 30px rgba(59, 130, 246, 0.3)" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Radio className="w-5 h-5" />
          </motion.div>
          <span className="font-semibold">{analysisStatus}</span>
        </motion.div>
      )}

      {/* Graph Data Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[20px] p-6 mb-6"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        <p className="text-[#6B7280] text-sm mb-4 uppercase tracking-wide">Live Metrics</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[#6B7280] text-xs mb-1">Frequency</p>
            <p className="text-[#111827] font-bold text-2xl">{frequency} <span className="text-base text-[#6B7280]">Hz</span></p>
          </div>
          <div>
            <p className="text-[#6B7280] text-xs mb-1">Sound Level</p>
            <p className="text-[#111827] font-bold text-2xl">{currentLevel} <span className="text-base text-[#6B7280]">dB</span></p>
          </div>
          <div>
            <p className="text-[#6B7280] text-xs mb-1">AI Classification</p>
            <p className="text-[#111827] font-semibold text-base">{aiClass}</p>
          </div>
          <div>
            <p className="text-[#6B7280] text-xs mb-1">Confidence</p>
            <p className="text-[#111827] font-bold text-2xl">{confidence}<span className="text-base text-[#6B7280]">%</span></p>
          </div>
        </div>
      </motion.div>

      {/* Auto Baseline Learning Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#FAFBFC] border-2 border-[#3B82F6] border-dashed rounded-[20px] p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Radio className="w-5 h-5 text-white" />
            </motion.div>
          </div>
          <div>
            <p className="text-[#111827] font-semibold">AI Baseline Learning</p>
            <p className="text-[#6B7280] text-sm">Learning environment sound…</p>
          </div>
        </div>
        <div className="w-full bg-white rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-[#3B82F6]"
            initial={{ width: "0%" }}
            animate={{ width: "78%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-[#6B7280] text-xs mt-2">Baseline Established: 78%</p>
      </motion.div>

      {/* Violence Forecast Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-[20px] p-6 mt-6"
        style={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" }}
      >
        <p className="text-[#6B7280] text-sm mb-4 uppercase tracking-wide">Violence Forecast</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#111827] font-semibold mb-1">Next 5 Minutes</p>
            <p className="text-[#22C55E] font-bold text-xl">Low Risk</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center">
            <span className="text-[#22C55E] font-bold text-xl">12%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}