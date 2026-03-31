"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUnitByToken, submitActivityFromPassport, updateUnitInfoFromPassport } from "@/app/actions/passport";
import { 
  Building2, MapPin, Search, Hammer, Activity, Wrench, ChevronRight,
  ClipboardCheck, HardHat, FileText, CheckCircle2, AlertTriangle, Edit3, Save, X,
  History as HistoryIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateUnitStatus, getUnitHistory } from "@/app/actions/units";
import { submitComplaint } from "@/app/actions/complaints";
import UnitHistoryTimeline from "@/components/UnitHistoryTimeline";
import imageCompression from "browser-image-compression";

export default function PassportLandingPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"info" | "report" | "audit" | "preventive" | "corrective" | "history">("info");
  const [unitHistory, setUnitHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [formData, setFormData] = useState({
    reporterName: "",
    type: "Preventive",
    notes: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    unit_type: "",
    brand: "",
    model: "",
    capacity: ""
  });
  
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState(false);
  const [complaintMsg, setComplaintMsg] = useState(false);

  const [complaintForm, setComplaintForm] = useState({
    customerName: "",
    description: "",
    photoUrl: ""
  });
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await getUnitByToken(token);
      if (res.success) {
        setUnit(res.data);
        setEditForm({
          unit_type: res.data.unit_type || "Uncategorized",
          brand: res.data.brand || "Daikin",
          model: res.data.model || "",
          capacity: res.data.capacity || ""
        });
        
        // Load history as well
        setHistoryLoading(true);
        const hRes = await getUnitHistory(res.data.id);
        if (hRes && 'success' in hRes) {
          const sortedHistory = [...(hRes.data as any[])].sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date.getTime() : (a.date ? new Date(a.date).getTime() : 0);
            const dateB = b.date instanceof Date ? b.date.getTime() : (b.date ? new Date(b.date).getTime() : 0);
            return dateB - dateA;
          });
          setUnitHistory(sortedHistory);
        }
        setHistoryLoading(false);
      } else {
        setError(res.error || "Malfuctioned QR Code.");
      }
      setLoading(false);
    }
    loadData();
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitActivityFromPassport(token, formData);
      if (res.success) {
        setSuccessMsg(true);
        setTimeout(() => {
          setSuccessMsg(false);
          setActiveTab("info");
          setFormData({ reporterName: "", type: "Preventive", notes: "" });
        }, 3000);
      } else {
        alert(res.error || "Gagal Mengirim Laporan");
      }
    });
  };

  const handleUpdateUnit = () => {
    startTransition(async () => {
      const res = await updateUnitInfoFromPassport(token, editForm);
      if (res.success) {
        setUnit({ ...unit, ...editForm });
        setIsEditing(false);
      } else {
        alert(res.error || "Gagal Update Info Unit");
      }
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    startTransition(async () => {
       const res = await updateUnitStatus(unit.id, newStatus);
       if (res.success) {
         setUnit({ ...unit, status: newStatus });
       } else {
         alert("Gagal memperbarui status.");
       }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: 0.5, // Maksimal 500KB
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setComplaintForm(prev => ({ ...prev, photoUrl: reader.result as string }));
        setIsCompressing(false);
      };
    } catch (error) {
      console.error("Compression error:", error);
      setIsCompressing(false);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitComplaint(token, complaintForm);
      if (res.success) {
        setComplaintMsg(true);
        setTimeout(() => {
          setComplaintMsg(false);
          setActiveTab("info");
          setComplaintForm({ customerName: "", description: "", photoUrl: "" });
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
      <div className="w-full max-md bg-white shadow-2xl min-h-screen flex flex-col relative overflow-hidden">
        
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
               <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                 unit.status === 'Problem' ? 'bg-rose-500/20 border-rose-500/40 animate-pulse' : 
                 unit.status === 'On_Progress' ? 'bg-indigo-500/20 border-indigo-500/40' : 
                 'bg-emerald-500/20 border-emerald-500/40'
               }`}>
                 <div className={`w-2 h-2 rounded-full ${
                    unit.status === 'Problem' ? 'bg-rose-500' : 
                    unit.status === 'On_Progress' ? 'bg-indigo-500' : 
                    'bg-emerald-500'
                 }`} />
                 <select 
                   value={unit.status} 
                   onChange={(e) => handleStatusChange(e.target.value)}
                   className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                 >
                   <option value="Normal" className="text-slate-800">Normal</option>
                   <option value="Problem" className="text-slate-800">Problem</option>
                   <option value="On_Progress" className="text-slate-800">In Progress</option>
                 </select>
               </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-white shrink-0">
          <button 
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-4 text-xs font-bold tracking-wide transition-all ${activeTab === "info" ? 'text-[#00a1e4] border-b-2 border-[#00a1e4]' : 'text-slate-400 bg-slate-50 border-b-2 border-transparent'}`}
          >
            Unit Info
          </button>
          <button 
            onClick={() => setActiveTab("report")}
            className={`flex-1 py-4 text-xs font-bold tracking-wide transition-all ${activeTab === "report" ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400 bg-slate-50 border-b-2 border-transparent'}`}
          >
            <span className="flex items-center justify-center gap-1"><AlertTriangle size={14}/> Lapor</span>
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-4 text-xs font-bold tracking-wide transition-all ${activeTab === "history" ? 'text-slate-800 border-b-2 border-slate-800' : 'text-slate-400 bg-slate-50 border-b-2 border-transparent'}`}
          >
            <span className="flex items-center justify-center gap-1"><HistoryIcon size={14}/> Log</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
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
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Serial Number</p>
                        <p className="text-sm font-medium font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg inline-block mt-1">{unit.serial_number || "Not Registered"}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1"><MapPin size={12}/> Location Area</p>
                    <p className="text-sm font-bold text-slate-800">{unit.area || "Area Not Set"}</p>
                    <p className="text-xs text-slate-500 mt-1">{unit.building_floor} {unit.room_tenant ? `- ${unit.room_tenant}` : ''}</p>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === "report" ? (
              <motion.div 
                key="report" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              >
                {unit.status === 'On_Progress' ? (
                   <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-8 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-indigo-100 mb-6">
                        <Activity className="text-indigo-500 animate-pulse" size={32} />
                      </div>
                      <h3 className="text-xl font-black text-indigo-900 uppercase tracking-tight">Dalam Perbaikan</h3>
                      <p className="text-sm text-indigo-600 font-bold mt-4 leading-relaxed">
                        Teknisi kami sedang menangani unit ini. Mohon login ke portal resmi untuk detail progres.
                      </p>
                      <button 
                        onClick={() => router.push('/dashboard')}
                        className="w-full mt-10 py-4 bg-[#003366] text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3"
                      >
                         Dashboard Portal <ChevronRight size={18} />
                      </button>
                   </div>
                ) : complaintMsg ? (
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
                         className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10"
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
            ) : activeTab === "history" ? (
              <motion.div 
                key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest">Service Log</h3>
                </div>
                
                {historyLoading ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading...</p>
                  </div>
                ) : (
                  <UnitHistoryTimeline history={unitHistory} />
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
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
