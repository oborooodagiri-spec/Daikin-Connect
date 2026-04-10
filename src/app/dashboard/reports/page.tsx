"use client";

import { useEffect, useState, useTransition, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAllReports, getReportDetail, getSummaryData } from "@/app/actions/reports";
import { processReportData } from "@/lib/reportDataHelper";
import { getSession } from "@/app/actions/auth";
import { softDeleteActivity, permanentPurgeOldRecords } from "@/app/actions/units";
import {
  FileText, Search, Download, Filter, ChevronLeft, ChevronRight,
  ClipboardCheck, Wrench, AlertTriangle, BarChart3, Calendar,
  Eye, ExternalLink, Image as ImageIcon, X, Printer, Play, FileVideo, Loader2, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// PDF Templates for high-fidelity printing
import { getAuditSections } from "@/components/AuditPDFTemplate";
import { getPreventiveSections } from "@/components/PreventivePDFTemplate";
import { getCorrectiveSections } from "@/components/CorrectivePDFTemplate";
import { getSummarySections } from "@/components/SummaryReportTemplate";
import { ReportBase } from "@/components/ReportBase";

// Form Components for Editing
import AuditFormClient from "@/app/passport/[token]/audit/AuditFormClient";
import PreventiveFormClient from "@/app/passport/[token]/preventive/PreventiveFormClient";
import CorrectiveFormClient from "@/app/passport/[token]/corrective/CorrectiveFormClient";

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
  Audit: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: ClipboardCheck, label: "Audit" },
  Preventive: { color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", icon: Wrench, label: "Preventive" },
  Corrective: { color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: AlertTriangle, label: "Corrective" },
};

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "all";

  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalAudit: 0, totalPreventive: 0, totalCorrective: 0, totalAll: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [session, setSession] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail modal & Print execution
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  const [printPages, setPrintPages] = useState<any[][]>([]);
  const [isEditing, setIsEditing] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    const res = await getAllReports({
      type: typeFilter,
      search: searchQuery,
      dateFrom,
      dateTo,
      page,
      limit: 20,
    });
    if ("success" in res && res.success) {
      setReports(res.data || []);
      setStats(res.stats || { totalAudit: 0, totalPreventive: 0, totalCorrective: 0, totalAll: 0 });
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
    }
    setLoading(false);
  };

  // Real-time debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    // Initial fetch handled by debounced effect if searchQuery is empty initially, 
    // but typeFilter needs its own immediate trigger or included in the same effect.
    fetchReports(1);
    
    const init = async () => {
      const s = await getSession();
      setSession(s);
      if (s?.roles?.some((r: any) => /admin|super/i.test(r))) {
         permanentPurgeOldRecords();
      }
    };
    init();
  }, [typeFilter]);

  const handlePageChange = (p: number) => fetchReports(p);

  const handleSelectReport = async (reportId: string) => {
    setIsSelecting(reportId);
    try {
      const res = await getReportDetail(reportId);
      if ("success" in res && res.success) {
        const processed = processReportData(res.data);
        setSelectedReport(processed);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal memuat detail laporan.");
    } finally {
      setIsSelecting(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("PERHATIAN: Laporan ini akan dipindahkan ke Trash selama 7 hari sebelum dihapus permanen.\n\nApakah Anda yakin ingin menghapus laporan ini?")) return;
    
    setIsDeleting(reportId);
    try {
      const res = await softDeleteActivity(Number(reportId), 'formal');
      if (res.success) {
        alert("Laporan berhasil dipindahkan ke Trash.");
        setSelectedReport(null);
        fetchReports(pagination.page);
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExportSummary = async () => {
    if (!dateFrom || !dateTo) {
      alert("Mohon pilih rentang tanggal (Dari & Sampai) terlebih dahulu.");
      return;
    }
    setIsExporting(true);
    setIsPrinting(true);
    try {
      const res = await getSummaryData(dateFrom, dateTo) as any;
      if (res.success) {
        const summaryData = res.data;
        setPrintData({ type: "SUMMARY", reference_id: `SR-${Date.now()}` }); // Mock for ReportBase

        const PX_PER_MM = 3.78;
        const SAFE_CONTENT_MM = 220;
        const SAFE_PX = SAFE_CONTENT_MM * PX_PER_MM;

        const sections = getSummarySections(summaryData);
        const pages: any[][] = [[]];
        let currentHeight = 0;

        const { createRoot } = await import("react-dom/client");
        const measureDiv = document.createElement("div");
        measureDiv.style.width = "794px";
        measureDiv.style.position = "fixed";
        measureDiv.style.top = "0";
        measureDiv.style.left = "0";
        measureDiv.style.zIndex = "-1000";
        measureDiv.style.opacity = "0";
        measureDiv.style.pointerEvents = "none";
        document.body.appendChild(measureDiv);

        for (const section of sections) {
          const tempWrap = document.createElement("div");
          tempWrap.style.width = "100%";
          measureDiv.appendChild(tempWrap);
          const root = createRoot(tempWrap);
          
          await new Promise<void>((resolve) => {
            root.render(section);
            setTimeout(resolve, 150); 
          });

          const sectionHeight = tempWrap.offsetHeight;
          if (currentHeight + sectionHeight > SAFE_PX && currentHeight > 0) {
            pages.push([section]);
            currentHeight = sectionHeight;
          } else {
            pages[pages.length - 1].push(section);
            currentHeight += sectionHeight;
          }
          root.unmount();
        }
        document.body.removeChild(measureDiv);
        setPrintPages(pages);

        document.title = `Summary_Report_${dateFrom}_to_${dateTo}`;
        setTimeout(() => {
          window.print();
          setIsPrinting(false);
          setIsExporting(false);
          setPrintPages([]);
          document.title = "Daikin Connect Reports";
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal mengexport summary.");
      setIsPrinting(false);
      setIsExporting(false);
    }
  };

  const handleViewReport = (id: string, type: string) => {
    window.open(`/reports/${type}/${id}`, "_blank");
  };

  const handlePrint = async (reportId: string) => {
    setIsPrinting(true);
    try {
      // If already selected, use it, otherwise fetch
      let report = selectedReport;
      if (!report || report.id !== reportId.toString()) {
        const res = await getReportDetail(reportId);
        if ("success" in res && res.success) {
          report = processReportData(res.data);
        }
      }

      if (report) {
        setPrintData(report);
        
        const PX_PER_MM = 3.78;
        const SAFE_CONTENT_MM = 220;
        const SAFE_PX = SAFE_CONTENT_MM * PX_PER_MM;

        let sections: any[] = [];
        if (report.type === "Audit") sections = getAuditSections(report, report.units);
        if (report.type === "Preventive") sections = getPreventiveSections(report, report.units, report.engineerName, report.customerName);
        if (report.type === "Corrective") sections = getCorrectiveSections(report, report.units);

        const measureDiv = document.createElement("div");
        measureDiv.style.width = "794px";
        measureDiv.style.position = "fixed";
        measureDiv.style.top = "0";
        measureDiv.style.left = "0";
        measureDiv.style.zIndex = "-1000";
        measureDiv.style.opacity = "0";
        measureDiv.style.pointerEvents = "none";
        document.body.appendChild(measureDiv);

        const pages: any[][] = [[]];
        let currentHeight = 0;

        const { createRoot } = await import("react-dom/client");

        for (const section of sections) {
          const tempWrap = document.createElement("div");
          tempWrap.style.width = "100%";
          measureDiv.appendChild(tempWrap);
          const root = createRoot(tempWrap);
          
          await new Promise<void>((resolve) => {
            root.render(section);
            setTimeout(resolve, 100); // Increased wait for accurate measurement
          });

          const sectionHeight = tempWrap.offsetHeight;
          if (currentHeight + sectionHeight > SAFE_PX && currentHeight > 0) {
            pages.push([section]);
            currentHeight = sectionHeight;
          } else {
            pages[pages.length - 1].push(section);
            currentHeight += sectionHeight;
          }
          
          root.unmount();
        }
        document.body.removeChild(measureDiv);
        setPrintPages(pages);

        const type = report.type || "Report";
        const tag = report.units?.tag_number || report.unit_tag || report.id;
        const oldTitle = document.title;
        document.title = `${type}_${tag}`;

        // Wait for state to catch up and images to load in the print view
        setTimeout(() => {
          window.print();
          setIsPrinting(false);
          setPrintData(null);
          setPrintPages([]);
          document.title = oldTitle;
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setIsPrinting(false);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 no-print">
        {[
          { label: "Total Reports", value: stats.totalAll, color: "from-slate-600 to-slate-800", icon: BarChart3 },
          { label: "Audit", value: stats.totalAudit, color: "from-emerald-500 to-emerald-700", icon: ClipboardCheck },
          { label: "Preventive", value: stats.totalPreventive, color: "from-indigo-500 to-indigo-700", icon: Wrench },
          { label: "Corrective", value: stats.totalCorrective, color: "from-rose-500 to-rose-700", icon: AlertTriangle },
        ].map((card, i) => (
          <motion.div key={i} className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-5 shadow-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{card.label}</p>
                <p className="text-3xl font-black mt-1">{card.value}</p>
              </div>
              <card.icon className="w-8 h-8 opacity-30" />
            </div>
          </motion.div>
        ))}
      </div>


      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 no-print">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto no-scrollbar shrink-0">
            {["all", "Audit", "Preventive", "Corrective"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${typeFilter === t ? "bg-white text-[#003366] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>{t === "all" ? "Semua" : t}</button>
            ))}
          </div>
            <div className="flex-1 relative group w-full">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${loading ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Cari tim, unit, ruangan, atau tenant..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-400 transition-all outline-none" 
              />
            {loading && searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
              </div>
            )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
             <div className="flex flex-1 items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2">
                <Calendar size={14} className="text-slate-400" />
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent text-[10px] font-bold focus:outline-none flex-1" />
                <span className="text-slate-300 text-[10px]">to</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent text-[10px] font-bold focus:outline-none flex-1" />
             </div>
             <button 
               onClick={handleExportSummary} 
               disabled={isExporting}
               className="px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-700 flex items-center justify-center gap-2 transform active:scale-95 transition-all disabled:opacity-50"
             >
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Export Summary
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold">No reports found.</div>
          ) : (
            <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">ID</th>
                <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Type</th>
                <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Unit / Tag</th>
                <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Engineer</th>
                <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Print</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r: any) => (
                <tr key={r.id} className={`border-b border-slate-50 transition-colors cursor-pointer ${isSelecting === r.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`} onClick={() => handleSelectReport(r.id)}>
                  <td className="p-4 font-bold text-slate-400">
                    {isSelecting === r.id ? <Loader2 size={14} className="animate-spin text-[#00a1e4]" /> : `#${r.id}`}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${TYPE_CONFIG[r.type]?.bg} ${TYPE_CONFIG[r.type]?.color}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{r.units?.tag_number || r.unit_tag}</p>
                    {r.units?.room_tenant && <p className="text-[10px] font-bold text-slate-400">{r.units.room_tenant}{r.units?.area ? ` · ${r.units.area}` : ''}</p>}
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-700">{r.inspector_name}</td>
                  <td className="p-4 text-xs text-slate-500">{formatDate(r.service_date)}</td>
                  <td className="p-4"><button onClick={(e) => { e.stopPropagation(); handleViewReport(r.id, r.type); }} className="text-emerald-600 hover:text-emerald-800 font-bold text-xs"><Printer size={14} /></button></td>
                  <td className="p-4 flex items-center gap-3">
                    <Eye size={14} className="text-slate-300" />
                    {session?.roles?.some((role: any) => /admin|super/i.test(role)) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                        disabled={isDeleting === r.id}
                        className="p-1 hover:bg-rose-50 text-rose-300 hover:text-rose-600 rounded transition-colors"
                      >
                        {isDeleting === r.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-2xl overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-xl font-black text-[#003366] tracking-tight">{selectedReport.units?.tag_number || "Report Detail"}</h3>
                  <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={20} /></button>
               </div>
               <div className="p-8">
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <InfoItem label="Room / Tenant" value={selectedReport.units?.room_tenant} />
                     <InfoItem label="Area" value={selectedReport.units?.area} />
                     <InfoItem label="Engineer" value={selectedReport.inspector_name} />
                     <div className="flex flex-col">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</p>
                        <p className="text-sm font-bold text-slate-800">{formatDate(selectedReport.service_date)}</p>
                     </div>
                     <div className="col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Report Status</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            selectedReport.is_approved_by_customer 
                            ? "bg-blue-50 text-[#003366] border-blue-200"
                            : selectedReport.engineer_signer_name 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}>
                            {selectedReport.is_approved_by_customer 
                              ? "Final Approved" 
                              : selectedReport.engineer_signer_name 
                              ? "Reviewed (Awaiting Customer)" 
                              : "Draft Report"}
                          </span>
                          {selectedReport.engineer_signer_name && (
                            <span className="text-[10px] font-bold text-slate-400 italic">
                              Reviewed by {selectedReport.engineer_signer_name}
                            </span>
                          )}
                        </div>
                      </div>
                  </div>

                  {/* Media Documentation Preview */}
                  {selectedReport.activity_photos && selectedReport.activity_photos.length > 0 && (
                    <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#003366] mb-4 flex items-center gap-2">
                          <ImageIcon size={14} className="text-[#00a1e4]" /> Media Documentation
                       </p>
                       <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                           <div className="grid grid-cols-3 gap-4">
                              {selectedReport.activity_photos.map((m: any, i: number) => (
                                <div 
                                  key={i} 
                                  onClick={() => setSelectedMedia(m)}
                                  className="aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 relative group cursor-pointer shadow-sm hover:shadow-md transition-all"
                                >
                                  {m.media_type === 'video' ? (
                                     <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                        <Play size={20} className="text-white fill-white opacity-60 group-hover:opacity-100 transition-all group-hover:scale-110" />
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 text-white text-[7px] font-black uppercase rounded shadow-lg">Video</div>
                                     </div>
                                  ) : (
                                     <img 
                                       src={m.photo_url} 
                                       className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                                       alt={m.description || `Documentation ${i+1}`} 
                                       onError={(e) => {
                                         const currentUrl = (e.target as any).src;
                                         if (currentUrl.includes('/audit/')) {
                                           (e.target as any).src = currentUrl.replace('/audit/', '/photos/');
                                         } else if (currentUrl.includes('/photos/')) {
                                           (e.target as any).src = currentUrl.replace('/photos/', '/videos/');
                                         } else if (currentUrl.includes('/videos/')) {
                                           (e.target as any).src = "https://placehold.co/600x600/f8fafc/64748b?text=Not+Synced";
                                         }
                                       }}
                                     />
                                  )}
                                  <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-all pointer-events-none" />
                                </div>
                              ))}
                           </div>
                        </div>
                    </div>
                  )}

                    <div className="flex gap-3">
                      <button onClick={() => handleViewReport(selectedReport.id, selectedReport.type)} className="flex-1 py-4 bg-[#003366] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/10 hover:scale-[1.02] transition-all">Print Official (A4)</button>
                      
                      {/* EDIT BUTTON: Role-gated for Admin/Engineer */}
                      {session?.roles?.some((role: any) => /admin|engineer|super/i.test(role)) && (
                        <button 
                          onClick={() => setIsEditing(selectedReport)}
                          className="flex-1 py-4 bg-[#00a1e4] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-400/20 hover:scale-[1.02] transition-all"
                        >
                          Edit Report
                        </button>
                      )}

                      {session?.roles?.some((role: any) => /admin|super/i.test(role)) && (
                        <button 
                          onClick={() => handleDelete(selectedReport.id)}
                          disabled={isDeleting === selectedReport.id}
                          className="px-6 py-4 bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition-all flex items-center justify-center border border-rose-100"
                        >
                          {isDeleting === selectedReport.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      )}
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Lightbox */}
      <AnimatePresence>
        {selectedMedia && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" 
              onClick={() => setSelectedMedia(null)} 
            />
            <motion.button 
               whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
               onClick={() => setSelectedMedia(null)}
               className="absolute top-8 right-8 z-[120] p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
            >
               <X size={32} />
            </motion.button>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
              className="relative z-[115] w-full max-w-5xl max-h-full flex items-center justify-center"
            >
               {selectedMedia.media_type === 'video' ? (
                 <video 
                   src={selectedMedia.photo_url} 
                   className="w-full h-auto max-h-[80vh] rounded-3xl shadow-2xl border border-white/10" 
                   controls 
                   autoPlay
                   playsInline
                   onError={(e) => {
                     const currentSrc = (e.target as any).src;
                     if (currentSrc.includes('/audit/')) {
                       (e.target as any).src = currentSrc.replace('/audit/', '/photos/');
                     } else if (currentSrc.includes('/photos/')) {
                       (e.target as any).src = currentSrc.replace('/photos/', '/videos/');
                     }
                   }}
                 />
               ) : (
                 <img 
                   src={selectedMedia.photo_url} 
                   className="w-full h-auto max-h-[80vh] object-contain rounded-3xl shadow-2xl border border-white/10" 
                   alt="Documentation" 
                   onError={(e) => {
                     const currentUrl = (e.target as any).src;
                     if (currentUrl.includes('/audit/')) {
                       (e.target as any).src = currentUrl.replace('/audit/', '/photos/');
                     } else if (currentUrl.includes('/photos/')) {
                       (e.target as any).src = currentUrl.replace('/photos/', '/videos/');
                     } else if (currentUrl.includes('/videos/')) {
                       (e.target as any).src = "https://placehold.co/600x600/f8fafc/64748b?text=File+Not+Synced";
                     }
                   }}
                 />
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal Overlay */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[150] flex flex-col bg-white">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-[160]">
               <div className="flex items-center gap-4">
                  <button onClick={() => setIsEditing(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><ChevronLeft size={24} /></button>
                  <h2 className="text-xl font-black text-[#003366]">Editing Report #{isEditing.id} — {isEditing.type}</h2>
               </div>
               <span className="px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">Edit Mode</span>
            </div>
            <div className="flex-1 overflow-y-auto pb-12">
               {isEditing.type === "Audit" && (
                 <AuditFormClient 
                   unit={isEditing.units} 
                   initialData={isEditing} 
                   onSuccess={() => { setIsEditing(null); setSelectedReport(null); fetchReports(pagination.page); }} 
                 />
               )}
               {isEditing.type === "Preventive" && (
                 <PreventiveFormClient 
                   unit={isEditing.units} 
                   initialData={isEditing} 
                   onSuccess={() => { setIsEditing(null); setSelectedReport(null); fetchReports(pagination.page); }} 
                 />
               )}
               {isEditing.type === "Corrective" && (
                 <CorrectiveFormClient 
                   unit={isEditing.units} 
                   initialData={isEditing} 
                   onSuccess={() => { setIsEditing(null); setSelectedReport(null); fetchReports(pagination.page); }} 
                 />
               )}
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="print-safe print:block hidden" style={{ display: isPrinting ? "block" : "none" }}>
        {printPages.map((pageContent, i) => (
          <div key={i} style={{ marginBottom: i < printPages.length - 1 ? "10mm" : 0, breakAfter: "page" }}>
            <ReportBase 
              reportTitle={printData?.type === "SUMMARY" ? "SUMMARY REPORT" : (printData?.type || "Report") + " REPORT"} 
              reportCode={printData?.reference_id} 
              unit={printData?.units} 
              pageNumber={i + 1} 
              totalPages={printPages.length} 
              isFixedHeight={true}
            >
              <div style={{ padding: "0 5mm" }}>{pageContent}</div>
            </ReportBase>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-black uppercase tracking-widest text-slate-300">Loading Analysis...</div>}>
      <ReportsContent />
    </Suspense>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value || "-"}</p>
    </div>
  );
}
