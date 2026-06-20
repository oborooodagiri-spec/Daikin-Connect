"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "../actions/password-reset";
import LoadingLogo from "@/components/ui/LoadingLogo";

const HVACIllustration = () => {
  return (
    <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
      <LoadingLogo size={320} />
    </div>
  );
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await requestPasswordReset(email);
      if (result && "error" in result) {
        setError(result.error || "An unknown error occurred");
      } else {
        setMessage(result && "success" in result ? (result.success as string) : "If an account exists, a reset link has been sent.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col text-[#323338] font-sans selection:bg-blue-100 selection:text-blue-600 relative overflow-x-hidden">
      
      {/* Top Header Logo Area */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-6 group">
         <img src="/daikin_logo.png" className="h-5 w-auto object-contain transition-transform group-hover:scale-105" alt="Daikin" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto px-6 lg:px-20 pt-32 lg:pt-0">
        
        {/* Left Side: Animated Brand Illustration */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center pr-12">
           <HVACIllustration />
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 flex items-center justify-center lg:justify-end py-12 lg:py-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-black tracking-tight text-[#323338] mb-2">
                Forgot Password
              </h2>
              <p className="text-sm font-bold text-slate-400">
                Recovery Access
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="popLayout">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-sm"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}

                {message && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-5 py-4 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p>{message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Alamat Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!message}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#323338] focus:bg-white focus:border-[#0073ea] focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 placeholder:text-slate-300 disabled:opacity-50"
                    placeholder="Enter your registered email"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !!message}
                className="w-full bg-[#0073ea] hover:bg-[#0060c5] text-white rounded-2xl font-black uppercase text-xs tracking-widest py-4 transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <span className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Kirim Tautan Pemulihan
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#0073ea] transition-colors uppercase tracking-widest"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Login
              </Link>
            </div>

            <div className="mt-12 text-center border-t border-slate-100 pt-8">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 © 2026 EPLLINK <span className="text-[#0073ea] mx-2">•</span> RECOVERY
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
