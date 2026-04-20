"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Settings, Search, Filter, CheckCircle2, 
  X, Save, Activity, Building2, ClipboardCheck, 
  Wrench, AlertTriangle, Terminal, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAllProjectsConfig, 
  updateProjectCapabilities, 
  getAllCustomersForFilter,
  updateProjectLocation
} from "@/app/actions/projects_config";
import Link from "next/link";

const FORM_TYPES = [
  { id: "Audit", label: "Audit", icon: ClipboardCheck, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "Preventive", label: "Preventive", icon: Wrench, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "Corrective", label: "Corrective", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
  { id: "DailyLog", label: "Daily Log", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" }
];

export default function SettingsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [projRes, custRes] = await Promise.all([
      getAllProjectsConfig(),
      getAllCustomersForFilter()
    ]);

    if (projRes && "success" in projRes && projRes.success) setProjects(projRes.data || []);
    if (custRes && "success" in custRes && custRes.success) setCustomers(custRes.data || []);
    setLoading(false);
  };

  const handleToggle = (projectId: string, formId: string, currentForms: string) => {
    const list = currentForms.split(",").filter(Boolean);
    let updated;
    if (list.includes(formId)) {
      updated = list.filter(f => f !== formId);
    } else {
      updated = [...list, formId];
    }
    const updatedStr = updated.join(",");

    setUpdatingId(`${projectId}-${formId}`);
    startTransition(async () => {
      const res = await updateProjectCapabilities(projectId, updatedStr);
      if ("success" in res && res.success) {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, enabled_forms: updatedStr } : p
        ));
      }
      setUpdatingId(null);
    });
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCustomer = customerFilter === "all" || p.customerId === customerFilter;
    return matchesSearch && matchesCustomer;
  });

  const handlePinLocation = async (projectId: string) => {
    if (!navigator.geolocation) {
       alert("Geolocation is not supported by this browser.");
       return;
    }

    setUpdatingId(`pin-${projectId}`);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await updateProjectLocation(projectId, pos.coords.latitude, pos.coords.longitude);
        if ("success" in res && res.success) {
           setProjects(prev => prev.map(p => 
             p.id === projectId ? { ...p, latitude: pos.coords.latitude, longitude: pos.coords.longitude } : p
           ));
           alert("✨ SITE PINNED SUCCESSFULLY! Location has been locked to this site.");
        } else {
           alert("Error saving location: " + (res.error || "Unknown error"));
        }
        setUpdatingId(null);
      },
      (err) => {
        alert("Failed to get your current location. Please ensure GPS is active and permissions are granted.");
        setUpdatingId(null);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors w-max">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <Settings className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </div>
            <h1 className="text-4xl font-black text-[#003366] tracking-tight">
              Project <span className="text-[#00a1e4]">Capabilities</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.3em] mt-2">
              Centralized Operational Configuration Hub
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Customer Filter */}
          <div className="relative w-full sm:w-60 group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              className="w-full pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-sm appearance-none"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            >
              <option value="all">ALL CUSTOMERS</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-600" />
            <input 
              type="text"
              placeholder="Search site name..."
              className="w-full pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm uppercase tracking-tighter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse isolate min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">Site & Partner</th>
                {FORM_TYPES.map(type => (
                  <th key={type.id} className="px-6 py-6 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-2">
                       <div className={`p-2 rounded-xl ${type.bg} ${type.color}`}>
                          <type.icon size={16} />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{type.label}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">Geo-Lock</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-10 py-32 text-center text-slate-300">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing Database...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-10 py-32 text-center">
                       <div className="inline-flex flex-col items-center gap-6 p-12 rounded-[3rem] bg-slate-50/50 border border-dashed border-slate-200">
                          <Terminal className="w-12 h-12 text-slate-200" />
                          <div className="space-y-2">
                            <p className="text-xl font-black text-slate-400 tracking-tight">System Index Clear</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching projects found in directory</p>
                          </div>
                       </div>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project, idx) => (
                    <motion.tr 
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group hover:bg-slate-50/30 transition-all duration-300"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-300 shadow-sm group-hover:border-blue-200 group-hover:text-blue-500 transition-all">
                            {project.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              {project.customerName}
                            </p>
                            <p className="text-base font-black text-slate-800 tracking-tight">
                              {project.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {FORM_TYPES.map(type => {
                        const isEnabled = project.enabled_forms.split(",").includes(type.id);
                        const isThisUpdating = updatingId === `${project.id}-${type.id}`;

                        return (
                          <td key={type.id} className="px-6 py-6 text-center">
                            <button 
                              onClick={() => handleToggle(project.id, type.id, project.enabled_forms)}
                              disabled={isThisUpdating}
                              className={`
                                relative w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-all duration-500 transform active:scale-90
                                ${isEnabled 
                                  ? `${type.bg} ${type.color} ring-4 ring-slate-50 shadow-lg shadow-slate-200/50` 
                                  : "bg-white border-2 border-slate-100 text-slate-200 hover:border-slate-300 hover:text-slate-400"}
                                ${isThisUpdating ? "opacity-30 scale-110" : ""}
                              `}
                            >
                              {isThisUpdating ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : isEnabled ? (
                                <CheckCircle2 size={24} className="fill-current/10" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-current opacity-30" />
                              )}
                              
                              {/* Pulse Effect when enabled */}
                              {isEnabled && (
                                <div className={`absolute inset-0 rounded-2xl animate-ping opacity-20 ${type.bg}`} />
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Geo-Lock Pinning Column */}
                      <td className="px-6 py-6 text-center">
                         <button 
                           onClick={() => handlePinLocation(project.id)}
                           disabled={updatingId?.startsWith('pin-')}
                           className={`w-12 h-12 rounded-2xl mx-auto flex flex-col items-center justify-center transition-all border-2 
                             ${project.latitude ? 'bg-indigo-50 border-indigo-100 text-indigo-500 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-300 hover:border-blue-200 hover:text-blue-500'}
                             ${updatingId === `pin-${project.id}` ? 'animate-pulse scale-95' : 'active:scale-90'}
                           `}
                           title={project.latitude ? `Locked: ${project.latitude}, ${project.longitude}` : "Pin current location as site HQ"}
                         >
                            {updatingId === `pin-${project.id}` ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <MapPin size={18} />
                                <span className="text-[7px] font-black uppercase mt-1">
                                   {project.latitude ? 'LOCKED' : 'PIN'}
                                </span>
                              </>
                            )}
                         </button>
                      </td>

                      <td className="px-10 py-6 text-right">
                         <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest
                            ${project.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                           {project.status}
                         </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
