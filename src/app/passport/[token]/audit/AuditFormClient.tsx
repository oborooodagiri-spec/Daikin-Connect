"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { createAuditActivity, updateAuditActivity } from "@/app/actions/audit";
import { savePendingSubmission } from "@/lib/offline-db";
import { 
  ChevronRight, ChevronLeft, Save, Camera, FileText,
  CheckCircle2, AlertCircle, MapPin, X, UploadCloud, Printer, WifiOff,
  FileVideo, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateBalancedAHI, AHIResult } from "@/lib/physics/ahi-calculation";

export default function AuditFormClient({ unit, initialData, onSuccess }: { unit: any, initialData?: any, onSuccess?: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isQueued, setIsQueued] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  React.useEffect(() => {
    const handleStatus = () => {}; // Just force re-render if needed
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // --- FORM STATE ---
  const [formData, setFormData] = useState<any>(initialData ? {
    ...initialData,
    unit_id: unit.id,
    unit_tag: unit.tag_number || initialData.unit_tag || "",
    location: unit.area || initialData.location || "",
    // Map temperature fields explicitly to ensure strings/empty handling
    leaving_db: initialData.leaving_db?.toString() || "",
    leaving_wb: initialData.leaving_wb?.toString() || "",
    leaving_rh: initialData.leaving_rh?.toString() || "",
    entering_db: initialData.entering_db?.toString() || "",
    entering_wb: initialData.entering_wb?.toString() || "",
    entering_rh: initialData.entering_rh?.toString() || "",
    room_db: initialData.room_db?.toString() || "",
    room_wb: initialData.room_wb?.toString() || "",
    room_rh: initialData.room_rh?.toString() || "",
    design_airflow: initialData.design_airflow?.toString() || "",
    design_cooling_capacity: initialData.design_cooling_capacity?.toString() || "",
    
    t: (typeof initialData.technical_json === 'string' ? JSON.parse(initialData.technical_json) : initialData.technical_json) || {
      supplyArea: "", returnArea: "", freshArea: "",
      supplyVelocity: Array(15).fill(""),
      returnVelocity: Array(15).fill(""),
      freshVelocity: Array(15).fill(""),
      inlet: Array(6).fill("N/A"),
      outlet: Array(6).fill("N/A")
    }
  } : {
    unit_id: unit.id,
    unit_tag: unit.tag_number || "",
    location: unit.area || "",
    inspector_name: "",
    engineer_note: "",
    design_airflow: "",
    design_cooling_capacity: "",
    leaving_db: "", leaving_wb: "", leaving_rh: "",
    entering_db: "", entering_wb: "", entering_rh: "",
    room_db: "", room_wb: "", room_rh: "", 
    t: {
      supplyArea: "", returnArea: "", freshArea: "",
      supplyVelocity: Array(15).fill(""),
      returnVelocity: Array(15).fill(""),
      freshVelocity: Array(15).fill(""),
      inlet: Array(6).fill("N/A"),
      outlet: Array(6).fill("N/A")
    },
    chws_temp: "", chwr_temp: "", chws_press: "", chwr_press: "",
    water_flow_gpm: "", pipe_size: "",
    power_kw: "",
    amp_r: "", amp_s: "", amp_t: "",
    volt_rs: "", volt_rt: "", volt_st: "", volt_ln: "",
    fincoil_cond: "GOOD",
    drain_pan_cond: "GOOD",
    blower_fan_cond: "GOOD"
  });

  // If we have supplyVelocity etc from processReportData fallback, use them
  useEffect(() => {
    if (initialData?.t?.supplyVelocity) {
      setFormData((prev: any) => ({
        ...prev,
        t: {
          ...prev.t,
          supplyVelocity: initialData.t.supplyVelocity,
          returnVelocity: initialData.t.returnVelocity,
          freshVelocity: initialData.t.freshVelocity
        }
      }));
    }
  }, [initialData]);

  const [mediaItems, setMediaItems] = useState<{file: File | null, type: "image" | "video", preview: string}[]>(
    initialData?.activity_photos?.map((p: any) => ({
      file: null, // Existing files don't have a File object
      type: p.media_type || "image",
      preview: p.photo_url
    })) || []
  );

  // Handlers for deeply nested state (t)
  const setT = (key: string, val: any) => setFormData({ ...formData, t: { ...formData.t, [key]: val }});
  
  const handleMatrixChange = (type: 'supply'|'return'|'fresh', index: number, val: string) => {
    const key = `${type}Velocity`;
    const newArr = [...formData.t[key]];
    newArr[index] = val;
    setT(key, newArr);
  };

  const handleAccessoryChange = (side: 'inlet'|'outlet', index: number, val: string) => {
    const newArr = [...formData.t[side]];
    newArr[index] = val;
    setT(side, newArr);
  };

  // Auto Calculations
  const calcAvg = (arr: string[]) => {
    const nums = arr.map(v => parseFloat(v)).filter(v => !isNaN(v) && v > 0);
    if (nums.length === 0) return 0;
    return nums.reduce((a,b) => a+b, 0) / nums.length;
  };

  const avgSupply = useMemo(() => calcAvg(formData.t.supplyVelocity), [formData.t.supplyVelocity]);
  const avgReturn = useMemo(() => calcAvg(formData.t.returnVelocity), [formData.t.returnVelocity]);
  const avgFresh = useMemo(() => calcAvg(formData.t.freshVelocity), [formData.t.freshVelocity]);

  // Try to parse mm x mm area into Cfm if possible (basic heuristic)
  const calculateCfm = (areaStr: string, avgVel: number) => {
    try {
      if (!areaStr || avgVel === 0) return 0;
      // if user types "1400 x 400"
      const dims = areaStr.toLowerCase().replace(/mm/g, '').split('x').map(s => parseFloat(s.trim()));
      if (dims.length === 2 && !isNaN(dims[0]) && !isNaN(dims[1])) {
        const areaM2 = (dims[0] / 1000) * (dims[1] / 1000);
        return Math.round(areaM2 * avgVel * 2118.88); // m/s * m2 to Cfm
      }
    } catch(e) {}
    return 0;
  };

  // Health Vitality Calculation (Balanced AHI Utility)
  const healthResult = useMemo<AHIResult>(() => {
    return calculateBalancedAHI({
      fincoil: formData.fincoil_cond,
      drainPan: formData.drain_pan_cond,
      blowerFan: formData.blower_fan_cond,
      accessories: [...formData.t.inlet, ...formData.t.outlet],
      enteringDB: parseFloat(formData.entering_db) || 0,
      leavingDB: parseFloat(formData.leaving_db) || 0,
      enteringRH: parseFloat(formData.entering_rh),
      leavingRH: parseFloat(formData.leaving_rh),
      measuredAirflow: calculateCfm(formData.t.supplyArea, avgSupply) * 1.699, // Convert to m3/h for utility
      designCapacityStr: formData.design_cooling_capacity > 0 ? `${formData.design_cooling_capacity} BTU` : unit.capacity,
      yearOfInstall: unit.yoi
    });
  }, [formData, unit.yoi, unit.capacity, avgSupply]);

  const healthScore = healthResult.totalScore;

  const healthLabel = useMemo(() => {
    if (healthScore < 40) return { text: "REPLACE", color: "rose" };
    if (healthScore < 60) return { text: "MAINTENANCE", color: "amber" };
    if (healthScore < 85) return { text: "MONITOR", color: "indigo" };
    return { text: "EXCELLENT", color: "emerald" };
  }, [healthScore]);

  // Sync calculated CFMs into t object for the PDF
  const renderData = {
    ...formData,
    healthScore, // Add to payload
    healthStatus: healthLabel.text,
    t: {
      ...formData.t,
      totalCfmSupply: calculateCfm(formData.t.supplyArea, avgSupply) || "-",
      totalCfmReturn: calculateCfm(formData.t.returnArea, avgReturn) || "-",
      totalCfmFresh: calculateCfm(formData.t.freshArea, avgFresh) || "-"
    }
  };

  // --- MEDIA HANDLING (Photos & Videos) ---
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (mediaItems.length + files.length > 10) {
      alert("Maksimal 10 file!");
      return;
    }

    setLoading(true);
    for (const f of files) {
      try {
        const isVideo = f.type.startsWith("video/");
        let finalFile = f;

        if (!isVideo) {
          // Automatic Compression: 1MB max, 1280px resolution
          const options = { 
            maxSizeMB: 1, 
            maxWidthOrHeight: 1280, 
            useWebWorker: true,
            initialQuality: 0.8
          };
          finalFile = await imageCompression(f, options);
        } else {
          if (f.size > 20 * 1024 * 1024) {
             alert(`Video ${f.name} terlalu besar (>20MB). Mohon gunakan video berdurasi pendek.`);
             continue;
          }
        }

        setMediaItems(prev => [...prev, {
          file: finalFile,
          type: isVideo ? "video" : "image",
          preview: URL.createObjectURL(finalFile)
        }]);
      } catch (err) { console.error(err); }
    }
    setLoading(false);
  };

  const removeMedia = (idx: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Helper helper to wait for server-side images to load in the DOM
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

  // --- SUBMIT PIPELINE ---
  const handleSubmit = async () => {
    if (!formData.inspector_name) { alert("Nama Inspector (General Data) wajib diisi!"); setStep(1); return; }
    setLoading(true);
    try {
      // --- OFFLINE CHECK ---
      if (!navigator.onLine) {
        await savePendingSubmission({
          type: 'AUDIT',
          data: { 
            ...formData, 
            velocity_points: [
              ...formData.t.supplyVelocity.map((v:any, i:number) => ({ point_number: i+1, velocity_value: parseFloat(v) || 0 })),
              ...formData.t.returnVelocity.map((v:any, i:number) => ({ point_number: i+16, velocity_value: parseFloat(v) || 0 })),
              ...formData.t.freshVelocity.map((v:any, i:number) => ({ point_number: i+31, velocity_value: parseFloat(v) || 0 }))
            ]
          },
          photos: mediaItems.map(m => m.file).filter((f): f is File => f !== null)
        });
        setIsQueued(true);
        setLoading(false);
        return;
      }

      // --- ONLINE FLOW: UPLOAD FIRST ---
      
      // 1. Upload Media (Photos & Videos) BEFORE generating PDF
      const uploadedMedia: { photo_url: string; description: string; media_type: string }[] = [];
      for (const item of mediaItems) {
        if (!item.file) {
          // Carry over existing photos (already have previews/URLs)
          uploadedMedia.push({
            photo_url: item.preview,
            media_type: item.type,
            description: "Audit Documentation"
          });
          continue;
        }

        const mForm = new FormData();
        mForm.append("file", item.file);
        mForm.append("folder", "audit");
        
        const mRes = await fetch("/api/upload", { method: "POST", body: mForm });
        if (!mRes.ok) throw new Error(`Media Upload failed: ${mRes.status}`);
        const mData = await mRes.json() as any;
        if (mData && "success" in mData && mData.success) {
          uploadedMedia.push({ 
            photo_url: mData.url, 
            media_type: item.type,
            description: "Audit Documentation" 
          });
        }
      }

      // Update state with server URLs for PDF generation
      const finalRenderData = {
        ...renderData,
        activity_photos: uploadedMedia
      };

      let pdfUrl = "";
      let baUrl = "";
      
      // 2. GENERATE PDF (TECH CHECKSHEET)
      const A4_HEIGHT_MM = 297;
      const SAFE_CONTENT_MM = 220; 
      const PX_PER_MM = 3.78; 
      const SAFE_PX = SAFE_CONTENT_MM * PX_PER_MM;

      const { getAuditSections } = await import("@/components/AuditPDFTemplate");
      const sections = getAuditSections(finalRenderData, unit);

      // Measurement Layer
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

      for (const section of sections) {
        const tempWrap = document.createElement("div");
        tempWrap.style.width = "100%";
        measureDiv.appendChild(tempWrap);
        
        const { createRoot } = await import("react-dom/client");
        const root = createRoot(tempWrap);
        
        await new Promise<void>((resolve) => {
          root.render(section);
          setTimeout(resolve, 50); 
        });

        // Ensure images in section are loaded before measuring height
        await waitForImages(tempWrap);

        const sectionHeight = tempWrap.offsetHeight;
        
        if (currentHeight + sectionHeight > SAFE_PX && currentHeight > 0) {
            pages.push([section]);
            currentHeight = sectionHeight;
        } else {
            pages[pages.length - 1].push(section);
            currentHeight += sectionHeight;
        }
      }
      document.body.removeChild(measureDiv);

      // Render Pages to PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const totalPages = pages.length;

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();

        const pageDiv = document.createElement("div");
        pageDiv.style.width = "210mm";
        pageDiv.style.height = "297mm";
        pageDiv.style.position = "fixed";
        pageDiv.style.top = "0";
        pageDiv.style.left = "0";
        pageDiv.style.zIndex = "-1000";
        pageDiv.style.opacity = "0";
        pageDiv.style.pointerEvents = "none";
        document.body.appendChild(pageDiv);

        const { createRoot } = await import("react-dom/client");
        const root = createRoot(pageDiv);
        const { ReportBase } = await import("@/components/ReportBase");
        
        await new Promise<void>((resolve) => {
          root.render(
            <ReportBase 
              reportTitle="FORM PENGUKURAN (AUDIT)" 
              reportCode={formData.report_number || "01/MF-FCU/DASI/VI/2026"} 
              unit={unit}
              pageNumber={i + 1}
              totalPages={totalPages}
              isFixedHeight={true}
            >
              <div style={{ padding: "0 5mm" }}>
                {pages[i]}
              </div>
            </ReportBase>
          );
          setTimeout(resolve, 400); // Wait for React to settle
        });

        // CRITICAL: Wait for server-side images to load on this page
        await waitForImages(pageDiv);

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const canvas = await html2canvas(pageDiv, { 
          scale: isMobile ? 1.5 : 2, 
          useCORS: true, 
          windowWidth: 794, 
          height: 1123,
          logging: false 
        });
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, A4_HEIGHT_MM);

        root.unmount();
        document.body.removeChild(pageDiv);
      }

      const pdfBlob = pdf.output("blob");
      const pdfFormData = new FormData();
      pdfFormData.append("file", new File([pdfBlob], `${unit.tag_number}_Audit_${Date.now()}.pdf`, { type: 'application/pdf' }));
      pdfFormData.append("folder", "audit");

      const pdfRes = await fetch('/api/upload', { method: 'POST', body: pdfFormData });
      if (pdfRes.ok) {
        const pData = await pdfRes.json() as any;
        if (pData && "success" in pData && pData.success) pdfUrl = pData.url;
      }

      // 3. GENERATE BERITA ACARA PDF
      const baPdf = new jsPDF("p", "mm", "a4");
      const { BeritaAcaraPDFTemplate } = await import("@/components/BeritaAcaraPDFTemplate");
      const { ReportBase: BA_ReportBase } = await import("@/components/ReportBase");

      const baDiv = document.createElement("div");
      baDiv.style.width = "210mm";
      baDiv.style.height = "297mm";
      baDiv.style.position = "fixed";
      baDiv.style.top = "0";
      baDiv.style.left = "0";
      baDiv.style.zIndex = "-1000";
      baDiv.style.opacity = "0";
      baDiv.style.pointerEvents = "none";
      document.body.appendChild(baDiv);

      const { createRoot: baRootInit } = await import("react-dom/client");
      const baRoot = baRootInit(baDiv);
      
      await new Promise<void>((resolve) => {
        baRoot.render(
          <BA_ReportBase reportTitle="BERITA ACARA PEKERJAAN" reportCode={`BA-AUDIT-${unit.id}-${Date.now()}`} unit={unit}>
            <BeritaAcaraPDFTemplate 
              data={finalRenderData} 
              unit={unit} 
              engineerName={formData.inspector_name} 
            />
          </BA_ReportBase>
        );
        setTimeout(resolve, 400);
      });

      await waitForImages(baDiv);

      const isMobileBA = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const baCanvas = await html2canvas(baDiv, { 
        scale: isMobileBA ? 1.5 : 2, 
        useCORS: true, 
        windowWidth: 794, 
        height: 1123,
        logging: false 
      });
      const baImg = baCanvas.toDataURL("image/jpeg", 0.9);
      baPdf.addImage(baImg, 'JPEG', 0, 0, 210, 297);
      
      const baBlob = baPdf.output("blob");
      const baFormData = new FormData();
      baFormData.append("file", new File([baBlob], `${unit.tag_number}_BA_${Date.now()}.pdf`, { type: 'application/pdf' }));
      baFormData.append("folder", "berita-acara");

      const baRes = await fetch('/api/upload', { method: 'POST', body: baFormData });
      if (baRes.ok) {
        const baData = await baRes.json() as any;
        if (baData && "success" in baData && baData.success) baUrl = baData.url;
      }

      baRoot.unmount();
      document.body.removeChild(baDiv);

      // 4. COMPILE VELOCITY POINTS DB ARRAY
      const velocity_points: any[] = [];
      formData.t.supplyVelocity.forEach((v:any,i:number) => { if(v) velocity_points.push({ point_number: i+1, velocity_value: parseFloat(v) }) });
      formData.t.returnVelocity.forEach((v:any,i:number) => { if(v) velocity_points.push({ point_number: i+16, velocity_value: parseFloat(v) }) });
      formData.t.freshVelocity.forEach((v:any,i:number) => { if(v) velocity_points.push({ point_number: i+31, velocity_value: parseFloat(v) }) });

      // 5. SAVE TO MYSQL DB
      const dbPayload = {
        ...finalRenderData, // Use the one with uploaded photos
        technical_json: JSON.stringify(finalRenderData.t, (_, v) => typeof v === 'bigint' ? v.toString() : v), 
        pdf_report_url: pdfUrl,
        berita_acara_pdf_url: baUrl,
        engineer_signer_name: formData.inspector_name,
        velocity_points,
        photos: uploadedMedia
      };

      const dbRes = initialData 
        ? await updateAuditActivity(initialData.id, dbPayload) as any
        : await createAuditActivity(dbPayload) as any;

      if (dbRes && "success" in dbRes && dbRes.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          setSuccess(true);
        }
      } else {
        alert("Database Error: " + (dbRes as any).error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error generating report: " + err.message);
    }
    setLoading(false);
  };

  if (success || isQueued) {
    return (
      <div className="min-h-screen bg-[#003366] flex flex-col justify-center items-center p-6 text-white text-center">
        <div className={`w-24 h-24 ${isQueued ? 'bg-orange-500' : 'bg-emerald-500'} rounded-full flex items-center justify-center mb-6 animate-bounce`}>
          {isQueued ? <WifiOff size={48} /> : <CheckCircle2 size={48} />}
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          {isQueued ? "Queued Offline!" : "Audit Submitted!"}
        </h1>
        <p className="text-blue-200 mb-8 max-w-sm font-medium">
          {isQueued 
            ? "Koneksi mati. Laporan Anda telah disimpan di HP dan akan otomatis terkirim saat internet kembali aktif." 
            : "Laporan ukur, penghitungan matematis, & PDF dokumen berlogo sudah berhasil digenerate dan dikirim ke server."}
        </p>
        <button onClick={() => router.push(`/unit/${unit.qr_code_token}`)} className="px-8 py-4 bg-white text-[#003366] font-black rounded-2xl uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl">
          Kembali ke Passport
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* HEADER */}
      <div className="bg-[#003366] text-white p-6 rounded-b-[2rem] shadow-lg mb-6 pt-12 sticky top-0 z-40">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <FileText size={20}/> Pengukuran
          </h1>
          <button 
            onClick={() => setShowFormula(true)}
            className={`px-4 py-2 rounded-2xl border bg-white/10 backdrop-blur-md flex flex-col items-center border-white/20 shadow-lg min-w-[100px] hover:bg-white/20 transition-all`}
          >
            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Health Score</span>
            <span className={`text-xl font-black text-${healthLabel.color}-400`}>{healthScore}%</span>
          </button>
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm font-medium opacity-80 flex items-center gap-1"><MapPin size={14}/> {unit.area}</p>
          <span className="px-3 py-1 bg-[#00a1e4] rounded-lg text-xs font-black uppercase tracking-widest">Step {step} / 5</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 mt-4 rounded-full overflow-hidden">
           <div className="bg-[#00a1e4] h-full transition-all duration-500" style={{ width: `${(step/5)*100}%` }}></div>
        </div>
      </div>

      <div className="px-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: GENERAL DATA & AIR SIDE */}
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">A. General Data</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Auditor/Inspector*</label>
                    <input type="text" value={formData.inspector_name} onChange={e => setFormData({...formData, inspector_name: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00a1e4]" placeholder="Masukkan Nama Lengkap"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Design Cooling Cap (Btuh)</label>
                      <input type="number" value={formData.design_cooling_capacity} onChange={e => setFormData({...formData, design_cooling_capacity: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Design Airflow (Cfm)</label>
                      <input type="number" value={formData.design_airflow} onChange={e => setFormData({...formData, design_airflow: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">B. Air Side Temperatures</h2>
                {[
                  { label: "Leaving Coil Temp", prefix: "leaving" },
                  { label: "Entering Coil Temp", prefix: "entering" },
                  { label: "Fresh Air Temp", prefix: "room" }
                ].map((sec) => (
                  <div key={sec.prefix} className="mb-4">
                    <label className="text-xs font-black uppercase text-slate-700">{sec.label}</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                       <input type="number" placeholder="DB (°C)" value={formData[`${sec.prefix}_db`]} onChange={e => setFormData({...formData, [`${sec.prefix}_db`]: e.target.value})} className="w-full p-2.5 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"/>
                       <input type="number" placeholder="WB (°C)" value={formData[`${sec.prefix}_wb`]} onChange={e => setFormData({...formData, [`${sec.prefix}_wb`]: e.target.value})} className="w-full p-2.5 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"/>
                       <input type="number" placeholder="RH (%)" value={formData[`${sec.prefix}_rh`]} onChange={e => setFormData({...formData, [`${sec.prefix}_rh`]: e.target.value})} className="w-full p-2.5 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"/>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: AIR VELOCITY MATRIX */}
          {step === 2 && (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                   <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Findings / Temuan</h4>
                   <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase">Document highlights, findings / temuan, and follow-up activities.</p>
                   <div className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold uppercase">15 Titik Pengukuran</div>
                </div>

                {['supply', 'return', 'fresh'].map((type) => (
                  <div key={type} className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                       <label className="text-sm font-black uppercase text-slate-700 capitalize">{type} Air</label>
                       <input type="text" placeholder="Area (e.g. 100x100 mm)" value={formData.t[`${type}Area`]} onChange={e => setT(`${type}Area`, e.target.value)} className="w-[150px] p-2 text-xs font-bold border rounded-lg text-center" />
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                       {Array.from({length: 15}).map((_, i) => (
                         <input key={i} type="number" placeholder={`${i+1}`} value={formData.t[`${type}Velocity`][i]} onChange={e => handleMatrixChange(type as any, i, e.target.value)} className="w-full p-2 text-center border border-slate-200 rounded-lg text-xs font-bold focus:ring-[#00a1e4]" />
                       ))}
                    </div>
                    <div className="mt-3 flex justify-between text-xs font-black text-blue-600 border-t border-slate-200 pt-2">
                       <span>AVG: {type === 'supply' ? avgSupply.toFixed(2) : type === 'return' ? avgReturn.toFixed(2) : avgFresh.toFixed(2)} m/s</span>
                       <span>Auto CFM: {renderData.t[`totalCfm${type.charAt(0).toUpperCase() + type.slice(1)}`]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: CHILL WATER & ELECTRICAL */}
          {step === 3 && (
            <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">C. Chilled Water Side</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">CHWS Temp (°C)</label>
                    <input type="number" step="0.1" value={formData.chws_temp} onChange={e => setFormData({...formData, chws_temp: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">CHWS Pressure (Bar)</label>
                    <input type="number" step="0.1" value={formData.chws_press} onChange={e => setFormData({...formData, chws_press: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">CHWR Temp (°C)</label>
                    <input type="number" step="0.1" value={formData.chwr_temp} onChange={e => setFormData({...formData, chwr_temp: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">CHWR Pressure (Bar)</label>
                    <input type="number" step="0.1" value={formData.chwr_press} onChange={e => setFormData({...formData, chwr_press: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Water Flow Rate (m3/h)</label>
                    <input type="number" step="0.1" value={formData.water_flow_gpm} onChange={e => setFormData({...formData, water_flow_gpm: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Pipe Size Inlet/Outlet (mm)</label>
                    <input type="text" value={formData.pipe_size} onChange={e => setFormData({...formData, pipe_size: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="e.g. 50/50"/>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">D. Electrical</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Power (kW)</label>
                    <input type="number" value={formData.power_kw} onChange={e => setFormData({...formData, power_kw: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Current (A)</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <input type="number" placeholder="R." value={formData.amp_r} onChange={e => setFormData({...formData, amp_r: e.target.value})} className="w-full p-3 text-center bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                      <input type="number" placeholder="S." value={formData.amp_s} onChange={e => setFormData({...formData, amp_s: e.target.value})} className="w-full p-3 text-center bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                      <input type="number" placeholder="T." value={formData.amp_t} onChange={e => setFormData({...formData, amp_t: e.target.value})} className="w-full p-3 text-center bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Voltage (V)</label>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      <input type="number" placeholder="RS." value={formData.volt_rs} onChange={e => setFormData({...formData, volt_rs: e.target.value})} className="w-full p-3 text-center bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                      <input type="number" placeholder="RT." value={formData.volt_rt} onChange={e => setFormData({...formData, volt_rt: e.target.value})} className="w-full p-3 text-center bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                      <input type="number" placeholder="ST." value={formData.volt_st} onChange={e => setFormData({...formData, volt_st: e.target.value})} className="w-full p-3 text-center bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                      <input type="number" placeholder="LN." value={formData.volt_ln} onChange={e => setFormData({...formData, volt_ln: e.target.value})} className="w-full p-3 text-center bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"/>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ACCESSORIES */}
          {step === 4 && (
            <motion.div key="step4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">E. Component & Accessories Condition</h2>
                
                {/* NEW: Major Component Conditions */}
                <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em]">Major Components</p>
                  <div className="space-y-4">
                    {[
                      { label: "Kondisi Fincoil", key: "fincoil_cond" },
                      { label: "Kondisi Drain Pan", key: "drain_pan_cond" },
                      { label: "Kondisi Blower Fan", key: "blower_fan_cond" }
                    ].map((comp) => (
                      <div key={comp.key} className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">{comp.label}</span>
                        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                           {['GOOD', 'BAD'].map(v => (
                             <button
                               key={v}
                               onClick={() => setFormData({...formData, [comp.key]: v})}
                               className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${formData[comp.key] === v ? (v === 'GOOD' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'text-slate-400'}`}
                             >
                               {v}
                             </button>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em]">Accessories Details</p>
                {["Gate/Butterfly Valve", "Flexible Joint", "Motorized Valve", "Balancing Valve", "Thermometer", "Pressure Gauge"].map((acc, i) => (
                  <div key={i} className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <CheckCircle2 size={16} className="text-[#00a1e4]" /> {i+1}. {acc}
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Inlet FCU</p>
                        <select value={formData.t.inlet[i]} onChange={e => handleAccessoryChange('inlet', i, e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-black focus:ring-2 focus:ring-[#00a1e4]">
                           <option value="N/A">N/A</option>
                           <option value="OK">✅ OK</option>
                           <option value="DEFECT">❌ DEFECT</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Outlet FCU</p>
                        <select value={formData.t.outlet[i]} onChange={e => handleAccessoryChange('outlet', i, e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-black focus:ring-2 focus:ring-[#00a1e4]">
                           <option value="N/A">N/A</option>
                           <option value="OK">✅ OK</option>
                           <option value="DEFECT">❌ DEFECT</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: VISUAL & UPLOAD */}
          {step === 5 && (
            <motion.div key="step5" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">F. Visual Notes & Photos</h2>
                <textarea 
                  rows={4} placeholder="Masukkan catatan visual atau temuan lapangan..."
                  value={formData.engineer_note} onChange={e => setFormData({...formData, engineer_note: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00a1e4]"
                />
                
                <div className="mt-6">
                  <h3 className="text-xs font-black uppercase text-slate-500 mb-2 flex justify-between">
                    <span>Dokumentasi Lapangan</span>
                    <span className="text-[#00a1e4]">{mediaItems.length}/10</span>
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {mediaItems.map((item, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 flex items-center justify-center">
                        {item.type === "video" ? (
                          <>
                            <video src={item.preview} className="w-full h-full object-cover opacity-50" muted />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <Play size={24} className="text-white fill-white" />
                            </div>
                            <div className="absolute top-1 left-1 px-1 py-0.5 bg-amber-500 text-white text-[7px] font-black uppercase rounded shadow-lg">Video</div>
                          </>
                        ) : (
                          <img src={item.preview} alt={`Media ${i}`} className="w-full h-full object-cover" />
                        )}
                        <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {mediaItems.length < 10 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-[#00a1e4] hover:bg-blue-50 hover:border-[#00a1e4] cursor-pointer transition-colors">
                        <Camera size={24} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">Tambah</span>
                        <input type="file" multiple accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-600 font-bold flex items-start gap-1">
                    <AlertCircle size={14} className="shrink-0"/> 
                    Media otomatis di-optimasi. Video akan terkompresi secara otomatis di server.
                  </p>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center p-10 bg-white rounded-xl shadow-2xl">
                  <Printer className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-800">Laporan Siap Dibuat</h3>
                  <p className="text-slate-500 text-sm">Laporan akan secara otomatis dibagi menjadi halaman-halaman profesional saat tombol "Selesai & Simpan" diklik.</p>
                </div>
              </motion.div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* FIXED BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 inset-x-0 p-6 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-lg mx-auto flex justify-between gap-4">
          {step > 1 ? (
            <button onClick={() => setStep(step-1)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest">
              <ChevronLeft size={16} /> Mundur
            </button>
          ) : <div className="flex-1"></div>}
          
          {step < 5 ? (
            <button onClick={() => setStep(step+1)} className="flex-1 py-4 bg-[#00a1e4] text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#008cc6] transition-colors shadow-lg shadow-blue-200 uppercase text-xs tracking-widest">
              Lanjut <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-4 bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 uppercase text-xs tracking-widest disabled:opacity-50">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : <Printer size={18} />}
              {loading ? "Generating Report..." : "Generate PDF & Submit"}
            </button>
          )}
        </div>
      </div>

      {/* FORMULA MODAL */}
      <AnimatePresence>
        {showFormula && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormula(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-md relative z-10 shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 p-6">
                  <button onClick={() => setShowFormula(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"><X size={20}/></button>
               </div>
               
               <h3 className="text-2xl font-black text-[#003366] leading-tight mb-2">Daikin Balanced<br/>Asset Health Index</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b pb-4">Ref: CIBSE Guide M & ASHRAE 1.1</p>
               
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Activity size={24} className="text-[#00a1e4]" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-[#003366] uppercase">Physical Condition (40%)</p>
                        <p className="text-xs text-slate-500 font-medium">Fincoil, Drain Pan, Fan, & Accessories. <span className="text-[#00a1e4] font-bold">Score: {healthResult.conditionScore}%</span></p>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Zap size={24} className="text-emerald-500" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-[#003366] uppercase">Performance Index (40%)</p>
                        <p className="text-xs text-slate-500 font-medium">Thermodynamic capacity efficiency. <span className="text-emerald-500 font-bold">Score: {healthResult.performanceScore}%</span></p>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
                        <History size={24} className="text-rose-500" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-[#003366] uppercase">Reliability Factor (20%)</p>
                        <p className="text-xs text-slate-500 font-medium">Unit degradation based on age ({healthResult.breakdown.reliability.age} yrs). <span className="text-rose-500 font-bold">Score: {healthResult.reliabilityScore}%</span></p>
                     </div>
                  </div>
               </div>

               <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 italic font-medium text-slate-400 text-[10px] text-center">
                  "$Score = (CI \cdot 0.4) + (PI \cdot 0.4) + (RI \cdot 0.2)$"
               </div>

               <button onClick={() => setShowFormula(false)} className="w-full mt-6 py-4 bg-[#003366] text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-blue-900/10">Understood</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Zap(props: any) { 
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  );
}

function Activity(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  );
}

function History(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
  );
}
