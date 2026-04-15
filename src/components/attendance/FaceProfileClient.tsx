"use client";

import React, { useState, useRef } from "react";
import { Camera, CheckCircle2, Loader2, AlertCircle, RefreshCw, UserCheck } from "lucide-react";
import { updateFaceProfile } from "@/app/actions/attendance";
import { motion, AnimatePresence } from "framer-motion";

export default function FaceProfileClient({ initialFaceUrl }: { initialFaceUrl?: string }) {
  const [faceUrl, setFaceUrl] = useState(initialFaceUrl);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    try {
      // 1. Upload Photo
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "identity");
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.url) throw new Error("Upload failed");

      // 2. Update Profile
      const res = await updateFaceProfile(uploadData.url);
      if (res.error) throw new Error(res.error);

      setFaceUrl(uploadData.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden p-8 sm:p-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100">
             <UserCheck size={24} />
          </div>
          <div>
             <h3 className="text-lg font-black text-[#003366] tracking-tight">Identity Face Profile</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Used for attendance verification</p>
          </div>
        </div>
        
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest"
            >
               <CheckCircle2 size={12} />
               <span>Profile Updated</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-6 py-4">
        {/* Face Preview Circle */}
        <div className="relative group">
           <div className={`w-40 h-40 rounded-full border-4 overflow-hidden shadow-2xl transition-all duration-500 ${faceUrl ? 'border-[#003366]' : 'border-slate-100 bg-slate-50'}`}>
              {faceUrl ? (
                <img src={faceUrl} alt="Identity Face" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                   <Camera size={48} strokeWidth={1} />
                   <p className="text-[10px] font-black uppercase mt-2 tracking-widest">No Face Linked</p>
                </div>
              )}
           </div>

           {submitting && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-[#003366] animate-spin" />
             </div>
           )}

           <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={submitting}
             className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#003366] text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white hover:scale-110 active:scale-95 transition-transform"
           >
              <RefreshCw size={20} className={submitting ? 'animate-spin' : ''} />
           </button>
        </div>

        <div className="text-center max-w-xs">
           <p className="text-sm font-bold text-slate-600 mb-2">
             {faceUrl ? "This is your registered identity face." : "You haven't registered your identity face yet."}
           </p>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
             Ensure good lighting and remove masks/glasses for the best recognition accuracy.
           </p>
        </div>

        {!faceUrl && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 bg-[#003366] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-colors"
          >
            Register Face Now
          </button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex gap-4">
         <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
         <p className="text-[10px] leading-relaxed font-bold text-blue-800 uppercase tracking-widest">
            Your face profile data is processed privately via AI. Once registered, the system will use this profile to verify your identity every time you check in at a project site.
         </p>
      </div>

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
