"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, MapPin, MapPinOff, Clock, CheckCircle2, ChevronRight, Loader2, Play, Square, X } from "lucide-react";
import { getActiveAttendance, submitCheckIn, submitCheckOut, verifyFaceMatch } from "@/app/actions/attendance";
import { format } from "date-fns";
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
  
  // Custom WebRTC Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Clean up WebRTC on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startScanner = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Browser does not support Live Scanner. Please use a modern browser.");
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
        // Some older browsers might require this
        videoRef.current.play().catch(console.error);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Gagal mengakses kamera. Harap pastikan izin kamera diberikan di pengaturan browser/perangkat Anda.");
    }
  };

  // Keep an effect to bind stream when toggling scanner if ref was unmounted
  useEffect(() => {
    if (showScanner && videoRef.current && !videoRef.current.srcObject) {
       startScanner();
    }
  }, [showScanner]);

  useEffect(() => {
    fetchStatus();
    checkPermissionsAndTrack();
  }, [projectId]);

  const checkPermissionsAndTrack = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      if (result.state === 'granted') {
        startLocationTracking();
      } else {
        // Wait for user gesture before requesting location to prevent browser auto-block
      }
    } catch (e) {
      // If Permissions API is unsupported, we wait for user gesture anyway
    }
  };

  const fetchStatus = async () => {
    setLoading(true);
    const res = await getActiveAttendance(projectId);
    if (res?.data) {
      setActiveRecord(res.data);
    } else {
      setActiveRecord(null);
    }
    setHasFace(res?.hasFace ?? true);
    setLoading(false);
  };

  const startLocationTracking = (useHighAccuracy = true) => {
    if (!navigator.geolocation) {
      fallbackToNetwork("GPS not supported on device.");
      return;
    }
    
    setLocError(useHighAccuracy ? "Requesting High Accuracy GPS..." : "Requesting Basic Location...");
    
    // Get position 
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, long: pos.coords.longitude, isFallback: false });
        setLocError("");
      },
      (err) => {
        console.warn(`GPS Failed (HighAcc: ${useHighAccuracy}):`, err.code, err.message);
        
        // If High Accuracy fails (Code 2: Unavailable, or Code 3: Timeout), retry with Low Accuracy
        if (useHighAccuracy && (err.code === 2 || err.code === 3)) {
          startLocationTracking(false);
        } else {
          // If it's Permission Denied (1) or Low Accuracy also fails, run IP Fallback
          const reason = err.code === 1 ? "Permission Denied" : 
                         err.code === 2 ? "Signal Unavailable" : "Timeout";
          fallbackToNetwork(`GPS Blokir (${reason}). Engaging Triangulation...`);
        }
      },
      { enableHighAccuracy: useHighAccuracy, timeout: useHighAccuracy ? 10000 : 15000, maximumAge: 10000 }
    );
  };

  const fallbackToNetwork = async (reasonMsg: string) => {
    try {
      setLocError(reasonMsg);
      const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setLocation({ 
          lat: parseFloat(data.latitude), 
          long: parseFloat(data.longitude), 
          isFallback: true,
          city: data.city || "Unknown City"
        });
        setLocError("");
      } else {
        setLocError("All location detection systems failed.");
      }
    } catch (e) {
      setLocError("All location detection systems failed.");
    }
  };

  const compressAndUploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "attendance");
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) return data.url;
    } catch (e) {
      console.error("Upload error", e);
    }
    return null;
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to Blob and process
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "live_capture.jpg", { type: "image/jpeg" });
            setShowScanner(false);
            stopCamera();
            processFile(file);
          }
        }, "image/jpeg", 0.85); // 85% quality to save bandwidth
      }
    }
  };

  const processFile = async (file: File) => {
    if (!location) {
      alert("Location is required. Please wait for the system to detect your network.");
      return;
    }

    setSubmitting(true);
    setVerifyResult(null);
    try {
      // 1. Upload Photo
      const photoUrl = await compressAndUploadFile(file);
      if (!photoUrl) throw new Error("Failed to upload photo");

      // 2. AI Face Verification (Only for Check-In)
      if (!activeRecord) {
        setVerifying(true);
        const faceRes = await verifyFaceMatch(photoUrl);
        setVerifying(false);

        if (faceRes.isEnrollment) {
           alert("✨ REGISTRASI WAJAH BERHASIL! Identitas Anda telah dikunci ke dalam sistem keamanan. Silakan tap tombol 'BEGIN SHIFT' sekali lagi untuk melakukan absen masuk.");
           setVerifyResult({ success: true, confidence: 100 });
           await fetchStatus();
           return; // Stop execution, forcing them to click 'Begin Shift' again!
        } else {
           if (faceRes.error) throw new Error(faceRes.error);

           if (!faceRes.match) {
              setVerifyResult({ success: false, reason: faceRes.reason });
              alert(`Face Mismatch: ${faceRes.reason}`);
              return;
           }
           
           setVerifyResult({ success: true, confidence: faceRes.confidence });
        }
      }

      // 3. Submit API
      if (!activeRecord) {
        // Checking In
        const res = await submitCheckIn({
          projectId,
          lat: location.lat,
          long: location.long,
          photoUrl: photoUrl
        });
        if (res.error) throw new Error(res.error);
        alert("Face Verified! Check-in Successful.");
      } else {
        // Checking Out
        const res = await submitCheckOut({
          attendanceId: activeRecord.id,
          lat: location.lat,
          long: location.long,
          photoUrl: photoUrl
        });
        if (res.error) throw new Error(res.error);
        alert("Check-out Successful!");
      }
      
      await fetchStatus();
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
      setVerifying(false);
    }
  };

  const triggerCamera = () => {
    if (!location) {
      alert("Location not found. Please wait for GPS signal or Network Triangulation.");
      startLocationTracking();
      return;
    }
    startScanner();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">Syncing Status...</p>
      </div>
    );
  }

  const isWorking = activeRecord && !activeRecord.check_out_time;
  const isCompleted = activeRecord && activeRecord.check_out_time;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-white min-h-[550px] md:min-h-[600px] rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 overflow-hidden relative shadow-2xl flex flex-col md:flex-row transition-all duration-500">
        
        {/* Header Section (Left Side on Desktop) */}
        <div className="bg-gradient-to-br from-[#003366] to-[#001f40] text-white p-8 sm:p-12 pb-16 md:pb-12 md:w-[40%] relative overflow-hidden shrink-0 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          
          <div className="relative z-10">
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-blue-300/80 mb-2">
              {format(new Date(), "EEEE, dd MMM yyyy")}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">Live<br />Attendance</h1>
          </div>
          
          <div className="relative z-10 mt-12 md:mt-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-xl shrink-0">
              <Clock className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Time Server</p>
              <p className="font-bold text-white text-sm">{format(new Date(), "HH:mm O")}</p>
            </div>
          </div>
        </div>

        {/* Main Interaction Section (Right Side on Desktop) */}
        <div className="bg-white rounded-[2.5rem] md:rounded-none md:rounded-l-[3.5rem] -mt-10 md:mt-0 relative z-20 p-6 sm:p-12 flex-1 flex flex-col shadow-inner md:shadow-none">
          
          {/* Interactive GPS Status Indicator */}
          <div className="space-y-4 mb-10">
            <button 
              onClick={startLocationTracking}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 border transition-all active:scale-[0.98] group/gps 
                ${!location ? 'bg-rose-50 border-rose-100' : 
                  location.isFallback ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 
                ${!location ? 'bg-rose-100 text-rose-600 animate-pulse' : 
                  location.isFallback ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {!location ? <Loader2 className="animate-spin" size={22} /> : location.isFallback ? <ShieldAlert size={22} /> : <MapPin size={22} />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-widest leading-tight 
                  ${!location ? 'text-rose-600' : location.isFallback ? 'text-amber-700' : 'text-emerald-600'}`}>
                  {!location ? locError || 'Detection Required' : 
                   location.isFallback ? 'Network Triangulation (GPS Blocked)' : 'GPS Region Locked & Verified'}
                </p>
                <p className="text-[12px] font-bold text-slate-500 mt-1 truncate">
                  {location ? `${location.lat.toFixed(5)}, ${location.long.toFixed(5)} ${location.city ? `(${location.city})` : ''}` : 'Waiting for connection...'}
                </p>
              </div>
              {!location && <ChevronRight className="w-5 h-5 text-rose-400 group-hover/gps:translate-x-1 transition-transform" />}
            </button>
          </div>

          {/* Status Display Area */}
          {isCompleted ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center py-10 space-y-6">
              <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Shift Completed</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Checked out at {format(new Date(activeRecord.check_out_time), "HH:mm")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center py-4">
              <div className="relative group perspective mb-8">
                <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 opacity-30 ${
                  isWorking ? 'bg-rose-500 group-hover:bg-rose-600' : 'bg-blue-400 group-hover:bg-blue-600'
                }`} />
                
                <button
                  disabled={submitting || !location}
                  onClick={triggerCamera}
                  className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-500 transform group-hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed
                    ${isWorking 
                      ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-900/40' 
                      : 'bg-gradient-to-br from-[#00a1e4] to-blue-600 shadow-blue-900/40'
                    }
                  `}
                >
                  {submitting ? (
                    <Loader2 className="w-12 h-12 animate-spin" />
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md mb-4 border border-white/20">
                        {verifying ? <Fingerprint className="w-10 h-10 animate-pulse" /> : <Camera size={28} strokeWidth={2.5} />}
                      </div>
                      <span className="text-xl font-black uppercase tracking-widest text-center px-4 leading-tight">
                        {verifying ? 'Scanning...' : (!hasFace ? 'Register Face' : (isWorking ? 'End Shift' : 'Begin Shift'))}
                      </span>
                      <span className="text-[10px] font-black opacity-70 uppercase tracking-widest mt-2 flex items-center gap-1">
                        Take Photo <ChevronRight size={12} />
                      </span>
                    </>
                  )}
                </button>
              </div>
              
              {isWorking && (
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Live Shift Session</p>
                  <div className="inline-flex items-center gap-4 bg-slate-50 border border-slate-100 px-6 py-4 rounded-3xl shadow-sm">
                     <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                     </div>
                     <p className="font-black text-[#003366] text-lg tracking-tight">
                       Started: {format(new Date(activeRecord.check_in_time), "HH:mm")}
                     </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100 text-center opacity-50">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
               Enterprise Secure Biometric Identity Protocol // &copy; 2026 VALVES ENG
             </p>
          </div>
        </div>
      </div>

      {/* Native WebRTC Live Scanner Overlay Component */}
      {showScanner && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col justify-between animate-in slide-in-from-bottom duration-500 overflow-hidden">
          
          {/* Hardware Video Stream Layer */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover z-0" 
          />
          
          {/* Smart Symmetrical Guidance Mask Area */}
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
             {/* The Cutout - using box-shadow to dim everything outside the oval */}
             <div className="w-72 h-[420px] rounded-[5rem] shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] relative flex flex-col items-center pt-10 transition-all duration-300">
                {/* HUD Elements */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/40 rounded-full" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/40 rounded-full" />
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-white/40 rounded-full" />
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-white/40 rounded-full" />

                {/* Symmetrical Guide Lines (Head & Shoulder Silhouette) */}
                <div className="w-36 h-44 rounded-full border-2 border-white/30 border-dashed absolute top-8" />
                <div className="w-56 h-24 rounded-t-[3rem] border-t-2 border-x-2 border-white/30 border-dashed absolute bottom-0" />
                
                {/* Visual Feedback Message */}
                <div className="absolute -bottom-16 w-max max-w-[90%] bg-black/60 px-5 py-3 rounded-full backdrop-blur-md shadow-xl border border-white/10 text-center animate-pulse">
                   <p className="text-white text-[11px] font-black tracking-widest uppercase">Sejajarkan Wajah dan Pundak</p>
                </div>
             </div>
          </div>
          
          {/* Top Controls */}
          <div className="absolute top-0 left-0 w-full p-4 sm:p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
             <button 
               onClick={() => { setShowScanner(false); stopCamera(); }} 
               className="text-white p-3 bg-white/10 hover:bg-rose-500/80 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-lg"
              >
                <X size={24} strokeWidth={2.5} />
             </button>
             <div className="text-white text-xs font-black tracking-[0.3em] uppercase opacity-90 drop-shadow-md">
                Live Scanner
             </div>
             <div className="w-12"></div> {/* Spacer to center the text */}
          </div>

          {/* Bottom Controls / Capture Shutter */}
          <div className="absolute bottom-0 left-0 w-full p-8 z-20 flex justify-center pb-12 bg-gradient-to-t from-black/80 to-transparent">
             <button 
               onClick={captureFrame} 
               className="w-20 h-20 bg-white/90 hover:bg-white rounded-full border-[6px] border-slate-300 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-90 transition-all group"
             >
                <div className="w-14 h-14 rounded-full border-2 border-black/10 group-active:scale-90 transition-all bg-white" />
             </button>
          </div>
          
          {/* Hidden Canvas for Frame Processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}
