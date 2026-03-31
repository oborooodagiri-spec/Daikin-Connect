"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import Link from "next/link";
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
import { getProjectsByCustomer } from "../actions/projects";
import { generateComprehensivePDF } from "@/lib/pdf-report-generator";
import SummaryCards from "../../components/dashboard/SummaryCards";
import SummaryDetailModal from "../../components/dashboard/SummaryDetailModal";
import TrendChart from "../../components/dashboard/TrendChart";
import CustomerProjectSelector from "../../components/dashboard/CustomerProjectSelector";
import UnitStatusChart from "../../components/dashboard/UnitStatusChart";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import UnitDetailModal from "../../components/UnitDetailModal";
import ExportOptionsModal from "../../components/dashboard/ExportOptionsModal";
import ScheduleCalendarWidget from "../../components/dashboard/ScheduleCalendarWidget";
import { Clock, BarChart3, Activity, Zap, Info, AlertTriangle, Hammer, ArrowRight } from "lucide-react";

export default function DashboardWrapper() {
  const router = useRouter();
  const trendRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<{ customerId?: string; projectId?: string }>({});
  const [summaryData, setSummaryData] = useState<any>({
    audit: { actual: { daily: 0, monthly: 0, total: 0 }, target: { daily: 0, monthly: 0, total: 0 } },
    preventive: { actual: { daily: 0, monthly: 0, total: 0 }, target: { daily: 0, monthly: 0, total: 0 } },
    corrective: { actual: { daily: 0, monthly: 0, total: 0 }, target: { daily: 0, monthly: 0, total: 0 } },
    databaseAssets: 0, totalCustomers: 0, activeSites: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [healthStats, setHealthStats] = useState<any[]>([]);
  const [problemUnits, setProblemUnits] = useState<any[]>([]);
  const [onProgressUnits, setOnProgressUnits] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  // Modal Detail State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [unitHistory, setUnitHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  
  // Metric Detail State
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);

  // Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async (f: { customerId?: string; projectId?: string }) => {
    startTransition(async () => {
      const [stats, trend, activity, health, details] = await Promise.all([
        getDashboardData(f),
        getTrendChartData(f),
        getRecentActivities(f),
        getUnitHealthStats(f),
        getDetailedUnitStatus(f)
      ]);
      setSummaryData(stats);
      setChartData(trend);
      setRecentActivities(activity);
      setHealthStats(health);
      if (details.success) {
        setProblemUnits(details.problems);
        setOnProgressUnits(details.progress);
      }

      const complaintsRes = await getProjectComplaints(f.projectId);
      if (complaintsRes && 'success' in complaintsRes) {
        setRecentComplaints(complaintsRes.data || []);
      }
    });
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
        if (res.success && 'data' in res) {
          openUnitDetail(res.data);
        }
      }
    } catch (e) {}
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedUnit) return;
    setIsStatusUpdating(true);
    const res = await updateUnitStatus(selectedUnit.id, newStatus);
    if (res.success) {
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
        alert("Export Error: " + res.error);
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
    <div className="w-full flex-col space-y-8 flex pb-20">
      {/* HEADER SECTION */}
      <div className="flex w-full items-center justify-between pb-8 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-[#00a1e4]/10 text-[#00a1e4] text-[10px] font-black uppercase tracking-widest rounded-full">REALTIME V3.1</span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
              <Zap size={10} className="fill-orange-400 text-orange-400" /> LIVE CONNECTED
            </span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-[#003366]">
            COMMAND <span className="text-[#00a1e4] not-italic">CENTER</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <CustomerProjectSelector onFilterChange={setFilters} />
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="rounded-2xl px-8 py-3.5 bg-[#003366] text-white text-[11px] font-black shadow-xl shadow-blue-900/10 uppercase tracking-widest hover:scale-105 transition-all"
          >
            EXPORT DATA
          </button>
        </div>
      </div>

      <ExportOptionsModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isProcessing={isExporting}
      />

      {/* SUMMARY CARDS - ENHANCED ROTATING VERSION */}
      <div className={`transition-opacity duration-500 ${isPending ? "opacity-40" : "opacity-100"}`}>
        <SummaryCards data={summaryData} onCardClick={handleMetricCardClick} />
      </div>

      {/* METRIC DETAIL MODAL */}
      <SummaryDetailModal 
        isOpen={isMetricModalOpen}
        onClose={() => setIsMetricModalOpen(false)}
        data={selectedMetric}
        onAnalyzeTrends={handleAnalyzeTrends}
        onOpenReports={handleOpenReports}
      />
      
      {/* OPERATION SCHEDULES WIDGET */}
      <div className="mt-8">
        <ScheduleCalendarWidget projectId={filters.projectId} />
      </div>

      <div className="grid grid-cols-12 gap-8 mt-6">
        {/* MAIN CHART - 8 COLUMNS */}
        <div ref={trendRef} className="col-span-8 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-50 relative group">
          <div className="flex justify-between w-full mb-10 items-center">
             <div>
              <h2 className="text-xs font-black italic tracking-[0.2em] text-[#003366] flex items-center gap-2">
                <BarChart3 size={16} className="text-[#00a1e4]" /> OPERATIONAL TREND ANALYSIS 2026
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Monthly service activity aggregation</p>
             </div>
             <div className="flex gap-6 text-[9px] font-black tracking-widest text-slate-400 uppercase bg-slate-50 px-6 py-2.5 rounded-full border border-slate-100">
                <span className="flex items-center gap-2 group-hover:text-[#00A0E9] transition-colors"><div className="w-2 h-2 rounded-full bg-[#00A0E9]"></div> AUDIT</span>
                <span className="flex items-center gap-2 group-hover:text-[#00B06B] transition-colors"><div className="w-2 h-2 rounded-full bg-[#00B06B]"></div> PREVENTIVE</span>
                <span className="flex items-center gap-2 group-hover:text-[#EF4444] transition-colors"><div className="w-2 h-2 rounded-full bg-[#EF4444]"></div> CORRECTIVE</span>
             </div>
          </div>

          <div className={`transition-all duration-700 ${isPending ? "scale-[0.98] blur-sm grayscale" : "scale-100 blur-0 grayscale-0"}`}>
            <TrendChart data={chartData} />
          </div>
        </div>

        {/* ASSET HEALTH SQUAD - 4 COLUMNS */}
        <div className="col-span-4 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col">
          <h2 className="text-xs font-black italic tracking-[0.2em] text-[#003366] mb-8 flex items-center gap-2">
            <Activity size={16} className="text-red-500" /> ASSET HEALTH STATUS
          </h2>
          <div className="flex-1 min-h-[300px]">
            <UnitStatusChart data={healthStats} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 mt-4">
        {/* LIVE ACTIVITY FEED - 7 COLUMNS */}
        <div className="col-span-7 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-100 min-h-[500px]">
           <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xs font-black italic tracking-[0.2em] text-[#003366] flex items-center gap-2">
                <Clock size={16} className="text-indigo-500 animate-pulse" /> RECENT FIELD ACTIVITY
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Real-time report submissions</p>
            </div>
            <button className="text-[10px] font-black text-[#00a1e4] uppercase underline underline-offset-4 decoration-2">View All Reports</button>
           </div>
            <ActivityFeed activities={recentActivities} onItemClick={handleActivityClick} />
        </div>

        {/* INTERACTIVE STATUS WIDGETS - 5 COLUMNS */}
        <div className="col-span-5 flex flex-col gap-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col h-1/2 min-h-[280px] group transition-all hover:border-rose-200">
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-200 animate-pulse">
                  <AlertTriangle size={20} className="text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-rose-700">Units with Problems</h3>
                  <p className="text-[9px] font-bold text-rose-500 tracking-wider">CRITICAL ATTENTION REQUIRED</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-rose-200 text-rose-800 text-[10px] font-black rounded-lg">{problemUnits.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {problemUnits.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale p-8 text-center">
                  <Zap size={32} className="mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest">System Healthy</p>
                </div>
              ) : (
                problemUnits.map((u: any) => (
                  <div key={u.id} onClick={() => openUnitDetail(u)} className="p-4 bg-rose-50/30 hover:bg-rose-50 rounded-2xl border-2 border-rose-100/50 hover:border-rose-500/30 transition-all cursor-pointer flex justify-between items-center group/card animate-pulse shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                       <div>
                        <p className="text-sm font-black text-rose-900 tracking-tight group-hover/card:text-rose-700">{u.tag_number}</p>
                        <p className="text-[10px] font-bold text-rose-400 uppercase">{u.projects?.name || "Unknown Project"}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-rose-300 group-hover/card:translate-x-1 group-hover/card:text-rose-500 transition-all" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col h-1/3 min-h-[200px] group transition-all hover:border-amber-200">
            <div className="p-5 bg-amber-50 border-b border-amber-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200 animate-pulse">
                  <Hammer size={16} className="text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-700">Work In Progress</h3>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-[9px] font-black rounded-lg">{onProgressUnits.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {onProgressUnits.length === 0 ? (
                <div className="h-full flex items-center justify-center opacity-30 grayscale p-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest">No Active Repairs</p>
                </div>
              ) : (
                onProgressUnits.map((u: any) => (
                  <div key={u.id} onClick={() => openUnitDetail(u)} className="p-3 bg-amber-50/30 hover:bg-amber-50 rounded-xl border border-amber-100/50 hover:border-amber-500/30 transition-all cursor-pointer flex justify-between items-center group/card shadow-sm">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                       <p className="text-xs font-black text-amber-900 tracking-tight">{u.tag_number}</p>
                    </div>
                    <ArrowRight size={12} className="text-amber-300 group-hover/card:translate-x-1 group-hover/card:text-amber-500 transition-all" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col h-1/3 min-h-[200px] group transition-all hover:border-indigo-200">
            <div className="p-5 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200 animate-pulse">
                  <Activity size={16} className="text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Recent Complaints</h3>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-[9px] font-black rounded-lg">{recentComplaints.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {recentComplaints.length === 0 ? (
                <div className="h-full flex items-center justify-center opacity-30 grayscale p-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest">No Recent Complaints</p>
                </div>
              ) : (
                recentComplaints.map((c: any) => (
                  <div key={c.id} className="p-3 bg-indigo-50/30 hover:bg-indigo-50 rounded-xl border border-indigo-100/50 hover:border-indigo-500/30 transition-all flex flex-col gap-1 shadow-sm">
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black text-indigo-900 tracking-tight">{c.unit_tag}</p>
                       <span className="text-[8px] font-bold text-slate-400">{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-600 line-clamp-1 italic">"{c.description}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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
