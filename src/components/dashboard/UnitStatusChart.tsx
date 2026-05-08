"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS: Record<string, string> = {
  Normal: "#00B06B",
  Problem: "#EF4444",
  Warning: "#F59E0B",
  Critical: "#B91C1C",
  Pending: "#94A3B8",
  On_Progress: "#3B82F6",
  Unknown: "#E2E8F0"
};

export default function UnitStatusChart({ data, focus = 'UNIT' }: { data: any[], focus?: string }) {
  const chartData = data.map(d => ({
    name: d.status.replace("_", " "),
    value: d.count,
    color: COLORS[d.status] || COLORS.Unknown
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const normalCount = chartData.find(d => d.name === "Normal")?.value || 0;
  const normalRate = total > 0 ? Math.round((normalCount / total) * 100) : 0;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[220px] relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className={`text-2xl font-black ${normalRate > 80 ? 'text-emerald-500' : normalRate > 50 ? 'text-amber-500' : 'text-rose-500'}`}>{normalRate}%</span>
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Health Rate</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={5}
              dataKey="value"
              animationBegin={0}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ border: "none", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", fontSize: "11px", fontWeight: "black", textTransform: "uppercase" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6">
        {chartData.map((d, i) => (
          <div key={i} className="flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: d.color }}></div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-tight group-hover:text-slate-800 transition-colors">{d.name}</span>
            </div>
            <span className="text-xs font-black text-slate-800">{d.value}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-end">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Global Assets</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-[#003366] leading-none">{total}</p>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{focus === 'ROOM' ? 'ROOMS' : 'UNITS'}</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
           <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${normalRate > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {normalRate > 80 ? 'OPTIMAL' : 'MONITORING'}
           </div>
        </div>
      </div>
    </div>
  );
}
