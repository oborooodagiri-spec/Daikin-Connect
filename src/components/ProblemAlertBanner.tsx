"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getGlobalProblemUnits } from "@/app/actions/units";

export default function ProblemAlertBanner() {
  const [problems, setProblems] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const prevStateRef = useRef<number>(0);
  const router = useRouter();

  const fetchProblems = async () => {
    const res = await getGlobalProblemUnits() as any;
    if (res && "success" in res && res.success && res.data) {
      setProblems(res.data);
      
      // Trigger feedback if new problems appear
      if (res.data.length > prevStateRef.current) {
        triggerFeedback();
      }
      prevStateRef.current = res.data.length;
    }
  };

  const triggerFeedback = () => {
    // 1. Vibration (Mobile)
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // 2. Sound (Modern Alert)
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {
        console.log("Audio playback blocked until user interaction");
    });
  };

  useEffect(() => {
    fetchProblems();
    const interval = setInterval(fetchProblems, 10000); // 10s polling
    return () => clearInterval(interval);
  }, []);

  if (problems.length === 0 || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-[50]"
      >
        <motion.div 
          animate={{ 
            backgroundColor: ["#dc2626", "#991b1b", "#dc2626"],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="w-full py-2 px-4 shadow-lg flex items-center justify-between overflow-hidden"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="bg-white/20 p-1.5 rounded-lg animate-bounce">
              <AlertTriangle size={16} className="text-white" />
            </div>
            
            <div className="flex-1 min-w-0 overflow-hidden relative h-6">
              <motion.div 
                animate={{ x: ["100%", "-100%"] }}
                transition={{ 
                    duration: 20, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
                className="absolute whitespace-nowrap flex items-center gap-8"
              >
                {problems.map((unit, i) => (
                  <button 
                    key={i}
                    onClick={() => router.push(`/dashboard/customers/${unit.projects.customer_id}/projects/${unit.projects.id}/units`)}
                    className="flex items-center gap-2 hover:underline group decoration-white/40"
                  >
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                      [{unit.status}]
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-tighter">
                      UNIT {unit.tag_number} REPORTED PROBLEM IN {unit.projects.name}
                    </span>
                    <ChevronRight size={12} className="text-white/50 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </motion.div>
            </div>
          </div>

          <button 
            onClick={() => setIsVisible(false)}
            className="ml-4 p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
          >
            <X size={16} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
