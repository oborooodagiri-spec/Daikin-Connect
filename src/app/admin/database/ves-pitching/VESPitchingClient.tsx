"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, ShieldCheck, TrendingUp, AlertTriangle, 
  Activity, ArrowRight, Zap, Target, Smartphone, Globe, CheckCircle2 
} from "lucide-react";

export default function VESPitchingClient() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: "hero", type: "hero" },
    { id: "compare", type: "compare" },
    { id: "advanced", type: "advanced" },
    { id: "benefits", type: "benefits" },
    { id: "connect", type: "connect" },
    { id: "closing", type: "closing" }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-hidden font-sans z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full h-full relative"
        >
          {slides[currentSlide].type === "hero" && <HeroSlide />}
          {slides[currentSlide].type === "compare" && <CompareSlide />}
          {slides[currentSlide].type === "advanced" && <AdvancedSlide />}
          {slides[currentSlide].type === "benefits" && <BenefitsSlide />}
          {slides[currentSlide].type === "connect" && <ConnectSlide />}
          {slides[currentSlide].type === "closing" && <ClosingSlide />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-50 pointer-events-none">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`pointer-events-auto p-3 rounded-full backdrop-blur-md border border-white/20 transition-all ${
            currentSlide === 0 ? "opacity-30 cursor-not-allowed bg-black/20" : "bg-black/50 hover:bg-[#0073ea] text-white"
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-2 pointer-events-auto">
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentSlide === idx ? "w-8 bg-[#0073ea]" : "bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        <button 
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`pointer-events-auto p-3 rounded-full backdrop-blur-md border border-white/20 transition-all ${
            currentSlide === slides.length - 1 ? "opacity-30 cursor-not-allowed bg-black/20" : "bg-black/50 hover:bg-[#0073ea] text-white"
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function HeroSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <img src="/services/ves_hero.jpg" alt="VES Hero" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-900" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-400 font-bold tracking-widest text-sm mb-8 uppercase">
            <ShieldCheck className="w-4 h-4" />
            Value Engineering Service
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
            The Future of <br/><span className="text-[#0073ea]">HVAC Maintenance</span>
          </h1>
          <p className="text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
            Bukan sekadar perawatan biasa. Ini adalah pendekatan proaktif berbasis <span className="font-semibold text-white">Engineering & Data</span> untuk memaksimalkan performa aset Anda.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function CompareSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6 lg:p-16">
      <img src="/services/ves_compare.jpg" alt="VES Compare" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-slate-900/90" />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">Paradigma Lama vs <span className="text-[#0073ea]">Daikin VES</span></h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Beranjak dari perawatan tradisional yang reaktif menuju perawatan prediktif yang cerdas.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Traditional */}
          <div className="bg-red-950/30 border border-red-500/20 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white">Vendor Tradisional</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Hanya sekadar rutinitas 'Cuci-Cuci' (Cleaning).",
                "Reaktif: Bekerja dan memperbaiki hanya saat mesin sudah rusak.",
                "Pemeriksaan manual dengan akurasi rendah.",
                "Tidak ada analisa data jangka panjang.",
                "Biaya tersembunyi akibat kerusakan mendadak."
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="min-w-6 mt-1 text-red-400">✖</div>
                  <p className="text-slate-300 text-sm lg:text-base leading-relaxed">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Daikin VES */}
          <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/80 border border-blue-500/30 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_rgba(0,115,234,0.15)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#0073ea] flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Daikin VES Program</h3>
            </div>
            <ul className="space-y-4 relative z-10">
              {[
                "Pengecekan Komprehensif (Sensor, Freon, Kalibrasi, Elektrikal).",
                "Proaktif & Prediktif: Mencegah kerusakan sebelum terjadi.",
                "Menggunakan perangkat diagnostik digital presisi tinggi.",
                "Analisa tren performa menggunakan data historis.",
                "Efisiensi biaya terukur dan umur mesin lebih panjang."
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 text-[#0073ea] shrink-0" />
                  <p className="text-white text-sm lg:text-base leading-relaxed font-medium">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvancedSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-slate-900"></div>
        <div className="w-1/2 relative">
          <img src="/services/ves_advanced.jpg" alt="Advanced Diagnostics" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider mb-6 border border-blue-500/30">
            Beyond Washing
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Lebih Dari Sekadar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Pembersihan</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Program VES memastikan seluruh komponen bekerja dalam kondisi pabrikannya (factory standards) melalui kalibrasi dan audit tingkat lanjut.
          </p>

          <div className="space-y-6">
            {[
              { title: "Vibration Analysis", desc: "Mendeteksi keausan bearing dan ketidakseimbangan mekanikal sebelum kerusakan parah." },
              { title: "Thermography Scan", desc: "Pemindaian suhu panel elektrikal untuk mencegah korsleting dan risiko kebakaran." },
              { title: "Oil & Refrigerant Analysis", desc: "Pengecekan kualitas pelumas dan kemurnian freon untuk efisiensi kompresor." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitsSlide() {
  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center p-6 lg:p-16">
      <img src="/services/ves_benefits.jpg" alt="Benefits" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-slate-900/60" />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-16">
          Mengapa <span className="text-[#0073ea]">Investasi</span> di VES?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: "Zero Unplanned Downtime", desc: "Minimalisir kerugian bisnis akibat AC/Chiller mati mendadak." },
            { icon: TrendingUp, title: "Optimal ROI", desc: "Perpanjang umur operasional mesin Anda hingga bertahun-tahun." },
            { icon: Zap, title: "Energy Efficiency", desc: "Mesin yang sehat dan terkalibrasi mengonsumsi listrik jauh lebih rendah." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0073ea] to-cyan-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,115,234,0.3)]">
                <item.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-slate-300 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConnectSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6 lg:p-16 overflow-hidden">
      <img src="/services/ves_connect.jpg" alt="DSSI Connect" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-slate-900/90" />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">
        <div className="w-full lg:w-1/2">
          <div className="relative w-full max-w-md mx-auto aspect-[9/16] rounded-[3rem] border-8 border-slate-800 bg-black overflow-hidden shadow-[0_0_60px_rgba(0,115,234,0.3)]">
             <img src="/services/ves_connect.jpg" className="w-full h-full object-cover opacity-80" alt="App Preview" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-8">
               <div className="w-16 h-16 rounded-2xl bg-[#0073ea] flex items-center justify-center mb-4">
                 <Smartphone className="w-8 h-8 text-white" />
               </div>
               <h4 className="text-white font-bold text-xl">DSSI Connect</h4>
               <p className="text-slate-300 text-sm">Real-time Asset Monitoring</p>
             </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold tracking-widest text-sm mb-6 uppercase">
            <Globe className="w-4 h-4" />
            Digital Ecosystem
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            Transparansi Penuh via <span className="text-[#0073ea]">DSSI Connect</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Kontrak VES kami lengkapi dengan akses eksklusif ke platform DSSI Connect. Pantau semuanya langsung dari layar Anda.
          </p>

          <ul className="space-y-5">
            {[
              "E-Logsheet & Laporan Digital Real-time",
              "Sistem Tiket & Riwayat Kerusakan (Digital Passport)",
              "Monitoring Kehadiran & Pekerjaan Teknisi di Lapangan",
              "Notifikasi Alarm & Predictive Analytics"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#0073ea] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ClosingSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0073ea]/20 to-slate-900" />
      
      <motion.div 
        className="relative z-10 max-w-4xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-[#0073ea] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(0,115,234,0.4)]">
          <ShieldCheck className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-5xl lg:text-7xl font-black text-white mb-6">
          Siap Bertransformasi?
        </h2>
        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
          Tinggalkan pola lama. Beralihlah ke Daikin VES untuk operasional HVAC yang lebih cerdas, efisien, dan bebas rasa khawatir.
        </p>
        <button 
          onClick={() => window.location.href = '/admin/database'}
          className="px-8 py-4 bg-white text-[#0073ea] font-black rounded-full hover:bg-slate-100 transition-all flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl hover:-translate-y-1"
        >
          Kembali ke Knowledge Center
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
