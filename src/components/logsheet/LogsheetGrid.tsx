"use client";

import React, { useState } from "react";
import { Plus, Edit2, User, Clock, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import LogsheetEntryModal from "./LogsheetEntryModal";
import { LOGSHEET_CONFIGS } from "@/lib/logsheet-config";

interface LogsheetGridProps {
  template: any;
  date: Date;
  entries: any[];
  onEntrySubmit: () => void;
  session: any;
}

export default function LogsheetGrid({ template, date, entries, onEntrySubmit, session }: LogsheetGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const config = LOGSHEET_CONFIGS[template.type];
  if (!config) return <div>Invalid Template Type</div>;

  const timeSlots = template.time_slots ? template.time_slots.split(",") : config.defaultTimeSlots;
  const designValues = template.design_json ? JSON.parse(template.design_json) : {};

  // Map entries by time for easy access
  const entryMap = entries.reduce((acc: Record<string, any>, entry: any) => {
    const values = entry.values_json ? JSON.parse(entry.values_json) : {};
    acc[entry.log_time] = { ...entry, values };
    return acc;
  }, {});

  const handleCellClick = (time: string) => {
    const existing = entryMap[time];
    if (existing) {
      setEditingEntry(existing);
    } else {
      setSelectedSlot(time);
    }
  };

  const isAbnormal = (key: string, value: any) => {
    const design = designValues[key];
    if (design === undefined || value === undefined || value === null || value === "") return false;
    
    const numValue = parseFloat(value);
    const numDesign = parseFloat(design);
    
    if (isNaN(numValue) || isNaN(numDesign)) return false;
    
    // Simple 10% tolerance check for numbers (can be refined per param in config)
    const tolerance = numDesign * 0.15;
    return Math.abs(numValue - numDesign) > tolerance;
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse text-left min-w-[1000px]">
          <thead>
            {/* Main Header */}
            <tr className="bg-[#003366] text-white">
              <th className="p-6 border-r border-[#ffffff10] min-w-[250px] first:rounded-tl-[2.5rem]">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-[#00a1e4]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Parameter Monitoring</span>
                </div>
              </th>
              <th className="p-6 border-r border-[#ffffff10] w-[100px] text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Unit</span>
              </th>
              <th className="p-6 border-r border-[#ffffff10] w-[100px] text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00a1e4]">Design</span>
              </th>
              {timeSlots.map((time: string, idx: number) => (
                <th 
                  key={time} 
                  className={`p-6 border-r border-[#ffffff10] min-w-[140px] text-center last:rounded-tr-[2.5rem] cursor-pointer hover:bg-[#00a1e4] transition-colors`}
                  onClick={() => handleCellClick(time)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Clock size={12} className="opacity-50" />
                    <span className="text-sm font-black tracking-widest">{time}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.groups.map((group, groupIdx) => (
              <React.Fragment key={group.group}>
                {/* Group Header Row */}
                <tr className="bg-slate-50/80">
                  <td 
                    colSpan={3 + timeSlots.length} 
                    className="px-6 py-3 border-b border-slate-100"
                    style={{ borderLeft: `4px solid ${group.color}` }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: group.color }}>
                      {group.group}
                    </span>
                  </td>
                </tr>

                {group.params.map((param) => (
                  <tr key={param.key} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 border-b border-r border-slate-100 min-w-[250px]">
                      <span className="text-sm font-bold text-[#003366]">{param.label}</span>
                    </td>
                    <td className="px-6 py-4 border-b border-r border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400">{param.unit || "-"}</span>
                    </td>
                    <td className="px-6 py-4 border-b border-r border-slate-100 text-center bg-blue-50/30">
                      <span className="text-xs font-black text-[#003366]">{designValues[param.key] ?? "-"}</span>
                    </td>
                    {timeSlots.map((time: string) => {
                      const entry = entryMap[time];
                      const val = entry?.values?.[param.key];
                      const abnormal = isAbnormal(param.key, val);

                      return (
                        <td 
                          key={`${time}-${param.key}`} 
                          className={`px-6 py-4 border-b border-r border-slate-100 text-center cursor-pointer transition-all hover:bg-slate-100/50 ${abnormal ? "bg-rose-50" : ""}`}
                          onClick={() => handleCellClick(time)}
                        >
                          {val !== undefined && val !== null && val !== "" ? (
                            <div className="flex flex-col items-center">
                                <span className={`text-sm font-black ${abnormal ? "text-rose-600" : "text-[#003366]"}`}>
                                    {val}
                                </span>
                                {abnormal && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <AlertTriangle size={10} className="text-rose-500" />
                                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Out of Range</span>
                                    </div>
                                )}
                            </div>
                          ) : (
                            <span className="text-slate-200"><Plus size={14} className="mx-auto opacity-0 group-hover:opacity-100" /></span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Recorder Info Footer Row */}
            <tr className="bg-slate-50/30">
              <td colSpan={3} className="px-6 py-4 border-b border-r border-slate-100 bg-slate-100/50">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Recorded By / Inspector</span>
                </div>
              </td>
              {timeSlots.map((time: string) => (
                <td key={`recorder-${time}`} className="px-6 py-4 border-b border-r border-slate-100 text-center">
                  <span className="text-[9px] font-black text-[#003366] truncate block max-w-[120px] mx-auto">
                    {entryMap[time]?.recorded_by || "-"}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00a1e4]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Design Value Reference</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Abnormal Reading (&gt;15% Dev)</span>
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-300 italic tracking-wider">
           * Click any cell to add or edit readings for that specific time slot
        </div>
      </div>

      <AnimatePresence>
        {(selectedSlot || editingEntry) && (
          <LogsheetEntryModal 
            template={template}
            time={selectedSlot || editingEntry?.log_time}
            existingEntry={editingEntry}
            date={date}
            onClose={() => {
                setSelectedSlot(null);
                setEditingEntry(null);
            }}
            onSuccess={() => {
                setSelectedSlot(null);
                setEditingEntry(null);
                onEntrySubmit();
            }}
            session={session}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ClipboardList({ size, className }: { size?: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>;
}
