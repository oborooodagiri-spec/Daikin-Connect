"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { createCorrectiveActivity } from "@/app/actions/corrective";
import { savePendingSubmission } from "@/lib/offline-db";
import {
  ChevronRight, ChevronLeft, Camera, CheckCircle2,
  AlertCircle, MapPin, X, Printer, AlertTriangle,
  User, Phone, Building2, Mail, Calendar, WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CorrectiveFormClient({ unit }: { unit: any }) {
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

  // Step 1: Personnel & Schedule
  const [personnel, setPersonnel] = useState({
    name: "",
    position: "",
    email: "",
    wo_number: "",
    service_date: new Date().toISOString().split("T")[0],
    visit: "1",
  });

  // Step 2: PIC Contact
  const [pic, setPic] = useState({
    name: "",
    phone: "",
    email: "",
    department: "",
  });

  // Step 3: Analysis & Corrective Action
  const [analysis, setAnalysis] = useState({
    complain: "",
    root_cause: "",
    temp_action: "",
    perm_action: "",
    recommendation: "",
  });

  // Step 4: Photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [engineerNote, setEngineerNote] = useState("");

  // Photo handling
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 10) { alert("Maksimal 10 foto!"); return; }

    setLoading(true);
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
    for (const f of files) {
      try {
        const compressed = await imageCompression(f, options);
        setPhotos(prev => [...prev, compressed]);
        setPhotoPreviews(prev => [...prev, URL.createObjectURL(compressed)]);
      } catch (err) { console.error(err); }
    }
    setLoading(false);
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Build render data for PDF
  const renderData = { personnel, pic, analysis, engineerNote, unit };

  // Submit
  const handleSubmit = async () => {
    if (!personnel.name) { alert("Nama Teknisi wajib diisi!"); setStep(1); return; }
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
          photos: photos
        });
        setIsQueued(true);
        setLoading(false);
        return;
      }

      let pdfUrl = "";

      // 1. Generate PDF
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
        measureDiv.style.position = "absolute";
        measureDiv.style.left = "-9999px";
        measureDiv.style.visibility = "hidden";
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
          pageDiv.style.position = "absolute";
          pageDiv.style.top = "-9999px";
          pageDiv.style.left = "-9999px";
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

          const canvas = await html2canvas(pageDiv, { 
            scale: 2, 
            useCORS: true, 
            windowWidth: 794,
            height: 1123 // Force A4 height in pixels
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
      }

      // 2. Upload Photos
      const uploadedPhotos: { photo_url: string; description: string }[] = [];
      for (const p of photos) {
        const pForm = new FormData();
        pForm.append("file", p);
        pForm.append("folder", "photos");
        const pRes = await fetch("/api/upload", { method: "POST", body: pForm });
        if (!pRes.ok) {
          const errorText = await pRes.text();
          console.error("Photo Upload Failed:", errorText);
          throw new Error(`Photo Upload failed: ${pRes.status} ${pRes.statusText}`);
        }
        const pData = await pRes.json();
        if (pData.success) uploadedPhotos.push({ photo_url: pData.url, description: "Corrective Documentation" });
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
        photos: uploadedPhotos,
      };

      const dbRes = await createCorrectiveActivity(dbPayload) as any;
      if (dbRes.success) {
        setSuccess(true);
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
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Jabatan / Posisi</label>
                      <input type="text" value={personnel.position} onChange={e => setPersonnel({ ...personnel, position: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Contoh: Supervisor" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                      <input type="email" value={personnel.email} onChange={e => setPersonnel({ ...personnel, email: e.target.value })} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="alamat@email.com" />
                    </div>
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
                  <span className="text-rose-500">{photos.length}/10</span>
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={src} alt={`Photo ${i}`} className="w-full h-full object-cover" />
                      <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {photos.length < 10 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-400 cursor-pointer transition-colors">
                      <Camera size={24} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Tambah</span>
                      <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-amber-600 font-bold flex items-start gap-1">
                  <AlertCircle size={14} className="shrink-0" />
                  Foto otomatis di-compress menjadi &lt;500KB. Maksimal 10 foto.
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
