"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProjectsByCustomer, createProject, updateProject, toggleProjectStatus, getCustomerData } from "@/app/actions/projects";
import { getSession } from "@/app/actions/auth";
import { 
  Building2, Search, ArrowLeft, Bookmark, 
  MapPin, Plus, Edit2, Activity, CheckCircle2, 
  Power, PowerOff, X, Save, BarChart3, FolderGit2, CalendarDays,
  Target as TargetIcon, Calendar as CalendarIcon, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProjectProgress } from "@/app/actions/project_targets";
import ProjectTargetModal from "@/components/ProjectTargetModal";
import ScheduleCalendarModal from "@/components/ScheduleCalendarModal";
import ProgressIndicator from "@/components/ProgressIndicator";
import Portal from "@/components/Portal";

export default function ProjectsPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: "", code: "" });

  // Progress & Modal State for Targets/Schedules
  const [projectProgress, setProjectProgress] = useState<Record<string, any>>({});
  const [activeTargetProject, setActiveTargetProject] = useState<any>(null);
  const [activeScheduleProject, setActiveScheduleProject] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    const [custRes, projRes, sessionRes] = await Promise.all([
      getCustomerData(customerId),
      getProjectsByCustomer(customerId),
      getSession()
    ]);
    
    if (custRes.error) {
      setError(custRes.error);
    } else {
      setCustomer(custRes.data);
    }

    setSession(sessionRes);

    if (projRes.error) {
      setError(projRes.error);
    } else {
      const projs = projRes.data || [];
      setProjects(projs);
      
      // Fetch progress for each project
      projs.forEach(async (p: any) => {
        const progRes = await getProjectProgress(p.id);
        if (progRes.success) {
          setProjectProgress(prev => ({ ...prev, [p.id]: progRes.data }));
        }
      });
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [customerId]);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const isActivating = currentStatus === 'archived';
    if (!confirm(isActivating ? "Reactivate this project?" : "Suspend this project?")) return;
    
    startTransition(async () => {
      const res = await toggleProjectStatus(customerId, id, currentStatus);
      if (res.success) fetchData();
    });
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditId(null);
    setFormData({ name: "", code: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (project: any) => {
    setModalMode("edit");
    setEditId(project.id);
    setFormData({ name: project.name, code: project.code || "" });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    startTransition(async () => {
      let res;
      if (modalMode === "create") {
        res = await createProject(customerId, formData);
      } else if (modalMode === "edit" && editId) {
        res = await updateProject(customerId, editId, formData);
      }
      
      if (res?.success) {
        closeModal();
        fetchData();
      } else {
        alert(res?.error || "An error occurred");
      }
    });
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full">
        <h2 className="text-3xl font-black text-[#003366] tracking-tight mb-2">Error</h2>
        <p className="text-slate-500 text-sm max-w-sm">{error}</p>
        <Link href="/dashboard/customers" className="mt-6 text-blue-600 font-bold text-sm tracking-widest uppercase hover:underline">
          Return to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-4">
          <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors w-max">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Directory</span>
          </Link>
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Project Management</span>
            </div>
            <h1 className="text-4xl font-black text-[#003366] tracking-tight flex items-center gap-3">
              {customer?.name || "Customer"} 
              <span className="text-slate-300">/</span> 
              <span className="text-[#00a1e4]">Projects</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-3 mt-4">
              Managing {projects.length} Active Sites
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-72 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-600" />
            <input 
              type="text"
              placeholder="Search projects..."
              className="w-full pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={openCreateModal}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#00a1e4] hover:bg-[#008cc6] text-white rounded-2xl text-sm font-bold shadow-[0_8px_16px_-6px_rgba(0,161,228,0.4)] transition-all flex justify-center items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse isolate min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Project Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Project Code</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Progress</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Quick Links</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
                        <div className="relative w-10 h-10">
                          <div className="absolute inset-0 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Projects...</p>
                      </motion.div>
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <p className="text-sm font-bold text-slate-400 mb-2">No projects found.</p>
                      <p className="text-xs text-slate-400 font-medium">Add a new project or adjust your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project, index) => {
                    const isActive = project.status === 'active';
                    return (
                    <motion.tr 
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`transition-colors group ${!isActive ? 'bg-slate-50/50' : 'hover:bg-indigo-50/30'}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-black text-xl shrink-0 transition-colors
                            ${isActive ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {project.name?.charAt(0).toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? 'text-blue-500' : 'text-slate-300'}`}>
                              {project.customerName}
                            </p>
                            <p className={`text-base font-black tracking-tight ${isActive ? 'text-[#003366]' : 'text-slate-400'}`}>
                              {project.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-300" />
                          <p className={`text-xs font-bold ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>{project.code}</p>
                        </div>
                      </td>

                      <td className="px-8 py-5 min-w-[200px]">
                        {isActive ? (
                          <div className="space-y-3">
                             {projectProgress[project.id] ? (
                                projectProgress[project.id].map((p: any) => (
                                  <ProgressIndicator key={p.type} size="sm" label={p.type} percentage={p.percentage} color={p.type === 'Preventive' ? 'indigo' : p.type === 'Corrective' ? 'rose' : 'amber'} />
                                ))
                             ) : (
                               <div className="h-1.5 w-32 bg-slate-100 rounded-full animate-pulse" />
                             )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase italic">N/A (Archived)</span>
                        )}
                      </td>

                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2 w-max">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {isActive ? <CheckCircle2 size={12} /> : <Activity size={12} />}
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {isActive ? "Active" : "Archived"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <div className="flex gap-3 justify-center">
                          <Link href={`/dashboard/customers/${customerId}/projects/${project.id}/units`} className={`inline-flex flex-col items-center justify-center p-3 w-16 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:ring-2 hover:ring-indigo-100
                            ${isActive ? 'bg-white text-indigo-700 hover:border-indigo-300 cursor-pointer' : 'bg-slate-50 text-slate-400 cursor-not-allowed pointer-events-none'}`}>
                            <BarChart3 size={14} className={isActive ? "text-indigo-400 mb-1" : "opacity-50"} />
                            <span className="text-sm font-black leading-none">{project.units_count}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-70 mt-1">Units</span>
                          </Link>
                          <Link 
                            href={`/dashboard/schedules?projectId=${project.id}`}
                            className={`inline-flex flex-col items-center justify-center p-3 w-16 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:ring-2 hover:ring-blue-100
                            ${isActive ? 'bg-white text-blue-700 hover:border-blue-300 cursor-pointer' : 'bg-slate-50 text-slate-400 cursor-not-allowed pointer-events-none'}`}>
                            <CalendarDays size={14} className={isActive ? "text-blue-400 mb-1" : "opacity-50"} />
                            <span className="text-sm font-black leading-none">{project.schedules_count || 0}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-70 mt-1">Tasks</span>
                          </Link>
                          
                          <div className="w-[1px] h-8 bg-slate-100 self-center mx-1" />

                          <button 
                            onClick={() => setActiveTargetProject(project)}
                            className={`inline-flex flex-col items-center justify-center p-3 w-16 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:ring-2 hover:ring-rose-100
                            ${isActive ? 'bg-white text-rose-700 hover:border-rose-300 cursor-pointer' : 'bg-slate-50 text-slate-400 cursor-not-allowed pointer-events-none'}`}>
                            <TargetIcon size={14} className={isActive ? "text-rose-400 mb-1" : "opacity-50"} />
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-70 mt-1">Target</span>
                          </button>

                          <button 
                            onClick={() => setActiveScheduleProject(project)}
                            className={`inline-flex flex-col items-center justify-center p-3 w-16 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:ring-2 hover:ring-emerald-100
                            ${isActive ? 'bg-white text-emerald-700 hover:border-emerald-300 cursor-pointer' : 'bg-slate-50 text-slate-400 cursor-not-allowed pointer-events-none'}`}>
                            <CalendarIcon size={14} className={isActive ? "text-emerald-400 mb-1" : "opacity-50"} />
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-70 mt-1">Schedule</span>
                          </button>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-right w-32">
                        <div className="flex flex-col items-end gap-2 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                          
                          <button 
                            onClick={() => openEditModal(project)}
                            disabled={isPending}
                            className="bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-500 p-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
                            title="Edit Project"
                          >
                            <span className="text-[9px] font-black uppercase tracking-wider hidden sm:block pl-1">Edit</span>
                            <Edit2 size={14} />
                          </button>

                          <button 
                            onClick={() => handleToggleStatus(project.id, project.status)}
                            disabled={isPending}
                            className={`p-2 rounded-xl transition-all border shadow-sm flex items-center gap-2 ${
                              isActive 
                                ? "bg-white border-slate-200 hover:border-rose-300 hover:text-rose-600 text-slate-400" 
                                : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                            }`}
                            title={isActive ? "Archive Project" : "Reactivate Project"}
                          >
                            <span className="text-[9px] font-black uppercase tracking-wider hidden sm:block pl-1">
                              {isActive ? "Archive" : "Activate"}
                            </span>
                            {isActive ? <PowerOff size={14} /> : <Power size={14} />}
                          </button>

                        </div>
                      </td>
                    </motion.tr>
                  )})
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CRUD Form Modal --- */}
      <Portal>
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={closeModal}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white border border-slate-200 rounded-3xl shadow-2xl relative z-10 w-full max-w-md overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  {/* ... rest of the code remains the same ... */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-200">
                      <FolderGit2 size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#003366] tracking-tight">
                        {modalMode === 'create' ? 'New Project' : 'Edit Project'}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Site Details</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col">
                  <div className="p-6 space-y-4 bg-white">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" required
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all shadow-sm"
                        placeholder="e.g. Mall Branch 1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project/Site Code</label>
                      <input 
                        type="text"
                        value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all shadow-sm"
                        placeholder="e.g. PRJ-001"
                      />
                    </div>
                  </div>
                  <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="submit" disabled={isPending} className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2">
                      {isPending ? "Processing..." : "Save Record"}
                      {!isPending && <Save size={14} />}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>

      {/* --- Progress & Schedule Modals --- */}
      {activeTargetProject && (
        <Portal>
          <ProjectTargetModal 
            isOpen={!!activeTargetProject} 
            onClose={() => { setActiveTargetProject(null); fetchData(); }}
            projectId={activeTargetProject.id}
            projectName={`${activeTargetProject.customerName} - ${activeTargetProject.name}`}
            unitCount={activeTargetProject.units_count}
          />
        </Portal>
      )}

      {activeScheduleProject && (
        <Portal>
          <ScheduleCalendarModal 
            isOpen={!!activeScheduleProject}
            onClose={() => { setActiveScheduleProject(null); fetchData(); }}
            projectId={activeScheduleProject.id}
            projectName={`${activeScheduleProject.customerName} - ${activeScheduleProject.name}`}
          />
        </Portal>
      )}

    </div>
  );
}
