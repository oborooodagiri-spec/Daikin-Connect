"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Settings2, QrCode, Edit2, Clock, 
  History as HistoryIcon, Save, RotateCcw, CheckCircle2,
  ChevronRight, Building2, User, ImageIcon
} from "lucide-react";
import UnitHistoryTimeline from "./UnitHistoryTimeline";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { updateUnit, getUnitHealthScore } from "@/app/actions/units";
import { getUnitMediaHistory } from "@/app/actions/media";
import { getUnitComplaints, deleteComplaint } from "@/app/actions/complaints";
import MediaGallery from "./dashboard/MediaGallery";
import { AlertCircle, Trash2, ShieldCheck, Zap, Activity } from "lucide-react";
import Portal from "./Portal";

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
  onEdit?: (unit?: any) => void;
  customerId?: string;
  projectId?: string;
  session?: any;
}

export default function UnitDetailModal({
  isOpen, onClose, unit, history, historyLoading, 
  isStatusUpdating, onStatusUpdate, onPrintQR, onEdit,
  customerId, projectId, session
}: UnitDetailModalProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "media" | "complaints">("timeline");
  const [mediaHistory, setMediaHistory] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [complaintHistory, setComplaintHistory] = useState<any[]>([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [showHealthBreakdown, setShowHealthBreakdown] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData({ ...unit });
      fetchHealth();
      if (activeTab === "media") fetchMedia();
      if (activeTab === "complaints") fetchComplaints();
    }
  }, [unit, activeTab]);

  const fetchHealth = async () => {
    if (!unit) return;
    setHealthLoading(true);
    const res = await getUnitHealthScore(Number(unit.id));
    if (res && 'success' in res) setHealthData(res.data);
    setHealthLoading(false);
  };

  const fetchComplaints = async () => {
    if (!unit) return;
    setComplaintLoading(true);
    const res: any = await getUnitComplaints(Number(unit.id));
    if (res.success) setComplaintHistory(res.data);
    setComplaintLoading(false);
  };

  const fetchMedia = async () => {
    if (!unit) return;
    setMediaLoading(true);
    const res: any = await getUnitMediaHistory(Number(unit.id));
    if (res.success) setMediaHistory(res.data);
    setMediaLoading(false);
  };

  if (!unit) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
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

  const handleDeleteComplaint = async (id: number) => {
    if (!confirm("Are you sure you want to delete this complaint record? This action cannot be undone.")) return;
    setIsDeleting(id);
    const res: any = await deleteComplaint(id);
    if (res.success) {
      setComplaintHistory(prev => prev.filter(c => c.id !== id));
    } else {
      alert(res.error || "Failed to delete complaint");
    }
    setIsDeleting(null);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
                      {/* Column 1: Identity & Vitality (Stacked) */}
                      <div className="col-span-12 lg:col-span-3 space-y-6">
                        {/* Passport Card */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group relative overflow-hidden flex flex-col items-center justify-center gap-4">
                          <div className="absolute inset-0 bg-[#00a1e4]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative z-10 p-2 bg-white rounded-2xl shadow-inner border border-slate-50">
                            {unit.qr_code_token ? (
                              <QRCode 
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/passport/${unit.qr_code_token}`} 
                                size={100} level="H" className="w-full h-full" 
                              />
                            ) : (
                              <QrCode size={64} className="text-slate-100" />
                            )}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Scan unit passport</p>
                        </div>

                        {/* Health Vitality Hub (Stacked) */}
                        <button 
                          onClick={() => setShowHealthBreakdown(true)}
                          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer w-full"
                        >
                          <div className={`absolute top-0 right-0 w-24 h-24 ${
                            healthData?.color === 'rose' ? 'bg-rose-500/5' : 
                            healthData?.color === 'amber' ? 'bg-amber-500/5' : 
                            healthData?.color === 'indigo' ? 'bg-indigo-500/5' : 'bg-emerald-500/5'
                          } rounded-full -translate-y-1/2 translate-x-1/2`}></div>
                          
                          <div className="relative mb-3">
                            {healthLoading ? (
                              <div className="w-16 h-16 border-4 border-slate-50 border-t-[#00a1e4] rounded-full animate-spin" />
                            ) : (
                              <div className="relative flex items-center justify-center">
                                <svg className="w-20 h-20 transform -rotate-90">
                                  <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                                  <circle 
                                    cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" 
                                    strokeDasharray={213.5}
                                    strokeDashoffset={213.5 - (213.5 * (healthData?.score || 100)) / 100}
                                    className={`${
                                      healthData?.color === 'rose' ? 'text-rose-500' : 
                                      healthData?.color === 'amber' ? 'text-amber-500' : 
                                      healthData?.color === 'indigo' ? 'text-indigo-500' : 'text-emerald-500'
                                    } transition-all duration-1000 ease-out`}
                                  />
                                </svg>
                                <span className="absolute text-lg font-black text-slate-800">{healthData?.score ?? '--'}%</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 relative z-10">
                            <h4 className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                              healthData?.color === 'rose' ? 'text-rose-600 bg-rose-50 border-rose-100' : 
                              healthData?.color === 'amber' ? 'text-amber-600 bg-amber-50 border-amber-100' : 
                              healthData?.color === 'indigo' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                            }`}>
                              {healthData?.label || "Status"}
                            </h4>
                            {healthData?.auditDate && (
                              <p className="text-[9px] font-semibold text-slate-300 mt-2">Audit: {new Date(healthData.auditDate).toLocaleDateString()}</p>
                            )}
                            <p className="text-[8px] font-black uppercase text-[#00a1e4] tracking-[0.2em] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">View Formula</p>
                          </div>
                        </button>
                      </div>

                      {/* Column 2: Technical Specs Hub */}
                      <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 w-fit rounded-lg">
                          <Zap size={14}/>
                          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Technical Metrics</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-8">
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

                      {/* Column 3: Location Details Hub */}
                      <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00a1e4]/10 text-[#00a1e4] w-fit rounded-lg">
                          <MapPin size={14}/>
                          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Deployment Location</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-8">
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
                          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Unit Activity Hub</h3>
                          <p className="text-xs font-bold text-slate-400 mt-0.5">Comprehensive history of service & media documentation</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <button 
                          onClick={() => setActiveTab("timeline")}
                          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'timeline' ? 'bg-[#003366] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <HistoryIcon size={14}/> Timeline
                        </button>
                        <button 
                          onClick={() => setActiveTab("media")}
                          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'media' ? 'bg-[#003366] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <ImageIcon size={14}/> Media Gallery
                        </button>
                        <button 
                          onClick={() => setActiveTab("complaints")}
                          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'complaints' ? 'bg-[#003366] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <AlertCircle size={14}/> Complaints
                        </button>
                      </div>

                      <button 
                        onClick={() => router.push(`/dashboard/schedules`)} 
                        className="flex items-center gap-3 px-6 py-3 bg-white border border-[#003366]/20 text-[#003366] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#00a1e4] hover:text-white transition-all shadow-sm group"
                      >
                        <Clock size={16} className="group-hover:translate-x-1 transition-transform"/> View Site Calendar
                      </button>
                    </div>

                    {activeTab === "timeline" ? (
                      historyLoading ? (
                        <div className="space-y-8 py-6">
                          {[1,2,3].map(i => (
                            <div key={i} className="flex gap-6 animate-pulse">
                              <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0"></div>
                              <div className="flex-1 space-y-4 pt-1">
                                <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                                <div className="h-24 bg-slate-50 rounded-2xl"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <UnitHistoryTimeline history={history} session={session} unit={unit} />
                      )
                    ) : activeTab === "media" ? (
                      mediaLoading ? (
                        <div className="py-24 text-center flex flex-col items-center gap-6">
                          <div className="w-16 h-16 border-4 border-slate-50 border-t-[#00a1e4] rounded-full animate-spin"></div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Media Optimized Assets...</p>
                        </div>
                      ) : (
                        <MediaGallery groups={mediaHistory} />
                      )
                    ) : (
                      complaintLoading ? (
                        <div className="py-24 text-center flex flex-col items-center gap-6">
                          <div className="w-16 h-16 border-4 border-slate-50 border-t-[#00a1e4] rounded-full animate-spin"></div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Complaint History...</p>
                        </div>
                      ) : complaintHistory.length === 0 ? (
                        <div className="py-24 text-center text-slate-400">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                          <p className="text-sm font-bold">No complaints recorded for this unit.</p>
                          <p className="text-xs">History is clean and healthy ✨</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-w-4xl mx-auto">
                          {complaintHistory.map((c) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              key={c.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-start group"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                   <p className="text-[10px] font-black text-[#00a1e4] uppercase tracking-widest">{c.customer_name}</p>
                                   <span className="text-[10px] font-bold text-slate-400">• {new Date(c.created_at).toLocaleString()}</span>
                                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.1em] border ${
                                     c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                   }`}>
                                     {c.status}
                                   </span>
                                </div>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{c.description}"</p>
                              </div>
                              
                               {c.photo_url && (
                                 <div className="w-16 h-16 rounded-xl overflow-hidden border border-white ml-4 shadow-sm shrink-0 relative">
                                    <img src={c.photo_url} alt="Problem" className="w-full h-full object-cover" />
                                 </div>
                              )}

                              {session?.isInternal && (
                                <button 
                                  onClick={() => handleDeleteComplaint(c.id)}
                                  disabled={isDeleting === c.id}
                                  className="ml-6 p-3 bg-white text-slate-300 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 rounded-2xl transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                  title="Delete Record (Admin Only)"
                                >
                                  {isDeleting === c.id ? <div className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" /> : <Trash2 size={16} />}
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Health Breakdown Overlay */}
      <AnimatePresence>
        {showHealthBreakdown && healthData && (
          <Portal>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#003366]/80 backdrop-blur-xl"
                onClick={() => setShowHealthBreakdown(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[3rem] shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-2xl font-black text-[#003366] tracking-tight mb-2">Health Calculation Analysis</h3>
                      <p className="text-sm font-bold text-slate-400">Physics-based Performance Audit & Enthalpy comparison</p>
                    </div>
                    <button onClick={() => setShowHealthBreakdown(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Formula Section */}
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#00a1e4] mb-6">Formula</p>
                      <div className="flex flex-col items-center gap-4 py-4">
                        <div className="text-xl font-black text-[#003366] font-mono tracking-tighter">
                           Q = m&#775; &times; (h<sub>in</sub> - h<sub>out</sub>)
                        </div>
                        <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
                        <div className="text-2xl font-black text-[#003366] font-mono tracking-tighter">
                           Score = (Q<sub>aktual</sub> / Q<sub>design</sub>) &times; 100%
                        </div>
                      </div>
                    </div>

                    {/* Data Metrics */}
                    {healthData.metrics && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#00a1e4] mb-4">Measured Airflow</p>
                          <p className="text-2xl font-black text-slate-800">{healthData.metrics.airflow} <span className="text-sm text-slate-400">m³/h</span></p>
                        </div>
                        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#00a1e4] mb-4">Air Mass Flow (&#775;m)</p>
                          <p className="text-2xl font-black text-slate-800">{(healthData.metrics.airflow * 1.204 / 3600).toFixed(3)} <span className="text-sm text-slate-400">kg/s</span></p>
                        </div>
                        
                        <div className="col-span-2 grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                          <div className="bg-white p-6">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Entering (Inlet)</p>
                             <p className="text-lg font-black text-slate-800">{healthData.metrics.entering.temperature}&deg;C / {healthData.metrics.entering.humidity}%</p>
                             <p className="text-xs font-bold text-indigo-500 mt-1">h: {healthData.metrics.entering.enthalpy.toFixed(2)} kJ/kg</p>
                          </div>
                          <div className="bg-white p-6 border-l border-slate-100">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Leaving (Outlet)</p>
                             <p className="text-lg font-black text-slate-800">{healthData.metrics.leaving.temperature}&deg;C / {healthData.metrics.leaving.humidity}%</p>
                             <p className="text-xs font-bold text-indigo-500 mt-1">h: {healthData.metrics.leaving.enthalpy.toFixed(2)} kJ/kg</p>
                          </div>
                        </div>

                        <div className="col-span-2 p-8 bg-[#003366] text-white rounded-3xl shadow-xl shadow-[#003366]/20">
                           <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Result Comparison</p>
                              <Activity size={16} className="text-[#00a1e4]" />
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                 <p className="text-xs font-bold opacity-60">Kapasitas Aktual (Q<sub>act</sub>)</p>
                                 <p className="text-xl font-black">{healthData.metrics.actualCapacitykW} kW</p>
                              </div>
                              <div className="flex justify-between items-end">
                                 <p className="text-xs font-bold opacity-60">Kapasitas Desain (Q<sub>des</sub>)</p>
                                 <p className="text-xl font-black">{healthData.metrics.designCapacitykW} kW</p>
                              </div>
                              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                 <p className="text-sm font-black uppercase tracking-widest text-[#00a1e4]">Vitality Score</p>
                                 <p className="text-4xl font-black tracking-tighter">{healthData.score}%</p>
                              </div>
                           </div>
                        </div>
                      </div>
                    )}
                    
                    {healthData.isInitial && (
                      <div className="p-8 bg-amber-50 text-amber-700 rounded-3xl border border-amber-100 text-center">
                         <AlertCircle size={24} className="mx-auto mb-3 opacity-50" />
                         <p className="text-sm font-bold leading-relaxed">
                            Unit ini belum memiliki data audit mendalam (Thermal Analytics). <br/>
                            Skor saat ini didasarkan pada data instalasi awal unit.
                         </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>
    </>
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
