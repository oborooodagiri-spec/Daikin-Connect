"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, FileText, Download, TrendingUp, 
  CheckCircle2, AlertCircle, Calendar, Activity,
  Filter, Building2, User2, Zap, Thermometer, Wind,
  PieChart as PieIcon, BarChart3, Layout, ChevronRight,
  ClipboardList, Target, AlertTriangle, Eye, Search,
  Settings, MessageSquare, Wrench, Shield
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { getConsolidatedMonthlyReport } from "@/app/actions/consolidated_reports";
import { generateConsolidatedPDF } from "@/lib/pdf-consolidated-generator";
import PresentationModal from "@/components/dashboard/PresentationModal";

const MAIN_TABS = [
  { id: 'analytics', label: 'Chart Performance', icon: <PieIcon size={16} /> },
  { id: 'planning', label: 'Schedule vs Actual', icon: <Target size={16} /> },
  { id: 'logsheets', label: 'Daily List Service', icon: <Activity size={16} /> },
  { id: 'corrective', label: 'Corrective & Complaint', icon: <Wrench size={16} /> },
  { id: 'audit', label: 'Performance Audit', icon: <Search size={16} /> },
];

export default function MonthlyReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id: customerId, projectId } = params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || 'analytics');
  const [subTab, setSubTab] = useState(searchParams.get("subTab") || 'ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [capacityUnit, setCapacityUnit] = useState<'kW' | 'BTUh' | 'TR'>('kW');
  const [selectedDetail, setSelectedDetail] = useState<'vitality' | 'achievement' | 'volume' | 'pareto' | null>(null);

  const convertCapacity = (value: number | string, unit: 'kW' | 'BTUh' | 'TR') => {
    const val = Number(value) || 0;
    if (unit === 'BTUh') return (val * 3412.14).toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (unit === 'TR') return (val / 3.51685).toFixed(2);
    return val.toFixed(1);
  };

  // Filter State
  const now = new Date();
  const [month, setMonth] = useState(parseInt(searchParams.get("month") || (now.getMonth() + 1).toString()));
  const [year, setYear] = useState(parseInt(searchParams.get("year") || now.getFullYear().toString()));
  const [type, setType] = useState(searchParams.get("type") || "Operations");

  const fetchData = async () => {
    setLoading(true);
    const res = await getConsolidatedMonthlyReport(projectId as string, month, year, type);
    if ('success' in res && res.success && 'data' in res) {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [projectId, month, year, type]);

  const handleFilterChange = (m: number, y: number, t: string) => {
    setMonth(m);
    setYear(y);
    setType(t);
    router.push(`?month=${m}&year=${y}&type=${t}&tab=${activeTab}&subTab=${subTab}`);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`?month=${month}&year=${year}&type=${type}&tab=${tabId}&subTab=${subTab}`);
  };

  const handleSubTabChange = (sTab: string) => {
    setSubTab(sTab);
    router.push(`?month=${month}&year=${year}&type=${type}&tab=${activeTab}&subTab=${sTab}`);
  };

  const handleExport = async () => {
    if (!data) return;
    setExporting(true);
    try {
       await generateConsolidatedPDF(data);
    } catch (err) {
       console.error("Export error:", err);
       alert("Failed to generate PDF. Please try again.");
    }
    setExporting(false);
  };

  // Helper to filter activities by subTab (Unit Type)
  const getActivitiesBySubTab = (currentSubTab: string) => {
    if (!data?.activities) return [];
    if (currentSubTab === 'ALL') return data.activities;
    return data.activities.filter((act: any) => (act.units?.unit_type || "").toUpperCase() === currentSubTab);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#003366] rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synthesizing Digital Spreadsheet...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-4">
          <Link href={`/dashboard/customers/${customerId}/projects`} className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors w-max">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Daikin Digital Ops Recap v2.0</span>
            </div>
            <h1 className="text-4xl font-black text-[#003366] tracking-tight">
              Monthly Ops Summary
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-2 flex items-center gap-4 capitalize">
              <span className="flex items-center gap-1.5"><Building2 size={16} className="text-[#00a1e4]" /> {data?.project?.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1.5"><Calendar size={16} className="text-[#00a1e4]" /> {data?.summary?.monthName} {year}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <select 
              value={type}
              onChange={(e) => handleFilterChange(month, year, e.target.value)}
              className="px-4 py-2 bg-transparent text-xs font-black uppercase tracking-widest text-blue-600 outline-none cursor-pointer"
            >
              <option value="Operations">Operations (P+C)</option>
              <option value="Preventive">Preventive Only</option>
              <option value="Corrective">Corrective Only</option>
              <option value="Audit">Audit Only</option>
              <option value="All">Full Site (All)</option>
            </select>
            <div className="w-px h-4 bg-slate-100 self-center" />
            <select 
              value={month} 
              onChange={(e) => handleFilterChange(parseInt(e.target.value), year, type)}
              className="px-4 py-2 bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2000, m - 1))}</option>
              ))}
            </select>
            <div className="w-px h-4 bg-slate-100 self-center" />
            <select 
              value={year}
              onChange={(e) => handleFilterChange(month, parseInt(e.target.value), type)}
              className="px-4 py-2 bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button 
            onClick={handleExport}
            disabled={exporting}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg 
              ${exporting ? 'bg-slate-100 text-slate-400' : 'bg-[#003366] text-white hover:bg-black'}`}
          >
            {exporting ? (
              <><div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" /> Compiling Spreadsheet...</>
            ) : (
              <><Download size={16} /> Export Consolidated Report</>
            )}
          </button>
        </div>
      </div>

      {/* MASTER TABS - SPREADSHEET STYLE */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200 w-max max-w-full">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
              ${activeTab === tab.id 
                ? 'bg-[#003366] text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUB-TABS FOR PLANNING AND LOGSHEETS */}
      {(activeTab === 'planning' || activeTab === 'logsheets') && (
        <div className="flex items-center gap-6 px-4">
           <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => handleSubTabChange('ALL')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all 
                  ${subTab === 'ALL' ? 'bg-white text-[#00a1e4] shadow-sm' : 'text-slate-400'}`}
              >
                ALL UNITS
              </button>
              {data?.summaryByType?.map((s: any) => (
                <button 
                  key={s.type}
                  onClick={() => handleSubTabChange(s.type.toUpperCase())}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all 
                    ${subTab === s.type.toUpperCase() ? 'bg-white text-[#00a1e4] shadow-sm' : 'text-slate-400'}`}
                >
                  {s.type}
                </button>
              ))}
           </div>
           <p className="text-[10px] font-bold text-slate-300 italic">Select unit type for detailed breakdown</p>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + subTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'analytics' && renderAnalyticsTab()}
            {activeTab === 'planning' && renderPlanningTab()}
            {activeTab === 'logsheets' && renderLogsheetsTab()}
            {activeTab === 'corrective' && renderCorrectiveTab()}
            {activeTab === 'audit' && renderAuditTab()}
          </motion.div>
        </AnimatePresence>
      </div>
      <PresentationModal 
        isOpen={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        type={selectedDetail}
        data={data}
      />
    </div>
  );

  function renderAnalyticsTab() {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            label="Vitality Score" value={`${data?.summary?.avgPerformance}%`}
            desc="Global avg site health" color="emerald" icon={<Activity size={24} />}
            onClick={() => setSelectedDetail('vitality')}
          />
          <MetricCard 
            label="Achievement" value={`${data?.summary?.achievementRate}%`}
            desc="Contractual target realized" color="blue" icon={<CheckCircle2 size={24} />}
            onClick={() => setSelectedDetail('achievement')}
          />
          <MetricCard 
            label="Service Volume" value={data?.summary?.totalActual}
            desc="Units realized this month" color="indigo" icon={<Settings size={24} />}
            onClick={() => setSelectedDetail('volume')}
          />
          <MetricCard 
            label="Issue Pareto" value={data?.complaints?.length + (data?.activities?.filter((a:any)=>a.performance?.score < 80).length)}
            desc="Items needing attention" color="rose" icon={<AlertTriangle size={24} />}
            onClick={() => setSelectedDetail('pareto')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight mb-10">Realization Trends</h3>
             <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.charts?.weeklyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Bar dataKey="actual" name="Actual" fill="#003366" radius={[6, 6, 0, 0]} barSize={25} />
                    <Bar dataKey="target" name="Plan" fill="#E2E8F0" radius={[6, 6, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-[#003366] p-10 rounded-[2.5rem] shadow-xl text-white relative flex flex-col justify-center">
             <h3 className="text-xl font-black uppercase tracking-tight mb-8">Asset Distribution</h3>
             <div className="space-y-6">
                {data?.summaryByType?.map((s: any) => (
                  <div key={s.type} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>{s.type}</span>
                        <span>{s.actual} / {s.unitCount} Units</span>
                     </div>
                     <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                        <div className="bg-[#00a1e4] h-full" style={{ width: `${(s.actual / (s.unitCount || 1)) * 100}%` }} />
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  function renderPlanningTab() {
    const summaryList = subTab === 'ALL' 
      ? data?.summaryByType 
      : data?.summaryByType?.filter((s:any) => s.type.toUpperCase() === subTab);

    return (
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
           <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight">Schedule vs Realisasi Detailed</h3>
           <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Comparative achievement score by unit classification</p>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {summaryList?.map((s: any) => (
             <div key={s.type} className="bg-slate-50 p-8 rounded-[1.5rem] border border-slate-100 relative group overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h4 className="text-2xl font-black text-[#003366] tracking-tighter">{s.type}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Classification</p>
                   </div>
                   <div className="h-12 w-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center bg-blue-50 text-blue-600">
                      <Target size={20} />
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-end">
                      <div>
                         <span className="text-4xl font-black text-[#003366]">{s.actual}</span>
                         <span className="text-lg font-bold text-slate-300 ml-2">/ {s.unitCount}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-[20px] font-black text-[#00a1e4] leading-none">{s.achievement}%</p>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest pt-1">Achieved</p>
                      </div>
                   </div>
                   <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${s.achievement >= 100 ? 'bg-emerald-500' : 'bg-[#00a1e4]'}`} style={{ width: `${s.achievement}%` }} />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  function renderLogsheetsTab() {
    const activities = getActivitiesBySubTab(subTab);

    return (
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50">
           <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200 w-full sm:max-w-md shadow-sm">
             <Search size={18} className="text-slate-400" />
             <input 
               type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search unit tag..."
               className="bg-transparent text-sm font-bold text-slate-600 outline-none w-full"
             />
           </div>
           <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>{activities.length} Units Synthesized</span>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-blue-600">Type: {subTab}</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-white border-b border-slate-100 font-black text-[9px] uppercase tracking-widest text-slate-400">
                <th className="px-8 py-6">Date / Tag</th>
                <th className="px-8 py-6">Type</th>
                <th className="px-8 py-6 text-center">Electrical (Amp)</th>
                <th className="px-8 py-6 text-center">Temperature (ΔT)</th>
                <th className="px-8 py-6 text-center">Health</th>
                <th className="px-8 py-6">Engineer Note</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.filter((a:any)=>a.units?.tag_number?.includes(searchQuery)).map((act: any, idx: number) => {
                const deltaT = (Number(act.entering_db || 0) - Number(act.leaving_db || 0)).toFixed(1);
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 min-w-[200px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(act.service_date).toLocaleDateString()}</p>
                      <p className="text-sm font-black text-[#003366]">{act.units?.tag_number}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                         <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">FL: {act.units?.building_floor || "-"}</span>
                         <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded italic">{act.units?.room_tenant || "Common Area"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                         ${act.units?.unit_type === 'FCU' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          act.units?.unit_type === 'AHU' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'}`}>
                         {act.units?.unit_type || 'Unit'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex flex-col items-center gap-1 font-mono">
                          <span className="text-xs font-black text-slate-700">
                            {act.amp_r ? ((Number(act.amp_r) + Number(act.amp_s) + Number(act.amp_t)) / 3).toFixed(1) : "-"}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2 text-xs font-black">
                             <span className="text-blue-500">{act.entering_db || "-"}°</span>
                             <ChevronRight size={10} className="text-slate-300" />
                             <span className="text-rose-500">{act.leaving_db || "-"}°</span>
                          </div>
                          <p className={`text-[10px] font-black mt-1 ${Number(deltaT) > 5 ? 'text-emerald-500' : 'text-amber-500'}`}>ΔT: {deltaT}</p>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col items-center">
                          <span className={`text-sm font-black ${act.performance?.score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{act.performance?.score}%</span>
                          <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                             <div className={`h-full ${act.performance?.score > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${act.performance?.score || 0}%` }} />
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-xs font-medium text-slate-500 max-w-[200px] line-clamp-2 italic">
                         {act.engineer_note || "Operational."}
                       </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                        <Link 
                           href={`/reports/${act.type || 'Audit'}/${act.id}`} 
                           target="_blank"
                           className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                        >
                           <Eye size={12} /> View
                        </Link>
                     </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderCorrectiveTab() {
    const combinedIssues = [
      ...(data?.activities?.filter((a:any)=>a.type === 'Corrective') || []),
      ...(data?.complaints || [])
    ];

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* LIST CORRECTIVE */}
           <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col">
              <div className="p-8 border-b border-slate-100 bg-red-50/30">
                 <h3 className="text-xl font-black text-red-900 uppercase tracking-tight flex items-center gap-3">
                   <Wrench size={20} /> List Corrective Actions
                 </h3>
                 <p className="text-[10px] font-bold text-red-400 mt-1 uppercase tracking-widest">Technician Repairs realized</p>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[600px] p-6 space-y-4">
                 {data?.activities?.filter((a:any)=>a.type === 'Corrective').map((fix: any, idx: number) => (
                   <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-red-200 transition-all">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <p className="text-sm font-black text-[#003366]">{fix.units?.tag_number}</p>
                            <div className="flex gap-2 text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                               <span>FL: {fix.units?.building_floor || "-"}</span>
                               <span>•</span>
                               <span>{fix.units?.room_tenant || "Area"}</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-300 mt-1">{new Date(fix.service_date).toLocaleDateString()}</p>
                         </div>
                         <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 text-[8px] font-black uppercase">REPAIR</span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 italic bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                         {fix.engineer_note || "Repairs completed."}
                      </p>
                      <Link 
                         href={`/reports/Corrective/${fix.id}`}
                         target="_blank"
                         className="flex items-center justify-center gap-2 w-fit px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                      >
                         <Eye size={12} /> View Formal Report
                      </Link>
                   </div>
                 ))}
                 {data?.activities?.filter((a:any)=>a.type === 'Corrective').length === 0 && (
                    <p className="text-[10px] font-black text-slate-300 uppercase py-10 text-center">No corrective actions logged</p>
                 )}
              </div>
           </div>

           {/* LIST COMPLAINT */}
           <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col">
              <div className="p-8 border-b border-slate-100 bg-amber-50/30">
                 <h3 className="text-xl font-black text-amber-900 uppercase tracking-tight flex items-center gap-3">
                   <MessageSquare size={20} /> List Customer Complaints
                 </h3>
                 <p className="text-[10px] font-bold text-amber-400 mt-1 uppercase tracking-widest">Site feedback & tickets</p>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[600px] p-6 space-y-4">
                 {data?.complaints?.map((comp: any, idx: number) => (
                   <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 transition-all">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <p className="text-sm font-black text-[#003366]">{comp.units?.tag_number}</p>
                            <div className="flex gap-2 text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                               <span>FL: {comp.units?.building_floor || "-"}</span>
                               <span>•</span>
                               <span>{comp.units?.room_tenant || "Area"}</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-300 mt-1">{new Date(comp.created_at).toLocaleDateString()}</p>
                         </div>
                         <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase 
                           ${comp.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                           {comp.status}
                         </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 mb-2">{comp.customer_name}</p>
                      <p className="text-xs font-medium text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                         {comp.description}
                      </p>
                   </div>
                 ))}
                 {data?.complaints?.length === 0 && (
                    <p className="text-[10px] font-black text-slate-300 uppercase py-10 text-center">No active complaints</p>
                 )}
              </div>
           </div>

        </div>
      </div>
    );
  }

  function renderAuditTab() {
    const audits = data?.activities?.filter((a: any) => a.type === 'Audit') || [];
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* HEALTH DISTRIBUTION */}
           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight mb-8">Performance Health Distribution</h3>
              <div className="flex flex-col md:flex-row items-center gap-10">
                 <div className="h-[250px] w-full max-w-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={data?.charts?.healthDistribution || []}
                             cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                             paddingAngle={5} dataKey="value"
                          >
                             {data?.charts?.healthDistribution?.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex-1 space-y-4 w-full">
                    {data?.charts?.healthDistribution?.map((h: any) => (
                       <div key={h.name} className="flex justify-between items-center p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                          <div className="flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                             <span className="text-xs font-black uppercase tracking-widest text-slate-600">{h.name}</span>
                          </div>
                          <span className="text-sm font-black text-[#003366]">{h.value} Units</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* SUMMARY INSIGHT */}
           <div className="bg-[#003366] p-10 rounded-[2.5rem] shadow-xl text-white">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6">Performance Audit Insights</h3>
              <div className="space-y-6">
                 <div>
                    <h4 className="text-4xl font-black text-[#00a1e4]">{data?.summary?.avgPerformance}%</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Average Site Health Score</p>
                 </div>
                 <p className="text-sm font-medium text-slate-300 leading-relaxed italic border-l-2 border-[#00a1e4] pl-6 py-2">
                    "Based on the air-side performance enthalpy analysis for {data?.summary?.monthName}, the site exhibits {data?.summary?.avgPerformance >= 80 ? 'stable' : 'varying'} efficiency. 
                    Monitoring prioritized for units in the critical segment is highly recommended."
                 </p>
                 <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl">
                       <p className="text-xs font-black text-[#00a1e4] mb-1">{audits.length}</p>
                       <p className="text-[8px] font-black uppercase text-slate-400">Total Audit Activities</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                       <p className="text-xs font-black text-rose-400 mb-1">
                          {data?.charts?.healthDistribution?.find((h:any)=>h.name === 'Critical')?.value || 0}
                       </p>
                       <p className="text-[8px] font-black uppercase text-slate-400">Critical Segments</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* DETAILED AUDIT TABLE */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                  <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight">Performance Audit Ledger</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Air-side Enthalpy Analysis & Measured Cooling Capacity Verification</p>
               </div>
               <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(['kW', 'BTUh', 'TR'] as const).map((unit) => (
                     <button 
                        key={unit}
                        onClick={() => setCapacityUnit(unit)}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all 
                           ${capacityUnit === unit ? 'bg-white text-[#00a1e4] shadow-sm' : 'text-slate-400'}`}
                     >
                        {unit === 'BTUh' ? 'BTU/h' : unit}
                     </button>
                  ))}
               </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead>
                    <tr className="bg-white border-b border-slate-100 font-black text-[9px] uppercase tracking-widest text-slate-400">
                       <th className="px-8 py-6">Unit / Location</th>
                       <th className="px-8 py-6 text-center">Air-side ∆T</th>
                       <th className="px-8 py-6 text-center">Design Cooling Capacity</th>
                       <th className="px-8 py-6 text-center">Measured Cooling Capacity</th>
                       <th className="px-8 py-6 text-center">Health %</th>
                       <th className="px-8 py-6">Status</th>
                       <th className="px-8 py-6 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {audits.map((act: any, idx: number) => {
                       const deltaT = (Number(act.entering_db || 0) - Number(act.leaving_db || 0)).toFixed(1);
                       const score = act.performance?.score || 0;
                       return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-6">
                                <p className="text-sm font-black text-[#003366]">{act.units?.tag_number}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FL: {act.units?.building_floor} • {act.units?.room_tenant}</p>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex flex-col items-center">
                                   <div className="flex items-center gap-2 text-xs font-black">
                                      <span className="text-blue-500">{act.entering_db}°</span>
                                      <ChevronRight size={10} className="text-slate-300" />
                                      <span className="text-rose-500">{act.leaving_db}°</span>
                                   </div>
                                   <p className="text-[9px] font-black text-slate-400 mt-1">∆T: {deltaT}°C</p>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center font-black text-[#003366] text-xs">
                                {convertCapacity(act.design_cooling_capacity || "10.0", capacityUnit)} {capacityUnit === 'BTUh' ? 'BTU/h' : capacityUnit}
                             </td>
                             <td className="px-8 py-6 text-center font-black text-xs text-blue-600">
                                {convertCapacity(act.performance?.actualCapacity || "0.00", capacityUnit)} {capacityUnit === 'BTUh' ? 'BTU/h' : capacityUnit}
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex flex-col items-center">
                                   <span className={`text-sm font-black ${score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                                      {score}%
                                   </span>
                                   <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                      <div className={`h-full ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-50' : 'bg-rose-500'}`} style={{ width: `${score}%` }} />
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                                  ${score >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                   score >= 60 ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                   'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                   {score >= 90 ? 'Excellent' : score >= 80 ? 'Stable' : score >= 60 ? 'Moderate' : 'Critical'}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                 <Link 
                                    href={`/reports/Audit/${act.id}`} 
                                    target="_blank"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                                 >
                                    <Eye size={12} /> View
                                 </Link>
                              </td>
                          </tr>
                       );
                    })}
                    {audits.length === 0 && (
                       <tr>
                          <td colSpan={7} className="px-8 py-20 text-center text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                             No Audit Data Available for this period
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  }
}

function MetricCard({ label, value, trend, desc, color, icon, onClick, loading }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={`bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative group overflow-hidden cursor-pointer
        ${onClick ? 'hover:border-blue-200 hover:shadow-md transition-all' : ''}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-3xl ${colors[color]} transition-transform group-hover:rotate-6`}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <h4 className="text-4xl font-black text-[#003366] tracking-tighter mb-1">{value}</h4>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
      <p className="text-xs font-bold text-slate-300 mt-6 pt-6 border-t border-slate-100">{desc || "Operations KPI"}</p>
    </motion.div>
  );
}
