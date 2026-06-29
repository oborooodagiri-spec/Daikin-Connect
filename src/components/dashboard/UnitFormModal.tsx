"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Save, Building2, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createUnit, updateUnit } from "@/app/actions/units";
import { getUnitTypeCategories } from "@/app/actions/unit_database";

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

// Helper: Find the first valid child option from categories
function getFirstValidChild(categories: any[]): string {
  for (const parent of categories.filter((c: any) => c.parent_id === null)) {
    const children = categories.filter((c: any) => c.parent_id === parent.id);
    if (children.length > 0) {
      const child = children[0];
      const grandchildren = categories.filter((c: any) => c.parent_id === child.id);
      if (grandchildren.length > 0) {
        return `${parent.name} > ${child.name} > ${grandchildren[0].name}`;
      }
      return `${parent.name} > ${child.name}`;
    }
  }
  // If no parent-child structure, return first category name
  if (categories.length > 0) return categories[0].name;
  return "";
}

// Helper: Parse display label from "Parent > Child > Grandchild" format
function parseDisplayLabel(value: string): { path: string; name: string } {
  if (value.includes(" > ")) {
    const parts = value.split(" > ");
    const name = parts.pop() || "";
    const path = parts.join(" → ");
    return { path, name };
  }
  return { path: "", name: value };
}

export default function UnitFormModal({ 
  isOpen, onClose, onRefresh, projectId, unit, mode, 
  enabledTypes = "VRV,Split,Package,Chiller",
  monitoringFocus = "UNIT"
}: UnitFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const hasUserInteracted = useRef(false);
  const [formData, setFormData] = useState({
    unit_type: "", brand: "Daikin", model: "", 
    capacity: "0", yoi: new Date().getFullYear().toString(),
    serial_number: "", tag_number: "", area: "",
    building_floor: "", room_tenant: "", status: "Normal"
  });

  // Fetch categories once when modal opens
  useEffect(() => {
    if (isOpen) {
      hasUserInteracted.current = false;
      setCategoriesLoaded(false);
      async function fetchCategories() {
        const res = await getUnitTypeCategories();
        if (res && "success" in res && res.success && res.data) {
          setDbCategories(res.data);
        }
        setCategoriesLoaded(true);
      }
      fetchCategories();
    }
  }, [isOpen]);

  // Initialize form ONLY when modal opens or categories finish loading (not on every change)
  useEffect(() => {
    if (!isOpen || !categoriesLoaded) return;
    // Don't reset if user has already started interacting
    if (hasUserInteracted.current) return;

    const types = enabledTypes.split(",");

    if (unit && mode === "edit") {
      // For edit mode, preserve the existing unit_type from DB
      setFormData({
        unit_type: unit.unit_type || (dbCategories.length > 0 ? getFirstValidChild(dbCategories) : types[0]),
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
      // For create mode, use first valid child (not parent/optgroup)
      const defaultType = dbCategories.length > 0 
        ? getFirstValidChild(dbCategories) 
        : types[0];
      
      setFormData({
        unit_type: defaultType,
        brand: "Daikin", model: "", 
        capacity: "0", yoi: new Date().getFullYear().toString(),
        serial_number: "", tag_number: "", area: "",
        building_floor: "", room_tenant: "", status: "Normal"
      });
    }
  }, [isOpen, categoriesLoaded, unit, mode, enabledTypes]);

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

  // Handle user interaction with the select
  const handleUnitTypeChange = (value: string) => {
    hasUserInteracted.current = true;
    setFormData({...formData, unit_type: value});
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
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Type / Category</label>
                    <select 
                      value={formData.unit_type} 
                      onChange={e => handleUnitTypeChange(e.target.value)} 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all"
                    >
                       {dbCategories.length > 0 ? (
                         <>
                           {/* Fallback for legacy data */}
                           {formData.unit_type && !dbCategories.some((c: any) => c.name === formData.unit_type || dbCategories.some((p: any) => `${p.name} > ${c.name}` === formData.unit_type)) && (
                             <option value={formData.unit_type}>{formData.unit_type} (Legacy)</option>
                           )}
                           
                           {dbCategories.filter((c: any) => c.parent_id === null).map((parent: any) => {
                             const children = dbCategories.filter((c: any) => c.parent_id === parent.id);
                             if (children.length > 0) {
                               return (
                                 <optgroup key={parent.id} label={parent.name}>
                                   {children.map((child: any) => {
                                     const grandchildren = dbCategories.filter((c: any) => c.parent_id === child.id);
                                     
                                     if (grandchildren.length > 0) {
                                       return (
                                         <React.Fragment key={child.id}>
                                           <option disabled className="font-bold text-slate-800 bg-slate-100">
                                             ── {child.name} ──
                                           </option>
                                           {grandchildren.map((grandchild: any) => {
                                             const val = `${parent.name} > ${child.name} > ${grandchild.name}`;
                                             return (
                                               <option key={grandchild.id} value={val}>
                                                 &nbsp;&nbsp;&nbsp;&nbsp;{grandchild.name}
                                               </option>
                                             );
                                           })}
                                         </React.Fragment>
                                       );
                                     }
                                     
                                     const val = `${parent.name} > ${child.name}`;
                                     return (
                                       <option key={child.id} value={val}>{child.name}</option>
                                     );
                                   })}
                                 </optgroup>
                               );
                             }
                             return <option key={parent.id} value={parent.name}>{parent.name}</option>;
                           })}
                         </>
                       ) : (
                         enabledTypes.split(",").map((t) => (
                           <option key={t} value={t}>{t}</option>
                         ))
                       )}
                    </select>
                    {/* Show selected category info */}
                    {formData.unit_type.includes(" > ") && (
                      <p className="text-[9px] font-bold text-blue-400 ml-1 mt-1">
                        📂 {parseDisplayLabel(formData.unit_type).path} → {parseDisplayLabel(formData.unit_type).name}
                      </p>
                    )}
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
