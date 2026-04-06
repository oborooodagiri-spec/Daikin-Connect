"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Settings2, QrCode, Edit2, Clock, 
  History as HistoryIcon, Save, RotateCcw, CheckCircle2,
  ChevronRight, Building2, User
} from "lucide-react";
import UnitHistoryTimeline from "./UnitHistoryTimeline";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { updateUnit } from "@/app/actions/units";

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
  customerId?: string;
  projectId?: string;
}

export default function UnitDetailModal({
  isOpen, onClose, unit, history, historyLoading, 
  isStatusUpdating, onStatusUpdate, onPrintQR,
  customerId, projectId
}: UnitDetailModalProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData({ ...unit });
    }
  }, [unit]);

  if (!unit) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateUnit(Number(unit.id), formData);
      if (result.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert("Failed to update: " + result.error);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...unit });
    setIsEditing(false);
  };

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
            className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-[#003366] text-white p-8 relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#00a1e4]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white/10 text-[#00a1e4] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/10">Unit Operations Hub</span>
                    <span className="px-3 py-1 bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/10 tracking-widest">{unit.brand || "Daikin"}</span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tighter uppercase">{unit.tag_number}</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-sm font-bold text-white/60 flex items-center gap-1.5 focus-within:text-white transition-colors capitalize">
                      <Building2 size={16} className="text-[#00a1e4]"/> {unit.customer_name || "Private Client"}
                    </p>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <p className="text-sm font-bold text-white/40">{unit.model || "Unknown Model"}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-3xl transition-all">
                  <X size={28} />
                </button>
              </div>
            </div>

            {/* Hub Action Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                  {[
                    { id: "Normal", label: "Normal", color: "bg-emerald-500" },
                    { id: "Problem", label: "Problem", color: "bg-rose-500" },
                    { id: "On_Progress", label: "Processing", color: "bg-amber-500" }
                  ].map(s => (
                    <button 
                      key={s.id}
                      disabled={isStatusUpdating}
                      onClick={() => onStatusUpdate(s.id)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                        ${unit.status === s.id ? 'bg-[#003366] text-white shadow-md scale-105' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${s.color} ${unit.status === s.id && (s.id === 'Problem' || s.id === 'On_Progress') ? 'animate-pulse' : ''}`}></div>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-[#003366]/20 text-[#003366] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#003366] hover:text-white transition-all shadow-sm group"
                    >
                      <Edit2 size={14} className="group-hover:rotate-12 transition-transform"/> Edit Specification
                    </button>
                    {onPrintQR && (
                      <button 
                        onClick={() => onPrintQR(unit)} 
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                      >
                        <QrCode size={14}/> Print Label
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                    >
                      <RotateCcw size={14}/> Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-3 bg-[#00a1e4] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#003366] transition-all shadow-lg shadow-[#00a1e4]/20 disabled:opacity-50"
                    >
                      {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={14}/>}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info Hub - The Horizontal Core */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-8 pb-4">
                <div className="grid grid-cols-12 gap-8 bg-slate-50/50 border border-slate-100 p-8 rounded-[2.5rem]">
                  {/* Passport Section */}
                  <div className="col-span-12 lg:col-span-2 flex flex-col items-center justify-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#00a1e4]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 p-2 bg-white rounded-2xl shadow-inner border border-slate-50">
                      {unit.qr_code_token ? (
                        <QRCode value={unit.qr_code_token} size={100} level="H" className="w-full h-full" />
                      ) : (
                        <QrCode size={64} className="text-slate-100" />
                      )}
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Scan Passport</p>
                  </div>

                  {/* Technical Specs Hub */}
                  <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 w-fit rounded-lg">
                      <Settings2 size={14}/>
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Technical Specification</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <EditableField 
                        label="Serial Number" 
                        value={formData?.serial_number} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("serial_number", v)}
                        isMono
                      />
                      <EditableField 
                        label="Internal ID / Code" 
                        value={formData?.code} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("code", v)}
                        isMono
                      />
                      <EditableField 
                        label="Normal Capacity" 
                        value={formData?.capacity} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("capacity", v)}
                      />
                      <EditableField 
                        label="Installation Year" 
                        value={formData?.yoi?.toString()} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("yoi", v)}
                      />
                      <EditableField 
                        label="Unit Asset Type" 
                        value={formData?.unit_type} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("unit_type", v)}
                        isBadge
                      />
                      <EditableField 
                        label="Model Info" 
                        value={formData?.model} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("model", v)}
                      />
                    </div>
                  </div>

                  {/* Location Details Hub */}
                  <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00a1e4]/10 text-[#00a1e4] w-fit rounded-lg">
                      <MapPin size={14}/>
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Deployment Location</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <EditableField 
                        label="Building Area" 
                        value={formData?.area} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("area", v)}
                      />
                      <EditableField 
                        label="Floor Level" 
                        value={formData?.building_floor} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("building_floor", v)}
                      />
                      <EditableField 
                        label="Room / Tenant" 
                        value={formData?.room_tenant} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("room_tenant", v)}
                      />
                      <EditableField 
                        label="Operational City" 
                        value={formData?.location} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("location", v)}
                      />
                      <EditableField 
                        label="Company Group" 
                        value={formData?.customer_group} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("customer_group", v)}
                      />
                      <EditableField 
                        label="Site ID Reference" 
                        value={formData?.site_id?.toString()} 
                        isEditing={isEditing} 
                        onChange={(v) => handleInputChange("site_id", v)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div className="px-8 py-10 bg-white">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                      <HistoryIcon size={24}/>
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Field Service Timeline</h3>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">Chronological record of maintenance & interventions</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/dashboard/schedules`)} 
                    className="flex items-center gap-3 px-6 py-3 bg-[#003366] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#00a1e4] transition-all shadow-lg shadow-[#003366]/20 group"
                  >
                    <Clock size={16} className="group-hover:translate-x-1 transition-transform"/> View Site Calendar
                  </button>
                </div>

                {historyLoading ? (
                  <div className="py-24 text-center flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-slate-50 border-t-[#00a1e4] rounded-full animate-spin"></div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Data...</p>
                      <p className="text-[10px] font-bold text-slate-300">Retrieving cloud maintenance logs</p>
                    </div>
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

function EditableField({ 
  label, value, isEditing, onChange, isMono = false, isBadge = false 
}: { 
  label: string; value?: string; isEditing: boolean; onChange: (v: string) => void; isMono?: boolean; isBadge?: boolean 
}) {
  return (
    <div className="group/field">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-2 group-hover/field:text-[#00a1e4] transition-colors">
        {label}
      </p>
      {isEditing ? (
        <input 
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#003366] focus:ring-2 focus:ring-[#00a1e4]/20 focus:border-[#00a1e4] outline-none transition-all shadow-sm"
          placeholder={`Enter ${label}...`}
        />
      ) : (
        <div>
          {isBadge ? (
            <span className="inline-block px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
              {value || "Standard"}
            </span>
          ) : (
            <p className={`text-sm font-bold text-slate-700 leading-none ${isMono ? 'font-mono tracking-tighter' : ''}`}>
              {value || "-"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
