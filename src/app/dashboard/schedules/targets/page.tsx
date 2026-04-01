"use client";

import { useEffect, useState, useTransition } from "react";
import { getMonthlyTargets, setTarget, getCompletionStats } from "@/app/actions/targets";
import { getAllSchedules, getScheduleFormOptions } from "@/app/actions/schedules";
import { Target, TrendingUp, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TargetsPage() {
  const [targets, setTargets] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [completionStats, setCompletionStats] = useState<any>({ byType: [] });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    assignee_id: "",
    project_id: "",
    type: "Preventive",
    daily_target: 2,
    monthly_target: 40,
    month: currentMonth,
    year: currentYear
  });

  const fetchData = async () => {
    setLoading(true);
    const [tRes, sRes, optRes, cRes] = await Promise.all([
      getMonthlyTargets(currentMonth, currentYear),
      getAllSchedules(),
      getScheduleFormOptions(),
      getCompletionStats(currentMonth, currentYear)
    ]);
    
    if (tRes.success) setTargets(tRes.data);
    if (sRes.success) setSchedules(sRes.data);
    if (optRes.success) {
      setEngineers(optRes.data.users);
      setProjects(optRes.data.projects);
    }
    if (cRes.success) setCompletionStats(cRes.data);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await setTarget(formData as any);
      if (res.success) {
        fetchData();
        alert("Target saved successfully!");
      }
    });
  };

  const calculateProgress = (target: any) => {
    // If it's a project target or global target, we use completionStats which come from service_activities
    if (!target.assignee_id) {
       const stat = completionStats.byType.find((s: any) => s.type === target.type);
       const completed = stat ? stat.count : 0;
       const percentage = target.monthly_target > 0 ? Math.min(Math.round((completed / target.monthly_target) * 100), 100) : 0;
       return { completed, percentage };
    }

    // For specific assignee targets, we still fallback to schedules for now or filter stats if available
    const relevantSchedules = schedules.filter(s => 
      s.type === target.type && 
      (target.assignee_id ? s.assignee_id === target.assignee_id : true) &&
      new Date(s.start_at).getMonth() + 1 === currentMonth
    );
    
    const completed = relevantSchedules.filter(s => s.status === 'Completed').length;
    const percentage = target.monthly_target > 0 ? Math.min(Math.round((completed / target.monthly_target) * 100), 100) : 0;
    
    return { completed, percentage };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Target Progress Board - Now Full Width */}
      <div className="lg:col-span-3 space-y-6">
        
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Loading tracking data...</div>
        ) : targets.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <p className="text-sm font-bold text-slate-400">No active tracking metrics found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.map((target, i) => {
              const progress = calculateProgress(target);
              const isDanger = progress.percentage < 30;
              const isSuccess = progress.percentage >= 100;

              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  key={target.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-[#00a1e4] transition-colors"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="font-black text-lg text-slate-800 tracking-tight">
                        {target.users?.name || target.projects?.name || "Global Goal"}
                      </p>
                      <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-black uppercase tracking-widest
                        ${target.type === 'Preventive' ? 'bg-indigo-100 text-indigo-600' : 
                          target.type === 'Corrective' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                        {target.type} {target.projects ? '(Project)' : ''}
                      </span>
                    </div>
                    {isSuccess ? 
                      <CheckCircle2 className="text-emerald-500 w-8 h-8 opacity-20" /> : 
                      <TrendingUp className="text-blue-500 w-8 h-8 opacity-20" />
                    }
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="text-sm font-black text-slate-400">
                        <span className={`text-4xl font-black ${isDanger ? 'text-rose-500' : isSuccess ? 'text-emerald-500' : 'text-[#00a1e4]'}`}>
                          {progress.completed}
                        </span> 
                        <span className="mx-1">/</span> {target.monthly_target} Units
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Quota</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${isDanger ? 'bg-rose-500' : isSuccess ? 'bg-emerald-500' : 'bg-[#00a1e4]'}`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
