"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getUnitsByProject, createUnit, updateUnit, getProjectData, 
  exportUnitsExcel, importUnitsExcel, getUnitHistory, updateUnitStatus
} from "@/app/actions/units";
import { getSession } from "@/app/actions/auth";
import { resolveComplaint, getProjectComplaints } from "@/app/actions/complaints";
import { 
  Search, ArrowLeft, MapPin, Plus, Edit2, CheckCircle2, 
  X, Save, Settings2, ShieldAlert, QrCode, Printer, 
  Archive, Activity, Download, HardHat, Clock, Hammer, AlertTriangle, Upload, Building2, ExternalLink,
  History as HistoryIcon, Database, ChevronLeft, ChevronRight
} from "lucide-react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import UnitHistoryTimeline from "@/components/UnitHistoryTimeline";
import UnitDetailModal from "@/components/UnitDetailModal";
import QuickInputModal from "@/components/dashboard/QuickInputModal";
import Portal from "@/components/Portal";

export default function UnitsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const customerId = params.id as string;

  const [projectData, setProjectData] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Advanced Filtering & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [floorFilter, setFloorFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState<{tag: string, token: string, model: string, project: string, brand: string, area: string, floor: string, room: string} | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<number | null>(null);

  // Quick Input State
  const [isQuickInputOpen, setIsQuickInputOpen] = useState(false);
  const [selectedQuickUnit, setSelectedQuickUnit] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    unit_type: "VRV", brand: "Daikin", model: "", 
    capacity: "0", yoi: new Date().getFullYear().toString(),
    serial_number: "", tag_number: "", area: "",
    building_floor: "", room_tenant: "", status: "Normal"
  });

  // Detail Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [unitHistory, setUnitHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const pRes = await getProjectData(projectId);
    if (pRes && 'success' in pRes) setProjectData(pRes.data);

    const res = await getUnitsByProject(projectId);
    if (res && 'success' in res) {
      setUnits(res.data || []);
    }

    const cRes = await getProjectComplaints(projectId);
    if (cRes && 'success' in cRes) {
      setComplaints(cRes.data || []);
    }

    const s = await getSession();
    setSession(s);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const total = units.length;
    const normal = units.filter(u => u.status === "Normal").length;
    const problem = units.filter(u => ["Problem","Critical","Warning"].includes(u.status)).length;
    const pending = units.filter(u => ["Pending","On_Progress"].includes(u.status)).length;
    return { total, normal, problem, pending };
  }, [units]);

  // Extract unique brands and floors
  const uniqueBrands = useMemo(() => {
    const set = new Set(units.map(u => u.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [units]);

  const uniqueFloors = useMemo(() => {
    const set = new Set(units.map(u => u.building_floor).filter(Boolean));
    return Array.from(set).sort();
  }, [units]);

  // Filtering Logic
  const filteredUnits = useMemo(() => {
    const list = units.filter(unit => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = 
        unit.tag_number?.toLowerCase().includes(s) ||
        unit.serial_number?.toLowerCase().includes(s) ||
        unit.model?.toLowerCase().includes(s) ||
        unit.brand?.toLowerCase().includes(s) ||
        unit.code?.toLowerCase().includes(s) ||
        unit.area?.toLowerCase().includes(s) ||
        unit.building_floor?.toLowerCase().includes(s) ||
        unit.room_tenant?.toLowerCase().includes(s) ||
        unit.unit_type?.toLowerCase().includes(s) ||
        unit.capacity?.toLowerCase().includes(s);
      
      const matchesStatus = statusFilter === "All" || unit.status === statusFilter || 
                            (statusFilter === "Problem" && ["Problem","Critical","Warning"].includes(unit.status)) ||
                            (statusFilter === "Pending" && ["Pending","On_Progress"].includes(unit.status));
      
      const matchesBrand = brandFilter === "All" || unit.brand === brandFilter;
      const matchesFloor = floorFilter === "All" || unit.building_floor === floorFilter;
      
      return matchesSearch && matchesStatus && matchesBrand && matchesFloor;
    });

    const sorted = [...list].sort((a, b) => {
      const rank: any = { Problem: 0, Critical: 0, Warning: 1, On_Progress: 2, Pending: 2, Normal: 3 };
      const rankA = rank[a.status] || 99;
      const rankB = rank[b.status] || 99;
      
      if (rankA !== rankB) return rankA - rankB;

      // For Errors (rank 0), sort by date (oldest first)
      if (rankA === 0) {
        const dateA = new Date(a.last_service_date || a.created_at || 0).getTime();
        const dateB = new Date(b.last_service_date || b.created_at || 0).getTime();
        if (dateA !== dateB) return dateA - dateB;
      }

      return (a.tag_number || "").localeCompare(b.tag_number || "");
    });

    return sorted;
  }, [units, searchTerm, statusFilter, brandFilter, floorFilter]);

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUnits.slice(start, start + itemsPerPage);
  }, [filteredUnits, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, brandFilter, floorFilter]);

  const unitsProblem = useMemo(() => units.filter(u => ["Problem","Critical","Warning"].includes(u.status)), [units]);
  const unitsInProgress = useMemo(() => units.filter(u => ["On_Progress","Pending"].includes(u.status)), [units]);

  const openModal = (unit?: any) => {
    if (unit) {
      setModalMode("edit");
      setEditId(unit.id);
      setFormData({
        unit_type: unit.unit_type || "VRV",
        brand: unit.brand || "Daikin",
        model: unit.model || "",
        capacity: unit.capacity || "",
        yoi: unit.yoi?.toString() || new Date().getFullYear().toString(),
        serial_number: unit.serial_number || "",
        tag_number: unit.tag_number || "",
        area: unit.area || "",
        building_floor: unit.building_floor || "",
        room_tenant: unit.room_tenant || "",
        status: unit.status || "Normal"
      });
    } else {
      setModalMode("create");
      setEditId(null);
      setFormData({
        unit_type: "VRV", brand: "Daikin", model: "", 
        capacity: "0", yoi: new Date().getFullYear().toString(),
        serial_number: "", tag_number: "", area: "",
        building_floor: "", room_tenant: "", status: "Normal"
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const closePrintModal = () => setIsPrintModalOpen(false);

  const openPrintQR = (unit: any) => {
    setSelectedQR({
      tag: unit.tag_number || "NO-TAG",
      token: unit.qr_code_token || "invalid",
      model: unit.model || "Unknown Model",
      project: projectData?.name || "Unknown Project",
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

  const openDetail = async (unit: any) => {
    if (unit.status === 'Problem' && (session?.isInternal || session?.roles?.some((r: any) => ['vendor', 'ste', 'caps'].includes(String(r).toLowerCase())))) {
       router.push(`/passport/${unit.qr_code_token}/corrective`);
       return;
    }
    setSelectedUnit(unit);
    setIsDetailOpen(true);
    setUnitHistory([]);
    setHistoryLoading(true);
    const res = await getUnitHistory(unit.id);
    if (res && 'success' in res) setUnitHistory(res.data);
    setHistoryLoading(false);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedUnit) return;
    setIsStatusUpdating(true);
    const res = await updateUnitStatus(selectedUnit.id, newStatus);
    if (res && 'success' in res) {
      fetchData();
      setSelectedUnit({...selectedUnit, status: newStatus});
    }
    setIsStatusUpdating(false);
  };

  const handleResolve = async (unitId: number) => {
    if (!confirm("Are you sure this unit is now working normally?")) return;
    setLoading(true);
    const res = await resolveComplaint(unitId) as any;
    if (res && "success" in res && res.success) {
      fetchData();
    } else {
      alert(res?.error || "Failed to resolve unit.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let res;
    if (modalMode === "edit" && editId) {
      res = await updateUnit(editId, formData);
    } else {
      res = await createUnit(projectId, formData);
    }
    const response = res as any;
    if (response && "success" in response && response.success) {
      closeModal();
      await fetchData();
    } else {
      alert(response?.error || "Gagal menyimpan unit.");
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const res = await exportUnitsExcel(projectId) as any;
    if (res && "success" in res && res.success && res.base64) {
      const link = document.createElement("a");
      link.href = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + res.base64;
      link.download = `Units_Export_${projectData?.name || 'Project'}.xlsx`;
      link.click();
    } else {
      alert("Failed to export Excel.");
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
        fetchData();
      } else {
        alert(`Import Error: ${res?.error}`);
      }
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const statusColors: any = {
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

  const healthGradient: any = {
    emerald: "hover:bg-emerald-50/50 border-l-emerald-500",
    amber: "bg-amber-50/30 hover:bg-amber-50/60 border-l-amber-500",
    rose: "bg-rose-50/30 hover:bg-rose-50/60 border-l-rose-500",
  };

  return (
    <>
      <div className="print:hidden p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <button onClick={() => router.push(`/dashboard/customers/${customerId}/projects`)}
              className="flex items-center gap-2 text-slate-500 hover:text-[#00a1e4] transition-colors mb-4 text-sm font-bold w-fit bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
            >
              <ArrowLeft size={16} /> Back to Projects
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[#003366]">Unit Command</h1>
              <span className="hidden sm:inline-block px-3 py-1 bg-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest rounded-lg">Assets</span>
            </div>
            <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
              <Building2 size={16} /> {projectData ? projectData.name : "Loading..."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsQuickInputOpen(true)} className="w-full md:w-auto px-6 py-3 md:py-4 rounded-2xl bg-white border-2 border-slate-100 text-[#003366] font-black shadow-sm hover:border-[#00a1e4] hover:text-[#00a1e4] transition-all flex items-center justify-center gap-3 uppercase text-xs md:text-sm tracking-widest">
              <Database size={20}/> Quick Service Input
            </button>
            <button onClick={() => openModal()} className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-[#00a1e4] text-white font-black shadow-xl shadow-blue-200 hover:bg-[#008cc6] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase text-xs md:text-sm tracking-widest">
              <Plus size={20} className="shrink-0" /> Add Unit Record
            </button>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {loading ? (
            [1,2,3,4].map(idx => (
              <div key={idx} className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-100"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : (
            [
              { title: "Total Units", val: metrics.total, icon: Archive, color: "text-[#00a1e4]", bg: "bg-blue-50" },
              { title: "Normal Status", val: metrics.normal, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
              { title: "Reported Problem", val: metrics.problem, icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50", animate: metrics.problem > 0 ? "animate-pulse" : "" },
              { title: "In Repair (Pending)", val: metrics.pending, icon: Hammer, color: "text-indigo-500", bg: "bg-indigo-50" },
            ].map((m, i) => (
              <div key={i} className={`bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-5 ${m.animate}`}>
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 ${m.bg}`}>
                  <m.icon className={`w-5 h-5 md:w-6 md:h-6 ${m.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 md:mb-1 truncate">{m.title}</p>
                  <h2 className={`text-base md:text-2xl lg:text-4xl font-black tracking-tighter ${m.color} truncate`}>{m.val}</h2>
                </div>
              </div>
            ))
          )}
        </div>

        {/* QUICK STATUS WIDGETS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[300px]">
             <div className="p-4 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
              <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-rose-700 flex items-center gap-2">
                <AlertTriangle size={14} className="animate-pulse" /> Units with Problems
              </h3>
              <span className="px-2 py-0.5 bg-rose-200 text-rose-800 text-[10px] font-black rounded-lg">{unitsProblem.length}</span>
            </div>
            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {unitsProblem.length === 0 ? (
                <p className="p-8 text-center text-xs font-bold text-slate-400">Semua unit beroperasi normal ✨</p>
              ) : (
                unitsProblem.map(u => (
                  <div key={u.id} onClick={() => openDetail(u)} className="p-3 bg-slate-50 hover:bg-rose-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all cursor-pointer flex justify-between items-center group">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800 tracking-tight group-hover:text-rose-700 truncate">{u.tag_number}</p>
                      <p className="text-[10px] font-bold text-slate-500 truncate">{u.room_tenant || u.area}</p>
                    </div>
                    <ArrowLeft size={14} className="rotate-180 text-slate-300 group-hover:text-rose-400 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[300px]">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
              <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-700 flex items-center gap-2">
                <Hammer size={14} /> Work In Progress
              </h3>
              <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-[10px] font-black rounded-lg">{unitsInProgress.length}</span>
            </div>
            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {unitsInProgress.length === 0 ? (
                <p className="p-8 text-center text-xs font-bold text-slate-400">Tidak ada pekerjaan aktif.</p>
              ) : (
                unitsInProgress.map(u => (
                  <div key={u.id} onClick={() => openDetail(u)} className="p-3 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer flex justify-between items-center group">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800 tracking-tight group-hover:text-indigo-700 truncate">{u.tag_number}</p>
                      <p className="text-[10px] font-bold text-slate-500 truncate">{u.room_tenant || u.area}</p>
                    </div>
                    <ArrowLeft size={14} className="rotate-180 text-slate-300 group-hover:text-indigo-400 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
           <div className="flex-1 lg:max-w-xl">
            <div className="relative group">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all w-5 h-5 ${searchTerm ? "text-[#00a1e4]" : "text-slate-400"}`} />
              <input 
                type="text" placeholder="Search assets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-12 md:h-14 pl-14 pr-6 bg-white border-2 border-slate-100 rounded-2xl text-sm md:text-base font-bold text-[#003366] placeholder:text-slate-300 focus:outline-none focus:border-[#00a1e4] focus:ring-4 focus:ring-[#00a1e4]/10 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2">
            <select value={floorFilter} onChange={e => setFloorFilter(e.target.value)} className="flex-1 lg:flex-none px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none">
              <option value="All">All Floors</option>
              {uniqueFloors.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="flex-1 lg:flex-none px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none">
              <option value="All">All Brands</option>
              {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex-1 lg:flex-none px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none">
              <option value="All">All Health Index</option>
              <option value="Normal Condition">🟢 Good (≥ 80%)</option>
              <option value="Need Repair">🟡 Repair (50-79%)</option>
              <option value="Need Replace">🔴 Replace (&lt; 50%)</option>
            </select>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={handleExport} className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:text-blue-600 transition-all"><Download size={18} /></button>
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:text-amber-600 transition-all"><Upload size={18} /></button>
              <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx,.xls" />
            </div>
          </div>
        </div>

        {/* SUPER TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                  <th className="hidden sm:table-cell px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Spec / Cap</th>
                  <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Room / Tenant</th>
                  <th className="hidden lg:table-cell px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Last Action</th>
                  <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="wait">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <motion.tr key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td className="px-8 py-6"><div className="h-10 bg-slate-100 rounded-xl w-3/4 animate-pulse"></div></td>
                        <td className="hidden sm:table-cell px-8 py-6"><div className="h-6 bg-slate-50 rounded-lg w-1/2 animate-pulse"></div></td>
                        <td className="px-8 py-6"><div className="h-12 bg-slate-50 rounded-xl w-2/3 animate-pulse"></div></td>
                        <td className="hidden lg:table-cell px-8 py-6"><div className="h-10 bg-slate-50 rounded-lg w-1/2 animate-pulse"></div></td>
                        <td className="px-8 py-6"><div className="h-6 bg-slate-100 rounded-full w-20 animate-pulse"></div></td>
                        <td className="px-8 py-6"><div className="h-8 bg-slate-100 rounded-xl w-10 ml-auto animate-pulse"></div></td>
                      </motion.tr>
                    ))
                  ) : paginatedUnits.length === 0 ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={6} className="px-8 py-32 text-center text-slate-400 bg-slate-500/5">
                        <Archive className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold">No units found matching your criteria.</p>
                      </td>
                    </motion.tr>
                  ) : (
                    paginatedUnits.map((u) => (
                      <motion.tr 
                        key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => openDetail(u)}
                        className={`group transition-colors cursor-pointer border-l-4 ${healthGradient[u.health_color] || 'hover:bg-slate-50 border-l-transparent'}`}
                      >
                        <td className="px-4 md:px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-8 md:w-2.5 md:h-12 rounded-full shrink-0 ${u.status === 'Problem' || u.status === 'Critical' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            <div className="min-w-0">
                               <p className="text-sm md:text-lg font-black text-[#003366] tracking-tighter truncate leading-tight">{u.room_tenant || "Unnamed Room"}</p>
                               <p className="text-[10px] md:text-sm font-black text-[#00a1e4] uppercase tracking-widest">{u.tag_number || "NO-TAG"}</p>
                               <p className="text-[9px] font-mono font-medium text-slate-400 truncate">S/N: {u.serial_number || "---"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-8 py-4">
                           <p className="text-sm font-bold text-slate-800">{u.brand} - {u.model}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{u.unit_type} · {u.capacity}</p>
                        </td>
                        <td className="px-4 md:px-8 py-4">
                           <p className="text-xs font-black text-[#003366] uppercase tracking-tight">{u.area}</p>
                           <p className="text-[10px] font-bold text-slate-400">{u.building_floor}</p>
                        </td>
                        <td className="hidden lg:table-cell px-8 py-4">
                           <p className="text-xs font-bold text-slate-800">{u.last_corrective_date ? new Date(u.last_corrective_date).toLocaleDateString() : 'No Data'}</p>
                           <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{u.last_problem || 'Clean'}</p>
                        </td>
                         <td className="px-4 md:px-8 py-4">
                            <div className="flex flex-col gap-1.5">
                               <div className="flex flex-col">
                                 <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Health Score</span>
                                 <span className={`inline-flex w-fit px-3 py-1 rounded-lg text-[10px] md:text-[12px] font-black tracking-tighter border ${statusColors[u.health_label] || statusColors.Normal}`}>
                                   {Math.round(u.health_score)}%
                                 </span>
                               </div>
                               <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border w-fit uppercase tracking-tighter ${
                                 u.status === 'Problem' || u.status === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                 u.status === 'Normal' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                               }`}>
                                 {u.status.replace("_", " ")}
                               </span>
                            </div>
                         </td>
                        <td className="px-4 md:px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-slate-400">
                             <button onClick={(e) => { e.stopPropagation(); window.open(`/passport/${u.qr_code_token}`, '_blank'); }} className="p-2 rounded-xl bg-white border border-[#00a1e4]/20 text-[#00a1e4] hover:bg-[#00a1e4] hover:text-white transition-all shadow-sm" title="View Passport Landing"><ExternalLink size={16}/></button>
                             <button onClick={(e) => { e.stopPropagation(); openPrintQR(u); }} className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Print Label"><QrCode size={16}/></button>
                             {session?.isInternal && (
                               <button onClick={(e) => { e.stopPropagation(); openModal(u); }} className="p-2 rounded-xl bg-white border border-[#003366]/20 text-[#003366] hover:bg-[#003366] hover:text-white transition-all shadow-sm" title="Edit Data"><Edit2 size={16}/></button>
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
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30"
              ><ChevronLeft size={18}/></button>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30"
              ><ChevronRight size={18}/></button>
            </div>
          )}
        </div>
      </div>

      <UnitDetailModal 
        isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)}
        unit={selectedUnit} history={unitHistory} historyLoading={historyLoading}
        isStatusUpdating={isStatusUpdating} onStatusUpdate={handleStatusUpdate}
        onPrintQR={openPrintQR} onEdit={openModal}
        customerId={customerId} projectId={projectId} session={session}
      />

      <QuickInputModal 
        isOpen={isQuickInputOpen} onClose={() => setIsQuickInputOpen(false)}
        unit={selectedQuickUnit}
      />

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
               <div className="flex justify-between items-start mb-8">
                  <h2 className="text-2xl font-black text-[#003366]">{modalMode === "create" ? "Add New Unit" : "Edit Unit Data"}</h2>
                  <button onClick={closeModal} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
               </div>
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tag Number</label>
                      <input type="text" value={formData.tag_number} onChange={e => setFormData({...formData, tag_number: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial Number</label>
                      <input type="text" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand</label>
                      <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</label>
                      <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity (Btu/h)</label>
                      <input type="text" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Area</label>
                      <input type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Floor</label>
                      <input type="text" value={formData.building_floor} onChange={e => setFormData({...formData, building_floor: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room / Tenant</label>
                      <input type="text" value={formData.room_tenant} onChange={e => setFormData({...formData, room_tenant: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-[#00a1e4] text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:bg-[#008cc6] transition-all flex items-center justify-center gap-2">
                    <Save size={20}/> Save Unit Data
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPrintModalOpen && selectedQR && (
          <Portal>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#003366]/90 backdrop-blur-xl"
                onClick={closePrintModal}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[3rem] shadow-2xl relative z-10 w-full max-w-lg p-10 flex flex-col items-center gap-8"
              >
                <div className="w-full flex justify-between items-center bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-2">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#00a1e4] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                         <QrCode size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Unit Asset Hub</p>
                         <p className="text-sm font-black text-[#003366] leading-none">{selectedQR.tag}</p>
                      </div>
                   </div>
                   <button onClick={closePrintModal} className="p-2 bg-white text-slate-400 hover:text-[#003366] rounded-xl transition-all shadow-sm border border-slate-100">
                      <X size={20} />
                   </button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-inner border border-slate-100 relative group flex flex-col items-center">
                  <div className="absolute inset-0 bg-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                  
                  <div className="w-[340px] h-[340px] border-4 border-[#003366] p-5 flex flex-col items-center justify-between bg-white relative shadow-2xl shadow-blue-900/10">
                     <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#003366 1px, transparent 0)', backgroundSize: '15px 15px' }}></div>
                     
                     <div className="flex items-center justify-between relative z-10 w-full pb-2 border-b border-slate-50 px-2">
                        <img src="/logo_epl_connect_1.png" alt="EPL" className="h-4 object-contain" />
                        <img src="/daikin_logo.png" alt="Daikin" className="h-4 object-contain" />
                     </div>
                     
                     <div className="relative shadow-xl shadow-[#003366]/5 p-2 bg-white rounded-xl mt-1">
                        <QRCode 
                          id="qr-code-svg"
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/passport/${selectedQR.token}`} 
                          size={200} level="H" className="relative z-10" 
                        />
                     </div>

                     <div className="text-center mt-3 relative z-10">
                        <p className="text-[14px] font-black text-[#003366] leading-none mb-1 tracking-tight">{(selectedQR.room || selectedQR.area || "DAIKIN ASSET").toUpperCase()}</p>
                        <p className="text-[7px] font-black text-slate-400 tracking-[0.3em] uppercase opacity-70">Asset ID: {selectedQR.tag}</p>
                     </div>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-8">Scan to access the full digital maintenance history and unit specifications instantly.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={closePrintModal}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                    >
                      Close Preview
                    </button>
                    <button 
                      onClick={handleDownloadQR}
                      disabled={isDownloading}
                      className="flex-[2] py-4 bg-[#00a1e4] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#003366] transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                      )}
                      {isDownloading ? "Generating HQ PNG..." : "Download HQ PNG"}
                    </button>
                  </div>
                  
                  <p className="text-center text-[8px] font-black text-[#00a1e4]/40 uppercase tracking-[0.3em]">DAIKIN CONNECT DIGITAL ASSET HUB</p>
                </div>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
