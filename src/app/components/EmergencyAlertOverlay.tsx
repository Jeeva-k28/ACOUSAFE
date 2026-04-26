import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X, Phone } from "lucide-react";
import { useEffect, useRef } from "react";

interface EmergencyAlertOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  alertData: {
    message: string;
    time: string;
    level: string;
  } | null;
}

export function EmergencyAlertOverlay({
  isOpen,
  onClose,
  alertData,
}: EmergencyAlertOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Haptic feedback simulation
      if (navigator.vibrate) {
        // Continuous vibration pattern
        const vibrateInterval = setInterval(() => {
          navigator.vibrate([200, 100, 200]);
        }, 600);

        return () => clearInterval(vibrateInterval);
      }

      // Voice alert (using Web Speech API if available)
      if ('speechSynthesis' in window && alertData) {
        const utterance = new SpeechSynthesisUtterance(
          `Emergency Alert. ${alertData.message}`
        );
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [isOpen, alertData]);

  if (!alertData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Animated Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Pulsing Red Glow Background */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, transparent 70%)",
                  "radial-gradient(circle at center, rgba(239, 68, 68, 0.4) 0%, transparent 70%)",
                  "radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, transparent 70%)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Alert Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md bg-white rounded-[26px] p-6"
              style={{
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
              }}
            >
              {/* Alert Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, -5, 5, -5, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                    className="w-12 h-12 rounded-full bg-[#EF4444] flex items-center justify-center"
                  >
                    <AlertTriangle className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <div>
                    <h3 className="text-[#111827] font-bold text-lg">
                      EMERGENCY ALERT
                    </h3>
                    <p className="text-[#6B7280] text-sm">
                      {alertData.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alert Message */}
              <div className="mb-6 p-4 bg-[#FEF2F2] rounded-[20px] border-l-4 border-[#EF4444]">
                <p className="text-[#111827] text-base leading-relaxed">
                  {alertData.message}
                </p>
              </div>

              {/* Threat Level Badge */}
              <div className="mb-6 flex items-center justify-center">
                <div className="px-4 py-2 bg-[#EF4444] rounded-full">
                  <p className="text-white font-semibold text-sm uppercase tracking-wide">
                    Risk Level: {alertData.level}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full bg-[#3B82F6] text-white py-4 rounded-[18px] font-semibold text-base"
                  style={{
                    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  ACKNOWLEDGE
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Trigger emergency action
                    alert("Emergency services contacted");
                    onClose();
                  }}
                  className="w-full bg-[#EF4444] text-white py-4 rounded-[18px] font-semibold text-base flex items-center justify-center gap-2"
                  style={{
                    boxShadow: "0 4px 16px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  <Phone className="w-5 h-5" />
                  EMERGENCY ACTION
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
