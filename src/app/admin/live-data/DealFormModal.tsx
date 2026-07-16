"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, Building2, MapPin, User, FolderArchive, Activity, FileText, LayoutList, Calendar } from "lucide-react";
import { createDeal, updateDeal, deleteDeal, getSalesEngineers, getDealHistory } from "@/app/actions/pipeline";

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deal?: any; // null if adding
  sessionName: string;
}

const STATUS_OPTIONS = [
  { val: "A", label: "Won" },
  { val: "B", label: "Budgeted" },
  { val: "C", label: "Contracted" },
  { val: "D", label: "Planning" },
  { val: "E", label: "Submitted" },
  { val: "H", label: "Hold" },
  { val: "L", label: "Lost" },
  { val: "T", label: "Tender" },
  { val: "S", label: "Menyusul" },
  { val: "N", label: "Menyusul" }
];

const CATEGORY_OPTIONS = ["CONT DEVICE", "CONT INST", "CONT OTHERS", "EPL", "IAQ", "RC", "VES"];
const REGION_OPTIONS = ["West", "East", "Bali", "National", "Other"];
const SECTOR_OPTIONS = ["GOVERNMENT", "HEAVY INDUSTRI", "HOSPITAL", "INDUSTRI", "KOMERSIAL", "OTHER"];

export default function DealFormModal({ isOpen, onClose, onSuccess, deal, sessionName }: DealFormModalProps) {
  const [formData, setFormData] = useState({
    client_name: "",
    project_name: "",
    pic: "",
    category: "",
    sector: "",
    region: "",
    quotation: "",
    status: "T",
    source: "Sales",
    remarks: "",
    target_po_date: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [salesEngineers, setSalesEngineers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      getSalesEngineers().then(res => {
        if (res?.success) setSalesEngineers(res.data);
      });
      
      if (deal) {
        setFormData({
          client_name: deal.client_name || "",
          project_name: deal.project_name || "",
          pic: deal.pic || sessionName,
          category: deal.category || "EPL",
          sector: deal.sector || "",
          region: deal.region || "West",
          quotation: deal.quotation ? deal.quotation.toString() : "",
          status: deal.status || "T",
          source: deal.source || "Sales",
          remarks: deal.remarks || "",
          target_po_date: deal.target_po_date ? new Date(deal.target_po_date).toISOString().split('T')[0] : ""
        });
      } else {
        setFormData({
          client_name: "",
          project_name: "",
          pic: sessionName,
          category: "EPL",
          sector: "",
          region: "West",
          quotation: "",
          status: "T",
          source: "Sales",
          remarks: "",
          target_po_date: ""
        });
        setHistory([]);
      }
      setError("");
      setActiveTab("details");
    }
  }, [isOpen, deal, sessionName]);

  useEffect(() => {
    if (deal && deal.id && activeTab === "timeline") {
      getDealHistory(deal.id).then(res => {
        if (res?.success) setHistory(res.data);
      });
    }
  }, [deal, activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.client_name || !formData.project_name) {
      setError("Client Name and Project Name are required.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const dataToSave = {
        ...formData,
        quotation: formData.quotation ? parseFloat(formData.quotation.replace(/[^0-9.-]+/g,"")) : 0
      };

      let res;
      if (deal && deal.id) {
        res = await updateDeal(deal.id, dataToSave);
      } else {
        res = await createDeal(dataToSave);
      }

      if (res?.error) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save deal");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deal?.id) return;
    if (!confirm(`Are you sure you want to delete ${deal.project_name}? This action cannot be undone.`)) return;
    
    setLoading(true);
    try {
      const res = await deleteDeal(deal.id);
      if (res?.error) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete deal");
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
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#0a1628] to-[#1a2f4c] text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                <FolderArchive size={20} className="text-blue-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">{deal ? "Edit Project" : "Add New Project"}</h2>
                <p className="text-xs text-blue-200/70 font-medium">Pipeline Management System</p>
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

            {deal && (
              <div className="flex gap-4 border-b border-gray-100 mb-6">
                <button 
                  onClick={() => setActiveTab("details")}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === "details" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  Project Details
                </button>
                <button 
                  onClick={() => setActiveTab("timeline")}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === "timeline" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  Activity Timeline
                </button>
              </div>
            )}

            {activeTab === "details" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building2 size={12}/> Client Name *</label>
                  <input name="client_name" value={formData.client_name} onChange={handleChange} placeholder="e.g. PT Daikin"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FolderArchive size={12}/> Project Name *</label>
                  <input name="project_name" value={formData.project_name} onChange={handleChange} placeholder="e.g. Installation Tower A"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Activity size={12}/> Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer">
                    {STATUS_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.val} - {o.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><LayoutList size={12}/> Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer">
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12}/> Region / Sector</label>
                  <div className="flex gap-3">
                    <select name="region" value={formData.region} onChange={handleChange}
                      className="w-1/2 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none cursor-pointer">
                      <option value="">Select Region</option>
                      {REGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select name="sector" value={formData.sector} onChange={handleChange}
                      className="w-1/2 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none cursor-pointer">
                      <option value="">Select Sector</option>
                      {SECTOR_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12}/> PIC (Person In Charge)</label>
                  <select name="pic" value={formData.pic} onChange={handleChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer">
                    <option value={sessionName}>{sessionName} (You)</option>
                    {salesEngineers.map(se => (
                      se.name !== sessionName && <option key={se.id} value={se.name}>{se.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">Source / Division</label>
                  <select name="source" value={formData.source} onChange={handleChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer">
                    <option value="Sales">Sales</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Target PO Date</label>
                  <input name="target_po_date" type="date" value={formData.target_po_date} onChange={handleChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">Quotation Value (Rp)</label>
                  <input name="quotation" type="number" value={formData.quotation} onChange={handleChange} placeholder="e.g. 500000000"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FileText size={12}/> Remarks</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Add any notes..." rows={3}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Activity size={40} className="mx-auto mb-2 opacity-20" />
                    <p className="font-medium text-sm">No timeline history recorded yet.</p>
                  </div>
                ) : (
                  history.map((h, i) => (
                    <div key={h.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
                        {i !== history.length - 1 && <div className="w-px h-full bg-gray-200 mt-1" />}
                      </div>
                      <div className="pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-800">
                            {h.field_changed === 'new_deal' ? 'Project Created' : h.field_changed === 'status' ? 'Status Changed' : h.field_changed === 'quotation' ? 'Budget Revised' : 'Timeline Revised'}
                          </span>
                          <span className="text-xs text-gray-400">
                            • {new Date(h.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {h.old_value && h.new_value && (
                          <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                            <span className="line-through opacity-70">{h.old_value}</span>
                            <span>→</span>
                            <span className="font-semibold text-gray-700">{h.new_value}</span>
                          </div>
                        )}
                        {h.remark && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">{h.remark}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">by {h.user?.name || 'System'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
            {deal?.id ? (
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
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18}/> Save Project</>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
