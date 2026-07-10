"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Terminal, AlertTriangle, ShieldCheck, Power, Search, Info } from "lucide-react";
import { ERROR_CODES, type ErrorCode } from "@/data/errorCodes";

export default function ErrorCodesClient() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [activeCode, setActiveCode] = useState<ErrorCode | null>(null);
  const [status, setStatus] = useState<"idle" | "analyzing" | "found" | "not_found">("idle");
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
      }, 800); // Simulate network/decoding delay
      
      return () => clearTimeout(timeout);
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setInput("");
      setStatus("idle");
      setActiveCode(null);
    }
  };

  const getSeverityColor = (sev?: string) => {
    if (sev === "critical") return "#ff3333";
    if (sev === "warning") return "#ffaa00";
    if (sev === "info") return "#00ccff";
    return "#33ff33";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-400 font-mono relative overflow-hidden flex flex-col"
         style={{ backgroundImage: "radial-gradient(circle at center, rgba(16,36,28,0.8) 0%, rgba(2,6,23,1) 100%)" }}>
      
      {/* Scanline Effect Overlay */}
      <div className="pointer-events-none absolute inset-0 z-50 opacity-10"
           style={{ background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 4px, 3px 100%" }} />

      {/* Header Bar */}
      <header className="w-full p-4 md:p-6 flex items-center justify-between z-10 opacity-70">
        <button onClick={() => router.push("/tools")} className="flex items-center gap-2 hover:text-emerald-300 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-xs tracking-widest uppercase">Batal & Kembali</span>
        </button>
        <div className="flex items-center gap-2 text-xs opacity-50 tracking-widest uppercase">
          <Terminal size={14} /> Daikin Diagnostic Terminal v2.1
        </div>
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 w-full max-w-4xl mx-auto">
        
        {/* The Input Section */}
        <motion.div 
          layout
          className="w-full flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="text-xs md:text-sm tracking-[0.3em] uppercase text-emerald-500/70 mb-4 animate-pulse">
            Masukkan Kode Error
          </div>
          
          <div className="relative flex items-center justify-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2))}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              className="bg-transparent border-none text-center outline-none text-6xl md:text-8xl lg:text-[120px] font-black uppercase text-white tracking-widest w-[300px] md:w-[400px] z-20 placeholder-slate-800"
              placeholder="--"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            />
            {/* Blinking cursor effect fake when empty */}
            {input.length === 0 && (
              <motion.div 
                animate={{ opacity: [1, 0, 1] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute w-12 md:w-20 h-1 md:h-2 bg-emerald-500/50 bottom-2 md:bottom-6"
              />
            )}
          </div>
        </motion.div>

        {/* Status Indicators & Results */}
        <div className="mt-12 w-full h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* 1. ANALYZING STATE */}
            {status === "analyzing" && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-emerald-400 gap-4"
              >
                <Search size={32} className="animate-spin opacity-50" />
                <div className="text-sm tracking-[0.2em] uppercase font-bold animate-pulse">
                  Menganalisis Kode...
                </div>
                <div className="text-xs opacity-50 font-mono">
                  Mengakses database SM-TS2...
                </div>
              </motion.div>
            )}

            {/* 2. NOT FOUND STATE */}
            {status === "not_found" && input.length >= 2 && (
              <motion.div
                key="not_found"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full text-red-500 gap-4"
              >
                <AlertTriangle size={48} className="opacity-80" />
                <div className="text-lg md:text-xl tracking-widest uppercase font-bold">
                  KODE {input} TIDAK DITEMUKAN
                </div>
                <div className="text-sm opacity-70">
                  Pastikan kode yang Anda masukkan benar.
                </div>
              </motion.div>
            )}

            {/* 3. FOUND STATE (RESULTS) */}
            {status === "found" && activeCode && (
              <motion.div
                key="found"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-3xl mx-auto border border-emerald-500/30 bg-emerald-950/20 p-6 md:p-8 rounded-xl backdrop-blur-sm relative"
                style={{ boxShadow: `0 0 30px ${getSeverityColor(activeCode.severity)}20, inset 0 0 20px rgba(16, 185, 129, 0.05)` }}
              >
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500/50 -translate-x-0.5 -translate-y-0.5" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500/50 translate-x-0.5 -translate-y-0.5" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500/50 -translate-x-0.5 translate-y-0.5" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500/50 translate-x-0.5 translate-y-0.5" />

                <div className="flex items-center gap-3 mb-6 border-b border-emerald-500/30 pb-4">
                  {activeCode.severity === "critical" ? <AlertTriangle className="text-red-500" size={24} /> : 
                   activeCode.severity === "warning" ? <AlertTriangle className="text-yellow-500" size={24} /> :
                   <Info className="text-blue-400" size={24} />}
                  
                  <h2 className="text-xl md:text-2xl font-bold tracking-wider text-white">
                    {activeCode.contents.toUpperCase()}
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column: Causes */}
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-500/70 mb-3 flex items-center gap-2">
                      <Search size={14} /> Analisis Penyebab
                    </div>
                    <ul className="space-y-3">
                      {activeCode.causes.map((cause, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (i * 0.1) }}
                          className="text-sm md:text-base text-slate-300 flex items-start gap-3 leading-relaxed"
                        >
                          <span className="text-emerald-500 font-bold mt-0.5">{">"}</span>
                          {cause}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: Resolution */}
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: getSeverityColor(activeCode.severity) }}>
                      <ShieldCheck size={14} /> Solusi & Tindakan
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg border border-emerald-500/20">
                      <ol className="space-y-3">
                        {activeCode.resolution.map((res, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="text-sm text-white/90 flex items-start gap-3 leading-relaxed"
                          >
                            <span className="text-emerald-500/50 text-xs font-bold mt-1">{(i+1).toString().padStart(2, '0')}</span>
                            {res}
                          </motion.li>
                        ))}
                      </ol>
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="mt-6 flex items-center gap-4 text-[10px] uppercase tracking-widest text-emerald-500/40"
                    >
                      <div className="flex items-center gap-1"><Power size={12}/> Models: {activeCode.models.join(", ")}</div>
                      <div className="flex items-center gap-1">| Unit: {activeCode.category}</div>
                    </motion.div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer System Status */}
      <footer className="w-full p-4 flex justify-between items-center z-10 opacity-50 text-[10px] tracking-widest uppercase border-t border-emerald-900/50">
        <div>System: ONLINE</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> DB_CONN: OK</div>
          <div>MEM: 32MB</div>
        </div>
      </footer>
    </div>
  );
}
