"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, 
  Wind, Zap, Fan, ShieldCheck
} from "lucide-react";

import { login, register } from "./actions/auth";
import { APP_VERSION } from "@/lib/version";
import TwoFactorModal from "@/components/auth/TwoFactorModal";
import StaticLogo from "@/components/ui/StaticLogo";
import LoadingLogo from "@/components/ui/LoadingLogo";

// --- Custom Animated HVAC Illustration Components ---

const HVACIllustration = () => {
  return (
    <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
      <LoadingLogo size={320} />
    </div>
  );
};

export default function LoginPage() {
  const [isRequestMode, setIsRequestMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [show2fModal, setShow2fModal] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [greeting, setGreeting] = useState("Selamat Datang");

  useEffect(() => {
    setIsMounted(true);
    
    // Explicitly trigger turnstile render when page is ready
    if (typeof window !== "undefined" && (window as any).renderTurnstile) {
      setTimeout((window as any).renderTurnstile, 500);
    }
    
    // Dynamic Greeting Logic - More precise ranges
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Selamat Pagi");
    else if (hour >= 12 && hour < 15) setGreeting("Selamat Siang");
    else if (hour >= 15 && hour < 18) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");

    if (typeof window !== "undefined") {
      localStorage.removeItem("daikin_last_project");
    }
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      // Ensure email and password from state are used (or just rely on form data if fields have names)
      formData.set("email", email);
      formData.set("password", password);
      
      if (isRequestMode) {
        formData.append("name", name);
        formData.append("company_name", companyName);
        const result = await register(formData);
        if (result?.error) {
          setError(result.error || "Registration failed");
        } else if (result && "success" in result && result.success) {
          setMessage(result.success as string);
          setIsRequestMode(false);
          setName("");
          setCompanyName("");
          setPassword("");
        }
      } else {
        const result = await login(formData);
        if (result && "requires2f" in result) {
          setTempEmail(email);
          setShow2fModal(true);
        } else if (result && "error" in result) {
          setError(result.error || "Login failed");
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
        throw err;
      }
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

        {/* Right Side: Login Form */}
        <div className="flex-1 flex items-center justify-center lg:justify-end py-12 lg:py-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-black tracking-tight text-[#323338] mb-2">
                {isRequestMode ? "Access Request" : greeting}
              </h2>
              {isRequestMode && (
                <p className="text-sm font-bold text-slate-400">
                  Silakan isi data untuk permintaan akses
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {isRequestMode && (
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#323338] focus:bg-white focus:border-[#0073ea] focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 placeholder:text-slate-300"
                        placeholder="John Doe"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Perusahaan</label>
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#323338] focus:bg-white focus:border-[#0073ea] focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 placeholder:text-slate-300"
                        placeholder="PT. Example Indonesia"
                      />
                   </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Alamat Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#323338] focus:bg-white focus:border-[#0073ea] focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 placeholder:text-slate-300"
                  placeholder="email@domain.com"
                />
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Kata Sandi</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isRequestMode}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#323338] focus:bg-white focus:border-[#0073ea] focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#323338] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isRequestMode && (
                  <div className="flex justify-end pt-1 px-2">
                    <Link href="/forgot-password" size="sm" className="text-[10px] font-bold text-[#0073ea] hover:underline transition-all uppercase tracking-widest">
                      Lupa Sandi?
                    </Link>
                  </div>
                )}
              </div>

              {!isRequestMode && (
                <div className="flex justify-center py-2 min-h-[65px] mb-4">
                  <div 
                    className="cf-turnstile" 
                    data-sitekey={
                      (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
                        ? "1x00000000000000000000AA" 
                        : (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAADGD9nT3x6TSaE8-")
                    }
                    data-theme="light"
                  ></div>
                </div>
              )}

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0073ea] text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] py-5 transition-all duration-300 transform hover:shadow-[0_8px_30px_rgb(0,115,234,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      {isRequestMode ? "Kirim Permintaan" : "Masuk Sekarang"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {isRequestMode ? "Sudah punya akses?" : "Belum punya akun?"}{" "}
              <button 
                onClick={() => {
                  setIsRequestMode(!isRequestMode);
                  setError(null);
                  setMessage(null);
                }}
                className="text-[#0073ea] hover:underline ml-1"
              >
                {isRequestMode ? "Masuk Di Sini" : "Minta Akses"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-12" />

      <TwoFactorModal 
        isOpen={show2fModal}
        onClose={() => setShow2fModal(false)}
        email={tempEmail}
        isLoading={isLoading}
        onVerify={async (otp, trustDevice) => {
          setIsLoading(true);
          setError(null);
          try {
            const formData = new FormData();
            formData.append("email", tempEmail);
            formData.append("otpCode", otp);
            formData.append("is2fVerification", "true");
            if (trustDevice) formData.append("trustDevice", "true");
            
            const result = await login(formData);
            if (result && "error" in result) {
              setError(result.error || "An error occurred");
            } else {
              setShow2fModal(false);
            }
          } catch (err: any) {
            if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
              throw err;
            }
            setError("Verification failed. Please try again.");
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
