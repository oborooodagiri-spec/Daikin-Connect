"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRightLeft,
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileText,
  Gauge,
  GitBranch,
  Handshake,
  Layers,
  MapPin,
  Monitor,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCircle,
  UserPlus,
  Users,
  Wallet,
  Zap
} from "lucide-react";
import { VesPhaseWrapper } from "./VesPhaseWrapper";

// --- Sub-components for Visuals ---

const FloatingCard = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`bg-white/40 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

const BranchSelector = ({ title, icon: Icon, colorClass, onClick, side }: any) => (
  <motion.button
    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="relative group p-6 rounded-3xl border border-slate-200 bg-slate-50 text-left transition-all overflow-hidden flex flex-col items-center justify-center text-center gap-4 w-full h-full"
  >
     <div className={`w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:border-blue-300 transition-colors shadow-sm`}>
        <Icon className={`w-7 h-7 ${colorClass}`} />
     </div>
     <h5 className="text-slate-800 text-xs font-black uppercase tracking-widest leading-tight">{title}</h5>
     <div className={`absolute bottom-4 ${side === 'right' ? 'right-4' : 'left-4'} opacity-0 group-hover:opacity-100 transition-all transform ${side === 'right' ? 'translate-x-[-10px] group-hover:translate-x-0' : 'translate-x-[10px] group-hover:translate-x-0'}`}>
        {side === 'right' ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronLeft className="w-4 h-4 text-slate-400" />}
     </div>
  </motion.button>
);

const BranchDetail = ({ title, process, strategy, roles, icon: Icon, colorClass, onBack, side, children }: any) => (
  <motion.div
    initial={{ x: side === 'right' ? -100 : 100, opacity: 0, scale: 0.8 }}
    animate={{ x: side === 'right' ? 40 : -40, opacity: 1, scale: 1 }}
    exit={{ x: side === 'right' ? -50 : 50, opacity: 0, scale: 0.9 }}
    transition={{ type: "spring", damping: 20, stiffness: 100 }}
    className={`absolute w-full max-w-md p-8 rounded-[2.5rem] border border-slate-200 bg-white/90 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.1)] z-20 overflow-y-auto max-h-[80vh] custom-scrollbar`}
  >
     <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest group">
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Kembali
     </button>
     
     <div className="mt-8 flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6`}>
           <Icon className={`w-8 h-8 ${colorClass}`} />
        </div>
        <h4 className="text-slate-900 text-lg font-black mb-3 tracking-tight uppercase leading-tight">{title}</h4>
        <div className="h-0.5 w-8 bg-blue-500 rounded-full mb-6" />
        
        {process && <p className="text-slate-700 text-xs leading-relaxed mb-6">{process}</p>}
        
        {strategy && (
           <div className="w-full p-4 bg-blue-50 border border-blue-100 rounded-xl text-left mb-6">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">Strategi Utama</span>
              <p className="text-blue-900/60 text-[11px] italic leading-relaxed">{strategy}</p>
           </div>
        )}

        {roles && (
          <div className="w-full space-y-3 mb-6">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-left">Pembagian Peran Internal</span>
            {roles.map((r: any, i: number) => (
              <div key={i} className="flex gap-3 text-left p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className={`mt-1 shrink-0 ${r.color}`}><r.icon size={12} /></div>
                <div>
                  <p className="text-slate-800 text-[10px] font-bold uppercase">{r.label}</p>
                  <p className="text-slate-400 text-[10px] leading-tight">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {children}
     </div>
  </motion.div>
);

// --- Phase Components ---

export const PhaseInisiasi = ({ isVisible }: { isVisible: boolean }) => {
  const [level, setLevel] = useState(1);
  const [choice, setChoice] = useState<null | 'SudahMC' | 'BelumMC'>(null);
  const [subChoice, setSubChoice] = useState<null | 'Dasar' | 'Tinggi'>(null);

  const reset = () => {
    setLevel(1);
    setChoice(null);
    setSubChoice(null);
  };

  return (
    <VesPhaseWrapper
      isVisible={isVisible}
      phaseNumber={1}
      subtitle="Fase 1: Inisiasi & Kategorisasi Customer"
      title="Buka Pintu"
      description="Identifikasi status klien dan penentuan strategi masuk (entry strategy) melalui pengenalan kebutuhan dan permasalahan mendasar customer."
      roles={[
        { name: "Sales Relation", icon: UserCircle, color: "text-blue-400" },
        { name: "Sales System (Optional)", icon: Briefcase, color: "text-purple-400" },
        { name: "CAPS", icon: Layers, color: "text-orange-400" },
      ]}
      pic=""
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {level === 1 && (
            <motion.div key="lvl1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="grid grid-cols-2 gap-4 w-full max-w-md">
              <BranchSelector title="Sudah Kontrak Maintenance" icon={ShieldCheck} colorClass="text-green-400" side="right" onClick={() => { setChoice('SudahMC'); setLevel(2); }} />
              <BranchSelector title="Belum Kontrak Maintenance" icon={UserPlus} colorClass="text-blue-400" side="left" onClick={() => { setChoice('BelumMC'); setLevel(3); }} />
            </motion.div>
          )}

          {level === 2 && choice === 'SudahMC' && !subChoice && (
            <motion.div key="lvl2" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex flex-col items-center gap-6 w-full max-w-md">
              <button onClick={reset} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest"><ArrowLeft size={12} /> Kembali</button>
              <div className="text-center mb-2">
                 <h4 className="text-green-400 text-xs font-black uppercase tracking-[0.2em]">Skenario Kolaborasi Internal</h4>
                 <p className="text-slate-400 text-[9px] mt-1 italic font-medium">Pilih model peningkatan nilai kontrak (Upselling)</p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <BranchSelector title="Upgrade VES Dasar" icon={Monitor} colorClass="text-blue-800" side="right" onClick={() => setSubChoice('Dasar')} />
                <BranchSelector title="Upgrade VES Tinggi" icon={Gauge} colorClass="text-orange-400" side="left" onClick={() => setSubChoice('Tinggi')} />
              </div>
            </motion.div>
          )}

          {level === 2 && subChoice === 'Dasar' && (
            <BranchDetail 
              side="right" 
              title="1A.1: Upgrade ke VES Dasar" 
              icon={Monitor} colorClass="text-blue-800"
              process="Fokus pada Digitalisasi Report untuk transparansi tanpa mengubah kendali operasional CAPS."
              strategy="Penambahan Management Fee / Platform Fee di atas nilai kontrak berjalan (SaaS Model)."
              roles={[
                { label: "CAPS", desc: "Memegang kendali operasional 100% dan pekerjaan lapangan.", icon: Settings, color: "text-orange-400" },
                { label: "VES", desc: "Murni sebagai Penyedia Platform. Memastikan sistem pelaporan digital lancar.", icon: UserCircle, color: "text-blue-400" }
              ]}
              onBack={() => setSubChoice(null)}
            >
               <div className="w-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-blue-400" />
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Strategi Upselling</span>
                  </div>
                  <p className="text-slate-500 text-[10px] leading-snug italic font-medium">"Trial VES lebih tinggi untuk menarik minat Customer agar meningkatkan model VES nya."</p>
               </div>
            </BranchDetail>
          )}

          {level === 2 && subChoice === 'Tinggi' && (
            <BranchDetail 
              side="left" 
              title="1A.2: Upgrade ke VES Tinggi" 
              icon={Gauge} colorClass="text-orange-400"
              process="Fokus pada Audit Performa & Optimasi. VES mengambil alih sebagai Project Lead Utama."
              strategy="VES sebagai Main Lead, CAPS sebagai Mitra Eksekutor (Sub-kontraktor internal)."
              roles={[
                { label: "VES (Main Lead)", desc: "Kendali penuh atas audit performa, data analisa, dan tanggung jawab hasil akhir.", icon: UserCircle, color: "text-blue-400" },
                { label: "CAPS", desc: "Mitra Eksekutor untuk pekerjaan konvensional (cuci, logsheet dasar, filter).", icon: Layers, color: "text-orange-400" }
              ]}
              onBack={() => setSubChoice(null)}
            >
               <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert size={14} className="text-red-400" />
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Mitigasi: Internal SLA</span>
                  </div>
                  <p className="text-slate-500 text-[10px] leading-snug italic">Menerapkan standar kualitas VES untuk CAPS guna menjamin integritas data audit performa.</p>
               </div>
            </BranchDetail>
          )}

          {level === 3 && choice === 'BelumMC' && (
            <BranchDetail 
              side="left" 
              title="1B: Customer Belum Kontrak Maintenance" 
              icon={UserPlus} colorClass="text-blue-400"
              process="Melakukan presentasi standar mengenai profil perusahaan dan layanan VES dasar."
              strategy="Identifikasi Pain Points Customer dari nol untuk merancang solusi yang sesuai."
              onBack={reset}
            />
          )}
        </AnimatePresence>
      </div>
    </VesPhaseWrapper>
  );
};

export const PhaseSurvei = ({ isVisible }: { isVisible: boolean }) => (
  <VesPhaseWrapper
    isVisible={isVisible}
    phaseNumber={2}
    subtitle="Fase 2: Survei Lapangan & Site Audit Report (SAR)"
    title="Validasi & Audit Awal (Genba)"
    description="Melakukan audit awal mendalam terhadap seluruh aset Customer untuk pengumpulan informasi strategis (Unit, sistem, instalasi, dll) guna melihat potensi maksimal solusi."
    roles={[
      { name: "Engineer (Lead Diagnostik)", icon: Settings, color: "text-orange-400" },
      { name: "Sales Relation", icon: ClipboardCheck, color: "text-blue-400" },
      { name: "Sales System (Optional)", icon: Briefcase, color: "text-purple-400" },
    ]}
    pic=""
  >
    <div className="relative w-full aspect-square flex items-center justify-center">
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[110%] h-[110%] border border-dashed border-slate-200 rounded-full" />
      <div className="grid grid-cols-1 gap-6 z-10 w-full max-w-sm">
        <FloatingCard delay={0.6}>
           <div className="flex items-center gap-3 mb-4">
              <Search className="text-orange-400 w-5 h-5" />
              <span className="text-orange-400 text-[10px] font-black uppercase tracking-widest">Audit Awal</span>
           </div>
           <p className="text-slate-600 text-[11px] leading-relaxed">Pengumpulan data awal yang menyesuaikan kondisi dan kebutuhan customer (Tanpa template baku).</p>
        </FloatingCard>
        
        <FloatingCard delay={0.8} className="border-blue-500/30">
           <div className="flex items-center gap-3 mb-4">
              <Layers className="text-blue-400 w-5 h-5" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Identifikasi Aset</span>
           </div>
           <p className="text-slate-600 text-[11px] leading-relaxed">Identifikasi seluruh aset customer (Unit, sistem, instalasi, etc) untuk melihat potensi maksimal.</p>
        </FloatingCard>

        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ delay: 1, duration: 0.5 }}
           className="p-5 bg-green-50 border border-green-200 rounded-2xl shadow-sm relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform text-green-600">
              <FileText className="w-12 h-12" />
           </div>
           <div className="relative z-10">
              <span className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em] mb-1 block">Output Utama</span>
              <h4 className="text-slate-800 font-bold text-sm mb-2">Site Audit Report (SAR)</h4>
              <p className="text-slate-500 text-[10px] leading-snug">Berisi kondisi aktual dan pemetaan risiko sebagai basis Pusat Informasi Strategis Aset.</p>
           </div>
        </motion.div>
      </div>
    </div>
  </VesPhaseWrapper>
);

export const PhaseQuotation = ({ isVisible }: { isVisible: boolean }) => {
  const roles = [
    { name: "Sales Relation", icon: UserCircle, color: "text-blue-400" },
    { name: "Tim Sales System", icon: Briefcase, color: "text-purple-400" },
    { name: "Engineer", icon: Settings, color: "text-orange-400" },
    { name: "Customer", icon: Users, color: "text-green-400" },
    { name: "Management Internal", icon: ShieldCheck, color: "text-red-400" },
  ];

  return (
    <VesPhaseWrapper
      isVisible={isVisible}
      phaseNumber={3}
      subtitle="Fase 3: Penyusunan Proposal & Quotation"
      title="Proposal & Penawaran"
      description="Translasi temuan Site Audit Report (SAR) menjadi solusi fully customized yang menonjolkan nilai tambah VES."
      roles={roles}
      pic=""
    >
      <div className="flex flex-col gap-5 w-full max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <FloatingCard className="p-5 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="text-yellow-600 w-4 h-4" />
              <span className="text-yellow-600 text-[9px] font-black uppercase tracking-widest">Value-Based</span>
            </div>
            <p className="text-slate-500 text-[10px] leading-relaxed font-medium">Tidak hanya preventive maintenance tapi total performance management untuk model VES Tertinggi.</p>
          </FloatingCard>
          
          <FloatingCard className="p-5 h-full border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="text-purple-600 w-4 h-4" />
              <span className="text-purple-600 text-[9px] font-black uppercase tracking-widest">Custom Scheme</span>
            </div>
            <p className="text-slate-500 text-[10px] leading-relaxed font-medium">Disesuaikan dengan kebutuhan customer secara mendalam dan fleksibel.</p>
          </FloatingCard>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.8 }}
           className="p-5 bg-slate-50 border border-slate-100 rounded-2xl"
        >
           <div className="flex items-center gap-3 mb-3">
              <RefreshCw className="text-blue-600 w-4 h-4 animate-spin-slow" />
              <span className="text-slate-800 text-[10px] font-bold uppercase tracking-widest">Manajemen Revisi & Timeline</span>
           </div>
           <p className="text-slate-500 text-[10px] leading-relaxed">Mengawal tarik-ulur negosiasi dan penyesuaian scope of work agar tetap sesuai standar SLA tanpa melampaui tenggat waktu.</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 1 }} 
          className="bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-400/50 p-6 rounded-3xl shadow-lg relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Handshake className="w-24 h-24 text-white" /></div>
          <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                <p className="text-blue-600 text-[9px] font-black uppercase tracking-widest">Strategic Agreement</p>
             </div>
             <h4 className="text-white text-xl font-black mb-1">Quotation Final & Draft SLA</h4>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-blue-600/80 text-[11px] font-bold uppercase tracking-widest">Status: Deal</p>
             </div>
          </div>
        </motion.div>
      </div>
    </VesPhaseWrapper>
  );
};

export const PhasePO = ({ isVisible }: { isVisible: boolean }) => {
  const [selected, setSelected] = useState<null | 'A' | 'B'>(null);

  return (
    <VesPhaseWrapper
      isVisible={isVisible}
      phaseNumber={4}
      subtitle="Fase 4: Kick-off Internal & Alokasi Manpower"
      title="Mobilisasi & Penugasan"
      description="Validasi PO terhadap penawaran, internal kick-off, dan menentukan strategi eksekusi lapangan melalui pemilihan tim yang tepat."
      roles={[
        { name: "Sales Relation", icon: UserCircle, color: "text-blue-400" },
        { name: "Sales System", icon: Briefcase, color: "text-purple-400" },
        { name: "Engineer", icon: Settings, color: "text-orange-400" },
        { name: "Teknisi/Vendor", icon: Activity, color: "text-red-400" },
      ]}
      pic=""
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4 w-full max-w-md">
              <BranchSelector title="In-House Team" icon={Users} colorClass="text-blue-400" side="right" onClick={() => setSelected('A')} />
              <BranchSelector title="External Vendor" icon={Briefcase} colorClass="text-orange-400" side="left" onClick={() => setSelected('B')} />
            </motion.div>
          ) : (
            <BranchDetail 
              key={selected}
              side={selected === 'A' ? 'right' : 'left'}
              title={selected === 'A' ? "4A: In-House Team" : "4B: External Vendor"}
              icon={selected === 'A' ? Users : Briefcase}
              colorClass={selected === 'A' ? "text-blue-400" : "text-orange-400"}
              process={selected === 'A' ? "Koordinasi dengan pimpinan engineer untuk alokasi PIC Engineer." : "Memilih vendor yang sesuai dan cocok."}
              onBack={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </VesPhaseWrapper>
  );
};

export const PhaseEksekusi = ({ isVisible }: { isVisible: boolean }) => (
  <VesPhaseWrapper
    isVisible={isVisible}
    phaseNumber={5}
    subtitle="Fase 5: Implementasi Solusi & Troubleshooting"
    title="Eksekusi & Monitoring Progres"
    description="Pemantauan progres lapangan secara berkala dengan fokus pada timeline schedule, dan operasional. Koordinasi administrasi report internal & eksternal."
    roles={[
      { name: "Sales Relation", icon: UserCircle, color: "text-blue-400" },
      { name: "PIC Engineer", icon: Settings, color: "text-orange-400" },
      { name: "Sales System", icon: Briefcase, color: "text-purple-400" },
      { name: "Vendor", icon: Activity, color: "text-red-400" },
    ]}
    pic=""
  >
    <div className="flex flex-col gap-6 w-full max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <FloatingCard className="p-5 h-full">
           <div className="flex items-center gap-2 mb-3">
              <Clock className="text-blue-600 w-4 h-4" />
              <span className="text-blue-600 text-[9px] font-black uppercase tracking-widest">Timeline Schedule</span>
           </div>
           <p className="text-slate-500 text-[10px] leading-relaxed font-medium">Pengawasan ketat terhadap tenggat waktu setiap tahapan pekerjaan di lapangan.</p>
        </FloatingCard>
        
        <FloatingCard className="p-5 h-full border-orange-100">
           <div className="flex items-center gap-2 mb-3">
              <FileText className="text-orange-600 w-4 h-4" />
              <span className="text-orange-600 text-[9px] font-black uppercase tracking-widest">Adm Report</span>
           </div>
           <p className="text-slate-500 text-[10px] leading-relaxed font-medium">Koordinasi laporan operasional internal & eksternal untuk Customer & Vendor.</p>
        </FloatingCard>
      </div>

      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.8 }}
         className="p-5 bg-blue-50 border border-blue-100 rounded-2xl relative overflow-hidden group"
      >
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Zap className="w-16 h-16 text-blue-600" /></div>
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
               <ShieldCheck className="text-blue-600 w-4 h-4" />
               <span className="text-blue-600 text-[9px] font-black uppercase tracking-widest">Strategi Utama: Eskalasi Cepat</span>
            </div>
            <p className="text-slate-800 text-xs font-bold mb-1">Single Point of Contact</p>
            <p className="text-slate-500 text-[10px] leading-relaxed">Penanggung jawab VES bertindak sebagai penghubung agar tim teknis fokus pada troubleshooting tanpa interupsi eksternal.</p>
         </div>
      </motion.div>
    </div>
  </VesPhaseWrapper>
);

export const PhaseReporting = ({ isVisible }: { isVisible: boolean }) => (
  <VesPhaseWrapper
    isVisible={isVisible}
    phaseNumber={6}
    subtitle="Fase 6: Finalisasi Pelaporan & Serah Terima"
    title="Pelaporan Akhir & Dokumen Kontrak"
    description="Verifikasi seluruh hasil kerja dan penyusunan dokumen pelaporan akhir yang diserahkan menjelang berakhirnya periode kontrak sebagai bukti pemenuhan SLA."
    roles={[
      { name: "Sales Relation", icon: Award, color: "text-blue-400" },
      { name: "Sales System", icon: Briefcase, color: "text-purple-400" },
      { name: "Engineer", icon: Settings, color: "text-orange-400" },
    ]}
    pic=""
  >
    <div className="flex flex-col gap-5 w-full max-w-lg">
       <FloatingCard delay={0.6} className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
              <ClipboardCheck className="text-blue-400 w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 font-black text-sm uppercase tracking-wider">Contract Deliverables</h4>
              <p className="text-blue-400/60 text-[10px] font-bold">Dokumen Penutupan Siklus</p>
            </div>
          </div>
          
          <div className="space-y-3">
             {[
               "Final Service Report Summary",
               "Comparison Performance Data",
               "Documentation & Evidence Archive"
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-slate-100 group hover:bg-white/[0.05] transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-slate-600 text-[11px] font-medium">{item}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
             ))}
          </div>
       </FloatingCard>
       
       <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="px-4 py-3 bg-white/[0.01] border border-slate-100 rounded-xl flex items-center gap-3"
       >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-[10px] text-slate-400 font-medium italic">Target: Dokumen diserahkan & divalidasi sebelum kontrak berakhir.</p>
       </motion.div>
    </div>
  </VesPhaseWrapper>
);

export const PhaseManagement = ({ isVisible }: { isVisible: boolean }) => {
  const [selected, setSelected] = useState<null | 'A' | 'B'>(null);

  return (
    <VesPhaseWrapper
      isVisible={isVisible}
      phaseNumber={7}
      subtitle="Fase 7: Penentuan Tata Kelola EPL Connect"
      title="Strategi Pengelolaan Platform"
      description="Menentukan model operasional jangka panjang platform EPL Connect guna memastikan kesinambungan monitoring dan efisiensi data."
      roles={[
        { name: "Management Internal", icon: ShieldCheck, color: "text-red-400" },
        { name: "Control Team", icon: Activity, color: "text-orange-400" },
        { name: "VES Controller", icon: Monitor, color: "text-blue-400" },
      ]}
      pic=""
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4 w-full max-w-md">
              <BranchSelector 
                title="Handover to Control Team" 
                icon={ArrowRightLeft} 
                colorClass="text-orange-400" 
                side="right" 
                onClick={() => setSelected('A')} 
              />
              <BranchSelector 
                title="Managed by EPL" 
                icon={ShieldCheck} 
                colorClass="text-blue-400" 
                side="left" 
                onClick={() => setSelected('B')} 
              />
            </motion.div>
          ) : (
            <div className="w-full max-w-xl">
              <button 
                onClick={() => setSelected(null)}
                className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Kembali</span>
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border ${selected === 'A' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                       <h4 className="text-slate-900 font-black text-xs uppercase mb-1">
                          {selected === 'A' ? "Kelebihan (Pros)" : "Kelebihan (Pros)"}
                       </h4>
                       <ul className="space-y-2">
                          {(selected === 'A' ? [
                            "EPL tidak direpotkan dengan SDM untuk pengelolaan dan operasional website",
                            "Fokus tim inti EPL tetap pada bisnis utama tanpa beban maintenance harian"
                          ] : [
                            "Website menjadi eksklusif milik EPL",
                            "Muncul peluang bisnis baru (SaaS)",
                            "Development terintegrasi dengan projek & kebutuhan EPL"
                          ]).map((p, i) => (
                            <li key={i} className="text-[10px] text-slate-600 flex items-start gap-2">
                               <div className="w-1 h-1 rounded-full bg-green-500 mt-1.5" />
                               {p}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-4 rounded-2xl border bg-red-500/5 border-red-500/20">
                       <h4 className="text-white font-black text-xs uppercase mb-1 text-red-400/80">
                          Kekurangan (Cons)
                       </h4>
                       <ul className="space-y-2">
                          {(selected === 'A' ? [
                            "Menjadi aset milik divisi service (dapat diakses semua tim)",
                            "Kesiapan tim control untuk pengelolaan & development",
                            "Keterbatasan kontrol EPL terhadap arah pengembangan platform"
                          ] : [
                            "Ketiadaan tim pengelola dan development (saat ini)",
                            "Potensi bentrok fungsi dengan tim kontrol (DB/Web terpisah)",
                            "Biaya investasi tim IT internal yang cukup tinggi"
                          ]).map((p, i) => (
                            <li key={i} className="text-[10px] text-slate-400 flex items-start gap-2">
                               <div className="w-1 h-1 rounded-full bg-red-500/50 mt-1.5" />
                               {p}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-white/[0.02] border border-slate-100 rounded-xl"
              >
                 <p className="text-[10px] text-slate-400 leading-relaxed italic">
                   {selected === 'A' 
                     ? "Catatan: Memerlukan masa transisi minimal 1-2 bulan untuk transfer knowledge."
                     : "Catatan: Memastikan uptime platform 99.9% dan dukungan teknis 24/7."}
                 </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </VesPhaseWrapper>
  );
};

export const PhaseEvaluasi = ({ isVisible }: { isVisible: boolean }) => {
  const [selected, setSelected] = useState<null | 'A' | 'B'>(null);

  return (
    <VesPhaseWrapper
      isVisible={isVisible}
      phaseNumber={8}
      subtitle="Fase 8: Evaluasi & Status Kontrak"
      title="Analisis Keberlanjutan"
      description="Pemantauan performa jangka panjang dan penyusunan laporan histori sebagai basis penentuan kelanjutan kerja sama."
      roles={[
        { name: "Strategist Data", icon: TrendingUp, color: "text-blue-400" },
        { name: "Management Internal", icon: ShieldCheck, color: "text-red-400" },
      ]}
      pic=""
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4 w-full max-w-md">
              <BranchSelector title="Renewal Contract" icon={RefreshCw} colorClass="text-green-400" side="right" onClick={() => setSelected('A')} />
              <BranchSelector title="Project Closed" icon={CheckCircle2} colorClass="text-slate-400" side="left" onClick={() => setSelected('B')} />
            </motion.div>
          ) : (
            <BranchDetail 
              key={selected}
              side={selected === 'A' ? 'right' : 'left'}
              title={selected === 'A' ? "8A: Renewal Contract" : "8B: Project Closed"}
              icon={selected === 'A' ? RefreshCw : CheckCircle2}
              colorClass={selected === 'A' ? "text-green-400" : "text-slate-400"}
              process={selected === 'A' ? "Penyusunan adendum kontrak atau kontrak baru dengan pembaruan scope of work berdasarkan data histori." : "Penutupan resmi seluruh akses sistem, penyerahan archive data final, dan pengarsipan rekam jejak aset."}
              onBack={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </VesPhaseWrapper>
  );
};
