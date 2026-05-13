"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Clock, User, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { submitLogsheetEntry, deleteLogsheetEntry } from "@/app/actions/logsheets";
import { LOGSHEET_CONFIGS } from "@/lib/logsheet-config";

interface LogsheetEntryModalProps {
  template: any;
  time: string;
  existingEntry?: any;
  date: Date;
  onClose: () => void;
  onSuccess: () => void;
  session: any;
}

export default function LogsheetEntryModal({ 
  template, 
  time, 
  existingEntry, 
  date, 
  onClose, 
  onSuccess,
  session
}: LogsheetEntryModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState("");
  const [inspector, setInspector] = useState(existingEntry?.recorded_by || session?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = LOGSHEET_CONFIGS[template.type];
  const designValues = template.design_json ? JSON.parse(template.design_json) : {};

  useEffect(() => {
    if (existingEntry && existingEntry.values) {
        setFormData(existingEntry.values);
        setNotes(existingEntry.notes || "");
    }
  }, [existingEntry]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await submitLogsheetEntry(template.id, {
      log_date: date.toISOString(),
      log_time: time,
      recorded_by: inspector,
      values: formData,
      notes: notes
    });

    if ((result as any).success) {
      onSuccess();
    } else {
      setError(result.error || "Gagal menyimpan data.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingEntry) return;
    if (!confirm("Hapus log data ini?")) return;
    
    setIsSubmitting(true);
    const result = await deleteLogsheetEntry(existingEntry.id);
    if (result.success) {
      onSuccess();
    } else {
      setError("Gagal menghapus data.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#003366] rounded-3xl flex items-center justify-center text-white shadow-lg shadow-[#003366]/20">
              <Clock size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-black text-[#00a1e4] uppercase tracking-widest">{template.type} READING</span>
                 <span className="text-slate-300">•</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(date, "EEEE, dd MMM yyyy", { locale: id })}</span>
              </div>
              <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter">Time Slot: {time}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="space-y-10">
            {config.groups.map((group) => (
              <div key={group.group} className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: group.color }}></div>
                  <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest">{group.group}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.params.map((param) => (
                    <div key={param.key} className="space-y-2 group">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          {param.label}
                          {param.unit && <span className="lowercase text-[#00a1e4]">({param.unit})</span>}
                        </label>
                        {designValues[param.key] !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">DESIGN:</span>
                            <span className="text-[8px] font-black text-[#003366]">{designValues[param.key]}</span>
                          </div>
                        )}
                      </div>

                      {param.type === "number" ? (
                        <input 
                          type="number"
                          step="0.01"
                          value={formData[param.key] ?? ""}
                          onChange={(e) => handleInputChange(param.key, e.target.value)}
                          placeholder="0.00"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#00a1e4] focus:ring-4 focus:ring-[#00a1e4]/5 transition-all text-[#003366] font-bold outline-none"
                        />
                      ) : param.type === "select" ? (
                        <div className="relative">
                          <select 
                            value={formData[param.key] ?? ""}
                            onChange={(e) => handleInputChange(param.key, e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#00a1e4] focus:ring-4 focus:ring-[#00a1e4]/5 transition-all text-[#003366] font-bold outline-none appearance-none"
                          >
                            <option value="">Pilih...</option>
                            {param.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                             <X size={14} className="rotate-45" />
                          </div>
                        </div>
                      ) : (
                        <input 
                          type="text"
                          value={formData[param.key] ?? ""}
                          onChange={(e) => handleInputChange(param.key, e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#00a1e4] transition-all text-[#003366] font-bold outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-slate-100 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <User size={12} /> Recorded By (Inspector)
                    </label>
                    <input 
                      type="text"
                      value={inspector}
                      onChange={(e) => setInspector(e.target.value)}
                      placeholder="Nama Teknisi"
                      required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#00a1e4] transition-all text-[#003366] font-black uppercase text-xs tracking-widest outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       Catatan Tambahan
                    </label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tuliskan jika ada kendala atau temuan..."
                      rows={2}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#00a1e4] transition-all text-[#003366] font-bold text-sm outline-none resize-none"
                    />
                  </div>
               </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            {error && (
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {existingEntry && (
              <button 
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
              >
                <Trash2 size={24} />
              </button>
            )}
            
            <button 
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-3 px-10 py-4 bg-[#003366] text-white rounded-3xl shadow-xl shadow-[#003366]/20 hover:bg-[#00a1e4] transition-all disabled:opacity-50 group grow md:grow-0"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save size={20} className="group-hover:scale-110 transition-transform" />
              )}
              <span className="font-black uppercase tracking-widest text-xs">
                {existingEntry ? "Update Reading" : "Save Reading"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
