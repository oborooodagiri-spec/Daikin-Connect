"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, MapPin, MapPinOff, Clock, CheckCircle2, 
  ChevronRight, Loader2, Play, Square, X, Calendar,
  ChevronLeft, MoreVertical, Activity
} from "lucide-react";
import { getActiveAttendance, submitCheckIn, submitCheckOut, verifyFaceMatch } from "@/app/actions/attendance";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ShieldCheck, ShieldAlert, Fingerprint } from "lucide-react";


export default function AttendanceClient({ projectId }: { projectId: string }) {
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; long: number; isFallback?: boolean; city?: string } | null>(null);
  const [locError, setLocError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [hasFace, setHasFace] = useState(true);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [projectLocation, setProjectLocation] = useState<{ lat: number; long: number; radius: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  
  const [showScanner, setShowScanner] = useState(false);
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAction, setLastAction] = useState<"in" | "out" | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    fetchStatus();
    checkPermissionsAndTrack();
    return () => stopCamera();
  }, [projectId]);

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
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: false
      });
      setShowScanner(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Gagal mengakses kamera.");
    }
  };

  useEffect(() => {
    if (showScanner && videoRef.current && !videoRef.current.srcObject) {
       startScanner();
    }
  }, [showScanner]);

  const fetchStatus = async () => {
    setLoading(true);
    const res = await getActiveAttendance(projectId);
    if (res?.data) {
      setActiveRecord(res.data);
    } else {
      setActiveRecord(null);
    }
    setHasFace(res?.hasFace ?? true);
    if (res?.projectLocation) {
       setProjectLocation(res.projectLocation);
    }
    setLoading(false);
  };

  const checkPermissionsAndTrack = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      if (result.state === 'granted') {
        startLocationTracking();
      }
    } catch (e) {}
  };

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
      const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setLocation({ lat: parseFloat(data.latitude), long: parseFloat(data.longitude), isFallback: true, city: data.city });
        setLocError("");
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (location && projectLocation) {
       const d = calculateDistance(location.lat, location.long, projectLocation.lat, projectLocation.long);
       setDistance(d);
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            setCapturedFile(new File([blob], "live_capture.jpg", { type: "image/jpeg" }));
          }
        }, "image/jpeg", 0.85);
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (!capturedFile) {
       captureFrame();
       return;
    }
    await processFile(capturedFile);
  };

  const processFile = async (file: File) => {
    if (!location) { alert("Location is required."); return; }
    setSubmitting(true);
    try {
      const photoUrl = await compressAndUploadFile(file);
      if (!photoUrl) throw new Error("Failed to upload photo");

      if (!activeRecord) {
        setVerifying(true);
        const faceRes = await verifyFaceMatch(photoUrl);
        setVerifying(false);
        if (faceRes.isEnrollment) {
           alert("✨ REGISTRASI WAJAH BERHASIL!");
           await fetchStatus();
           return;
        } else if (!faceRes.match) throw new Error(`Face Mismatch: ${faceRes.reason}`);
      }

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
      await fetchStatus();
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
      setVerifying(false);
    }
  };

  const triggerCamera = () => {
    if (!location) { alert("Location not found."); startLocationTracking(); return; }
    setCapturedFile(null);
    setNotes("");
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
            <p className="text-sm font-bold">Engineer</p>
            <p className="text-sm font-bold text-slate-400">08:30 - 17:30</p>
         </div>
         <div className="text-5xl font-black text-slate-800 mb-10">{format(new Date(), "HH:mm")}</div>
         <p className="text-emerald-600 font-bold text-sm mb-12 flex items-center justify-center gap-2">Deteksi wajah: berhasil</p>
         <div className="w-full space-y-4">
            <button onClick={() => window.location.href = "/home"} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">Kembali ke beranda</button>
            <button onClick={() => setShowSuccess(false)} className="w-full py-4 text-slate-400 font-bold">Lihat daftar absensi</button>
         </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-black text-xs tracking-widest uppercase animate-pulse">Syncing Status...</p>
      </div>
    );
  }

  const isWorking = activeRecord && !activeRecord.check_out_time;

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
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Location Status</p>
                <p className="text-sm font-black text-slate-700">
                   {!location ? 'Detecting GPS...' : (distance !== null && projectLocation && distance <= (projectLocation.radius || 100) ? 'Inside Project Area' : 'Outside Project Area')}
                </p>
             </div>
          </div>
          {location && distance !== null && (
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Distance</p>
                <p className="text-sm font-black text-slate-700">{Math.round(distance)}m</p>
             </div>
          )}
       </div>

       <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
             <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={40} />
             </div>
             <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{format(new Date(), "HH:mm")}</h3>
             <p className="text-slate-400 text-sm font-bold mb-8">{format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}</p>
             {isWorking && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Shift Started At</p>
                   <p className="text-lg font-black text-blue-600">{format(new Date(activeRecord.check_in_time), "HH:mm")}</p>
                </div>
             )}
             <button
               disabled={submitting || !location}
               onClick={triggerCamera}
               className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isWorking ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-blue-600 text-white shadow-blue-200'}`}
             >
                {submitting ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                {isWorking ? 'Clock Out Now' : 'Clock In Now'}
             </button>
          </div>
       </div>

      {showScanner && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <div className="bg-[#e11d48] text-white p-4 flex items-center gap-4 z-20">
             <button onClick={() => { setShowScanner(false); stopCamera(); }} className="p-2"><ChevronLeft size={24} /></button>
             <h1 className="text-xl font-black tracking-tight">{isWorking ? 'Clock Out' : 'Clock In'}</h1>
          </div>
          <div className="flex-1 relative flex flex-col items-center justify-center">
             <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover z-0" />
             <div className="absolute top-6 left-6 right-6 z-20 bg-white rounded-2xl p-4 shadow-xl border-l-4 border-blue-500">
                <p className="text-[12px] font-bold text-slate-400">Engineer</p>
                <div className="flex items-center gap-2 mt-1">
                   <Calendar size={16} className="text-slate-400" />
                   <p className="text-[13px] font-black text-slate-700">{format(new Date(), "dd MMM yyyy")} (08:30 - 17:30)</p>
                </div>
             </div>
             <div className="relative z-10 w-64 h-80 border-4 border-white border-dashed rounded-[5rem] flex flex-col items-center justify-center">
                <div className="absolute bottom-10 w-8 h-[2px] bg-white rounded-full opacity-50" />
             </div>
             <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-[2.5rem] p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
                <div className="space-y-6 mb-8">
                   <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                      <MoreVertical className="text-slate-400 rotate-90" />
                      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan (opsional)" className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-400" />
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                         <MapPin className="text-slate-400" />
                         <span className="font-bold text-slate-700">Lihat lokasi</span>
                      </div>
                      <ChevronRight className="text-slate-300" />
                   </div>
                </div>
                <button disabled={submitting} onClick={handleFinalSubmit} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3">
                   {submitting ? <Loader2 className="animate-spin" /> : 'Kirim'}
                </button>
             </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}
