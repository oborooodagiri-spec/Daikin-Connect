"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, MapPin, Clock, CheckCircle2, 
  ChevronRight, Loader2, X, Calendar,
  ChevronLeft, MoreVertical, Fingerprint, AlertCircle
} from "lucide-react";
import { getActiveAttendance, submitCheckIn, submitCheckOut } from "@/app/actions/attendance";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import * as faceapi from "face-api.js";

export default function AttendanceClient({ 
  projectId, 
  onProjectLocked 
}: { 
  projectId: string,
  onProjectLocked?: (id: string) => void
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; long: number; isFallback?: boolean; city?: string } | null>(null);
  const [locError, setLocError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [hasFace, setHasFace] = useState(true);
  const [projectLocation, setProjectLocation] = useState<{ name: string; lat: number; long: number; radius: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  
  const [showScanner, setShowScanner] = useState(false);
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAction, setLastAction] = useState<"in" | "out" | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [referenceDescriptor, setReferenceDescriptor] = useState<Float32Array | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isProcessingRef = useRef(false);
  
  useEffect(() => {
    setIsMounted(true);
    loadModelsAndReference();
    startLocationTracking();
    return () => stopCamera();
  }, [projectId]);

  const loadModelsAndReference = async () => {
    try {
      if (!modelsLoaded) {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models")
        ]);
        setModelsLoaded(true);
      }
      
      const res = await getActiveAttendance(projectId);
      setActiveRecord(res?.data || null);
      if (res?.data) {
        if (onProjectLocked && String(res.data.project_id) !== projectId) {
          onProjectLocked(String(res.data.project_id));
        }
      }
      setHasFace(res?.hasFace ?? true);
      if (res?.projectLocation) {
        setProjectLocation(res.projectLocation);
      }

      if (res?.faceUrl) {
        const img = await faceapi.fetchImage(res.faceUrl);
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if (detection) {
          setReferenceDescriptor(detection.descriptor);
        }
      }
    } catch (e: any) {
      console.error("Biometric init error (skipping client-side check):", e);
      // We don't set errorMsg here to allow fallback to manual photo
      setModelsLoaded(false); 
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startScanner = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Browser does not support Live Scanner.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          resizeMode: "none"
        },
        audio: false
      });
      setShowScanner(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
    } catch (err) {
      // Fallback to standard request if 4K ideal fails for some reason
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        setShowScanner(true);
        if (videoRef.current) videoRef.current.srcObject = fallbackStream;
      } catch (e) {
        setErrorMsg("Gagal mengakses kamera: " + (err as Error).message);
      }
    }
  };

  useEffect(() => {
    if (showScanner && videoRef.current && !videoRef.current.srcObject) {
       startScanner();
    }
  }, [showScanner]);

  const startLocationTracking = (useHighAccuracy = true) => {
    if (!navigator.geolocation) {
      fallbackToNetwork("GPS not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, long: pos.coords.longitude, isFallback: false });
        setLocError("");
      },
      (err) => {
        if (useHighAccuracy && (err.code === 2 || err.code === 3)) {
          startLocationTracking(false);
        } else {
          fallbackToNetwork("GPS Signal Unavailable.");
        }
      },
      { enableHighAccuracy: useHighAccuracy, timeout: 10000, maximumAge: 10000 }
    );
  };

  const fallbackToNetwork = async (reasonMsg: string) => {
    try {
      setLocError(reasonMsg);
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setLocation({ lat: parseFloat(data.latitude), long: parseFloat(data.longitude), isFallback: true, city: data.city });
        setLocError("");
      } else {
        setLocError("Mohon izinkan akses lokasi (GPS) di browser Anda.");
      }
    } catch (e) {
      setLocError("Mohon izinkan akses lokasi (GPS) di browser Anda.");
    }
  };

  useEffect(() => {
    if (location && projectLocation && projectLocation.lat && projectLocation.long) {
       const d = calculateDistance(location.lat, location.long, projectLocation.lat, projectLocation.long);
       setDistance(d);
    } else {
       setDistance(null);
    }
  }, [location, projectLocation]);

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  }

  const compressAndUploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "attendance");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url || null;
    } catch (e) { return null; }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Scale down image to prevent face-api.js from hanging on 4K mobile streams
      const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            setCapturedFile(new File([blob], "live_capture.jpg", { type: "image/jpeg" }));
          }
        }, "image/jpeg", 0.7);
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (submitting || isProcessingRef.current) {
      console.warn("Submission blocked: Already processing.");
      return;
    }
    
    if (!capturedFile) {
       captureFrame();
       return;
    }
    await processFile(capturedFile);
  };

  // Trigger process when capturedFile is set via handleFinalSubmit
  useEffect(() => {
     if (capturedFile && showScanner) {
        processFile(capturedFile);
     }
  }, [capturedFile]);

  const processFile = async (file: File) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setErrorMsg(null);
    if (!location) { setErrorMsg("Lokasi diperlukan."); isProcessingRef.current = false; return; }
    setSubmitting(true);
    setVerifying(true);
    setCapturedFile(null); // Clear immediately
    try {
      // If models are loaded, try client-side detection as an enhancement
      if (modelsLoaded) {
        try {
          const img = await faceapi.bufferToImage(file);
          const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          
          if (!detection) {
            throw new Error("Wajah tidak terdeteksi. Pastikan wajah terlihat jelas.");
          }

          if (referenceDescriptor) {
            const distance = faceapi.euclideanDistance(referenceDescriptor, detection.descriptor);
            if (distance > 0.6) {
              throw new Error("Wajah tidak sesuai dengan referensi.");
            }
          }
        } catch (faceErr: any) {
          console.warn("Client-side face check skipped/failed:", faceErr.message);
          // We continue anyway and let the server (Gemini) handle verification
        }
      }
      
      // Proceed with upload regardless of client-side check success
      // Server will verify with Gemini
      const photoUrl = await compressAndUploadFile(file);
      if (!photoUrl) throw new Error("Gagal mengunggah foto.");

      if (!activeRecord) {
        const res = await submitCheckIn({ projectId, lat: location.lat, long: location.long, photoUrl, notes });
        if (res.error) throw new Error(res.error);
        setLastAction("in");
      } else {
        const res = await submitCheckOut({ attendanceId: activeRecord.id, lat: location.lat, long: location.long, photoUrl, notes });
        if (res.error) throw new Error(res.error);
        setLastAction("out");
      }
      
      setShowScanner(false);
      stopCamera();
      setShowSuccess(true);
      
      // Force reload active record to prevent double actions
      const refreshRes = await getActiveAttendance(projectId);
      if (refreshRes?.data) setActiveRecord(refreshRes.data);
      
      await loadModelsAndReference();
    } catch (error: any) {
      console.error("Process error:", error);
      setErrorMsg(error.message || "Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
      setVerifying(false);
      setCapturedFile(null);
      isProcessingRef.current = false;
    }
  };

  const triggerCamera = () => {
    if (!location) { setErrorMsg("Lokasi belum terdeteksi. Pastikan GPS aktif."); startLocationTracking(); return; }
    setErrorMsg(null);
    setCapturedFile(null);
    
    const isOutside = distance !== null && projectLocation?.lat && distance > (projectLocation.radius || 100);
    const outsideNote = isOutside ? `[DI LUAR AREA: ${Math.round(distance!)}m] ` : "";
    setNotes(outsideNote);
    
    startScanner();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
         <button onClick={() => setShowSuccess(false)} className="absolute top-6 left-6 text-slate-400">
            <X size={28} />
         </button>
         <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-200">
               <CheckCircle2 size={64} />
            </div>
         </div>
         <h2 className="text-2xl font-black text-slate-800 mb-6">Jam {lastAction === "in" ? "masuk" : "keluar"} berhasil</h2>
         <div className="space-y-1 mb-10 text-slate-500">
            <p className="text-sm font-bold">Jadwal: {format(new Date(), "dd MMM yyyy")}</p>
            <p className="text-sm font-bold">Officer</p>
         </div>
         <div className="text-5xl font-black text-slate-800 mb-10">{format(new Date(), "HH:mm")}</div>
         <p className="text-emerald-600 font-bold text-sm mb-12 flex items-center justify-center gap-2">Verifikasi wajah berhasil</p>
         <div className="w-full space-y-4">
            <button onClick={() => window.location.href = "/home"} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">Kembali ke beranda</button>
         </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-black text-xs tracking-widest uppercase animate-pulse">Memuat Sistem Biometrik...</p>
      </div>
    );
  }

  const isWorking = activeRecord && !activeRecord.check_out_time;
  const currentTime = new Date();

  if (!isMounted) return <div className="min-h-[400px]" />;

  return (
    <div className="max-w-md mx-auto w-full px-4 py-6">
       <div className={`mb-6 p-4 rounded-3xl border flex items-center justify-between
          ${!location ? 'bg-rose-50 border-rose-100' : (distance !== null && projectLocation && distance <= (projectLocation.radius || 100) ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100')}`}>
          <div className="flex items-center gap-3">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
                ${!location ? 'bg-rose-100 text-rose-600' : (distance !== null && projectLocation && distance <= (projectLocation.radius || 100) ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600')}`}>
                {!location ? <Loader2 className="animate-spin" /> : <MapPin size={24} />}
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Status Lokasi</p>
                <p className="text-sm font-black text-slate-700">
                   {!location ? (locError ? locError : 'Mendeteksi GPS...') : (distance !== null && projectLocation && distance <= (projectLocation.radius || 100) ? 'Di Dalam Area Proyek' : 'Di Luar Area Proyek')}
                </p>
             </div>
          </div>
          {location && distance !== null && (
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Jarak</p>
                <p className="text-sm font-black text-slate-700">{Math.round(distance)}m</p>
             </div>
          )}
       </div>

       {errorMsg && !showScanner && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm">
             <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
             <p className="text-xs font-semibold text-rose-700 leading-snug">{errorMsg}</p>
          </div>
       )}

       <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
             <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={40} />
             </div>
             <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{format(currentTime, "HH:mm")}</h3>
             <p className="text-slate-400 text-sm font-bold mb-8">{format(currentTime, "EEEE, dd MMMM yyyy", { locale: id })}</p>
             {isWorking && activeRecord?.check_in_time && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 text-left">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Mulai Bekerja Pada</p>
                   <p className="text-lg font-black text-blue-600">{format(new Date(activeRecord.check_in_time), "HH:mm")}</p>
                </div>
             )}
             <button
               disabled={submitting}
               onClick={triggerCamera}
               className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isWorking ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-blue-600 text-white shadow-blue-200'}`}
             >
                {submitting ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                {isWorking ? 'Clock Out Sekarang' : 'Clock In Sekarang'}
             </button>
          </div>
       </div>

      {showScanner && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <div className="bg-[#003366] text-white p-4 flex items-center gap-4 z-20">
             <button onClick={() => { setShowScanner(false); stopCamera(); }} className="p-2"><ChevronLeft size={24} /></button>
             <h1 className="text-xl font-bold">{isWorking ? 'Clock Out' : 'Clock In'}</h1>
          </div>
          <div className="flex-1 relative flex flex-col items-center justify-center">
              {!hasFace && (
                 <div className="absolute top-28 left-6 right-6 z-30 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-400 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                       <Fingerprint size={24} />
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">Pendaftaran Wajah</p>
                       <p className="text-[11px] font-bold leading-snug">Foto ini akan didaftarkan sebagai Master Profile untuk akun Anda.</p>
                    </div>
                 </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-contain bg-black z-0 scale-x-[-1]" 
              />

              <div className="absolute top-6 left-6 right-6 z-20 space-y-3">
                 <div className={`bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border-l-4 flex justify-between items-center transition-all ${distance !== null && projectLocation?.lat && distance <= (projectLocation.radius || 100) ? 'border-emerald-500' : 'border-rose-500 animate-pulse'}`}>
                    <div>
                       <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${distance !== null && projectLocation?.lat && distance <= (projectLocation.radius || 100) ? 'text-emerald-600' : 'text-rose-600'}`}>Area Proyek</p>
                       <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <p className="text-[13px] font-black text-slate-800 truncate max-w-[150px]">
                             {projectLocation ? (projectLocation.lat ? projectLocation.name : 'Lokasi Proyek Belum Diset') : 'Memuat Data...'}
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest mb-0.5 text-slate-400">Status</p>
                       <p className={`text-[11px] font-black ${distance !== null && projectLocation?.lat && distance <= (projectLocation.radius || 100) ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {distance !== null && projectLocation?.lat && distance <= (projectLocation.radius || 100) ? 'Sesuai Area' : 'DI LUAR AREA'}
                       </p>
                    </div>
                 </div>

                 {distance !== null && projectLocation?.lat && distance > (projectLocation.radius || 100) && (
                    <div className="bg-rose-600 text-white rounded-xl p-3 shadow-lg flex items-center gap-3 animate-bounce">
                       <AlertCircle size={18} className="shrink-0" />
                       <p className="text-[11px] font-black uppercase tracking-wider">
                          Peringatan: Anda berada {Math.round(distance)}m di luar area proyek!
                       </p>
                    </div>
                 )}

                 {errorMsg && (
                    <div className="bg-rose-50/95 backdrop-blur-md border border-rose-200 rounded-xl p-3 shadow-lg flex items-start gap-2">
                       <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                       <p className="text-[11px] font-semibold text-rose-700 leading-tight">
                          {errorMsg}
                       </p>
                    </div>
                 )}
              </div>

              <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
                <svg width="280" height="350" viewBox="0 0 280 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                   <path 
                     d="M140 40C110 40 85 65 85 95V115C85 145 110 170 140 170C170 170 195 145 195 115V95C195 65 170 40 140 40Z" 
                     stroke="white" strokeWidth="4" strokeDasharray="12 12" strokeLinecap="round"
                   />
                   <path 
                     d="M40 310C40 260 70 210 140 210C210 210 240 260 240 310" 
                     stroke="white" strokeWidth="4" strokeDasharray="12 12" strokeLinecap="round"
                   />
                   <circle cx="140" cy="115" r="4" fill="white" className="animate-pulse" />
                </svg>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-[2.5rem] p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                 <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
                 <div className="space-y-6 mb-8">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                       <MoreVertical className="text-slate-400 rotate-90" />
                       <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan (opsional)" className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-400" />
                    </div>
                 </div>
                 <button disabled={submitting || verifying} onClick={handleFinalSubmit} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3">
                    {submitting || verifying ? <Loader2 className="animate-spin" /> : 'Ambil Foto'}
                 </button>
              </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}
