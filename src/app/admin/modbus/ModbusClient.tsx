"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Copy,
  Server,
  Settings2,
  Trash2,
  Pencil,
  Download,
  Camera,
  Upload,
  Wifi,
  WifiOff,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Calendar,
  Building2,
  Activity,
  Clock,
  Layers,
  X,
  Loader2,
  ArrowRight,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import { generateSenayanModbusPDF, ModbusLogItem } from "@/lib/modbus-pdf-senayan";

interface Gateway {
  id: number | string;
  name: string;
  description: string | null;
  ip_address: string;
  port: number;
  slave_id: number;
  poll_interval: number;
  api_key: string;
  site_photo_url: string | null;
  project_id?: string | number | null;
  projects?: { id: string | number; name: string } | null;
  last_seen_at?: string | null;
  status: "active" | "inactive";
  is_online?: boolean;
  created_at: string;
  _count?: { logs: number };
  registers?: any[];
}

export default function ModbusClient() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
  const [settingsGateway, setSettingsGateway] = useState<Gateway | null>(null);
  const [downloadGateway, setDownloadGateway] = useState<Gateway | null>(null);

  // Settings Modal states
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  // Upload Photo State
  const [uploadingGwId, setUploadingGwId] = useState<number | string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadTargetId, setActiveUploadTargetId] = useState<number | string | null>(null);

  // Download Modal States
  const [downloadMode, setDownloadMode] = useState<"single" | "range">("single");
  const [singleDate, setSingleDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedChiller, setSelectedChiller] = useState<"all" | "1" | "2" | "3" | "4">("all");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ip_address: "192.168.1.100",
    port: 502,
    slave_id: 1,
    poll_interval: 60,
    site_photo_url: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    ip_address: "",
    port: 502,
    slave_id: 1,
    poll_interval: 60,
    site_photo_url: "",
  });

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/modbus/gateways");
      if (res.ok) {
        const data = await res.json();
        setGateways(data.gateways || []);
      }
    } catch (error) {
      console.error("Failed to fetch gateways:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  // Quick preset period helper
  const handlePresetSelect = (preset: "today" | "yesterday" | "3days" | "7days") => {
    const now = new Date();
    const formatYMD = (d: Date) => d.toISOString().split("T")[0];

    if (preset === "today") {
      const today = formatYMD(now);
      setSingleDate(today);
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "yesterday") {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const ymd = formatYMD(yesterday);
      setSingleDate(ymd);
      setStartDate(ymd);
      setEndDate(ymd);
    } else if (preset === "3days") {
      setDownloadMode("range");
      const start = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      setStartDate(formatYMD(start));
      setEndDate(formatYMD(now));
    } else if (preset === "7days") {
      setDownloadMode("range");
      const start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      setStartDate(formatYMD(start));
      setEndDate(formatYMD(now));
    }
    setDownloadError(null);
  };

  // Calculate day difference for safety validation
  const getSelectedDayDifference = () => {
    if (downloadMode === "single") return 1;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (isNaN(start) || isNaN(end)) return 0;
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  const dayDiff = getSelectedDayDifference();
  const isPeriodExceeded = dayDiff > 7;
  const isInvalidRange = downloadMode === "range" && dayDiff <= 0;

  // Handle Photo Upload
  const triggerPhotoUpload = (gwId: number | string) => {
    setActiveUploadTargetId(gwId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadTargetId) return;

    try {
      setUploadingGwId(activeUploadTargetId);
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "modbus-sites");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) throw new Error("Gagal mengunggah foto");
      const resJson = await uploadRes.json();
      const photoUrl = resJson.url;

      // Update gateway database with new photo URL
      const updateRes = await fetch("/api/v1/modbus/gateways", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeUploadTargetId,
          site_photo_url: photoUrl,
        }),
      });

      if (!updateRes.ok) throw new Error("Gagal menyimpan URL foto ke gateway");

      // Update local state
      setGateways((prev) =>
        prev.map((g) => (g.id === activeUploadTargetId ? { ...g, site_photo_url: photoUrl } : g))
      );
      if (editingGateway && editingGateway.id === activeUploadTargetId) {
        setEditFormData((prev) => ({ ...prev, site_photo_url: photoUrl }));
      }
    } catch (err: any) {
      console.error(err);
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setUploadingGwId(null);
      setActiveUploadTargetId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopyText = (text: string, type: "key" | "config") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/modbus/gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        fetchGateways();
        setFormData({
          name: "",
          description: "",
          ip_address: "192.168.1.100",
          port: 502,
          slave_id: 1,
          poll_interval: 60,
          site_photo_url: "",
        });
      }
    } catch (error) {
      console.error("Failed to add gateway:", error);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Hapus gateway Modbus ini beserta seluruh histori register dan lognya?")) return;
    try {
      const res = await fetch(`/api/v1/modbus/gateways/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchGateways();
      }
    } catch (error) {
      console.error("Failed to delete gateway:", error);
    }
  };

  const handleEdit = (gw: Gateway) => {
    setEditingGateway(gw);
    setEditFormData({
      name: gw.name,
      description: gw.description || "",
      ip_address: gw.ip_address,
      port: gw.port,
      slave_id: gw.slave_id,
      poll_interval: gw.poll_interval,
      site_photo_url: gw.site_photo_url || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGateway) return;
    try {
      const res = await fetch("/api/v1/modbus/gateways", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingGateway.id, ...editFormData }),
      });
      if (res.ok) {
        setShowEditModal(false);
        setEditingGateway(null);
        fetchGateways();
      }
    } catch (error) {
      console.error("Failed to update gateway:", error);
    }
  };

  const openDownloadModal = (gw: Gateway) => {
    setDownloadGateway(gw);
    setDownloadError(null);
    handlePresetSelect("today");
  };

  const handleExecuteDownload = async () => {
    if (!downloadGateway) return;
    const sDate = downloadMode === "single" ? singleDate : startDate;
    const eDate = downloadMode === "single" ? singleDate : endDate;

    if (downloadMode === "range" && isInvalidRange) {
      setDownloadError("Tanggal akhir tidak boleh lebih awal dari tanggal awal.");
      return;
    }

    if (isPeriodExceeded) {
      setDownloadError("Periode laporan maksimal 7 hari untuk menjaga stabilitas dan performa.");
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setDownloadError(null);

      const url = `/api/v1/modbus/logs?gateway_id=${downloadGateway.id}&start_date=${sDate}&end_date=${eDate}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal mengambil data log dari server");

      const data = await res.json();
      const logs: ModbusLogItem[] = data.logs || [];

      // Generate the official Senayan template PDF (fills with live data if available, or official standard template)
      generateSenayanModbusPDF({
        gateway: downloadGateway,
        logs,
        startDate: sDate,
        endDate: eDate,
        selectedChiller,
      });

      // Close modal on success
      setDownloadGateway(null);
    } catch (err: any) {
      console.error(err);
      setDownloadError(`Gagal menghasilkan PDF: ${err.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for photo uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-xs">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-[#003366] dark:text-[#00a1e4]" />
            Daftar Modbus Gateway & Supervisory SCADA
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Monitoring koneksi chiller plant, visualisasi site customer, dan manajemen register Modbus TCP/IP.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus:outline-none bg-[#003366] hover:bg-[#002244] text-white shadow-md hover:shadow-lg h-11 px-5 py-2.5"
        >
          <Plus className="mr-2 h-4 w-4 stroke-[2.5]" />
          Tambah Gateway Baru
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#003366] border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Memuat data gateway Modbus...</p>
        </div>
      ) : gateways.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[#003366] dark:text-[#00a1e4]">
            <Server className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Belum Ada Gateway Modbus</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Mulai dengan menambahkan gateway Modbus untuk site STSI Sentral Senayan 2 atau customer lainnya.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-[#003366] text-white hover:bg-[#002244] shadow-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Gateway Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways.map((gw) => {
            const isOnline = gw.status === "active" || gw.is_online;
            const isUploading = uploadingGwId === gw.id;

            return (
              <div
                key={gw.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* 1. Building / Site Photo Section */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  {gw.site_photo_url ? (
                    <img
                      src={gw.site_photo_url}
                      alt={gw.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-[#003366] via-[#004080] to-[#0a192f] flex flex-col items-center justify-center text-white p-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 border border-white/20">
                        <Building2 className="w-7 h-7 text-sky-300" />
                      </div>
                      <p className="text-xs font-semibold text-sky-100">Foto Site Belum Diunggah</p>
                      <p className="text-[11px] text-white/60 mt-0.5">Klik tombol di bawah untuk upload</p>
                    </div>
                  )}

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top-Left: Animated Connection Status Indicator */}
                  <div className="absolute top-3 left-3 z-10">
                    {isOnline ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/85 border border-emerald-500/50 text-emerald-300 backdrop-blur-md shadow-lg text-[11px] font-bold tracking-wide">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                        </span>
                        <span>ONLINE</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/90 border border-rose-500/50 text-rose-300 backdrop-blur-md shadow-lg text-[11px] font-bold tracking-wide">
                        <WifiOff className="w-3 h-3 text-rose-400" />
                        <span>TERPUTUS</span>
                      </div>
                    )}
                  </div>

                  {/* Top-Right: Slave ID Badge */}
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-200">
                    Slave #{gw.slave_id}
                  </div>

                  {/* Bottom: Site Title Overlay & Upload Button */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
                    <div className="text-white max-w-[70%]">
                      <h4 className="text-base font-bold drop-shadow-sm truncate flex items-center gap-1.5">
                        {gw.name}
                      </h4>
                      <p className="text-xs text-slate-300 truncate">
                        {gw.description || "Sentral Senayan 2 Customer Site"}
                      </p>
                    </div>

                    {/* Change / Upload Photo Button */}
                    <button
                      type="button"
                      onClick={() => triggerPhotoUpload(gw.id)}
                      disabled={isUploading}
                      title="Upload / Ganti Foto Gedung"
                      className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 text-xs font-medium flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-sky-400" />
                      )}
                      <span>{isUploading ? "Uploading..." : gw.site_photo_url ? "Ganti Foto" : "Upload Foto"}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Executive Quick SCADA & Live Monitoring Teaser */}
                <Link
                  href={`/admin/modbus/${gw.id}`}
                  className="p-5 flex-1 flex flex-col justify-between hover:bg-sky-50/30 dark:hover:bg-sky-950/20 transition-all cursor-pointer group/link"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-sky-700 dark:text-sky-300 uppercase bg-sky-50 dark:bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-200/80 dark:border-sky-800/80 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                        Live Plant Monitoring
                      </span>
                      <span className="text-xs font-semibold text-[#003366] dark:text-sky-400 flex items-center gap-1 group-hover/link:translate-x-1 transition-transform">
                        Buka SCADA <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Monitoring status operasional, kurva telemetri suhu & tekanan 4 unit Chiller, kompresor, dan tahapan pompa secara realtime.
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-gray-700/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-gray-600">
                        Chiller 1–4
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-gray-700/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-gray-600">
                        Evaporator & Condenser
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-gray-700/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-gray-600">
                        Compressor Health
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-gray-700/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-gray-600">
                        CHWP & CT Staging
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Sentral Senayan 2 Telemetry</span>
                    <span className="font-semibold text-sky-600 dark:text-sky-400 group-hover/link:underline">
                      Masuk Dashboard & Kurva &rarr;
                    </span>
                  </div>
                </Link>

                {/* 3. Card Actions: Live Monitoring, PDF Download, Settings, Edit, Delete */}
                <div className="bg-slate-50/90 dark:bg-gray-900/90 p-3.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
                  {/* Primary: Live Monitoring */}
                  <Link
                    href={`/admin/modbus/${gw.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[#003366] hover:bg-[#002244] text-white shadow-xs transition-colors text-center"
                  >
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>Live Monitoring</span>
                  </Link>

                  {/* Download Report Button */}
                  <button
                    onClick={() => openDownloadModal(gw)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  {/* Pengaturan & API Key Modal Trigger */}
                  <button
                    onClick={() => {
                      setSettingsGateway(gw);
                      setShowApiKey(false);
                    }}
                    title="Pengaturan Gateway & API Key"
                    className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>

                  {/* Edit Gateway */}
                  <button
                    onClick={() => handleEdit(gw)}
                    title="Edit Gateway"
                    className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Delete Gateway */}
                  <button
                    onClick={() => handleDelete(gw.id)}
                    title="Hapus Gateway"
                    className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: PENGATURAN GATEWAY & API KEY
          (API Key dipindahkan ke sini sesuai permintaan)
      ───────────────────────────────────────────────────────────── */}
      {settingsGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-linear-to-r from-[#003366] to-[#004d99] text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-sky-300" />
                  Pengaturan Gateway & Kredensial
                </h3>
                <p className="text-xs text-sky-100 mt-0.5">
                  {settingsGateway.name} ({settingsGateway.ip_address})
                </p>
              </div>
              <button
                onClick={() => setSettingsGateway(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* API Key Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    API Key Kredensial Agent
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Aktif & Dilindungi
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Gunakan API Key ini pada edge agent / script python lokal untuk autentikasi pengiriman data Modbus ke server.
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      readOnly
                      value={settingsGateway.api_key}
                      className="w-full font-mono text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleCopyText(settingsGateway.api_key, "key")}
                    className="px-3.5 py-2.5 rounded-xl bg-[#003366] text-white hover:bg-[#002244] font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? "Tersalin!" : "Salin Key"}</span>
                  </button>
                </div>
              </div>

              {/* Edge Daemon Configuration Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Konfigurasi Agent Lokal (config.json)
                  </h4>
                  <button
                    onClick={() =>
                      handleCopyText(
                        JSON.stringify(
                          {
                            gateway_id: settingsGateway.id,
                            api_key: settingsGateway.api_key,
                            server_url: typeof window !== "undefined" ? `${window.location.origin}/api/v1/modbus/ingest` : "/api/v1/modbus/ingest",
                            modbus_ip: settingsGateway.ip_address,
                            modbus_port: settingsGateway.port,
                            slave_id: settingsGateway.slave_id,
                            poll_interval: settingsGateway.poll_interval,
                          },
                          null,
                          2
                        ),
                        "config"
                      )
                    }
                    className="text-xs font-semibold text-[#003366] dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedConfig ? "Tersalin!" : "Salin Config"}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-2xl bg-slate-900 text-sky-200 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
{JSON.stringify(
  {
    gateway_id: settingsGateway.id,
    api_key: settingsGateway.api_key,
    server_url: typeof window !== "undefined" ? `${window.location.origin}/api/v1/modbus/ingest` : "/api/v1/modbus/ingest",
    modbus_ip: settingsGateway.ip_address,
    modbus_port: settingsGateway.port,
    slave_id: settingsGateway.slave_id,
    poll_interval: settingsGateway.poll_interval,
  },
  null,
  2
)}
                </pre>
              </div>

              {/* Technical Specifications moved from card */}
              <div className="border-t border-gray-100 dark:border-gray-700/80 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#003366] dark:text-sky-400" />
                  Parameter Jaringan & Infrastruktur Gateway
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200/60 dark:border-gray-700">
                    <span className="text-gray-400 font-medium">IP Address & Port</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5 font-mono">
                      {settingsGateway.ip_address}:{settingsGateway.port}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200/60 dark:border-gray-700">
                    <span className="text-gray-400 font-medium">Interval Polling</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                      {settingsGateway.poll_interval} detik
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200/60 dark:border-gray-700">
                    <span className="text-gray-400 font-medium">Slave Address</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                      Slave #{settingsGateway.slave_id}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200/60 dark:border-gray-700 flex flex-col justify-between">
                    <div>
                      <span className="text-gray-400 font-medium">Register Dipetakan</span>
                      <p className="font-semibold text-[#003366] dark:text-sky-400 mt-0.5">
                        {settingsGateway.registers?.length || 0} Register
                      </p>
                    </div>
                    <Link
                      href={`/admin/modbus/${settingsGateway.id}?tab=registers`}
                      className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline mt-1.5 inline-flex items-center gap-1"
                    >
                      Kelola Register &rarr;
                    </Link>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200/60 dark:border-gray-700">
                    <span className="text-gray-400 font-medium">Histori Data Log</span>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {settingsGateway._count?.logs || 0} Data
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200/60 dark:border-gray-700">
                    <span className="text-gray-400 font-medium">Status Terakhir</span>
                    <div className="font-semibold text-gray-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>
                        {settingsGateway.last_seen_at
                          ? new Date(settingsGateway.last_seen_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Belum aktif"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSettingsGateway(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: UNDUH LAPORAN MODBUS (TEMPLATE SENAYAN)
          (Pemilihan hari/rentang tanggal profesional, limit max 7 hari)
      ───────────────────────────────────────────────────────────── */}
      {downloadGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="px-6 py-5 bg-linear-to-r from-[#003366] to-[#005599] text-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                    Template Senayan
                  </span>
                  <h3 className="text-lg font-bold">Unduh Laporan Logsheet Modbus</h3>
                </div>
                <p className="text-xs text-sky-100 mt-0.5">
                  Site: {downloadGateway.name} ({downloadGateway.ip_address})
                </p>
              </div>
              <button
                onClick={() => setDownloadGateway(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Chiller Unit Selector (Matching Sentral Senayan 2) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                  Pilih Unit Chiller (Sentral Senayan 2)
                </label>
                <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700">
                  {[
                    { id: "all", label: "Semua (1-4)" },
                    { id: "1", label: "Chiller 1" },
                    { id: "2", label: "Chiller 2" },
                    { id: "3", label: "Chiller 3" },
                    { id: "4", label: "Chiller 4" },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedChiller(ch.id as any)}
                      className={`py-1.5 px-1.5 rounded-xl text-xs font-semibold transition-all text-center ${
                        selectedChiller === ch.id
                          ? "bg-white dark:bg-gray-800 text-[#003366] dark:text-sky-300 shadow-xs"
                          : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Selector: Single Day vs Date Range */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                  Metode Pemilihan Waktu
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setDownloadMode("single");
                      setDownloadError(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      downloadMode === "single"
                        ? "bg-white dark:bg-gray-800 text-[#003366] dark:text-sky-300 shadow-xs"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Pilih Hari Tunggal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDownloadMode("range");
                      setDownloadError(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      downloadMode === "range"
                        ? "bg-white dark:bg-gray-800 text-[#003366] dark:text-sky-300 shadow-xs"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Rentang Periode</span>
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Pilihan Cepat (Presets)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetSelect("today")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect("yesterday")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    Kemarin
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect("3days")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    3 Hari Terakhir
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect("7days")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-[#003366] dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors"
                  >
                    7 Hari (Maksimal)
                  </button>
                </div>
              </div>

              {/* Date Inputs */}
              {downloadMode === "single" ? (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pilih Tanggal Laporan
                  </label>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => {
                      setSingleDate(e.target.value);
                      setDownloadError(null);
                    }}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dari Tanggal
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setDownloadError(null);
                      }}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sampai Tanggal
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setDownloadError(null);
                      }}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    />
                  </div>
                </div>
              )}

              {/* Notice & Safety Boundary (Max 7 Days) */}
              <div className="p-3.5 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Format Standar & Batas Rentang
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                    Laporan akan digenerate dalam format PDF resmi Template Senayan mencakup ringkasan statistik dan logsheet per waktu. Untuk menjamin kecepatan proses, batas rentang maksimum adalah <strong>7 hari</strong> ({dayDiff} hari terpilih).
                  </p>
                </div>
              </div>

              {/* Error Banner */}
              {isPeriodExceeded && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Rentang yang dipilih {dayDiff} hari (melebihi batas maksimal 7 hari). Silakan kurangi rentang tanggal.</span>
                </div>
              )}

              {downloadError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{downloadError}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDownloadGateway(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDownload}
                disabled={isGeneratingPdf || isPeriodExceeded || isInvalidRange}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md transition-all active:scale-95"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memproses PDF Senayan...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Unduh PDF (Template Senayan)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: TAMBAH GATEWAY BARU
      ───────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[#003366] text-white">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-300" />
                Tambah Gateway Modbus Baru
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Gateway / Site
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  placeholder="Contoh: STSI Sentral Senayan 2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi / Area
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  placeholder="Contoh: Chiller Plant Ruang Mesin B1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    IP Address Host
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Port Modbus
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 502 })}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Slave ID
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.slave_id}
                    onChange={(e) => setFormData({ ...formData, slave_id: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Interval Poll (Detik)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.poll_interval}
                    onChange={(e) => setFormData({ ...formData, poll_interval: parseInt(e.target.value) || 60 })}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#003366] hover:bg-[#002244] rounded-xl shadow-xs transition-colors"
                >
                  Simpan Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: EDIT GATEWAY
      ───────────────────────────────────────────────────────────── */}
      {showEditModal && editingGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[#003366] text-white">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Pencil className="w-4 h-4 text-sky-300" />
                Edit Parameter Gateway
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingGateway(null);
                }}
                className="text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Gateway / Site
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.ip_address}
                    onChange={(e) => setEditFormData({ ...editFormData, ip_address: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.port}
                    onChange={(e) => setEditFormData({ ...editFormData, port: parseInt(e.target.value) || 502 })}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Slave ID
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.slave_id}
                    onChange={(e) => setEditFormData({ ...editFormData, slave_id: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Interval (detik)
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.poll_interval}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, poll_interval: parseInt(e.target.value) || 60 })
                    }
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
              </div>

              {/* Photo URL or change trigger */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Foto Site / Gedung Customer
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editFormData.site_photo_url}
                    onChange={(e) => setEditFormData({ ...editFormData, site_photo_url: e.target.value })}
                    placeholder="https://... atau upload langsung"
                    className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  />
                  <button
                    type="button"
                    onClick={() => triggerPhotoUpload(editingGateway.id)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1 shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5 text-sky-600" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingGateway(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#003366] hover:bg-[#002244] rounded-xl shadow-xs transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
