"use client";

import { useSearchParams, useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useTransition, useRef } from "react";
import { 
  getDashboardData, 
  getTrendChartData, 
  getRecentActivities, 
  getUnitHealthStats,
  getDetailedUnitStatus
} from "@/app/actions/dashboard";
import { getUnitHistory, updateUnitStatus, getUnitByTag, getProjectData } from "@/app/actions/units";
import { getSession } from "@/app/actions/auth";
import { getProjectComplaints } from "@/app/actions/complaints";
import { getComprehensiveReportData } from "@/app/actions/report";
import { generateComprehensivePDF } from "@/lib/pdf-report-generator";
import { APP_VERSION } from "@/lib/version";
import SummaryCards from "@/components/dashboard/SummaryCards";
import SummaryDetailModal from "@/components/dashboard/SummaryDetailModal";
import TrendChart from "@/components/dashboard/TrendChart";
import ProjectSpotlight from "@/components/dashboard/ProjectSpotlight";
import UnitStatusChart from "@/components/dashboard/UnitStatusChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ExportOptionsModal from "@/components/dashboard/ExportOptionsModal";
import ScheduleCalendarWidget from "@/components/dashboard/ScheduleCalendarWidget";
import AssetManager from "@/components/dashboard/AssetManager";
import UnitFormModal from "@/components/dashboard/UnitFormModal";
import QuickInputModal from "@/components/dashboard/QuickInputModal";
import { Clock, BarChart3, Activity, Zap, AlertTriangle, Hammer, ArrowRight, LayoutGrid, Search, LayoutDashboard, Package } from "lucide-react";
import { motion } from "framer-motion";

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
    complaint: { actual: { daily: 0, monthly: 0, total: 0 }, kpi: { appeared: 0, resolved: 0 } },
    databaseAssets: 0, totalCustomers: 0, activeSites: 0,
    enabled_forms: "audit,preventive,corrective,dailylog",
    monitoring_focus: "UNIT"
  });

  const params = useParams();
  const pathname = usePathname();
  const urlProjectId = params?.projectId as string;

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [healthStats, setHealthStats] = useState<any[]>([]);
  const [problemUnits, setProblemUnits] = useState<any[]>([]);
  const [onProgressUnits, setOnProgressUnits] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  // Navigation for items
  const handleUnitNavigation = (tag: string) => {
    router.push(`/w/${urlProjectId}/dashboard/units/redirect?tag=${tag}`);
  };

  // Modal states
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isQuickInputOpen, setIsQuickInputOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    if (!urlProjectId || urlProjectId === "empty") {
      setIsSpotlightOpen(true);
    } else {
      setFilters({ projectId: urlProjectId });
      setIsSpotlightOpen(false);
      const saved = localStorage.getItem("daikin_last_project");
      if (!saved || JSON.parse(saved).pid !== urlProjectId) {
         localStorage.setItem("daikin_last_project", JSON.stringify({ pid: urlProjectId, name: "Workspace Active" }));
      }
    }
  }, [urlProjectId]);

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "summary");

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
    setIsSpotlightOpen(false);
    localStorage.setItem("daikin_last_project", JSON.stringify({ cid, pid, name }));
      router.push(`/w/${pid}/dashboard`);
  };

  const fetchData = async (f: { customerId?: string; projectId?: string }) => {
    if (!f.projectId) return;
    
    startTransition(async () => {
      try {
        const [stats, s] = await Promise.all([
          getDashboardData(f),
          getSession()
        ]);
        setSummaryData(stats);
        setSession(s);
        if (stats.projectName) setProjectName(stats.projectName);
      } catch (err) {
        console.error("Critical Stats Error:", err);
      }
    });

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

  const handleComplaintClick = async (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await getUnitByTag(tag);
    if (res && "success" in res && res.success && res.data) {
        window.open(`/w/${urlProjectId}/dashboard/units/${res.data.id}`, '_blank');
    }
  };

  const handleMetricCardClick = (metricData: any) => {
    setSelectedMetric(metricData);
    setIsMetricModalOpen(true);
  };

  const handleUnitClick = (e: React.MouseEvent, unit: any) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/w/${urlProjectId}/dashboard/units/${unit.id}`, '_blank');
  };

  const handleOpenReports = (type: string) => {
    setIsMetricModalOpen(false);
    router.push(`/w/${urlProjectId}/dashboard/reports?type=${type}`);
  };

  const handleActivityClick = async (e: React.MouseEvent, unitId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (unitId) {
        window.open(`/w/${urlProjectId}/dashboard/units/${unitId}`, '_blank');
    }
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

  if (!isMounted) return null;

  const TABS = [
    { id: "summary", label: "Overview", icon: BarChart3 },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "inventory", label: "Assets", icon: LayoutGrid },
  ];

  return (
    <div className="w-full flex flex-col space-y-6 pb-32 relative bg-white min-h-screen">
      <ProjectSpotlight 
        isOpen={isSpotlightOpen} 
        onSelect={handleProjectSelect} 
        onClose={filters.projectId ? () => setIsSpotlightOpen(false) : undefined} 
      />

      <div className={`transition-all duration-500 space-y-6 ${!filters.projectId ? "blur-lg opacity-20 scale-98 pointer-events-none select-none" : "blur-0 opacity-100 scale-100"}`}>
        {/* BOARD HEADER - monday.com Style */}
        {!isApp && (
          <div className="flex flex-col w-full gap-8 pb-4">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
              <div className="space-y-1 overflow-hidden w-full">
                <h1 className="text-3xl sm:text-4xl font-black text-[#323338] tracking-tight leading-none uppercase">
                  {projectName}
                </h1>
              </div>

              <div className="flex items-center justify-end gap-3 w-full xl:w-auto">
                {session?.isInternal && (
                  <button 
                    onClick={() => setIsExportModalOpen(true)}
                    className="rounded-xl px-6 py-2.5 bg-[#0073ea] text-white text-xs font-bold hover:bg-[#0060c5] transition-all whitespace-nowrap shadow-md shadow-blue-500/20"
                  >
                    Export Data
                  </button>
                )}
              </div>
            </div>

            {/* View Tabs */}
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
        )}

        {/* TAB CONTENT */}
        {activeTab === "summary" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`transition-all duration-500 space-y-8 ${isPending ? "opacity-40 scale-[0.99] blur-[2px]" : "opacity-100 scale-100 blur-0"}`}
          >
            {isPending && !summaryData.databaseAssets ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-white rounded-xl border border-[#e6e9ef] animate-pulse" />
                ))}
              </div>
            ) : (
              <SummaryCards data={summaryData} onCardClick={handleMetricCardClick} />
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Main Analysis Column */}
              <div className="xl:col-span-8 space-y-8">
                <div className="bg-white rounded-2xl border border-[#e6e9ef] p-6 md:p-8 shadow-sm">
                   <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#323338] flex items-center gap-2">
                           <BarChart3 size={16} className="text-[#0073ea]" /> Performance Trend
                        </h3>
                      </div>
                   </div>
                    <TrendChart 
                      data={chartData} 
                      enabledForms={[...(summaryData.enabled_forms?.split(",") || ["audit", "preventive", "corrective"]), "complaint"]} 
                    />
                </div>

                <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e6e9ef] shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-[0.15em] text-[#323338] flex items-center gap-2">
                        <Clock size={16} className="text-[#0073ea]" /> Recent History
                      </h2>
                    </div>
                    <button 
                      onClick={() => handleOpenReports("all")}
                      className="text-[10px] font-black text-[#0073ea] uppercase hover:underline underline-offset-4 decoration-2"
                    >
                      View All
                    </button>
                  </div>
                   <ActivityFeed activities={recentActivities} onItemClick={(e, unitId) => handleActivityClick(e, unitId)} />
                </div>
              </div>
              
              {/* Sidebar Alerts Column */}
              <div className="xl:col-span-4 space-y-6">
                <StatusList  
                  title={`Active Issues`} 
                  sub="ATTENTION REQUIRED" 
                  items={problemUnits} 
                  color="rose" 
                  icon={<AlertTriangle size={20} className="text-white" />}
                  onItemClick={(e: any, unit: any) => handleUnitClick(e, unit)}
                />
                
                <StatusList 
                  title="Work In Progress" 
                  sub="ONGOING" 
                  items={onProgressUnits} 
                  color="amber" 
                  icon={<Hammer size={16} className="text-white" />}
                  onItemClick={(e: any, unit: any) => handleUnitClick(e, unit)}
                />

                <ComplaintWidget items={recentComplaints} onItemClick={(e, unitId) => handleActivityClick(e, unitId)} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "timeline" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 space-y-8"
          >
            <ScheduleCalendarWidget projectId={filters.projectId} />
          </motion.div>
        )}

        {activeTab === "inventory" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
          >
             <div className="bg-white rounded-[2rem] p-4 md:p-8 border border-[#e6e9ef] shadow-sm">
                <AssetManager 
                   projectId={urlProjectId} 
                   onUnitClick={() => {}} 
                   session={session}
                   monitoringFocus={summaryData.monitoring_focus}
                   onRefresh={() => fetchData(filters)}
                   onOpenQuickInput={() => setIsQuickInputOpen(true)}
                   onOpenAddModal={() => setIsAddModalOpen(true)}
                   onOpenEditModal={(unit) => {
                      setUnitToEdit(unit);
                      setIsEditModalOpen(true);
                   }}
                />
             </div>
          </motion.div>
        )}
      </div>

      {!filters.projectId && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center py-20 px-6 sm:py-32 bg-white/80 backdrop-blur-sm rounded-3xl border border-dashed border-[#e6e9ef]">
           <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-300 relative border border-slate-100">
             <LayoutGrid size={32} strokeWidth={1.5} />
             <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-[#0073ea] text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Search size={12} />
             </div>
           </div>
           <h2 className="text-xl font-black text-[#323338] uppercase tracking-tight mb-2">Workspace Inactive</h2>
           <p className="text-slate-400 font-bold text-[10px] max-w-xs mx-auto uppercase tracking-widest text-center">Select a customer and project from the navigator to activate the Dashboard.</p>
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
        onAnalyzeTrends={() => {}} 
        onOpenReports={handleOpenReports}
      />

      <QuickInputModal 
        isOpen={isQuickInputOpen && session?.isInternal} 
        onClose={() => setIsQuickInputOpen(false)}
        unit={null}
      />

      <UnitFormModal 
        isOpen={(isAddModalOpen || isEditModalOpen) && session?.isInternal}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setUnitToEdit(null);
        }}
        onRefresh={() => fetchData(filters)}
        projectId={urlProjectId}
        unit={unitToEdit}
        mode={isEditModalOpen ? "edit" : "create"}
        enabledTypes={summaryData.enabled_unit_types}
        monitoringFocus={summaryData.monitoring_focus}
      />
    </div>

  );
}

function StatusList({ title, sub, items, color, icon, onItemClick }: any) {
  const accentColor = color === 'rose' ? 'bg-[#e44258]' : 'bg-[#ff9f1a]';
  const lightBg = color === 'rose' ? 'bg-[#e44258]/5' : 'bg-[#ff9f1a]/5';
  const textColor = color === 'rose' ? 'text-[#e44258]' : 'text-[#ff9f1a]';

  return (
    <div className="bg-white rounded-2xl border border-[#e6e9ef] overflow-hidden flex flex-col min-h-[300px] shadow-sm relative">
      <div className="p-6 border-b border-[#f7f8fa] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${lightBg} ${textColor} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#323338]">{title}</h3>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{sub}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 ${lightBg} ${textColor} text-[10px] font-black rounded-lg border border-current/10`}>{items.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">All Systems Clear</p>
          </div>
        ) : (
          items.map((u: any) => (
            <div 
              key={u.id} 
              onClick={(e) => { e.preventDefault(); onItemClick(e, u); }} 
              className="p-4 bg-white hover:bg-[#f7f8fa] rounded-xl border border-[#e6e9ef] transition-all cursor-pointer flex justify-between items-center group/card"
            >
              <div className="flex items-center gap-3 min-w-0">
                 <div className={`w-1.5 h-1.5 rounded-full ${accentColor} shrink-0`}></div>
                 <div className="min-w-0">
                  <p className="text-sm font-bold text-[#323338] tracking-tight leading-none mb-1 group-hover/card:text-[#0073ea] transition-colors truncate">
                    {u.room_tenant || u.area || "Unknown Room"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{u.tag_number || "NO-TAG"}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight truncate">{u.model || u.projects?.name || ""}</span>
                  </div>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover/card:translate-x-1 group-hover/card:text-[#0073ea] transition-all shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ComplaintWidget({ items, onItemClick }: any) {
  return (
    <div className="bg-white rounded-2xl border border-[#e6e9ef] overflow-hidden flex flex-col min-h-[300px] shadow-sm">
      <div className="p-6 border-b border-[#f7f8fa] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#323338]">Recent Complaints</h3>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">User Feedback</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100">{items.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-30 p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Active Complaints</p>
          </div>
        ) : (
          items.map((c: any) => {
            const isProcessing = ["On_Progress", "Pending"].includes(c.unit_status);
            
            return (
              <div 
                key={c.id} 
                onClick={(e) => { e.preventDefault(); onItemClick(e, c.unit_id?.toString() || ""); }} 
                className={`p-4 ${isProcessing ? 'bg-amber-50/20 border-amber-100' : 'bg-white border-[#e6e9ef]'} hover:bg-[#f7f8fa] rounded-xl border transition-all flex flex-col gap-1 cursor-pointer group/card`}
              >
                <div className="flex justify-between items-center">
                   <p className={`text-xs font-black ${isProcessing ? 'text-amber-600' : 'text-[#323338]'} tracking-tight`}>{c.unit_tag}</p>
                   {isProcessing ? (
                     <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded-full">
                       <Clock size={8} /> PROCESSING
                     </span>
                   ) : (
                     <span className="text-[8px] font-bold text-slate-300">{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</span>
                   )}
                </div>
                {(c.unit_room || c.unit_area) && (
                  <p className={`text-[9px] font-bold ${isProcessing ? 'text-amber-600/70' : 'text-slate-400'}`}>{c.unit_room || c.unit_area}{c.unit_room && c.unit_area ? ` · ${c.unit_area}` : ''}</p>
                )}
                <p className="text-[10px] font-medium text-slate-500 line-clamp-1 italic">"{c.description}"</p>
                
                <div className="flex justify-end mt-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                   <span className="text-[8px] font-black text-[#0073ea] uppercase tracking-widest flex items-center gap-1">Open unit <ArrowRight size={8} /></span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

