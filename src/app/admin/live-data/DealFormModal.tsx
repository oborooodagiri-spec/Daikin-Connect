"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import indonesianCities from "@/lib/indonesia-cities.json";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, Building2, MapPin, User, FolderArchive, Activity, FileText, LayoutList, Calendar } from "lucide-react";
import { createDeal, updateDeal, deleteDeal, getSalesEngineers, getDealHistory } from "@/app/actions/pipeline";

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deal?: any; // null if adding
  sessionName: string;
  isAdmin?: boolean;
}

const STATUS_OPTIONS = [
  { val: "A", label: "Won / Already PO" },
  { val: "B", label: "Booking Forecast" },
  { val: "C", label: "Proses Tender" },
  { val: "D", label: "Aanwijzing" },
  { val: "E", label: "Budgeting (Quoting)" },
  { val: "H", label: "Hold" },
  { val: "L", label: "Lost" },
  { val: "T", label: "Engineering Review" }
];

const CATEGORY_OPTIONS = ["CONT DEVICE", "CONT INST", "CONT OTHERS", "EPL", "IAQ", "RC", "VES"];
const SECTOR_OPTIONS = ["GOVERNMENT", "HEAVY INDUSTRI", "HOSPITAL", "INDUSTRI", "KOMERSIAL", "OTHER"];

export default function DealFormModal({ isOpen, onClose, onSuccess, deal, sessionName, isAdmin = false }: DealFormModalProps) {
  const [formData, setFormData] = useState({
    client_name: "",
    project_name: "",
    pic: "",
    sales_planner: "",
    category: "",
    sector: "",
    quotation: "",
    status: "T",
    source: "Sales",
    remarks: "",
    target_po_date: "",
    booking_fc: "",
    target_po_reason: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [salesEngineers, setSalesEngineers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [history, setHistory] = useState<any[]>([]);

  const [searchArea, setSearchArea] = useState("");
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAreaDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => {
    if (!searchArea) return indonesianCities.slice(0, 50);
    return indonesianCities.filter(c => c.name.toLowerCase().includes(searchArea.toLowerCase())).slice(0, 50);
  }, [searchArea]);

  useEffect(() => {
    if (isOpen) {
      getSalesEngineers().then(res => {
        if ((res as any)?.success) setSalesEngineers((res as any).data);
      });
      
      if (deal) {
          setFormData({
          client_name: deal.client_name || "",
          project_name: deal.project_name || "",
          pic: deal.pic || sessionName,
          sales_planner: deal.sales_planner || "",
          category: deal.category || "EPL",
          sector: deal.sector || "",
          quotation: deal.quotation ? Number(deal.quotation).toLocaleString("id-ID") : "",
          status: deal.status || "T",
          source: deal.source || "Sales",
          remarks: deal.remarks || "",
          target_po_date: deal.target_po_date ? new Date(deal.target_po_date).toISOString().slice(0, 7) : "",
          booking_fc: deal.booking_fc || "",
          target_po_reason: "",
          latitude: deal.latitude ? deal.latitude.toString() : "",
          longitude: deal.longitude ? deal.longitude.toString() : "",
          area: deal.area || "",
        });
        setSearchArea(deal.area || "");
      } else {
        setFormData({
          client_name: "",
          project_name: "",
          pic: sessionName,
          sales_planner: "",
          category: "EPL",
          sector: "",
          quotation: "",
          status: "T",
          source: "Sales",
          remarks: "",
          target_po_date: "",
          booking_fc: "",
          latitude: "",
          longitude: "",
          target_po_reason: "",
          area: ""
        });
        setSearchArea("");
        setHistory([]);
      }
      setError("");
      setActiveTab("details");
    }
  }, [isOpen, deal, sessionName]);

  useEffect(() => {
    if (deal && deal.id && activeTab === "timeline") {
      getDealHistory(deal.id).then(res => {
        if ((res as any)?.success) setHistory((res as any).data);
      });
    }
  }, [deal, activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "quotation") {
      const rawValue = value.replace(/[^0-9]/g, "");
      if (rawValue) {
        setFormData(prev => ({ ...prev, [name]: Number(rawValue).toLocaleString("id-ID") }));
      } else {
        setFormData(prev => ({ ...prev, [name]: "" }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.client_name || !formData.project_name) {
      setError("Client Name and Project Name are required.");
      return;
    }
    
    const isTargetDateChanged = deal && deal.target_po_date && new Date(deal.target_po_date).toISOString().slice(0, 7) !== formData.target_po_date;
    if (isTargetDateChanged && !formData.target_po_reason?.trim()) {
      setError("Please provide a reason for changing the Target PO.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const dataToSave = {
        ...formData,
        quotation: formData.quotation ? parseFloat(formData.quotation.replace(/[^0-9]/g,"")) : 0,
        booking_fc: ["B", "C", "D", "E"].includes(formData.status) ? (formData.booking_fc || null) : null,
        target_po_date: formData.target_po_date ? `${formData.target_po_date}-01` : null,
        target_po_reason: formData.target_po_reason || null,
        sales_planner: formData.source === "Partnership" ? (formData.sales_planner || null) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        area: formData.area || null
      };

      let res;
      if (deal && deal.id) {
        res = await updateDeal(deal.id, dataToSave);
      } else {
        res = await createDeal(dataToSave);
      }

      if ((res as any)?.error) {
        setError((res as any).error);
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
                <h2 className="text-lg font-bold tracking-tight text-white">{deal ? "Edit Project" : "Add New Project"}</h2>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12}/> Sector</label>
                  <select name="sector" value={formData.sector} onChange={handleChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none cursor-pointer">
                    <option value="">Select Sector</option>
                    {SECTOR_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">Source / Division</label>
                  <select name="source" value={formData.source} onChange={handleChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer">
                    <option value="Sales">Sales</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>

                { isAdmin && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User size={12}/> PIC (Person In Charge)
                    </label>
                    <select name="pic" value={formData.pic} onChange={handleChange}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer">
                      <option value={sessionName}>{sessionName} (You)</option>
                      {salesEngineers.map(se => (
                        se.name !== sessionName && <option key={se.id} value={se.name}>{se.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                { formData.source === "Partnership" && (
                  <div className="space-y-1.5 animate-in fade-in zoom-in duration-200">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User size={12}/> Partnership PIC
                    </label>
                    <select name="sales_planner" value={formData.sales_planner} onChange={handleChange}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer">
                      <option value="">Select Partner</option>
                      <option value={sessionName}>{sessionName} (You)</option>
                      {salesEngineers.map(se => (
                        se.name !== sessionName && <option key={se.id} value={se.name}>{se.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Target PO</label>
                  <input name="target_po_date" type="month" value={formData.target_po_date} onChange={handleChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>

                {deal && deal.target_po_date && new Date(deal.target_po_date).toISOString().slice(0, 7) !== formData.target_po_date && (
                  <div className="space-y-1.5 animate-in fade-in zoom-in duration-200 bg-orange-50/50 p-4 rounded-xl border border-orange-100 md:col-span-2">
                    <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
                      Reason for Target PO Revision *
                    </label>
                    <textarea name="target_po_reason" value={formData.target_po_reason} onChange={handleChange} placeholder="Please explain why the Target PO date is being revised..." rows={2}
                      className="w-full p-3 bg-white border border-orange-200 rounded-lg text-sm font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all resize-none" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">Quotation Value (Rp)</label>
                  <input name="quotation" type="text" value={formData.quotation} onChange={handleChange} placeholder="e.g. 50.000.000"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>

                <div className="md:col-span-2 space-y-1.5" ref={dropdownRef}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12}/> Project Area / Location</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={searchArea} 
                      onChange={(e) => {
                        setSearchArea(e.target.value);
                        setShowAreaDropdown(true);
                      }}
                      onFocus={() => setShowAreaDropdown(true)}
                      placeholder="Search Regency or City (e.g. Jakarta Selatan)..."
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                    />
                    
                    {/* Auto-complete dropdown */}
                    <AnimatePresence>
                      {showAreaDropdown && filteredCities.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 max-h-60 overflow-y-auto custom-scrollbar overflow-x-hidden"
                        >
                          {filteredCities.map((city, idx) => (
                            <div 
                              key={idx}
                              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex flex-col"
                              onClick={() => {
                                setSearchArea(city.name);
                                setFormData(prev => ({
                                  ...prev,
                                  area: city.name,
                                  latitude: city.lat.toString(),
                                  longitude: city.lng.toString()
                                }));
                                setShowAreaDropdown(false);
                              }}
                            >
                              <span className="text-sm font-semibold text-slate-700">{city.name}</span>
                              <span className="text-[10px] text-slate-400">Lat: {city.lat}, Lng: {city.lng}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
                            {h.field_changed === 'new_deal' ? 'Project Created' : 
                             h.field_changed === 'status' ? 'Status Changed' : 
                             h.field_changed === 'quotation' ? 'Budget Revised' : 
                             h.field_changed === 'est_booking_month' || h.field_changed === 'target_po_date' ? 'Timeline Revised' : 
                             h.field_changed === 'is_closed' ? 'Closure Status Updated' :
                             'Details Updated'}
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
