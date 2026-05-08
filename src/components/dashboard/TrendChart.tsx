"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TrendChart({ data, enabledForms = [] }: { data: any[], enabledForms?: string[] }) {
  const isEnabled = (type: string) => enabledForms.map(f => f.toLowerCase()).includes(type.toLowerCase());

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAudit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0073ea" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#0073ea" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c875" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#00c875" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCorr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e44258" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#e44258" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a25ddc" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#a25ddc" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorComplaint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9f1a" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#ff9f1a" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#676879", fontSize: 10, fontWeight: 700 }}
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#676879", fontSize: 10, fontWeight: 700 }}
            width={60}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#323338", borderRadius: "12px", border: "none", color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
            itemStyle={{ color: "#fff", fontSize: 11, fontWeight: 600, padding: "2px 0" }}
            labelStyle={{ color: "#c3c6d4", fontSize: 11, fontWeight: 800, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}
          />
          {isEnabled("Audit") && (
            <Area type="monotone" dataKey="audit" stroke="#0073ea" strokeWidth={3} fillOpacity={1} fill="url(#colorAudit)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
          )}
          {isEnabled("Preventive") && (
            <Area type="monotone" dataKey="preventive" stroke="#00c875" strokeWidth={3} fillOpacity={1} fill="url(#colorPrev)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
          )}
          {isEnabled("Corrective") && (
            <Area type="monotone" dataKey="corrective" stroke="#e44258" strokeWidth={3} fillOpacity={1} fill="url(#colorCorr)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
          )}
          {isEnabled("DailyLog") && (
            <Area type="monotone" dataKey="dailyLog" stroke="#a25ddc" strokeWidth={3} fillOpacity={1} fill="url(#colorDaily)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
          )}
          {isEnabled("complaint") && (
            <Area type="monotone" dataKey="complaint" name="Complaint" stroke="#ff9f1a" strokeWidth={3} fillOpacity={1} fill="url(#colorComplaint)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>

  );
}
