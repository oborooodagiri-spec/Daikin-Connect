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
  History as HistoryIcon
} from "lucide-react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import UnitHistoryTimeline from "@/components/UnitHistoryTimeline";
import UnitDetailModal from "@/components/UnitDetailModal";

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState<{tag: string, token: string, model: string, project: string, brand: string, area: string, floor: string, room: string} | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<number | null>(null);

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
    const problem = units.filter(u => u.status === "Problem" || u.status === "Critical" || u.status === "Warning").length;
    const pending = units.filter(u => u.status === "Pending" || u.status === "On_Progress").length;
    return { total, normal, problem, pending };
  }, [units]);

  // Advanced Search Engine + Priority Sorting
  const filteredUnits = useMemo(() => {
    const list = units.filter(unit => {
      const matchesSearch = 
        unit.tag_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.building_floor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.room_tenant?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || unit.status === statusFilter || 
                            (statusFilter === "Problem" && ["Problem","Critical","Warning"].includes(unit.status)) ||
                            (statusFilter === "Pending" && ["Pending","On_Progress"].includes(unit.status));
      
      return matchesSearch && matchesStatus;
    });

    // Priority Sort: Problem (1), On_Progress (2), Normal (3)
    return [...list].sort((a, b) => {
      const rank: any = { Problem: 1, Critical: 1, Warning: 1, On_Progress: 2, Pending: 2, Normal: 3 };
      const rankA = rank[a.status] || 99;
      const rankB = rank[b.status] || 99;
      if (rankA !== rankB) return rankA - rankB;
      
      // Secondary sort: Oldest First for Problem/Progress (FIFO)
      if (rankA < 3) return a.id - b.id;
      return b.id - a.id; // Normal units newest first
    });
  }, [units, searchTerm, statusFilter]);

  const unitsProblem = useMemo(() => units.filter(u => u.status === "Problem" || u.status === "Critical" || u.status === "Warning"), [units]);
  const unitsInProgress = useMemo(() => units.filter(u => u.status === "On_Progress" || u.status === "Pending"), [units]);

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

  const openDetail = async (unit: any) => {
    // SMART REDIRECTION: If Internal/Vendor & Status is Problem -> Go to Corrective Form
    if (unit.status === 'Problem' && (session?.isInternal || session?.roles?.some((r: any) => r.toLowerCase() === 'vendor'))) {
       router.push(`/passport/${unit.qr_code_token}/corrective`);
       return;
    }

    setSelectedUnit(unit);
    setIsDetailOpen(true);
    setUnitHistory([]); // Reset
    setHistoryLoading(true);
    const res = await getUnitHistory(unit.id);
    if (res && 'success' in res) setUnitHistory(res.data);
    setHistoryLoading(false);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedUnit) return;
    setIsStatusUpdating(true);
    setIsStatusUpdating(false);
  };

  const handleResolve = async (unitId: number) => {
    if (!confirm("Are you sure this unit is now working normally?")) return;
    setLoading(true);
    const res = await resolveComplaint(unitId);
    if (res.success) {
      alert("Unit status has been restored to Normal.");
      fetchData();
    } else {
      alert(res.error || "Failed to resolve unit.");
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

    if (res.success) {
      closeModal();
      await fetchData();
    } else {
      alert(res.error || "Gagal menyimpan unit.");
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const res = await exportUnitsExcel(projectId);
    if (res.success && res.base64) {
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
      const res = await importUnitsExcel(projectId, b64);
      if (res.success) {
        alert(`Successfully imported ${res.imported} units!`);
        fetchData();
      } else {
        alert(`Import Error: ${res.error}`);
      }
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const statusColors: any = {
    Normal: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Warning: "bg-amber-100 text-amber-700 border-amber-200",
    Critical: "bg-rose-100 text-rose-700 border-rose-200",
    Problem: "bg-rose-100 text-rose-700 border-rose-200",
    Pending: "bg-indigo-100 text-indigo-700 border-indigo-200",
    On_Progress: "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <>
    <div className="print:hidden p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <button onClick={() => router.push(`/dashboard/customers/${customerId}/projects`)}
            className="flex items-center gap-2 text-slate-500 hover:text-[#00a1e4] transition-colors mb-4 text-sm font-bold w-fit bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
          >
            <ArrowLeft size={16} /> Back to Projects
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-[#003366]">Unit Command</h1>
            <span className="px-3 py-1 bg-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest rounded-lg">Assets</span>
          </div>
          <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
            <Building2 size={16} /> {projectData ? projectData.name : "Loading..."}
          </p>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: "Total Units", val: metrics.total, icon: Archive, color: "text-[#00a1e4]", bg: "bg-blue-50" },
          { title: "Normal Status", val: metrics.normal, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
          { title: "Reported Problem", val: metrics.problem, icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50", animate: metrics.problem > 0 ? "animate-pulse" : "" },
          { title: "In Repair (Pending)", val: metrics.pending, icon: Hammer, color: "text-indigo-500", bg: "bg-indigo-50" },
        ].map((m, i) => (
          <div key={i} className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 ${m.animate}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.bg}`}>
              <m.icon className={`w-6 h-6 ${m.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{m.title}</p>
              <h2 className={`text-4xl font-black tracking-tighter ${m.color}`}>{m.val}</h2>
            </div>
          </div>
        ))}
      </div>


      {/* QUICK STATUS WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Problem List Widget */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[300px]">
          <div className="p-4 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-rose-700 flex items-center gap-2">
              <AlertTriangle size={14} className="animate-pulse" /> Units with Problems
            </h3>
            <span className="px-2 py-0.5 bg-rose-200 text-rose-800 text-[10px] font-black rounded-lg">{unitsProblem.length}</span>
          </div>
          <div className="overflow-y-auto p-2 space-y-2">
            {unitsProblem.length === 0 ? (
              <p className="p-8 text-center text-xs font-bold text-slate-400">Semua unit beroperasi normal ✨</p>
            ) : (
              unitsProblem.map(u => (
                <div key={u.id} onClick={() => openDetail(u)} className="p-3 bg-slate-50 hover:bg-rose-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all cursor-pointer flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight group-hover:text-rose-700">{u.tag_number}</p>
                    <p className="text-[10px] font-bold text-slate-400">{u.area} • {u.model}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-rose-500 px-2 py-1 bg-rose-100 rounded-lg">Action Needed</span>
                    <ArrowLeft size={14} className="rotate-180 text-slate-300 group-hover:text-rose-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* On Progress List Widget */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[300px]">
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-700 flex items-center gap-2">
              <Hammer size={14} /> Work In Progress
            </h3>
            <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-[10px] font-black rounded-lg">{unitsInProgress.length}</span>
          </div>
          <div className="overflow-y-auto p-2 space-y-2">
            {unitsInProgress.length === 0 ? (
              <p className="p-8 text-center text-xs font-bold text-slate-400">Tidak ada pekerjaan aktif.</p>
            ) : (
              unitsInProgress.map(u => (
                <div key={u.id} onClick={() => openDetail(u)} className="p-3 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight group-hover:text-indigo-700">{u.tag_number}</p>
                    <p className="text-[10px] font-bold text-slate-400">{u.area} • {u.model}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-indigo-500 px-2 py-1 bg-indigo-100 rounded-lg">{u.status.replace('_', ' ')}</span>
                    <ArrowLeft size={14} className="rotate-180 text-slate-300 group-hover:text-indigo-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Complaints Widget */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[300px] lg:col-span-2">
          <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-700 flex items-center gap-2">
              <Activity size={14} /> Recent Customer Complaints
            </h3>
            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-[10px] font-black rounded-lg">{complaints.length}</span>
          </div>
          <div className="overflow-y-auto p-4 flex gap-4 hidden-scrollbar min-h-[140px]">
            {complaints.length === 0 ? (
              <p className="w-full text-center py-8 text-xs font-bold text-slate-400">Belum ada pengaduan tercatat.</p>
            ) : (
              complaints.map(c => (
                <div key={c.id} className="min-w-[300px] p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2 relative group overflow-hidden">
                   <div className="flex justify-between items-start">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{c.unit_tag}</p>
                      <span className="text-[9px] font-bold text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
                   </div>
                   <p className="text-xs font-bold text-slate-800 line-clamp-2">"{c.description}"</p>
                   <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-200/50">
                      <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Building2 size={10}/> {c.unit_area}</p>
                      <p className="text-[9px] font-black uppercase text-slate-400">By: {c.customer_name}</p>
                   </div>
                   {c.photo_url && (
                     <div className="absolute right-0 top-0 bottom-0 w-12 opacity-10 group-hover:opacity-30 transition-opacity">
                        <img src={c.photo_url} className="h-full w-full object-cover" alt="Log" />
                     </div>
                   )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ACTION BAR & FILTER */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Searches */}
        <div className="flex gap-3 w-full lg:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" placeholder="Search tagged unit, serial, model, area..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4] focus:bg-white transition-all shadow-inner"
            />
          </div>
          
          <div className="relative w-48 shrink-0">
            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00a1e4]"
            >
              <option value="All">All Statuses</option>
              <option value="Normal">🟢 Normal</option>
              <option value="Problem">🔴 Problem</option>
              <option value="Pending">🟡 Pending / Progress</option>
            </select>
          </div>
        </div>

        {/* Right Side: Tools */}
        <div className="flex gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
          <button onClick={handleExport} className="px-5 py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold border border-slate-200 shadow-sm hover:bg-slate-100 transition-all flex items-center gap-2 text-sm uppercase tracking-wider">
            <Download size={16} /> Export
          </button>
          
          <div className="relative">
            <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()} disabled={isUploading}
              className="px-5 py-3 rounded-2xl bg-amber-50 text-amber-700 font-bold border border-amber-200 shadow-sm hover:bg-amber-100 transition-all flex items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
            >
              <Upload size={16} /> {isUploading ? "Uploading..." : "Import"}
            </button>
          </div>

          <button onClick={() => openModal()} className="px-6 py-3 rounded-2xl bg-[#00a1e4] text-white font-bold shadow-md hover:bg-[#008cc6] transition-all flex items-center gap-2 text-sm uppercase tracking-wider">
            <Plus size={18} /> Add Unit
          </button>
        </div>
      </div>

      {/* SUPER TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Spec / Cap</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Location Area</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Last Action / Note</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-5">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin"></div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#003366]">Loading Database...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center text-slate-400 bg-slate-50/50">
                      <Archive className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-bold">No units found matching your criteria.</p>
                      <p className="text-xs mt-1">Try adjusting the filter or add new records.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((unit) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      key={unit.id} 
                      onClick={() => openDetail(unit)}
                      className={`group hover:bg-slate-50 transition-colors cursor-pointer ${unit.status === 'Problem' ? 'bg-rose-50/30' : ''}`}
                    >
                      {/* Identity Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-10 rounded-full shadow-lg ${
                            unit.status === 'Problem' ? 'bg-rose-500 animate-[pulse_1s_infinite] shadow-rose-200' : 
                            unit.status === 'Pending' || unit.status === 'On_Progress' ? 'bg-indigo-500 animate-[pulse_2s_infinite]' : 
                            'bg-emerald-500'
                          }`}></div>
                          <div>
                            <p className="text-base font-black text-slate-800 tracking-tight">{unit.tag_number}</p>
                            <p className="text-xs font-mono font-medium rounded text-slate-500 mt-1">{unit.serial_number || "NO SERIAL"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Spec Column */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{unit.brand} - {unit.model}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{unit.capacity} • {unit.yoi || "Unknown Year"}</p>
                      </td>

                      {/* Location Column */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-1"><MapPin size={12} className="text-[#00a1e4]" /> {unit.area}</p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><ArrowLeft size={10} className="rotate-90"/> Floor: {unit.building_floor}</p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><ArrowLeft size={10} className="rotate-90"/> Room: {unit.room_tenant}</p>
                        </div>
                      </td>

                      {/* Last Action Column */}
                      <td className="px-6 py-4 max-w-[200px]">
                        {unit.last_corrective_date ? (
                          <div className="bg-slate-100/50 p-2.5 rounded-lg border border-slate-200">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1"><Clock size={10}/> Last Corrective</p>
                            <p className="text-xs font-bold text-slate-800">{new Date(unit.last_corrective_date).toLocaleDateString()}</p>
                            <p className="text-[10px] font-medium text-slate-500 truncate mt-1">"{unit.last_problem}"</p>
                          </div>
                        ) : (
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Clean Record</p>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${statusColors[unit.status] || statusColors.Normal} ${unit.status === 'Problem' || unit.status === 'On_Progress' ? 'animate-[pulse_1.5s_infinite]' : ''}`}>
                          {unit.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPrintQR(unit)}
                            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-[#00a1e4] hover:bg-blue-50 transition-all group"
                            title="Print Passport Label"
                          >
                            <QrCode size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                          
                          {/* CUSTOMER VERIFICATION BUTTON */}
                          {unit.status === 'On_Progress' && !session?.isInternal && (
                             <button
                               onClick={(e) => { e.stopPropagation(); handleResolve(unit.id); }}
                               className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200"
                               title="Verify & Finish Repair"
                             >
                               <CheckCircle2 size={14} /> Verify Normal
                             </button>
                          )}

                          {session?.isInternal && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openModal(unit); }}
                              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all group"
                              title="Edit Unit Data"
                            >
                              <Edit2 size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
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
      </div>

      {/* --- UNIT DETAIL MODAL --- */}
      <UnitDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        unit={selectedUnit}
        history={unitHistory}
        historyLoading={historyLoading}
        isStatusUpdating={isStatusUpdating}
        onStatusUpdate={handleStatusUpdate}
        onPrintQR={openPrintQR}
        onEdit={openModal}
        customerId={customerId}
        projectId={projectId}
      />

      {/* --- ADD / EDIT MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col hidden-scrollbar"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-20">
                <div>
                  <h2 className="text-2xl font-black text-[#003366] tracking-tight">{modalMode === "create" ? "Add New Unit" : "Update Unit Data"}</h2>
                  <p className="text-xs font-bold tracking-wider uppercase text-slate-400 mt-1">{projectData?.name}</p>
                </div>
                <button onClick={closeModal} className="p-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* 1. Identity Phase */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-300 tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Settings2 size={14}/> Hardware Identity
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tag Number <span className="opacity-50">(Auto if empty)</span></label>
                      <input type="text" placeholder="DKN-PROJ-..." value={formData.tag_number} onChange={e => setFormData({...formData, tag_number: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial Number</label>
                      <input type="text" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                  </div>
                </div>

                {/* 2. Specs Phase */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-300 tracking-[0.2em] border-b border-slate-100 pb-2">Technical Specifications</h3>
                  <div className="grid grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand</label>
                      <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</label>
                      <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity</label>
                      <input type="text" placeholder="3 PK / 5 KW" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                  </div>
                </div>

                {/* 3. Location Phase */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-300 tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Building2 size={14}/> Coordinates & Placement
                  </h3>
                  <div className="grid grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Area Building</label>
                      <input type="text" placeholder="Tower A" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Floor Level</label>
                      <input type="text" placeholder="Level 5" value={formData.building_floor} onChange={e => setFormData({...formData, building_floor: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room / Tenant</label>
                      <input type="text" placeholder="Server Room" value={formData.room_tenant} onChange={e => setFormData({...formData, room_tenant: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4]" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white shadow-[0_-20px_20px_-15px_rgba(255,255,255,1)]">
                  <button type="button" onClick={closeModal} className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-[#00a1e4] text-white hover:bg-[#008cc6] transition-all shadow-md flex items-center gap-2">
                    {loading ? "Saving..." : <><Save size={16} /> Save Data</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- QR Print Modal (Normal DOM View) --- */}
      <AnimatePresence>
        {isPrintModalOpen && selectedQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closePrintModal}/>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white border text-center border-slate-200 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-sm overflow-hidden flex flex-col items-center">
              
              <div className="w-full bg-white p-8 flex flex-col items-center border-b-2 border-dashed border-slate-200 relative pointer-events-none">
                <div className="absolute top-0 inset-x-0 h-4 bg-[#00a1e4]"></div>
                <h2 className="text-[10px] font-black mt-4 uppercase tracking-[0.3em] text-slate-400">PASSPORT LABEL PREVIEW</h2>
                <h1 className="text-2xl font-black text-[#003366] mt-1 tracking-tight">{selectedQR.tag}</h1>
                <p className="text-xs font-bold text-slate-500 mb-6 max-w-[200px] truncate">{selectedQR.project}</p>
                
                {/* We render a hidden QR Code just to snatch its SVG easily into the iframe later */}
                <div id="hidden-qr-src" className="hidden">
                   <QRCode value={`${window.location.origin}/passport/${selectedQR.token}`} size={220} level="H" />
                </div>

                <div className="p-3 bg-white border-2 border-slate-100 rounded-3xl shadow-sm mb-6">
                  <QRCode value={`${window.location.origin}/passport/${selectedQR.token}`} size={160} level="H" className="rounded-xl"/>
                </div>
                <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#00a1e4]">{selectedQR.brand}</p>
                  <p className="text-[10px] font-bold text-slate-600 truncate">{selectedQR.area} - {selectedQR.room}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 w-full flex gap-3">
                <button type="button" onClick={closePrintModal} className="flex-1 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors">Close</button>
                <button onClick={() => {
                  const qrNode = document.getElementById('hidden-qr-src');
                  if (!qrNode) return;
                  const qrSvg = qrNode.innerHTML;

                  const iframe = document.createElement('iframe');
                  iframe.style.display = 'none';
                  document.body.appendChild(iframe);
                  
                  const printDoc = iframe.contentWindow?.document;
                  if (printDoc) {
                    printDoc.open();
                    printDoc.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Print 100x100mm Ticket</title>
                          <style>
                            @page { size: 100mm 100mm; margin: 0; }
                            body { 
                              margin: 0; padding: 4mm; box-sizing: border-box; 
                              font-family: Arial, sans-serif;
                              -webkit-print-color-adjust: exact; 
                              print-color-adjust: exact;
                              width: 100mm; height: 100mm;
                              background: white; color: black;
                            }
                            .ticket-wrapper {
                              width: 100%; height: 100%;
                              border: 4px solid #003366;
                              border-radius: 12px;
                              display: flex; flex-direction: column; justify-content: space-between;
                              padding: 12px; box-sizing: border-box;
                            }
                            .header {
                              display: flex; justify-content: space-between; align-items: flex-start;
                              border-bottom: 4px solid #000; padding-bottom: 8px;
                            }
                            .header-left { flex: 1; min-width: 0; padding-right: 8px; }
                            .header h1 { margin: 0; font-size: 32px; font-weight: 900; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                            .header p { margin: 6px 0 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #444; }
                            .brand-badge {
                              background: #000; color: #fff; padding: 6px 12px; border-radius: 8px;
                              font-size: 14px; font-weight: 900; text-transform: uppercase; flex-shrink: 0;
                            }
                            .qr-container {
                              flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px 0;
                            }
                            .qr-container svg { height: 100%; max-height: 220px; width: auto; }
                            .footer {
                              border-top: 4px solid #000; padding-top: 8px;
                            }
                            .footer-loc { margin: 0 0 6px 0; font-size: 16px; font-weight: 900; text-transform: uppercase; }
                            .footer-sub { margin: 0; font-size: 14px; font-weight: bold; color: #333; }
                          </style>
                        </head>
                        <body>
                          <div class="ticket-wrapper">
                            <div class="header">
                               <div class="header-left">
                                  <h1>${selectedQR.tag}</h1>
                                  <p>${selectedQR.project}</p>
                               </div>
                               <div class="brand-badge">${selectedQR.brand}</div>
                            </div>
                            <div class="qr-container">
                               ${qrSvg}
                            </div>
                            <div class="footer">
                               <p class="footer-loc">📍 ${selectedQR.area}</p>
                               <p class="footer-sub">Flr: ${selectedQR.floor} &nbsp;&bull;&nbsp; Rm: ${selectedQR.room}</p>
                            </div>
                          </div>
                        </body>
                      </html>
                    `);
                    printDoc.close();
                    
                    setTimeout(() => {
                      iframe.contentWindow?.focus();
                      iframe.contentWindow?.print();
                      setTimeout(() => document.body.removeChild(iframe), 1000);
                    }, 250);
                  }
                }} className="flex-[2] py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest bg-[#00a1e4] text-white hover:bg-[#008cc6] transition-all shadow-md flex items-center justify-center gap-2">
                  <Printer size={16} /> Print 100x100
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
