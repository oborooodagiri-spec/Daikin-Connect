"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SceneProps {
  isVisible: boolean;
}

export function SceneHero({ isVisible }: SceneProps) {
  const textVariant = {
    hidden: { opacity: 0, scale: 0.9, filter: "blur(20px)" },
    visible: { 
      opacity: 1, 
      scale: 1, 
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: "easeOut", staggerChildren: 0.2, delay: 0.2 } as any
    },
    exit: { opacity: 0, scale: 1.1, filter: "blur(20px)", transition: { duration: 0.5 } as any }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div 
             key="hero-content"
             initial="hidden"
             animate="visible"
             exit="exit"
             variants={textVariant}
             className="flex flex-col items-center text-center space-y-12"
          >
            <motion.div variants={textVariant} className="reveal-item">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="p-6 rounded-full bg-blue-500/10 border border-blue-500/20"
              >
                <Sparkles size={48} className="text-blue-400 shadow-glow-blue" />
              </motion.div>
            </motion.div>

            <div className="space-y-6">
              <motion.h1 
                variants={textVariant}
                className="text-7xl md:text-9xl font-black italic tracking-tight leading-none uppercase"
              >
                THE <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">BLUEPRINT</span>
              </motion.h1>
              <motion.p 
                variants={textVariant}
                className="text-xs md:text-sm font-black uppercase tracking-[1.5em] text-slate-500"
              >
                Executive Strategic Showcase 2026
              </motion.p>
            </div>

            <motion.div variants={textVariant} className="max-w-2xl px-6">
              <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                The Definitive Vision for Autonomous HVAC Fleet Management and Operational Intelligence.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
