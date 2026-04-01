"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUnitByToken, submitActivityFromPassport, updateUnitInfoFromPassport } from "@/app/actions/passport";
import { 
  Building2, MapPin, Search, Hammer, Activity, Wrench, ChevronRight, ChevronLeft,
  ClipboardCheck, HardHat, FileText, CheckCircle2, AlertTriangle, Edit3, Save, X,
  History as HistoryIcon, Camera, Printer, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateUnitStatus, getUnitHistory } from "@/app/actions/units";
import { submitComplaint } from "@/app/actions/complaints";
import UnitHistoryTimeline from "@/components/UnitHistoryTimeline";
import imageCompression from "browser-image-compression";

// Import Form Components
import PreventiveFormClient from "./preventive/PreventiveFormClient";
import CorrectiveFormClient from "./corrective/CorrectiveFormClient";
import AuditFormClient from "./audit/AuditFormClient";

export default function PassportLandingPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"info" | "corrective" | "preventive" | "audit" | "history" | "complaint">("info");
  
  // States for showing forms
  const [showFormCorrective, setShowFormCorrective] = useState(false);
  const [showFormPreventive, setShowFormPreventive] = useState(false);
  const [showFormAudit, setShowFormAudit] = useState(false);

  const [unitHistory, setUnitHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    unit_type: "",
    brand: "",
    model: "",
    capacity: ""
  });
  
  const [isPending, startTransition] = useTransition();
  const [complaintMsg, setComplaintMsg] = useState(false);

  // Complaint Form State
  const [complaintForm, setComplaintForm] = useState({
    customerName: "",
    description: "",
    photoUrl: ""
  });
  const [complaintPhotoPreview, setComplaintPhotoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await getUnitByToken(token) as any;
      if (res.success) {
        setUnit(res.data);
        setEditForm({
          unit_type: res.data.unit_type || "Uncategorized",
          brand: res.data.brand || "Daikin",
          model: res.data.model || "",
          capacity: res.data.capacity || ""
        });
        
        loadHistory(res.data.id);
      } else {
        setError(res.error || "Malfuctioned QR Code.");
      }
      setLoading(false);
    }
    loadData();
  }, [token]);

  const loadHistory = async (unitId: string) => {
    setHistoryLoading(true);
    const hRes = await getUnitHistory(unitId);
    if (hRes && 'success' in hRes) {
      const sortedHistory = [...(hRes.data as any[])].sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : (a.date ? new Date(a.date).getTime() : 0);
        const dateB = b.date instanceof Date ? b.date.getTime() : (b.date ? new Date(b.date).getTime() : 0);
        return dateB - dateA;
      });
      setUnitHistory(sortedHistory);
    }
    setHistoryLoading(false);
  };

  const handleUpdateUnit = () => {
    startTransition(async () => {
      const res = await updateUnitInfoFromPassport(token, editForm) as any;
      if (res.success) {
        setUnit({ ...unit, ...editForm });
        setIsEditing(false);
      } else {
        alert(res.error || "Gagal Update Info Unit");
      }
    });
  };

  const handleComplaintPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
      const compressed = await imageCompression(file, options);
      
      // Upload to server API
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("folder", "complaints");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setComplaintForm({ ...complaintForm, photoUrl: data.url });
        setComplaintPhotoPreview(URL.createObjectURL(compressed));
      } else {
        alert("Gagal upload foto.");
      }
    } catch (err) {
      console.error(err);
      alert("Error kompresi foto.");
    }
    setIsCompressing(false);
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitComplaint(token, complaintForm) as any;
      if (res.success) {
        setComplaintMsg(true);
        setTimeout(() => {
          setComplaintMsg(false);
          setActiveTab("info");
          setComplaintForm({ customerName: "", description: "", photoUrl: "" });
          setComplaintPhotoPreview(null);
        }, 3000);
      } else {
        alert(res.error || "Gagal Mengirim Pengaduan");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#00a1e4] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-bold tracking-widest text-[#003366] uppercase">Syncing Passport...</p>
        </div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">Invalid Passport QR</h1>
        <p className="text-slate-500 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl min-h-screen flex flex-col relative overflow-hidden">
        
        {/* Header Art */}
        <div className="bg-[#003366] text-white p-8 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00a1e4] mb-2 cursor-pointer" onClick={() => router.push('/dashboard')}>DAIKIN CONNECT</h2>
              <h1 className="text-3xl font-black tracking-tight">{unit.tag_number || "NO-TAG"}</h1>
              <p className="text-sm font-medium opacity-80 mt-1 flex items-center gap-1">
                <Building2 size={14} /> {unit.projectName}
              </p>
            </div>
            
            {/* Status Quick Select */}
            <div className="flex flex-col items-end gap-2">
               <div className={`p-2 px-4 rounded-xl border flex items-center gap-2 ${
                 unit.status === 'Problem' ? 'bg-rose-500/20 border-rose-500/40 animate-pulse' : 
                 unit.status === 'On_Progress' ? 'bg-indigo-500/20 border-indigo-500/40' : 
                 'bg-emerald-500/20 border-emerald-500/40'
               }`}>
                 <div className={`w-2 h-2 rounded-full ${
                    unit.status === 'Problem' ? 'bg-rose-500' : 
                    unit.status === 'On_Progress' ? 'bg-indigo-500' : 
                    'bg-emerald-500'
                 }`} />
                 <span className="text-[10px] font-black uppercase tracking-widest">
                   {unit.status === 'On_Progress' ? 'In Progress' : unit.status}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-100 bg-white shrink-0 scrollbar-hide no-scrollbar">
          <TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")} label="Info" />
          <TabButton active={activeTab === "corrective"} onClick={() => setActiveTab("corrective")} label="Corrective" icon={<Hammer size={12}/>} />
          <TabButton active={activeTab === "preventive"} onClick={() => setActiveTab("preventive")} label="Preventive" icon={<Wrench size={12}/>} />
          <TabButton active={activeTab === "audit"} onClick={() => setActiveTab("audit")} label="Audit" icon={<ClipboardCheck size={12}/>} />
          <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label="Log" icon={<HistoryIcon size={12}/>} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 pb-24">
          <AnimatePresence mode="wait">
            {activeTab === "info" ? (
              <motion.div 
                key="info" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00a1e4]">Specifications</h3>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 hover:text-[#00a1e4]">
                        <Edit3 size={12}/> Edit Info
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase text-rose-500">Batal</button>
                        <button onClick={handleUpdateUnit} disabled={isPending} className="flex items-center gap-1 text-[10px] font-black uppercase text-[#00a1e4]">
                          <Save size={12}/> {isPending ? "..." : "Simpan"}
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 pt-2">
                       <EditInput label="Unit Category" value={editForm.unit_type} 
                          onChange={(v: string) => setEditForm({...editForm, unit_type: v})} isSelect 
                          options={["AHU", "FCU", "Split", "Chiller", "Other", "Uncategorized"]} />
                       <EditInput label="Brand" value={editForm.brand} onChange={(v: string) => setEditForm({...editForm, brand: v})} />
                       <EditInput label="Model" value={editForm.model} onChange={(v: string) => setEditForm({...editForm, model: v})} />
                       <EditInput label="Capacity" value={editForm.capacity} onChange={(v: string) => setEditForm({...editForm, capacity: v})} />
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand / Model</p>
                        <p className="text-base font-bold text-slate-800">{unit.brand} - {unit.model}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capacity</p>
                          <p className="text-sm font-bold text-slate-800">{unit.capacity || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Type</p>
                          <span className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border 
                            ${unit.unit_type === "AHU" ? "bg-cyan-50 text-cyan-700 border-cyan-100" : 
                              unit.unit_type === "FCU" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                              unit.unit_type === "Chiller" ? "bg-rose-50 text-rose-700 border-rose-100" :
                              unit.unit_type === "Split" ? "bg-amber-50 text-amber-700 border-amber-100" :
                              "bg-slate-50 text-slate-400 border-slate-100"}`}>
                            {unit.unit_type || "Uncategorized"}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Serial Number</p>
                          <p className="text-xs font-mono font-bold text-slate-600 mt-1">{unit.serial_number || "-"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Code</p>
                          <p className="text-xs font-mono font-bold text-[#00a1e4] mt-1">{unit.code || "-"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                         <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Type</p>
                          <p className="text-xs font-bold text-slate-700">{unit.project_type || "-"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Service</p>
                          <p className="text-xs font-bold text-slate-700">{unit.last_service_date ? new Date(unit.last_service_date).toLocaleDateString() : "-"}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1"><MapPin size={12}/> Area Building</p>
                      <p className="text-sm font-bold text-slate-800">{unit.area || "Area Not Set"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1"><MapPin size={12}/> City / Location</p>
                      <p className="text-sm font-bold text-slate-800">{unit.location || "-"}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Floor Level</p>
                      <p className="text-sm font-bold text-slate-800">{unit.building_floor || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Room / Tenant</p>
                      <p className="text-sm font-bold text-slate-800">{unit.room_tenant || "-"}</p>
                    </div>
                  </div>
                   <div className="pt-4 border-t border-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Group</p>
                      <p className="text-sm font-bold text-slate-800">{unit.customer_group || "-"}</p>
                   </div>
                </div>

                {/* Quick Action: Complaint */}
                <button 
                  onClick={() => setActiveTab("complaint")}
                  className="w-full py-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center gap-3 text-rose-600 font-black uppercase text-xs tracking-widest"
                >
                   <AlertTriangle size={16}/> Lapor Masalah
                </button>
              </motion.div>
            ) : activeTab === "corrective" ? (
              <motion.div key="corrective" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                {!showFormCorrective ? (
                  <>
                    <button 
                      onClick={() => setShowFormCorrective(true)}
                      className="group w-full py-6 bg-rose-600 hover:bg-rose-700 text-white rounded-3xl flex flex-col items-center justify-center gap-2 shadow-xl shadow-rose-200 transition-all active:scale-95"
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Hammer size={28} />
                      </div>
                      <span className="font-black uppercase tracking-widest text-xs">Input Laporan Corrective</span>
                    </button>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riwayat Corrective</h3>
                      <UnitHistoryTimeline history={unitHistory.filter(h => h.type === 'Corrective')} />
                    </div>
                  </>
                ) : (
                  <div className="fixed inset-0 z-[110] bg-white overflow-y-auto">
                    <button onClick={() => setShowFormCorrective(false)} className="fixed top-6 left-6 z-[120] p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-800"><ChevronLeft size={24}/></button>
                    <CorrectiveFormClient unit={unit} />
                  </div>
                )}
              </motion.div>
            ) : activeTab === "preventive" ? (
              <motion.div key="preventive" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                {!showFormPreventive ? (
                  <>
                    <button 
                      onClick={() => setShowFormPreventive(true)}
                      className="group w-full py-6 bg-[#00a1e4] hover:bg-blue-600 text-white rounded-3xl flex flex-col items-center justify-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95"
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wrench size={28} />
                      </div>
                      <span className="font-black uppercase tracking-widest text-xs">Input Laporan Preventive</span>
                    </button>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riwayat Preventive</h3>
                      <UnitHistoryTimeline history={unitHistory.filter(h => h.type === 'Preventive')} />
                    </div>
                  </>
                ) : (
                  <div className="fixed inset-0 z-[110] bg-white overflow-y-auto">
                    <button onClick={() => setShowFormPreventive(false)} className="fixed top-6 left-6 z-[120] p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-800"><ChevronLeft size={24}/></button>
                    <PreventiveFormClient unit={unit} />
                  </div>
                )}
              </motion.div>
            ) : activeTab === "audit" ? (
              <motion.div key="audit" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                {!showFormAudit ? (
                  <>
                    <button 
                      onClick={() => setShowFormAudit(true)}
                      className="group w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl flex flex-col items-center justify-center gap-2 shadow-xl shadow-emerald-200 transition-all active:scale-95"
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ClipboardCheck size={28} />
                      </div>
                      <span className="font-black uppercase tracking-widest text-xs">Input Laporan Audit</span>
                    </button>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riwayat Audit</h3>
                      <UnitHistoryTimeline history={unitHistory.filter(h => h.type === 'Audit')} />
                    </div>
                  </>
                ) : (
                  <div className="fixed inset-0 z-[110] bg-white overflow-y-auto">
                    <button onClick={() => setShowFormAudit(false)} className="fixed top-6 left-6 z-[120] p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-800"><ChevronLeft size={24}/></button>
                    <AuditFormClient unit={unit} />
                  </div>
                )}
              </motion.div>
            ) : activeTab === "history" ? (
              <motion.div 
                key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest">Master Service Log</h3>
                </div>
                {historyLoading ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading History...</p>
                  </div>
                ) : (
                  <UnitHistoryTimeline history={unitHistory} />
                )}
              </motion.div>
            ) : activeTab === "complaint" ? (
              <motion.div 
                key="complaint" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <button onClick={() => setActiveTab("info")} className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-4">
                  <ChevronLeft size={16}/> Kembali
                </button>
                {complaintMsg ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 flex flex-col items-center text-center">
                    <CheckCircle2 className="w-16 h-16 text-rose-500 mb-4" />
                    <h3 className="text-xl font-black text-rose-800 uppercase tracking-tight">Terkirim!</h3>
                    <p className="text-sm text-rose-600 font-bold mt-2">Masalah telah kami catat.</p>
                  </div>
                ) : (
                  <form onSubmit={handleComplaintSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Pelapor</label>
                       <input 
                         type="text" required value={complaintForm.customerName} 
                         onChange={e => setComplaintForm({ ...complaintForm, customerName: e.target.value })}
                         placeholder="Nama Anda"
                         className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detail Masalah</label>
                       <textarea 
                         required rows={4} value={complaintForm.description}
                         onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                         placeholder="Jelaskan masalah..."
                         className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10"
                       />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Foto Kondisi (Opsional)</label>
                      <div className="flex items-center gap-4">
                        {complaintPhotoPreview ? (
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 group">
                            <img src={complaintPhotoPreview} className="w-full h-full object-cover" alt="Preview"/>
                            <button 
                              type="button" onClick={() => { setComplaintPhotoPreview(null); setComplaintForm({...complaintForm, photoUrl: ""}) }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-80 hover:opacity-100"
                            >
                              <X size={12}/>
                            </button>
                          </div>
                        ) : (
                          <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-rose-300 hover:text-rose-500 cursor-pointer transition-all">
                            <Camera size={24}/>
                            <span className="text-[10px] font-bold mt-1 uppercase">Ambil Foto</span>
                            <input type="file" accept="image/*" onChange={handleComplaintPhoto} className="hidden" />
                          </label>
                        )}
                        <div className="flex-1">
                           <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                             {isCompressing ? "Sedang memproses foto..." : "Upload foto kerusakan untuk mempercepat analisis teknisi kami."}
                           </p>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" disabled={isPending || isCompressing}
                      className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isPending ? "Mengirim..." : "Kirim Laporan"}
                      <AlertTriangle size={18} />
                    </button>
                  </form>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`min-w-fit px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${
        active ? 'text-[#00a1e4]' : 'text-slate-400 bg-slate-50/50'
      }`}
    >
      <span className="flex items-center justify-center gap-2 whitespace-nowrap">
        {icon} {label}
      </span>
      {active && (
        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#00a1e4]" />
      )}
    </button>
  );
}

function EditInput({ label, value, onChange, isSelect = false, options = [] }: { label: string, value: string, onChange: (v: string) => void, isSelect?: boolean, options?: string[] }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      {isSelect ? (
        <select 
          value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#00a1e4]"
        >
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input 
          type="text" value={value || ""} onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#00a1e4]"
        />
      )}
    </div>
  );
}
