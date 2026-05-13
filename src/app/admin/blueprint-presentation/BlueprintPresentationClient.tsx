"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, Zap, Activity, BarChart3, 
  FileText, Globe, Cpu, Laptop, Check, ChevronRight, 
  Sparkles, Box, Layout, Award, X,
  Clock, Shield, TrendingUp, Search,
  Database, Fingerprint, Lock, Layers, Target, Calculator,
  Settings, UserCheck, AlertTriangle, DollarSign, Wind, Gauge
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
    {isNaN(Number(level)) ? level : `LEVEL ${level}`}
  </span>
);

const WorkflowStep = ({ step, title, pic, icon: Icon, desc, isMain = false }: any) => (
  <div className="flex flex-col items-center text-center relative z-10">
     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-2 ${isMain ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
        <Icon size={24} />
     </div>
     <div className="space-y-1">
        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">Tahap {step}</span>
        <h5 className="text-lg font-black uppercase tracking-tight">{title}</h5>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">{pic}</p>
        <p className="text-xs text-slate-400 font-medium max-w-[150px] mx-auto leading-relaxed">{desc}</p>
     </div>
  </div>
);

const JuknisCard = ({ title, icon: Icon, points }: any) => (
  <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:bg-white/[0.08] transition-all group">
     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:text-blue-500 transition-colors">
        <Icon size={24} />
     </div>
     <h4 className="text-xl font-black uppercase mb-6 tracking-tight">{title}</h4>
     <ul className="space-y-3">
        {points.map((p: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-xs text-slate-400 font-medium leading-relaxed">
             <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" />
             {p}
          </li>
        ))}
     </ul>
  </div>
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
              Petunjuk Pelaksanaan & Teknis (Operasional Nasional)
           </p>
           <div className="mt-16 flex items-center gap-8 opacity-40">
              <img src="/daikin_logo.png" className="h-5 brightness-0 invert" alt="Daikin" />
              <div className="w-px h-6 bg-white/20"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Scalability Framework</span>
           </div>
        </div>
      )
    },
    // Slide 2: Service Tiering
    {
      title: "Standardisasi Paket Layanan",
      subtitle: "Juknis: Modular & Universal",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <TierCard 
             tier="01" 
             name="DASAR" 
             color="slate"
             icon={Activity}
             input="Cuci AC Rutin & Visual Inspeksi"
             analytics="Digitalisasi Laporan Dasar (PDF)"
             output="Riwayat Aset Terpusat"
             audience="Preventive Maintenance"
           />
           <TierCard 
             tier="02" 
             name="MENENGAH" 
             color="blue"
             icon={Gauge}
             input="Pengukuran Parameter Teknis (Suhu/Ampere)"
             analytics="Health Index Scoring Per-Unit"
             output="Engineering Audit Reporting"
             audience="Performance Control"
             isFeatured
           />
           <TierCard 
             tier="03" 
             name="LENGKAP" 
             color="indigo"
             icon={Calculator}
             input="Audit Efisiensi Energi Menyeluruh"
             analytics="Predictive Analytics & Life Cycle"
             output="ROI & Cost Saving Analysis"
             audience="Strategic Value Engineering"
           />
        </div>
      )
    },
    // Slide 3: Pre-contract & Pitching
    {
      title: "Pra-Kontrak & Pitching",
      subtitle: "Baseline & Value Justification",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl group">
                 <h4 className="text-lg font-black uppercase mb-3 text-blue-400 flex items-center gap-2">
                    <Search size={20} /> Observasi Energi
                 </h4>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">Data tagihan listrik klien & estimasi konsumsi daya HVAC saat ini untuk menentukan baseline performa.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl group">
                 <h4 className="text-lg font-black uppercase mb-3 text-orange-400 flex items-center gap-2">
                    <TrendingUp size={20} /> Strategi Pitching
                 </h4>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">Justifikasi teknis & potensi ROI, termasuk opsi **Gain-sharing** (Bagi hasil dari penghematan listrik).</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl group">
                 <h4 className="text-lg font-black uppercase mb-3 text-indigo-400 flex items-center gap-2">
                    <Fingerprint size={20} /> Digital Passport
                 </h4>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">Registrasi unit (Merek, Model, Kapasitas) & Penempelan **QR Code** unik sebagai ID digital unit.</p>
              </div>
           </div>
           <div className="bg-slate-900/50 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border border-white/5">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-8 border border-blue-500/20">
                 <DollarSign size={48} />
              </div>
              <h5 className="text-2xl font-black uppercase mb-4 tracking-tighter">Gain-Sharing Model</h5>
              <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                 "Meningkatkan kepercayaan klien melalui model bisnis berbasis hasil penghematan yang terukur secara transparan di platform."
              </p>
           </div>
        </div>
      )
    },
    // Slide 4: Digital Reporting Workflow
    {
      title: "Digital Reporting Workflow",
      subtitle: "End-to-End Data Lifecycle",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative py-12">
           <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 hidden md:block" />
           <WorkflowStep 
             step="1" 
             title="Persiapan" 
             pic="Helpdesk / Admin" 
             icon={Clock} 
             desc="Tiket servis & SIKA (Izin Kerja)" 
           />
           <WorkflowStep 
             step="2" 
             title="Eksekusi" 
             pic="Teknisi" 
             icon={Laptop} 
             desc="Scan QR, Live Form, e-Sign Klien" 
             isMain
           />
           <WorkflowStep 
             step="3" 
             title="Validasi" 
             pic="Chief Engineer" 
             icon={ShieldCheck} 
             desc="Review Data & Health Scoring" 
           />
           <WorkflowStep 
             step="4" 
             title="Distribusi" 
             pic="Sistem (Auto)" 
             icon={Globe} 
             desc="Kirim PDF via Email/WA" 
           />
        </div>
      )
    },
    // Slide 5: SLA Matrix
    {
      title: "Matriks SLA Adaptif",
      subtitle: "Berdasarkan Klasifikasi Area",
      content: (
        <div className="space-y-6">
           <SlaRow 
             tier="KRITIS" 
             name="RS (OK/ICU), Data Center" 
             response="15 Menit" 
             arrival="Max 2 Jam" 
             desc="Area operasional kritis dengan toleransi downtime nol." 
             color="rose" 
           />
           <SlaRow 
             tier="PRIORITAS" 
             name="Pabrik, Industri Chiller" 
             response="30 Menit" 
             arrival="Max 4 Jam" 
             desc="Proses produksi massal yang bergantung pada suhu stabil." 
             color="orange" 
           />
           <SlaRow 
             tier="STANDAR" 
             name="Cabang Ritel, Kantor" 
             response="1 Jam" 
             arrival="1x24 Jam" 
             desc="Kenyamanan komersial atau sesuai kesepakatan regional." 
             color="slate" 
           />
        </div>
      )
    },
    // Slide 6: Juknis Chiller Plant (Module 1)
    {
      title: "Modul 1: Chiller Plant",
      subtitle: "Juknis: Water-Cooled System",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <JuknisCard 
             title="Water Cooled Chiller" 
             icon={Zap} 
             points={[
               "Approach Temp Evap/Cond (< 2°C)",
               "Cek visual kebocoran freon & oli",
               "Ukur Ampere kompresor"
             ]} 
           />
           <JuknisCard 
             title="Pompa Sirkulasi" 
             icon={Settings} 
             points={[
               "Ukur vibrasi bearing",
               "Cek keseimbangan arus fasa motor",
               "Inspeksi Mechanical Seal"
             ]} 
           />
           <JuknisCard 
             title="Cooling Tower" 
             icon={Wind} 
             points={[
               "Bersihkan basin & strainer",
               "Cek ketegangan V-Belt",
               "Ukur Ampere motor kipas"
             ]} 
           />
        </div>
      )
    },
    // Slide 7: Juknis VRV/VRF & Commercial DX (Module 2 & 3)
    {
      title: "Modul 2 & 3: VRV / DX",
      subtitle: "Juknis: Air-Cooled & Commercial DX",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
              <h4 className="text-xl font-black uppercase text-blue-400">Modul 2: VRV / VRF System</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Outdoor Unit</span>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">Cek tekanan freon tersentralisasi, koil kondensor, & modul inverter.</p>
                 </div>
                 <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Indoor & Control</span>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">Ukur Supply/Return Temp, cek motor drain, & baca error code remote.</p>
                 </div>
              </div>
           </div>
           <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
              <h4 className="text-xl font-black uppercase text-indigo-400">Modul 3: Commercial DX</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Preventive</span>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">Cuci koil indoor/outdoor dengan pompa tekanan tinggi.</p>
                 </div>
                 <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Inspeksi Teknis</span>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">Ukur Ampere kompresor & pastikan jalur drain lancar (No Leak).</p>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    // Slide 8: Executive Review
    {
      title: "Executive Review",
      subtitle: "Financial Reporting & B2B Strategy",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-10">
           <div className="space-y-8">
              <div className="flex gap-6 items-start">
                 <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0"><BarChart3 /></div>
                 <div>
                    <h5 className="text-lg font-black uppercase mb-1">Laporan Nilai Bisnis</h5>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Presentasi perbandingan konsumsi daya riil vs baseline untuk Direksi/BOD klien.</p>
                 </div>
              </div>
              <div className="flex gap-6 items-start">
                 <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0"><Award /></div>
                 <div>
                    <h5 className="text-lg font-black uppercase mb-1">Keterlibatan Eksekutif</h5>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Rapat evaluasi strategis dihadiri level manajemen senior guna menjaga hubungan B2B.</p>
                 </div>
              </div>
           </div>
           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <h4 className="text-3xl font-black uppercase mb-4 tracking-tighter">Scalable Solution</h4>
              <p className="text-indigo-100 font-medium leading-relaxed">
                 "Blueprint ini dirancang untuk dapat diukur di berbagai skala proyek—mulai dari gedung tunggal hingga jaringan ritel nasional."
              </p>
           </div>
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
