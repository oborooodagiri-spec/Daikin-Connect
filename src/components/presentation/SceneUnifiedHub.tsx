"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Cpu, Zap, Activity, Radio } from "lucide-react";

interface SceneUnifiedHubProps {
  mode: "reveal" | "intelligence";
  isVisible: boolean;
}

export function SceneUnifiedHub({ mode, isVisible }: SceneUnifiedHubProps) {
  const textVariant = {
    hidden: { opacity: 0, y: 50, filter: "blur(20px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: "easeOut", staggerChildren: 0.15, delay: 0.2 } as any
    },
    exit: { opacity: 0, y: -50, filter: "blur(20px)", transition: { duration: 0.5 } as any }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-12">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div 
             key={`${mode}-content`}
             initial="hidden"
             animate="visible"
             exit="exit"
             variants={textVariant}
             className="z-10 text-center space-y-12 max-w-5xl"
          >
            {mode === "reveal" ? (
              <div className="space-y-12">
                <motion.div 
                   variants={textVariant}
                   className="p-8 bg-blue-500/10 border border-blue-500/30 rounded-full inline-block"
                >
                   <Globe size={64} className="text-blue-400 animate-[spin_10s_linear_infinite]" />
                </motion.div>
                <div className="space-y-6">
                   <motion.h2 
                     variants={textVariant}
                     className="text-6xl md:text-8xl font-black italic uppercase"
                   >
                     Welcome to the <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">Center.</span>
                   </motion.h2>
                   <motion.p 
                     variants={textVariant}
                     className="text-slate-400 text-2xl font-light tracking-wide max-w-3xl mx-auto"
                   >
                     Introducing Daikin Connect. One Ecosystem. Absolute Control.
                   </motion.p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center text-left">
                 <div className="space-y-8">
                    <motion.div 
                      variants={textVariant}
                      className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest"
                    >
                       <Cpu size={14} /> Neural Infrastructure
                    </motion.div>
                    <motion.h2 
                      variants={textVariant}
                      className="text-6xl font-black leading-tight uppercase"
                    >
                      Autonomous <span className="text-blue-500">Intelligence.</span>
                    </motion.h2>
                    <motion.p 
                      variants={textVariant}
                      className="text-slate-400 text-xl font-medium leading-relaxed"
                    >
                       Advanced ML-driven diagnostics identify anomalies before they impact operations. Predict, prevent, and perform.
                    </motion.p>
                    <div className="flex gap-4">
                      <motion.div 
                         variants={textVariant}
                         className="p-4 bg-white/5 border border-white/10 rounded-2xl"
                      >
                         <Activity className="text-blue-400 mb-2" />
                         <p className="text-[8px] font-black uppercase text-slate-500">Uptime</p>
                         <p className="text-xl font-bold">99.9%</p>
                      </motion.div>
                      <motion.div 
                         variants={textVariant}
                         className="p-4 bg-white/5 border border-white/10 rounded-2xl"
                      >
                         <Zap className="text-emerald-400 mb-2" />
                         <p className="text-[8px] font-black uppercase text-slate-500">Efficiency</p>
                         <p className="text-xl font-bold">+32%</p>
                      </motion.div>
                    </div>
                 </div>

                 <motion.div variants={textVariant} className="relative">
                    <div className="relative w-80 h-80 mx-auto">
                       <div className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] animate-pulse" />
                          <Radio size={48} className="text-blue-400 relative z-10" />
                       </div>
                    </div>
                 </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
