"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Wrench, ClipboardCheck, ArrowLeft, Database, Search, MapPin, Building2, ChevronRight as ChevronRightIcon, Activity } from "lucide-react";
import { getScheduleFormOptions } from "@/app/actions/schedules";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface QuickInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: any | null;
}

export default function QuickInputModal({ isOpen, onClose, unit: initialUnit }: QuickInputModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<"corrective" | "preventive" | "audit" | "daily" | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<any>(initialUnit);
  const [units, setUnits] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (initialUnit) {
      setSelectedUnit(initialUnit);
      loadUnits(); // Still load to get project metadata if needed
    } else if (isOpen) {
      loadUnits();
    }
  }, [initialUnit, isOpen]);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const res = await getScheduleFormOptions();
      if (res && 'success' in res && res.success) {
        setUnits(res.data.units || []);
        setProjects(res.data.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleBackToSelect = () => {
    if (selectedType) {
      setSelectedType(null);
    } else {
      setSelectedUnit(null);
      setSearchQuery("");
    }
  };

  const handleTypeSelect = (type: string) => {
    if (!selectedUnit?.qr_code_token) {
        alert("Unit Passport Token is missing. Cannot redirect to form.");
        return;
    }
    // Redirect to the landing page form
    router.push(`/passport/${selectedUnit.qr_code_token}/${type}`);
    onClose();
  };

  const filteredUnits = units.filter(u => {
    const query = searchQuery.toLowerCase();
    return (
      u.tag_number?.toLowerCase().includes(query) ||
      u.code?.toLowerCase().includes(query) ||
      u.room_tenant?.toLowerCase().includes(query) ||
      u.model?.toLowerCase().includes(query) ||
      u.serial_number?.toLowerCase().includes(query) ||
      u.area?.toLowerCase().includes(query)
    );
  });

  // Dynamic Form Filtering
  const getEnabledFormTypes = () => {
    if (!selectedUnit) return [];
    const project = projects.find(p => p.id === selectedUnit.project_id);
    const enabledStr = project?.enabled_forms || "Audit,Preventive,Corrective";
    
    const baseTypes = [
      {
        id: "corrective",
        title: "Corrective Maintenance",
        description: "Repair breakdowns, fix issues, and restore functionality.",
        icon: AlertTriangle,
        color: "rose",
        bg: "bg-rose-50",
        border: "border-rose-100",
        iconBg: "bg-rose-500",
        textColor: "text-rose-700",
        match: "corrective"
      },
      {
        id: "preventive",
        title: "Preventive Maintenance",
        description: "Routine cleaning, inspection, and scheduled servicing.",
        icon: Wrench,
        color: "emerald",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        iconBg: "bg-emerald-500",
        textColor: "text-emerald-700",
        match: "preventive"
      },
      {
        id: "audit",
        title: "Technical Audit",
        description: "Deep inspection, measurement, and asset health audit.",
        icon: ClipboardCheck,
        color: "blue",
        bg: "bg-blue-50",
        border: "border-blue-100",
        iconBg: "bg-blue-500",
        textColor: "text-blue-700",
        match: "audit"
      },
      {
        id: "daily",
        title: "Daily Logsheet",
        description: "Standard daily operational monitoring & inspection parameters.",
        icon: Activity,
        color: "indigo",
        bg: "bg-indigo-50",
        border: "border-indigo-100",
        iconBg: "bg-[#003366]",
        textColor: "text-[#003366]",
        match: "dailylog"
      }
    ];

    const enabledForms = enabledStr.toLowerCase();
    return baseTypes.filter(type => {
      if (type.match === "dailylog") {
        return enabledForms.includes("daily") || enabledForms.includes("log") || enabledForms.includes("operational");
      }
      return enabledForms.includes(type.match);
    });
  };

  const formTypes = getEnabledFormTypes();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
      >
        <motion.div
          initial={{ y: 50, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 50, scale: 0.95 }}
          className="bg-slate-50 w-full h-full md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative"
        >
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-[110]">
            <div className="flex items-center gap-3">
              {(selectedUnit && !initialUnit) || selectedType ? (
                <button 
                  onClick={handleBackToSelect}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <div className="p-2 bg-[#003366] text-white rounded-lg">
                  <Database size={18} />
                </div>
              )}
              <div>
                <h2 className="text-sm font-black text-[#003366] uppercase tracking-widest">
                  {!selectedUnit ? "Cari & Pilih Unit" : "Select Report Type"}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {selectedUnit ? `Unit: ${selectedUnit.tag_number} — ${selectedUnit.area || 'No Area'}` : "Silahkan cari unit berdasarkan Tag Number atau Area"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
            {!selectedUnit ? (
              <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-8">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Cari Tag Number, Ruangan/Tenant, Kode, atau Model Unit... (Contoh: Starbucks atau AC-01)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-[#00a1e4] focus:ring-0 transition-all outline-none shadow-sm"
                    autoFocus
                  />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar min-h-[300px]">
                  {loading ? (
                    <div className="py-20 text-center animate-pulse text-slate-300 font-black uppercase text-xs tracking-widest">Memuat database unit...</div>
                  ) : filteredUnits.length === 0 ? (
                    <div className="py-20 text-center text-slate-300 font-bold text-sm">Tidak ada unit ditemukan</div>
                  ) : (
                    filteredUnits.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUnit(u)}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#00a1e4] hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="p-3 bg-slate-50 text-[#003366] rounded-xl group-hover:bg-[#00a1e4] group-hover:text-white transition-colors">
                            <Database size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[#003366] uppercase tracking-tight">{u.tag_number}</h4>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                                <p className="text-[10px] font-black text-[#00a1e4] uppercase tracking-tight leading-tight">{u.room_tenant || "Public Area"}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{u.code || "No Code"}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{u.area || "N/A"}</span>
                                    {u.model && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                            <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest italic">{u.model}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                          </div>
                        </div>
                        <ChevronRightIcon size={18} className="text-slate-300 group-hover:text-[#00a1e4] group-hover:translate-x-1 transition-all" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-black text-[#003366] tracking-tight italic uppercase">Apa yang ingin Anda laporkan?</h3>
                  <p className="text-sm font-bold text-slate-400 mt-2">Pilih jenis pekerjaan servis yang telah dilakukan pada unit <span className="text-[#00a1e4]">{selectedUnit.tag_number}</span>.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {formTypes.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-3xl border border-slate-200">
                      <p className="text-sm font-bold text-slate-400">Tidak ada tipe laporan yang diaktifkan untuk proyek ini.</p>
                      <p className="text-[10px] uppercase font-black text-slate-300 mt-1">Harap hubungi Administrator</p>
                    </div>
                  ) : (
                    formTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleTypeSelect(type.id)}
                        className={`group relative text-left p-6 ${type.bg} border-2 ${type.border} rounded-3xl hover:border-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl ${type.iconBg} text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                            <type.icon size={24} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-lg font-black ${type.textColor} uppercase tracking-tight`}>{type.title}</h4>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed mt-1">{type.description}</p>
                          </div>
                          <div className="p-3 bg-white/50 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRightIcon size={20} />
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
