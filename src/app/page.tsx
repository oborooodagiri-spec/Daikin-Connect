"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff
} from "lucide-react";

import { login, register } from "./actions/auth";
import TwoFactorModal from "@/components/auth/TwoFactorModal";
import LoadingLogo from "@/components/ui/LoadingLogo";

// New About Components
import ScrollIndicator from "@/components/about/ScrollIndicator";
import OrgChart from "@/components/about/OrgChart";
import IndonesiaMap from "@/components/about/IndonesiaMap";
import ServiceGrid from "@/components/about/ServiceGrid";
import ChillerDiagram from "@/components/about/ChillerDiagram";
import DSSIShowcase from "@/components/about/DSSIShowcase";
import DeviceMockup from "@/components/about/DeviceMockup";

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
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Selamat Pagi");
    else if (hour >= 12 && hour < 15) setGreeting("Selamat Siang");
    else if (hour >= 15 && hour < 18) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");

    if (typeof window !== "undefined") {
      localStorage.removeItem("daikin_last_project");
    }
  }, []);

  useEffect(() => {
    if (!isMounted || isRequestMode) return;
    document.querySelectorAll('script[src*="challenges.cloudflare.com/turnstile"]').forEach(s => s.remove());
    delete (window as any).turnstile;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
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
    <div className="h-screen w-full overflow-y-auto lg:snap-y lg:snap-mandatory overflow-x-hidden bg-white text-[#323338] selection:bg-blue-100 selection:text-blue-600 smooth-scroll">
      
      {/* SECTION 0: HERO & LOGIN */}
      <section id="login" className="relative min-h-screen lg:h-screen lg:snap-start flex flex-col pt-8 lg:pt-0">
        
        {/* Navbar Desktop Only */}
        <div className="absolute top-8 left-0 right-0 z-50 px-8 lg:px-20 hidden lg:flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto">
             <img src="/daikin_logo.png" className="h-5 w-auto object-contain transition-transform hover:scale-105 cursor-pointer" alt="Daikin" />
          </div>
          <div className="flex items-center gap-8 text-[11px] font-black tracking-widest uppercase pointer-events-auto text-slate-500">
            <button onClick={() => document.getElementById("global")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#0073ea] transition-colors">About Us</button>
            <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#0073ea] transition-colors">Services</button>
            <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#0073ea] transition-colors">Contact</button>
          </div>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden px-6 flex justify-center mb-8">
           <img src="/daikin_logo.png" className="h-5 w-auto object-contain" alt="Daikin" />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto px-6 lg:px-20 relative">
          
          {/* Left Side: Animated Brand Illustration */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center pr-12">
             <HVACIllustration />
          </div>

          {/* Right Side: Login Form */}
          <div className="flex-1 flex items-center justify-center lg:justify-end pb-24 lg:pb-0 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-white lg:bg-transparent p-6 lg:p-0 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none"
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
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-auto">
          <ScrollIndicator targetId="global" />
        </div>
      </section>

      {/* SECTION 1: DAIKIN GLOBAL */}
      <section id="global" className="relative min-h-screen lg:h-screen lg:snap-start bg-slate-900 flex items-center justify-center py-20 lg:py-0 overflow-hidden">
        {/* Background Particles/Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-8">
              <div className="bg-white px-6 py-3 rounded-full inline-block shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                 <img src="/daikin_logo.png" className="h-6 w-auto" alt="Daikin" />
              </div>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 tracking-tight">A Century of Engineering Excellence</h2>
            <p className="text-cyan-400 font-bold tracking-widest uppercase text-xs lg:text-sm mb-16">Founded in 1924 · Osaka, Japan</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              <div className="text-center">
                <div className="text-4xl lg:text-6xl font-black text-white mb-2">100</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Years of History</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-6xl font-black text-white mb-2">160</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-6xl font-black text-white mb-2">213</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Group Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-6xl font-black text-white mb-2">100+</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Production Bases</div>
              </div>
            </div>
            
            <div className="mt-16 text-slate-300 font-medium text-sm lg:text-base max-w-2xl mx-auto">
              Global & Comprehensive HVAC Equipment Manufacturer
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: DAIKIN INDONESIA (OrgChart) */}
      <section id="indonesia" className="relative min-h-screen lg:h-screen lg:snap-start bg-slate-50 flex items-center justify-center py-20 lg:py-0">
        <div className="w-full">
          <div className="text-center mb-12 lg:mb-20">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-800 mb-4 tracking-tight">The Indonesian Chapter</h2>
            <p className="text-[#0073ea] font-bold tracking-widest uppercase text-xs lg:text-sm">Daikin Group of Companies in Indonesia</p>
          </div>
          <OrgChart />
        </div>
      </section>

      {/* SECTION 3: MAP */}
      <section id="map" className="relative min-h-screen lg:h-screen lg:snap-start bg-slate-900 flex items-center justify-center py-20 lg:py-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
        <div className="w-full relative z-10">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 tracking-tight">From Surabaya to Timika</h2>
            <p className="text-cyan-400 font-bold tracking-widest uppercase text-xs lg:text-sm">Serving Indonesia's Critical Infrastructure</p>
          </div>
          <IndonesiaMap />
        </div>
      </section>

      {/* SECTION 4: SERVICES & SOLUTIONS */}
      <section id="services" className="relative min-h-screen lg:h-screen lg:snap-start bg-gradient-to-b from-white to-slate-50 flex items-center justify-center py-20 lg:py-0">
        <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-800 mb-4 tracking-tight">Service & Solutions</h2>
            <p className="text-[#0073ea] font-bold tracking-widest uppercase text-xs lg:text-sm">Comprehensive Excellence</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center">
            <div className="w-full lg:w-1/2">
              <ServiceGrid />
            </div>
            <div className="w-full lg:w-1/2 flex justify-center">
               <ChillerDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: DSSI SHOWCASE */}
      <section id="dssi" className="relative min-h-screen lg:h-screen lg:snap-start bg-slate-950 flex flex-col items-center justify-center py-20 lg:py-0">
        <div className="w-full mb-12 lg:mb-20">
          <DSSIShowcase />
        </div>
        
        <div className="w-full max-w-4xl mx-auto px-4">
          <DeviceMockup>
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
               {/* Mock UI inside laptop */}
               <div className="absolute inset-0 bg-blue-900/20" />
               <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/10 flex items-center px-4 gap-4 bg-slate-900/50">
                  <div className="w-24 h-3 bg-white/20 rounded-full" />
                  <div className="w-16 h-3 bg-white/10 rounded-full" />
                  <div className="w-16 h-3 bg-white/10 rounded-full" />
               </div>
               <div className="relative z-10 w-full mt-10">
                 <div className="flex justify-between items-end mb-8">
                   <div className="text-left">
                     <div className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-1">Daikin Unit Performance</div>
                     <div className="text-white text-2xl font-black">98.5% Efficiency</div>
                   </div>
                   <div className="w-32 h-16 bg-gradient-to-t from-cyan-500/20 to-transparent flex items-end justify-between px-2 pb-1 border-b border-cyan-500/50">
                     <div className="w-3 h-8 bg-cyan-500 rounded-t-sm" />
                     <div className="w-3 h-12 bg-cyan-500 rounded-t-sm" />
                     <div className="w-3 h-6 bg-cyan-500 rounded-t-sm" />
                     <div className="w-3 h-14 bg-cyan-500 rounded-t-sm" />
                     <div className="w-3 h-10 bg-cyan-500 rounded-t-sm" />
                   </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                   <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10">
                     <div className="text-white/40 text-[9px] font-bold uppercase mb-2">Chiller 1 Status</div>
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-white text-xs font-bold">Running (Normal)</span>
                     </div>
                   </div>
                   <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10">
                     <div className="text-white/40 text-[9px] font-bold uppercase mb-2">Evaporator Temp</div>
                     <div className="text-white text-lg font-black">7.2°C</div>
                   </div>
                   <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10">
                     <div className="text-white/40 text-[9px] font-bold uppercase mb-2">Condenser Press.</div>
                     <div className="text-white text-lg font-black">320 kPa</div>
                   </div>
                 </div>
               </div>
            </div>
          </DeviceMockup>
        </div>
      </section>

      {/* SECTION 6: FOOTER / CTA */}
      <section id="contact" className="relative py-20 lg:py-32 bg-white flex flex-col items-center justify-center lg:snap-end">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-5xl font-black text-slate-800 mb-6 tracking-tight">Siap Memulai?</h2>
          <button 
            onClick={() => document.getElementById("login")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-[#0073ea] text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 transform hover:shadow-[0_8px_30px_rgb(0,115,234,0.3)] hover:-translate-y-1 active:scale-95"
          >
            Kembali ke Login ↑
          </button>
        </div>
        
        <footer className="w-full text-center text-xs text-slate-400 font-medium mt-20 px-6">
          <div className="mb-4 flex items-center justify-center gap-6 text-[10px] uppercase tracking-widest font-bold">
            <Link href="/privacy-policy" className="hover:text-[#0073ea] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/sitemap.xml" className="hover:text-[#0073ea] transition-colors">Sitemap</Link>
          </div>
          <p>
            &copy; {new Date().getFullYear()} DSSI Connect — Daikin Applied Solutions Indonesia. All rights reserved.
          </p>
        </footer>
      </section>

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
    </div>
  );
}
