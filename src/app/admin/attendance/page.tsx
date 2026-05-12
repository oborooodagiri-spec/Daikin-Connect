"use client";

import React, { useEffect, useState } from "react";
import { getAttendanceRecords, getAttendanceSummary } from "@/app/actions/attendanceAdmin";
import { getAllProjects } from "@/app/actions/projects";
import { 
  MapPin, Clock, FileImage, ShieldCheck, Download, 
  Loader2, Search, Filter, Calendar, Users, 
  Briefcase, ArrowUpRight, CheckCircle2, ChevronRight,
  UserCheck, AlertCircle
} from "lucide-react";
import AttendanceDetail from "@/components/admin/AttendanceDetail";
import { AnimatePresence, motion } from "framer-motion";

export default function AttendanceRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    projectId: "all",
    startDate: "",
    endDate: ""
  });
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    fetchData();
    loadProjects();
  }, []);

  async function loadProjects() {
    const res = await getAllProjects();
    if (res.success) setProjects(res.data);
  }

  async function fetchData() {
    setLoading(true);
    const [recRes, sumRes] = await Promise.all([
      getAttendanceRecords({
        projectId: filters.projectId,
        search: filters.search,
        startDate: filters.startDate,
        endDate: filters.endDate
      }),
      getAttendanceSummary()
    ]);

    if (recRes && "success" in recRes && recRes.success) {
      setRecords(recRes.data);
    }
    if (sumRes && "success" in sumRes && sumRes.success) {
      setSummary(sumRes.data);
    }
    setLoading(false);
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
       fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const handleExport = () => {
    const header = "Name,Email,Company,Project,Check In,Check In Loc,Check Out,Check Out Loc,Notes\n";
    const csv = records.map(r => {
      const checkInStr = r.check_in_time ? new Date(r.check_in_time).toLocaleString() : "";
      const checkOutStr = r.check_out_time ? new Date(r.check_out_time).toLocaleString() : "";
      return `"${r.users?.name}","${r.users?.email}","${r.users?.company_name || 'Independent'}","${r.projects?.name}","${checkInStr}","${r.check_in_lat},${r.check_in_long}","${checkOutStr}","${r.check_out_lat},${r.check_out_long}","${r.check_in_notes || ''}"`;
    }).join("\n");
    
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <div className="flex-1 p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-3">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                     <Fingerprint size={28} />
                  </div>
                  <div>
                     <h1 className="text-3xl font-black text-[#003366] tracking-tight">Attendance Record</h1>
                  </div>
               </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={handleExport}
               className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm"
             >
               <Download size={18} /> Export Data
             </button>
             <button className="p-4 bg-[#003366] text-white rounded-2xl shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform">
                <ArrowUpRight size={24} />
             </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <SummaryCard 
              label="Today's Attendance" 
              value={summary?.totalToday || 0} 
              icon={<UserCheck className="text-emerald-500" />} 
              sub="Records processed today"
           />
           <SummaryCard 
              label="Currently on Site" 
              value={summary?.activeNow || 0} 
              icon={<MapPin className="text-[#00a1e4]" />} 
              sub="Personnel active right now"
              highlight
           />
           <SummaryCard 
              label="Active Projects" 
              value={summary?.projectsTracked || 0} 
              icon={<Briefcase className="text-indigo-500" />} 
              sub="Monitored site locations"
           />
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
           <div className="flex flex-wrap items-end gap-6">
              <div className="flex-1 min-w-[280px] space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Personnel</label>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search by name or company..."
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                 </div>
              </div>

              <div className="w-[240px] space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Site</label>
                 <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                       className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500"
                       value={filters.projectId}
                       onChange={(e) => handleFilterChange("projectId", e.target.value)}
                    >
                       <option value="all">All Projects</option>
                       {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                 </div>
              </div>

              <div className="w-[400px] space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Range</label>
                 <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 text-xs"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    />
                    <div className="text-slate-300">—</div>
                    <input 
                      type="date" 
                      className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 text-xs"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
               <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                  <th className="px-10 py-8">Personnel</th>
                  <th className="px-10 py-8">Workplace</th>
                  <th className="px-10 py-8">Time Log</th>
                  <th className="px-10 py-8">Verification</th>
                  <th className="px-10 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-32 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-20">
                          <Users size={64} />
                          <p className="font-black uppercase tracking-[0.3em] text-sm">No personnel records found</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  records.map(r => (
                    <tr 
                      key={r.id} 
                      onClick={() => setSelectedRecord(r)}
                      className="group hover:bg-slate-50/80 cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-blue-500"
                    >
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors uppercase">
                              {r.users?.name?.charAt(0)}
                           </div>
                           <div>
                             <p className="font-black text-slate-800 text-sm">{r.users?.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">{r.users?.company_name || 'Independent Vendor'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                         <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#0073ea] rounded-xl border border-blue-100 text-[10px] font-black uppercase tracking-tight">
                            {r.projects?.name}
                         </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-[13px] font-black text-slate-700">
                              <span className="text-emerald-500">{formatDate(r.check_in_time)}</span>
                              <span className="text-slate-300">—</span>
                              <span className={r.check_out_time ? "text-rose-500" : "text-amber-500 animate-pulse"}>
                                 {r.check_out_time ? formatDate(r.check_out_time) : "ON SITE"}
                              </span>
                           </div>
                           <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {format(new Date(r.check_in_time), "dd MMMM yyyy")}
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                         <div className="flex items-center gap-3">
                            <ProofBadge active={!!r.check_in_photo} type="IN" />
                            <ProofBadge active={!!r.check_out_photo} type="OUT" />
                         </div>
                      </td>
                      <td className="px-10 py-7 text-right">
                         <button className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
               <CheckCircle2 size={14} className="text-emerald-500" /> Administrative Monitoring Active
             </p>
             <p className="text-[10px] font-bold text-slate-300">Showing {records.length} recent entries</p>
          </div>
        </div>
      </div>

      {/* Side Panel Detail */}
      <AnimatePresence>
        {selectedRecord && (
          <AttendanceDetail 
             record={selectedRecord} 
             onClose={() => setSelectedRecord(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ label, value, icon, sub, highlight = false }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all ${highlight ? 'bg-[#003366] text-white border-blue-900 shadow-xl shadow-blue-900/20' : 'bg-white text-slate-800 border-slate-100 shadow-sm'}`}>
       <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${highlight ? 'bg-white/10' : 'bg-slate-50'}`}>
             {React.cloneElement(icon as React.ReactElement, { size: 24 })}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Active</div>
       </div>
       <div className="space-y-1">
          <h4 className="text-4xl font-black tracking-tighter">{value}</h4>
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">{label}</p>
       </div>
       <div className={`mt-6 pt-6 border-t ${highlight ? 'border-white/10' : 'border-slate-50'} flex items-center gap-2`}>
          <div className={`w-1.5 h-1.5 rounded-full ${highlight ? 'bg-emerald-400' : 'bg-blue-500'}`} />
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{sub}</p>
       </div>
    </div>
  );
}

function ProofBadge({ active, type }: { active: boolean; type: string }) {
   return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
         {active ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
         {type}
      </div>
   );
}

function format(date: Date, fmt: string) {
   // Simple mock for format since date-fns id locale might not be available in all envs without import
   return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
