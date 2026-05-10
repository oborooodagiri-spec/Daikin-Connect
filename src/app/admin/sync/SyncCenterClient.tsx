"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  FileSpreadsheet, 
  Upload, 
  Settings2, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ArrowLeft,
  LayoutDashboard,
  Building2,
  ChevronDown,
  Info,
  Database
} from "lucide-react";
import { useRouter } from "next/navigation";
import { bulkSyncExcelAction } from "@/app/actions/bulk_sync";
import { getAllProjects } from "@/app/actions/projects";

export default function SyncCenterClient() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [syncType, setSyncType] = useState("fcu");
  const [file, setFile] = useState<File | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Options
  const [options, setOptions] = useState({
    autoCreateUnits: true,
    fuzzyMatching: true,
    overwriteExisting: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProjects() {
      const res = await getAllProjects();
      if (res.success) setProjects(res.data);
      setLoadingProjects(false);
    }
    fetchProjects();
  }, []);

  const handleSync = async () => {
    if (!file || !selectedProjectId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", selectedProjectId);
    formData.append("syncType", syncType);
    formData.append("autoCreateUnits", String(options.autoCreateUnits));
    formData.append("fuzzyMatching", String(options.fuzzyMatching));
    formData.append("overwriteExisting", String(options.overwriteExisting));

    setIsSyncing(true);
    setResult(null);
    try {
      const res = await bulkSyncExcelAction(formData);
      setResult(res);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#323338] p-6 lg:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push("/home")}
              className="p-3 bg-white rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tight">Sync Center</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
             <Zap size={16} className="fill-current" />
             <span className="text-[10px] font-black uppercase tracking-widest">System Ready</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
              
              {/* Project Selection */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Building2 size={14} /> Target Project
                </label>
                <div className="relative">
                  <select 
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-sm outline-none focus:border-[#0073ea] transition-all cursor-pointer pr-12"
                  >
                    <option value="">Pilih Project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.customer}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>

              {/* Sync Type Selection */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <LayoutDashboard size={14} /> Tipe Sinkronisasi
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {[
                     { id: 'fcu', label: 'Preventive FCU' },
                     { id: 'split', label: 'Preventive Split' },
                     { id: 'ahu', label: 'Preventive AHU' },
                     { id: 'audit', label: 'Audit AHU' },
                     { id: 'corrective', label: 'Corrective' }
                   ].map(type => (
                     <button
                       key={type.id}
                       onClick={() => setSyncType(type.id)}
                       className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all h-32
                         ${syncType === type.id ? 'border-[#0073ea] bg-blue-50/50 shadow-lg shadow-blue-500/10' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                     >
                       <span className={`text-[10px] font-black uppercase tracking-widest text-center ${syncType === type.id ? 'text-[#0073ea]' : 'text-slate-500'}`}>
                         {type.label}
                       </span>
                     </button>
                   ))}
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <FileSpreadsheet size={14} /> Upload Spreadsheet
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer group
                    ${file ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-[#0073ea] hover:bg-slate-50'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden" 
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg
                      ${file ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-100 text-slate-300 shadow-slate-100'}`}>
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="text-md font-black text-slate-700 uppercase tracking-tight">
                        {file ? file.name : "Select Spreadsheet File"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Format: .xlsx, .xls, .csv
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Execution */}
          <div className="space-y-8">
            {/* Advanced Options */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
               <div className="flex items-center gap-3 mb-8">
                  <Settings2 size={18} className="text-[#003366]" />
                  <h3 className="text-xs font-black text-[#003366] uppercase tracking-widest">Advanced Settings</h3>
               </div>
               
               <div className="space-y-6">
                  {[
                    { key: 'autoCreateUnits', label: 'Auto-Create Units', desc: 'Create new unit if not found' },
                    { key: 'fuzzyMatching', label: 'Fuzzy Matching', desc: 'Match tenant names with typos' },
                    { key: 'overwriteExisting', label: 'Overwrite Data', desc: 'Replace existing daily reports' }
                  ].map(opt => (
                    <label key={opt.key} className="flex items-start gap-4 cursor-pointer group">
                       <input 
                         type="checkbox"
                         checked={(options as any)[opt.key]}
                         onChange={(e) => setOptions({...options, [opt.key]: e.target.checked})}
                         className="mt-1 w-5 h-5 rounded-lg border-2 border-slate-200 text-[#0073ea] focus:ring-0 transition-all cursor-pointer"
                       />
                       <div>
                          <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide group-hover:text-[#0073ea] transition-colors">{opt.label}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{opt.desc}</p>
                       </div>
                    </label>
                  ))}
               </div>

               <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                  <Info size={16} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-wider">
                    Note: Pastikan format kolom sesuai dengan template yang ditentukan.
                  </p>
               </div>
            </div>

            {/* Execution Card */}
            <div className="bg-[#003366] rounded-[2.5rem] p-8 border border-blue-900 shadow-2xl shadow-blue-900/40 text-white">
               <div className="space-y-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">Ready for execution</p>
                  </div>

                  {result && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-2xl flex items-center gap-3 border ${result.success ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-rose-500/20 border-rose-500/50'}`}
                    >
                      {result.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{result.success ? 'Sync Successful' : 'Sync Failed'}</span>
                    </motion.div>
                  )}

                  <button 
                    onClick={handleSync}
                    disabled={isSyncing || !file || !selectedProjectId}
                    className="w-full h-16 bg-white text-[#003366] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-50 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Run Sync Engine
                      </>
                    )}
                  </button>

                  {result?.success && (
                    <p className="text-center text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                       {result.message}
                    </p>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
