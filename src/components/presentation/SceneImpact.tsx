"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, BarChart3, Wind, ShieldCheck } from "lucide-react";

interface SceneProps {
  isVisible: boolean;
}

export function SceneImpact({ isVisible }: SceneProps) {
  const textVariant = {
    hidden: { opacity: 0, x: -50, filter: "blur(20px)" },
    visible: { 
      opacity: 1, 
      x: 0, 
      filter: "blur(0px)",
      transition: { duration: 1, ease: "easeOut" as const, staggerChildren: 0.15, delay: 0.2 } 
    },
    exit: { opacity: 0, x: 50, filter: "blur(20px)", transition: { duration: 0.5 } }
  };

  const cardVariant = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 1, ease: "backOut" as const, delay: 0.4 } },
    exit: { scale: 1.1, opacity: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-12">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div 
             key="impact-content"
             initial="hidden"
             animate="visible"
             exit="exit"
             variants={textVariant}
             className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center overflow-hidden"
          >
            <div className="space-y-10">
               <div className="space-y-4">
                  <motion.h2 variants={textVariant} className="text-6xl font-black uppercase leading-none">
                    Impact <span className="text-blue-500">at Scale.</span>
                  </motion.h2>
                  <motion.p variants={textVariant} className="text-slate-400 text-xl font-medium">
                    Maximize ROI while minimizing your environmental footprint.
                  </motion.p>
               </div>

               <div className="space-y-6">
                  {[
                    { label: "Energy Consumption", val: "-18%", icon: <Wind className="text-emerald-400" /> },
                    { label: "Maintenance Costs", val: "-22%", icon: <TrendingUp className="text-emerald-400" /> },
                    { label: "Unit Longevity", val: "+35%", icon: <ShieldCheck className="text-blue-400" /> }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      variants={textVariant}
                      className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl"
                    >
                       <div className="p-4 bg-white/5 rounded-2xl">{stat.icon}</div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
                          <p className="text-3xl font-black italic">{stat.val}</p>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            <motion.div variants={cardVariant} className="relative">
               <div className="bg-gradient-to-br from-blue-500/20 to-emerald-500/20 p-12 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
                  <BarChart3 size={200} className="text-blue-400 opacity-20 absolute -bottom-10 -right-10 rotate-12" />
                  <div className="relative z-10 space-y-8">
                     <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Executive Summary</p>
                        <p className="text-4xl font-black italic">OPTIMIZED</p>
                     </div>
                     <div className="w-full h-[1px] bg-white/10" />
                     <p className="text-slate-400 leading-relaxed font-medium">
                        The cumulative effect of intelligent monitoring leads to exponential gains in operational stability and cost reduction.
                     </p>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
