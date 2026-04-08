"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TrendChart({ data }: { data: any[] }) {
  // Sample styling and formatting inside the chart
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAudit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00A0E9" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00A0E9" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00B06B" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00B06B" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1e293b", borderRadius: "8px", border: "none", color: "#fff" }}
            itemStyle={{ color: "#fff", fontSize: 12, fontWeight: 600 }}
            labelStyle={{ color: "#94a3b8", fontSize: 12, fontWeight: 800, marginBottom: "4px" }}
          />
          <Area type="monotone" dataKey="audit" stroke="#00A0E9" strokeWidth={3} fillOpacity={1} fill="url(#colorAudit)" activeDot={{ r: 6 }} />
          <Area type="monotone" dataKey="preventive" stroke="#00B06B" strokeWidth={3} fillOpacity={1} fill="url(#colorPrev)" activeDot={{ r: 6 }} />
          <Area type="monotone" dataKey="corrective" stroke="#F39C12" strokeWidth={3} fillOpacity={1} fill="url(#colorCorr)" activeDot={{ r: 6 }} />
          <Area type="monotone" dataKey="dailyLog" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDaily)" activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
