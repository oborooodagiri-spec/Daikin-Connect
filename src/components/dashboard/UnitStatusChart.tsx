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

export default function UnitStatusChart({ data }: { data: any[] }) {
  const chartData = data.map(d => ({
    name: d.status.replace("_", " "),
    value: d.count,
    color: COLORS[d.status] || COLORS.Unknown
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ border: "none", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: "bold" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
        {chartData.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{d.name}</span>
            </div>
            <span className="text-xs font-black text-slate-800">{d.value}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-end">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Health</p>
          <p className="text-lg font-black text-[#003366]">{total} <span className="text-[10px] text-slate-400">UNITS</span></p>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-black text-emerald-500">
            {total > 0 ? Math.round((chartData.find(d => d.name === "Normal")?.value || 0) / total * 100) : 0}%
          </p>
          <p className="text-[9px] font-black text-slate-400 uppercase">NORMAL RATE</p>
        </div>
      </div>
    </div>
  );
}
