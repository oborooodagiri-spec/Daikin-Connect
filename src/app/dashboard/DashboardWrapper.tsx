"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  getDashboardData, 
  getTrendChartData, 
  getRecentActivities, 
  getUnitHealthStats,
  getDetailedUnitStatus
} from "../actions/dashboard";
import { getUnitHistory, updateUnitStatus, getUnitByTag } from "../actions/units";
import { getProjectComplaints } from "../actions/complaints";
import { getComprehensiveReportData } from "../actions/report";
import { generateComprehensivePDF } from "@/lib/pdf-report-generator";
import { APP_VERSION } from "@/lib/version";
import SummaryCards from "../../components/dashboard/SummaryCards";
import SummaryDetailModal from "../../components/dashboard/SummaryDetailModal";
import TrendChart from "../../components/dashboard/TrendChart";
import ProjectSpotlight from "../../components/dashboard/ProjectSpotlight";
import UnitStatusChart from "../../components/dashboard/UnitStatusChart";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import UnitDetailModal from "../../components/UnitDetailModal";
import ExportOptionsModal from "../../components/dashboard/ExportOptionsModal";
import ScheduleCalendarWidget from "../../components/dashboard/ScheduleCalendarWidget";
import { Clock, BarChart3, Activity, Zap, AlertTriangle, Hammer, ArrowRight, LayoutGrid, Search } from "lucide-react";

export default function DashboardWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isApp = searchParams.get("isApp") === "true";
  const trendRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<{ customerId?: string; projectId?: string }>({});
  const [projectName, setProjectName] = useState("");
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  
  const [summaryData, setSummaryData] = useState<any>({
    audit: { actual: { daily: 0, monthly: 0, total: 0 }, target: { daily: 0, monthly: 0, total: 0 } },
    preventive: { actual: { daily: 0, monthly: 0, total: 0 }, target: { daily: 0, monthly: 0, total: 0 } },
    corrective: { 
      actual: { daily: 0, monthly: 0, total: 0 }, 
      kpi: { appeared: 0, resolved: 0 } 
    },
    dailyLog: { actual: { daily: 0, monthly: 0, total: 0 }, target: { daily: 0, monthly: 0, total: 0 } },
    databaseAssets: 0, totalCustomers: 0, activeSites: 0,
    enabled_forms: "audit,preventive,corrective,dailylog"
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [healthStats, setHealthStats] = useState<any[]>([]);
  const [problemUnits, setProblemUnits] = useState<any[]>([]);
  const [onProgressUnits, setOnProgressUnits] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [unitHistory, setUnitHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    // PERSISTENCE: Check if there's a saved project
    const saved = localStorage.getItem("daikin_last_project");
    if (saved) {
      try {
        const { cid, pid, name } = JSON.parse(saved);
        setFilters({ customerId: cid, projectId: pid });
        setProjectName(name);
        setIsSpotlightOpen(false);
      } catch (e) {
        setIsSpotlightOpen(true);
      }
    } else {
      setIsSpotlightOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleProjectSelect = (cid: string, pid: string, name: string) => {
    setFilters({ customerId: cid, projectId: pid });
    setProjectName(name);
    setIsSpotlightOpen(false);
    
    // PERSISTENCE: Save to localStorage
    localStorage.setItem("daikin_last_project", JSON.stringify({ cid, pid, name }));
  };

  const fetchData = async (f: { customerId?: string; projectId?: string }) => {
    if (!f.projectId) return;
    
    // Priority 1: Critical Metrics (Instant Feel)
    startTransition(async () => {
      try {
        const stats = await getDashboardData(f);
        setSummaryData(stats);
      } catch (err) {
        console.error("Critical Stats Error:", err);
      }
    });

    // Priority 2: Visual Analytics (Graceful Background)
    try {
      const [trend, health] = await Promise.all([
        getTrendChartData(f),
        getUnitHealthStats(f)
      ]);
      setChartData(trend);
      setHealthStats(health);
    } catch (err) {
      console.error("Analytics Error:", err);
    }

    // Priority 3: Secondary Lists
    try {
      const [activity, details] = await Promise.all([
        getRecentActivities(f),
        getDetailedUnitStatus(f)
      ]);
      setRecentActivities(activity);
      if (details && "success" in details && details.success) {
        setProblemUnits(details.problems || []);
        setOnProgressUnits(details.progress || []);
      }
      
      const complaintsRes = await getProjectComplaints(f.projectId);
      if (complaintsRes && 'success' in complaintsRes) {
        setRecentComplaints(complaintsRes.data || []);
      }
    } catch (err) {
      console.error("Secondary Data Error:", err);
    }
  };

  const openUnitDetail = async (unit: any) => {
    setSelectedUnit(unit);
    setIsDetailOpen(true);
    setUnitHistory([]);
    setHistoryLoading(true);
    const res = await getUnitHistory(unit.id);
    if (res && 'success' in res) setUnitHistory(res.data);
    setHistoryLoading(false);
  };

  const handleMetricCardClick = (metricData: any) => {
    setSelectedMetric(metricData);
    setIsMetricModalOpen(true);
  };

  const handleAnalyzeTrends = () => {
    if (trendRef.current) {
      trendRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleOpenReports = (type: string) => {
    setIsMetricModalOpen(false);
    router.push(`/dashboard/reports?type=${type}`);
  };

  const handleActivityClick = async (unitTag: string) => {
    try {
      const foundInProblems = problemUnits.find(u => u.tag_number === unitTag);
      const foundInProgress = onProgressUnits.find(u => u.tag_number === unitTag);
      
      if (foundInProblems) {
        openUnitDetail(foundInProblems);
      } else if (foundInProgress) {
        openUnitDetail(foundInProgress);
      } else {
        const res = await getUnitByTag(unitTag);
        if (res && "success" in res && res.success && "data" in res) {
          openUnitDetail(res.data);
        }
      }
    } catch (e) {}
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedUnit) return;
    setIsStatusUpdating(true);
    const res = await updateUnitStatus(selectedUnit.id, newStatus);
    if ("success" in res && res.success) {
      setSelectedUnit({ ...selectedUnit, status: newStatus });
      fetchData(filters);
    }
    setIsStatusUpdating(false);
  };

  const handleExport = async (startDate: string, endDate: string) => {
    if (!filters.projectId) {
      alert("Please select a specific project first to generate a professional report.");
      return;
    }
    
    setIsExporting(true);
    try {
      const res = await getComprehensiveReportData(filters.projectId, startDate, endDate);
      if (res && 'success' in res && res.success) {
        await generateComprehensivePDF(res.data, startDate, endDate);
        setIsExportModalOpen(false);
      } else if (res && 'error' in res) {
        alert("Export Error: " + ((res as any).error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => { fetchData(filters); }, [filters]);

  return (
    <div className="w-full flex flex-col space-y-8 pb-32 relative">
      <ProjectSpotlight 
        isOpen={isSpotlightOpen} 
        onSelect={handleProjectSelect} 
        onClose={filters.projectId ? () => setIsSpotlightOpen(false) : undefined} 
      />

      <div className={`transition-all duration-500 space-y-8 ${!filters.projectId ? "blur-lg opacity-20 scale-98 pointer-events-none select-none" : "blur-0 opacity-100 scale-100"}`}>
        {/* HEADER SECTION - Responsive Flex */}
        {!isApp && (
          <div className="flex flex-col xl:flex-row w-full items-start xl:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-1 overflow-hidden w-full">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#00a1e4]/10 text-[#00a1e4] text-[10px] font-black uppercase tracking-widest rounded-full">REALTIME {APP_VERSION}</span>
                <span className={`px-3 py-1 ${isOnline ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"} text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 transition-colors duration-500`}>
                  <div className="relative flex items-center justify-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {isOnline && <div className="absolute w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />}
                  </div>
                  {isOnline ? "LIVE CONNECTED" : "OFFLINE MODE"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tighter text-[#003366] leading-none uppercase">
                {projectName || "COMMAND CENTER"}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
              <button 
                onClick={() => setIsSpotlightOpen(true)}
                className="group flex items-center gap-3 rounded-2xl px-6 py-4 bg-white border border-slate-100 text-[#003366] shadow-xl shadow-slate-200/50 hover:border-[#00a1e4]/30 transition-all font-black text-[10px] tracking-widest"
              >
                <Search size={14} className="text-[#00a1e4] group-hover:scale-125 transition-transform" />
                CHANGE PROJECT
              </button>
              <button 
                onClick={() => setIsExportModalOpen(true)}
                className="rounded-2xl px-8 py-4 bg-[#003366] text-white text-[10px] font-black shadow-xl shadow-blue-900/20 uppercase tracking-widest hover:scale-105 transition-all whitespace-nowrap"
              >
                EXPORT DATA
              </button>
            </div>
          </div>
        )}

        {/* SUMMARY CARDS - Responsive Grid within component */}
        <div className={`transition-all duration-500 ${isPending ? "opacity-40 scale-[0.99] blur-[2px]" : "opacity-100 scale-100 blur-0"}`}>
          {isPending && !summaryData.databaseAssets ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <SummaryCards data={summaryData} onCardClick={handleMetricCardClick} />
          )}
        </div>
        
        {/* OPERATION SCHEDULES WIDGET */}
        <div className="mt-4">
          <ScheduleCalendarWidget projectId={filters.projectId} />
        </div>

        {/* MAIN ANALYTICS GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
          {/* OPERATIONAL TREND ANALYSIS */}
          <div ref={trendRef} className="xl:col-span-8 bg-white rounded-[2rem] p-5 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-50 relative group overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between w-full mb-10 gap-6 items-start md:items-center">
               <div>
                <h2 className="text-xs font-black italic uppercase tracking-[0.2em] text-[#003366] flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#00a1e4]" /> OPERATIONAL TREND 2026
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Monthly service activity</p>
               </div>
               <div className="flex flex-wrap gap-4 text-[9px] font-black tracking-widest text-slate-400 uppercase bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                  {summaryData.enabled_forms.split(",").map((form: string) => {
                    const type = form.trim().toLowerCase();
                    const config: any = {
                      audit: { label: "AUDIT", color: "bg-[#00A0E9]" },
                      preventive: { label: "PREVENTIVE", color: "bg-[#00B06B]" },
                      corrective: { label: "CORRECTIVE", color: "bg-[#EF4444]" },
                      dailylog: { label: "DAILY LOG", color: "bg-[#6366f1]" }
                    };
                    const item = config[type];
                    if (!item) return null;
                    return (
                      <span key={type} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div> {item.label}
                      </span>
                    );
                  })}
               </div>
            </div>

            <div className={`transition-all duration-700 min-h-[300px] ${isPending ? "scale-[0.98] blur-sm grayscale opacity-30" : "scale-100 blur-0 grayscale-0 opacity-100"}`}>
              <TrendChart data={chartData} enabledForms={summaryData.enabled_forms.split(",")} />
            </div>
          </div>

          {/* ASSET HEALTH STATUS */}
          <div className="xl:col-span-4 bg-white rounded-[2rem] p-5 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col min-h-[400px]">
            <h2 className="text-xs font-black italic uppercase tracking-[0.2em] text-[#003366] mb-8 flex items-center gap-2 truncate">
              <Activity size={16} className="text-red-500" /> ASSET HEALTH STATUS
            </h2>
            <div className="flex-1 relative">
              <UnitStatusChart data={healthStats} />
            </div>
          </div>
        </div>

        {/* FOOTER ANALYTICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* LIVE ACTIVITY FEED */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] p-5 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 min-h-[500px]">
             <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-xs font-black italic uppercase tracking-[0.2em] text-[#003366] flex items-center gap-2">
                  <Clock size={16} className="text-indigo-500 animate-pulse" /> FIELD ACTIVITY
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Real-time report submissions</p>
              </div>
              <button className="text-[10px] font-black text-[#00a1e4] uppercase underline underline-offset-4 decoration-2">View All</button>
             </div>
             <ActivityFeed activities={recentActivities} onItemClick={handleActivityClick} />
          </div>

          {/* INTERACTIVE STATUS WIDGETS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <StatusList  
              title="Units with Problems" 
              sub="CRITICAL" 
              items={problemUnits} 
              color="rose" 
              icon={<AlertTriangle size={20} className="text-white fill-white" />}
              onItemClick={openUnitDetail}
            />
            <StatusList 
              title="Work In Progress" 
              sub="ONGOING" 
              items={onProgressUnits} 
              color="amber" 
              icon={<Hammer size={16} className="text-white fill-white" />}
              onItemClick={openUnitDetail}
            />
            <ComplaintWidget items={recentComplaints} onItemClick={handleActivityClick} />
          </div>
        </div>
      </div>

      {!filters.projectId && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center py-20 px-6 sm:py-32 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
           <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-300 relative">
             <LayoutGrid size={40} strokeWidth={1.5} />
             <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#00a1e4] text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Search size={14} />
             </div>
           </div>
           <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter mb-3">Project Selection Required</h2>
           <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto uppercase tracking-widest text-[10px]">Please select a customer and project from the navigator above to activate the Command Center.</p>
           
           <div className="mt-10 flex gap-4 opacity-30 grayscale pointer-events-none scale-90 blur-[1px]">
              <div className="w-32 h-1 bg-slate-200 rounded-full" />
              <div className="w-16 h-1 bg-slate-200 rounded-full" />
              <div className="w-24 h-1 bg-slate-200 rounded-full" />
           </div>
        </div>
      )}

      {/* MODALS RENDERED AT ROOT TO PREVENT CONTAINING BLOCK TRAPPING */}
      <ExportOptionsModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isProcessing={isExporting}
      />

      <SummaryDetailModal 
        isOpen={isMetricModalOpen}
        onClose={() => setIsMetricModalOpen(false)}
        data={selectedMetric}
        onAnalyzeTrends={handleAnalyzeTrends}
        onOpenReports={handleOpenReports}
      />

      <UnitDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        unit={selectedUnit}
        history={unitHistory}
        historyLoading={historyLoading}
        isStatusUpdating={isStatusUpdating}
        onStatusUpdate={handleStatusUpdate}
        projectId={selectedUnit?.project_ref_id?.toString()}
      />
    </div>
  );
}

function StatusList({ title, sub, items, color, icon, onItemClick }: any) {
  const colorMap: any = {
    rose: "bg-rose-50 border-rose-100 text-rose-700 font-rose-500",
    amber: "bg-amber-50 border-amber-100 text-amber-700 font-amber-500"
  };

  return (
    <div className={`bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col min-h-[250px] group transition-all hover:border-${color}-200`}>
      <div className={`p-6 ${color === 'rose' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'} border-b flex justify-between items-center shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl ${color === 'rose' ? 'bg-rose-500 shadow-rose-200' : 'bg-amber-500 shadow-amber-200'} flex items-center justify-center shadow-lg animate-pulse`}>
            {icon}
          </div>
          <div>
            <h3 className={`text-xs font-black uppercase tracking-widest ${color === 'rose' ? 'text-rose-700' : 'text-amber-700'}`}>{title}</h3>
            <p className={`text-[9px] font-bold ${color === 'rose' ? 'text-rose-500' : 'text-amber-500'} tracking-wider`}>{sub}</p>
          </div>
        </div>
        <span className={`px-3 py-1 ${color === 'rose' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'} text-[10px] font-black rounded-lg`}>{items.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale p-8 text-center uppercase text-[10px] font-black tracking-widest">
            <p>Clear Status</p>
          </div>
        ) : (
          items.map((u: any) => (
            <div key={u.id} onClick={() => onItemClick(u)} className={`p-4 ${color === 'rose' ? 'bg-rose-50/30' : 'bg-amber-50/30'} hover:bg-slate-50 rounded-2xl border-2 border-slate-50 hover:border-${color}-500/30 transition-all cursor-pointer flex justify-between items-center group/card shadow-sm`}>
              <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${color === 'rose' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                 <div>
                  <p className={`text-sm font-black ${color === 'rose' ? 'text-rose-900' : 'text-amber-900'} tracking-tight leading-none mb-1 group-hover/card:text-[#00a1e4] transition-colors`}>
                    {u.room_tenant || u.area || "Unknown Room"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${color === 'rose' ? 'text-rose-500/70' : 'text-amber-500/70'}`}>{u.tag_number || "NO-TAG"}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{u.model || u.projects?.name || ""}</span>
                  </div>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover/card:translate-x-1 group-hover/card:text-slate-500 transition-all" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ComplaintWidget({ items, onItemClick }: any) {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col min-h-[250px] group transition-all hover:border-indigo-200">
      <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200 animate-pulse">
            <Activity size={20} className="text-white fill-white" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-700">Recent Complaints</h3>
        </div>
        <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-[10px] font-black rounded-lg">{items.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-30 p-8 text-center uppercase text-[10px] font-black tracking-widest">
            <p>No Active Complaints</p>
          </div>
        ) : (
          items.map((c: any) => {
            const isProcessing = ["On_Progress", "Pending"].includes(c.unit_status);
            
            return (
              <div 
                key={c.id} 
                onClick={() => onItemClick({ id: c.unit_id || 0, tag_number: c.unit_tag })} 
                className={`p-4 ${isProcessing ? 'bg-amber-50/50 border-amber-200' : 'bg-indigo-50/30 border-indigo-50'} hover:bg-slate-50 rounded-2xl border transition-all flex flex-col gap-1 shadow-sm cursor-pointer group/card`}
              >
                <div className="flex justify-between items-center">
                   <p className={`text-xs font-black ${isProcessing ? 'text-amber-900 font-black' : 'text-indigo-900 font-black'} tracking-tight`}>{c.unit_tag}</p>
                   {isProcessing ? (
                     <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                       <Clock size={8} /> PROCESSING
                     </span>
                   ) : (
                     <span className="text-[8px] font-bold text-slate-400">{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</span>
                   )}
                </div>
                {(c.unit_room || c.unit_area) && (
                  <p className={`text-[9px] font-bold ${isProcessing ? 'text-amber-600' : 'text-indigo-500'}`}>{c.unit_room || c.unit_area}{c.unit_room && c.unit_area ? ` · ${c.unit_area}` : ''}</p>
                )}
                <p className="text-[10px] font-medium text-slate-600 line-clamp-1 italic">"{c.description}"</p>
                
                <div className="flex justify-end mt-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                   <span className="text-[8px] font-black text-[#00a1e4] uppercase tracking-widest flex items-center gap-1">Open unit <ArrowRight size={8} /></span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
