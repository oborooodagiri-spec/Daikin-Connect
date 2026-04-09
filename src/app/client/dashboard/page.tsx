"use client";

import { useEffect, useState } from "react";
import { getClientDashboardData } from "@/app/actions/client_dashboard";
import { 
  Building2, Activity, Calendar, 
  ChevronRight, ArrowUpRight, Clock,
  User as UserIcon, Package, ShieldCheck, 
  CalendarCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProgressIndicator from "@/components/ProgressIndicator";
import { format } from "date-fns";
import ScheduleCalendarWidget from "@/components/dashboard/ScheduleCalendarWidget";
import Link from "next/link";
import { requestClientVisit } from "@/app/actions/client_dashboard";
import { toast } from "sonner"; // Assuming sonner or similar for notifications

export default function ClientDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await getClientDashboardData();
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.error || "Failed to load dashboard data");
    }
    setLoading(false);
  };

  const handleRequestVisit = async () => {
    if (!data?.projects?.[0]) return;
    const res = await requestClientVisit(data.projects[0].id);
    if (res.success) {
      alert("Successfully requested a visit! Our team will contact you soon.");
      fetchData();
    } else {
      alert("Failed to request visit. Please try again later.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
         <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Client Portal...</p>
       </div>
     );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 overflow-hidden">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Project Transparency Active</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-[#003366] tracking-tighter leading-tight truncate">
              Operational <br/>
              <span className="text-[#00a1e4]">Insight Dashboard</span>
            </h1>
            <p className="text-slate-500 text-sm font-bold tracking-wide flex items-center gap-2">
               Managing <span className="text-slate-900">{data?.total_assets} Integrated Assets</span> across {data?.projects.length} sites.
            </p>
         </div>
         
         <div className="flex gap-4">
            <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex items-center gap-6 group hover:border-blue-300 transition-all">
               <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                  <Package size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Assets</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{data?.total_assets}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Main Project Progress Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         {data?.projects.map((project: any, i: number) => (
            <motion.div 
               key={project.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group hover:border-[#00a1e4] transition-all"
            >
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8 w-full overflow-hidden">
                  <div className="flex-1 space-y-6 w-full">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00a1e4] mb-1">{project.customerName}</p>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                           <Building2 className="text-slate-400 shrink-0" size={20} />
                           <h3 className="text-xl sm:text-2xl font-black text-[#003366] tracking-tight truncate flex-1">{project.name}</h3>
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 pl-8">{project.code || 'SITE-N/A'}</p>
                     </div>

                     <div className="grid grid-cols-3 gap-6">
                        {project.progress.map((p: any) => (
                           <ProgressIndicator 
                             key={p.type} size="md" label={p.type} 
                             percentage={p.percentage} 
                             color={p.type === 'Preventive' ? 'indigo' : p.type === 'Corrective' ? 'rose' : 'emerald'} 
                             subLabel={`${p.actual}/${p.target}`}
                           />
                        ))}
                     </div>
                  </div>

                  <div className="w-full md:w-64 space-y-4">
                     <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                           <CalendarCheck className="text-emerald-500" size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Next Service</span>
                        </div>
                        
                         {project.next_visit ? (
                            <>
                               <div className="space-y-0.5">
                                  <p className="text-lg font-black text-slate-800 tracking-tighter">
                                     {format(new Date(project.next_visit.date), "dd MMM yyyy")}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                     <Clock size={12} /> {format(new Date(project.next_visit.date), "HH:mm")}
                                  </div>
                               </div>
                               <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                                     <UserIcon size={14} className="text-blue-600" />
                                  </div>
                                  <div>
                                     <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 leading-none">Technician</p>
                                     <p className="text-xs font-black text-slate-700">{project.next_visit.engineer}</p>
                                  </div>
                               </div>
                            </>
                         ) : (
                            <div className="py-2">
                               <p className="text-xs font-bold text-slate-400 italic">No visits currently planned</p>
                               <button 
                                 onClick={handleRequestVisit}
                                 className="text-[10px] font-black text-blue-600 mt-2 uppercase tracking-widest hover:underline flex items-center gap-1"
                               >
                                 Request Visit <ArrowUpRight size={12}/>
                               </button>
                            </div>
                         )}
                      </div>
                      
                      <Link 
                        href="/client/inventory"
                        className="w-full py-4 bg-[#003366] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-[#002244] transition-all flex items-center justify-center gap-2 group/btn"
                      >
                         Asset Directory
                         <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                  </div>
               </div>
            </motion.div>
         ))}
      </div>


    </div>
  );
}
