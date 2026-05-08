"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { EplLogo } from "../EplLogo";

interface VesPhaseWrapperProps {
  isVisible: boolean;
  phaseNumber: number;
  title: string;
  subtitle: string;
  description: string;
  roles: { name: string; icon: LucideIcon; color: string }[];
  pic?: string; // Added Penanggung Jawab name
  children?: React.ReactNode;
}

export function VesPhaseWrapper({
  isVisible,
  phaseNumber,
  title,
  subtitle,
  description,
  roles,
  pic = "",
  children,
}: VesPhaseWrapperProps) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 md:pt-40 md:pb-24 md:px-24 overflow-hidden">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center px-12"
          >
            {/* Text Content */}
            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-2xl shadow-2xl">
                  {phaseNumber}
                </div>
                <div className="flex flex-col">
                   <span className="text-slate-400 font-black tracking-[0.3em] uppercase text-[10px]">
                     Section Matrix
                   </span>
                   <span className="text-slate-600 font-bold tracking-wide text-sm uppercase">
                     {subtitle}
                   </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] drop-shadow-sm"
              >
                {title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl font-medium"
              >
                {description}
              </motion.p>

              {/* Roles Involved */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-10 border-t border-white/5"
              >
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                  <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">
                    Koordinasi & Penanggung Jawab
                  </h3>
                  <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">PIC: {pic}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {roles.map((role, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 shadow-sm hover:bg-slate-900 transition-colors group cursor-default">
                      <div className={`p-1.5 rounded-lg bg-white/10 group-hover:scale-110 transition-transform ${role.color}`}>
                        <role.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-white tracking-wide uppercase">{role.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Visual Element / Children */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square flex items-center justify-center"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-blue-600/5 blur-[160px] rounded-full animate-pulse" />
              
              {/* Main Visual Content */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
