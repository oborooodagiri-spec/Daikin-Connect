"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, MapPin, MapPinOff, Clock, CheckCircle2, ChevronRight, Loader2, Play, Square } from "lucide-react";
import { getActiveAttendance, submitCheckIn, submitCheckOut, verifyFaceMatch } from "@/app/actions/attendance";
import { format } from "date-fns";
import { ShieldCheck, ShieldAlert, Fingerprint } from "lucide-react";

export default function AttendanceClient({ projectId }: { projectId: string }) {
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
  const [locError, setLocError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStatus();
    startLocationTracking();
  }, [projectId]);

  const fetchStatus = async () => {
    setLoading(true);
    const res = await getActiveAttendance(projectId);
    if (res?.data) {
      setActiveRecord(res.data);
    } else {
      setActiveRecord(null);
    }
    setLoading(false);
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocError("GPS not supported on this device.");
      return;
    }
    
    setLocError("Requesting GPS...");
    
    // Get high accuracy position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, long: pos.coords.longitude });
        setLocError("");
      },
      (err) => {
        let msg = "Please enable GPS/Location Services.";
        if (err.code === 1) msg = "Location Permission Denied. Please enable it in browser settings.";
        if (err.code === 2) msg = "GPS Signal Unavailable. Moving outside may help.";
        if (err.code === 3) msg = "Location detection timed out. Try again.";
        setLocError(msg);
        console.warn(err);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
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

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!location) {
      alert("GPS location is required before taking a photo.");
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

        if (faceRes.error === "IDENTITY_NOT_REGISTERED") {
           alert("Identity not registered. Please go to Settings > Security to register your face first.");
           return;
        }

        if (faceRes.error) throw new Error(faceRes.error);

        if (!faceRes.match) {
           setVerifyResult({ success: false, reason: faceRes.reason });
           alert(`Face Mismatch: ${faceRes.reason}`);
           return;
        }
        
        setVerifyResult({ success: true, confidence: faceRes.confidence });
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
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerCamera = () => {
    if (!location) {
      alert("Location not found. Please wait for GPS signal or tap the red status banner to retry.");
      startLocationTracking();
      return;
    }
    fileInputRef.current?.click();
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
    <div className="max-w-md mx-auto bg-white min-h-[90vh] sm:min-h-0 sm:rounded-[4rem] sm:border border-slate-200 overflow-hidden relative shadow-2xl flex flex-col">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-[#003366] to-[#001f40] text-white p-6 sm:p-10 pb-20 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300/80 mb-1">
              {format(new Date(), "EEEE, dd MMM yyyy")}
            </p>
            <h1 className="text-2xl font-black tracking-tight leading-none">Live Attendance</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-xl">
            <Clock className="w-4 h-4 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Main Content Card - Floating Style */}
      <div className="bg-white rounded-[2.5rem] sm:rounded-t-[4rem] -mt-12 relative z-20 p-6 sm:p-10 flex-1 flex flex-col shadow-inner">
        
        {/* Interactive GPS Status Indicator */}
        <button 
          onClick={startLocationTracking}
          className={`w-full p-3 rounded-2xl flex items-center gap-3 mb-8 border transition-all active:scale-[0.98] group/gps ${location ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100 animate-pulse'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${location ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {location ? <MapPin size={18} /> : <MapPinOff size={18} />}
          </div>
          <div className="flex-1 text-left">
            <p className={`text-[9px] font-black uppercase tracking-widest ${location ? 'text-emerald-600' : 'text-rose-600'}`}>
              Region Status: {location ? 'Locked & Verified' : 'Signal Searching...'}
            </p>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5 line-clamp-1">
              {location ? `${location.lat.toFixed(5)}, ${location.long.toFixed(5)}` : locError || 'Tap to grant GPS permission'}
            </p>
          </div>
          {!location && <ChevronRight className="w-4 h-4 text-rose-400 group-hover/gps:translate-x-1 transition-transform" />}
        </button>

        {/* Status Display */}
        {isCompleted ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center py-10">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Shift Over</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Checked out at {format(new Date(activeRecord.check_out_time), "HH:mm")}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center py-2">
            
            {/* Massive Circular Button - Scaled for Mobile */}
            <div className="relative group perspective">
              {/* Outer Glow */}
              <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000 opacity-40 ${
                isWorking ? 'bg-rose-500 group-hover:bg-rose-600' : 'bg-[#00a1e4] group-hover:bg-blue-600'
              }`} />
              
              <button
                disabled={submitting || !location}
                onClick={triggerCamera}
                className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-500 transform group-hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed
                  ${isWorking 
                    ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-900/40' 
                    : 'bg-gradient-to-br from-[#00a1e4] to-blue-600 shadow-blue-900/40'
                  }
                `}
              >
                {submitting ? (
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md mb-4 border border-white/20">
                      {verifying ? <Fingerprint className="w-8 h-8 animate-pulse" /> : <Camera size={24} strokeWidth={2.5} />}
                    </div>
                    <span className="text-lg font-black uppercase tracking-widest text-center px-4 leading-tight">
                      {verifying ? 'Verifying...' : (isWorking ? 'End Shift' : 'Begin Shift')}
                    </span>
                    <span className="text-[9px] font-black opacity-70 uppercase tracking-widest mt-2 flex items-center gap-1">
                      Take Selfie <ChevronRight size={10} />
                    </span>
                  </>
                )}
              </button>
            </div>
            
            {isWorking && (
              <div className="mt-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Service Duration In Progress</p>
                <div className="inline-flex items-center gap-3 bg-blue-50/50 border border-blue-100/50 px-5 py-3 rounded-2xl backdrop-blur-sm">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                   <p className="font-black text-[#003366] text-base tracking-tight">
                     On Duty: {format(new Date(activeRecord.check_in_time), "HH:mm")}
                   </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Mobile-Friendly Copyright Footer */}
      <div className="p-6 text-center shrink-0">
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
           Secure Biometric Identity Verification<br />
           &copy; 2026 VALVES ENG • D2
         </p>
      </div>

      {/* Hidden File Input for Native Camera API */}
      <input 
        type="file" 
        accept="image/*" 
        capture="user" 
        ref={fileInputRef} 
        onChange={handleCapture}
        className="hidden" 
      />
    </div>
  );
}
