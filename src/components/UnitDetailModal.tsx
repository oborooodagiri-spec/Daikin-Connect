"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Settings2, QrCode, Edit2, Clock, 
  History as HistoryIcon 
} from "lucide-react";
import UnitHistoryTimeline from "./UnitHistoryTimeline";
import { useRouter } from "next/navigation";

interface Unit {
  id: string | number;
  tag_number: string;
  serial_number?: string;
  brand?: string;
  model?: string;
  capacity?: string;
  yoi?: string | number;
  unit_type?: string;
  area?: string;
  building_floor?: string;
  room_tenant?: string;
  status: string;
  qr_code_token?: string;
  // New fields
  project_id?: string;
  project_type?: string;
  site_id?: number;
  code?: string;
  customer_name?: string;
  customer_group?: string;
  location?: string;
  last_service_date?: string | Date;
  created_at?: string | Date;
}

interface UnitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
  history: any[];
  historyLoading: boolean;
  isStatusUpdating: boolean;
  onStatusUpdate: (status: string) => void;
  onPrintQR?: (unit: any) => void;
  onEdit?: (unit: any) => void;
  customerId?: string;
  projectId?: string;
}

export default function UnitDetailModal({
  isOpen, onClose, unit, history, historyLoading, 
  isStatusUpdating, onStatusUpdate, onPrintQR, onEdit,
  customerId, projectId
}: UnitDetailModalProps) {
  const router = useRouter();

  if (!unit) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-[#003366] text-white p-8 relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#00a1e4]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white/10 text-[#00a1e4] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/10">Unit Passport</span>
                    <span className="px-3 py-1 bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/10">{unit.brand}</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter">{unit.tag_number}</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-sm font-bold text-white/60 flex items-center gap-1.5">
                      <MapPin size={16} className="text-[#00a1e4]"/> {unit.area} • {unit.building_floor}
                    </p>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <p className="text-sm font-bold text-white/60">{unit.model}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Sub Header / Status Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Status</p>
                <div className="flex gap-2">
                  {[
                    { id: "Normal", label: "Normal", color: "bg-emerald-500" },
                    { id: "Problem", label: "Problem", color: "bg-rose-500" },
                    { id: "On_Progress", label: "In Progress", color: "bg-indigo-500" }
                  ].map(s => (
                    <button 
                      key={s.id}
                      disabled={isStatusUpdating}
                      onClick={(e) => { e.stopPropagation(); onStatusUpdate(s.id); }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2
                        ${unit.status === s.id ? 'bg-[#003366] text-white border-[#003366] shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${s.color} ${unit.status === s.id && s.id === 'Problem' ? 'animate-pulse' : ''}`}></div>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                {onPrintQR && (
                  <button onClick={() => onPrintQR(unit)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#003366] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
                    <QrCode size={14}/> Passport
                  </button>
                )}
                {onEdit && (
                  <button onClick={() => onEdit(unit)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#003366] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
                    <Edit2 size={14}/> Edit Info
                  </button>
                )}
              </div>
            </div>

            {/* Body Content (Two Columns) */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left: Unit Details */}
              <div className="w-1/3 border-r border-slate-100 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
                <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#00a1e4] flex items-center gap-2">
                    <Settings2 size={14}/> Technical Specs
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField label="Serial Number" value={unit.serial_number} isMono />
                      <DetailField label="Unit Code" value={unit.code} isMono />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField label="Capacity" value={unit.capacity} />
                      <DetailField label="Year of Install" value={unit.yoi?.toString()} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField label="Unit Type" value={unit.unit_type} isBadge />
                      <DetailField label="Project Type" value={unit.project_type} />
                    </div>
                    <DetailField label="Last Service" value={unit.last_service_date ? new Date(unit.last_service_date).toLocaleDateString() : "-"} />
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#00a1e4] flex items-center gap-2">
                    <MapPin size={14}/> Location Details
                  </h3>
                  <div className="space-y-4">
                    <DetailField label="Building Area" value={unit.area} />
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField label="Floor Level" value={unit.building_floor} />
                      <DetailField label="Room / Tenant" value={unit.room_tenant} />
                    </div>
                    <DetailField label="Location / City" value={unit.location} />
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField label="Customer Group" value={unit.customer_group} />
                      <DetailField label="Site ID" value={unit.site_id?.toString()} />
                    </div>
                  </div>
                </section>

                <div className="bg-[#00a1e4]/5 p-6 rounded-3xl border border-[#00a1e4]/10">
                  <p className="text-[10px] font-black uppercase text-[#00a1e4] tracking-widest mb-2">Internal QR Token</p>
                  <p className="text-[10px] font-mono text-slate-400 break-all">{unit.qr_code_token}</p>
                </div>
              </div>

              {/* Right: Service History Timeline */}
              <div className="flex-1 overflow-y-auto p-8 bg-white relative">
                <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/80 backdrop-blur-sm z-20 pb-4">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <HistoryIcon size={16}/> Service History Timeline
                  </h3>
                  {customerId && projectId && (
                    <button 
                      onClick={() => router.push(`/dashboard/customers/${customerId}/projects/${projectId}/schedules`)} 
                      className="text-[10px] font-black uppercase text-[#00a1e4] hover:underline flex items-center gap-1"
                    >
                      <Clock size={12}/> View Schedule
                    </button>
                  )}
                </div>

                {historyLoading ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Retrieving Maintenance Log...</p>
                  </div>
                ) : (
                  <UnitHistoryTimeline history={history} />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DetailField({ label, value, isMono = false, isBadge = false }: { label: string; value?: string; isMono?: boolean; isBadge?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      {isBadge ? (
        <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
          {value || "Uncategorized"}
        </span>
      ) : (
        <p className={`text-sm font-bold text-slate-700 ${isMono ? 'font-mono' : ''}`}>{value || "-"}</p>
      )}
    </div>
  );
}
