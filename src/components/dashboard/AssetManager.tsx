"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Filter, Database, ArrowRight, ChevronRight, Activity, Zap, 
  Shield, AlertCircle, Download, Upload, Plus, Edit2, QrCode, ExternalLink,
  Archive, CheckCircle2, ShieldAlert, Hammer, AlertTriangle, ChevronLeft,
  ChevronRight as ChevronRightIcon, Printer, Trash2, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getUnitsByProject, exportUnitsExcel, importUnitsExcel, 
  updateUnitStatus, createUnit, updateUnit
} from "@/app/actions/units";
import QRCode from "react-qr-code";

interface AssetManagerProps {
  projectId: string;
  onUnitClick: (unit: any) => void;
  session: any;
  monitoringFocus?: string;
  onRefresh?: () => void;
  onOpenQuickInput?: () => void;
  onOpenAddModal?: () => void;
  onOpenEditModal?: (unit: any) => void;
}

const STATUS_COLORS: any = {
  Normal: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Normal Condition": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Need Repair": "bg-amber-100 text-amber-700 border-amber-200",
  "Need Replace": "bg-rose-100 text-rose-700 border-rose-200",
  Problem: "bg-rose-100 text-rose-700 border-rose-200",
  Critical: "bg-rose-100 text-rose-700 border-rose-200",
  Warning: "bg-amber-100 text-amber-700 border-amber-200",
  Pending: "bg-indigo-100 text-indigo-700 border-indigo-200",
  On_Progress: "bg-blue-100 text-blue-700 border-blue-200"
};

const HEALTH_GRADIENT: any = {
  emerald: "hover:bg-emerald-50/50 border-l-emerald-500",
  amber: "bg-amber-50/30 hover:bg-amber-50/60 border-l-amber-500",
  rose: "bg-rose-50/30 hover:bg-rose-50/60 border-l-rose-500",
};

export default function AssetManager({ 
  projectId, 
  onUnitClick, 
  session, 
  monitoringFocus = "UNIT",
  onRefresh,
  onOpenQuickInput,
  onOpenAddModal,
  onOpenEditModal
}: AssetManagerProps) {
  const router = useRouter();
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [floorFilter, setFloorFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadUnits();
  }, [projectId]);

  const loadUnits = async () => {
    setLoading(true);
    const res = await getUnitsByProject(projectId);
    if (res && 'success' in res && res.success) {
      setUnits(res.data || []);
    }
    setLoading(false);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = units.length;
    const normal = units.filter(u => u.status === "Normal").length;
    const problem = units.filter(u => ["Problem","Critical","Warning"].includes(u.status)).length;
    const pending = units.filter(u => ["Pending","On_Progress"].includes(u.status)).length;
    return { total, normal, problem, pending };
  }, [units]);

  // Filters
  const uniqueBrands = useMemo(() => Array.from(new Set(units.map(u => u.brand).filter(Boolean))).sort(), [units]);
  const uniqueFloors = useMemo(() => Array.from(new Set(units.map(u => u.building_floor).filter(Boolean))).sort(), [units]);

  const filteredUnits = useMemo(() => {
    const list = units.filter(unit => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = 
        unit.tag_number?.toLowerCase().includes(s) ||
        unit.model?.toLowerCase().includes(s) ||
        unit.brand?.toLowerCase().includes(s) ||
        unit.area?.toLowerCase().includes(s) ||
        unit.building_floor?.toLowerCase().includes(s) ||
        unit.room_tenant?.toLowerCase().includes(s);
      
      const matchesStatus = statusFilter === "All" || unit.status === statusFilter || 
                            (statusFilter === "Problem" && ["Problem","Critical","Warning"].includes(unit.status)) ||
                            (statusFilter === "Pending" && ["Pending","On_Progress"].includes(unit.status));
      
      const matchesBrand = brandFilter === "All" || unit.brand === brandFilter;
      const matchesFloor = floorFilter === "All" || unit.building_floor === floorFilter;
      
      return matchesSearch && matchesStatus && matchesBrand && matchesFloor;
    });

    return [...list].sort((a, b) => {
      const rank: any = { Problem: 0, Critical: 0, Warning: 1, On_Progress: 2, Pending: 2, Normal: 3 };
      return (rank[a.status] || 99) - (rank[b.status] || 99);
    });
  }, [units, searchTerm, statusFilter, brandFilter, floorFilter]);

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const paginatedUnits = filteredUnits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Excel Actions
  const handleExport = async () => {
    const res = await exportUnitsExcel(projectId) as any;
    if (res && "success" in res && res.success && res.base64) {
      const link = document.createElement("a");
      link.href = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + res.base64;
      link.download = `Assets_Export_${projectId}.xlsx`;
      link.click();
    }
  };
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const b64 = (evt.target?.result as string).split(",")[1];
      const res = await importUnitsExcel(projectId, b64) as any;
      if (res && "success" in res && res.success) {
        alert(`Successfully imported ${res.imported} units!`);
        loadUnits();
      } else {
        alert(`Import Error: ${res?.error}`);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleHistorySync = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      const response = await fetch("/api/v1/sync/history", {
        method: "POST",
        body: formData
      });
      
      const res = await response.json();
      
      if (res && res.success) {
        alert(`Successfully synced ${res.imported} maintenance records and ${res.photos_extracted || 0} photos!`);
        loadUnits();
      } else {
        alert(`Sync Error: ${res?.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Sync Error: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (historyFileInputRef.current) historyFileInputRef.current.value = "";
    }
  };

  // QR Logic
  const openPrintQR = (unit: any) => {
    setSelectedQR({
      tag: unit.tag_number || "NO-TAG",
      token: unit.qr_code_token || "invalid",
      model: unit.model || "Unknown Model",
      brand: unit.brand || "Daikin",
      area: unit.area || "Area Not Set",
      floor: unit.building_floor || "-",
      room: unit.room_tenant || "-"
    });
    setIsPrintModalOpen(true);
  };

  const handleDownloadQR = async () => {
    if (!selectedQR) return;
    setIsDownloading(true);
    
    try {
      const svg = document.getElementById("qr-code-svg") as unknown as SVGSVGElement;
      if (!svg) throw new Error("QR SVG not found");

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");

      canvas.width = 1000;
      canvas.height = 1000;

      const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

      const [logoDaikin, logoEpl] = await Promise.all([
        loadImage("/daikin_logo.png"),
        loadImage("/logo_epl_connect_1.png")
      ]);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1000, 1000);
      
      ctx.fillStyle = "#f1f5f9";
      for (let x = 40; x < 1000; x += 40) {
        for (let y = 40; y < 1000; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.strokeStyle = "#003366";
      ctx.lineWidth = 24;
      ctx.strokeRect(12, 12, 976, 976);

      const eplW = 280;
      const eplH = (logoEpl.height / logoEpl.width) * eplW;
      const daikinW = 260;
      const daikinH = (logoDaikin.height / logoDaikin.width) * daikinW;
      
      const margin = 100;
      ctx.drawImage(logoEpl, margin, 60 + (daikinH - eplH)/2, eplW, eplH);
      ctx.drawImage(logoDaikin, 1000 - margin - daikinW, 60, daikinW, daikinH);
      
      ctx.fillStyle = "#003366";
      ctx.font = "black 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("DIGITAL ASSET IDENTIFICATION", 500, 195);

      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const qrUrl = URL.createObjectURL(svgBlob);
      const qrImg = await loadImage(qrUrl);
      
      const qrSize = 600;
      const qrX = (1000 - qrSize) / 2;
      const qrY = 225;

      ctx.shadowColor = "rgba(0, 51, 102, 0.1)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = "white";
      ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
      
      ctx.shadowColor = "transparent";
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      URL.revokeObjectURL(qrUrl);

      ctx.fillStyle = "#003366";
      ctx.font = "900 64px Arial";
      const roomName = (selectedQR.room || selectedQR.area || "DAIKIN ASSET").toUpperCase();
      ctx.fillText(roomName, 500, 885);
      
      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#64748b";
      ctx.fillText(`ID: ${selectedQR.tag}`, 500, 935);

      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Daikin-Connect_${selectedQR.tag}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error(e);
      alert("Failed to generate professional QR label");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      
      {/* 1. METRIC CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: `Total ${monitoringFocus === 'ROOM' ? 'Rooms' : 'Units'}`, val: metrics.total, icon: Archive, color: "text-[#0073ea]", bg: "bg-blue-50" },
          { title: "Normal Status", val: metrics.normal, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
          { title: "Reported Problem", val: metrics.problem, icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50" },
          { title: "In Repair", val: metrics.pending, icon: Hammer, color: "text-indigo-500", bg: "bg-indigo-50" },
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${m.bg}`}>
              <m.icon className={`w-6 h-6 ${m.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 truncate">{m.title}</p>
              <h2 className={`text-xl md:text-3xl font-black tracking-tighter ${m.color} truncate`}>{m.val}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* 2. PRIORITY WIDGETS (PROBLEM & WIP) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[280px]">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-700 flex items-center gap-2">
              <AlertTriangle size={14} className="animate-pulse" /> Critical Attention
            </h3>
            <span className="px-2 py-0.5 bg-rose-200 text-rose-800 text-[10px] font-black rounded-lg">{metrics.problem}</span>
          </div>
          <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {units.filter(u => ["Problem","Critical","Warning"].includes(u.status)).length === 0 ? (
              <p className="p-8 text-center text-xs font-bold text-slate-300 italic uppercase">All systems operational ✨</p>
            ) : (
              units.filter(u => ["Problem","Critical","Warning"].includes(u.status)).map(u => (
                <div key={u.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`/w/${projectId}/dashboard/units/${u.id}`, '_blank'); }} className="p-3 bg-slate-50 hover:bg-rose-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all cursor-pointer flex justify-between items-center group">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#323338] tracking-tight group-hover:text-rose-700 truncate">{u.tag_number}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase">{u.room_tenant || u.area}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-rose-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[280px]">
          <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-700 flex items-center gap-2">
              <Hammer size={14} /> Ongoing Maintenance
            </h3>
            <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-[10px] font-black rounded-lg">{metrics.pending}</span>
          </div>
          <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {units.filter(u => ["Pending","On_Progress"].includes(u.status)).length === 0 ? (
              <p className="p-8 text-center text-xs font-bold text-slate-300 italic uppercase">No active work orders.</p>
            ) : (
              units.filter(u => ["Pending","On_Progress"].includes(u.status)).map(u => (
                <div key={u.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`/w/${projectId}/dashboard/units/${u.id}`, '_blank'); }} className="p-3 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer flex justify-between items-center group">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#323338] tracking-tight group-hover:text-indigo-700 truncate">{u.tag_number}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase">{u.room_tenant || u.area}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. ACTION BAR & FILTERS */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1 lg:max-w-xl relative group">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all w-5 h-5 ${searchTerm ? "text-[#0073ea]" : "text-slate-300"}`} />
            <input 
              type="text" 
              placeholder={`Search by tag, model, or location...`} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-14 pr-6 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-[#323338] placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-[#0073ea] transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
             {session?.isInternal && (
               <>
                 <div className="relative group/sync">
                    <button className="px-5 py-4 rounded-2xl bg-white border border-slate-100 text-slate-400 font-black shadow-sm hover:border-[#0073ea] hover:text-[#0073ea] transition-all flex items-center gap-2.5 uppercase text-xs tracking-widest">
                       <Database size={18} />
                       <span className="hidden sm:block">Sync Center</span>
                    </button>
                    
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover/sync:opacity-100 group-hover/sync:visible transition-all z-[100] py-2">
                       <p className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Select Sync Protocol</p>
                       <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                       >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                             <Plus size={16} />
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-slate-700">Import Asset Units</p>
                             <p className="text-[9px] font-bold text-slate-400">Inventory baseline sync</p>
                          </div>
                       </button>
                       <button 
                          onClick={() => historyFileInputRef.current?.click()}
                          className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                       >
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                             <History size={16} />
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-slate-700">Sync Maintenance logs</p>
                             <p className="text-[9px] font-bold text-slate-400">Historical records & photos</p>
                          </div>
                       </button>
                    </div>
                 </div>

                 <button onClick={onOpenAddModal} className="px-6 py-4 rounded-2xl bg-[#323338] text-white font-black shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 uppercase text-xs tracking-widest">
                    <Plus size={18} /> New {monitoringFocus === 'ROOM' ? 'Room' : 'Unit'}
                 </button>
                 
                 <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx,.xls" />
                 <input type="file" ref={historyFileInputRef} onChange={handleHistorySync} className="hidden" accept=".xlsx,.xls" />
               </>
             )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-50">
           <div className="flex flex-wrap items-center gap-2">
              <select value={floorFilter} onChange={e => setFloorFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#323338] focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="All">All Floors</option>
                {uniqueFloors.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#323338] focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="All">All Brands</option>
                {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#323338] focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="All">All Status</option>
                <option value="Normal">Normal</option>
                <option value="Problem">Problems</option>
                <option value="Pending">Maintenance</option>
              </select>
           </div>
           
           <div className="flex items-center gap-2">
              <button onClick={handleExport} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-[#0073ea] hover:border-[#0073ea] transition-all" title="Export to Excel"><Download size={18} /></button>
              {session?.isInternal && (
                <>
                  <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-amber-500 hover:border-amber-500 transition-all" title="Import from Excel"><Upload size={18} /></button>
                  <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx,.xls" />
                </>
              )}
           </div>
        </div>
      </div>

      {/* 4. ASSET BOARD (SUPER TABLE) */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Asset Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Spec & Capacity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Location</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Health Index</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="wait">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-8 py-4"><div className="h-12 bg-slate-50 rounded-2xl animate-pulse"></div></td>
                    </tr>
                  ))
                ) : paginatedUnits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest italic opacity-40">No matching records found</td>
                  </tr>
                ) : (
                  paginatedUnits.map((u) => (
                    <motion.tr 
                      key={u.id} 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`/w/${projectId}/dashboard/units/${u.id}`, '_blank'); }}
                      className={`group transition-all cursor-pointer border-l-4 ${HEALTH_GRADIENT[u.health_color] || 'hover:bg-slate-50 border-l-transparent'}`}
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-10 rounded-full shrink-0 ${u.status === 'Problem' || u.status === 'Critical' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                          <div className="min-w-0">
                             <p className="text-sm font-black text-[#323338] tracking-tight truncate leading-tight group-hover:text-[#0073ea] transition-colors">{u.room_tenant || (monitoringFocus === 'ROOM' ? 'Unnamed Room' : 'Unnamed Asset')}</p>
                             <p className="text-[11px] font-black text-[#0073ea] uppercase tracking-widest">{u.tag_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                         <p className="text-[11px] font-bold text-slate-700">{u.brand} · {u.model}</p>
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{u.unit_type} · {u.capacity}</p>
                      </td>
                      <td className="px-8 py-4">
                         <p className="text-[11px] font-black text-[#323338] uppercase tracking-tight">{u.area}</p>
                         <p className="text-[10px] font-bold text-slate-400">{u.building_floor}</p>
                      </td>
                      <td className="px-8 py-4">
                         <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                               <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-black tracking-tighter border ${STATUS_COLORS[u.health_label] || STATUS_COLORS.Normal}`}>
                                 {Math.round(u.health_score)}%
                               </span>
                            </div>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter ${
                              u.status === 'Problem' || u.status === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                              u.status === 'Normal' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {u.status.replace("_", " ")}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => { e.stopPropagation(); window.open(`/passport/${u.qr_code_token}`, '_blank'); }} className="p-2 rounded-xl bg-white border border-[#0073ea]/20 text-[#0073ea] hover:bg-[#0073ea] hover:text-white transition-all shadow-sm" title="View Passport"><ExternalLink size={14}/></button>
                           <button onClick={(e) => { e.stopPropagation(); openPrintQR(u); }} className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Print QR Label"><QrCode size={14}/></button>
                           {session?.isInternal && (
                             <button onClick={(e) => { e.stopPropagation(); onOpenEditModal?.(u); }} className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:bg-[#323338] hover:text-white transition-all shadow-sm" title="Edit Asset"><Edit2 size={14}/></button>
                           )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 transition-all hover:border-[#0073ea] hover:text-[#0073ea]"
            ><ChevronLeft size={18}/></button>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 transition-all hover:border-[#0073ea] hover:text-[#0073ea]"
            ><ChevronRightIcon size={18}/></button>
          </div>
        )}
      </div>

      {/* 5. QR PRINT MODAL (Integrated) */}
      <AnimatePresence>
        {isPrintModalOpen && selectedQR && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#323338]/80 backdrop-blur-md" onClick={() => setIsPrintModalOpen(false)} />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-lg p-10 overflow-hidden">
                <div className="text-center mb-8">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <QrCode size={32} />
                   </div>
                   <h2 className="text-2xl font-black text-[#323338] tracking-tight uppercase">Generate Asset QR</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">High-Fidelity Identification Label</p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col items-center justify-center mb-8 group transition-all hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10">
                   <div id="qr-code-svg-container" className="p-4 bg-white rounded-2xl shadow-sm">
                      <QRCode 
                        id="qr-code-svg"
                        value={`${window.location.origin}/passport/${selectedQR.token}`}
                        size={200}
                        level="H"
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      />
                   </div>
                   <div className="mt-6 text-center">
                      <p className="text-lg font-black text-[#323338] uppercase tracking-tight">{selectedQR.tag}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedQR.brand} · {selectedQR.model}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setIsPrintModalOpen(false)} className="px-6 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                   <button 
                     onClick={handleDownloadQR} 
                     disabled={isDownloading}
                     className="px-6 py-4 rounded-2xl bg-[#0073ea] text-white font-black uppercase text-xs tracking-widest hover:bg-blue-600 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2"
                   >
                      {isDownloading ? <Activity size={16} className="animate-spin" /> : <Printer size={16} />}
                      {isDownloading ? "Generating..." : "Print Label"}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
