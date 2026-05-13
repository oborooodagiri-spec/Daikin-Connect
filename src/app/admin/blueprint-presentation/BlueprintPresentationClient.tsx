"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, Zap, Activity, BarChart3, 
  FileText, Globe, Cpu, Laptop, Check, ChevronRight, 
  Sparkles, Box, Layout, Award, X,
  Clock, Shield, TrendingUp, Search,
  Database, Fingerprint, Lock, Layers, Target, Calculator,
  Settings, UserCheck, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Sub-components ---

const SlideWrapper = ({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: string }) => (
  <div className="w-full h-full flex flex-col p-12 md:p-24 justify-center">
    <div className="mb-16 space-y-4">
       <motion.div 
         initial={{ opacity: 0, x: -20 }}
         whileInView={{ opacity: 1, x: 0 }}
         className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#00a1e4] text-[10px] font-black uppercase tracking-[0.4em]"
       >
          <Sparkles size={14} /> Master Blueprint V2
       </motion.div>
       <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">{title}</h2>
       {subtitle && <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">{subtitle}</p>}
    </div>
    <div className="flex-1">
       {children}
    </div>
  </div>
);

const TierBadge = ({ level, color }: { level: string, color: string }) => (
  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-${color}-500/10 border border-${color}-500/30 text-${color}-400`}>
    TIER {level}
  </span>
);

export default function BlueprintPresentationClient() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  
  const slides = [
    // Slide 1: Title
    {
      title: "Master Blueprint V2",
      content: (
        <div className="flex flex-col items-center justify-center text-center py-20">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="relative mb-12"
           >
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
              <Layers size={120} className="text-blue-500 relative z-10 animate-pulse" />
           </motion.div>
           <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-8">
              Value Engineering<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a1e4] via-blue-600 to-indigo-600">Services.</span>
           </h1>
           <p className="text-xl text-slate-400 font-bold max-w-3xl mx-auto uppercase tracking-widest leading-relaxed">
              Integrasi Operasional Nasional: Tier 1, 2, & 3
           </p>
           <div className="mt-16 flex items-center gap-8 opacity-40">
              <img src="/daikin_logo.png" className="h-5 brightness-0 invert" alt="Daikin" />
              <div className="w-px h-6 bg-white/20"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Internal Presentation v2.0</span>
           </div>
        </div>
      )
    },
    // Slide 2: Tiering Matrix
    {
      title: "Tiering Workflow Matrix",
      subtitle: "Juklak: Level Strategis",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <TierCard 
             tier="1" 
             name="DASAR (Descriptive)" 
             color="slate"
             icon={FileText}
             input="Logsheet Manual & Visual (Kertas/PDF)"
             analytics="Kompilasi dokumen Summary Report PDF"
             output="Rekomendasi Reaktif (Perbaikan Kerusakan)"
             audience="Teknisi Gedung / Supervisor"
           />
           <TierCard 
             tier="2" 
             name="MENENGAH (Proactive)" 
             color="blue"
             icon={Activity}
             input="EPL CONNECT Real-time App Input"
             analytics="Health Index Scoring (Sistem Digital)"
             output="Live Dashboard & Alarm Otomatis"
             audience="Chief Engineer / FM"
             isFeatured
           />
           <TierCard 
             tier="3" 
             name="LENGKAP (Predictive)" 
             color="indigo"
             icon={Zap}
             input="kWh Monitoring & Beban Aktual"
             analytics="Digital Twin & Efisiensi kW/TR"
             output="ROI & Cost Saving Report (Financial)"
             audience="BOD / Owner / Finance"
           />
        </div>
      )
    },
    // Slide 3: Pre-contract & Onboarding
    {
      title: "Pra-Kontrak & Onboarding",
      subtitle: "Asesmen & Asset Management",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-8">
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Search size={80} /></div>
                 <h4 className="text-xl font-black uppercase mb-4 text-blue-400">1. Fase Genba (Site Audit)</h4>
                 <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                       <Check className="text-blue-500 mt-1" size={16} />
                       <p className="text-sm font-bold text-slate-300">Observasi Energi (Wajib Tier 3): Pengumpulan data tagihan listrik baseline.</p>
                    </li>
                    <li className="flex items-start gap-3">
                       <Check className="text-blue-500 mt-1" size={16} />
                       <p className="text-sm font-bold text-slate-300">Identifikasi Pemborosan: Audit insulasi, kerak air, dan penurunan efisiensi.</p>
                    </li>
                 </ul>
              </div>
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Fingerprint size={80} /></div>
                 <h4 className="text-xl font-black uppercase mb-4 text-indigo-400">2. Onboarding Aset</h4>
                 <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                       <Check className="text-indigo-500 mt-1" size={16} />
                       <p className="text-sm font-bold text-slate-300">QR Code Labeling: Pemindaian wajib (In/Out) untuk validasi kehadiran teknisi.</p>
                    </li>
                    <li className="flex items-start gap-3">
                       <Check className="text-indigo-500 mt-1" size={16} />
                       <p className="text-sm font-bold text-slate-300">Baseline Data Input: Desain Ampere, Flow Rate, & Head sebagai batas toleransi sistem.</p>
                    </li>
                 </ul>
              </div>
           </div>
           <div className="flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-sm">
                 <div className="absolute inset-0 border border-blue-500/20 rounded-full animate-spin-slow" />
                 <div className="absolute inset-4 border border-indigo-500/20 rounded-full animate-spin-reverse-slow" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Database size={64} className="text-blue-500" />
                 </div>
              </div>
           </div>
        </div>
      )
    },
    // Slide 4: SLA Matrix
    {
      title: "Matriks SLA Adaptif",
      subtitle: "Service Level Agreement",
      content: (
        <div className="space-y-8 py-10">
           <SlaRow tier="3" name="VIP STRATEGIC" response="15 Menit" arrival="2-4 Jam" desc="Untuk RS, Industri, & Data Center (Operasional Kritis)" color="indigo" />
           <SlaRow tier="2" name="PROAKTIF" response="30 Menit" arrival="4-8 Jam" desc="Alarm otomatis & mitigasi sebelum breakdown" color="blue" />
           <SlaRow tier="1" name="STANDAR" response="60 Menit" arrival="24 Jam" desc="Respon reaktif & jadwal reguler" color="slate" />
        </div>
      )
    },
    // Slide 5: Juknis Operasional
    {
      title: "Juknis Lapangan",
      subtitle: "Standardisasi Pemungutan Data",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] space-y-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500"><Laptop size={24} /></div>
              <h4 className="text-2xl font-black uppercase text-white">Validasi Digital (Tier 2)</h4>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                 Teknisi WAJIB memindahkan data logsheet secara akurat ke **EPL CONNECT** langsung di lokasi (No Delay).
              </p>
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Status Target</span>
                 <p className="text-white font-bold text-xs">Live Dashboard Sync 100%</p>
              </div>
           </div>
           <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] space-y-6">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500"><Calculator size={24} /></div>
              <h4 className="text-2xl font-black uppercase text-white">Data Finansial (Tier 3)</h4>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                 Chief Engineer wajib meminta data **kWh Bulanan** panel HVAC dari klien untuk perhitungan Cost Saving.
              </p>
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Output Target</span>
                 <p className="text-white font-bold text-xs">Monthly ROI Report</p>
              </div>
           </div>
        </div>
      )
    },
    // Slide 6: Action Recommendations
    {
      title: "Action Strategy Hub",
      subtitle: "Evaluasi & Rekomendasi",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
           <ActionCard 
             type="REAKTIF" 
             tier="1" 
             icon={Shield} 
             example='"Sensor rusak, mohon diganti"' 
             desc="Berdasarkan kerusakan fisik nyata."
           />
           <ActionCard 
             type="PROAKTIF" 
             tier="2" 
             icon={TrendingUp} 
             example='"Health Index turun (90% -> 75%), cek filter oli."' 
             desc="Berdasarkan tren data algoritma."
             isHighlight
           />
           <ActionCard 
             type="STRATEGIS" 
             tier="3" 
             icon={Target} 
             example='"Investasi VFD akan ROI dalam 18 bulan."' 
             desc="Pertemuan manajemen tingkat BOD."
           />
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (activeSlide < slides.length - 1) setActiveSlide(activeSlide + 1);
  };

  const prevSlide = () => {
    if (activeSlide > 0) setActiveSlide(activeSlide - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlide]);

  return (
    <div className="min-h-screen bg-[#040814] text-white overflow-hidden selection:bg-blue-500">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b,transparent)]" />
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 px-12 py-8 flex justify-between items-center">
         <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/home/knowledge')}>
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
               <ChevronRight className="rotate-180" size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Back to Hub</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slide</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{activeSlide + 1} / {slides.length}</span>
         </div>
      </nav>

      {/* Main Content */}
      <main className="relative h-screen">
         <AnimatePresence mode="wait">
            <motion.div 
              key={activeSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="w-full h-full"
            >
               <SlideWrapper 
                 title={slides[activeSlide].title} 
                 subtitle={slides[activeSlide].subtitle}
               >
                 {slides[activeSlide].content}
               </SlideWrapper>
            </motion.div>
         </AnimatePresence>

         {/* Navigation Controls */}
         <div className="fixed bottom-12 right-12 flex gap-4">
            <button 
              onClick={prevSlide}
              disabled={activeSlide === 0}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
               <ChevronRight className="rotate-180" />
            </button>
            <button 
              onClick={nextSlide}
              disabled={activeSlide === slides.length - 1}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
               <ChevronRight />
            </button>
         </div>
      </main>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 h-1.5 bg-white/5 w-full">
         <motion.div 
           className="h-full bg-blue-500 shadow-[0_0_20px_#3b82f6]"
           initial={{ width: "0%" }}
           animate={{ width: `${((activeSlide + 1) / slides.length) * 100}%` }}
         />
      </div>
    </div>
  );
}

// --- Internal UI Components ---

function TierCard({ tier, name, color, icon: Icon, input, analytics, output, audience, isFeatured = false }: any) {
  return (
    <div className={`p-10 rounded-[3.5rem] border transition-all h-full flex flex-col ${isFeatured ? 'bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-500/10' : 'bg-white/5 border-white/5'}`}>
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isFeatured ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-500'}`}>
          <Icon size={24} />
       </div>
       <div className="mb-8">
          <TierBadge level={tier} color={color} />
          <h3 className="text-2xl font-black uppercase mt-3 tracking-tight">{name}</h3>
       </div>
       <div className="space-y-6 flex-1">
          <DetailRow label="Input" val={input} />
          <DetailRow label="Analitik" val={analytics} />
          <DetailRow label="Output" val={output} />
          <DetailRow label="Target" val={audience} highlight />
       </div>
    </div>
  );
}

function DetailRow({ label, val, highlight = false }: { label: string, val: string, highlight?: boolean }) {
  return (
    <div>
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">{label}</span>
       <p className={`text-xs font-bold leading-relaxed ${highlight ? 'text-blue-400' : 'text-slate-300'}`}>{val}</p>
    </div>
  );
}

function SlaRow({ tier, name, response, arrival, desc, color }: any) {
  return (
    <div className="flex items-center gap-8 p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-blue-500/50 transition-all">
       <div className={`w-20 h-20 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex flex-col items-center justify-center shrink-0`}>
          <span className="text-[10px] font-black text-slate-500">TIER</span>
          <span className={`text-3xl font-black text-${color}-400`}>{tier}</span>
       </div>
       <div className="flex-1">
          <h4 className="text-lg font-black uppercase mb-1 tracking-tight">{name}</h4>
          <p className="text-xs text-slate-500 font-medium">{desc}</p>
       </div>
       <div className="text-right flex gap-12 items-center">
          <div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Respon</span>
             <p className="text-xl font-black text-white">{response}</p>
          </div>
          <div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Kedatangan</span>
             <p className="text-xl font-black text-white">{arrival}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all">
             <ChevronRight />
          </div>
       </div>
    </div>
  );
}

function ActionCard({ type, tier, icon: Icon, example, desc, isHighlight = false }: any) {
  return (
    <div className={`p-10 rounded-[3rem] border flex flex-col h-full ${isHighlight ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/5 border-white/5'}`}>
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-8 ${isHighlight ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white/10 text-slate-500'}`}>
          <Icon size={20} />
       </div>
       <div className="mb-6">
          <span className={`text-[9px] font-black uppercase tracking-widest ${isHighlight ? 'text-blue-400' : 'text-slate-500'}`}>Tipe: {type}</span>
          <h4 className="text-2xl font-black uppercase tracking-tighter mt-1">Tier {tier}</h4>
       </div>
       <div className="p-6 bg-black/40 border border-white/5 rounded-2xl mb-6 flex-1">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-3">Contoh Rekomendasi</span>
          <p className="text-sm font-bold italic text-slate-300 leading-relaxed">{example}</p>
       </div>
       <p className="text-xs font-medium text-slate-500">{desc}</p>
    </div>
  );
}
