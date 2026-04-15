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
  const [location, setLocation] = useState<{ lat: number; long: number; isFallback?: boolean; city?: string } | null>(null);
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
      fallbackToNetwork();
      return;
    }
    
    setLocError("Requesting GPS...");
    
    // Get high accuracy position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, long: pos.coords.longitude, isFallback: false });
        setLocError("");
      },
      (err) => {
        console.warn("GPS Failed:", err.message);
        fallbackToNetwork();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const fallbackToNetwork = async () => {
    try {
      setLocError("GPS Denied. Engaging Network Triangulation...");
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

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
           alert("✨ Security Profile Established! Your face has been successfully registered as your permanent identity. Check-in Proceeding...");
           setVerifyResult({ success: true, confidence: 100 });
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
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerCamera = () => {
    if (!location) {
      alert("Location not found. Please wait for GPS signal or Network Triangulation.");
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
                        {verifying ? 'Scanning...' : (isWorking ? 'End Shift' : 'Begin Shift')}
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
