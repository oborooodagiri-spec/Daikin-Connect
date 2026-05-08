"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, Building2, CalendarCheck, 
  Clock, User as UserIcon, ArrowUpRight,
  BarChart3, Activity, AlertTriangle, Hammer, Wrench,
  ClipboardCheck, ArrowRight, FileText, Zap,
  RefreshCw, LayoutGrid, Search
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Language, t } from "@/lib/i18n";
import { getClientDashboardData, requestClientVisit } from "@/app/actions/client_dashboard";
import ProgressIndicator from "@/components/ProgressIndicator";
import ScheduleCalendarWidget from "@/components/dashboard/ScheduleCalendarWidget";

export default function ClientDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [data, setData] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<Language>("en");
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isPending, startTransition] = useTransition();

  const fetchData = async () => {
    setLoading(true);
    const res = await getClientDashboardData();
    if ("error" in res) {
      setError((res as any).error || "Failed to load dashboard data");
    } else {
      setData(res.data);
      const found = res.data.projects.find((p: any) => String(p.id) === String(projectId));
      if (found) {
        setProject(found);
      } else if (res.data.projects.length > 0) {
        setProject(res.data.projects[0]);
      }
    }
    setLoading(false);
  };

  const handleRequestVisit = async () => {
    if (!project) return;
    const res = await requestClientVisit(project.id) as any;
    if (res && "success" in res && res.success) {
      alert("Successfully requested a visit! Our team will contact you soon.");
      fetchData();
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
    const saved = localStorage.getItem("daikin_lang") as Language;
    if (saved) setLang(saved);
  }, [projectId]);

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
         <div className="w-12 h-12 border-4 border-[#f5f6f8] border-t-[#0073ea] rounded-full animate-spin" />
       </div>
     );
  }

  if (!isMounted) return null;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
         <AlertTriangle size={48} className="text-amber-500" />
         <h2 className="text-xl font-black text-[#323338] uppercase">No Project Data</h2>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">This project is not assigned to your account.</p>
      </div>
    );
  }

  const preventive = project.progress.find((p: any) => p.type === 'Preventive');
  const audit = project.progress.find((p: any) => p.type === 'Audit');
  const corrective = project.progress.find((p: any) => p.type === 'Corrective');

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "inventory", label: "Assets", icon: LayoutGrid },
  ];

  return (
    <div className="w-full flex flex-col space-y-6 pb-32 relative">
      {/* BOARD HEADER - Monday.com Style */}
      <div className="flex flex-col w-full gap-8 pb-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="space-y-1 overflow-hidden w-full">
            <h1 className="text-3xl sm:text-4xl font-black text-[#323338] tracking-tight leading-none uppercase">
              {project.name}
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
               <Building2 size={14}/> {project.customerName} · {project.unit_count} Assets
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 w-full xl:w-auto">
            <button 
              onClick={fetchData}
              className="rounded-xl px-4 py-2.5 border border-[#e6e9ef] text-slate-400 hover:text-[#0073ea] hover:border-[#0073ea] text-xs font-bold transition-all"
            >
              <RefreshCw size={14} />
            </button>
            <Link 
              href={`/w/${projectId}/client/reports`}
              className="rounded-xl px-6 py-2.5 bg-[#0073ea] text-white text-xs font-bold hover:bg-[#0060c5] transition-all whitespace-nowrap shadow-md shadow-blue-500/20"
            >
              View Reports
            </Link>
          </div>
        </div>

        {/* View Tabs - Same as Internal Dashboard */}
        <div className="flex items-center gap-1 border-b border-[#f0f3f7] pb-0.5">
           {TABS.map((tab) => {
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-6 py-3 text-xs font-bold transition-all border-b-2 relative ${isActive ? "text-[#0073ea] border-[#0073ea]" : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50 rounded-t-lg"}`}
               >
                 <tab.icon size={14} className={isActive ? "text-[#0073ea]" : "text-slate-300"} />
                 {tab.label}
               </button>
             )
           })}
        </div>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <KPICard title="Preventive" icon={Wrench} actual={preventive?.actual || 0} target={preventive?.target || 0} percentage={preventive?.percentage || 0} color="#0073ea" />
             <KPICard title="Audit" icon={ClipboardCheck} actual={audit?.actual || 0} target={audit?.target || 0} percentage={audit?.percentage || 0} color="#00c875" />
             <KPICard title="Corrective" icon={Hammer} actual={corrective?.actual || 0} target={corrective?.target || 0} percentage={corrective?.percentage || 0} color="#e44258" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
             {/* Main Column */}
             <div className="xl:col-span-8 space-y-8">
                {/* Visual Progress */}
                <div className="bg-white rounded-2xl border border-[#e6e9ef] p-6 md:p-8 shadow-sm">
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#323338] flex items-center gap-2">
                         <BarChart3 size={16} className="text-[#0073ea]" /> Operational Progress
                      </h3>
                   </div>
                   <div className="grid grid-cols-3 gap-8">
                      {project.progress.map((p: any) => (
                         <div key={p.type} className="flex flex-col items-center text-center">
                            <ProgressIndicator 
                              size="lg" label={t(p.type, lang)} 
                              percentage={p.percentage} 
                              color={p.type === 'Preventive' ? 'indigo' : p.type === 'Corrective' ? 'rose' : 'emerald'} 
                              subLabel={`${p.actual}/${p.target}`}
                            />
                         </div>
                      ))}
                   </div>
                </div>

                {/* Asset Summary */}
                <div className="bg-white rounded-2xl border border-[#e6e9ef] p-6 md:p-8 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#323338] flex items-center gap-2">
                         <Zap size={16} className="text-[#0073ea]" /> Asset Overview
                      </h3>
                      <button onClick={() => setActiveTab("inventory")} className="text-[10px] font-black text-[#0073ea] uppercase tracking-widest hover:underline underline-offset-4">
                         View All
                      </button>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <StatCard label="Total Units" value={project.unit_count} />
                      <StatCard label="Preventive Done" value={preventive?.actual || 0} />
                      <StatCard label="Audit Complete" value={audit?.actual || 0} />
                      <StatCard label="Issues Resolved" value={corrective?.actual || 0} />
                   </div>
                </div>
             </div>

             {/* Sidebar Column */}
             <div className="xl:col-span-4 space-y-6">
                {/* Next Service */}
                <div className="bg-white rounded-2xl border border-[#e6e9ef] overflow-hidden shadow-sm">
                   <div className="p-6 border-b border-[#f7f8fa] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                         <CalendarCheck size={20} />
                      </div>
                      <div>
                         <h3 className="text-xs font-black uppercase tracking-widest text-[#323338]">Next Service</h3>
                         <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Scheduled Visit</p>
                      </div>
                   </div>
                   <div className="p-6">
                      {project.next_visit ? (
                        <div className="space-y-4">
                           <div>
                              <p className="text-xl font-black text-[#323338] tracking-tight">{format(new Date(project.next_visit.date), "dd MMM yyyy")}</p>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1"><Clock size={12} /> {format(new Date(project.next_visit.date), "HH:mm")}</div>
                           </div>
                           <div className="pt-4 border-t border-[#e6e9ef] flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0073ea]"><UserIcon size={14} /></div>
                              <div>
                                 <p className="text-[9px] font-black uppercase text-slate-400">Technician</p>
                                 <p className="text-xs font-bold text-[#323338]">{project.next_visit.engineer}</p>
                              </div>
                           </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <p className="text-xs font-bold text-slate-400 italic">No visits currently planned</p>
                           <button onClick={handleRequestVisit} className="w-full py-4 bg-[#0073ea] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#005bb5] transition-all flex items-center justify-center gap-2">
                             Request Visit <ArrowUpRight size={14}/>
                           </button>
                        </div>
                      )}
                   </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-[#e6e9ef] overflow-hidden shadow-sm">
                   <div className="p-6 border-b border-[#f7f8fa]">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#323338]">Quick Actions</h3>
                   </div>
                   <div className="p-4 space-y-1">
                      <QuickLink href={`/w/${projectId}/client/reports`} icon={FileText} label="Technical Reports" />
                      <QuickLink onClick={() => setActiveTab("timeline")} icon={CalendarCheck} label="Work Plan" />
                      <QuickLink onClick={() => setActiveTab("inventory")} icon={Package} label="Asset Registry" />
                   </div>
                </div>

                {/* Site Switcher */}
                {data?.projects.length > 1 && (
                   <div className="bg-white rounded-2xl border border-[#e6e9ef] overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-[#f7f8fa]">
                         <h3 className="text-xs font-black uppercase tracking-widest text-[#323338]">Switch Site</h3>
                      </div>
                      <div className="p-4 space-y-2">
                         {data.projects.filter((p: any) => String(p.id) !== String(project.id)).map((p: any) => (
                            <button 
                               key={p.id}
                               onClick={() => router.push(`/w/${p.id}/client/dashboard`)}
                               className="w-full p-4 bg-[#f5f6f8] hover:bg-[#e6e9ef] rounded-xl text-left flex items-center justify-between transition-all group"
                            >
                               <div className="min-w-0">
                                  <p className="text-xs font-bold text-[#323338] truncate">{p.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400">{p.unit_count} units</p>
                               </div>
                               <ArrowRight size={14} className="text-slate-300 group-hover:text-[#0073ea] group-hover:translate-x-1 transition-all shrink-0" />
                            </button>
                         ))}
                      </div>
                   </div>
                )}
             </div>
          </div>
        </motion.div>
      )}

      {/* TAB: TIMELINE */}
      {activeTab === "timeline" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-8">
           <ScheduleCalendarWidget projectId={projectId} />
        </motion.div>
      )}

      {/* TAB: ASSETS */}
      {activeTab === "inventory" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
           <div className="bg-white rounded-2xl p-4 md:p-8 border border-[#e6e9ef] shadow-sm">
              <ClientAssetList projectId={projectId} />
           </div>
        </motion.div>
      )}
    </div>
  );
}

// Client Asset List (Embedded)
function ClientAssetList({ projectId }: { projectId: string }) {
   const [units, setUnits] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");

   useEffect(() => {
      async function load() {
         setLoading(true);
         try {
            const { getClientInventory } = await import("@/app/actions/client_dashboard");
            const res = await getClientInventory();
            if (res && "success" in res && res.success) {
               // Filter by projectId
               const filtered = (res.data as any[]).filter((u: any) => String(u.project_ref_id) === String(projectId));
               setUnits(filtered);
            }
         } catch (e) {}
         setLoading(false);
      }
      load();
   }, [projectId]);

   const filtered = units.filter(u => 
      (u.tag_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.room_tenant || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.model || "").toLowerCase().includes(search.toLowerCase())
   );

   if (loading) return <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#f5f6f8] border-t-[#0073ea] rounded-full animate-spin" /></div>;

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#323338] flex items-center gap-2">
               <Package size={16} className="text-[#0073ea]" /> Asset Registry
            </h3>
            <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
               <input 
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search units..." 
                  className="pl-9 pr-4 py-2.5 border border-[#e6e9ef] rounded-xl text-xs font-bold focus:outline-none focus:border-[#0073ea] transition-all w-64"
               />
            </div>
         </div>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filtered.length} units found</p>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-[#e6e9ef]">
                     <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tag Number</th>
                     <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                     <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</th>
                     <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                     <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
               </thead>
               <tbody>
                  {filtered.slice(0, 50).map((u: any) => {
                     const statusColor = u.status === 'Problem' ? 'text-[#e44258] bg-[#e44258]/10' : u.status === 'On_Progress' ? 'text-[#fdab3d] bg-[#fdab3d]/10' : 'text-[#00c875] bg-[#00c875]/10';
                     return (
                        <tr key={u.id} className="border-b border-[#f5f6f8] hover:bg-[#f5f6f8] transition-all">
                           <td className="py-3 px-4 text-xs font-black text-[#323338] uppercase">{u.tag_number || "---"}</td>
                           <td className="py-3 px-4 text-xs font-bold text-slate-500">{u.unit_type || "---"}</td>
                           <td className="py-3 px-4 text-xs font-bold text-slate-500">{u.model || "---"}</td>
                           <td className="py-3 px-4 text-xs font-bold text-slate-500">{u.room_tenant || u.area || "---"}</td>
                           <td className="py-3 px-4">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${statusColor}`}>
                                 {(u.status || "Normal").replace('_', ' ')}
                              </span>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
            {filtered.length > 50 && <p className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing first 50 of {filtered.length}</p>}
         </div>
      </div>
   );
}

// Sub-components
function KPICard({ title, icon: Icon, actual, target, percentage, color }: any) {
   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
         className="bg-white rounded-2xl border border-[#e6e9ef] p-6 shadow-sm hover:border-[#0073ea] transition-all"
      >
         <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl" style={{ background: color + '15' }}>
               <Icon size={18} style={{ color }} />
            </div>
            <span className="text-2xl font-black text-[#323338]">{percentage}%</span>
         </div>
         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</h4>
         <div className="w-full h-2 bg-[#f5f6f8] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%`, background: color }}></div>
         </div>
         <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-widest">{actual} / {target}</p>
      </motion.div>
   );
}

function StatCard({ label, value }: any) {
   return (
      <div className="p-4 bg-[#f5f6f8] rounded-2xl text-center">
         <p className="text-2xl font-black text-[#323338]">{value}</p>
         <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
      </div>
   );
}

function QuickLink({ href, onClick, icon: Icon, label }: any) {
   if (href) {
      return (
         <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f5f6f8] transition-all group">
            <Icon size={16} className="text-slate-300 group-hover:text-[#0073ea] transition-colors" />
            <span className="text-xs font-bold text-[#323338] flex-1">{label}</span>
            <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all" />
         </Link>
      );
   }
   return (
      <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f5f6f8] transition-all group text-left">
         <Icon size={16} className="text-slate-300 group-hover:text-[#0073ea] transition-colors" />
         <span className="text-xs font-bold text-[#323338] flex-1">{label}</span>
         <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all" />
      </button>
   );
}
