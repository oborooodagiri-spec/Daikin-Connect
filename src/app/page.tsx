"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, 
  Wind, Zap, Fan, ShieldCheck, ArrowUp
} from "lucide-react";

import { login, register } from "./actions/auth";
import { APP_VERSION } from "@/lib/version";
import TwoFactorModal from "@/components/auth/TwoFactorModal";
import StaticLogo from "@/components/ui/StaticLogo";
import LoadingLogo from "@/components/ui/LoadingLogo";

// About Us Section Components
import AnimatedCounter from "@/components/about/AnimatedCounter";
import ScrollIndicator from "@/components/about/ScrollIndicator";
import OrgChart from "@/components/about/OrgChart";
import IndonesiaMap from "@/components/about/IndonesiaMap";
import ServiceGrid from "@/components/about/ServiceGrid";
import ChillerDiagram from "@/components/about/ChillerDiagram";
import DSSIShowcase from "@/components/about/DSSIShowcase";
import DeviceMockup from "@/components/about/DeviceMockup";

// --- Custom Animated HVAC Illustration Components ---

const HVACIllustration = () => {
  return (
    <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
      <video
        src="/logo/DSSI - Animation - No Background.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-[80%] h-[80%] object-contain"
      />
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
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined") {
      localStorage.removeItem("daikin_last_project");
    }
  }, []);

  // Load Cloudflare Turnstile script dynamically (implicit mode)
  useEffect(() => {
    if (!isMounted || isRequestMode) return;
    
    // Remove any existing turnstile scripts to force re-scan
    document.querySelectorAll('script[src*="challenges.cloudflare.com/turnstile"]').forEach(s => s.remove());
    // Reset turnstile global
    delete (window as any).turnstile;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      const container = document.querySelector('.cf-turnstile');
      if (container) container.innerHTML = '';
    };
  }, [isMounted, isRequestMode]);

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
    <main className="min-h-screen bg-[#ffffff] flex flex-col text-[#323338] font-sans selection:bg-blue-100 selection:text-blue-600 relative overflow-x-hidden
      lg:snap-y lg:snap-mandatory lg:h-screen lg:overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
      
      {/* SEO Optimized H1 - Visually hidden but readable by search engines */}
      <h1 className="sr-only">
        Daikin Service Indonesia - Pusat Perbaikan, Instalasi, & Maintenance Chiller (DSSI Connect)
      </h1>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI 0: HERO LOGIN                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="min-h-screen lg:h-screen lg:snap-start flex flex-col relative" id="hero">
      <div className="absolute top-8 left-8 z-50 flex items-center gap-6 group">
         <img src="/daikin_logo.png" className="h-5 w-auto object-contain transition-transform group-hover:scale-105" alt="Daikin" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto px-6 lg:px-20 pt-32 lg:pt-0">
        
        {/* Left Side: Animated Brand Illustration */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center pr-12">
           <HVACIllustration />
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex items-center justify-center lg:justify-end pt-12 pb-32 lg:py-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-12 text-center flex flex-col items-center">
              {isRequestMode ? (
                <>
                  <h2 className="text-4xl font-black tracking-tight text-[#323338] mb-2">
                    Access Request
                  </h2>
                  <p className="text-sm font-bold text-slate-400">
                    Silakan isi data untuk permintaan akses
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Welcome to DASI Service & Solutions Indonesia
                  </p>
                  
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#323338] mb-3">
                    The Digital <span className="text-[#00a1e4]">Revolution</span>
                  </h2>
                  
                  <p className="text-sm font-medium text-slate-500 mb-12">
                    A Breakthrough from DASI - Service Division - EPL
                  </p>
                  
                  <h3 className="text-xs md:text-sm font-black text-[#323338] tracking-[0.3em] uppercase mb-4">
                    Login
                  </h3>
                </>
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
                    <Link href="/forgot-password" className="text-[10px] font-bold text-[#0073ea] hover:underline transition-all uppercase tracking-widest">
                      Lupa Sandi?
                    </Link>
                  </div>
                )}
              </div>

              {!isRequestMode && (
                <div className="flex justify-center py-2 min-h-[65px] mb-4">
                  <div 
                    className="cf-turnstile" 
                    data-sitekey="0x4AAAAAAADGD9nT3x6TSaE8-"
                    data-theme="light"
                  ></div>
                </div>
              )}

              {isRequestMode && (
                <div className="flex items-start gap-2 pb-2 px-2">
                  <input 
                    type="checkbox" 
                    id="privacy-policy-agree"
                    required 
                    className="mt-1 w-4 h-4 text-[#0073ea] border-slate-300 rounded focus:ring-[#0073ea]"
                  />
                  <label htmlFor="privacy-policy-agree" className="text-xs text-slate-500 leading-snug">
                    Saya telah membaca dan menyetujui <Link href="/privacy-policy" target="_blank" className="text-[#0073ea] font-bold hover:underline">Kebijakan Privasi</Link> DSSI Connect.
                  </label>
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

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
        <ScrollIndicator text="Discover Our Heritage" targetId="section-global" />
      </div>

      </div>{/* End SEKSI 0 */}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI 1: DAIKIN GLOBAL HERITAGE                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="section-global" className="min-h-screen lg:h-screen lg:snap-start flex flex-col items-center justify-center relative py-16 lg:py-0"
        style={{ background: "linear-gradient(135deg, #0c1929 0%, #112240 50%, #0a192f 100%)" }}>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div key={i}
              className="absolute w-1 h-1 bg-cyan-400/20 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [-20, 20, -20], opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img src="/daikin_logo.png" className="h-6 lg:h-8 mx-auto mb-6" alt="Daikin" />
            <h2 className="text-3xl lg:text-6xl font-black text-white mb-4 tracking-tight">
              A Century of Engineering
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Excellence</span>
            </h2>
            <p className="text-sm lg:text-base text-slate-400 mb-10 lg:mb-16">Founded in 1924 · Osaka, Japan</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {[
              { end: 100, suffix: "+", label: "Years of History" },
              { end: 60805, label: "Employees Worldwide" },
              { end: 160, suffix: "+", label: "Countries" },
              { end: 213, label: "Group Companies" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="text-2xl lg:text-4xl font-black text-white">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix || ""} />
                </div>
                <div className="text-[10px] lg:text-xs text-slate-400 font-bold mt-2 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.p
            className="text-xs lg:text-sm text-slate-500 mt-8 lg:mt-12 font-bold uppercase tracking-widest"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            Global & Comprehensive HVAC Equipment Manufacturer
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI 2: DAIKIN INDONESIA — ORG CHART                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="section-indonesia" className="min-h-screen lg:h-screen lg:snap-start flex flex-col items-center justify-center py-16 lg:py-0 bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center mb-8 lg:mb-12 px-6">
          <motion.h2
            className="text-2xl lg:text-5xl font-black text-slate-800 mb-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            The Indonesian <span className="text-[#0073ea]">Chapter</span>
          </motion.h2>
          <motion.p
            className="text-xs lg:text-sm text-slate-500 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            4 Operating Companies · 50+ Years in Indonesia
          </motion.p>
        </div>
        <OrgChart />
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI 3: PETA INDONESIA — DASI NATIONWIDE                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="section-map" className="min-h-screen lg:h-screen lg:snap-start flex flex-col items-center justify-center py-16 lg:py-0 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-center mb-8 lg:mb-12 px-6">
          <motion.h2
            className="text-2xl lg:text-5xl font-black text-white mb-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            From Surabaya to <span className="text-cyan-400">Timika</span>
          </motion.h2>
          <motion.p
            className="text-xs lg:text-sm text-slate-400 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Serving Indonesia&apos;s Critical Infrastructure
          </motion.p>
        </div>
        <IndonesiaMap />
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI 4: SERVICE & SOLUTIONS + CHILLER DIAGRAM            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="section-services" className="min-h-screen lg:h-screen lg:snap-start flex flex-col items-center justify-center py-16 lg:py-0 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center mb-8 lg:mb-12 px-6">
          <motion.h2
            className="text-2xl lg:text-5xl font-black text-slate-800 mb-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Comprehensive <span className="text-[#0073ea]">Service & Solutions</span>
          </motion.h2>
          <motion.p
            className="text-xs lg:text-sm text-slate-500 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            End-to-end HVAC solutions for your business
          </motion.p>
        </div>
        
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-4">
          <div className="w-full lg:w-1/2">
            <ChillerDiagram />
          </div>
          <div className="w-full lg:w-1/2">
            <ServiceGrid />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEKSI 5: DSSI — THE DIGITAL POWERHOUSE                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="section-dssi" className="min-h-screen lg:h-screen lg:snap-start flex flex-col items-center justify-center py-16 lg:py-0"
        style={{ background: "linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0c1222 100%)" }}>
        <div className="text-center mb-6 lg:mb-10 px-6">
          <motion.h2
            className="text-2xl lg:text-5xl font-black text-white mb-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            The Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Revolution</span>
          </motion.h2>
          <motion.p
            className="text-xs lg:text-sm text-slate-400 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Innovation born from DASI Service Division
          </motion.p>
        </div>
        <DSSIShowcase />

        {/* CTA back to login */}
        <motion.button
          onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
          className="mt-8 lg:mt-12 flex items-center gap-2 bg-gradient-to-r from-[#0073ea] to-blue-600 text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-full hover:shadow-[0_8px_30px_rgba(0,115,234,0.4)] transition-all"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp className="w-4 h-4" />
          Masuk Sekarang
        </motion.button>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="lg:snap-start w-full py-10 lg:py-16 bg-slate-950 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <img src="/daikin_logo.png" className="h-5 mx-auto mb-4" alt="Daikin" />
          <p className="text-xs text-slate-500 font-medium mb-2">
            DASI Service & Solutions Indonesia (DSSI) · Expanded Product Line (EPL)
          </p>
          <p className="text-xs text-slate-600">
            Head Office: Jl. Opak No.33, Darmo, Wonokromo, Surabaya 60241
          </p>
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[11px] text-slate-600">
              &copy; {new Date().getFullYear()} DSSI Connect. All rights reserved. {" | "}
              <Link href="/privacy-policy" className="text-[#0073ea] hover:underline font-bold">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </footer>

      <TwoFactorModal 
        isOpen={show2fModal}
        onClose={() => {
          setShow2fModal(false);
          setError(null);
        }}
        email={tempEmail}
        isLoading={isLoading}
        error={error}
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
    </main>
  );
}
