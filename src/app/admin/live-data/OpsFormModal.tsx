"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, Building2, FolderArchive, Activity, FileText } from "lucide-react";
import { createOpsRecord, updateOpsRecord, deleteOpsRecord } from "@/app/actions/pipeline";

interface OpsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  opsRecord?: any; // null if adding
}

const STATUS_OPTIONS = [
  { val: "S", label: "Done / Success" },
  { val: "A", label: "Won / Secured PO" },
  { val: "B", label: "Budgeted" },
  { val: "C", label: "Contracted" },
  { val: "D", label: "Planning" },
  { val: "E", label: "Estimated/Submitted" },
  { val: "N", label: "No Response" },
  { val: "H", label: "Hold" },
  { val: "L", label: "Lost" }
];

export default function OpsFormModal({ isOpen, onClose, onSuccess, opsRecord }: OpsFormModalProps) {
  const [formData, setFormData] = useState({
    customer: "",
    project_name: "",
    total_value: "",
    status: "A",
    remark: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (opsRecord) {
        setFormData({
          customer: opsRecord.customer || "",
          project_name: opsRecord.project_name || "",
          total_value: opsRecord.total_value ? opsRecord.total_value.toString() : "",
          status: opsRecord.status || "A",
          remark: opsRecord.remark || ""
        });
      } else {
        setFormData({
          customer: "",
          project_name: "",
          total_value: "",
          status: "A",
          remark: ""
        });
      }
      setError("");
    }
  }, [isOpen, opsRecord]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.customer || !formData.project_name) {
      setError("Customer and Project Name are required.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const dataToSave = {
        ...formData,
        total_value: formData.total_value ? parseFloat(formData.total_value.replace(/[^0-9.-]+/g,"")) : 0
      };

      let res;
      if (opsRecord && opsRecord.id) {
        res = await updateOpsRecord(opsRecord.id, dataToSave);
      } else {
        res = await createOpsRecord(dataToSave);
      }

      if (res?.error) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save ops record");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!opsRecord?.id) return;
    if (!confirm(`Are you sure you want to delete ${opsRecord.project_name}? This action cannot be undone.`)) return;
    
    setLoading(true);
    try {
      const res = await deleteOpsRecord(opsRecord.id);
      if (res?.error) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete ops record");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#2c3e50] to-[#3498db] text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                <Activity size={20} className="text-blue-100" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">{opsRecord ? "Edit Operations Record" : "Add Operations Record"}</h2>
                <p className="text-xs text-blue-100/70 font-medium">Ops Tracker System</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col">
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Error</span>
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building2 size={12}/> Customer *</label>
                <input name="customer" value={formData.customer} onChange={handleChange} placeholder="e.g. PT Daikin"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FolderArchive size={12}/> Project Name *</label>
                <input name="project_name" value={formData.project_name} onChange={handleChange} placeholder="e.g. Installation Tower A"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Activity size={12}/> Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer">
                    {STATUS_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.val} - {o.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">Total Value (Rp)</label>
                  <input name="total_value" type="number" value={formData.total_value} onChange={handleChange} placeholder="e.g. 500000000"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FileText size={12}/> Remarks</label>
                <textarea name="remark" value={formData.remark} onChange={handleChange} placeholder="Add any notes..." rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
            {opsRecord?.id ? (
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="h-11 px-5 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={16}/> Delete
              </button>
            ) : <div/>}
            
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                disabled={loading}
                className="h-11 px-6 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="h-11 px-8 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18}/> Save Record</>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
