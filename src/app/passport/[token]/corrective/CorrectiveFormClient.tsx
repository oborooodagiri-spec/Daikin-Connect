"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { createCorrectiveActivity, updateCorrectiveActivity } from "@/app/actions/corrective";
import { savePendingSubmission } from "@/lib/offline-db";
import {
  ChevronRight, ChevronLeft, Camera, CheckCircle2,
  AlertCircle, MapPin, X, Printer, AlertTriangle,
  User, Phone, Building2, Mail, Calendar, WifiOff,
  FileVideo, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CorrectiveFormClient({ unit, lastPreventiveDate, initialData, onSuccess }: { unit: any, lastPreventiveDate?: string | null, initialData?: any, onSuccess?: () => void }) {
  const router = useRouter();
  const pdfRef = useRef<HTMLDivElement>(null);
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

  // Step 1: Personnel & Schedule
  const [personnel, setPersonnel] = useState(parsed?.personnel || {
    name: initialData?.inspector_name || "",
    position: "",
    email: "",
    wo_number: "",
    service_date: new Date().toISOString().split("T")[0],
    service_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':'),
    visit: "1",
  });

  // Step 2: PIC Contact
  const [pic, setPic] = useState(parsed?.pic || {
    name: "",
    phone: "",
    email: "",
    department: "",
  });

  // Step 3: Analysis & Corrective Action
  const [analysis, setAnalysis] = useState(parsed?.analysis || {
    complain: initialData?.case_complain || "",
    root_cause: initialData?.root_cause || "",
    temp_action: initialData?.temp_action || "",
    perm_action: initialData?.perm_action || "",
    recommendation: initialData?.recommendation || "",
  });

  // Media (Photos & Videos)
  const [mediaItems, setMediaItems] = useState<{file: File | null, type: "image" | "video", preview: string}[]>(
    initialData?.activity_photos?.map((p: any) => ({
      file: null,
      type: p.media_type || "image",
      preview: p.photo_url
    })) || []
  );
  const [engineerNote, setEngineerNote] = useState(parsed?.engineerNote || initialData?.engineer_note || "");

  // New fields for Summary Report
  const [category, setCategory] = useState(parsed?.category || "");
  const [currentStatus, setCurrentStatus] = useState(parsed?.currentStatus || "Problem");

  const COMPLAINT_CATEGORIES = [
    "Kebocoran (Leakage)",
    "Non AC (Keluhan non-teknis)",
    "AC Noise (Berisik)",
    "AC Mati (Power Issue)",
    "Lainnya"
  ];

  // Media Handling (Photos & Videos)
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
          const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
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

  // Build render data for PDF
  const renderData = { 
    personnel, 
    pic, 
    analysis, 
    engineerNote, 
    unit, 
    category, 
    currentStatus, 
    lastPreventiveDate 
  };

  // Submit
  const handleSubmit = async () => {
    if (!personnel.name) { alert("Nama Teknisi wajib diisi!"); setStep(1); return; }
    if (!category) { alert("Kategori Komplain wajib dipilih!"); setStep(3); return; }
    if (!analysis.complain) { alert("Keluhan/Case wajib diisi!"); setStep(3); return; }
    setLoading(true);
    try {
      // --- OFFLINE CHECK ---
      if (!navigator.onLine) {
        await savePendingSubmission({
          type: 'CORRECTIVE',
          data: {
            unit_id: unit.id,
            inspector_name: personnel.name,
            engineer_note: engineerNote,
            unit_tag: unit.tag_number || "",
            location: unit.area || "",
            technician_name: personnel.name,
            case_complain: analysis.complain,
            root_cause: analysis.root_cause,
            temp_action: analysis.temp_action,
            perm_action: analysis.perm_action,
            recommendation: analysis.recommendation,
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
      
      // 1. Generate PDF (TECH REPORT)
      if (pdfRef.current) {
        pdfRef.current.style.display = "block";
        
        // --- NEW TRUE PAGINATION LOGIC ---
        const A4_HEIGHT_MM = 297;
        const SAFE_CONTENT_MM = 215; // Safe area excluding header/footer gaps
        const PX_PER_MM = 3.78; // Standard 96dpi approx
        const SAFE_PX = SAFE_CONTENT_MM * PX_PER_MM;

        // Get sections
        const { getCorrectiveSections } = await import("@/components/CorrectivePDFTemplate");
        const sections = getCorrectiveSections(renderData, unit);

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
          
          // We need to wait for render to measure
          await new Promise<void>((resolve) => {
            root.render(section);
            setTimeout(resolve, 50); // Small delay for layout
          });

          const sectionHeight = tempWrap.offsetHeight;
          
          // Check if this section (especially Signatures) should be moved
          const isSignSection = section.key === "sign";
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
                reportTitle="CORRECTIVE MAINTENANCE REPORT" 
                reportCode={renderData.personnel?.wo_number || `CR-${unit.id}`} 
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
            setTimeout(resolve, 200); // Wait for images
          });

          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          const canvas = await html2canvas(pageDiv, { 
            scale: isMobile ? 1.5 : 2, 
            useCORS: true, 
            windowWidth: 794,
            height: 1123, // Force A4 height in pixels
            logging: false
          });

          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, A4_HEIGHT_MM);

          root.unmount();
          document.body.removeChild(pageDiv);
        }

        const pdfBlob = pdf.output("blob");
        const pdfFormData = new FormData();
        pdfFormData.append("file", new File([pdfBlob], `${unit.tag_number}_Corrective_${Date.now()}.pdf`, { type: "application/pdf" }));
        pdfFormData.append("folder", "corrective");

        const pdfRes = await fetch("/api/upload", { method: "POST", body: pdfFormData });
        if (!pdfRes.ok) {
          const errorText = await pdfRes.text();
          console.error("PDF Upload Failed:", errorText);
          throw new Error(`PDF Upload failed: ${pdfRes.status} ${pdfRes.statusText}`);
        }
        const pdfData = await pdfRes.json();
        if (pdfData.success) pdfUrl = pdfData.url;

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
            <ReportBase reportTitle="BERITA ACARA PEKERJAAN" reportCode={`BA-CR-${unit.id}-${Date.now()}`} unit={unit}>
              <BeritaAcaraPDFTemplate 
                data={{ ...renderData, engineer_note: engineerNote, type: "Corrective Maintenance" }} 
                unit={unit} 
                engineerName={personnel.name} 
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
          const baData = await baRes.json();
          if (baData.success) baUrl = baData.url;
        }

        baRoot.unmount();
        document.body.removeChild(baDiv);
      }

      // 2. Upload Media (Photos & Videos)
      const uploadedMedia: { photo_url: string; description: string; media_type: string }[] = [];
      for (const item of mediaItems) {
        if (!item.file) {
          uploadedMedia.push({
            photo_url: item.preview,
            media_type: item.type,
            description: "Corrective Documentation"
          });
          continue;
        }

        const mForm = new FormData();
        mForm.append("file", item.file);
        mForm.append("folder", "corrective");
        
        const mRes = await fetch("/api/upload", { method: "POST", body: mForm });
        if (!mRes.ok) throw new Error(`Media Upload failed: ${mRes.status}`);
        const mData = await mRes.json();
        if (mData.success) {
          uploadedMedia.push({ 
            photo_url: mData.url, 
            media_type: item.type,
            description: "Corrective Documentation" 
          });
        }
      }

      // 3. Save to DB
      const dbPayload = {
        unit_id: unit.id,
        inspector_name: personnel.name,
        engineer_note: engineerNote,
        unit_tag: unit.tag_number || "",
        location: unit.area || "",
        technician_name: personnel.name,
        case_complain: analysis.complain,
        root_cause: analysis.root_cause,
        temp_action: analysis.temp_action,
        perm_action: analysis.perm_action,
        recommendation: analysis.recommendation,
        technical_json: JSON.stringify(renderData, (_, v) => typeof v === 'bigint' ? v.toString() : v),
        pdf_report_url: pdfUrl,
        berita_acara_pdf_url: baUrl,
        engineer_signer_name: personnel.name,
        photos: uploadedMedia,
      };

      const dbRes = initialData 
        ? await updateCorrectiveActivity(initialData.id, dbPayload) as any
        : await createCorrectiveActivity(dbPayload) as any;

      if (dbRes.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          setSuccess(true);
        }
      } else {
        alert("Database Error: " + dbRes.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  // Success screen
  if (success || isQueued) {
    return (
      <div className="min-h-screen bg-[#003366] flex flex-col justify-center items-center p-6 text-white text-center">
        <div className={`w-24 h-24 ${isQueued ? 'bg-orange-500' : 'bg-rose-500'} rounded-full flex items-center justify-center mb-6 animate-bounce`}>
          {isQueued ? <WifiOff size={48} /> : <CheckCircle2 size={48} />}
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          {isQueued ? "Queued Offline!" : "Corrective Submitted!"}
        </h1>
        <p className="text-blue-200 mb-8 max-w-sm font-medium">
          {isQueued
            ? "Koneksi mati. Laporan Perbaikan telah disimpan di HP dan akan otomatis terkirim saat internet kembali aktif."
            : "Laporan Corrective Maintenance & PDF telah di-generate dan dikirim ke server. Status unit diubah ke Problem."}
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
      <div className="bg-gradient-to-br from-rose-700 to-rose-900 text-white p-6 rounded-b-[2rem] shadow-lg mb-6 pt-12 sticky top-0 z-40">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
          <AlertTriangle size={22} /> Corrective Maintenance
        </h1>
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm font-medium opacity-80 flex items-center gap-1"><MapPin size={14} /> {unit.area} — {unit.tag_number}</p>
          <span className="px-3 py-1 bg-rose-500/50 rounded-lg text-xs font-black uppercase tracking-widest">Step {step}/4</span>
        </div>
        <div className="w-full bg-rose-950 h-2 mt-4 rounded-full overflow-hidden">
          <div className="bg-white h-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto">
        <AnimatePresence mode="wait">

          {/* STEP 1: PERSONNEL & SCHEDULE */}
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-rose-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <User size={20} /> Personnel & Schedule
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Lengkap*</label>
                    <input type="text" value={personnel.name} onChange={e => setPersonnel({ ...personnel, name: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00a1e4]" placeholder="Contoh: Nama Terang" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Servis</label>
                      <input type="date" value={personnel.service_date} onChange={e => setPersonnel({ ...personnel, service_date: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Jam (WIB)</label>
                      <input type="time" value={personnel.service_time} onChange={e => setPersonnel({ ...personnel, service_time: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">Terakhir Preventive Maintenance</label>
                    <input type="text" value={lastPreventiveDate ? new Date(lastPreventiveDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Belum Pernah"} readOnly className="w-full mt-1 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-bold text-blue-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Work Order (WO)</label>
                    <input type="text" value={personnel.wo_number} onChange={e => setPersonnel({ ...personnel, wo_number: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Masukkan No. WO" />
                  </div>
                </div>
              </div>

              {/* Auto-filled unit card */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-2xl border border-rose-100">
                <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-2">UNIT DATA (AUTO)</p>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                  <div><span className="text-slate-400">Tag:</span> {unit.tag_number}</div>
                  <div><span className="text-slate-400">Brand:</span> {unit.brand}</div>
                  <div><span className="text-slate-400">Model:</span> {unit.model}</div>
                  <div><span className="text-slate-400">S/N:</span> {unit.serial_number || "-"}</div>
                  <div><span className="text-slate-400">Area:</span> {unit.area}</div>
                  <div><span className="text-slate-400">Floor:</span> {unit.building_floor}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PIC CONTACT */}
          {step === 2 && (
            <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-rose-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <Phone size={20} /> PIC Contact <span className="text-slate-400 text-sm font-medium">(Perwakilan Customer)</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap PIC</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={pic.name} onChange={e => setPic({ ...pic, name: e.target.value })}
                        className="w-full mt-1 pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Nama PIC" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">No. HP / WhatsApp</label>
                      <input type="tel" value={pic.phone} onChange={e => setPic({ ...pic, phone: e.target.value })}
                        className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="08xx-xxxx-xxxx" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                      <input type="email" value={pic.email} onChange={e => setPic({ ...pic, email: e.target.value })}
                        className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="email@domain.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Department / Bagian</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={pic.department} onChange={e => setPic({ ...pic, department: e.target.value })}
                        className="w-full mt-1 pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Contoh: Building Management" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ANALYSIS & CORRECTIVE ACTION */}
          {step === 3 && (
            <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-rose-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <AlertTriangle size={20} /> Analysis & Corrective Action
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-rose-500 uppercase tracking-widest block mb-1">Kategori Komplain*</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold text-rose-700"
                    >
                       <option value="">-- Pilih Kategori --</option>
                       {COMPLAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Status Unit Saat Ini*</label>
                    <div className="grid grid-cols-2 gap-2">
                       {["Normal", "Warning", "Critical", "Problem"].map(s => (
                         <button 
                           key={s} 
                           onClick={() => setCurrentStatus(s)}
                           className={`p-2 rounded-lg text-[10px] font-black uppercase border transition-all ${currentStatus === s ? 'bg-rose-600 text-white border-rose-700' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deskripsi Keluhan / Case*</label>
                    <textarea rows={3} value={analysis.complain} onChange={e => setAnalysis({ ...analysis, complain: e.target.value })} className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00a1e4]" placeholder="Jelaskan keluhan unit atau kronologi masalah..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Akar Masalah (Root Cause)</label>
                    <textarea rows={3} value={analysis.root_cause} onChange={e => setAnalysis({ ...analysis, root_cause: e.target.value })} className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00a1e4]" placeholder="Analisis penyebab kerusakan..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tindakan Sementara (Temporary Action)</label>
                    <textarea rows={3} value={analysis.temp_action} onChange={e => setAnalysis({ ...analysis, temp_action: e.target.value })} className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00a1e4]" placeholder="Langkah perbaikan sementara yang dilakukan..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Permanent Action</label>
                    <textarea rows={2} value={analysis.perm_action} onChange={e => setAnalysis({ ...analysis, perm_action: e.target.value })}
                      className="w-full mt-1 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-400"
                      placeholder="Solusi permanen untuk mencegah terulang..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saran / Rekomendasi (Advise)</label>
                    <textarea rows={3} value={analysis.recommendation} onChange={e => setAnalysis({ ...analysis, recommendation: e.target.value })} className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00a1e4]" placeholder="Saran perbaikan permanen untuk pelanggan..." />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: DOCUMENTATION & PHOTOS */}
          {step === 4 && (
            <motion.div key="s4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">Catatan Tambahan</h2>
                <textarea rows={4} placeholder="Catatan servis lainnya..." value={engineerNote} onChange={e => setEngineerNote(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00a1e4]" />
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-black uppercase text-slate-500 mb-2 flex justify-between">
                  <span>Dokumentasi Foto</span>
                  <span className="text-rose-500">{mediaItems.length}/10</span>
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
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-400 cursor-pointer transition-colors">
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

              {/* HIDDEN PDF */}
              {/* Preview with Real Pagination logic is complex, for now we show a "Ready to Print" state or a simplified version */}
              <div className="text-center p-10 bg-white rounded-xl shadow-2xl">
                <Printer className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800">Laporan Siap Dibuat</h3>
                <p className="text-slate-500 text-sm">Laporan akan secara otomatis dibagi menjadi halaman-halaman profesional saat tombol "Selesai & Simpan" diklik.</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* FIXED BOTTOM NAV */}
      <div className="fixed bottom-0 inset-x-0 p-5 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-lg mx-auto flex justify-between gap-4">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest">
              <ChevronLeft size={16} /> Mundur
            </button>
          ) : <div className="flex-1"></div>}

          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 uppercase text-xs tracking-widest">
              Lanjut <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-4 bg-rose-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 uppercase text-xs tracking-widest disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Printer size={18} />}
              {loading ? "Generating..." : "Generate PDF & Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
