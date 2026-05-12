"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, Zap, Activity, BarChart3, 
  FileText, Globe, Cpu, Laptop, Check, ChevronDown, 
  ArrowDown, Play, Sparkles, Box, Layout, Award, X,
  Clock, Shield, TrendingUp, BellPulse, FileWarning, Search,
  Database, Fingerprint, Lock
} from "lucide-react";
import Link from "next/link";

export default function ServicePresentationPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [compareMode, setCompareMode] = useState<"conventional" | "smart">("conventional");
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-[#040814]" />;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#040814] text-white selection:bg-[#00a1e4] selection:text-white font-sans overflow-x-hidden">
      
      {/* Background Cinematic */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#003366,transparent)] opacity-40" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00a1e4]/50 to-transparent shadow-[0_0_20px_#00a1e4]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(#00a1e4 1px, transparent 1px), linear-gradient(90deg, #00a1e4 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex justify-between items-center backdrop-blur-md border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-4">
          <img src="/daikin_logo.png" className="h-5 brightness-0 invert" alt="Daikin" />
          <div className="w-[1px] h-6 bg-white/20"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#00a1e4]">Value Engineering Services</span>
        </div>
        <Link href="/" className="px-6 py-2 bg-white/5 hover:bg-[#00a1e4] text-white border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest transition-all">
          Masuk ke System
        </Link>
      </nav>

      {/* Section 1: Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="z-10 max-w-5xl">
           <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#00a1e4] text-[9px] font-black uppercase tracking-[0.4em] mb-10">
              <Sparkles size={14} /> Future Asset Eco-System
           </motion.div>
           
           <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10 uppercase">
             VALUE ENGINEERING<br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00a1e4] to-blue-600">SERVICES +</span>
           </h1>
           
           <p className="text-lg md:text-xl text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed mb-12">
             Meninggalkan maintenance konvensional menuju pengelolaan aset berbasis data yang komprehensif, transparan, dan terintegrasi.
           </p>

           <div className="flex justify-center gap-6">
              <button 
                onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })} 
                className="px-10 py-5 bg-[#00a1e4] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-2xl shadow-blue-500/30 flex items-center gap-3"
              >
                Lihat Perbedaan <ChevronDown size={14} />
              </button>
           </div>
        </motion.div>
        
        <div className="absolute bottom-10 animate-bounce opacity-20"><ArrowDown size={24} /></div>
      </section>

      {/* Section 2: Convention vs Smart (Interactive) */}
      <section id="compare" className="relative min-h-screen py-32 px-8 flex flex-col items-center justify-center">
         <div className="max-w-6xl mx-auto w-full text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-12 tracking-tight">Evolusi Maintenance</h2>
            
            {/* Toggle Switch */}
            <div className="inline-flex p-1.5 bg-white/5 rounded-3xl border border-white/10 mb-20 relative">
               <motion.div 
                 layout
                 className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-[#00a1e4] rounded-2xl z-0" 
                 animate={{ x: compareMode === 'conventional' ? 0 : '100%' }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
               />
               <button 
                onClick={() => setCompareMode('conventional')}
                className={`relative z-10 px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-colors ${compareMode === 'conventional' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 Konvensional
               </button>
               <button 
                onClick={() => setCompareMode('smart')}
                className={`relative z-10 px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-colors ${compareMode === 'smart' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 Smart Ecosystem
               </button>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CompareItem 
                  icon={compareMode === 'conventional' ? FileWarning : Fingerprint} 
                  title={compareMode === 'conventional' ? "Logsheets Kertas" : "Digital Passports"} 
                  desc={compareMode === 'conventional' ? "Data fisik yang mudah hilang, rusak, atau sulit diakses saat dibutuhkan." : "Data tersimpan aman di cloud, akses instan via scan QR di unit."}
                  isSmart={compareMode === 'smart'}
                />
                <CompareItem 
                  icon={compareMode === 'conventional' ? Activity : Zap} 
                  title={compareMode === 'conventional' ? "Reactive Mode" : "Engineering Review"} 
                  desc={compareMode === 'conventional' ? "Menunggu unit rusak baru diperbaiki. Downtime lama dan biaya tak terduga." : "Analisa performa rutin untuk mendeteksi permasalahan sebelum terjadi kerusakan."}
                  isSmart={compareMode === 'smart'}
                />
                <CompareItem 
                  icon={compareMode === 'conventional' ? Search : BarChart3} 
                  title={compareMode === 'conventional' ? "Subyektif" : "Obyektif & Akurat"} 
                  desc={compareMode === 'conventional' ? "Laporan berdasarkan perkiraan teknisi, sering terjadi keteledoran manual." : "Laporan berdasarkan data audit teknis terverifikasi dengan matriks performa."}
                  isSmart={compareMode === 'smart'}
                />
                <CompareItem 
                  icon={compareMode === 'conventional' ? Clock : Database} 
                  title={compareMode === 'conventional' ? "Data Statis" : "Asset Intelligence"} 
                  desc={compareMode === 'conventional' ? "Riwayat servis terputus-putus. Sulit memantau biaya pemeliharaan tahunan." : "Seluruh riwayat aset (suku cadang, audit, perbaikan) tercatat rapi secara kronologis."}
                  isSmart={compareMode === 'smart'}
                />
            </div>
         </div>
      </section>

      {/* Section 3: Packages */}
      <section className="relative min-h-screen py-32 px-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto">
           <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="max-w-xl">
                 <h2 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none">Paket Layanan</h2>
              </div>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest border-l-4 border-[#00a1e4] pl-6 py-2">Standard vs Comprehensive Analytics</p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Paket Dasar */}
              <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] flex flex-col group hover:bg-white/[0.04] transition-all">
                 <div className="mb-10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Level 01</span>
                    <h3 className="text-3xl font-black uppercase text-slate-300">DASAR</h3>
                    <p className="text-[9px] font-bold text-[#00a1e4]/60 uppercase tracking-widest mt-1">Digital Maintenance & History</p>
                 </div>
                 <ul className="space-y-6 mb-12 flex-1">
                    <FeatureItem text="Perawatan Rutin Terjadwal (Preventive Maintenance)" />
                    <FeatureItem text="Pelaporan Servis Digital (Akses Database & PDF)" />
                    <FeatureItem text="Pencatatan Riwayat Aset Terpusat" />
                    <FeatureItem text="Dukungan Perbaikan Standar" />
                    <FeatureDisabled text="Pemantauan Performa Unit (Live/Periodic)" />
                    <FeatureDisabled text="Audit Engineering & Konsultasi Strategis" />
                 </ul>
                 <button className="w-full py-5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-[#00a1e4] transition-all">[ INFO PAKET DASAR ]</button>
              </div>

              {/* Paket Menengah */}
              <div className="relative group">
                 <div className="absolute inset-0 bg-[#00a1e4]/10 blur-3xl rounded-full"></div>
                 <div className="relative bg-[#081b33] border-2 border-[#00a1e4] p-12 rounded-[3.5rem] flex flex-col h-full transform lg:-translate-y-8 shadow-2xl">
                    <div className="absolute -top-4 right-10 bg-[#00a1e4] px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,161,228,0.4)]">High Performance</div>
                    <div className="mb-10">
                       <span className="text-[10px] font-black text-blue-300/40 uppercase tracking-widest mb-2 block">Level 02</span>
                       <h3 className="text-3xl font-black uppercase text-white">MENENGAH</h3>
                       <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest mt-1">Smart Performance & Control</p>
                    </div>
                    <ul className="space-y-6 mb-12 flex-1">
                       <FeatureItem text="SEMUA FITUR PAKET DASAR" bold />
                       <FeatureItem text="Laporan Performa Unit (Unit Performance Monitoring)" highlight />
                       <FeatureItem text="Penilaian Kesehatan Aset (Health Index Scoring Per-Unit)" highlight />
                       <FeatureItem text="Laporan Audit Engineering Dasar" highlight />
                       <FeatureItem text="SLA Respon Prioritas (24/7 Technical Support)" />
                       <FeatureDisabled text="Audit Efisiensi Energi Menyeluruh" />
                       <FeatureDisabled text="Konsultasi Manajemen Siklus Hidup Aset" />
                    </ul>
                    <button className="w-full py-5 bg-[#00a1e4] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/20">[ MULAI LEVEL MENENGAH ]</button>
                 </div>
              </div>

              {/* Paket Lengkap */}
              <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] flex flex-col group hover:bg-white/[0.04] transition-all">
                 <div className="mb-10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Level 03</span>
                    <h3 className="text-3xl font-black uppercase text-slate-300">LENGKAP</h3>
                    <p className="text-[9px] font-bold text-[#00a1e4]/60 uppercase tracking-widest mt-1">Strategic Value Engineering & Consultant</p>
                 </div>
                 <ul className="space-y-6 mb-12 flex-1">
                    <FeatureItem text="SEMUA FITUR PAKET MENENGAH" bold />
                    <FeatureItem text="Audit Efisiensi Energi & Optimalisasi (Value Engineering)" highlight />
                    <FeatureItem text="Tinjauan Manajemen Siklus Hidup Aset (Life Cycle Review)" highlight />
                    <FeatureItem text="Analitik Pemeliharaan Prediktif (Predictive Maintenance)" highlight />
                    <FeatureItem text="Laporan Rekayasa Finansial (ROI & Cost Saving Analysis)" />
                    <FeatureItem text="VIP Dedicated Engineer & Konsultasi Strategis" />
                 </ul>
                 <button className="w-full py-5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-[#00a1e4] transition-all font-mono italic">[ TIER-3 STRATEGY ]</button>
              </div>
           </div>
        </div>
      </section>

      {/* Section 4: Reporting System - The Stylish Experience */}
      <section className="relative min-h-[150vh] py-32 px-8 bg-slate-900/10">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
            
            {/* Sticky Content Column */}
            <div className="lg:sticky lg:top-40 space-y-12 h-fit">
               <div className="space-y-6">
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-black uppercase tracking-[0.5em] text-[#00a1e4] block"
                  >
                    Reporting Hub 2.0
                  </motion.span>
                  <h2 className="text-5xl md:text-8xl font-black tracking-tight uppercase leading-[0.85]">
                     High-Fidelity<br />
                     <span className="text-white/20">Data Integrity</span>
                  </h2>
               </div>
               
               <p className="text-slate-400 font-bold text-lg leading-relaxed max-w-lg">
                  Laporan Anda bukan lagi sekadar dokumen pasif. Kami menyajikan ekosistem data yang dinamis, transparan, dan terverifikasi secara digital.
               </p>

               <div className="grid grid-cols-1 gap-8">
                  <ReportIncentive icon={FileText} title="One-Click Report" desc="Generate dokumen audit profesional dalam hitungan detik." />
                  <ReportIncentive icon={Search} title="Deep Performance Matrix" desc="Visualisasi teknis mendalam untuk setiap parameter unit." />
                  <ReportIncentive icon={ShieldCheck} title="Digital Stamp Protection" desc="Setiap laporan diproteksi dengan tanda tangan digital & timestamp." />
               </div>
            </div>

            {/* Scrolling Report Column */}
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-b from-[#00a1e4]/20 to-transparent blur-[80px] rounded-[4rem] opacity-50"></div>
               
               {/* Browser Frame */}
               <div className="relative bg-slate-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-black/80">
                  <div className="bg-slate-900 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                     <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500/40" />
                     </div>
                     <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Preview: Audit_Report_Full.pdf</div>
                  </div>

                  {/* Auto-scrolling viewport */}
                  <div className="h-[700px] overflow-hidden relative">
                     <motion.div 
                        animate={{ y: ["0%", "-60%", "0%"] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="p-8 md:p-12 space-y-12 bg-white text-slate-900 min-h-[200%] origin-top"
                     >
                        {/* Report Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
                           <div className="flex gap-4 items-center">
                              <img src="/daikin_logo.png" className="h-4 object-contain brightness-0 grayscale opacity-40" alt="Daikin" />
                              <div className="w-px h-8 bg-slate-200"></div>
                              <img src="/logo_epl_connect_1.png" className="h-6 object-contain brightness-0 grayscale opacity-40" alt="EPL" />
                           </div>
                           <div className="text-right">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Service Audit Report</h4>
                              <p className="text-[8px] font-bold text-slate-300 uppercase italic">Confidential Internal Document</p>
                           </div>
                        </div>

                        {/* Blurred Identity Section */}
                        <div className="grid grid-cols-2 gap-8">
                           {[1, 2, 3, 4].map(i => (
                             <div key={i} className="space-y-1">
                                <div className="h-2 w-16 bg-slate-100 rounded-full mb-2"></div>
                                <div className="h-8 bg-slate-50 rounded-xl relative overflow-hidden backdrop-blur-md border border-slate-100 flex items-center px-4">
                                   <div className="absolute right-3 opacity-20"><Lock size={12} /></div>
                                   <div className="w-24 h-2 bg-slate-200/50 rounded-full blur-[2px]"></div>
                                </div>
                             </div>
                           ))}
                        </div>

                        {/* Technical Measurement Grid (The Matrix) */}
                        <div className="space-y-4">
                           <div className="flex justify-between items-center">
                              <div className="h-3 w-40 bg-slate-200 rounded-full"></div>
                              <div className="h-6 w-20 bg-[#00a1e4] rounded-lg"></div>
                           </div>
                           <div className="grid grid-cols-6 gap-2">
                              {Array.from({length: 24}).map((_, i) => (
                                <div key={i} className="h-10 border border-slate-100 rounded-lg flex flex-col items-center justify-center bg-slate-50/50">
                                   <span className="text-[5px] text-slate-300 font-bold mb-1">POS-{i+1}</span>
                                   <span className="text-[8px] font-black text-[#003366]">{(Math.random() * 2 + 1).toFixed(2)}</span>
                                </div>
                              ))}
                           </div>
                        </div>

                        {/* Performance Charts */}
                        <div className="h-48 bg-slate-50 rounded-[2rem] border border-slate-100 p-8 flex items-end gap-3">
                           {Array.from({length: 12}).map((_, i) => (
                              <div key={i} className="flex-1 bg-[#00a1e4]/10 border-x border-blue-50/50 rounded-t-lg" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                           ))}
                        </div>

                        {/* Photo Documentation Section */}
                        <div className="space-y-6">
                           <div className="flex justify-between items-center mb-6">
                              <h5 className="text-[9px] font-black uppercase tracking-widest text-[#003366] flex items-center gap-2">
                                <Activity size={14} className="text-[#00a1e4]" /> Photo Documentation
                              </h5>
                              <span className="text-[7px] font-bold text-slate-400">4 PHOTOS ATTACHED</span>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div className="aspect-[4/3] bg-slate-100 rounded-xl border-[6px] border-white shadow-md overflow-hidden relative group">
                                 <img src="/ahu_audit_1_webp_1776912549912.png" className="w-full h-full object-cover" alt="Unit Overview" />
                                 <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[5px] font-black uppercase rounded">Aset Utama</div>
                              </div>
                              <div className="aspect-[4/3] bg-slate-100 rounded-xl border-[6px] border-white shadow-md overflow-hidden relative group">
                                 <img src="/ahu_audit_2_webp_1776913078229.png" className="w-full h-full object-cover" alt="Measurement" />
                                 <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[5px] font-black uppercase rounded">Pengukuran Velocity</div>
                              </div>
                              <div className="aspect-[4/3] bg-slate-100 rounded-xl border-[6px] border-white shadow-md overflow-hidden relative group">
                                 <img src="/ahu_audit_3_webp_1776913202426.png" className="w-full h-full object-cover" alt="Filter Inspection" />
                                 <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[5px] font-black uppercase rounded">Kondisi Filter</div>
                              </div>
                              <div className="aspect-[4/3] bg-slate-100 rounded-xl border-[6px] border-white shadow-md overflow-hidden relative group">
                                 <img src="/ahu_audit_4_webp_1776913294231.png" className="w-full h-full object-cover" alt="Control Panel" />
                                 <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[5px] font-black uppercase rounded">Panel Kontrol</div>
                              </div>
                           </div>
                        </div>

                        <div className="pt-12 text-center">
                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">--- End of Digital Audit Mirror ---</p>
                        </div>
                     </motion.div>

                     {/* Overlay Shadows */}
                     <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
                     <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
                  </div>
               </div>
            </div>

         </div>
      </section>

      {/* Footer Closing */}
      <footer className="py-40 px-8 text-center bg-slate-950 border-t border-white/5 relative z-10">
         <motion.div whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-7xl font-black uppercase mb-12 leading-none">Elevate Your Asset Management</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16">
               <Link href="/" className="px-14 py-6 bg-white text-[#040814] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all inline-block shadow-2xl shadow-white/10">Sign In ke Dashboard</Link>
               <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] hover:text-[#00a1e4] transition-all">Hubungi Engineer <ArrowRight size={14} /></button>
            </div>
            
            <div className="flex justify-center items-center gap-10 opacity-30">
               <img src="/daikin_logo.png" className="h-4 brightness-0 invert" alt="Daikin" />
               <img src="/logo_epl_connect_1.png" className="h-6 brightness-0 invert" alt="EPL" />
            </div>
         </motion.div>
      </footer>

    </div>
  );
}

function CompareItem({ icon: Icon, title, desc, isSmart }: { icon: any, title: string, desc: string, isSmart: boolean }) {
  return (
    <motion.div 
      layout
      className={`p-10 rounded-[3rem] border transition-all text-left flex flex-col h-full ${
        isSmart 
          ? 'bg-[#003366]/20 border-[#00a1e4]/40 shadow-xl shadow-blue-900/10' 
          : 'bg-white/[0.02] border-white/5 opacity-80'
      }`}
    >
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isSmart ? 'bg-[#00a1e4] text-white' : 'bg-white/10 text-slate-500'}`}>
          <Icon size={24} />
       </div>
       <h3 className={`text-xl font-black uppercase mb-4 tracking-tight ${isSmart ? 'text-[#00a1e4]' : 'text-slate-400'}`}>{title}</h3>
       <p className="text-slate-500 font-medium text-[11px] leading-relaxed flex-1">{desc}</p>
       {isSmart && <div className="mt-6 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[#00a1e4]"><Activity size={10} /> Smart Solution</div>}
    </motion.div>
  );
}

function FeatureItem({ text, highlight = false, bold = false }: { text: string, highlight?: boolean, bold?: boolean }) {
  return (
    <li className="flex items-center gap-3">
       <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${highlight ? 'bg-[#00a1e4] text-white' : 'bg-white/10 text-white/40'}`}>
          <Check size={10} />
       </div>
       <span className={`text-[10px] ${bold ? 'font-black uppercase tracking-wider' : 'font-bold'} ${highlight ? 'text-white' : 'text-slate-400'}`}>{text}</span>
    </li>
  );
}

function ReportIncentive({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ x: 10 }}
      className="flex items-start gap-6 group cursor-default"
    >
       <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 group-hover:bg-[#00a1e4] group-hover:text-white group-hover:border-[#00a1e4] transition-all shrink-0 shadow-xl">
          <Icon size={24} />
       </div>
       <div>
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-2">{title}</h4>
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed max-w-xs">{desc}</p>
       </div>
    </motion.div>
  );
}

function ReportingFeature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-6 group">
       <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-[#00a1e4]/10 group-hover:text-[#00a1e4] group-hover:border-[#00a1e4]/20 transition-all shrink-0">
          <Icon size={24} />
       </div>
       <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">{title}</h4>
          <p className="text-xs font-bold text-slate-500 leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

function FeatureDisabled({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 opacity-20">
       <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-white/10">
          <X size={10} />
       </div>
       <span className="text-[10px] font-black text-slate-500 line-through tracking-wider">{text}</span>
    </li>
  );
}
