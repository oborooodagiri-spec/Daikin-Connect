"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ArrowLeft, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp,
  Cpu, Fan, Network, Layers, Stethoscope, Wifi, Zap, Thermometer, Shield, BookOpen
} from "lucide-react";
import { ERROR_CODES, REMOTE_GUIDES, type ErrorCode, type UnitCategory, type ModelType, type ErrorSeverity } from "@/data/errorCodes";

const CATEGORY_META: Record<UnitCategory, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  indoor:  { label: "Indoor Unit",  icon: <Fan size={16} />,     color: "#0073ea", bg: "rgba(0,115,234,0.08)" },
  outdoor: { label: "Outdoor Unit", icon: <Cpu size={16} />,     color: "#00c875", bg: "rgba(0,200,117,0.08)" },
  system:  { label: "System",       icon: <Network size={16} />, color: "#fdab3d", bg: "rgba(253,171,61,0.08)" },
  others:  { label: "Others",       icon: <Layers size={16} />,  color: "#a25ddc", bg: "rgba(162,93,220,0.08)" },
};

const SEVERITY_META: Record<ErrorSeverity, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  critical: { label: "Critical",  icon: <AlertTriangle size={14} />, color: "#e44258", bg: "rgba(228,66,88,0.08)",  border: "rgba(228,66,88,0.25)" },
  warning:  { label: "Warning",   icon: <AlertCircle size={14} />,  color: "#fdab3d", bg: "rgba(253,171,61,0.08)", border: "rgba(253,171,61,0.25)" },
  info:     { label: "Info",      icon: <Info size={14} />,         color: "#579bfc", bg: "rgba(87,155,252,0.08)", border: "rgba(87,155,252,0.25)" },
};

const MODEL_LIST: ModelType[] = ["RA", "SkyAir", "VRV", "Package", "HRV", "Chiller"];

const PAGE_SIZE = 20;

export default function ErrorCodesClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<UnitCategory | "all">("all");
  const [activeModel, setActiveModel] = useState<ModelType | "all">("all");
  const [activeSeverity, setActiveSeverity] = useState<ErrorSeverity | "all">("all");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { searchRef.current?.focus(); }, []);
  useEffect(() => { setPage(1); }, [query, activeCategory, activeModel, activeSeverity]);

  const filtered = useMemo(() => {
    let results = ERROR_CODES;
    if (activeCategory !== "all") results = results.filter(e => e.category === activeCategory);
    if (activeModel !== "all") results = results.filter(e => e.models.includes(activeModel));
    if (activeSeverity !== "all") results = results.filter(e => e.severity === activeSeverity);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      results = results.filter(e =>
        e.code.toLowerCase().includes(q) ||
        e.contents.toLowerCase().includes(q) ||
        e.causes.some(c => c.toLowerCase().includes(q))
      );
    }
    return results;
  }, [query, activeCategory, activeModel, activeSeverity]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: ERROR_CODES.length,
    indoor: ERROR_CODES.filter(e => e.category === "indoor").length,
    outdoor: ERROR_CODES.filter(e => e.category === "outdoor").length,
    system: ERROR_CODES.filter(e => e.category === "system").length,
    others: ERROR_CODES.filter(e => e.category === "others").length,
    critical: ERROR_CODES.filter(e => e.severity === "critical").length,
  }), []);

  const handleToggle = useCallback((code: string) => {
    setExpandedCode(prev => prev === code ? null : code);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/tools")} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all" title="Back to Tools">
              <ArrowLeft size={18} className="text-slate-500" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #e44258 0%, #ff6b81 100%)", boxShadow: "0 4px 12px rgba(228,66,88,0.3)" }}>
                <Stethoscope size={18} />
              </div>
              <div>
                <h1 className="text-sm font-black text-[#323338] tracking-tight leading-none">Error Code Diagnosis</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Self-Diagnosis Tool</p>
              </div>
            </div>
          </div>
          <button onClick={() => setShowGuide(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-all">
            <BookOpen size={14} /> Remote Guide
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* ═══ HERO SEARCH ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-[#323338] tracking-tight leading-tight mb-2">
            Daikin Self-<span className="bg-gradient-to-r from-[#e44258] to-[#ff6b81] bg-clip-text text-transparent">Diagnosis</span>
          </h2>
          <p className="text-sm text-slate-400 font-medium mb-6">Masukkan kode error atau deskripsi masalah untuk menemukan penyebab &amp; solusinya secara instan.</p>

          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Ketik kode error (cth: "U4", "E5") atau deskripsi (cth: "compressor")...'
              className="w-full h-14 pl-12 pr-12 bg-white border-2 border-slate-200 rounded-2xl text-base font-medium text-[#323338] placeholder:text-slate-300 focus:border-[#e44258] focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 transition-all">
                <X size={16} className="text-slate-400" />
              </button>
            )}
          </div>
        </motion.div>

        {/* ═══ STATS ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Total Codes", value: stats.total, color: "#323338", bg: "#f1f3f5" },
            { label: "Indoor", value: stats.indoor, ...CATEGORY_META.indoor },
            { label: "Outdoor", value: stats.outdoor, ...CATEGORY_META.outdoor },
            { label: "System", value: stats.system, ...CATEGORY_META.system },
            { label: "Others", value: stats.others, ...CATEGORY_META.others },
            { label: "Critical", value: stats.critical, color: "#e44258", bg: "rgba(228,66,88,0.08)" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ═══ FILTERS ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1 mr-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</span>
          </div>
          {(["all", "indoor", "outdoor", "system", "others"] as const).map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activeCategory === cat ? (cat === "all" ? "#323338" : CATEGORY_META[cat].color) : "white",
                color: activeCategory === cat ? "white" : "#676879",
                border: `1px solid ${activeCategory === cat ? "transparent" : "#e6e9ef"}`,
                boxShadow: activeCategory === cat ? `0 2px 8px ${cat === "all" ? "rgba(0,0,0,0.15)" : CATEGORY_META[cat].color + "40"}` : "none"
              }}>
              {cat === "all" ? "All" : CATEGORY_META[cat].label}
            </button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1 mr-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</span>
          </div>
          {(["all", ...MODEL_LIST] as const).map(model => (
            <button key={model} onClick={() => setActiveModel(model as ModelType | "all")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activeModel === model ? "#0073ea" : "white",
                color: activeModel === model ? "white" : "#676879",
                border: `1px solid ${activeModel === model ? "transparent" : "#e6e9ef"}`,
                boxShadow: activeModel === model ? "0 2px 8px rgba(0,115,234,0.3)" : "none"
              }}>
              {model === "all" ? "All Models" : model}
            </button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-1 mr-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity</span>
          </div>
          {(["all", "critical", "warning", "info"] as const).map(sev => (
            <button key={sev} onClick={() => setActiveSeverity(sev as ErrorSeverity | "all")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              style={{
                background: activeSeverity === sev ? (sev === "all" ? "#323338" : SEVERITY_META[sev].color) : "white",
                color: activeSeverity === sev ? "white" : "#676879",
                border: `1px solid ${activeSeverity === sev ? "transparent" : "#e6e9ef"}`,
                boxShadow: activeSeverity === sev ? `0 2px 8px ${sev === "all" ? "rgba(0,0,0,0.15)" : SEVERITY_META[sev].color + "40"}` : "none"
              }}>
              {sev !== "all" && SEVERITY_META[sev].icon}
              {sev === "all" ? "All Severity" : SEVERITY_META[sev].label}
            </button>
          ))}
        </motion.div>

        {/* ═══ RESULTS HEADER ═══ */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
              {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
            </div>
            {query && <span className="text-xs text-slate-400 font-medium">for &ldquo;{query}&rdquo;</span>}
          </div>
          {totalPages > 1 && (
            <span className="text-xs text-slate-400 font-medium">Page {page} of {totalPages}</span>
          )}
        </div>

        {/* ═══ ERROR CODE CARDS ═══ */}
        <div className="space-y-3 mb-6">
          <AnimatePresence mode="popLayout">
            {paginated.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
                <Search size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-lg font-bold text-slate-300 mb-1">Tidak ada error code ditemukan</p>
                <p className="text-sm text-slate-300">Coba ubah kata kunci pencarian atau filter Anda.</p>
              </motion.div>
            ) : paginated.map((err, i) => {
              const catMeta = CATEGORY_META[err.category];
              const sevMeta = SEVERITY_META[err.severity];
              const isExpanded = expandedCode === err.code;

              return (
                <motion.div
                  key={err.code}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => handleToggle(err.code)}
                  className="bg-white rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-lg group overflow-hidden"
                  style={{
                    borderColor: isExpanded ? sevMeta.border : "#e6e9ef",
                    boxShadow: isExpanded ? `0 8px 30px ${sevMeta.color}15` : "0 1px 3px rgba(0,0,0,0.03)"
                  }}
                >
                  {/* Card Header */}
                  <div className="px-4 md:px-6 py-4 flex items-center gap-3 md:gap-4">
                    {/* Code Badge */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center font-black text-lg md:text-xl shrink-0"
                      style={{ background: sevMeta.bg, color: sevMeta.color, border: `2px solid ${sevMeta.border}` }}>
                      {err.code}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider" style={{ background: catMeta.bg, color: catMeta.color }}>
                          {catMeta.label}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider" style={{ background: sevMeta.bg, color: sevMeta.color }}>
                          {sevMeta.icon} {sevMeta.label}
                        </span>
                      </div>
                      <p className="text-sm md:text-base font-bold text-[#323338] leading-tight truncate group-hover:text-[#0073ea] transition-colors">
                        {err.contents}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {err.models.map(m => (
                          <span key={m} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500">{m}</span>
                        ))}
                      </div>
                    </div>

                    {/* Expand Indicator */}
                    <div className="shrink-0">
                      {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-300" />}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 md:px-6 pb-5 pt-2 border-t" style={{ borderColor: sevMeta.border + "40" }}>
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Supposed Causes */}
                            <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <AlertTriangle size={12} /> Penyebab yang Mungkin
                              </h4>
                              <ul className="space-y-1.5">
                                {err.causes.map((cause, ci) => (
                                  <li key={ci} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: sevMeta.color }} />
                                    <span className="text-sm text-slate-600 leading-snug">{cause}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Quick Action Guide */}
                            <div className="rounded-xl p-4" style={{ background: sevMeta.bg }}>
                              <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: sevMeta.color }}>
                                <Shield size={12} /> Langkah Penanganan
                              </h4>
                              <ol className="space-y-1.5 list-decimal list-inside">
                                {err.severity === "critical" ? (
                                  <>
                                    <li className="text-sm text-slate-600">Matikan unit segera dan cabut power supply.</li>
                                    <li className="text-sm text-slate-600">Periksa koneksi kabel dan connector terkait.</li>
                                    <li className="text-sm text-slate-600">Hubungi tim service engineer untuk inspeksi mendalam.</li>
                                    <li className="text-sm text-slate-600">Jangan restart unit sebelum root cause ditemukan.</li>
                                  </>
                                ) : err.severity === "warning" ? (
                                  <>
                                    <li className="text-sm text-slate-600">Catat kode error dan waktu kejadian.</li>
                                    <li className="text-sm text-slate-600">Periksa connector dan thermistor terkait.</li>
                                    <li className="text-sm text-slate-600">Reset unit dan monitor apakah error terulang.</li>
                                    <li className="text-sm text-slate-600">Jika terulang, laporkan ke tim maintenance.</li>
                                  </>
                                ) : (
                                  <>
                                    <li className="text-sm text-slate-600">Verifikasi pengaturan dan konfigurasi unit.</li>
                                    <li className="text-sm text-slate-600">Periksa wiring dan setting remote controller.</li>
                                    <li className="text-sm text-slate-600">Reset dan konfigurasi ulang jika diperlukan.</li>
                                  </>
                                )}
                              </ol>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ═══ PAGINATION ═══ */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-30">
              <ArrowLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) { p = i + 1; }
              else if (page <= 4) { p = i + 1; }
              else if (page >= totalPages - 3) { p = totalPages - 6 + i; }
              else { p = page - 3 + i; }
              return (
                <button key={p} onClick={() => setPage(p)}
                  className="w-10 h-10 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: page === p ? "#323338" : "white",
                    color: page === p ? "white" : "#676879",
                    border: `1px solid ${page === p ? "transparent" : "#e6e9ef"}`,
                  }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-30 rotate-180">
              <ArrowLeft size={16} />
            </button>
          </div>
        )}
      </main>

      {/* ═══ REMOTE GUIDE MODAL ═══ */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGuide(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#0a1628] to-[#1a2f4c] text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Wifi size={20} className="text-blue-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Remote Controller Guide</h2>
                    <p className="text-xs text-blue-200/70 font-medium">Cara Membaca Kode Error via Remote</p>
                  </div>
                </div>
                <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {REMOTE_GUIDES.map(guide => (
                  <div key={guide.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-2" style={{ background: guide.type === "wireless" ? "rgba(0,200,117,0.06)" : "rgba(0,115,234,0.06)" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: guide.type === "wireless" ? "rgba(0,200,117,0.15)" : "rgba(0,115,234,0.15)" }}>
                        {guide.type === "wireless" ? <Wifi size={16} style={{ color: "#00c875" }} /> : <Zap size={16} style={{ color: "#0073ea" }} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#323338]">{guide.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{guide.models.join(", ")}</p>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {guide.steps.map((step, si) => (
                        <div key={si} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-black text-slate-500">{si + 1}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
