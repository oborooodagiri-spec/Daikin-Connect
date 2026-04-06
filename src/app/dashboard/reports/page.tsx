"use client";

import { useEffect, useState, useTransition, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAllReports, getReportDetail } from "@/app/actions/reports";
import {
  FileText, Search, Download, Filter, ChevronLeft, ChevronRight,
  ClipboardCheck, Wrench, AlertTriangle, BarChart3, Calendar,
  Eye, ExternalLink, Image as ImageIcon, X, Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// PDF Templates for high-fidelity printing
import { getAuditSections } from "@/components/AuditPDFTemplate";
import { getPreventiveSections } from "@/components/PreventivePDFTemplate";
import { getCorrectiveSections } from "@/components/CorrectivePDFTemplate";
import { ReportBase } from "@/components/ReportBase";

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

  // Filters
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail modal & Print execution
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  const [printPages, setPrintPages] = useState<any[][]>([]);
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

  useEffect(() => {
    fetchReports();
  }, [typeFilter]);

  const handleSearch = () => fetchReports(1);
  const handlePageChange = (p: number) => fetchReports(p);

  const handlePrint = async (reportId: string) => {
    setIsPrinting(true);
    try {
      const res = await getReportDetail(reportId);
      if ("success" in res && res.success) {
        const report = res.data;
        const renderData = getRenderData(report);
        setPrintData(report);
        
        const PX_PER_MM = 3.78;
        const SAFE_CONTENT_MM = 220;
        const SAFE_PX = SAFE_CONTENT_MM * PX_PER_MM;

        let sections: any[] = [];
        if (report.type === "Audit") sections = getAuditSections(renderData, report.units);
        if (report.type === "Preventive") sections = getPreventiveSections(renderData, report.units, renderData.engineerName, renderData.customerName);
        if (report.type === "Corrective") sections = getCorrectiveSections(renderData, report.units);

        const measureDiv = document.createElement("div");
        measureDiv.style.width = "794px";
        measureDiv.style.position = "absolute";
        measureDiv.style.left = "-9999px";
        measureDiv.style.visibility = "hidden";
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
            setTimeout(resolve, 50);
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

        setTimeout(() => {
          window.print();
          setIsPrinting(false);
          setPrintData(null);
          setPrintPages([]);
          document.title = oldTitle;
        }, 800);
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

  const getRenderData = (report: any) => {
    let t: any = {};
    try {
      if (typeof report.technical_json === 'string') {
        t = JSON.parse(report.technical_json);
        if (typeof t === 'string') t = JSON.parse(t);
      } else if (report.technical_json) {
        t = report.technical_json;
      }
    } catch (e) {
      console.error("JSON Parse Error", e);
    }

    const photos = report.activity_photos?.map((p: any) => {
      let url = p.photo_url || "";
      if (url && !url.startsWith('http') && !url.startsWith('/')) {
        const folder = (p.type || report.type || "misc").toLowerCase();
        url = `/uploads/${folder}/${url}`;
      }
      return { ...p, photo_url: url };
    }) || [];

    if (report.type === "Preventive") {
      const labels = [
        { label: "Power Supply", key: "power_supply" },
        { label: "Ampere", key: "ampere_motor" },
        { label: "Pressure Inlet", key: "pressure_inlet" },
        { label: "Pressure Outlet", key: "pressure_outlet" },
        { label: "Temperature Inlet", key: "temp_inlet" },
        { label: "Temperature Outlet", key: "temp_outlet" },
        { label: "Return Air", key: "return_air_temp" },
        { label: "Supply Air", key: "supply_air_temp" },
        { label: "Air filter", key: "clean_air_filter" },
        { label: "Cleaning coil", key: "clean_coil" },
        { label: "Cleaning drainage", key: "clean_drainage" },
        { label: "V-Belt", key: "check_vbelt" },
        { label: "Bearing", key: "check_bearing" },
      ];

      const scope: any = {};
      Object.keys(t).forEach(dbLabel => {
        const found = labels.find(l => dbLabel.toLowerCase().includes(l.label.toLowerCase()));
        if (found) {
          const val = t[dbLabel];
          if (typeof val === 'object') {
             scope[found.key] = { before: val.before, after: val.after, remarks: val.remarks };
          } else {
             scope[found.key] = { done: val, remarks: "" };
          }
        }
      });

      return {
        ...report,
        header: t.header || {
          project: report.units?.project_name,
          date: report.service_date,
          model: report.units?.model,
          serial_number: report.units?.serial_number,
          unit_number: report.units?.tag_number,
          location: report.units?.area,
          so_number: report.reference_id || "PM-" + report.id
        },
        scope: Object.keys(scope).length > 0 ? scope : t.scope,
        parts: t.parts || [],
        technicalAdvice: report.technical_advice || t.technicalAdvice || "-",
        engineerName: report.inspector_name || t.engineerName || "-",
        customerName: t.customerName || "-",
        activity_photos: photos
      };
    }

    if (report.type === "Corrective") {
      return {
        ...report,
        personnel: t.personnel || { technician_name: report.inspector_name, service_date: report.service_date },
        pic: t.pic || {},
        analysis: t.analysis || {
          case_complain: t.case_complain || "-",
          root_cause: t.root_cause || "-",
          temp_action: t.temp_action || "-",
          perm_action: t.perm_action || "-",
          recommendation: t.recommendation || report.technical_advice
        },
        engineerNote: report.engineer_note || t.engineerNote || "-",
        activity_photos: photos
      };
    }

    if (report.type === "Audit") {
      const vps = report.audit_velocity_points || [];
      const supply = new Array(15).fill("");
      const return_ = new Array(15).fill("");
      const fresh = new Array(15).fill("");
      vps.forEach((vp: any) => {
        if (vp.point_number >= 1 && vp.point_number <= 15) supply[vp.point_number - 1] = vp.velocity_value;
        if (vp.point_number >= 16 && vp.point_number <= 30) return_[vp.point_number - 16] = vp.velocity_value;
        if (vp.point_number >= 31 && vp.point_number <= 45) fresh[vp.point_number - 31] = vp.velocity_value;
      });
      return { ...report, ...t, t: { ...t, supplyVelocity: supply, returnVelocity: return_, freshVelocity: fresh }, activity_photos: photos };
    }
    
    return { ...report, ...t, activity_photos: photos };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4 no-print">
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 no-print">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {["all", "Audit", "Preventive", "Corrective"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${typeFilter === t ? "bg-white text-[#003366] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>{t === "all" ? "Semua" : t}</button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Cari berdasarkan unit tag..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
          </div>
          <button onClick={handleSearch} className="px-5 py-2.5 bg-[#00a1e4] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#008cc6]"><Filter size={14} className="inline mr-1" /> Filter</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden no-print">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold">No reports found.</div>
        ) : (
          <table className="w-full text-sm">
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
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedReport(r)}>
                  <td className="p-4 font-bold text-slate-400">#{r.id}</td>
                  <td className="p-4"><span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${TYPE_CONFIG[r.type]?.bg} ${TYPE_CONFIG[r.type]?.color}`}>{r.type}</span></td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{r.units?.tag_number || r.unit_tag}</p>
                    {r.units?.room_tenant && <p className="text-[10px] font-bold text-slate-400">{r.units.room_tenant}{r.units?.area ? ` · ${r.units.area}` : ''}</p>}
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-700">{r.inspector_name}</td>
                  <td className="p-4 text-xs text-slate-500">{formatDate(r.service_date)}</td>
                  <td className="p-4"><button onClick={(e) => { e.stopPropagation(); handlePrint(r.id); }} className="text-emerald-600 hover:text-emerald-800 font-bold text-xs"><Printer size={14} /></button></td>
                  <td className="p-4"><Eye size={14} className="text-slate-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
                     <InfoItem label="Date" value={formatDate(selectedReport.service_date)} />
                  </div>
                  <button onClick={() => handlePrint(selectedReport.id)} className="w-full py-4 bg-[#003366] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/10 hover:scale-[1.02] transition-all">Print Official (A4)</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="print-safe print:block hidden" style={{ display: isPrinting ? "block" : "none" }}>
        {printPages.map((pageContent, i) => (
          <div key={i} style={{ marginBottom: i < printPages.length - 1 ? "10mm" : 0, breakAfter: "page" }}>
            <ReportBase reportTitle={printData.type + " REPORT"} reportCode={printData.reference_id} unit={printData.units} pageNumber={i + 1} totalPages={printPages.length} isFixedHeight={true}>
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
