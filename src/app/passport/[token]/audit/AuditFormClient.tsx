"use client";

import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { createAuditActivity } from "@/app/actions/audit";
import { 
  ChevronRight, ChevronLeft, Save, Camera, FileText,
  CheckCircle2, AlertCircle, MapPin, X, UploadCloud, Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuditFormClient({ unit }: { unit: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- FORM STATE ---
  const [formData, setFormData] = useState<any>({
    unit_id: unit.id,
    unit_tag: unit.tag_number || "",
    location: unit.area || "",
    inspector_name: "",
    engineer_note: "",
    design_airflow: "",
    design_cooling_capacity: "",
    // Air Side
    leaving_db: "", leaving_wb: "", leaving_rh: "",
    entering_db: "", entering_wb: "", entering_rh: "",
    room_db: "", room_wb: "", room_rh: "", // Fresh Air
    // Matrix
    t: {
      supplyArea: "", returnArea: "", freshArea: "",
      supplyVelocity: Array(15).fill(""),
      returnVelocity: Array(15).fill(""),
      freshVelocity: Array(15).fill(""),
      inlet: Array(6).fill("N/A"),
      outlet: Array(6).fill("N/A")
    },
    // Water & Electrical
    chws_temp: "", chwr_temp: "", chws_press: "", chwr_press: "",
    water_flow_gpm: "", pipe_size: "",
    power_kw: "",
    amp_r: "", amp_s: "", amp_t: "",
    volt_rs: "", volt_rt: "", volt_st: "", volt_ln: ""
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

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

  // Sync calculated CFMs into t object for the PDF
  const renderData = {
    ...formData,
    t: {
      ...formData.t,
      totalCfmSupply: calculateCfm(formData.t.supplyArea, avgSupply) || "-",
      totalCfmReturn: calculateCfm(formData.t.returnArea, avgReturn) || "-",
      totalCfmFresh: calculateCfm(formData.t.freshArea, avgFresh) || "-"
    }
  };

  // --- PHOTO COMPRESSION ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > 10) {
      alert("Maksimal 10 foto diperbolehkan!");
      return;
    }

    setLoading(true);
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
    const compressedFiles: File[] = [];
    const previews: string[] = [];

    for (const f of files) {
      try {
        const compressed = await imageCompression(f, options);
        compressedFiles.push(compressed);
        previews.push(URL.createObjectURL(compressed));
      } catch (err) {
         console.error(err);
      }
    }
    
    setPhotos(prev => [...prev, ...compressedFiles]);
    setPhotoPreviews(prev => [...prev, ...previews]);
    setLoading(false);
  };

  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== idx));
  };

  // --- SUBMIT PIPELINE ---
  const handleSubmit = async () => {
    if (!formData.inspector_name) { alert("Nama Inspector (General Data) wajib diisi!"); setStep(1); return; }
    setLoading(true);
    try {
      let pdfUrl = "";
      
      // 1. GENERATE PDF
      // --- NEW TRUE PAGINATION LOGIC ---
      const A4_HEIGHT_MM = 297;
      const SAFE_CONTENT_MM = 220; 
      const PX_PER_MM = 3.78; 
      const SAFE_PX = SAFE_CONTENT_MM * PX_PER_MM;

      // Get sections
      const { getAuditSections } = await import("@/components/AuditPDFTemplate");
      const sections = getAuditSections(renderData, unit);

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
          setTimeout(resolve, 200); 
        });

        const canvas = await html2canvas(pageDiv, { scale: 2, useCORS: true, windowWidth: 794, height: 1123 });
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, A4_HEIGHT_MM);

        root.unmount();
        document.body.removeChild(pageDiv);
      }

      const pdfBlob = pdf.output("blob");
        
        // Upload PDF
        const pdfFormData = new FormData();
        pdfFormData.append("file", new File([pdfBlob], `${unit.tag_number}_Audit_${Date.now()}.pdf`, { type: 'application/pdf' }));
        pdfFormData.append("folder", "audits");

        const pdfRes = await fetch('/api/upload', { method: 'POST', body: pdfFormData });
        if (!pdfRes.ok) {
          const errorText = await pdfRes.text();
          console.error("PDF Upload Failed:", errorText);
          throw new Error(`PDF Upload failed: ${pdfRes.status} ${pdfRes.statusText}`);
        }
        const pdfData = await pdfRes.json();
        if (pdfData.success) pdfUrl = pdfData.url;

      // 2. UPLOAD PHOTOS (Max 10)
      const uploadedPhotos: {photo_url: string, description: string}[] = [];
      for (const p of photos) {
        const pForm = new FormData();
        pForm.append("file", p);
        pForm.append("folder", "photos");
        const pRes = await fetch('/api/upload', { method: 'POST', body: pForm });
        if (!pRes.ok) {
          const errorText = await pRes.text();
          console.error("Photo Upload Failed:", errorText);
          throw new Error(`Photo Upload failed: ${pRes.status} ${pRes.statusText}`);
        }
        const pData = await pRes.json();
        if (pData.success) {
          uploadedPhotos.push({ photo_url: pData.url, description: "Audit Documentation" });
        }
      }

      // 3. COMPILE VELOCITY POINTS DB ARRAY
      const velocity_points: any[] = [];
      formData.t.supplyVelocity.forEach((v:any,i:number) => { if(v) velocity_points.push({ point_number: i+1, velocity_value: parseFloat(v) }) });

      // 4. SAVE TO MYSQL DB
      const dbPayload = {
        ...renderData,
        technical_json: JSON.stringify(renderData.t, (_, v) => typeof v === 'bigint' ? v.toString() : v), // Accessories and Matrix preserved
        pdf_report_url: pdfUrl,
        velocity_points,
        photos: uploadedPhotos
      };

      const dbRes = await createAuditActivity(dbPayload) as any;
      if (dbRes.success) {
        setSuccess(true);
      } else {
        alert("Database Error: " + dbRes.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error generating report: " + err.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#003366] flex flex-col justify-center items-center p-6 text-white text-center">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Audit Submitted!</h1>
        <p className="text-blue-200 mb-8 max-w-sm font-medium">Laporan ukur, penghitungan matematis, & PDF dokumen berlogo sudah berhasil digenerate dan dikirim ke server.</p>
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
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <FileText size={24}/> Form Pengukuran
        </h1>
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
                   <h2 className="text-lg font-black text-[#003366]">Air Velocity Matrix (m/s)</h2>
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
                <h2 className="text-lg font-black text-[#003366] mb-4 border-b pb-2">E. Accessories Condition</h2>
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
                    <span className="text-[#00a1e4]">{photos.length}/10</span>
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                        <img src={src} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                        <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {photos.length < 10 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-[#00a1e4] hover:bg-blue-50 hover:border-[#00a1e4] cursor-pointer transition-colors">
                        <Camera size={24} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">Tambah</span>
                        <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-600 font-bold flex items-start gap-1">
                    <AlertCircle size={14} className="shrink-0"/> 
                    Sistem akan otomatis mengecilkan (compress) ukuran foto tanpa mengurangi ketajaman resolusi.
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
    </div>
  );
}
