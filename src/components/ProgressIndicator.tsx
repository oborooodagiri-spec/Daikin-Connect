"use client";

import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  percentage: number;
  label?: string;
  subLabel?: string;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "emerald" | "indigo" | "rose" | "amber";
}

export default function ProgressIndicator({ 
  percentage, 
  label, 
  subLabel, 
  size = "md", 
  color = "blue" 
}: ProgressIndicatorProps) {
  const colorMap = {
    blue: "from-[#00a1e4] to-blue-600 shadow-blue-200 bg-blue-100",
    emerald: "from-emerald-400 to-emerald-600 shadow-emerald-200 bg-emerald-100",
    indigo: "from-indigo-400 to-indigo-600 shadow-indigo-200 bg-indigo-100",
    rose: "from-rose-400 to-rose-600 shadow-rose-200 bg-rose-100",
    amber: "from-amber-400 to-amber-600 shadow-amber-200 bg-amber-100",
  };

  const ringColorMap = {
    blue: "text-[#00a1e4]",
    emerald: "text-emerald-500",
    indigo: "text-indigo-500",
    rose: "text-rose-500",
    amber: "text-amber-500",
  };

  if (size === "sm") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
          <span className="text-[10px] font-black text-slate-600">{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${colorMap[color].split(' shadow-')[0]}`}
          />
        </div>
      </div>
    );
  }

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Background Ring */}
        <svg className="w-full h-full -rotate-90 transform">
          <circle
            cx="48" cy="48" r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          {/* Progress Ring */}
          <motion.circle
            cx="48" cy="48" r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className={ringColorMap[color]}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-800 tracking-tighter leading-none">{percentage}%</span>
          {subLabel && <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">{subLabel}</span>}
        </div>
      </div>
      {label && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>}
    </div>
  );
}
