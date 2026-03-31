"use client";

import React from "react";
import { ClipboardCheck, Wrench, AlertTriangle, Clock, MapPin } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  engineer: string;
  unit_tag: string;
  location: string;
  at: string;
}

const TYPE_STYLES: Record<string, { icon: any; color: string; bg: string }> = {
  Audit: { icon: ClipboardCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  Preventive: { icon: Wrench, color: "text-indigo-600", bg: "bg-indigo-50" },
  Corrective: { icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
};

export default function ActivityFeed({ 
  activities,
  onItemClick 
}: { 
  activities: Activity[];
  onItemClick?: (unitTag: string) => void;
}) {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-300">
        <Clock size={40} className="mb-4 opacity-20" />
        <p className="text-xs font-black uppercase tracking-widest">No recent field activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((act) => {
        const style = TYPE_STYLES[act.type] || TYPE_STYLES.Audit;
        const Icon = style.icon;
        
        return (
          <div 
            key={act.id} 
            onClick={() => onItemClick?.(act.unit_tag)}
            className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${style.bg} border border-slate-100`}>
              <Icon className={`w-6 h-6 ${style.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <p className="text-[11px] font-black text-slate-800 tracking-tight leading-none">
                  {act.engineer} <span className="text-slate-400 font-bold uppercase text-[9px]">Submitted a {act.type} Report</span>
                </p>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                  {new Date(act.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm font-black text-[#003366] mb-1 truncate">{act.unit_tag}</p>
              <div className="flex items-center gap-1">
                <MapPin size={10} className="text-[#00a1e4]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">{act.location}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
