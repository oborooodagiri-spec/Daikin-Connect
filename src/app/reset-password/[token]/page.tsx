"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { resetPassword } from "../../actions/password-reset";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match / Kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await resetPassword(token, password);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage(result.success || "Password has been reset successfully.");
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
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
        <div className="absolute top-0 left-0 w-full h-full bg-[#00a1e4] opacity-[0.05] blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] shadow-2xl relative z-10"
      >
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
             <img src="/daikin_logo.png" className="h-6 brightness-0 invert" alt="Daikin" />
             <div className="w-[1px] h-4 bg-white/20"></div>
             <img src="/logo_epl_connect_1.png" className="h-6 brightness-0 invert" alt="EPL Connect" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Set New Password</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00a1e4]" />
            Secure Verification
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
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>{message} Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!message && (
            <>
              <div className="group">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#00a1e4]" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-medium text-white focus:bg-white/5 focus:border-[#00a1e4] focus:ring-1 focus:ring-[#00a1e4] outline-none transition-all placeholder:text-slate-500"
                    placeholder="Minimal 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#00a1e4]" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-medium text-white focus:bg-white/5 focus:border-[#00a1e4] focus:ring-1 focus:ring-[#00a1e4] outline-none transition-all placeholder:text-slate-500"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#00a1e4] to-blue-600 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.15em] py-4 transition-all hover:shadow-[0_0_20px_rgba(0,161,228,0.4)] disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>
            </>
          )}

          {message && (
             <Link 
             href="/" 
             className="w-full flex justify-center bg-white/5 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.15em] py-4 transition-all hover:bg-white/10"
           >
             Go to Login Now
           </Link>
          )}
        </form>
      </motion.div>
    </div>
  );
}
