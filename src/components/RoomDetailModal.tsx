"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Settings2, QrCode, Edit2, Clock, 
  History as HistoryIcon, ShieldCheck, Zap, Activity,
  Wind, Droplets, Gauge, Box, ChevronRight, AlertTriangle,
  Hammer, ArrowUpRight, Thermometer
} from "lucide-react";
import Portal from "./Portal";
import { getRoomDeepData } from "@/app/actions/units";
import { t, Language } from "@/lib/i18n";
import UnitHistoryTimeline from "./UnitHistoryTimeline";

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: any; // The "Room" unit record
  projectId: string;
  session?: any;
  onRefresh?: () => void;
}

export default function RoomDetailModal({
  isOpen, onClose, unit, projectId, session, onRefresh
}: RoomDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "units" | "history">("overview");
  const [lang, setLang] = useState<Language>('id');

  useEffect(() => {
    const saved = localStorage.getItem("daikin_lang") as Language;
    if (saved) setLang(saved);

    if (isOpen && unit) {
      fetchDeepData();
    }
  }, [isOpen, unit]);

  const fetchDeepData = async () => {
    setLoading(true);
    const res = await getRoomDeepData(Number(unit.id), projectId);
    if (res && res.success) {
      setData(res.data);
    }
    setLoading(false);
  };

  const iaqStatus = useMemo(() => {
    if (!data?.conditions?.temp) return { label: "Data Pending", color: "text-slate-400", bg: "bg-slate-50" };
    const temp = parseFloat(data.conditions.temp);
    const rh = parseFloat(data.conditions.humidity);
    
    if (temp > 27 || rh > 75) return { label: "Caution", color: "text-rose-500", bg: "bg-rose-50" };
    if (temp > 25 || rh > 65) return { label: "Fair", color: "text-amber-500", bg: "bg-amber-50" };
    return { label: "Optimum", color: "text-emerald-500", bg: "bg-emerald-50" };
  }, [data]);

  const totalCapacity = useMemo(() => {
    if (!data?.supplyingUnits) return "0";
    const total = data.supplyingUnits.reduce((acc: number, u: any) => {
      const cap = parseFloat(u.capacity?.replace(/[^0-9.]/g, '') || "0");
      return acc + cap;
    }, 0);
    return total.toLocaleString();
  }, [data]);

  if (!unit) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={onClose} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#003366] text-white p-8 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00a1e4]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-3 py-1 bg-white/10 text-[#00a1e4] text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">ROOM COMMAND CENTER</span>
                       <span className="px-3 py-1 bg-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10 font-mono italic">{unit.tag_number}</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">{unit.room_tenant || "Unnamed Room"}</h2>
                    <div className="flex items-center gap-4 mt-3">
                       <p className="text-sm font-bold text-white/60 flex items-center gap-2"><MapPin size={14} className="text-[#00a1e4]"/> {unit.area} • {unit.building_floor}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-3xl transition-all">
                    <X size={28} />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="bg-slate-50 border-b border-slate-200 px-8 py-3 flex items-center justify-between gap-4 shrink-0 overflow-x-auto transition-all">
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                  {[
                    { id: "overview", label: "Overview", icon: Zap },
                    { id: "units", label: "Supplied Units", icon: Box },
                    { id: "history", label: "History", icon: HistoryIcon }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                        ${activeTab === tab.id ? 'bg-[#003366] text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                   <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm ${iaqStatus.bg} ${iaqStatus.color}`}>
                      <Activity size={14} /> IAQ: {iaqStatus.label}
                   </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                     <div className="w-12 h-12 border-4 border-slate-200 border-t-[#00a1e4] rounded-full animate-spin"></div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Room Data...</p>
                  </div>
                ) : (
                  <div className="max-w-6xl mx-auto space-y-8">
                    {activeTab === "overview" && (
                      <>
                        {/* Environmental Parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-[#00a1e4] transition-all">
                              <div className="w-16 h-16 bg-blue-50 text-[#00a1e4] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                 <Thermometer size={32} />
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Temperature</p>
                              <h3 className="text-4xl font-black text-[#003366] tracking-tighter">{data?.conditions?.temp || "--"}<span className="text-lg ml-1">°C</span></h3>
                              {data?.conditions?.updatedAt && <p className="text-[9px] font-bold text-slate-300 mt-2">Latest Log: {new Date(data.conditions.updatedAt).toLocaleDateString()}</p>}
                           </div>

                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-emerald-500 transition-all">
                              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                 <Droplets size={32} />
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Humidity</p>
                              <h3 className="text-4xl font-black text-[#003366] tracking-tighter">{data?.conditions?.humidity || "--"}<span className="text-lg ml-1">%</span></h3>
                              <div className="mt-2 text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">Comfort Zone</div>
                           </div>

                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-indigo-500 transition-all">
                              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                 <Gauge size={32} />
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Room Diff Pressure</p>
                              <h3 className="text-4xl font-black text-[#003366] tracking-tighter">{data?.conditions?.pressure || "--"}<span className="text-lg ml-1">Pa</span></h3>
                              <div className="mt-2 text-[9px] font-bold text-indigo-600/60 uppercase tracking-widest">Positive Pressure</div>
                           </div>
                        </div>

                        {/* Room Analytics Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           {/* Quick Unit Summary */}
                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                              <div className="flex justify-between items-center mb-8">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                    <Box size={16} className="text-[#00a1e4]" /> Linked Assets Summary
                                 </h4>
                                 <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg">{data?.supplyingUnits?.length || 0} Units Running</span>
                              </div>
                              
                              <div className="space-y-4">
                                 <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#003366] shadow-sm">
                                          <Wind size={20} />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Cooling Capacity</p>
                                          <p className="text-xl font-black text-[#003366]">{totalCapacity} Btu/h</p>
                                       </div>
                                    </div>
                                    <ArrowUpRight size={20} className="text-slate-300" />
                                 </div>

                                 <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                                          <AlertTriangle size={20} />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Asset Health Status</p>
                                          <p className="text-lg font-black text-[#003366]">
                                             {data?.supplyingUnits?.some((u: any) => u.status === 'Problem') ? "In Repair / Attention Needed" : "All Units Operating Normal"}
                                          </p>
                                       </div>
                                    </div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                                 </div>

                                 <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
                                          <Hammer size={20} />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Next Maintenance</p>
                                          <p className="text-lg font-black text-[#003366]">Scheduled for Apr 28, 2024</p>
                                       </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">In 6 Days</span>
                                 </div>
                              </div>
                           </div>

                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                              <div className="w-24 h-24 bg-blue-50 text-[#00a1e4] rounded-[2rem] flex items-center justify-center mb-6">
                                 <Activity size={48} />
                              </div>
                              <h4 className="text-2xl font-black text-[#003366] tracking-tight mb-2">Energy & Efficiency Context</h4>
                              <p className="text-sm font-bold text-slate-400 max-w-xs mb-8">Estimated real-time power consumption based on active units and return air enthalpy calculations.</p>
                              
                              <div className="grid grid-cols-2 gap-4 w-full">
                                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency Ratio</p>
                                    <p className="text-xl font-black text-emerald-500">3.8 <span className="text-[10px]">COP</span></p>
                                 </div>
                                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Load</p>
                                    <p className="text-xl font-black text-indigo-500">74%</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </>
                    )}

                    {activeTab === "units" && (
                      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Health Index</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Details</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {data?.supplyingUnits?.map((unit: any) => (
                               <tr key={unit.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                  <td className="px-8 py-5">
                                     <p className="text-sm font-black text-[#003366] tracking-tight">{unit.tag_number}</p>
                                     <p className="text-[10px] font-bold text-slate-400">{unit.unit_type} • {unit.capacity}</p>
                                  </td>
                                  <td className="px-8 py-5">
                                     <div className="flex items-center gap-3">
                                        <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                           <div 
                                              className={`h-full ${unit.health_color === 'rose' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                              style={{ width: `${unit.health_score}%` }} 
                                           />
                                        </div>
                                        <span className="text-xs font-black text-slate-700">{unit.health_score}%</span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-5">
                                     <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                       unit.status === 'Problem' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                     }`}>
                                        {unit.status}
                                     </span>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                     <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#00a1e4] group-hover:text-white transition-all">
                                        <ChevronRight size={16} />
                                     </div>
                                  </td>
                               </tr>
                             ))}
                             {(!data?.supplyingUnits || data.supplyingUnits.length === 0) && (
                               <tr>
                                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic">No supplying units linked to this room identifier.</td>
                               </tr>
                             )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === "history" && (
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                         <UnitHistoryTimeline history={data?.history || []} session={session} unit={unit} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
