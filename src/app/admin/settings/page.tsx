"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Settings, Search, Filter, CheckCircle2, 
  X, Save, Activity, Building2, ClipboardCheck, 
  Wrench, AlertTriangle, Terminal, ArrowLeft, MapPin, Cog,
  LayoutGrid, Map, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAllProjectsConfig, 
  updateProjectSettings, 
  getAllCustomersForFilter,
  updateProjectLocation
} from "@/app/actions/projects_config";
import { getSession } from "@/app/actions/auth";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/admin/MapPicker"), { 
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Map Interface...</div>
});

const FORM_TYPES = [
  { id: "Audit", label: "Audit", icon: ClipboardCheck, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "Preventive", label: "Preventive", icon: Wrench, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "Corrective", label: "Complain/Problem", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
  { id: "Corrective_Maintenance", label: "Corrective", icon: Cog, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "DailyLog", label: "Daily Log", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" }
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const s = await getSession();
      const userRoles = (s?.roles as string[] || []).map(r => r.toLowerCase());
      const isAdmin = userRoles.some(r => r.includes("admin") || r.includes("administrator"));
      
      if (!s || !isAdmin) {
        router.push("/home");
        return;
      }
      setSession(s);
      loadData();
    };
    init();
  }, [router]);

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
    const list = (currentForms || "").split(",").filter(Boolean);
    let updated;
    if (list.includes(formId)) {
      updated = list.filter(f => f !== formId);
    } else {
      updated = [...list, formId];
    }
    const updatedStr = updated.join(",");

    setUpdatingId(`${projectId}-${formId}`);
    startTransition(async () => {
      const res = await updateProjectSettings(projectId, { enabled_forms: updatedStr });
      if ("success" in res && res.success) {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, enabled_forms: updatedStr } : p
        ));
      }
      setUpdatingId(null);
    });
  };

  const handleUpdateAdvanced = async (projectId: string, payload: any) => {
    setUpdatingId(`adv-${projectId}`);
    const res = await updateProjectSettings(projectId, payload);
    if ("success" in res && res.success) {
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, ...payload } : p
      ));
      setIsOptionsOpen(false);
    } else {
      alert("Error: " + (res.error || "Unknown error"));
    }
    setUpdatingId(null);
  };

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

  const filteredProjects = projects.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) || 
                         (p.customerName || "").toLowerCase().includes((searchQuery || "").toLowerCase());
    const matchesCustomer = customerFilter === "all" || p.customerId === customerFilter;
    return matchesSearch && matchesCustomer;
  });

  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Opening System Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:p-20">
      <div className="max-w-[1500px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-slate-100">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#003366] border border-[#004488] text-[10px] font-black uppercase tracking-widest text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Operational Configuration Hub</span>
            </div>
            <h1 className="text-5xl font-black text-[#003366] tracking-tight">
              System <span className="text-[#00a1e4]">Settings</span>
            </h1>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.3em] italic">
              Configure project capabilities, geo-locking, and monitoring focus platform-wide.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-72 group">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm appearance-none cursor-pointer"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              >
                <option value="all">Filter by Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-600" />
              <input 
                type="text"
                placeholder="Search site name..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all placeholder:text-slate-400 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse isolate min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">Workspace Identity</th>
                  {FORM_TYPES.map(type => (
                    <th key={type.id} className="px-6 py-8 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-3">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${type.bg} ${type.color} shadow-sm`}>
                            <type.icon size={18} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{type.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Geo-Lock</th>
                  <th className="px-6 py-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Advanced</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-10 py-32 text-center text-slate-300">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Config...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-10 py-32 text-center">
                         <div className="inline-flex flex-col items-center gap-8 p-16 rounded-[4rem] bg-slate-50/50 border border-dashed border-slate-200">
                            <Terminal className="w-16 h-16 text-slate-100" />
                            <div className="space-y-3">
                              <p className="text-2xl font-black text-[#003366] tracking-tight">System Index Empty</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching workspaces found in the directory</p>
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
                        className="group hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center font-black text-slate-200 shadow-sm group-hover:border-blue-200 group-hover:text-[#00a1e4] transition-all text-xl">
                              {(project.name || "U").charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black text-[#00a1e4] uppercase tracking-widest mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                {project.customerName}
                                <span className="text-slate-300">•</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] ${project.monitoring_focus === 'ROOM' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {project.monitoring_focus === 'ROOM' ? 'ROOM-BASED' : 'UNIT-BASED'}
                                </span>
                              </p>
                              <p className="text-base font-black text-[#003366] tracking-tight truncate max-w-[250px]">
                                {project.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {FORM_TYPES.map(type => {
                          const isEnabled = (project.enabled_forms || "").split(",").includes(type.id);
                          const isThisUpdating = updatingId === `${project.id}-${type.id}`;

                          return (
                            <td key={type.id} className="px-6 py-8 text-center">
                              <button 
                                onClick={() => handleToggle(project.id, type.id, project.enabled_forms)}
                                disabled={isThisUpdating}
                                className={`
                                  relative w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all duration-300 transform active:scale-90 shadow-sm
                                  ${isEnabled 
                                    ? `${type.bg} ${type.color} border-2 border-transparent` 
                                    : "bg-white border-2 border-slate-100 text-slate-200 hover:border-slate-200 hover:text-slate-300"}
                                  ${isThisUpdating ? "opacity-30 scale-110" : ""}
                                `}
                              >
                                {isThisUpdating ? (
                                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : isEnabled ? (
                                  <CheckCircle2 size={24} />
                                ) : (
                                  <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20" />
                                )}
                              </button>
                            </td>
                          );
                        })}

                        <td className="px-6 py-8 text-center">
                           <button 
                             onClick={() => handlePinLocation(project.id)}
                             disabled={updatingId?.startsWith('pin-')}
                             className={`w-14 h-14 rounded-2xl mx-auto flex flex-col items-center justify-center transition-all border-2 
                               ${project.latitude ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-300 hover:border-blue-100 hover:text-[#00a1e4]'}
                               ${updatingId === `pin-${project.id}` ? 'animate-pulse scale-95' : 'active:scale-90'}
                             `}
                           >
                              {updatingId === `pin-${project.id}` ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <MapPin size={20} />
                                  <span className="text-[8px] font-black uppercase mt-1.5 tracking-tighter">
                                     {project.latitude ? 'LOCKED' : 'PIN'}
                                  </span>
                                </>
                              )}
                           </button>
                        </td>

                         <td className="px-6 py-8 text-center">
                           <button 
                             onClick={() => {
                               setSelectedProject(project);
                               setIsOptionsOpen(true);
                             }}
                             className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-all bg-slate-50 border border-slate-100 text-slate-300 hover:bg-[#003366] hover:text-white shadow-sm"
                           >
                              <Cog size={22} />
                           </button>
                        </td>

                        <td className="px-10 py-8 text-right">
                           <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest
                              ${project.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                             <div className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
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
          <div className="p-10 bg-slate-50/50 border-t border-slate-100 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center justify-center gap-4">
               <ShieldCheck size={14} /> SECURITY PROTOCOL V3.1 ENFORCED • AUTHORIZED ACCESS ONLY
             </p>
          </div>
        </div>

        <AnimatePresence>
          {isOptionsOpen && selectedProject && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOptionsOpen(false)}
                className="absolute inset-0 bg-[#003366]/60 backdrop-blur-md"
              />
              <ProjectOptionsModal 
                project={selectedProject}
                onClose={() => setIsOptionsOpen(false)}
                onSave={handleUpdateAdvanced}
                isUpdating={updatingId === `adv-${selectedProject.id}`}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProjectOptionsModal({ project, onClose, onSave, isUpdating }: any) {
  const [unitTypes, setUnitTypes] = useState<string[]>((project?.enabled_unit_types || "").split(",").filter(Boolean));
  const [focus, setFocus] = useState(project?.monitoring_focus || 'UNIT');
  const [lat, setLat] = useState(project?.latitude?.toString() || "");
  const [lng, setLng] = useState(project?.longitude?.toString() || "");
  const [radius, setRadius] = useState(project?.radius_meters?.toString() || "100");

  const OPTIONS = ["Chiller", "AHU", "FCU", "Split Duct", "Cooling Tower"];

  const toggleUnit = (type: string) => {
    if (unitTypes.includes(type)) {
      setUnitTypes(unitTypes.filter(t => t !== type));
    } else {
      setUnitTypes([...unitTypes, type]);
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
    >
      <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-blue-100 text-[#003366] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-900/10 border border-blue-200">
              <Cog size={28} />
           </div>
           <div>
              <h3 className="text-2xl font-black text-[#003366] uppercase tracking-tight">Advanced Config</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 italic">{project.name}</p>
           </div>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors shadow-sm bg-white">
          <X size={20} />
        </button>
      </div>

      <div className="p-12 space-y-12">
         <div className="space-y-6">
            <label className="text-[11px] font-black text-[#003366] uppercase tracking-[0.2em] flex items-center gap-3">
              <LayoutGrid size={16} className="text-[#00a1e4]" /> Active Unit Types
            </label>
            <div className="grid grid-cols-2 gap-3">
               {OPTIONS.map(opt => (
                 <button 
                   key={opt}
                   onClick={() => toggleUnit(opt)}
                   className={`px-6 py-4 rounded-[1.5rem] border-2 text-[10px] font-black uppercase tracking-widest transition-all
                      ${unitTypes.includes(opt) ? 'bg-blue-50 border-[#00a1e4] text-[#003366] shadow-lg shadow-blue-500/10' : 'bg-white border-slate-50 text-slate-300 hover:border-blue-100 hover:text-blue-400'}`}
                 >
                    {opt}
                 </button>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <label className="text-[11px] font-black text-[#003366] uppercase tracking-[0.2em] flex items-center gap-3">
              <MapPin size={16} className="text-[#00a1e4]" /> Geofencing Data
            </label>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
                  <input 
                    type="number" step="any" value={lat} onChange={e => setLat(e.target.value)}
                    placeholder="-6.1754"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude</label>
                  <input 
                    type="number" step="any" value={lng} onChange={e => setLng(e.target.value)}
                    placeholder="106.8272"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                  />
               </div>
            </div>

            <MapPicker 
               lat={lat ? parseFloat(lat) : null} 
               lng={lng ? parseFloat(lng) : null} 
               onChange={(newLat, newLng) => {
                  setLat(newLat.toString());
                  setLng(newLng.toString());
               }} 
            />

            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Radius (Meters)</label>
               <input 
                 type="number" value={radius} onChange={e => setRadius(e.target.value)}
                 placeholder="100"
                 className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-100 outline-none"
               />
               <p className="text-[9px] text-slate-400 font-medium italic">* Jarak toleransi maksimal untuk absensi.</p>
            </div>
         </div>

         <div className="space-y-6">
            <label className="text-[11px] font-black text-[#003366] uppercase tracking-[0.2em] flex items-center gap-3">
              <Map size={16} className="text-[#00a1e4]" /> Monitoring Focus
            </label>
            <div className="flex bg-slate-50 p-2 rounded-[2rem] border border-slate-100 gap-2">
               <button 
                 onClick={() => setFocus('UNIT')}
                 className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${focus === 'UNIT' ? 'bg-white text-[#003366] shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Physical Asset
               </button>
               <button 
                 onClick={() => setFocus('ROOM')}
                 className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${focus === 'ROOM' ? 'bg-white text-[#003366] shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Space / Room
               </button>
            </div>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic px-4 bg-slate-50/50 py-3 rounded-2xl border border-dashed border-slate-200">
              * Room-based monitoring changes system labels from "Unit" to "Room" across the portal.
            </p>
         </div>
      </div>

      <div className="p-10 bg-slate-50/80 border-t border-slate-100 flex gap-4">
         <button 
           onClick={onClose}
           className="flex-1 py-4 bg-white border border-slate-200 text-[#003366] text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
         >
            Discard
         </button>
         <button 
           onClick={() => onSave(project.id, {
             enabled_unit_types: unitTypes.join(","),
             monitoring_focus: focus,
             latitude: lat ? parseFloat(lat) : null,
             longitude: lng ? parseFloat(lng) : null,
             radius_meters: radius ? parseInt(radius) : 100
           })}
           disabled={isUpdating || unitTypes.length === 0}
           className="flex-[2] py-4 bg-[#003366] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-blue-900/30 hover:bg-[#00a1e4] transition-all disabled:opacity-50"
         >
            {isUpdating ? 'Synchronizing...' : 'Apply Config'}
         </button>
      </div>
    </motion.div>
  );
}
