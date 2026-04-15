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
    
    // Get high accuracy position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, long: pos.coords.longitude });
        setLocError("");
      },
      (err) => {
        setLocError("Please enable GPS/Location Services to Check-in.");
        console.warn(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
      alert("Location not found. Please wait for GPS signal or refresh.");
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
    <div className="max-w-md mx-auto bg-slate-50 min-h-[85vh] sm:min-h-0 sm:rounded-[3rem] sm:border border-slate-200 overflow-hidden relative shadow-2xl shadow-blue-900/5">
      
      {/* Header */}
      <div className="bg-[#003366] text-white p-6 sm:p-8 pt-12 sm:pt-8 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">
              {format(new Date(), "EEEE, dd MMM yyyy")}
            </p>
            <h1 className="text-2xl font-black tracking-tight">Live Attendance</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
            <Clock className="w-5 h-5 text-blue-100" />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2rem] sm:rounded-t-[3rem] -mt-8 relative z-20 p-6 sm:p-8 pt-8 min-h-[400px] flex flex-col">
        
        {/* GPS Status Indicator */}
        <div className={`p-4 rounded-2xl flex items-center gap-4 mb-8 border ${location ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${location ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>
            {location ? <MapPin size={20} /> : <MapPinOff size={20} />}
          </div>
          <div className="flex-1">
            <p className={`text-[10px] font-black uppercase tracking-widest ${location ? 'text-emerald-600' : 'text-red-600'}`}>
              GPS Signal {location ? 'Locked' : 'Searching...'}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-0.5 truncate">
              {location ? `${location.lat.toFixed(5)}, ${location.long.toFixed(5)}` : locError || 'Waiting for permissions...'}
            </p>
          </div>
        </div>

        {/* Status Display */}
        {isCompleted ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 py-8">
            <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Shift Completed</h2>
            <p className="text-slate-500 text-sm font-medium">
              You checked out at {format(new Date(activeRecord.check_out_time), "HH:mm")}. Great job today!
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center py-4">
            
            {/* Massive Circular Button */}
            <div className="relative group perspective">
              {/* Outer Glow */}
              <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-1000 opacity-60 ${
                isWorking ? 'bg-rose-500 group-hover:bg-rose-600' : 'bg-[#00a1e4] group-hover:bg-blue-600'
              }`} />
              
              <button
                disabled={submitting || !location}
                onClick={triggerCamera}
                className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-500 transform group-hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  ${isWorking 
                    ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-900/30' 
                    : 'bg-gradient-to-br from-[#00a1e4] to-blue-600 shadow-blue-900/30'
                  }
                `}
              >
                {submitting ? (
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md mb-4 border border-white/20">
                      {verifying ? <Fingerprint className="w-8 h-8 animate-pulse" /> : <Camera size={28} strokeWidth={2.5} />}
                    </div>
                    <span className="text-xl font-black uppercase tracking-widest text-center px-4">
                      {verifying ? 'Verifying Identity...' : (isWorking ? 'Check Out' : 'Check In')}
                    </span>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-2 flex items-center gap-1">
                      Tap for Selfie <ChevronRight size={12} />
                    </span>
                  </>
                )}
              </button>
            </div>
            
            {isWorking && (
              <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Current Active Shift</p>
                <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-100 px-6 py-3 rounded-2xl">
                   <Play className="w-4 h-4 text-blue-500 fill-current" />
                   <p className="font-bold text-blue-900 text-lg tracking-tight">
                     Checked In: {format(new Date(activeRecord.check_in_time), "HH:mm")}
                   </p>
                </div>
              </div>
            )}
          </div>
        )}

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
