"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUnitByToken, submitActivityFromPassport, updateUnitInfoFromPassport } from "@/app/actions/passport";
import { 
  Building2, MapPin, Search, Hammer, Activity, Wrench, ChevronRight, ChevronLeft,
  ClipboardCheck, HardHat, FileText, CheckCircle2, AlertTriangle, 
  History as HistoryIcon, Camera, Printer, Trash2, ImageIcon, X, Info, Settings2, Database, Zap, ShieldCheck, ArrowUpRight, Share2, Calendar, Phone, User, Edit2, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateUnitStatus, getUnitHistory } from "@/app/actions/units";
import { submitComplaint } from "@/app/actions/complaints";
import { getSession } from "@/app/actions/auth";
import UnitHistoryTimeline from "@/components/UnitHistoryTimeline";
import MediaGallery from "@/components/dashboard/MediaGallery";
import { getUnitMediaHistory } from "@/app/actions/media";
import imageCompression from "browser-image-compression";
import { t, Language } from "@/lib/i18n";

// Import Form Components
import PreventiveFormClient from "./preventive/PreventiveFormClient";
import CorrectiveFormClient from "./corrective/CorrectiveFormClient";
import AuditFormClient from "./audit/AuditFormClient";
import DailyLogFormClient from "../daily/DailyLogFormClient";

export default function PassportLandingPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<Language>('id');
  const [isMounted, setIsMounted] = useState(false);
  const [session, setSession] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"info" | "history" | "media" | "complaint" | "form_preventive" | "form_corrective" | "form_audit" | "form_daily">("info");
  
  // UI States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isRequestingEdit, setIsRequestingEdit] = useState(false);
  const [editRequestSuccess, setEditRequestSuccess] = useState(false);
  
  const [unitHistory, setUnitHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [mediaHistory, setMediaHistory] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const [complaintMsg, setComplaintMsg] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);

  // Complaint Form State
  const [complaintForm, setComplaintForm] = useState({
    customerName: "",
    description: "",
    photoUrl: ""
  });
  const [complaintPhotoPreview, setComplaintPhotoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("daikin_lang") as Language;
    if (saved) setLang(saved);

    async function loadData() {
      const sess = await getSession() as any;
      if (sess && "success" in sess && sess.success) {
        setSession(sess.data);
      }

      const res = await getUnitByToken(token) as any;
      if (res && "success" in res && res.success) {
        setUnit(res.data);
        setEditFormData({
            unit_type: res.data.unit_type || "",
            brand: res.data.brand || "",
            model: res.data.model || "",
            capacity: res.data.capacity || "",
            location: res.data.location || "",
            area: res.data.area || "",
            building_floor: res.data.building_floor || "",
            room_tenant: res.data.room_tenant || "",
            yoi: res.data.yoi || "",
            serial_number: res.data.serial_number || "",
            code: res.data.code || "",
            reporter_name: sess?.data?.name || "",
            reporter_contact: sess?.data?.phone || ""
        });
        loadHistory(res.data.id);
        loadMedia(res.data.id);
      } else {
        setError((res as any).error || t("Invalid Passport QR", lang));
      }
      setLoading(false);
    }
    loadData();
  }, [token]);

  const loadHistory = async (unitId: string) => {
    setHistoryLoading(true);
    const hRes = await getUnitHistory(unitId);
    if (hRes && (hRes as any).success) {
      setUnitHistory((hRes as any).data as any[]);
    }
    setHistoryLoading(false);
  };

  const loadMedia = async (unitId: string | number) => {
    setMediaLoading(true);
    const mRes: any = await getUnitMediaHistory(Number(unitId));
    if (mRes && "success" in mRes && mRes.success) {
      setMediaHistory(mRes.data);
    }
    setMediaLoading(false);
  };

  const handleComplaintPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
      const compressed = await imageCompression(file, options);
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("folder", "complaints");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json() as any;
      if (data && "success" in data && data.success) {
        setComplaintForm({ ...complaintForm, photoUrl: data.url });
        setComplaintPhotoPreview(URL.createObjectURL(compressed));
      }
    } catch (err) {}
    setIsCompressing(false);
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitComplaint(token, complaintForm) as any;
      if (res && "success" in res && res.success) {
        setComplaintMsg(true);
        setTimeout(() => {
          setComplaintMsg(false);
          setActiveTab("info");
          setComplaintForm({ customerName: "", description: "", photoUrl: "" });
          setComplaintPhotoPreview(null);
        }, 3000);
      }
    });
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center p-6 text-center">
         <div className="w-12 h-12 border-4 border-[#0073ea] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={48} className="text-rose-500 mb-4" />
        <h1 className="text-xl font-black text-slate-800 uppercase">{t("Invalid Passport QR", lang)}</h1>
        <p className="text-slate-400 text-xs font-bold mt-2 uppercase">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex justify-center selection:bg-blue-100 selection:text-[#0073ea]">
      <div className="w-full max-w-md bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] min-h-screen flex flex-col relative overflow-hidden">
        
        {/* Header - Fixed & Premium */}
        <div className="bg-[#003366] text-white p-6 md:p-8 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" onClick={() => router.push('/dashboard')}>
                <img src="/app-logo.png" alt="Logo" className="h-8 w-auto object-contain" />
                <span className="text-sm font-black tracking-tighter uppercase">EPL <span className="text-[#00a1e4]">CONNECT</span></span>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setShowEditModal(true)} className="p-2 bg-[#00a1e4] hover:bg-blue-400 rounded-lg transition-all shadow-lg shadow-blue-500/20"><Edit2 size={16} /></button>
              </div>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-1">Asset Identity</p>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase truncate">{unit.tag_number || "NO-TAG"}</h1>
                <div className="flex items-center gap-2 text-[11px] font-bold text-blue-100/60 mt-2">
                  <Building2 size={12} className="shrink-0" /> <span className="truncate">{unit.projectName}</span>
                </div>
              </div>
              <div className={`p-2 px-4 rounded-xl border flex items-center gap-2 shrink-0 ${
                  unit.status === 'Problem' ? 'bg-rose-500/20 border-rose-500/40' : 
                  unit.status === 'On_Progress' ? 'bg-indigo-500/20 border-indigo-500/40' : 
                  'bg-emerald-500/20 border-emerald-500/40'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                    unit.status === 'Problem' ? 'bg-rose-500' : 
                    unit.status === 'On_Progress' ? 'bg-indigo-500' : 
                    'bg-emerald-500'
                }`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{unit.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-[#f5f6f8] pb-24 relative no-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {unit.healthMetrics && (
                  <div onClick={() => setShowHealthModal(true)} className="bg-white rounded-[24px] p-6 border border-[#e6e9ef] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#0073ea] transition-all active:scale-95">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0073ea] mb-2">Health Score</p>
                      <h4 className="text-xl font-black text-[#323338] uppercase">{unit.healthMetrics.healthScore >= 80 ? 'Optimal' : unit.healthMetrics.healthScore >= 50 ? 'Warning' : 'Critical'}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click for deep analytics</p>
                    </div>
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke={unit.healthMetrics.healthScore >= 80 ? '#00c875' : unit.healthMetrics.healthScore >= 50 ? '#fdab3d' : '#e44258'} strokeWidth="6" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * unit.healthMetrics.healthScore) / 100} strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-sm font-black text-[#323338]">{unit.healthMetrics.healthScore}%</span>
                    </div>
                  </div>
                )}
                <Section title="Asset Specifications" icon={Settings2}>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                     <SpecItem label="Model" value={unit.model} icon={Database} />
                     <SpecItem label="Unit Type" value={unit.unit_type} icon={Zap} />
                     <SpecItem label="Capacity" value={unit.capacity} icon={Activity} />
                     <SpecItem label="Year of Install" value={unit.yoi} icon={Calendar} />
                     <div className="col-span-2 pt-2 border-t border-slate-50"><SpecItem label="Serial Number" value={unit.serial_number} icon={ShieldCheck} monospace /></div>
                  </div>
                </Section>
                <Section title="Deployment Info" icon={MapPin}>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                     <SpecItem label="Floor Level" value={unit.building_floor} icon={ArrowUpRight} />
                     <SpecItem label="Room / Tenant" value={unit.room_tenant} icon={Building2} />
                     <div className="col-span-2 pt-2 border-t border-slate-50"><SpecItem label="Area Context" value={unit.area} icon={MapPin} /></div>
                  </div>
                </Section>
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Section title="Operational Log" icon={HistoryIcon}>
                   {historyLoading ? <LoadingSpinner /> : <UnitHistoryTimeline history={unitHistory} unit={unit} session={session} lang={lang} />}
                </Section>
              </motion.div>
            )}

            {activeTab === "media" && (
              <motion.div key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Section title="Visual Documentation" icon={ImageIcon}>
                   {mediaLoading ? <LoadingSpinner /> : <MediaGallery groups={mediaHistory} />}
                </Section>
              </motion.div>
            )}

            {activeTab === "complaint" && (
              <motion.div key="complaint" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                <button onClick={() => setActiveTab("info")} className="flex items-center gap-2 text-xs font-black uppercase text-slate-400"><ChevronLeft size={16}/> Back to Asset</button>
                {complaintMsg ? (
                  <div className="bg-[#00c875]/10 border border-[#00c875]/20 rounded-3xl p-10 flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-[#00c875] text-white rounded-full"><CheckCircle2 size={32} /></div>
                    <h3 className="text-xl font-black text-[#00c875] uppercase">Report Received</h3>
                  </div>
                ) : (
                  <form onSubmit={handleComplaintSubmit} className="bg-white rounded-3xl p-8 border border-[#e6e9ef] shadow-xl space-y-6">
                    <InputField label="Reporter Name" value={complaintForm.customerName} onChange={v => setComplaintForm({ ...complaintForm, customerName: v })} />
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Details</label>
                       <textarea required rows={4} value={complaintForm.description} onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })} className="w-full px-5 py-4 bg-[#f5f6f8] border border-[#e6e9ef] rounded-2xl text-sm font-bold focus:outline-none focus:border-[#0073ea] transition-all" />
                    </div>
                    <button type="submit" disabled={isPending || isCompressing} className="w-full py-4 bg-[#0073ea] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 transition-all active:scale-95">{isPending ? "Sending..." : "Submit Report"}</button>
                  </form>
                )}
              </motion.div>
            )}

            {activeTab === "form_preventive" && (
               <motion.div key="f_p" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setActiveTab("info")} className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-6"><ChevronLeft size={16}/> Cancel</button>
                  <PreventiveFormClient unit={unit} />
               </motion.div>
            )}

            {activeTab === "form_corrective" && (
               <motion.div key="f_c" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setActiveTab("info")} className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-6"><ChevronLeft size={16}/> Cancel</button>
                  <CorrectiveFormClient unit={unit} />
               </motion.div>
            )}

            {activeTab === "form_audit" && (
               <motion.div key="f_a" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setActiveTab("info")} className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-6"><ChevronLeft size={16}/> Cancel</button>
                  <AuditFormClient unit={unit} />
               </motion.div>
            )}

            {activeTab === "form_daily" && (
               <motion.div key="f_d" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setActiveTab("info")} className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-6"><ChevronLeft size={16}/> Cancel</button>
                  <DailyLogFormClient unitId={unit.id} token={token} />
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Hub */}
        <AnimatePresence>
           {showActionSheet && (
              <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowActionSheet(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                 <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-md rounded-t-[40px] p-8 pb-12 relative z-10 space-y-6">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-4" />
                    <div className="space-y-1 text-center">
                       <h3 className="text-xl font-black text-slate-800 uppercase italic">Action <span className="text-[#0073ea] not-italic">Hub</span></h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select report type to submit</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <ActionButton icon={Wrench} label="Preventive" color="#0073ea" onClick={() => {setActiveTab("form_preventive"); setShowActionSheet(false);}} />
                       <ActionButton icon={Hammer} label="Corrective" color="#e44258" onClick={() => {setActiveTab("form_corrective"); setShowActionSheet(false);}} />
                       <ActionButton icon={ClipboardCheck} label="Audit Tech" color="#00c875" onClick={() => {setActiveTab("form_audit"); setShowActionSheet(false);}} />
                       <ActionButton icon={Activity} label="Daily Log" color="#fdab3d" onClick={() => {setActiveTab("form_daily"); setShowActionSheet(false);}} />
                    </div>
                    <button onClick={() => {setActiveTab("complaint"); setShowActionSheet(false);}} className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                       <AlertTriangle size={16}/> Report Problem (User)
                    </button>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

        {/* Navigation Bar */}
        <div className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-[#e6e9ef] px-8 py-4 flex items-center justify-between z-30">
           <NavBtn active={activeTab === 'info'} icon={Zap} label="Asset" onClick={() => setActiveTab("info")} />
           <NavBtn active={activeTab === 'history'} icon={HistoryIcon} label="Log" onClick={() => setActiveTab("history")} />
           <div className="relative -top-6">
              <button onClick={() => setShowActionSheet(true)} className="w-14 h-14 bg-[#0073ea] text-white rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all border-4 border-white">
                 <Plus size={24} />
              </button>
           </div>
           <NavBtn active={activeTab === 'media'} icon={ImageIcon} label="Gallery" onClick={() => setActiveTab("media")} />
           <NavBtn active={false} icon={Printer} label="Print" onClick={() => window.print()} />
        </div>
      </div>
      
      {/* Modals */}
      <HealthExplanationModal isOpen={showHealthModal} onClose={() => setShowHealthModal(false)} metrics={unit.healthMetrics} />
      
      {/* EXPANDED EDIT MODAL */}
      <EditInfoModal 
        isOpen={showEditModal} 
        onClose={() => { setShowEditModal(false); setEditRequestSuccess(false); }} 
        formData={editFormData} setFormData={setEditFormData} session={session} 
        onSubmit={async () => {
          setIsRequestingEdit(true);
          const res = await updateUnitInfoFromPassport(token, editFormData);
          if (res && res.success) { setEditRequestSuccess(true); setTimeout(() => { setShowEditModal(false); setEditRequestSuccess(false); }, 2500); }
          setIsRequestingEdit(false);
        }} isPending={isRequestingEdit} isSuccess={editRequestSuccess} 
      />
    </div>
  );
}

// Sub-components
function EditInfoModal({ isOpen, onClose, formData, setFormData, onSubmit, isPending, isSuccess, session }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
                <div className="p-8 bg-[#0073ea] text-white shrink-0">
                    <h3 className="text-xl font-black uppercase tracking-tight italic">Suggest <span className="not-italic text-blue-100">Correction</span></h3>
                    <p className="text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">Full specification update requested</p>
                </div>
                
                <div className="p-8 space-y-8 overflow-y-auto no-scrollbar flex-1 bg-[#f5f6f8]">
                    {isSuccess ? (
                        <div className="py-12 text-center space-y-4">
                            <div className="w-20 h-20 bg-white text-[#00c875] rounded-[30px] flex items-center justify-center mx-auto shadow-xl"><CheckCircle2 size={40} /></div>
                            <h4 className="text-xl font-black text-slate-800 uppercase italic">Request Sent!</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Data will be updated after admin approval.</p>
                        </div>
                    ) : (
                        <>
                            {/* REPORTER SECTION */}
                            {!session && (
                               <div className="space-y-4 p-5 bg-blue-50 border border-blue-100 rounded-3xl">
                                  <p className="text-[10px] font-black text-[#0073ea] uppercase tracking-widest mb-1 flex items-center gap-2"><User size={12}/> Reporter Contact</p>
                                  <InputField label="Name" value={formData.reporter_name} onChange={v => setFormData({...formData, reporter_name: v})} />
                                  <InputField label="Contact Info" value={formData.reporter_contact} onChange={v => setFormData({...formData, reporter_contact: v})} />
                               </div>
                            )}

                            {/* IDENTITY SECTION */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Database size={12}/> Asset Identity</p>
                                <div className="grid grid-cols-2 gap-4">
                                   <InputField label="Brand" value={formData.brand} onChange={v => setFormData({...formData, brand: v})} />
                                   <InputField label="Unit Code" value={formData.code} onChange={v => setFormData({...formData, code: v})} />
                                </div>
                                <InputField label="Model Name" value={formData.model} onChange={v => setFormData({...formData, model: v})} />
                            </div>

                            {/* TECHNICAL SECTION */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings2 size={12}/> Technical Data</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Unit Type" value={formData.unit_type} onChange={v => setFormData({...formData, unit_type: v})} />
                                    <InputField label="Capacity" value={formData.capacity} onChange={v => setFormData({...formData, capacity: v})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Serial Number" value={formData.serial_number} onChange={v => setFormData({...formData, serial_number: v})} />
                                    <InputField label="Year of Install" value={formData.yoi} onChange={v => setFormData({...formData, yoi: v})} />
                                </div>
                            </div>

                            {/* LOCATION SECTION */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> Deployment Location</p>
                                <InputField label="Area Building" value={formData.area} onChange={v => setFormData({...formData, area: v})} />
                                <InputField label="City / Location" value={formData.location} onChange={v => setFormData({...formData, location: v})} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Floor Level" value={formData.building_floor} onChange={v => setFormData({...formData, building_floor: v})} />
                                    <InputField label="Room / Tenant" value={formData.room_tenant} onChange={v => setFormData({...formData, room_tenant: v})} />
                                </div>
                            </div>

                            <button onClick={onSubmit} disabled={isPending} className="w-full py-5 bg-[#0073ea] text-white rounded-3xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                                {isPending ? "Submitting..." : "Submit for Approval"}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function Section({ title, icon: Icon, children }: any) {
   return (
      <div className="bg-white rounded-3xl border border-[#e6e9ef] shadow-sm overflow-hidden">
         <div className="px-6 py-4 bg-[#fcfcfd] border-b border-[#e6e9ef] flex items-center gap-2">
            <Icon size={14} className="text-[#0073ea]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#323338]">{title}</h3>
         </div>
         <div className="p-6">{children}</div>
      </div>
   );
}

function SpecItem({ label, value, icon: Icon, monospace }: any) {
   return (
      <div className="space-y-1.5">
         <div className="flex items-center gap-1.5 text-slate-300">
            <Icon size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
         </div>
         <p className={`text-[13px] font-black text-[#323338] leading-tight break-words ${monospace ? 'font-mono' : ''}`}>{value || "---"}</p>
      </div>
   );
}

function NavBtn({ active, icon: Icon, label, onClick }: any) {
   return (
      <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-[#0073ea]' : 'text-slate-400'}`}>
         <Icon size={20} />
         <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </button>
   );
}

function ActionButton({ icon: Icon, label, color, onClick }: any) {
   return (
      <button onClick={onClick} className="flex flex-col items-center gap-3 p-6 bg-slate-50 border border-slate-100 rounded-[32px] hover:bg-slate-100 transition-all active:scale-95 group">
         <div className="p-3 rounded-2xl text-white shadow-lg" style={{ backgroundColor: color }}>
            <Icon size={24} />
         </div>
         <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-[#323338]">{label}</span>
      </button>
   );
}

function InputField({ label, value, onChange }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} className="w-full px-4 py-3.5 bg-white border border-[#e6e9ef] rounded-2xl text-xs font-bold text-[#323338] focus:outline-none focus:border-[#0073ea] transition-all" />
        </div>
    );
}

function LoadingSpinner() { return <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#f5f6f8] border-t-[#0073ea] rounded-full animate-spin" /></div>; }

function HealthExplanationModal({ isOpen, onClose, metrics }: any) {
  if (!metrics || !isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl relative z-10">
        <div className="p-8 bg-[#003366] text-white">
          <h1 className="text-xl font-black italic uppercase">Health <span className="text-[#00a1e4] not-italic">Analytics</span></h1>
        </div>
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar bg-[#f5f6f8]">
           <div className="p-5 bg-white border border-[#e6e9ef] rounded-3xl space-y-4 shadow-sm text-center">
              <span className="text-2xl font-black text-[#323338]">{metrics.healthScore}%</span>
              <div className="h-2 w-full bg-[#f5f6f8] rounded-full overflow-hidden"><div className="h-full bg-[#0073ea]" style={{ width: `${metrics.healthScore}%` }}></div></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency vs Design</p>
           </div>
        </div>
        <div className="p-8 pt-0 bg-[#f5f6f8]"><button onClick={onClose} className="w-full py-4 bg-[#323338] text-white rounded-3xl text-xs font-black uppercase">Understood</button></div>
      </motion.div>
    </div>
  );
}
