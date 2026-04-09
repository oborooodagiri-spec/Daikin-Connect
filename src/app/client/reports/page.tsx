"use client";

import { useEffect, useState } from "react";
import { getClientReports } from "@/app/actions/client_dashboard";
import { 
  FileText, Search, Download, 
  ChevronRight, Calendar, Tag,
  FileCheck, ShieldCheck, Activity,
  Filter, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function ClientReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getClientReports();
    if (res.success) setReports(res.data);
    setLoading(false);
  };

  const filtered = reports.filter(r => {
    const matchesSearch = 
      r.units?.tag_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.type?.toLowerCase().includes(search.toLowerCase()) ||
      r.inspector_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === "All" || r.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-30">
        <div className="w-12 h-12 border-4 border-t-emerald-500 border-slate-100 rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest">Compiling Documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Certified Technical Records</span>
          </div>
          <h1 className="text-4xl font-black text-[#003366] tracking-tighter">
            Service <span className="text-[#00a1e4]">Reports</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold mt-2">
            Explore and download certified technical documentation for all maintenance activities.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
           {/* Filters */}
           <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
              {["All", "Audit", "Preventive", "Corrective"].map(type => (
                 <button 
                   key={type}
                   onClick={() => setFilterType(type)}
                   className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     filterType === type ? 'bg-[#003366] text-white' : 'text-slate-400 hover:text-slate-700'
                   }`}
                 >
                   {type}
                 </button>
              ))}
           </div>
           
           <div className="relative group w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a1e4]" size={16} />
              <input 
                type="text" 
                placeholder="Search report..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              />
           </div>
        </div>
      </div>

      {/* Reports Table/Grid */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-6 text-left">Document / Activity</th>
              <th className="px-8 py-6 text-left">Asset Tag</th>
              <th className="px-8 py-6 text-left">Service Date</th>
              <th className="px-8 py-6 text-left">Inspector</th>
              <th className="px-8 py-6 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((report, i) => (
              <motion.tr 
                key={report.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-8 py-6">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                        report.type === 'Audit' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' :
                        report.type === 'Preventive' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                        'bg-rose-50 border-rose-100 text-rose-500'
                      }`}>
                         <FileText size={18} />
                      </div>
                      <div>
                         <p className="text-sm font-black text-[#003366] tracking-tight">{report.type} Service Record</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{report.id}</p>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800 tracking-tight">{report.units?.tag_number}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{report.units?.brand} {report.units?.model}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar size={14} className="text-slate-300" />
                      {format(new Date(report.service_date), "dd MMM yyyy")}
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tight">
                      {report.inspector_name || "N/A"}
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   {report.pdf_report_url ? (
                     <a 
                       href={report.pdf_report_url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                     >
                        <Download size={16} />
                     </a>
                   ) : (
                     <span className="text-[9px] font-black text-slate-300 uppercase italic">Not Generated</span>
                   )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300 grayscale opacity-40">
             <FileText size={48} />
             <p className="mt-4 font-black uppercase tracking-widest text-[10px]">No reports found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="text-sm font-black text-[#003366] tracking-tight">Certified Compliance Logs</p>
               <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">All reports are digitally signed and verified by Daikin technicians.</p>
            </div>
         </div>
         <button className="px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
            Download Batch Archive <ExternalLink size={14}/>
         </button>
      </div>
    </div>
  );
}
