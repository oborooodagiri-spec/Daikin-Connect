"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ChevronLeft, Building2, MapPin, Settings2, QrCode, Edit2, Clock, 
  History as HistoryIcon, Save, RotateCcw, CheckCircle2,
  ChevronRight, User, ImageIcon, ExternalLink, History, Download,
  AlertCircle, Trash2, ShieldCheck, Zap, Activity, Info, Calendar, Database,
  ArrowUpRight, MoreHorizontal, Share2, Printer, Copy, X as XIcon, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUnitDetail, getUnitHistory, updateUnit, updateUnitStatus, deleteUnit, createUnitEditRequest } from "@/app/actions/units";
import { getSession } from "@/app/actions/auth";
import { t, Language } from "@/lib/i18n";
import UnitHistoryTimeline from "@/components/UnitHistoryTimeline";
import MediaGallery from "@/components/dashboard/MediaGallery";
import QRCode from "react-qr-code";
import { getUnitMediaHistory } from "@/app/actions/media";
import { getUnitComplaints, deleteComplaint } from "@/app/actions/complaints";
import HealthExplanationModal from "@/components/HealthExplanationModal";

export default function UnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [lang, setLang] = useState<Language>('id');
  const [activeTab, setActiveTab] = useState<"timeline" | "media" | "complaints">("timeline");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mediaHistory, setMediaHistory] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [complaintHistory, setComplaintHistory] = useState<any[]>([]);
  const [complaintLoading, setComplaintLoading] = useState(false);

  // New UI states
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isInternal = session?.isInternal;
  const isVendor = session?.roles?.some((r: any) => r.toLowerCase().includes("vendor"));
  const canEdit = isInternal || isVendor; 

  useEffect(() => {
    const saved = localStorage.getItem("daikin_lang") as Language;
    if (saved) setLang(saved);
    
    fetchInitialData();

    // Close dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [unitId]);

  const fetchInitialData = async () => {
    setLoading(true);
    const [uRes, hRes, sRes] = await Promise.all([
      getUnitDetail(unitId),
      getUnitHistory(unitId),
      getSession()
    ]);

    if (uRes && 'success' in uRes && uRes.success) {
      setUnit(uRes.data);
      setFormData({ ...uRes.data });
    }
    if (hRes && 'success' in hRes && hRes.success) {
      setHistory(hRes.data);
    }
    setSession(sRes);
    setLoading(false);
  };

  useEffect(() => {
    if (unit) {
      if (activeTab === "media") fetchMedia();
      if (activeTab === "complaints") fetchComplaints();
    }
  }, [activeTab, unit]);

  const fetchMedia = async () => {
    if (!unit) return;
    setMediaLoading(true);
    const res: any = await getUnitMediaHistory(Number(unit.id));
    if (res && "success" in res && res.success) setMediaHistory(res.data);
    setMediaLoading(false);
  };

  const fetchComplaints = async () => {
    if (!unit) return;
    setComplaintLoading(true);
    const res: any = await getUnitComplaints(Number(unit.id));
    if (res && "success" in res && res.success) setComplaintHistory(res.data);
    setComplaintLoading(false);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === unit.status) return;

    if (isInternal) {
      const res = await updateUnitStatus(unitId, newStatus);
      if (res && 'success' in res && res.success) {
        setUnit((prev: any) => ({ ...prev, status: newStatus }));
        fetchInitialData();
      }
    } else {
      // Vendor logic: Create edit request for status change
      const res = await createUnitEditRequest(Number(unitId), { ...unit, status: newStatus });
      if (res && 'success' in res && res.success) {
        alert("Status change request submitted for admin validation.");
      } else {
        alert("Failed to submit request: " + (res as any).error);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let res;
    if (isInternal) {
      res = await updateUnit(Number(unitId), formData);
    } else {
      res = await createUnitEditRequest(Number(unitId), formData);
    }

    if (res && 'success' in res && res.success) {
      setIsEditing(false);
      if (!isInternal) {
        alert("Changes submitted for admin validation.");
      } else {
        fetchInitialData();
      }
    } else {
      alert("Failed: " + (res as any).error);
    }
    setIsSaving(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/passport/${unit.qr_code_token}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Unit Passport: ${unit.tag_number}`,
          text: `Check operational status for unit ${unit.tag_number}`,
          url: url
        });
      } catch (err) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleDeleteUnit = async () => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete unit ${unit.tag_number}? This action cannot be undone.`)) return;
    
    setLoading(true);
    const res = await deleteUnit(Number(unitId));
    if (res && 'success' in res && res.success) {
      router.push(`/w/${projectId}/dashboard?tab=inventory`);
    } else {
      alert("Delete failed: " + (res as any).error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#0073ea] border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Loading asset intelligence...</p>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="text-rose-500 mx-auto opacity-20" />
          <h2 className="text-xl font-bold text-slate-800">Unit Not Found</h2>
          <button onClick={() => router.back()} className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">Go Back</button>
        </div>
      </div>
    );
  }

  // Permission states are now defined at the top

  return (
    <div className="min-h-screen bg-[#f5f6f8] pb-20 font-sans selection:bg-blue-100 selection:text-[#0073ea] overflow-x-hidden">
      
      {/* Copied Toast */}
      <AnimatePresence>
         {showCopied && (
            <motion.div 
               initial={{ y: -50, opacity: 0 }} 
               animate={{ y: 20, opacity: 1 }} 
               exit={{ y: -50, opacity: 0 }}
               className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-[#0073ea] text-white text-xs font-bold rounded-full shadow-2xl flex items-center gap-2"
            >
               <CheckCircle2 size={16} /> Link copied to clipboard
            </motion.div>
         )}
      </AnimatePresence>

      {/* Monday.com Style Top Bar */}
      <div className="sticky top-0 z-[60] bg-white border-b border-[#e6e9ef] px-4 md:px-6 py-3 flex items-center justify-between">
         <div className="flex items-center gap-2 md:gap-4 truncate">
            <button 
              onClick={() => router.push(`/w/${projectId}/dashboard?tab=inventory`)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-600"
            >
               <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1 md:gap-2 text-[12px] md:text-[13px] font-medium text-slate-500 truncate">
               <span className="hidden sm:inline hover:text-[#0073ea] cursor-pointer">Assets</span>
               <ChevronRight size={14} className="text-slate-300 hidden sm:inline" />
               <span className="font-bold text-[#323338] truncate max-w-[120px] md:max-w-none">{unit.tag_number || "N/A"}</span>
            </div>
         </div>

         <div className="flex items-center gap-1 md:gap-3 shrink-0">
            <button 
               onClick={handleShare}
               className="p-2 text-slate-400 hover:text-[#0073ea] hover:bg-blue-50 rounded-lg transition-all"
               title="Share Unit Passport"
            >
               <Share2 size={18} />
            </button>
            
            <div className="relative" ref={moreRef}>
               <button 
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`p-2 rounded-lg transition-all ${isMoreOpen ? 'bg-slate-100 text-[#0073ea]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
               >
                  <MoreHorizontal size={20} />
               </button>

               <AnimatePresence>
                  {isMoreOpen && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-[#e6e9ef] py-2 overflow-hidden z-[70]"
                     >
                        <DropdownItem icon={RefreshCw} label="Refresh Intelligence" onClick={() => { fetchInitialData(); setIsMoreOpen(false); }} />
                        <DropdownItem icon={Download} label="Export Specifications" onClick={() => { alert("Exporting..."); setIsMoreOpen(false); }} />
                        <DropdownItem icon={Printer} label="Print QR Label" onClick={() => { window.print(); setIsMoreOpen(false); }} />
                        <div className="h-[1px] bg-slate-100 my-2" />
                        {isInternal && (
                           <DropdownItem icon={Trash2} label="Delete Asset" onClick={handleDeleteUnit} danger />
                        )}
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
            <button 
               onClick={() => window.open(`/passport/${unit.qr_code_token}`, '_blank')}
               className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#0073ea] hover:bg-[#0060c4] text-white text-[12px] md:text-[13px] font-bold rounded-lg transition-all shadow-sm"
            >
               <ExternalLink size={16} className="hidden xs:block" /> <span className="hidden xs:inline">Passport</span><span className="xs:hidden">Passport</span>
            </button>
         </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-6 md:pt-8">
         
         {/* Main Hero Header */}
         <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#0073ea] rounded-2xl text-white shadow-lg shadow-blue-500/20 shrink-0">
                     <Zap size={32} />
                  </div>
                  <div className="truncate">
                     <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#323338] leading-none uppercase truncate">
                        {unit.tag_number || "Asset ID Missing"}
                     </h1>
                     <p className="text-[12px] md:text-[13px] font-bold text-slate-400 mt-2 flex items-center gap-2 truncate">
                        <Building2 size={14} className="shrink-0" /> <span className="truncate">{unit.customer_name}</span> • <span className="truncate">{unit.model || "Standard Unit"}</span>
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
               <StatusBadge 
                  status={unit.status} 
                  onClick={() => {}} 
               />
               <div className="h-8 w-[1px] bg-slate-200 mx-1 md:mx-2" />
                <div className="flex items-center gap-2 bg-white border border-[#e6e9ef] p-1 rounded-xl shadow-sm">
                   {[
                      { id: "Normal", color: "#00c875" },
                      { id: "Problem", color: "#e44258" },
                      { id: "On_Progress", color: "#fdab3d" }
                   ].map(s => (
                      <button 
                         key={s.id}
                         onClick={() => handleStatusUpdate(s.id)}
                         className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${unit.status === s.id ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                         title={s.id}
                      >
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                      </button>
                   ))}
                </div>
               {canEdit && (
                  <button 
                     onClick={() => setIsEditing(true)}
                     className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-white border border-[#e6e9ef] hover:border-[#0073ea] text-[#323338] text-[12px] md:text-[13px] font-bold rounded-xl transition-all shadow-sm"
                  >
                     <Edit2 size={16} className="text-[#0073ea]" /> <span className="hidden sm:inline">Edit Details</span><span className="sm:hidden">Edit</span>
                  </button>
               )}
            </div>
         </div>

         {/* Monday Layout: Main Content + Sidebar */}
         <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Details & Intelligence */}
            <div className="flex-1 space-y-8 order-2 lg:order-1">
               
               {/* Quick Insights Cards */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <div onClick={() => setShowHealthModal(true)} className="cursor-pointer active:scale-95 transition-transform">
                    <InsightCard 
                       label="Health Score" 
                       value={`${unit.health_score || 0}%`} 
                       color={unit.health_score >= 80 ? "emerald" : unit.health_score >= 50 ? "amber" : "rose"} 
                       icon={ShieldCheck}
                       progress={unit.health_score}
                    />
                  </div>
                  <InsightCard 
                     label="Last Activity" 
                     value={unit.last_service_date ? new Date(unit.last_service_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }) : "None"} 
                     color="blue" 
                     icon={Clock} 
                  />
                  <InsightCard 
                     label="Deployment" 
                     value={unit.building_floor || "N/A"} 
                     subValue={unit.area}
                     color="purple" 
                     icon={MapPin} 
                  />
               </div>

               {/* Section: Technical Specifications */}
               <div className="bg-white rounded-2xl border border-[#e6e9ef] shadow-sm overflow-hidden">
                  <div className="px-6 md:px-8 py-4 md:py-5 border-b border-[#e6e9ef] bg-slate-50/50 flex items-center justify-between">
                     <h3 className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-[#323338] flex items-center gap-2">
                        <Settings2 size={16} className="text-[#0073ea]" /> Technical Specifications
                     </h3>
                     <Info size={14} className="text-slate-300" />
                  </div>
                  <div className="p-6 md:p-8 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-y-6 md:gap-y-8 gap-x-8 md:gap-x-12">
                     <SpecField label="Serial Number" value={unit.serial_number} icon={Database} />
                     <SpecField label="Reference Code" value={unit.code} icon={Info} />
                     <SpecField label="Unit Type" value={unit.unit_type} icon={Activity} badge />
                     <SpecField label="Model Design" value={unit.model} icon={Zap} />
                     <SpecField label="Capacity" value={unit.capacity} suffix="BTU/H" icon={Activity} />
                     <SpecField label="Age of Unit" value={unit.yoi ? `${new Date().getFullYear() - unit.yoi} Years` : "Unknown"} icon={Calendar} />
                  </div>
               </div>

               {/* Section: Activity Hub */}
               <div className="bg-white rounded-2xl border border-[#e6e9ef] shadow-sm overflow-hidden">
                  <div className="border-b border-[#e6e9ef] flex items-center px-2 md:px-4 overflow-x-auto no-scrollbar">
                     <TabItem id="timeline" active={activeTab} onClick={setActiveTab} label="History" icon={HistoryIcon} />
                     <TabItem id="media" active={activeTab} onClick={setActiveTab} label="Media" icon={ImageIcon} />
                     <TabItem id="complaints" active={activeTab} onClick={setActiveTab} label="Tickets" icon={AlertCircle} />
                  </div>
                  
                  <div className="p-4 md:p-8 min-h-[400px]">
                     {activeTab === "timeline" && <UnitHistoryTimeline history={history} session={session} unit={unit} />}
                     {activeTab === "media" && (
                        mediaLoading ? <LoadingSpinner /> : <MediaGallery groups={mediaHistory} />
                     )}
                     {activeTab === "complaints" && (
                        complaintLoading ? <LoadingSpinner /> : (
                           complaintHistory.length === 0 ? <EmptyState text="No registered tickets for this asset." /> : (
                              <div className="space-y-4">
                                 {complaintHistory.map(c => (
                                    <div key={c.id} className="p-4 md:p-5 bg-slate-50 border border-[#e6e9ef] rounded-xl flex items-start gap-4">
                                       <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0">
                                          <AlertCircle size={20} />
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-center mb-1 gap-2">
                                             <h4 className="text-[13px] font-black text-[#323338] truncate">{c.customer_name}</h4>
                                             <span className="text-[11px] font-bold text-slate-400 shrink-0">{new Date(c.created_at).toLocaleDateString()}</span>
                                          </div>
                                          <p className="text-[13px] text-slate-600 font-medium">"{c.description}"</p>
                                          <div className="mt-3 flex items-center gap-2">
                                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {c.status}
                                             </span>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )
                        )
                     )}
                  </div>
               </div>
            </div>

            {/* Right Column: QR & Meta */}
            <div className="lg:w-[360px] space-y-6 md:space-y-8 order-1 lg:order-2">
               
               {/* QR Identity Card */}
               <div className="bg-white rounded-2xl border border-[#e6e9ef] shadow-sm p-6 md:p-8 text-center space-y-6">
                  <div className="flex flex-col items-center">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Digital Identity Passport</p>
                     <div className="p-4 bg-slate-50 border border-[#e6e9ef] rounded-2xl shadow-inner group cursor-pointer hover:border-[#0073ea] transition-all">
                        <QRCode 
                           value={`${typeof window !== 'undefined' ? window.location.origin : ''}/passport/${unit.qr_code_token}`} 
                           size={180} 
                           level="H" 
                           fgColor="#323338"
                        />
                     </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                     <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Passport Token</p>
                     <code className="text-[12px] md:text-[13px] font-black text-[#0073ea] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 uppercase break-all">{unit.qr_code_token}</code>
                  </div>
                  <button 
                     onClick={() => window.print()}
                     className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-[#e6e9ef] hover:bg-slate-50 text-[13px] font-bold text-[#323338] rounded-xl transition-all"
                  >
                     <Printer size={16} /> Print QR Label
                  </button>
               </div>

               {/* Deployment Location */}
               <div className="bg-white rounded-2xl border border-[#e6e9ef] shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#e6e9ef] bg-slate-50/50">
                     <h3 className="text-xs font-black uppercase tracking-widest text-[#323338]">Deployment Status</h3>
                  </div>
                  <div className="p-6 space-y-6">
                     <MetaField label="Operating Context" value={unit.room_tenant} icon={Building2} />
                     <MetaField label="Building Floor" value={unit.building_floor} icon={ArrowUpRight} />
                     <MetaField label="Asset Location" value={unit.area} icon={MapPin} />
                     <MetaField label="Client Project" value={unit.project_name} icon={ShieldCheck} />
                  </div>
               </div>

               {/* System Info */}
               <div className="bg-[#1e293b] rounded-2xl p-6 text-white space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                        <Database size={16} className="text-[#00a1e4]" />
                     </div>
                     <p className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest">System Metadata</p>
                  </div>
                  <div className="space-y-3 pt-2">
                     <div className="flex justify-between text-[11px]">
                        <span className="text-white/40 font-bold uppercase tracking-widest">DB Identity</span>
                        <span className="font-black text-white/80">#{unit.id.toString().padStart(6, '0')}</span>
                     </div>
                     <div className="flex justify-between text-[11px]">
                        <span className="text-white/40 font-bold uppercase tracking-widest">Registration</span>
                        <span className="font-black text-white/80">{new Date(unit.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </div>

      {/* Monday Style Edit Modal */}
      <AnimatePresence>
         {isEditing && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                  className="bg-white rounded-2xl shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
               >
                  <div className="px-6 md:px-8 py-5 md:py-6 border-b border-[#e6e9ef] flex items-center justify-between">
                     <div>
                        <h2 className="text-lg md:text-xl font-black text-[#323338] uppercase tracking-tight">Edit Asset Specifications</h2>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manual data override</p>
                     </div>
                     <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                        <XIcon size={20} className="text-slate-400" />
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Tag Number" value={formData.tag_number} onChange={(v: string) => setFormData({...formData, tag_number: v})} />
                        <InputField label="Serial Number" value={formData.serial_number} onChange={(v: string) => setFormData({...formData, serial_number: v})} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Unit Model" value={formData.model} onChange={(v: string) => setFormData({...formData, model: v})} />
                        <InputField label="Capacity" value={formData.capacity} onChange={(v: string) => setFormData({...formData, capacity: v})} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Area" value={formData.area} onChange={(v: string) => setFormData({...formData, area: v})} />
                        <InputField label="Floor" value={formData.building_floor} onChange={(v: string) => setFormData({...formData, building_floor: v})} />
                     </div>
                     <InputField label="Operational Room / Tenant" value={formData.room_tenant} onChange={(v: string) => setFormData({...formData, room_tenant: v})} />
                  </div>
                  
                  <div className="px-8 py-5 md:py-6 border-t border-[#e6e9ef] bg-slate-50/50 flex items-center justify-end gap-3">
                     <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-white border border-transparent hover:border-[#e6e9ef] transition-all">Cancel</button>
                     <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="px-8 py-2.5 bg-[#0073ea] hover:bg-[#0060c4] text-white text-[13px] font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                     >
                        {isSaving ? "Saving..." : "Save Changes"}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <HealthExplanationModal 
        isOpen={showHealthModal} 
        onClose={() => setShowHealthModal(false)} 
        ahi={unit.ahi} 
        metrics={unit.metrics}
        score={unit.health_score}
      />
    </div>
  );
}

function InsightCard({ label, value, subValue, color, icon: Icon, progress }: any) {
   const colors: any = {
      blue: { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500" },
      emerald: { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
      amber: { bg: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500" },
      rose: { bg: "bg-rose-50", text: "text-rose-600", bar: "bg-rose-500" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", bar: "bg-purple-500" }
   };
   const c = colors[color] || colors.blue;

   return (
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#e6e9ef] shadow-sm hover:shadow-md transition-all group">
         <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 ${c.bg} ${c.text} rounded-lg group-hover:scale-110 transition-transform`}>
               <Icon size={18} />
            </div>
            <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">{label}</p>
         </div>
         <div className="space-y-1">
            <h4 className="text-xl font-black text-[#323338] tracking-tight truncate">{value}</h4>
            {subValue && <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">{subValue}</p>}
         </div>
         {progress !== undefined && (
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
               <div className={`h-full ${c.bar}`} style={{ width: `${progress}%` }}></div>
            </div>
         )}
      </div>
   );
}

function SpecField({ label, value, icon: Icon, badge, suffix }: any) {
   return (
      <div className="space-y-2 md:space-y-3">
         <div className="flex items-center gap-2">
            <Icon size={14} className="text-slate-300 shrink-0" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none truncate">{label}</p>
         </div>
         {badge ? (
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-black uppercase rounded-lg border border-[#e6e9ef] truncate max-w-full">
               {value || "N/A"}
            </span>
         ) : (
            <p className="text-[13px] md:text-[14px] font-black text-[#323338] tracking-tight break-all">
               {value || "---"} {suffix && <span className="text-[10px] text-slate-300 ml-1 font-bold">{suffix}</span>}
            </p>
         )}
      </div>
   );
}

function MetaField({ label, value, icon: Icon }: any) {
   return (
      <div className="flex items-start gap-3">
         <div className="mt-0.5 p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0">
            <Icon size={16} />
         </div>
         <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1.5 truncate">{label}</p>
            <p className="text-[13px] font-black text-[#323338] leading-tight break-words">{value || "---"}</p>
         </div>
      </div>
   );
}

function TabItem({ id, active, onClick, label, icon: Icon }: any) {
   const isActive = active === id;
   return (
      <button 
         onClick={() => onClick(id)}
         className={`px-4 md:px-6 py-4 text-[12px] md:text-[13px] font-bold transition-all flex items-center gap-2 relative whitespace-nowrap ${isActive ? 'text-[#0073ea]' : 'text-slate-400 hover:text-slate-600'}`}
      >
         <Icon size={16} className="shrink-0" />
         {label}
         {isActive && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0073ea]" />}
      </button>
   );
}

function StatusBadge({ status, onClick }: any) {
   const configs: any = {
      Normal: { bg: "#00c875", text: "Normal" },
      Problem: { bg: "#e44258", text: "Problem" },
      On_Progress: { bg: "#fdab3d", text: "On Progress" },
   };
   const config = configs[status] || { bg: "#797e93", text: status };

   return (
      <div 
         onClick={onClick}
         className="px-4 md:px-5 py-2 rounded-lg text-white text-[12px] md:text-[13px] font-black uppercase tracking-widest shadow-sm cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
         style={{ backgroundColor: config.bg }}
      >
         <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
         {config.text.replace('_', ' ')}
      </div>
   );
}

function DropdownItem({ icon: Icon, label, onClick, danger }: any) {
   return (
      <button 
         onClick={onClick}
         className={`w-full px-4 py-2 text-[13px] font-bold flex items-center gap-3 hover:bg-slate-50 transition-all ${danger ? 'text-rose-500 hover:bg-rose-50' : 'text-[#323338]'}`}
      >
         <Icon size={16} />
         {label}
      </button>
   );
}

function InputField({ label, value, onChange }: any) {
   return (
      <div className="space-y-2">
         <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
         <input 
            type="text" 
            value={value || ""} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-[#e6e9ef] rounded-xl text-[14px] font-bold text-[#323338] focus:outline-none focus:border-[#0073ea] transition-all"
         />
      </div>
   );
}

function LoadingSpinner() {
   return (
      <div className="py-20 flex flex-col items-center gap-4">
         <div className="w-8 h-8 border-4 border-slate-100 border-t-[#0073ea] rounded-full animate-spin" />
         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading details...</p>
      </div>
   );
}

function EmptyState({ text }: any) {
   return (
      <div className="py-20 text-center space-y-4 opacity-30">
         <Info size={48} className="mx-auto text-slate-300" />
         <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{text}</p>
      </div>
   );
}
