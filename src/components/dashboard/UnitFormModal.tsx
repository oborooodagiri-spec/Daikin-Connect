"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Building2, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createUnit, updateUnit } from "@/app/actions/units";

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  projectId: string;
  unit?: any;
  mode: "create" | "edit";
  enabledTypes?: string;
  monitoringFocus?: string;
}

export default function UnitFormModal({ 
  isOpen, onClose, onRefresh, projectId, unit, mode, 
  enabledTypes = "VRV,Split,Package,Chiller",
  monitoringFocus = "UNIT"
}: UnitFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    unit_type: "VRV", brand: "Daikin", model: "", 
    capacity: "0", yoi: new Date().getFullYear().toString(),
    serial_number: "", tag_number: "", area: "",
    building_floor: "", room_tenant: "", status: "Normal"
  });

  useEffect(() => {
    const types = enabledTypes.split(",");
    if (unit && mode === "edit") {
      setFormData({
        unit_type: unit.unit_type || types[0],
        brand: unit.brand || "Daikin",
        model: unit.model || "",
        capacity: unit.capacity || "",
        yoi: unit.yoi?.toString() || new Date().getFullYear().toString(),
        serial_number: unit.serial_number || "",
        tag_number: unit.tag_number || "",
        area: unit.area || "",
        building_floor: unit.building_floor || "",
        room_tenant: unit.room_tenant || "",
        status: unit.status || "Normal"
      });
    } else {
      setFormData({
        unit_type: types[0], brand: "Daikin", model: "", 
        capacity: "0", yoi: new Date().getFullYear().toString(),
        serial_number: "", tag_number: "", area: "",
        building_floor: "", room_tenant: "", status: "Normal"
      });
    }
  }, [unit, mode, isOpen, enabledTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let res;
    if (mode === "edit" && unit?.id) {
      res = await updateUnit(unit.id, formData);
    } else {
      res = await createUnit(projectId, formData);
    }
    
    if (res && "success" in res && res.success) {
      onRefresh();
      onClose();
    } else {
      alert((res as any)?.error || "Failed to save data.");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#323338]/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 custom-scrollbar">
             <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-[#323338] tracking-tight uppercase">
                    {mode === "create" ? "Add New Asset" : "Edit Asset Details"}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Management</p>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-colors"><X size={20}/></button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Type</label>
                    <select 
                      value={formData.unit_type} 
                      onChange={e => setFormData({...formData, unit_type: e.target.value})} 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all"
                    >
                       {enabledTypes.split(",").map((t) => (
                         <option key={t} value={t}>{t}</option>
                       ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Health Status</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})} 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all"
                    >
                       <option value="Normal">Normal</option>
                       <option value="Problem">Problem</option>
                       <option value="Critical">Critical</option>
                       <option value="Warning">Warning</option>
                       <option value="Pending">Pending</option>
                       <option value="On_Progress">On Progress</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tag Number (Identity)</label>
                    <input type="text" value={formData.tag_number} onChange={e => setFormData({...formData, tag_number: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" placeholder="e.g. DKN-001" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serial Number</label>
                    <input type="text" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" placeholder="Manufacturer S/N" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                    <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model Name</label>
                    <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity (Btu/h)</label>
                    <input type="text" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Building/Area</label>
                    <input type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" placeholder="e.g. Tower A" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Floor</label>
                    <input type="text" value={formData.building_floor} onChange={e => setFormData({...formData, building_floor: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" placeholder="e.g. 12th Floor" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{monitoringFocus === 'ROOM' ? 'Room Name' : 'Tenant/Room'}</label>
                    <input type="text" value={formData.room_tenant} onChange={e => setFormData({...formData, room_tenant: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" placeholder="Specific location" />
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50 flex items-center justify-end gap-3">
                   <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-2xl bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                   <button 
                     type="submit" 
                     disabled={loading}
                     className="px-8 py-3.5 rounded-2xl bg-[#323338] text-white font-black uppercase text-[10px] tracking-widest hover:bg-black shadow-xl transition-all flex items-center gap-2"
                   >
                      {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                      {mode === "create" ? "Create Asset" : "Update Changes"}
                   </button>
                </div>
             </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
