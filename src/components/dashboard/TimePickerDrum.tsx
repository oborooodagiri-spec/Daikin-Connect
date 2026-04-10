"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Clock } from "lucide-react";

interface Props {
  initialTime: string; // "HH:mm"
  onSave: (time: string) => void;
  onCancel: () => void;
}

export default function TimePickerDrum({ initialTime, onSave, onCancel }: Props) {
  const [hour, setHour] = useState(parseInt(initialTime.split(":")[0]) || 0);
  const [minute, setMinute] = useState(parseInt(initialTime.split(":")[1]) || 0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    const formattedHour = String(hour).padStart(2, "0");
    const formattedMin = String(minute).padStart(2, "0");
    onSave(`${formattedHour}:${formattedMin}`);
  };

  const DrumColumn = ({ 
    values, 
    selectedValue, 
    onChange 
  }: { 
    values: number[], 
    selectedValue: number, 
    onChange: (val: number) => void 
  }) => {
    return (
      <div className="relative h-60 w-24 overflow-y-auto no-scrollbar snap-y snap-mandatory flex flex-col items-center">
        {/* Padding for center alignment */}
        <div className="h-24 shrink-0" />
        
        {values.map((v) => {
          const isSelected = v === selectedValue;
          return (
            <div 
              key={v}
              onClick={() => onChange(v)}
              className={`h-12 shrink-0 flex items-center justify-center snap-center cursor-pointer transition-all duration-300 w-full
                ${isSelected ? 'text-[#00a1e4] scale-125' : 'text-slate-300 scale-90 opacity-40 hover:opacity-100'}`}
            >
              <span className={`text-2xl font-black font-mono tracking-tighter`}>
                {String(v).padStart(2, '0')}
              </span>
            </div>
          );
        })}
        
        <div className="h-24 shrink-0" />
      </div>
    );
  };

  // Sync scroll on mount/change
  useEffect(() => {
    const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, val: number) => {
      if (ref.current) {
        const itemHeight = 48; // h-12
        ref.current.scrollTop = val * itemHeight;
      }
    };
    scrollTo(hourRef, hour);
    scrollTo(minuteRef, minute);
  }, []);

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, setter: (val: number) => void) => {
    if (ref.current) {
      const itemHeight = 48;
      const index = Math.round(ref.current.scrollTop / itemHeight);
      setter(index);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-[110] bg-white rounded-3xl flex flex-col p-6 shadow-2xl border border-slate-100"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
           <h3 className="text-[10px] font-black text-[#003366] uppercase tracking-[0.3em]">Schedule Timing</h3>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select 24h Format Period</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden shadow-inner my-4">
        {/* Selection Highlight Overlay */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 bg-white shadow-md border-y border-slate-200 pointer-events-none z-0 mx-4 rounded-xl" />
        
        <div className="relative z-10 flex items-center justify-center w-full px-4">
          <div 
            ref={hourRef}
            onScroll={() => handleScroll(hourRef, setHour)}
            className="flex-1 h-60 overflow-y-auto no-scrollbar snap-y snap-mandatory"
          >
            <div className="h-24" />
            {hours.map(h => (
              <div key={h} className="h-12 flex items-center justify-center snap-center">
                <span className={`text-3xl font-black font-mono tracking-tighter transition-colors duration-300 ${hour === h ? 'text-[#003366]' : 'text-slate-200'}`}>
                  {String(h).padStart(2, '0')}
                </span>
              </div>
            ))}
            <div className="h-24" />
          </div>

          <div className="text-3xl font-black text-[#00a1e4] px-4">:</div>

          <div 
            ref={minuteRef}
            onScroll={() => handleScroll(minuteRef, setMinute)}
            className="flex-1 h-60 overflow-y-auto no-scrollbar snap-y snap-mandatory"
          >
            <div className="h-24" />
            {minutes.map(m => (
              <div key={m} className="h-12 flex items-center justify-center snap-center">
                <span className={`text-3xl font-black font-mono tracking-tighter transition-colors duration-300 ${minute === m ? 'text-[#003366]' : 'text-slate-200'}`}>
                  {String(m).padStart(2, '0')}
                </span>
              </div>
            ))}
            <div className="h-24" />
          </div>
        </div>

        {/* Top Fade */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-slate-50/100 to-transparent pointer-events-none" />
        {/* Bottom Fade */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-slate-50/100 to-transparent pointer-events-none" />
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onCancel}
          className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="flex-[2] py-4 bg-[#003366] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          APPLY TIME <Check size={14} className="text-[#00a1e4]" />
        </button>
      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
}
