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
       <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-slate-900">{title}</h2>
       {subtitle && <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">{subtitle}</p>}
    </div>
    <div className="flex-1">
       {children}
    </div>
  </div>
);

const TierBadge = ({ level, color }: { level: string, color: string }) => (
  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-${color}-500/10 border border-${color}-500/20 text-${color}-600`}>
    {isNaN(Number(level)) ? level : `LEVEL ${level}`}
  </span>
);

const WorkflowStep = ({ step, title, pic, icon: Icon, desc, isMain = false }: any) => (
  <div className="flex flex-col items-center text-center relative z-10">
     <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 border ${isMain ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/30' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
        <Icon size={28} />
     </div>
     <div className="space-y-1">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">Tahap {step}</span>
        <h5 className="text-xl font-black uppercase tracking-tight text-slate-900">{title}</h5>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{pic}</p>
        <p className="text-xs text-slate-500 font-medium max-w-[150px] mx-auto leading-relaxed">{desc}</p>
     </div>
  </div>
);

const JuknisCard = ({ title, icon: Icon, points }: any) => (
  <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:text-blue-600 border border-slate-100 transition-colors">
        <Icon size={24} />
     </div>
     <h4 className="text-xl font-black uppercase mb-6 tracking-tight text-slate-900">{title}</h4>
     <ul className="space-y-3">
        {points.map((p: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-xs text-slate-500 font-medium leading-relaxed">
             <div className="w-1 h-1 rounded-full bg-blue-600 mt-2 shrink-0" />
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
      title: "Value Engineering Services",
      content: (
        <div className="flex flex-col items-center justify-center text-center py-20">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="relative mb-16 flex items-center gap-6"
           >
              <img src="/daikin_logo.png" className="h-12 object-contain" alt="Daikin" />
              <div className="w-px h-12 bg-slate-200" />
              <img src="/logo_epl_connect_1.png" className="h-16 object-contain" alt="EPL" />
           </motion.div>
           <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-12 text-slate-900">
              Value Engineering<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 italic">Core Roadmap.</span>
           </h1>
           <p className="text-xl text-slate-500 font-bold max-w-3xl mx-auto uppercase tracking-[0.4em] leading-relaxed border-y border-slate-100 py-6">
              Value Engineering Services
           </p>
           <div className="mt-16 flex items-center gap-4 text-slate-400">
              <Sparkles size={16} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Executive Strategy Framework</span>
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
      title: "Strategi Pitching & Justifikasi",
      subtitle: "Winning The B2B Market",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-6">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl hover:border-blue-500/50 transition-all">
                 <h4 className="text-lg font-black uppercase mb-3 text-blue-600 flex items-center gap-2">
                    <ShieldCheck size={20} /> Asset Life Extension
                 </h4>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium">Fokus pada pengurangan degradasi komponen untuk menunda investasi CAPEX (pembelian unit baru).</p>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl hover:border-blue-500/50 transition-all">
                 <h4 className="text-lg font-black uppercase mb-3 text-indigo-600 flex items-center gap-2">
                    <Layout size={20} /> Operational Transparency
                 </h4>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium">Dashboard sebagai "Single Source of Truth" untuk memantau performa aset & kepatuhan teknisi secara real-time.</p>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl opacity-60 border-dashed relative">
                 <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 px-2 py-1 rounded text-[7px] font-black uppercase">Future</div>
                 <h4 className="text-lg font-black uppercase mb-3 text-slate-400 flex items-center gap-2">
                    <TrendingUp size={20} /> Gain-sharing Model
                 </h4>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">Bagi hasil dari penghematan listrik riil yang berhasil dicapai melalui program optimasi VES.</p>
              </div>
           </div>
           <div className="bg-blue-600 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Target size={120} /></div>
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white mb-8 border border-white/30 backdrop-blur-md">
                 <DollarSign size={48} />
              </div>
              <h5 className="text-3xl font-black uppercase mb-4 tracking-tighter">Value vs Cost</h5>
              <p className="text-blue-50 font-bold text-lg leading-relaxed italic">
                 "Kita tidak menjual jasa cuci AC, kita menjual keberlangsungan aset dan efisiensi energi yang terukur."
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
           <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 hidden md:block" />
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
           <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-6">
              <h4 className="text-xl font-black uppercase text-blue-600">Modul 2: VRV / VRF System</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Outdoor Unit</span>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Cek tekanan freon tersentralisasi, koil kondensor, & modul inverter.</p>
                 </div>
                 <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Indoor & Control</span>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Ukur Supply/Return Temp, cek motor drain, & baca error code remote.</p>
                 </div>
              </div>
           </div>
           <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-6">
              <h4 className="text-xl font-black uppercase text-indigo-600">Modul 3: Commercial DX</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Preventive</span>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Cuci koil indoor/outdoor dengan pompa tekanan tinggi.</p>
                 </div>
                 <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Inspeksi Teknis</span>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Ukur Ampere kompresor & pastikan jalur drain lancar (No Leak).</p>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    // Slide 8: Action Strategy Hub
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
    },
    // Slide 9: Executive Review
    {
      title: "Executive Review",
      subtitle: "Financial Reporting & B2B Strategy",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-10">
           <div className="space-y-8">
              <div className="flex gap-6 items-start">
                 <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-blue-600 shrink-0"><BarChart3 /></div>
                 <div>
                    <h5 className="text-lg font-black uppercase mb-1 text-slate-900">Laporan Nilai Bisnis</h5>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Presentasi perbandingan konsumsi daya riil vs baseline untuk Direksi/BOD klien.</p>
                 </div>
              </div>
              <div className="flex gap-6 items-start">
                 <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0"><Award /></div>
                 <div>
                    <h5 className="text-lg font-black uppercase mb-1 text-slate-900">Keterlibatan Eksekutif</h5>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Rapat evaluasi strategis dihadiri level manajemen senior guna menjaga hubungan B2B.</p>
                 </div>
              </div>
           </div>
           <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
              <h4 className="text-3xl font-black uppercase mb-6 tracking-tighter">Scalable Solution</h4>
              <p className="text-slate-400 font-bold text-lg leading-relaxed">
                 "Platform ini dirancang untuk dapat diukur di berbagai skala proyek—mulai dari gedung tunggal hingga jaringan ritel nasional."
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
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
         <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 px-12 py-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-100">
         <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/home/knowledge')}>
            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all text-slate-600">
               <ChevronRight className="rotate-180" size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Back to Knowledge Hub</span>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slide</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{activeSlide + 1} / {slides.length}</span>
         </div>
      </nav>

      {/* Main Content */}
      <main className="relative h-screen">
         <AnimatePresence mode="wait">
            <motion.div 
              key={activeSlide}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: "circOut" }}
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
              className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all disabled:opacity-20 disabled:pointer-events-none text-slate-400"
            >
               <ChevronRight className="rotate-180" />
            </button>
            <button 
              onClick={nextSlide}
              disabled={activeSlide === slides.length - 1}
              className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all disabled:opacity-20 disabled:pointer-events-none text-slate-400"
            >
               <ChevronRight />
            </button>
         </div>
      </main>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 h-1.5 bg-slate-100 w-full">
         <motion.div 
           className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
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
    <div className={`p-10 rounded-[3.5rem] border transition-all h-full flex flex-col ${isFeatured ? 'bg-blue-50 border-blue-200 shadow-2xl shadow-blue-500/10' : 'bg-slate-50 border-slate-100'}`}>
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border ${isFeatured ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-400'}`}>
          <Icon size={24} />
       </div>
       <div className="mb-8">
          <TierBadge level={tier} color={color} />
          <h3 className="text-2xl font-black uppercase mt-3 tracking-tight text-slate-900">{name}</h3>
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
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
       <p className={`text-xs font-bold leading-relaxed ${highlight ? 'text-blue-600' : 'text-slate-600'}`}>{val}</p>
    </div>
  );
}

function SlaRow({ tier, name, response, arrival, desc, color }: any) {
  const colorMap: any = {
    rose: 'bg-rose-50 border-rose-200 text-rose-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
  };
  
  const textMap: any = {
    rose: 'text-rose-600',
    orange: 'text-orange-600',
    slate: 'text-slate-600',
  };

  return (
    <div className="flex items-center gap-8 p-6 bg-white border border-slate-200 rounded-[2rem] group hover:border-blue-500/50 transition-all shadow-sm">
       <div className={`w-24 h-24 rounded-[1.5rem] ${colorMap[color]} border flex flex-col items-center justify-center shrink-0`}>
          <span className="text-[10px] font-black opacity-60">AREA</span>
          <span className={`text-xl font-black`}>{tier}</span>
       </div>
       <div className="flex-1">
          <h4 className="text-xl font-black uppercase mb-1 tracking-tight text-slate-900">{name}</h4>
          <p className="text-xs text-slate-500 font-medium">{desc}</p>
       </div>
       <div className="text-right flex gap-12 items-center">
          <div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Respon</span>
             <p className="text-2xl font-black text-slate-900">{response}</p>
          </div>
          <div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Kedatangan</span>
             <p className="text-2xl font-black text-slate-900">{arrival}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
             <ChevronRight />
          </div>
       </div>
    </div>
  );
}


function ActionCard({ type, tier, icon: Icon, example, desc, isHighlight = false }: any) {
  return (
    <div className={`p-10 rounded-[3rem] border flex flex-col h-full ${isHighlight ? 'bg-blue-50 border-blue-200 shadow-xl shadow-blue-500/10' : 'bg-slate-50 border-slate-100'}`}>
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-8 border ${isHighlight ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white border-slate-200 text-slate-400'}`}>
          <Icon size={20} />
       </div>
       <div className="mb-6">
          <span className={`text-[9px] font-black uppercase tracking-widest ${isHighlight ? 'text-blue-600' : 'text-slate-400'}`}>Tipe: {type}</span>
          <h4 className="text-2xl font-black uppercase tracking-tighter mt-1 text-slate-900">Tier {tier}</h4>
       </div>
       <div className="p-6 bg-white border border-slate-100 rounded-2xl mb-6 flex-1 shadow-inner">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-3">Contoh Rekomendasi</span>
          <p className="text-sm font-bold italic text-slate-700 leading-relaxed">{example}</p>
       </div>
       <p className="text-xs font-medium text-slate-500">{desc}</p>
    </div>
  );
}
