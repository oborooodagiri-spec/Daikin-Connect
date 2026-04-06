"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Activity } from "lucide-react";
import { requestPasswordReset } from "../actions/password-reset";

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
      if (result.error) {
        setError(result.error);
      } else {
        setMessage(result.success || "If an account exists, a reset link has been sent.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040814] flex flex-col items-center justify-center p-6 text-slate-200 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-[#00a1e4] opacity-[0.1] blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#003366] opacity-[0.1] blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] shadow-2xl relative z-10"
      >
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
             <img src="/app-logo.png" className="h-6 brightness-0 invert" alt="Daikin" />
             <div className="w-[1px] h-4 bg-white/20"></div>
             <img src="/logo_epl_connect_1.png" className="h-6 brightness-0 invert" alt="EPL Connect" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Forgot Password</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Recovery Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3"
              >
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </motion.div>
            )}

            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4" />
                <p>{message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="group">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#00a1e4]" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!message}
                className="w-full pl-12 pr-5 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-medium text-white focus:bg-white/5 focus:border-[#00a1e4] focus:ring-1 focus:ring-[#00a1e4] outline-none transition-all placeholder:text-slate-500 disabled:opacity-50"
                placeholder="Enter your registered email"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading || !!message}
            className="w-full bg-gradient-to-r from-[#00a1e4] to-blue-600 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.15em] py-4 transition-all hover:shadow-[0_0_20px_rgba(0,161,228,0.4)] disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-3">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </div>
      </motion.div>
      
      <div className="mt-12 text-center relative z-10 w-full">
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           © 2026 EPL CONNECT <span className="text-[#00a1e4] mx-2">•</span> RECOVERY
         </p>
      </div>
    </div>
  );
}
