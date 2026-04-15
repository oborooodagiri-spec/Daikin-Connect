"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReportBase } from "@/components/ReportBase";
import { getAuditSections } from "@/components/AuditPDFTemplate";
import { getPreventiveSections } from "@/components/PreventivePDFTemplate";
import { getCorrectiveSections } from "@/components/CorrectivePDFTemplate";
import { getBeritaAcaraSections } from "@/components/BeritaAcaraPDFTemplate";
import { getDailyLogSections } from "@/components/DailyLogPDFTemplate";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { format } from "date-fns";
import { 
  Download, FileText, ChevronLeft, Loader2, 
  CheckCircle2, AlertCircle, Printer, ShieldCheck
} from "lucide-react";
import { approveServiceActivity, updateActivityReportUrls, getActivityDetailForReport } from "@/app/actions/units";
import { getSession } from "@/app/actions/auth";
import { translateReportStringsAction } from "@/app/actions/translate";
import { Language, t } from "@/lib/i18n";
import { processReportData } from "@/lib/reportDataHelper";

export default function ReportHubPage() {
  const params = useParams();
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [data, setData] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [isApprovedLocal, setIsApprovedLocal] = useState(false);
  const [isReviewedLocal, setIsReviewedLocal] = useState(false);
  
  // Translation States
  const [activeLang, setActiveLang] = useState<Language>('id');
  const [translating, setTranslating] = useState(false);
  const [translatedCache, setTranslatedCache] = useState<Record<Language, any>>({ id: null, en: null, ja: null });
  
  // Smart Pagination States
  const [sectionHeights, setSectionHeights] = useState<number[]>([]);
  const probeRef = useRef<HTMLDivElement>(null);

  const type = params.type as string;
  // Auto-scaling for mobile
  const [reportScale, setReportScale] = useState(1);
  
  const id = params.id as string;

  useEffect(() => {
    const handleResize = () => {
      // 210mm is approx 794px at 96dpi
      const reportWidth = 794; 
      // Add small side padding
      const availableWidth = window.innerWidth - 20; 
      
      if (availableWidth < reportWidth) {
        setReportScale(availableWidth / reportWidth);
      } else {
        setReportScale(1);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [res, sessionRes] = await Promise.all([
          getActivityDetailForReport(id, true),
          getSession()
        ]);
        
        setSession(sessionRes);

        if (res && "success" in res && res.success) {
          setData(res.data);
          setTranslatedCache(prev => ({ ...prev, id: res.data }));
          setIsApprovedLocal(res.data.activity.is_approved_by_customer);
          setIsReviewedLocal(!!res.data.activity.engineer_signer_name);
        } else {
          setError((res as any).error || "Failed to load report data");
        }
      } catch (err) {
        setError("An error occurred while fetching report details.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, type]);

  const waitForImages = async (element: HTMLElement) => {
    const imgs = Array.from(element.getElementsByTagName('img'));
    const promises = imgs.map(img => {
      return new Promise((resolve) => {
        if (img.complete) resolve(true);
        else {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        }
      });
    });
    await Promise.all(promises);
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !data) return;
    
    setDownloading(true);
    try {
      const { createRoot } = await import("react-dom/client");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const fileName = `${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}_Report_${data.unit?.tag_number || "Draft"}_${format(new Date(), "yyyyMMdd")}.pdf`;

      // CAPTURE SANDBOX: Create a hidden unscaled container for high-fidelity capture
      const sandbox = document.createElement("div");
      sandbox.style.position = "absolute";
      sandbox.style.top = "-9999px";
      sandbox.style.left = "-9999px";
      sandbox.style.width = "794px"; // Fixed A4 width at 96dpi
      document.body.appendChild(sandbox);

      const renderPage = async (pageIndex: number) => {
        const pageContainer = document.createElement("div");
        sandbox.appendChild(pageContainer);
        const root = createRoot(pageContainer);
        
        root.render(
          <ReportBase 
            reportTitle={reportTitle} 
            reportCode={reportCode}
            unit={data.unit}
            date={data.activity.service_date}
            inputDate={type.toLowerCase() !== 'ba' ? data.activity.created_at : undefined}
            pageNumber={pageIndex + 1}
            totalPages={pages.length}
            isFixedHeight={true}
            lang={activeLang}
          >
            <div 
              className="flex-1 flex flex-col w-full"
              style={{ 
                justifyContent: pageIndex >= (pages.length - photoSections.length) ? 'center' : 'flex-start',
                paddingTop: pageIndex >= (pages.length - photoSections.length) ? '0' : '4mm'
              }}
            >
              {pages[pageIndex]}
            </div>
          </ReportBase>
        );

        // Wait for render and images
        await new Promise(r => setTimeout(r, 1000));
        await waitForImages(pageContainer);

        const canvas = await html2canvas(pageContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 794
        });
        
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        
        root.unmount();
        sandbox.removeChild(pageContainer);
      };

      for (let i = 0; i < pages.length; i++) {
        await renderPage(i);
      }
      
      pdf.save(fileName);
      document.body.removeChild(sandbox);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleTranslate = async (targetLang: Language) => {
    if (targetLang === activeLang || translating) return;
    
    // Check Cache first
    if (translatedCache[targetLang]) {
      setData(translatedCache[targetLang]);
      setActiveLang(targetLang);
      return;
    }

    setTranslating(true);
    try {
      const sourceData = translatedCache.id || data;
      const activity = sourceData.activity || {};
      const technicalJson = typeof activity.technical_json === 'string' 
        ? JSON.parse(activity.technical_json) 
        : (activity.technical_json || {});

      // 1. EXTRACT MINIMAL PAYLOAD
      const translatableMap: any = {
        inspector_name: activity.inspector_name,
        engineer_note: activity.engineer_note,
        location: sourceData.unit?.area || "",
        brand: sourceData.unit?.brand || "",
        unit_type: sourceData.unit?.unit_type || "",
        case_complain: activity.case_complain,
        root_cause: activity.root_cause,
        temp_action: activity.temp_action,
        perm_action: activity.perm_action,
        recommendation: activity.recommendation,
        technical_advice: activity.technical_advice,
        technicalAdvice: technicalJson.technicalAdvice || technicalJson.technical_advice,
      };

      // Extract Part comments for PM
      if (technicalJson.parts) {
        translatableMap.parts_vbelt = technicalJson.parts.vbelt_type;
        translatableMap.parts_motor_p = technicalJson.parts.motor_pulley;
        translatableMap.parts_motor_b = technicalJson.parts.motor_bearing;
        translatableMap.parts_blower_p = technicalJson.parts.blower_pulley;
        translatableMap.parts_blower_b = technicalJson.parts.blower_bearing;
      }

      if (technicalJson.scope) {
        const scopeRemarks: any = {};
        Object.keys(technicalJson.scope).forEach(key => {
          if (technicalJson.scope[key].remarks) {
            scopeRemarks[key] = technicalJson.scope[key].remarks;
          }
        });
        translatableMap.scopeRemarks = scopeRemarks;
      }

      // 2. CALL LIGHTWEIGHT ACTION
      const res = await translateReportStringsAction(translatableMap, targetLang);
      
      if (res && "success" in res && res.success && res.translatedMap) {
        const translatedMap = res.translatedMap;
        
        // 3. MERGE BACK ON CLIENT (Deep Copy)
        const translatedData = JSON.parse(JSON.stringify(sourceData));
        const targetActivity = translatedData.activity;
        
        targetActivity.inspector_name = translatedMap.inspector_name;
        targetActivity.engineer_note = translatedMap.engineer_note;
        targetActivity.case_complain = translatedMap.case_complain;
        targetActivity.root_cause = translatedMap.root_cause;
        targetActivity.temp_action = translatedMap.temp_action;
        targetActivity.perm_action = translatedMap.perm_action;
        targetActivity.recommendation = translatedMap.recommendation;
        targetActivity.technical_advice = translatedMap.technical_advice;

        if (translatedData.unit) {
          translatedData.unit.area = translatedMap.location || translatedData.unit.area;
          translatedData.unit.brand = translatedMap.brand || translatedData.unit.brand;
          translatedData.unit.unit_type = translatedMap.unit_type || translatedData.unit.unit_type;
        }

        if (targetActivity.technical_json) {
           let tj = typeof targetActivity.technical_json === 'string' 
             ? JSON.parse(targetActivity.technical_json) 
             : targetActivity.technical_json;
             
           if (translatedMap.technicalAdvice) {
             tj.technicalAdvice = translatedMap.technicalAdvice;
           }
           if (translatedMap.parts_vbelt && tj.parts) {
             tj.parts.vbelt_type = translatedMap.parts_vbelt;
             tj.parts.motor_pulley = translatedMap.parts_motor_p;
             tj.parts.motor_bearing = translatedMap.parts_motor_b;
             tj.parts.blower_pulley = translatedMap.parts_blower_p;
             tj.parts.blower_bearing = translatedMap.parts_blower_b;
           }
           if (translatedMap.scopeRemarks && tj.scope) {
             Object.keys(translatedMap.scopeRemarks).forEach(key => {
                if (tj.scope[key]) {
                   tj.scope[key].remarks = translatedMap.scopeRemarks[key];
                }
             });
           }
           targetActivity.technical_json = tj;
        }

        setTranslatedCache(prev => ({ ...prev, [targetLang]: translatedData }));
        setData(translatedData);
        setActiveLang(targetLang);
      } else {
        alert("AI Translation failed: " + (res as any).error);
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // 5. Smart Pagination: Measuring Pass
  React.useLayoutEffect(() => {
    if (data && probeRef.current) {
      const children = Array.from(probeRef.current.children);
      const heights = children.map(child => (child as HTMLElement).offsetHeight);
      // Deep equal check to avoid loops
      if (JSON.stringify(heights) !== JSON.stringify(sectionHeights)) {
        setSectionHeights(heights);
      }
    }
  }, [data, loading]);

  const handleSign = async (tier: 'engineer' | 'customer') => {
    if (!data || !reportRef.current) return;
    
    let defaultName = "";
    if (tier === 'customer') defaultName = data.customer?.name || "";
    else defaultName = session?.name || "";

    const promptText = tier === 'customer' 
      ? "Masukkan nama penandatangan (Customer PIC):" 
      : "Konfirmasi nama Engineer Reviewer:";

    const approverName = window.prompt(promptText, defaultName);
    if (!approverName) return;

    setApproving(true);
    try {
      // 1. Update DB Status
      const approveRes = await approveServiceActivity(Number(data.activity.id), approverName, tier);
      if (approveRes && "error" in approveRes) throw new Error(approveRes.error);

      // 2. Generate SIGNED PDF (Pixel Perfect)
      if (tier === 'customer') setIsApprovedLocal(true);
      else setIsReviewedLocal(true);
      
      // Wait for React to render the stamp
      await new Promise(r => setTimeout(r, 1200));
      
      // CAPTURE SANDBOX: High fidelity capture for digital archiving
      const { createRoot } = await import("react-dom/client");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const sandbox = document.createElement("div");
      sandbox.style.position = "absolute";
      sandbox.style.top = "-9999px";
      sandbox.style.left = "-9999px";
      sandbox.style.width = "794px";
      document.body.appendChild(sandbox);

      const renderPage = async (pageIndex: number) => {
        const pageContainer = document.createElement("div");
        sandbox.appendChild(pageContainer);
        const root = createRoot(pageContainer);
        
        root.render(
          <ReportBase 
            reportTitle={reportTitle} 
            reportCode={reportCode}
            unit={data.unit}
            date={data.activity.service_date}
            inputDate={type.toLowerCase() !== 'ba' ? data.activity.created_at : undefined}
            pageNumber={pageIndex + 1}
            totalPages={pages.length}
            isFixedHeight={true}
            lang={activeLang}
          >
            <div 
              className="flex-1 flex flex-col w-full"
              style={{ 
                justifyContent: pageIndex >= (pages.length - photoSections.length) ? 'center' : 'flex-start',
                paddingTop: pageIndex >= (pages.length - photoSections.length) ? '0' : '4mm'
              }}
            >
              {pages[pageIndex]}
            </div>
          </ReportBase>
        );

        // Wait for render, stamps and images
        await new Promise(r => setTimeout(r, 1500));
        await waitForImages(pageContainer);

        const canvas = await html2canvas(pageContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: 794
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        
        root.unmount();
        sandbox.removeChild(pageContainer);
      };

      for (let i = 0; i < pages.length; i++) {
        await renderPage(i);
      }
      
      // 3. Upload to Server
      const blob = pdf.output("blob");
      const folder = type.toLowerCase() === 'ba' ? 'berita-acara' : type.toLowerCase();
      const fileName = `${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}_Report_${data.unit?.tag_number}_${format(new Date(), "yyyyMMdd")}.pdf`;
      
      const formData = new FormData();
      formData.append("file", new File([blob], fileName, { type: "application/pdf" }));
      formData.append("folder", folder);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await uploadRes.json();
      document.body.removeChild(sandbox);

      // 4. Update URLs in DB
      let reportUrl = data.activity.pdf_report_url;
      let baUrl = data.activity.berita_acara_pdf_url;
      
      if (type.toLowerCase() === 'ba') baUrl = url;
      else reportUrl = url;

      await updateActivityReportUrls(Number(data.activity.id), reportUrl || "", baUrl || "");
      
      alert(tier === 'customer' ? "✅ Laporan Final berhasil diarsipkan." : "✅ Review Engineer berhasil disimpan.");
      router.refresh();
      // Reload page to get fresh data URLs
      window.location.reload();
    } catch (err) {
      console.error("Sign error:", err);
      alert("Gagal memproses tanda tangan digital.");
      if (tier === 'customer') setIsApprovedLocal(false);
      else setIsReviewedLocal(false);
    } finally {
      setApproving(false);
    }
  };

  // Determine Internal Status
  const isInternal = session?.isInternal;
  const userRoles = session?.roles || [];
  const isEngineer = userRoles.some((r: string) => r.toLowerCase().includes("engineer") || r.toLowerCase().includes("admin") || r.toLowerCase().includes("super"));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-[#003366] animate-spin mb-4" />
        <p className="text-slate-600 font-bold animate-pulse">Memuat Draft Laporan Resmi...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-800 mb-2">Data Tidak Ditemukan</h1>
        <p className="text-slate-500 mb-6">{error || "Detail aktivitas tidak tersedia."}</p>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-[#003366] text-white rounded-2xl font-bold flex items-center gap-2"
        >
          <ChevronLeft size={20} /> Kembali
        </button>
      </div>
    );
  }

  // Determine Sections based on Type
  let sections: React.ReactNode[] = [];
  let reportTitle = "Service Report";
  let reportCode = `DOC-${data.unit?.id}-${format(new Date(data.activity.service_date || Date.now()), "yyyyMMdd")}`;

  // Prepare standardized report data using helper (handles photo URL resolution & JSON flattening)
  const activityData = processReportData({
    ...data.activity,
    activity_photos: data.photos,
    type: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() // Normalize type for folder matching
  });

  const commonApproval = {
    isApproved: isApprovedLocal,
    witnessedBy: data.activity.customer_approver_name,
    approvedAt: data.activity.customer_approved_at,
    reviewedBy: data.activity.engineer_signer_name,
    reviewedAt: data.activity.engineer_approved_at || new Date(), // Using current if not set yet for preview
    customerApproverName: data.activity.customer_approver_name,
    engineerSignerName: data.activity.engineer_signer_name,
    engineerName: data.activity.inspector_name,
    lang: activeLang
  };

  if (type.toLowerCase() === 'audit') {
    reportTitle = t("FORM PENGUKURAN (AUDIT)", activeLang);
    sections = getAuditSections({...activityData, ...commonApproval}, data.unit);
  } else if (type.toLowerCase() === 'preventive' || type.toLowerCase() === 'pm') {
    reportTitle = activeLang === 'id' ? "PREVENTIVE MAINTENANCE REPORT" : t("Maintenance Scope of Work", activeLang);
    const tj = activityData.technical_json || {};
    sections = getPreventiveSections({...tj, ...commonApproval}, data.unit, data.activity.inspector_name, data.customer?.name);
  } else if (type.toLowerCase() === 'corrective') {
    reportTitle = activeLang === 'id' ? "CORRECTIVE MAINTENANCE REPORT" : t("Technical Advice & Summary", activeLang);
    const tj = activityData.technical_json || {};
    sections = getCorrectiveSections({...tj, ...commonApproval}, data.unit);
  } else if (type.toLowerCase() === 'ba' || type.toLowerCase() === 'beritaacara') {
    reportTitle = t("BERITA ACARA PEKERJAAN", activeLang);
    sections = getBeritaAcaraSections(data.activity, data.unit, data.activity.inspector_name, {
      ...commonApproval,
    });
  } else if (type.toLowerCase() === 'dailylog') {
    reportTitle = t("DAILY OPERATIONAL LOGSHEET", activeLang);
    sections = getDailyLogSections(data.activity, data.unit, data.activity.inspector_name, data.customer?.name, activeLang);
  }

  // Separate technical content from photos for smart partitioning
  const techSections = sections.filter((s: any) => !(s as any).key?.startsWith('photos-'));
  const photoSections = sections.filter((s: any) => (s as any).key?.startsWith('photos-'));

  // SMART PAGINATION ENGINE: Dynamic Height Scaling
  const pages: React.ReactNode[][] = [];
  const MAX_PAGE_HEIGHT = 820; // Safe height in px for A4 (approx 217mm)

  if (sectionHeights.length > 0 && techSections.length === sectionHeights.length) {
    let currentPage: React.ReactNode[] = [];
    let currentHeight = 0;

    techSections.forEach((section, idx) => {
      const height = sectionHeights[idx] || 100;
      
      if (currentHeight + height > MAX_PAGE_HEIGHT && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [section];
        currentHeight = height;
      } else {
        currentPage.push(section);
        currentHeight += height;
      }
    });
    
    if (currentPage.length > 0) pages.push(currentPage);
  } else {
    // Fallback if measurement not yet ready (initial render)
    pages.push(techSections);
  }

  // Final Pages: Documentation Photos (Each chunk gets its own page as Annex)
  if (photoSections.length > 0) {
    photoSections.forEach(chunk => {
      pages.push([chunk]);
    });
  }

  return (
    <div 
      className="min-h-screen bg-slate-200 py-6 sm:py-12 px-2 sm:px-4 print:p-0 print:bg-white transition-all duration-500"
    >
      {/* FLOATING ACTION BAR */}
      <div className="fixed top-0 left-0 right-0 sm:top-6 sm:left-4 sm:right-4 z-50 flex items-center gap-2 bg-white/95 sm:bg-white/90 backdrop-blur-xl border-b sm:border border-slate-200 sm:border-white/20 p-2 sm:rounded-2xl shadow-lg sm:shadow-2xl overflow-x-auto no-scrollbar print:hidden max-w-full sm:max-w-[95vw] mx-auto">
        <button 
          onClick={() => window.close()} 
          className="h-10 sm:h-12 px-3 sm:px-4 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-all flex items-center gap-2 text-slate-600 font-bold shrink-0"
        >
          <X size={18} />
          <span className="hidden md:inline">Tutup</span>
        </button>
        
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* PREMIUM LANGUAGE SWITCHER */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {[
            { id: 'en', label: 'EN' },
            { id: 'ja', label: 'JP' },
            { id: 'id', label: 'ID' }
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleTranslate(lang.id as Language)}
              disabled={translating}
              className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all ${
                activeLang === lang.id 
                  ? 'bg-white text-[#00a1e4] shadow-sm scale-110 border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
              } ${translating ? 'opacity-50 cursor-not-allowed' : ''} shrink-0`}
            >
              {translating && activeLang !== lang.id ? '...' : lang.label}
            </button>
          ))}
          {translating && (
             <div className="flex items-center px-1">
                <Loader2 size={10} className="animate-spin text-[#00a1e4]" />
             </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />
        
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 border border-slate-100 rounded-xl bg-slate-50 shrink-0">
           <div className="hidden lg:block">
              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Unit ID</p>
              <p className="text-xs font-black text-[#003366]">{data.unit?.tag_number}</p>
           </div>
           <div className="w-px h-6 bg-slate-200 hidden lg:block" />
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Doc</p>
              <p className="text-xs font-black text-[#00a1e4] uppercase">{type}</p>
           </div>
        </div>

        <button 
          onClick={handlePrint}
          className="h-12 px-4 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2 text-slate-800 font-bold underline decoration-[#00a1e4] shrink-0"
        >
          <Printer size={18} />
          <span className="hidden md:inline">Print</span>
        </button>

        {/* ENGINEER SIGN STATUS/BUTTON */}
        {isReviewedLocal ? (
          <div className="h-12 px-6 flex items-center gap-2 text-emerald-600 font-black bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm shrink-0">
            <CheckCircle2 size={18} />
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-[10px] uppercase opacity-60">Verified</span>
              <span className="text-xs">{data.activity.engineer_signer_name || session?.name}</span>
            </div>
          </div>
        ) : isEngineer ? (
          <button 
            onClick={() => handleSign('engineer')}
            disabled={approving}
            className="h-10 sm:h-12 px-4 sm:px-6 bg-blue-600 text-white rounded-lg sm:rounded-xl shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-black disabled:opacity-50 border border-blue-500 shrink-0"
          >
            {approving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={18} />}
            <span className="text-xs sm:text-sm">Review</span>
          </button>
        ) : (
          <div className="h-12 px-4 flex items-center gap-2 text-amber-600 font-black bg-amber-50 rounded-xl border border-amber-200 shrink-0">
            <AlertCircle size={16} />
            <span className="text-[10px] uppercase hidden sm:inline">Awaiting Review</span>
          </div>
        )}

        {/* CUSTOMER SIGN STATUS/BUTTON */}
        {isApprovedLocal ? (
          <div className="h-12 px-6 flex items-center gap-2 text-[#003366] font-black bg-blue-50 rounded-xl border border-blue-200 shadow-sm shrink-0">
            <CheckCircle2 size={18} className="text-[#00a1e4]" />
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-[10px] uppercase opacity-60">Approved</span>
              <span className="text-xs">{data.activity.customer_approver_name}</span>
            </div>
          </div>
        ) : !isInternal && isReviewedLocal ? (
          <button 
            onClick={() => handleSign('customer')}
            disabled={approving}
            className="h-12 px-6 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-black disabled:opacity-50 border border-emerald-500"
          >
            {approving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            <span>Approve & Sign</span>
          </button>
        ) : isReviewedLocal && (
          <div className="h-12 px-6 flex items-center gap-2 text-amber-600 font-black bg-amber-50 rounded-xl border border-amber-200">
            <AlertCircle size={16} />
            <span className="text-[10px] uppercase">Awaiting Customer Approval</span>
          </div>
        )}

        <button 
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="h-10 sm:h-12 px-4 sm:px-6 bg-[#003366] text-white rounded-lg sm:rounded-xl shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-black disabled:opacity-50 shrink-0"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={18} />}
          <span className="hidden sm:inline text-xs sm:text-sm">Download</span>
        </button>
      </div>

      {/* HIDDEN PROBE CONTAINER (For measurement) */}
      <div 
        ref={probeRef} 
        style={{ 
          position: "absolute", 
          top: "-9999px", 
          left: "-9999px", 
          width: "180mm", // Match internal width of ReportBase content area (210mm - 30mm padding)
          visibility: "hidden" 
        }}
      >
        {techSections}
      </div>

      {/* A4 REPORT PREVIEW (PAGINATED WITH AUTO-SCALE) */}
      <div 
        ref={reportRef} 
        className="flex flex-col items-center gap-8 mt-16 sm:mt-12 print:mt-0 print:gap-0"
        style={{ 
          transform: reportScale < 1 ? `scale(${reportScale})` : 'none',
          transformOrigin: 'top center',
          width: reportScale < 1 ? '100%' : 'auto',
          height: reportScale < 1 ? `calc(100% * ${reportScale})` : 'auto',
          marginBottom: reportScale < 1 ? `-${(1 - reportScale) * 100}%` : '0' // Mitigate scale spacing
        }}
      >
        {pages.map((pageSections, index) => (
          <div key={index} className="print:shadow-none shadow-2xl">
            <ReportBase 
              reportTitle={reportTitle} 
              reportCode={reportCode}
              unit={data.unit}
              date={data.activity.service_date}
              inputDate={type.toLowerCase() !== 'ba' ? data.activity.created_at : undefined}
              pageNumber={index + 1}
              totalPages={pages.length}
              isFixedHeight={true}
              lang={activeLang}
            >
              <div 
                className="flex-1 flex flex-col w-full"
                style={{ 
                  justifyContent: index >= (pages.length - photoSections.length) ? 'center' : 'flex-start',
                  paddingTop: index >= (pages.length - photoSections.length) ? '0' : '4mm'
                }}
              >
                {pageSections}
              </div>
            </ReportBase>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          title, .print-hidden, .fixed {
            display: none !important;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-report-container {
            width: 210mm !important;
            min-height: 297mm !important;
            box-shadow: none !important;
            margin: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Minimalistic X icon since lucide-react X was imported but unused for close button
function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
