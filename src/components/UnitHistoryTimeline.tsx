"use client";

import React, { useState } from "react";
import { 
  Clock, 
  FileText, 
  CheckCircle2, 
  History, 
  Download, 
  ExternalLink, 
  Activity, 
  ShieldCheck, 
  UserCheck, 
  Wrench, 
  Loader2 
} from "lucide-react";
import { approveServiceActivity, updateActivityBAUrl, updateActivityReportUrls } from "@/app/actions/units";

interface HistoryItem {
  id: string;
  type: string;
  date: string | Date;
  engineer: string;
  note: string;
  pdf?: string | null;
  baPdf?: string | null;
  isApproved?: boolean;
  approverName?: string;
  approvedAt?: string | Date;
  technical_json?: string | null;
  technical_advice?: string | null;
  isFormal?: boolean;
  healthScore?: number;
}

export default function UnitHistoryTimeline({ history, session, unit }: { history: HistoryItem[], session?: any, unit?: any }) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Helper for internal roles
  const isInternal = session?.isInternal || session?.roles?.some((r: any) => 
    ['admin', 'management', 'sales engineer', 'engineer', 'sales_engineer'].includes(r.toLowerCase())
  );

  const handleGenerateBA = async (item: HistoryItem) => {
    if (!unit) return alert("Unit data missing for generation.");
    setIsGenerating(item.id);
    
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas-pro")).default;
      const { BeritaAcaraPDFTemplate } = await import("@/components/BeritaAcaraPDFTemplate");
      const { ReportBase } = await import("@/components/ReportBase");

      const technicalData = item.technical_json ? JSON.parse(item.technical_json) : {};
      const renderData = {
        ...technicalData,
        engineer_note: item.note,
        technical_advice: item.technical_advice,
        type: item.type,
        service_date: item.date
      };

      const baDiv = document.createElement("div");
      baDiv.style.width = "210mm";
      baDiv.style.position = "absolute";
      baDiv.style.top = "-9999px";
      document.body.appendChild(baDiv);

      const { createRoot } = await import("react-dom/client");
      const root = createRoot(baDiv);
      
      await new Promise<void>((resolve) => {
        root.render(
          <ReportBase reportTitle="BERITA ACARA PEKERJAAN" reportCode={`BA-REGEN-${item.id}`} unit={unit}>
            <BeritaAcaraPDFTemplate data={renderData} unit={unit} engineerName={item.engineer} />
          </ReportBase>
        );
        setTimeout(resolve, 500);
      });

      const canvas = await html2canvas(baDiv, { scale: 2, useCORS: true, windowWidth: 794, height: 1123 });
      const img = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(img, "JPEG", 0, 0, 210, 297);
      
      const blob = pdf.output("blob");
      const formData = new FormData();
      formData.append("file", new File([blob], `${unit.tag_number}_BA_REGEN_${Date.now()}.pdf`, { type: "application/pdf" }));
      formData.append("folder", "berita-acara");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await res.json();
      await updateActivityBAUrl(Number(item.id), uploadData.url);
      
      root.unmount();
      document.body.removeChild(baDiv);
      alert("Berita Acara Berhasil Digenerate.");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Gagal mengenerate Berita Acara.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleApprove = async (item: HistoryItem, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menyetujui Berita Acara ini sebagai ${name}?`)) return;
    setApprovingId(item.id);
    
    try {
      // 1. Mark as Approved
      const res = await approveServiceActivity(Number(item.id), name);
      if (!res.success) throw new Error(res.error);

      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas-pro")).default;
      const { BeritaAcaraPDFTemplate } = await import("@/components/BeritaAcaraPDFTemplate");
      const { ReportBase } = await import("@/components/ReportBase");
      
      const technicalData = item.technical_json ? JSON.parse(item.technical_json) : {};
      const renderData = {
        ...technicalData,
        engineer_note: item.note,
        technical_advice: item.technical_advice,
        type: item.type,
        service_date: item.date,
        isApproved: true,
        approverName: name,
        approvedAt: new Date()
      };

      const { createRoot } = await import("react-dom/client");

      // --- TASK A: RE-GENERATE BERITA ACARA ---
      const baDiv = document.createElement("div");
      baDiv.style.width = "210mm";
      baDiv.style.position = "absolute";
      baDiv.style.top = "-9999px";
      document.body.appendChild(baDiv);
      const baRoot = createRoot(baDiv);
      await new Promise<void>((resolve) => {
        baRoot.render(
          <ReportBase reportTitle="BERITA ACARA PEKERJAAN" reportCode={`BA-SIGNED-${item.id}`} unit={unit}>
            <BeritaAcaraPDFTemplate data={renderData} unit={unit} engineerName={item.engineer} isSystemApproved={true} customerApproverName={name} approvedAt={new Date()} />
          </ReportBase>
        );
        setTimeout(resolve, 500);
      });
      const baCanvas = await html2canvas(baDiv, { scale: 2, useCORS: true, windowWidth: 794, height: 1123 });
      const baPdfFile = new jsPDF("p", "mm", "a4");
      baPdfFile.addImage(baCanvas.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, 210, 297);
      const baBlob = baPdfFile.output("blob");
      const baForm = new FormData();
      baForm.append("file", new File([baBlob], `${unit.tag_number}_BA_SIGNED_${item.id}.pdf`, { type: "application/pdf" }));
      baForm.append("folder", "berita-acara");
      const baRes = await fetch("/api/upload", { method: "POST", body: baForm });
      const baUrl = (await baRes.json()).url;
      baRoot.unmount();
      document.body.removeChild(baDiv);

      // --- TASK B: RE-GENERATE TECHNICAL REPORT (SIGNED) ---
      let reportUrl = item.pdf || ""; // Fallback
      if (['Audit', 'Preventive', 'Corrective'].includes(item.type)) {
         const reportDiv = document.createElement("div");
         reportDiv.style.width = "210mm";
         reportDiv.style.position = "absolute";
         reportDiv.style.top = "-9999px";
         document.body.appendChild(reportDiv);
         const reportRoot = createRoot(reportDiv);

         let sections: any[] = [];
         let title = "TECHNICAL REPORT";
         let folder = "reports";

         if (item.type === 'Audit') {
            const { getAuditSections } = await import("@/components/AuditPDFTemplate");
            sections = getAuditSections(renderData, unit);
            title = "AUDIT TECHNICAL REPORT";
            folder = "audit";
         } else if (item.type === 'Preventive') {
            const { getPreventiveSections } = await import("@/components/PreventivePDFTemplate");
            sections = getPreventiveSections(renderData, unit, item.engineer, name);
            title = "PREVENTIVE MAINTENANCE REPORT";
            folder = "preventive";
         } else if (item.type === 'Corrective') {
            const { getCorrectiveSections } = await import("@/components/CorrectivePDFTemplate");
            sections = getCorrectiveSections(renderData, unit);
            title = "CORRECTIVE MAINTENANCE REPORT";
            folder = "corrective";
         }

         await new Promise<void>((resolve) => {
            reportRoot.render(
               <ReportBase reportTitle={title} reportCode={`REPORT-SIGNED-${item.id}`} unit={unit}>
                  <div style={{ padding: "0 5mm" }}>
                     {sections}
                  </div>
               </ReportBase>
            );
            setTimeout(resolve, 800); // More time for complex reports
         });

         const reportCanvas = await html2canvas(reportDiv, { scale: 2, useCORS: true, windowWidth: 794, height: 1123 });
         const reportPdf = new jsPDF("p", "mm", "a4");
         reportPdf.addImage(reportCanvas.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, 210, 297);
         const reportBlob = reportPdf.output("blob");
         const reportForm = new FormData();
         reportForm.append("file", new File([reportBlob], `${unit.tag_number}_REPORT_SIGNED_${item.id}.pdf`, { type: "application/pdf" }));
         reportForm.append("folder", folder);
         const reportRes = await fetch("/api/upload", { method: "POST", body: reportForm });
         reportUrl = (await reportRes.json()).url;
         reportRoot.unmount();
         document.body.removeChild(reportDiv);
      }

      await updateActivityReportUrls(Number(item.id), reportUrl, baUrl);
      alert("Berhasil: Dokumen telah ditandatangani secara digital.");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Gagal memproses persetujuan.");
    } finally {
      setApprovingId(null);
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="py-12 text-center">
        <History className="w-12 h-12 mx-auto text-slate-200 mb-3" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Belum Ada Riwayat Servis</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
      {history.map((item) => (
        <div key={item.id} className="relative flex items-start gap-6 group">
          {/* Icon Circle */}
          <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-110 
            ${item.type === 'Corrective' ? 'bg-rose-500 text-white' : 
              item.type === 'Audit' ? 'bg-emerald-500 text-white' : 
              item.type === 'Preventive' ? 'bg-[#00a1e4] text-white' : 
              'bg-slate-400 text-white'}`}>
            {item.type === 'Corrective' ? <Clock size={16} /> : 
             item.type === 'Audit' ? <FileText size={16} /> : 
             <CheckCircle2 size={16} />}
          </div>

          {/* Content Card */}
          <div className="flex-1 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border 
                  ${item.type === 'Corrective' ? 'text-rose-600 border-rose-100 bg-rose-50' : 
                    item.type === 'Audit' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 
                    'text-blue-600 border-blue-100 bg-blue-50'}`}>
                  {item.type}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {item.type === 'Audit' && (
                  <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-100 flex items-center gap-1">
                    <Activity size={10} /> Vitalitas: {item.healthScore || 100}%
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {!item.baPdf && item.isFormal && isInternal && (
                  <button
                    onClick={() => handleGenerateBA(item)}
                    disabled={isGenerating === item.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-slate-900 transition-all shadow-sm disabled:opacity-50"
                    title="Generate Berita Acara (Internal Tool)"
                  >
                    {isGenerating === item.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Wrench size={12} />
                    )}
                    Generate BA
                  </button>
                )}
                {item.pdf && (
                  <a 
                    href={item.pdf} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm"
                  >
                    <Download size={12} /> Technical Report
                  </a>
                )}
                {item.baPdf && (
                  <a 
                    href={item.baPdf} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors shadow-sm"
                  >
                    <FileText size={12} /> Berita Acara
                  </a>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm group-hover:border-slate-300 transition-colors">
              <p className="text-xs font-black text-[#003366] mb-1">{item.engineer || "Teknisi Lapangan"}</p>
              <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                "{item.note || "Tidak ada catatan tambahan."}"
              </p>
              
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {!item.isFormal && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <ExternalLink size={10} /> Quick Report via Passport
                    </div>
                  )}
                  {item.isApproved && (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                      <ShieldCheck size={12} /> Digitally Verified: {item.approverName}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.baPdf && !item.isApproved && !isInternal && (
                    <button
                      onClick={() => handleApprove(item, session?.user?.name || "Customer PIC")}
                      disabled={approvingId === item.id}
                      className="px-4 py-2 bg-[#00a1e4] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#008cc6] transition-all shadow-md shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      {approvingId === item.id ? (
                        <><Loader2 size={14} className="animate-spin" /> Signing Documents...</>
                      ) : (
                        <><UserCheck size={14} /> Approve & Tanda Tangan</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
