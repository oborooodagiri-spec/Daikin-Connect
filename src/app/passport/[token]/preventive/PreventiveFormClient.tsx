"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { createPreventiveActivity, updatePreventiveActivity } from "@/app/actions/preventive";
import { savePendingSubmission } from "@/lib/offline-db";
import {
  ChevronRight, ChevronLeft, FileText, Camera,
  CheckCircle2, AlertCircle, MapPin, X, Printer, Wrench, WifiOff,
  FileVideo, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Row definitions matching the physical form exactly
const SCOPE_ROWS = [
  { key: "power_supply", label: "Power Supply", type: "measure" },
  { key: "ampere_motor", label: "Ampere Motor", type: "measure" },
  { key: "pressure_inlet", label: "Pressure Inlet Water", type: "measure" },
  { key: "pressure_outlet", label: "Pressure Outlet Water", type: "measure" },
  { key: "temp_inlet", label: "Temperature Inlet Water", type: "measure" },
  { key: "temp_outlet", label: "Temperature Outlet Water", type: "measure" },
  { key: "return_air_temp", label: "Return Air Temperature", type: "measure" },
  { key: "supply_air_temp", label: "Supply Air Temperature", type: "measure" },
  { key: "coil_temp", label: "Coil Temperature", type: "measure" },
  { key: "air_flow_rate", label: "Air Flow Rate", type: "measure" },
  { key: "clean_air_filter", label: "Cleaning or Replace Air Filter", type: "action" },
  { key: "clean_coil", label: "Cleaning Coil AHU", type: "action" },
  { key: "clean_drainage", label: "Cleaning Drainage", type: "action" },
  { key: "clean_body", label: "Cleaning Body Unit", type: "action" },
  { key: "check_vbelt", label: "Check V-Belt and Adjust Belt Tension", type: "action" },
  { key: "check_bearing", label: "Check Bearing Motor and Blower", type: "action" },
];

const PARTS_ROWS = [
  { key: "vbelt_type", label: "Vbelt Type / Quantity" },
  { key: "motor_bearing", label: "Motor Bearing Type / Quantity" },
  { key: "blower_bearing", label: "Blower Bearing Type / Quantity" },
  { key: "motor_pulley", label: "Motor Pulley Type" },
  { key: "blower_pulley", label: "Blower Pulley Type" },
];

export default function PreventiveFormClient({ unit, initialData, onSuccess }: { unit: any, initialData?: any, onSuccess?: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isQueued, setIsQueued] = useState(false);

  React.useEffect(() => {
    const handleStatus = () => {}; 
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Extract initial data if editing
  const parsed = initialData?.technical_json ? (typeof initialData.technical_json === 'string' ? JSON.parse(initialData.technical_json) : initialData.technical_json) : null;

  // Header state
  const [header, setHeader] = useState(parsed?.header || {
    project: unit.area || "",
    date: new Date().toISOString().split("T")[0],
    model: unit.model || "",
    so_number: "",
    serial_number: unit.serial_number || "",
    visit: "1",
    unit_number: unit.tag_number || "",
    nominal_capacity: unit.capacity || "",
    location: unit.building_floor || "",
    team_opt: ""
  });

  // Scope of Work rows
  const [scope, setScope] = useState<Record<string, { before: string; after: string; remarks: string; done: string }>>(() => {
    if (parsed?.scope) return parsed.scope;
    const init: any = {};
    SCOPE_ROWS.forEach(r => {
      init[r.key] = { before: "", after: "", remarks: "", done: "" };
    });
    return init;
  });

  // Parts info
  const [parts, setParts] = useState<Record<string, string>>(() => {
    if (parsed?.parts) return parsed.parts;
    const init: any = {};
    PARTS_ROWS.forEach(r => { init[r.key] = ""; });
    return init;
  });

  // Technical Advice & Signatures
  const [technicalAdvice, setTechnicalAdvice] = useState(parsed?.technicalAdvice || initialData?.engineer_note || "");
  const [engineerName, setEngineerName] = useState(parsed?.engineerName || initialData?.inspector_name || "");
  const [customerName, setCustomerName] = useState(parsed?.customerName || "");

  // Service Status tracking
  const [serviceStatus, setServiceStatus] = useState<"SERVICED" | "NOT_SERVICED">(parsed?.serviceStatus || "SERVICED");
  const [noServiceReason, setNoServiceReason] = useState(parsed?.noServiceReason || "");

  const NO_SERVICE_REASONS = [
    "Tenant Vacant (Partisi) / Tutup",
    "Unit Tidak Ada / Take Out (Unit AC-nya tidak ada)",
    "Unit Tidak Difungsikan",
    "Unit Rusak",
    "Tidak Ada Akses ke Unit",
    "Tenant Tidak Tersedia",
    "Reschedule"
  ];

  // Media (Photos & Videos)
  const [mediaItems, setMediaItems] = useState<{file: File | null, type: "image" | "video", preview: string}[]>(
    initialData?.activity_photos?.map((p: any) => ({
      file: null,
      type: p.media_type || "image",
      preview: p.photo_url
    })) || []
  );

  // Helpers
  const updateScope = (key: string, field: string, val: string) => {
    setScope(prev => {
      const updatedRow = { ...prev[key], [field]: val };
      
      // AUTO-CALCULATION FOR MARGIN (MEASURE TYPE)
      const rowDef = SCOPE_ROWS.find(r => r.key === key);
      if (rowDef?.type === 'measure' && (field === 'before' || field === 'after')) {
        const b = parseFloat(updatedRow.before);
        const a = parseFloat(updatedRow.after);
        if (!isNaN(b) && !isNaN(a)) {
          const margin = (a - b).toFixed(2);
          updatedRow.remarks = margin;
        }
      }

      return { ...prev, [key]: updatedRow };
    });
  };

  // Media Capture Handler (Photos & Videos)
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (mediaItems.length + files.length > 10) { alert("Maksimal 10 file!"); return; }

    setLoading(true);
    for (const f of files) {
      try {
        const isVideo = f.type.startsWith("video/");
        let finalFile = f;
        
        if (!isVideo) {
          // Compress only if image
          const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
          finalFile = await imageCompression(f, options);
        } else {
          // For video, check size (alert if > 20MB for mobile sanity)
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

  // Build render data
  const renderData = { 
    header, 
    scope, 
    parts, 
    technicalAdvice, 
    engineerName, 
    customerName,
    serviceStatus,
    noServiceReason
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!engineerName) { alert("Nama Service Engineer wajib diisi!"); setStep(1); return; }
    setLoading(true);
    try {
      // --- OFFLINE CHECK ---
      if (!navigator.onLine) {
        await savePendingSubmission({
          type: 'PREVENTIVE',
          data: {
            unit_id: unit.id,
            inspector_name: engineerName,
            engineer_note: technicalAdvice,
            unit_tag: header.unit_number,
            location: header.location,
            technical_json: JSON.stringify(renderData, (_, v) => typeof v === 'bigint' ? v.toString() : v),
          },
          photos: mediaItems.map(m => m.file).filter((f): f is File => f !== null)
        });
        setIsQueued(true);
        setLoading(false);
        return;
      }

      let pdfUrl = "";      
      let baUrl = "";
      // 1. Generate PDF (TECH CHECKSHEET)
      // --- NEW TRUE PAGINATION LOGIC ---
        const A4_HEIGHT_MM = 297;
        const SAFE_CONTENT_MM = 220; // Slightly more for PM since mostly text/table
        const PX_PER_MM = 3.78; 
        const SAFE_PX = SAFE_CONTENT_MM * PX_PER_MM;

        // Get sections
        const { getPreventiveSections } = await import("@/components/PreventivePDFTemplate");
        const sections = getPreventiveSections(renderData, unit, engineerName, customerName);

        // Measurement Layer (Invisible)
        const measureDiv = document.createElement("div");
        measureDiv.style.width = "794px"; // A4 Width
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

          // Temporary container for this page
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
                reportTitle="MAINTENANCE CHECKSHEET" 
                reportCode={header?.so_number || `PM-${unit.id}`} 
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
            setTimeout(resolve, 200); 
          });

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
        pdfFormData.append("file", new File([pdfBlob], `${unit.tag_number}_Preventive_${Date.now()}.pdf`, { type: "application/pdf" }));
        pdfFormData.append("folder", "preventive");

        const pdfRes = await fetch("/api/upload", { method: "POST", body: pdfFormData });
        if (!pdfRes.ok) {
          const errorText = await pdfRes.text();
          console.error("PDF Upload Failed:", errorText);
          throw new Error(`PDF Upload failed: ${pdfRes.status} ${pdfRes.statusText}`);
        }
        const pdfData = await pdfRes.json() as any;
        if (pdfData && "success" in pdfData && pdfData.success) pdfUrl = pdfData.url;

        // --- NEW: GENERATE BERITA ACARA PDF ---
        const baPdf = new jsPDF("p", "mm", "a4");
        const { BeritaAcaraPDFTemplate } = await import("@/components/BeritaAcaraPDFTemplate");
        const { ReportBase } = await import("@/components/ReportBase");

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
            <ReportBase reportTitle="BERITA ACARA PEKERJAAN" reportCode={`BA-PM-${unit.id}-${Date.now()}`} unit={unit}>
              <BeritaAcaraPDFTemplate 
                data={renderData} 
                unit={unit} 
                engineerName={engineerName} 
              />
            </ReportBase>
          );
          setTimeout(resolve, 300);
        });

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

      // 2. Upload Media (Photos & Videos)
      const uploadedMedia: { photo_url: string; description: string; media_type: string }[] = [];
      for (const item of mediaItems) {
        if (!item.file) {
          uploadedMedia.push({
            photo_url: item.preview,
            media_type: item.type,
            description: "Preventive Documentation"
          });
          continue;
        }

        const mForm = new FormData();
        mForm.append("file", item.file);
        mForm.append("folder", "preventive");
        
        const mRes = await fetch("/api/upload", { method: "POST", body: mForm });
        if (!mRes.ok) throw new Error(`Media Upload failed: ${mRes.status}`);
        const mData = await mRes.json() as any;
        if (mData && "success" in mData && mData.success) {
          uploadedMedia.push({ 
            photo_url: mData.url, 
            media_type: item.type,
            description: "Preventive Documentation" 
          });
        }
      }

      // 3. Save to DB
      const dbPayload = {
        ...renderData,
        technical_json: JSON.stringify(renderData, (_, v) => typeof v === 'bigint' ? v.toString() : v), 
        pdf_report_url: pdfUrl,
        berita_acara_pdf_url: baUrl,
        engineer_signer_name: engineerName,
        photos: uploadedMedia
      };

      const dbRes = initialData 
        ? await updatePreventiveActivity(initialData.id, dbPayload) as any
        : await createPreventiveActivity(dbPayload) as any;

      if (dbRes && "success" in dbRes && dbRes.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          setSuccess(true);
        }
      } else {
        alert("Database Error: " + ((dbRes as any).error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  // --- SUCCESS SCREEN ---
  if (success || isQueued) {
    return (
      <div className="min-h-screen bg-[#003366] flex flex-col justify-center items-center p-6 text-white text-center">
        <div className={`w-24 h-24 ${isQueued ? 'bg-orange-500' : 'bg-emerald-500'} rounded-full flex items-center justify-center mb-6 animate-bounce`}>
          {isQueued ? <WifiOff size={48} /> : <CheckCircle2 size={48} />}
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          {isQueued ? "Queued Offline!" : "Preventive Submitted!"}
        </h1>
        <p className="text-blue-200 mb-8 max-w-sm font-medium">
          {isQueued
            ? "Koneksi mati. Checksheet Anda telah disimpan di HP dan akan otomatis terkirim saat internet kembali aktif."
            : "Maintenance Checksheet & PDF dokumen berlogo telah berhasil digenerate dan dikirim ke server."}
        </p>
        <button onClick={() => router.push(`/unit/${unit.qr_code_token}`)} className="px-8 py-4 bg-white text-[#003366] font-black rounded-2xl uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl">
          Kembali ke Passport
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">

      {/* HEADER */}
      <div className="bg-[#003366] text-white p-6 rounded-b-[2rem] shadow-lg mb-6 pt-12 sticky top-0 z-40">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
          <Wrench size={22} /> Maintenance Checksheet FCU/AHU
        </h1>
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm font-medium opacity-80 flex items-center gap-1"><MapPin size={14} /> {unit.area}</p>
          <span className="px-3 py-1 bg-[#00a1e4] rounded-lg text-xs font-black uppercase tracking-widest">Step {step} / 4</span>
        </div>
        <div className="w-full bg-slate-800 h-2 mt-4 rounded-full overflow-hidden">
          <div className="bg-[#00a1e4] h-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto">
        <AnimatePresence mode="wait">

          {/* STEP 1: HEADER INFO & ENGINEER */}
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">Informasi Unit & Engineer</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Service Engineer*</label>
                    <input type="text" value={engineerName} onChange={e => setEngineerName(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00a1e4]" placeholder="Masukkan Nama Lengkap" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal</label>
                      <input type="date" value={header.date} onChange={e => setHeader({ ...header, date: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Visit Ke-</label>
                      <input type="number" value={header.visit} onChange={e => setHeader({ ...header, visit: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">SO #</label>
                      <input type="text" value={header.so_number} onChange={e => setHeader({ ...header, so_number: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nominal Capacity</label>
                      <input type="text" value={header.nominal_capacity} onChange={e => setHeader({ ...header, nominal_capacity: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="e.g. 11 kW" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Team OPT</label>
                    <input type="text" value={header.team_opt} onChange={e => setHeader({ ...header, team_opt: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Nama Tim / Personel" />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-3">Status Servis Unit</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                         onClick={() => { setServiceStatus("SERVICED"); setNoServiceReason(""); }}
                         className={`p-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${serviceStatus === 'SERVICED' ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                       >
                         Serviced
                       </button>
                       <button 
                         onClick={() => setServiceStatus("NOT_SERVICED")}
                         className={`p-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${serviceStatus === 'NOT_SERVICED' ? 'bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                       >
                         Not Serviced
                       </button>
                    </div>

                    {serviceStatus === "NOT_SERVICED" && (
                       <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Alasan Unit Tidak Dapat Dicek*</label>
                          <select 
                            value={noServiceReason} 
                            onChange={(e) => setNoServiceReason(e.target.value)}
                            className="w-full p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold text-rose-700 focus:ring-2 focus:ring-rose-400"
                          >
                             <option value="">-- Pilih Alasan --</option>
                             {NO_SERVICE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                       </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto-filled unit info card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-2">DATA UNIT (OTOMATIS)</p>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                  <div><span className="text-slate-400">Project:</span> {header.project}</div>
                  <div><span className="text-slate-400">Model:</span> {header.model}</div>
                  <div><span className="text-slate-400">S/N:</span> {header.serial_number}</div>
                  <div><span className="text-slate-400">Unit #:</span> {header.unit_number}</div>
                  <div><span className="text-slate-400">Lokasi:</span> {header.location}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SCOPE OF WORK (Before/After Table) */}
          {step === 2 && (
            <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h2 className="text-lg font-black text-[#003366]">Scope of Work</h2>
                  <div className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold uppercase">Measurement</div>
                </div>

                {/* Measurement rows */}
                {SCOPE_ROWS.filter(r => r.type === "measure").map((row) => (
                  <div key={row.key} className="mb-4 pb-3 border-b border-slate-100 last:border-0">
                    <label className="text-xs font-black text-slate-700 mb-2 block">{row.label}</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Before</p>
                        <input type="text" value={scope[row.key].before} onChange={e => updateScope(row.key, "before", e.target.value)} className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-center focus:ring-amber-400" placeholder="-" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">After</p>
                        <input type="text" value={scope[row.key].after} onChange={e => updateScope(row.key, "after", e.target.value)} className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-center focus:ring-emerald-400" placeholder="-" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Margin / Result</p>
                        <input type="text" value={scope[row.key].remarks} onChange={e => updateScope(row.key, "remarks", e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center" placeholder="Δ Margin" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: ACTION ITEMS + PARTS */}
          {step === 3 && (
            <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h2 className="text-lg font-black text-[#003366]">Action Items</h2>
                  <div className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold uppercase">Checklist</div>
                </div>

                {SCOPE_ROWS.filter(r => r.type === "action").map((row) => (
                  <div key={row.key} className="mb-4 pb-3 border-b border-slate-100 last:border-0">
                    <label className="text-xs font-black text-slate-700 mb-2 block">{row.label}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={scope[row.key].done} onChange={e => updateScope(row.key, "done", e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-[#00a1e4]">
                        <option value="">-- Pilih --</option>
                        <option value="Done">✅ Done</option>
                        <option value="N/A">⬜ N/A</option>
                        <option value="Not Done">❌ Not Done</option>
                        <option value="Replaced">🔄 Replaced</option>
                      </select>
                      <input type="text" placeholder="Finding / Temuan" value={scope[row.key].remarks} onChange={e => updateScope(row.key, "remarks", e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">Parts & Components</h2>
                {PARTS_ROWS.map((row) => (
                  <div key={row.key} className="mb-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">{row.label}</label>
                    <input type="text" value={parts[row.key]} onChange={e => setParts({ ...parts, [row.key]: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="e.g. SPB 1375 x2 / N/A" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: TECHNICAL ADVICE, PHOTOS, SIGNATURES */}
          {step === 4 && (
            <motion.div key="s4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">Technical Advice</h2>
                <textarea rows={4} placeholder="Masukkan saran teknis atau catatan servis..." value={technicalAdvice} onChange={e => setTechnicalAdvice(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00a1e4]" />
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">Tanda Tangan Digital</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Nama Customer</label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Nama perwakilan" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Tanggal TTD</label>
                    <input type="date" value={header.date} readOnly className="w-full mt-1 p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-black uppercase text-slate-500 mb-2 flex justify-between">
                  <span>Dokumentasi Media</span>
                  <span className="text-[#00a1e4]">{mediaItems.length}/10</span>
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {mediaItems.map((item, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 flex items-center justify-center">
                      {item.type === "video" ? (
                        <>
                          <video src={item.preview} className="w-full h-full object-cover opacity-50" muted />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <Play size={20} className="text-white fill-white" />
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
                  <AlertCircle size={14} className="shrink-0" />
                  Media otomatis di-optimasi. Video akan terkompresi secara otomatis di server.
                </p>
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

      {/* FIXED BOTTOM NAV */}
      <div className="fixed bottom-0 inset-x-0 p-5 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-lg mx-auto flex justify-between gap-4">
          {step > 1 ? (
            <button 
              onClick={() => {
                if (step === 4 && serviceStatus === "NOT_SERVICED") {
                   setStep(1);
                } else {
                   setStep(step - 1);
                }
              }} 
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest"
            >
              <ChevronLeft size={16} /> Mundur
            </button>
          ) : <div className="flex-1"></div>}

          {step < 4 ? (
            <button 
              onClick={() => {
                if (step === 1 && serviceStatus === "NOT_SERVICED" && !noServiceReason) {
                   alert("Mohon pilih alasan unit tidak dapat dicek!");
                   return;
                }
                // If not serviced, skip steps 2 and 3 and go straight to step 4 (Advice & Photos)
                if (step === 1 && serviceStatus === "NOT_SERVICED") {
                   setStep(4);
                } else {
                   setStep(step + 1);
                }
              }} 
              className="flex-1 py-4 bg-[#00a1e4] text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#008cc6] transition-colors shadow-lg shadow-blue-200 uppercase text-xs tracking-widest"
            >
              Lanjut <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-4 bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 uppercase text-xs tracking-widest disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Printer size={18} />}
              {loading ? "Generating..." : "Generate PDF & Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
