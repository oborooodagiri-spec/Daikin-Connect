"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Database, Activity, LayoutGrid } from "lucide-react";

interface SceneProps {
  isVisible: boolean;
}

export function SceneDataChaos({ isVisible }: SceneProps) {
  const textVariant = {
    hidden: { opacity: 0, scale: 1.2, filter: "blur(20px)" },
    visible: { 
      opacity: 1, 
      scale: 1, 
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: "easeOut", staggerChildren: 0.15, delay: 0.2 } as any
    },
    exit: { opacity: 0, scale: 0.8, filter: "blur(20px)", transition: { duration: 0.5 } as any }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-12">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div 
             key="chaos-content"
             initial="hidden"
             animate="visible"
             exit="exit"
             variants={textVariant}
             className="relative z-10 text-center space-y-12 max-w-4xl"
          >
            <motion.div variants={textVariant} className="flex justify-center">
               <AlertTriangle size={64} className="text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]" />
            </motion.div>
            
            <div className="space-y-6">
               <motion.h2 
                 variants={textVariant}
                 className="text-5xl md:text-7xl font-black leading-tight uppercase"
               >
                 The Invisible <span className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">Crisis.</span>
               </motion.h2>
               <motion.p 
                 variants={textVariant}
                 className="text-slate-400 text-xl font-medium max-w-2xl mx-auto"
               >
                 90% of operational inefficiencies are hidden beneath fragmented data silos and manual tracking.
               </motion.p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                  { icon: <Database />, label: "Data Silos" },
                  { icon: <Activity />, label: "Reactive Fixes" },
                  { icon: <LayoutGrid />, label: "Manual Reports" },
                  { icon: <AlertTriangle />, label: "Sudden Failure" }
               ].map((item, i) => (
                 <motion.div 
                   key={i} 
                   variants={textVariant}
                   className="p-6 border border-white/10 rounded-2xl bg-white/5 space-y-4 hover:border-red-500/30 transition-colors"
                 >
                    <div className="text-red-400">{item.icon}</div>
                    <p className="text-[10px] font-black uppercase text-slate-500">{item.label}</p>
                 </motion.div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
