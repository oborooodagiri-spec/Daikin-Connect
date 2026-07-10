"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, AlertTriangle, ShieldCheck, Power, Info, HelpCircle, X, TerminalSquare } from "lucide-react";
import { ERROR_CODES, REMOTE_GUIDES, type ErrorCode } from "@/data/errorCodes";

export default function ErrorCodesClient() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [activeCode, setActiveCode] = useState<ErrorCode | null>(null);
  const [status, setStatus] = useState<"idle" | "analyzing" | "found" | "not_found">("idle");
  const [showRemoteGuide, setShowRemoteGuide] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
    const handleClick = () => {
      // Re-focus on input if clicked outside text
      if (document.activeElement?.tagName !== 'INPUT' && window.getSelection()?.toString() === '') {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Handle typing and auto-search
  useEffect(() => {
    const val = input.toUpperCase().trim();
    if (val.length === 0) {
      setStatus("idle");
      setActiveCode(null);
      return;
    }

    if (val.length >= 2) {
      setStatus("analyzing");
      
      const timeout = setTimeout(() => {
        const found = ERROR_CODES.find(e => e.code === val);
        if (found) {
          setActiveCode(found);
          setStatus("found");
        } else {
          setActiveCode(null);
          setStatus("not_found");
        }
      }, 600); // Decent decoding delay
      
      return () => clearTimeout(timeout);
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setInput("");
      setStatus("idle");
      setActiveCode(null);
      setShowRemoteGuide(false);
    }
  };

  const getSeverityColor = (sev?: string) => {
    if (sev === "critical") return "text-red-600 bg-red-50 border-red-200";
    if (sev === "warning") return "text-amber-600 bg-amber-50 border-amber-200";
    if (sev === "info") return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  const getSeverityBadge = (sev?: string) => {
    if (sev === "critical") return { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" };
    if (sev === "warning") return { bg: "#fffbeb", text: "#d97706", border: "#fcd34d" };
    if (sev === "info") return { bg: "#eff6ff", text: "#2563eb", border: "#93c5fd" };
    return { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
  };

  const catNames: Record<string, string> = {
    indoor: "Indoor Unit",
    outdoor: "Outdoor Unit",
    system: "System & Komunikasi",
    others: "Lain-lain / Aksesoris"
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans relative overflow-hidden flex flex-col transition-colors duration-500">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      {/* Header Bar */}
      <header className="w-full p-4 md:p-6 flex items-center justify-between z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <button onClick={() => router.push("/tools")} className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
          <ArrowLeft size={16} />
          <span className="text-xs font-semibold tracking-wide">Kembali ke Tools</span>
        </button>
        <button onClick={() => setShowRemoteGuide(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
          <TerminalSquare size={16} />
          <span className="text-xs font-semibold tracking-wide">Diagnosis Remote</span>
        </button>
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 w-full max-w-4xl mx-auto min-h-[500px]">
        
        {/* The Input Section */}
        <motion.div 
          layout
          className="w-full flex flex-col items-center mt-[-10vh]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="text-xs md:text-sm tracking-widest font-bold uppercase text-slate-400 mb-6 flex items-center gap-2">
            <Search size={16} /> Masukkan Kode Error
          </div>
          
          <div className="relative flex items-center justify-center bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 md:p-8 shadow-inner transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2))}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              className="bg-transparent border-none text-center outline-none text-6xl md:text-8xl lg:text-[100px] font-black uppercase text-slate-800 tracking-wider w-[200px] md:w-[280px] z-20 placeholder-slate-200"
              placeholder="--"
            />
            {/* Blinking cursor effect fake when empty */}
            {input.length === 0 && (
              <motion.div 
                animate={{ opacity: [1, 0, 1] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute w-12 md:w-20 h-1 md:h-1.5 bg-blue-500 bottom-8 md:bottom-12 rounded-full"
              />
            )}
          </div>
        </motion.div>

        {/* Status Indicators & Results */}
        <div className="mt-8 w-full max-w-3xl">
          <AnimatePresence mode="wait">
            
            {/* 1. ANALYZING STATE */}
            {status === "analyzing" && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-12 text-slate-400 gap-4"
              >
                <Search size={32} className="animate-spin text-blue-500" />
                <div className="text-sm tracking-widest uppercase font-bold text-slate-500">
                  Mencari di Database...
                </div>
              </motion.div>
            )}

            {/* 2. NOT FOUND STATE */}
            {status === "not_found" && input.length >= 2 && (
              <motion.div
                key="not_found"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-12 text-red-500 gap-4 text-center bg-red-50 rounded-3xl border border-red-100"
              >
                <HelpCircle size={40} className="text-red-400" />
                <div className="text-lg md:text-xl font-bold">
                  Kode "{input}" tidak ditemukan
                </div>
                <div className="text-sm text-red-400/80 max-w-xs">
                  Pastikan kode yang dimasukkan benar. Cek panduan diagnosis remote jika kesulitan membaca kode.
                </div>
                <button onClick={() => setShowRemoteGuide(true)} className="mt-2 text-xs font-bold bg-white text-red-500 px-4 py-2 rounded-full shadow-sm hover:shadow border border-red-200">
                  Lihat Cara Baca Remote
                </button>
              </motion.div>
            )}

            {/* 3. FOUND STATE (RESULTS) */}
            {status === "found" && activeCode && (
              <motion.div
                key="found"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden"
              >
                {/* Header Banner */}
                <div className={`px-6 py-5 md:px-8 md:py-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${getSeverityColor(activeCode.severity)}`}>
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm shrink-0 mt-1 md:mt-0">
                      {activeCode.severity === "critical" ? <AlertTriangle className="text-red-500" size={28} /> : 
                       activeCode.severity === "warning" ? <AlertTriangle className="text-amber-500" size={28} /> :
                       <Info className="text-blue-500" size={28} />}
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
                        {activeCode.contents}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-2.5 py-1 bg-white/60 backdrop-blur text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm border border-black/5 text-slate-700">
                          Lokasi: {catNames[activeCode.category]}
                        </span>
                        <span className="px-2.5 py-1 bg-white/60 backdrop-blur text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm border border-black/5 text-slate-700 flex items-center gap-1">
                          <Power size={10} /> Unit: {activeCode.models.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 bg-white">
                  {/* Left Column: Causes */}
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Search size={14} className="text-slate-400" /> Akar Penyebab
                    </div>
                    <ul className="space-y-3">
                      {activeCode.causes.map((cause, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + (i * 0.1) }}
                          className="text-sm text-slate-600 flex items-start gap-3"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{cause}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: Resolution */}
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <ShieldCheck size={14} className="text-slate-400" /> Langkah Solusi
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <ol className="space-y-3">
                        {activeCode.resolution.map((res, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="text-sm text-slate-700 flex items-start gap-3"
                          >
                            <span className="text-slate-400 text-xs font-bold mt-0.5 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                              {i+1}
                            </span>
                            <span className="leading-relaxed pt-0.5">{res}</span>
                          </motion.li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ═══ REMOTE GUIDE MODAL ═══ */}
      <AnimatePresence>
        {showRemoteGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowRemoteGuide(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white text-slate-800 shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                    <TerminalSquare size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight">Panduan Diagnosis Remote</h2>
                    <p className="text-xs text-slate-400 font-medium">Cara membaca kode error dari berbagai remote controller Daikin</p>
                  </div>
                </div>
                <button onClick={() => setShowRemoteGuide(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors bg-slate-50 text-slate-400 border border-slate-200">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
                <div className="grid md:grid-cols-2 gap-6">
                  {REMOTE_GUIDES.map((guide, i) => (
                    <motion.div key={guide.id} 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                    >
                      <div className={`px-5 py-4 flex items-center gap-3 border-b ${guide.type === 'wireless' ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${guide.type === 'wireless' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          <TerminalSquare size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-tight">{guide.title}</p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-snug">Unit: {guide.models.join(", ")}</p>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="space-y-4">
                          {guide.steps.map((step, si) => (
                            <div key={si} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-sm border border-slate-200 mt-0.5">
                                <span className="text-[10px] font-black text-slate-500">{si + 1}</span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
