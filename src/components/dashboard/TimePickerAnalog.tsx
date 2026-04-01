"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Clock } from "lucide-react";

interface Props {
  initialTime: string; // "HH:mm" in 24h format
  onSave: (time: string) => void;
  onCancel: () => void;
}

export default function TimePickerAnalog({ initialTime, onSave, onCancel }: Props) {
  const [hour, setHour] = useState(parseInt(initialTime.split(":")[0]) % 12 || 12);
  const [minute, setMinute] = useState(parseInt(initialTime.split(":")[1]));
  const [isAm, setIsAm] = useState(parseInt(initialTime.split(":")[0]) < 12);
  const [view, setView] = useState<"hours" | "minutes">("hours");

  const saveTime = () => {
    let h = hour % 12;
    if (!isAm) h += 12;
    const formattedHour = String(h).padStart(2, "0");
    const formattedMin = String(minute).padStart(2, "0");
    onSave(`${formattedHour}:${formattedMin}`);
  };

  const hourAngle = (hour % 12) * 30; // 360 / 12
  const minuteAngle = minute * 6; // 360 / 60

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 z-[110] bg-white rounded-3xl flex flex-col p-6 shadow-2xl border border-slate-100"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black text-[#003366] uppercase tracking-widest italic">Set Schedule Time</h3>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
          <X size={18} />
        </button>
      </div>

      {/* Digital Preview & Toggle */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setView("hours")}
                className={`text-4xl font-black transition-colors ${view === "hours" ? "text-[#00a1e4]" : "text-slate-300 hover:text-slate-400"}`}
            >
                {String(hour).padStart(2, "0")}
            </button>
            <span className="text-4xl font-black text-slate-200">:</span>
            <button 
                onClick={() => setView("minutes")}
                className={`text-4xl font-black transition-colors ${view === "minutes" ? "text-[#00a1e4]" : "text-slate-300 hover:text-slate-400"}`}
            >
                {String(minute).padStart(2, "0")}
            </button>
        </div>
        
        <div className="flex flex-col gap-1">
            <button 
                onClick={() => setIsAm(true)}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${isAm ? "bg-[#003366] text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
            >
                AM
            </button>
            <button 
                onClick={() => setIsAm(false)}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${!isAm ? "bg-[#003366] text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
            >
                PM
            </button>
        </div>
      </div>

      {/* Clock Face Container */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-[200px] h-[200px] rounded-full bg-slate-50 border-4 border-white shadow-inner relative flex items-center justify-center select-none">
            {/* Center dot */}
            <div className="absolute w-2 h-2 rounded-full bg-[#00a1e4] z-20 shadow-sm" />
            
            {/* Hand */}
            <motion.div 
               animate={{ rotate: view === "hours" ? hourAngle : minuteAngle }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               className="absolute top-1/2 left-1/2 w-0.5 h-[90px] bg-[#00a1e4]/30 origin-bottom z-10 -translate-x-1/2 -translate-y-full"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#00a1e4] shadow-lg shadow-blue-500/30 border-2 border-white" />
            </motion.div>

            {/* Content (Hours/Minutes) */}
            <div className="absolute inset-0">
                {view === "hours" ? (
                    Array.from({ length: 12 }).map((_, i) => {
                        const h = i + 1;
                        const angle = h * 30 * (Math.PI / 180) - (Math.PI / 2);
                        const radius = 75;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        const isActive = hour === h;

                        return (
                            <button
                                key={h}
                                type="button"
                                onClick={() => {
                                    setHour(h);
                                    setTimeout(() => setView("minutes"), 300);
                                }}
                                style={{ transform: `translate(calc(100px + ${x}px - 50%), calc(100px + ${y}px - 50%))` }}
                                className={`absolute text-sm font-black transition-all ${isActive ? "text-white z-20" : "text-slate-400 hover:text-[#003366]"} w-8 h-8 flex items-center justify-center`}
                            >
                                {h}
                            </button>
                        );
                    })
                ) : (
                    [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
                        const angle = m * 6 * (Math.PI / 180) - (Math.PI / 2);
                        const radius = 75;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        const isActive = Math.floor(minute / 5) * 5 === m;

                        return (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMinute(m)}
                                style={{ transform: `translate(calc(100px + ${x}px - 50%), calc(100px + ${y}px - 50%))` }}
                                className={`absolute text-[10px] font-black transition-all ${isActive ? "text-white z-20" : "text-slate-400 hover:text-[#003366]"} w-8 h-8 flex items-center justify-center`}
                            >
                                {m}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex gap-3">
        <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
        >
            Cancel
        </button>
        <button 
            type="button"
            onClick={saveTime}
            className="flex-[2] py-3 bg-[#003366] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
            SET TIME <Check size={14} className="text-[#00a1e4]" />
        </button>
      </div>
    </motion.div>
  );
}
