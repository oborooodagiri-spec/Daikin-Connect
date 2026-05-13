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
  <div className="w-full h-full flex flex-col p-12 md:p-24 pt-32 md:pt-40 justify-center">
    <div className="mb-12 space-y-2">
       <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-slate-900">{title}</h2>
       {subtitle && <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{subtitle}</p>}
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
        <h5 className="text-lg font-black uppercase tracking-tight text-slate-900">{title}</h5>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{pic}</p>
        <p className="text-[11px] text-slate-500 font-medium max-w-[180px] mx-auto leading-relaxed">{desc}</p>
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

function TierDetailCard({ tier, name, color, input, analytics, output, audience, isFeatured = false }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all h-full flex flex-col ${isFeatured ? 'bg-blue-50 border-blue-200 shadow-xl' : 'bg-slate-50 border-slate-100'}`}>
       <div className="mb-6 flex justify-between items-start">
          <TierBadge level={tier} color={color} />
          <span className="text-[9px] font-black text-slate-400 uppercase">TIER {tier}</span>
       </div>
       <h3 className="text-xl font-black uppercase mb-6 tracking-tight text-slate-900">{name}</h3>
       <div className="space-y-4 flex-1">
          <DetailRow label="Input Data" val={input} />
          <DetailRow label="Analitik" val={analytics} />
          <DetailRow label="Output Report" val={output} />
          <DetailRow label="Target" val={audience} highlight />
       </div>
    </div>
  );
}

function ShoppingTable({ category, items }: { category: string, items: any[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm mb-6">
       <div className="bg-slate-900 px-6 py-3 text-white text-[10px] font-black uppercase tracking-widest">
          {category}
       </div>
       <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[8px] font-black uppercase text-slate-400">
             <tr>
                <th className="px-6 py-3">Deskripsi Pekerjaan (Scope)</th>
                <th className="px-6 py-3">Unit / Kapasitas</th>
                <th className="px-6 py-3">Satuan</th>
                <th className="px-6 py-3 text-right">Harga HPP</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
             {items.map((item, i) => (
               <tr key={i} className="text-[10px] text-slate-600 font-bold hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">{item.scope}</td>
                  <td className="px-6 py-4">{item.unit}</td>
                  <td className="px-6 py-4">Per Unit</td>
                  <td className="px-6 py-4 text-right text-slate-300 italic font-medium">Coming Soon</td>
               </tr>
             ))}
          </tbody>
       </table>
    </div>
  );
}

export default function BlueprintPresentationClient() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  
  const slides = [
    // Slide 1: Title
    {
      title: "Value Engineering Services",
      content: (
        <div className="flex flex-col items-center justify-center text-center py-10">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="relative mb-16 flex items-center gap-6"
           >
              <img src="/daikin_logo.png" className="h-10 object-contain" alt="Daikin" />
              <div className="w-px h-10 bg-slate-200" />
              <img src="/logo_epl_connect_1.png" className="h-14 object-contain" alt="EPL" />
           </motion.div>
           <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-12 text-slate-900">
              Value Engineering<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 italic">Core Roadmap.</span>
           </h1>
           <p className="text-xl text-slate-500 font-bold max-w-3xl mx-auto uppercase tracking-[0.4em] leading-relaxed border-y border-slate-100 py-6">
              PETUNJUK PELAKSANAAN (JUKLAK) & PETUNJUK TEKNIS (JUKNIS)
           </p>
        </div>
      )
    },
    // Slide 2: Service Tiering Detail
    {
      title: "Alur Kerja Berdasarkan Tiering",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <TierDetailCard 
             tier="01" 
             name="Tier 1: DASAR (Descriptive)" 
             color="slate"
             input="Logsheet Manual (Parameter & Visual)"
             analytics="Kompilasi Summary Report PDF"
             output="Rekomendasi Perbaikan Reaktif"
             audience="Teknisi / Engineer"
           />
           <TierDetailCard 
             tier="02" 
             name="Tier 2: MENENGAH (Proactive)" 
             color="blue"
             input="Real-time Input ke EPL CONNECT"
             analytics="Health Index Scoring"
             output="Live Dashboard & Alarm Otomatis"
             audience="Building Manager (BM)"
             isFeatured
           />
           <TierDetailCard 
             tier="03" 
             name="Tier 3: LENGKAP (Predictive)" 
             color="indigo"
             input="Tier 2 + kWh Meter & Cooling Load"
             analytics="Digital Twin (kW/TR Analysis)"
             output="ROI & Cost Saving bulanan"
             audience="Management"
           />
        </div>
      )
    },
    // Slide 3: Pre-contract & Onboarding
    {
      title: "Pra-Kontrak & Onboarding",
      subtitle: "Baseline & Asset Management",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-6">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                 <h4 className="text-lg font-black uppercase mb-3 text-blue-600 flex items-center gap-2">
                    <Search size={20} /> Genba / Site Audit
                 </h4>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium">Asesmen lapangan untuk baseline performa. Wajib observasi energi (tagihan & estimasi konsumsi) untuk Tier 3.</p>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                 <h4 className="text-lg font-black uppercase mb-3 text-indigo-600 flex items-center gap-2">
                    <Database size={20} /> Asset Onboarding
                 </h4>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium">Registrasi QR Code & input data desain pabrikan (Ampere Max, Flow Rate, Head) sebagai batas toleransi sistem.</p>
              </div>
           </div>
           <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Fingerprint size={120} /></div>
              <h5 className="text-2xl font-black uppercase mb-6 tracking-tighter">Krusial Algoritma</h5>
              <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                    <p className="text-sm text-slate-400 font-medium">Data baseline menjadi parameter pembanding utama untuk mendeteksi degradasi performa.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                    <p className="text-sm text-slate-400 font-medium">Tanpa data onboarding yang akurat, Health Index (Tier 2) & ROI (Tier 3) tidak dapat dikalkulasi secara valid.</p>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    // Slide 4: Digital Reporting Workflow
    {
      title: "Digital Reporting Workflow",
      subtitle: "Validasi & Distribusi",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative py-12">
           <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 hidden md:block" />
           <WorkflowStep 
             step="1" 
             title="Persiapan" 
             pic="Helpdesk / Admin" 
             icon={Clock} 
             desc="Monitoring operasional, penjadwalan via EPL CONNECT, & manajemen SIKA." 
           />
           <WorkflowStep 
             step="2" 
             title="Eksekusi" 
             pic="Teknisi" 
             icon={Laptop} 
             desc="Scan QR Code unit, isi form live, foto before/after, & e-Sign klien." 
             isMain
           />
           <WorkflowStep 
             step="3" 
             title="Validasi" 
             pic="Chief Engineer" 
             icon={ShieldCheck} 
             desc="Review raw data teknisi & konfirmasi Health Index Scoring." 
           />
           <WorkflowStep 
             step="4" 
             title="Distribusi" 
             pic="Sistem EPL CONNECT" 
             icon={Globe} 
             desc="Otomatis kirim PDF Laporan Performa via Email." 
           />
        </div>
      )
    },
    // Slide 5: Matriks SLA Adaptif
    {
      title: "Matriks SLA Adaptif",
      content: (
        <div className="space-y-6">
           <SlaRow 
             tier="TIER 3" 
             name="Prioritas (Predictive Clients)" 
             response="-" 
             arrival="-" 
             desc="Penanganan khusus untuk klien dengan kontrak efisiensi energi." 
             color="rose" 
           />
           <SlaRow 
             tier="TIER 2" 
             name="Proaktif (Proactive Clients)" 
             response="-" 
             arrival="-" 
             desc="Respon cepat berdasarkan alarm sistem sebelum unit rusak." 
             color="orange" 
           />
           <SlaRow 
             tier="TIER 1" 
             name="Standar (Descriptive Clients)" 
             response="-" 
             arrival="-" 
             desc="Kenyamanan komersial atau sesuai jadwal rutinitas." 
             color="slate" 
           />
        </div>
      )
    },
    // Slide 6: Juknis Chiller Plant
    {
      title: "Juknis: Chiller Plant",
      subtitle: "Water-Cooled Optimization",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-6">
              <h4 className="text-xl font-black uppercase text-blue-600">Standard Tier 1 & 2</h4>
              <ul className="space-y-4">
                 <li className="flex items-start gap-3 text-xs text-slate-600 font-bold">
                    <Check size={16} className="text-blue-500 mt-0.5" />
                    Cek Approach Temperature (&lt; 2°C).
                 </li>
                 <li className="flex items-start gap-3 text-xs text-slate-600 font-bold">
                    <Check size={16} className="text-blue-500 mt-0.5" />
                    Cek visual kebocoran freon/oli & tarikan Ampere.
                 </li>
                 <li className="flex items-start gap-3 text-xs text-slate-600 font-bold">
                    <Check size={16} className="text-blue-500 mt-0.5" />
                    Vibrasi bearing & Mechanical Seal pompa.
                 </li>
              </ul>
           </div>
           <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-6 text-white">
              <div className="inline-flex px-3 py-1 bg-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest">Premium Tier 3</div>
              <h4 className="text-xl font-black uppercase text-indigo-400">Predictive Analysis</h4>
              <ul className="space-y-4">
                 <li className="flex items-start gap-3 text-xs text-slate-400 font-medium">
                    <Zap size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                    Hitung kW/TR aktual. Jika > 0.6 kW/TR, ajukan proposal ROI Overhaul.
                 </li>
                 <li className="flex items-start gap-3 text-xs text-slate-400 font-medium">
                    <Activity size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                    Vibration Trend Analysis bulanan untuk prediksi kegagalan bearing.
                 </li>
              </ul>
           </div>
        </div>
      )
    },
    // Slide 7: Action Strategy (Reaktif/Proaktif/Strategis)
    {
      title: "Action Strategy Hub",
      subtitle: "Evaluasi & Rekomendasi",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
           <ActionCard 
             type="REAKTIF (Tier 1)" 
             tier="1" 
             icon={Shield} 
             example='"Sensor rusak, mohon diganti."' 
             desc="Rekomendasi perbaikan setelah ditemukan kerusakan fisik."
           />
           <ActionCard 
             type="PROAKTIF (Tier 2)" 
             tier="2" 
             icon={TrendingUp} 
             example='"Health Index turun (90%->75%) suhu oli naik. Cek filter oli."' 
             desc="Memberikan peringatan dini berdasarkan tren data."
             isHighlight
           />
           <ActionCard 
             type="STRATEGIS (Tier 3)" 
             tier="3" 
             icon={Target} 
             example='"Chiller lama 1.2 kW/TR. Retrofit program ROI 18 bulan."' 
             desc="Pertemuan manajemen strategis berbasis data finansial."
           />
        </div>
      )
    },
    // Slide 8: Shopping List Kategori A & B
    {
      title: "Shopping List Vendor (1/2)",
      subtitle: "Kategori A: Chiller & Kategori B: VRV/VRF",
      content: (
        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
           <ShoppingTable 
             category="KATEGORI A: CHILLER PLANT"
             items={[
               { scope: "Cuci Kondensor (Tube Brushing)", unit: "WC Chiller (>150 TR)", price: "" },
               { scope: "Inspeksi Rutin & Logsheet", unit: "All Chiller", price: "" },
               { scope: "Kuras Basin & Cuci Infill CT", unit: "CT (>200 HRT)", price: "" },
               { scope: "Cek Vibrasi & Greasing", unit: "Pompa Sentral", price: "" },
               { scope: "Jasa Ganti Mechanical Seal", unit: "Pompa Sentral", price: "" },
             ]}
           />
           <ShoppingTable 
             category="KATEGORI B: CENTRALIZED AIR-COOLED (VRV / VRF)"
             items={[
               { scope: "Cuci & Cek Parameter", unit: "Outdoor VRV (8-20 PK)", price: "" },
               { scope: "Cuci Filter, Koil, Cek Drain", unit: "Indoor Cassette/Duct", price: "" },
               { scope: "Cuci Filter, Koil, Cek Drain", unit: "Indoor Wall Mounted", price: "" },
               { scope: "Jasa Vacuum & Isi Freon R410a", unit: "Per Kg Freon", price: "" },
             ]}
           />
        </div>
      )
    },
    // Slide 9: Shopping List Kategori C, D & E
    {
      title: "Shopping List Vendor (2/2)",
      subtitle: "Kategori C, D & Kategori E: Ad-Hoc",
      content: (
        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
           <ShoppingTable 
             category="KATEGORI C & D: COMMERCIAL & LIGHT"
             items={[
               { scope: "Cuci Besar & Flushing Drain", unit: "Ceiling Duct (>3 PK)", price: "" },
               { scope: "Cuci Standar & Cek Ampere", unit: "Floor Standing (3-10 PK)", price: "" },
               { scope: "Cuci Standar & Cek Freon", unit: "Split Wall (1.5-2.5 PK)", price: "" },
             ]}
           />
           <ShoppingTable 
             category="KATEGORI E: JASA AD-HOC (Corrective)"
             items={[
               { scope: "Call-Out Fee (Troubleshoot)", unit: "Per Kunjungan", price: "" },
               { scope: "Jasa Ganti Kompresor", unit: "Unit < 5 PK", price: "" },
               { scope: "Jasa Flushing Pipa Refrigrant", unit: "Per Sistem", price: "" },
               { scope: "Chemical Descaling Pipa", unit: "Lot / Job", price: "" },
             ]}
           />
           <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl mt-4">
              <h5 className="text-xs font-black uppercase text-blue-600 mb-2">Syarat & Ketentuan Vendor:</h5>
              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-bold">
                 <p>• Harga mengikat selama 1 tahun anggaran.</p>
                 <p>• Wajib menggunakan aplikasi EPL CONNECT.</p>
                 <p>• Sudah mencakup material habis pakai dasar.</p>
                 <p>• Invoice cair jika status EPL CONNECT 100%.</p>
              </div>
           </div>
        </div>
      )
    },
    // Slide 10: Executive Review
    {
      title: "Executive Review",
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
