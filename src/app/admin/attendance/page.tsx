"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  getAttendanceRecords, 
  getAttendanceUsers, 
  getUserMonthlyAttendance,
  getAttendanceSummary,
  getAttendanceProjects,
  adminResetUserFace,
  adminToggleFaceVerification,
  adminUpdateUserFace,
  adminManualClockOut
} from "@/app/actions/attendanceAdmin";
import { generateAttendancePDF } from "@/lib/attendance-pdf-generator";
import { 
  MapPin, Clock, FileImage, ShieldCheck, Download, Loader2,
  Calendar, User, ChevronLeft, ChevronRight, List, FileText, CheckCircle2,
  Search, ArrowLeft, Building2, Fingerprint, UserCheck, Briefcase, ChevronRight as ChevronIcon,
  Camera, Eye, RotateCcw, UploadCloud, LogOut, X, AlertTriangle, ShieldAlert, Check,
  ChevronDown, ChevronUp, Layers, Filter
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import OvertimeCalculator from "./OvertimeCalculator";
import BiometricAuditModal from "./BiometricAuditModal";
import ManualClockOutModal from "./ManualClockOutModal";

export default function AttendanceRecordsPage() {
  // Active tab: attendance records or overtime calculation
  const [activeTab, setActiveTab] = useState<"records" | "overtime">("records");

  // Base states
  const [records, setRecords] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [viewGrouping, setViewGrouping] = useState<"by_project" | "all_personnel">("by_project");
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Detailed Timesheet States
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [timesheetRecords, setTimesheetRecords] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loadingTimesheet, setLoadingTimesheet] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Biometric Inspection & Manual Clock-Out States
  const [inspectPhotoRecord, setInspectPhotoRecord] = useState<any | null>(null);
  const [manualClockOutRecord, setManualClockOutRecord] = useState<any | null>(null);
  const [previewFaceUrl, setPreviewFaceUrl] = useState<string | null>(null);
  const [resettingFace, setResettingFace] = useState(false);
  const [togglingFace, setTogglingFace] = useState(false);
  const [uploadingFace, setUploadingFace] = useState(false);
  const faceUploadInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Summary Stats, All Records, Projects, and Users on Mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [recRes, sumRes, projRes, usersRes] = await Promise.all([
        getAttendanceRecords(),
        getAttendanceSummary(),
        getAttendanceProjects(),
        getAttendanceUsers()
      ]);

      if (recRes && "success" in recRes && recRes.success) {
        setRecords(recRes.data);
      }
      if (sumRes && "success" in sumRes && sumRes.success) {
        setSummary(sumRes.data);
      }
      if (projRes && "success" in projRes && projRes.success) {
        setProjectsList(projRes.data);
      }
      if (usersRes && "success" in usersRes && usersRes.success) {
        setUsersList(usersRes.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  // 2. Dynamic filter when selectedProjectId changes
  useEffect(() => {
    let cancelled = false;
    async function filterByProject() {
      const [recRes, sumRes] = await Promise.all([
        getAttendanceRecords({ projectId: selectedProjectId !== "all" ? selectedProjectId : undefined }),
        getAttendanceSummary(selectedProjectId !== "all" ? selectedProjectId : undefined)
      ]);

      if (cancelled) return;
      if (recRes && "success" in recRes && recRes.success) {
        setRecords(recRes.data);
      }
      if (sumRes && "success" in sumRes && sumRes.success) {
        setSummary(sumRes.data);
      }
    }
    filterByProject();
    return () => { cancelled = true; };
  }, [selectedProjectId]);

  // 3. Fetch Monthly Timesheet Records for Selected User
  useEffect(() => {
    async function loadTimesheet() {
      if (selectedUserId === null) return;
      setLoadingTimesheet(true);
      const res = await getUserMonthlyAttendance(
        selectedUserId,
        selectedMonth.getMonth(),
        selectedMonth.getFullYear(),
        selectedProjectId !== "all" ? selectedProjectId : undefined
      );
      if (res && "success" in res && res.success) {
        setTimesheetRecords(res.data);
      } else {
        setTimesheetRecords([]);
      }
      setLoadingTimesheet(false);
    }
    loadTimesheet();
  }, [selectedUserId, selectedMonth, selectedProjectId]);

  const handlePrevMonth = () => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const refreshTimesheet = async () => {
    if (selectedUserId === null) return;
    setLoadingTimesheet(true);
    const res = await getUserMonthlyAttendance(
      selectedUserId,
      selectedMonth.getMonth(),
      selectedMonth.getFullYear(),
      selectedProjectId !== "all" ? selectedProjectId : undefined
    );
    if (res && "success" in res && res.success) {
      setTimesheetRecords(res.data);
    }
    setLoadingTimesheet(false);
  };

  const handleResetFace = async (targetUserId?: number) => {
    const uid = targetUserId || selectedUserId;
    if (!uid) return;
    const targetUser = usersList.find(u => u.id === uid);
    if (!confirm(`Reset foto profil wajah untuk ${targetUser?.name || "karyawan ini"}?\n\nKaryawan akan diminta mendaftarkan foto wajah baru yang jelas saat absensi berikutnya.`)) {
      return;
    }

    setResettingFace(true);
    try {
      const res = await adminResetUserFace(uid);
      if (res && "success" in res && res.success) {
        alert(res.message);
        setUsersList(prev => prev.map(u => u.id === uid ? { ...u, face_reference_url: null } : u));
        if (inspectPhotoRecord) {
          setInspectPhotoRecord((prev: any) => prev ? {
            ...prev,
            users: { ...prev.users, face_reference_url: null }
          } : null);
        }
        await refreshTimesheet();
      } else {
        alert((res as any)?.error || "Gagal me-reset foto wajah.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setResettingFace(false);
    }
  };

  const handleToggleFaceVerification = async (targetUserId?: number) => {
    const uid = targetUserId || selectedUserId;
    if (!uid) return;
    const targetUser = usersList.find(u => u.id === uid);
    const currentStatus = targetUser?.face_verification_enabled !== false;
    const newStatus = !currentStatus;

    setTogglingFace(true);
    try {
      const res = await adminToggleFaceVerification(uid, newStatus);
      if (res && "success" in res && res.success) {
        setUsersList(prev => prev.map(u => u.id === uid ? { ...u, face_verification_enabled: newStatus } : u));
        await refreshTimesheet();
      } else {
        alert((res as any)?.error || "Gagal mengubah status verifikasi wajah.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setTogglingFace(false);
    }
  };

  const handleFaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUserId) return;

    setUploadingFace(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "identity");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.url) throw new Error("Upload foto gagal.");

      const res = await adminUpdateUserFace(selectedUserId, uploadData.url);
      if (res && "success" in res && res.success) {
        alert("Foto referensi wajah berhasil diperbarui dan divalidasi.");
        setUsersList(prev => prev.map(u => u.id === selectedUserId ? { 
          ...u, 
          face_reference_url: uploadData.url, 
          face_verification_enabled: true 
        } : u));
        await refreshTimesheet();
      } else {
        alert((res as any)?.error || "Foto ditolak oleh validator biometrik.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat upload foto.");
    } finally {
      setUploadingFace(false);
      if (faceUploadInputRef.current) faceUploadInputRef.current.value = "";
    }
  };

  const handleSubmitManualClockOut = async (params: { attendanceId: number; notes: string; checkOutTime?: string }) => {
    const res = await adminManualClockOut(params);

    if (res && "success" in res && res.success) {
      alert("Clock-out manual berhasil diproses.");
      setManualClockOutRecord(null);
      setInspectPhotoRecord(null);
      await refreshTimesheet();
      const [recRes, sumRes] = await Promise.all([
        getAttendanceRecords(),
        getAttendanceSummary()
      ]);
      if (recRes && "success" in recRes && recRes.success) setRecords(recRes.data);
      if (sumRes && "success" in sumRes && sumRes.success) setSummary(sumRes.data);
    } else {
      alert((res as any)?.error || "Gagal melakukan clock-out manual.");
    }
  };

  const getMapsLink = (lat: number | null, lng: number | null) => {
    if (lat === null || lng === null) return "#";
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  // Overtime and Duration Calculations
  const getDurationStr = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "Sesi Aktif";
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.round((diffMs % 3600000) / 60000);
    return `${hrs} jam ${mins} menit`;
  };

  const getOvertimeMinutes = (checkIn: string, checkOut: string | null, shiftStart?: string | null, shiftEnd?: string | null) => {
    if (!checkOut) return 0;
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    let standardWorkMinutes = 480; // Default to 8 hours
    if (shiftStart && shiftEnd) {
      const [sh, sm] = shiftStart.split(":").map(Number);
      const [eh, em] = shiftEnd.split(":").map(Number);
      const shiftDiffMinutes = (eh * 60 + em) - (sh * 60 + sm);
      // Deduct 1 hour break (60 minutes) if shift duration exceeds 6 hours (360 minutes)
      if (shiftDiffMinutes > 360) {
        standardWorkMinutes = shiftDiffMinutes - 60;
      } else {
        standardWorkMinutes = shiftDiffMinutes;
      }
    }
    
    const overtime = diffMinutes - standardWorkMinutes;
    return overtime > 0 ? overtime : 0;
  };

  const formatMinutesToHoursMins = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0 && mins === 0) return "-";
    if (hrs === 0) return `${mins} Menit`;
    if (mins === 0) return `${hrs} Jam`;
    return `${hrs} Jam ${mins} Menit`;
  };

  const getProjectName = () => {
    if (selectedProjectId !== "all") {
      const p = projectsList.find(proj => String(proj.id) === String(selectedProjectId));
      if (p) return p.name;
    }
    if (timesheetRecords.length === 0) return "Semua Proyek (Global)";
    const withProj = timesheetRecords.find(r => r.projects?.name);
    return withProj ? withProj.projects.name : "Daikin Project";
  };

  const handleExportPDF = async () => {
    if (!selectedUserId || timesheetRecords.length === 0) return;
    setExportingPDF(true);
    try {
      const targetUser = usersList.find(u => u.id === selectedUserId);
      if (!targetUser) return;
      
      const userForPDF = {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        company_name: targetUser.company_name || null
      };

      await generateAttendancePDF(userForPDF, timesheetRecords, selectedMonth, "ADMINISTRATIVE TIMESHEET");
    } catch (err) {
      console.error("Failed to export PDF:", err);
    } finally {
      setExportingPDF(false);
    }
  };

  // Filter Unique Users based on Search Input & Project Filter
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedProjectId !== "all") {
      return records.some(r => r.user_id === u.id && String(r.project_id) === String(selectedProjectId));
    }

    return true;
  });

  // Toggle collapse state for a project card
  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  // Active projects: ONLY projects that actually have attendance logs or active on-site sessions!
  const activeProjects = React.useMemo(() => {
    return projectsList
      .map(p => {
        const projRecords = records.filter(r => String(r.project_id) === String(p.id));
        const onSiteCount = projRecords.filter(r => !r.check_out_time).length;
        const personnelIds = new Set(projRecords.map(r => r.user_id));
        return {
          ...p,
          logsCount: projRecords.length,
          onSiteCount,
          personnelCount: personnelIds.size,
          personnelIds
        };
      })
      .filter(p => p.logsCount > 0 || p.onSiteCount > 0)
      .sort((a, b) => {
        if (a.onSiteCount !== b.onSiteCount) return b.onSiteCount - a.onSiteCount;
        return b.logsCount - a.logsCount;
      });
  }, [projectsList, records]);

  // Inactive / 0-logs projects
  const inactiveProjects = React.useMemo(() => {
    const activeIds = new Set(activeProjects.map(p => String(p.id)));
    return projectsList.filter(p => !activeIds.has(String(p.id)));
  }, [projectsList, activeProjects]);

  // Projects to display (either all active projects or filtered to selected one)
  const displayedProjects = React.useMemo(() => {
    if (selectedProjectId !== "all") {
      const match = projectsList.filter(p => String(p.id) === String(selectedProjectId));
      return match.length > 0 ? match : activeProjects;
    }
    return activeProjects;
  }, [activeProjects, projectsList, selectedProjectId]);

  // Helper stats for main listing row
  const getUserLogCount = (userId: number, projId?: string) => {
    if (projId && projId !== "all") {
      return records.filter(r => r.user_id === userId && String(r.project_id) === String(projId)).length;
    }
    return records.filter(r => r.user_id === userId).length;
  };

  const getUserWorkplace = (userId: number, projId?: string) => {
    if (projId && projId !== "all") {
      const p = projectsList.find(proj => String(proj.id) === String(projId));
      if (p) return p.name;
    }
    const userRecs = records.filter(r => r.user_id === userId);
    if (userRecs.length === 0) return "Global Sites";
    return userRecs[0].projects?.name || "Daikin Site";
  };

  const getUserLastActiveDate = (userId: number, projId?: string) => {
    let userRecs = records.filter(r => r.user_id === userId);
    if (projId && projId !== "all") {
      userRecs = userRecs.filter(r => String(r.project_id) === String(projId));
    }
    if (userRecs.length === 0) return "-";
    const sorted = [...userRecs].sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
    try {
      const dt = new Date(sorted[0].check_in_time);
      if (isNaN(dt.getTime())) return "-";
      return format(dt, "dd MMM yyyy", { locale: id });
    } catch {
      return "-";
    }
  };

  const safeFormatTime = (dateStr: any) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      return format(d, "HH:mm");
    } catch {
      return "-";
    }
  };

  const safeFormatDate = (dateStr: any, fmt: string = "dd MMM yyyy") => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      return format(d, fmt, { locale: id });
    } catch {
      return "-";
    }
  };

  const selectedUserObject = usersList.find(u => u.id === selectedUserId);

  // Calculations for stats summary on print preview
  const totalMinutes = timesheetRecords.reduce((acc, r) => {
    if (r.check_in_time && r.check_out_time) {
      const inTime = new Date(r.check_in_time).getTime();
      const outTime = new Date(r.check_out_time).getTime();
      if (!isNaN(inTime) && !isNaN(outTime) && outTime > inTime) {
        return acc + Math.floor((outTime - inTime) / 60000);
      }
    }
    return acc;
  }, 0);

  const totalOvertimeMinutes = timesheetRecords.reduce((acc, r) => {
    return acc + getOvertimeMinutes(r.check_in_time, r.check_out_time, r.projects?.shift_start_time, r.projects?.shift_end_time);
  }, 0);

  const totalHoursStr = `${Math.floor(totalMinutes / 60)} Jam ${totalMinutes % 60} Menit`;
  const totalOvertimeStr = totalOvertimeMinutes > 0 
    ? `${Math.floor(totalOvertimeMinutes / 60)} Jam ${totalOvertimeMinutes % 60} Menit`
    : "0 Jam 0 Menit";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-[#003366] mx-auto w-12 h-12" />
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest animate-pulse">Loading Attendance Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col w-full overflow-x-hidden">
      <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1200px] mx-auto space-y-6 sm:space-y-8 w-full">
        
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8">
          <div className="space-y-3 w-full sm:w-auto">
               <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-[#003366] rounded-2xl sm:rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
                     <Fingerprint size={22} className="sm:w-7 sm:h-7" />
                  </div>
                  <div>
                     <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#003366] tracking-tight uppercase">Attendance Record</h1>
                  </div>
               </div>
          </div>

          {activeTab === "records" && selectedUserId !== null && (
            <button 
              onClick={handleExportPDF}
              disabled={exportingPDF || timesheetRecords.length === 0}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3"
            >
              {exportingPDF ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              Download PDF Report
            </button>
          )}
        </div>

        {/* Tab switcher: Attendance Records / Overtime Calculation */}
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("records")}
            className={`flex-1 sm:flex-none px-5 sm:px-7 py-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              activeTab === "records" ? "bg-[#003366] text-white shadow-md" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <List size={14} /> Rekap Absensi
          </button>
          <button
            onClick={() => setActiveTab("overtime")}
            className={`flex-1 sm:flex-none px-5 sm:px-7 py-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              activeTab === "overtime" ? "bg-[#003366] text-white shadow-md" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Clock size={14} /> Perhitungan Lembur
          </button>
        </div>

        {/* 2. Summary Stats Panel (Shown only when list is displayed) */}
        {activeTab === "records" && selectedUserId === null && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
             <SummaryCard 
                label="Today's Attendance" 
                value={summary?.totalToday || 0} 
                icon={<UserCheck className="text-emerald-500" />} 
                sub="Records processed today"
             />
             <SummaryCard 
                label="Currently on Site" 
                value={summary?.activeNow || 0} 
                icon={<MapPin className="text-[#00a1e4]" />} 
                sub="Personnel active right now"
                highlight
             />
             <SummaryCard 
                label="Active Projects" 
                value={summary?.projectsTracked || 0} 
                icon={<Briefcase className="text-indigo-500" />} 
                sub="Monitored site locations"
             />
          </div>
        )}

        {/* 3. CORE INTERACTIVE WORKFLOW DISPLAY */}
        {activeTab === "overtime" ? (

          /* OVERTIME CALCULATION TAB */
          <OvertimeCalculator />

        ) : selectedUserId === null ? (
          
          /* A. PROJECT-SEPARATED ATTENDANCE DIRECTORY */
          <div className="space-y-6">
            
            {/* Project Separation & Filter Control Bar */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              {/* Header & View Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#003366] flex items-center justify-center font-black shrink-0 border border-blue-100">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                        Monitoring Absensi Proyek
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#003366] border border-blue-100 text-[9px] font-black uppercase">
                        {activeProjects.length} Proyek Aktif
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {selectedProjectId === "all" 
                        ? `Menampilkan proyek dengan absensi aktif (${records.length} total logs)`
                        : `Difilter ke proyek: ${projectsList.find(p => String(p.id) === String(selectedProjectId))?.name || "Proyek Terpilih"}`
                      }
                    </p>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[10px] font-black uppercase tracking-wider self-start sm:self-auto border border-slate-200/60">
                  <button
                    onClick={() => setViewGrouping("by_project")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      viewGrouping === "by_project" ? "bg-[#003366] text-white shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Layers size={13} /> Per Proyek
                  </button>
                  <button
                    onClick={() => setViewGrouping("all_personnel")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      viewGrouping === "all_personnel" ? "bg-[#003366] text-white shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <User size={13} /> Semua Personel
                  </button>
                </div>
              </div>

              {/* Filter Controls: Dropdown + Active Quick Chips (NO horizontal scrollbar) */}
              <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Clean Project Dropdown */}
                <div className="relative min-w-[280px]">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-black text-slate-700 text-xs uppercase tracking-wide focus:ring-2 focus:ring-[#003366] transition-all cursor-pointer appearance-none"
                  >
                    <option value="all">🌟 Semua Proyek Aktif ({activeProjects.length} Proyek • {records.length} Logs)</option>
                    {activeProjects.length > 0 && (
                      <optgroup label="Proyek dengan Absensi Aktif">
                        {activeProjects.map(p => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name} ({p.logsCount} Logs{p.onSiteCount > 0 ? ` • ${p.onSiteCount} On-Site` : ""})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {inactiveProjects.length > 0 && (
                      <optgroup label="Proyek Lainnya (0 Log)">
                        {inactiveProjects.map(p => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name} (0 Log)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Quick Chips for Active Projects (Wraps cleanly, no overflow scrollbar) */}
                <div className="flex items-center flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedProjectId("all")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                      selectedProjectId === "all"
                        ? "bg-[#003366] text-white border-[#003366] shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>Semua Aktif</span>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-black ${
                      selectedProjectId === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {records.length}
                    </span>
                  </button>
                  {activeProjects.map(p => {
                    const isSelected = selectedProjectId === String(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProjectId(String(p.id))}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#003366] text-white border-[#003366] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40"
                        }`}
                      >
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">{p.name}</span>
                        {p.onSiteCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title={`${p.onSiteCount} Personel on-site`} />
                        )}
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {p.logsCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search Personnel Input */}
              <div className="relative pt-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari personel berdasarkan nama, perusahaan, atau email..."
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Content: Grouped by Project vs All Personnel Table */}
            {viewGrouping === "by_project" ? (
              
              /* 1. GROUPED BY PROJECT CARDS */
              <div className="space-y-6">
                {displayedProjects.length === 0 ? (
                  <div className="bg-white p-16 text-center rounded-2xl border border-slate-100 shadow-sm text-slate-400">
                    <Building2 size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">Tidak ada proyek dengan absensi yang sesuai</p>
                  </div>
                ) : (
                  displayedProjects.map((proj: any) => {
                    const projRecords = records.filter(r => String(r.project_id) === String(proj.id));
                    const projActiveOnSite = projRecords.filter(r => !r.check_out_time);
                    const projUserIds = new Set(projRecords.map(r => r.user_id));
                    const projUsers = usersList.filter(u => projUserIds.has(u.id));
                    
                    const matchedUsers = projUsers.filter(u => 
                      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    const isCollapsed = collapsedProjects[proj.id] || false;

                    return (
                      <div 
                        key={proj.id} 
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md"
                      >
                        {/* Project Header Bar */}
                        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-[#003366] text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-sm sm:text-base font-black text-[#003366] uppercase tracking-wide">
                                  {proj.name}
                                </h2>
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0073ea] border border-blue-200 text-[8px] font-black uppercase tracking-wider">
                                  Shift {proj.shift_start_time || "08:00"} - {proj.shift_end_time || "17:00"}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                Klien: {proj.customerName || "PT Daikin Applied Solutions Indonesia"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                            {projActiveOnSite.length > 0 && (
                              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                {projActiveOnSite.length} On Site
                              </span>
                            )}
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-wider">
                              {projUsers.length} Personel
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-wider">
                              {projRecords.length} Logs
                            </span>
                            <button
                              onClick={() => toggleProjectCollapse(proj.id)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors ml-1"
                              title={isCollapsed ? "Buka rincian proyek" : "Tutup rincian proyek"}
                            >
                              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Project Personnel Body */}
                        {!isCollapsed && (
                          <div className="overflow-x-auto w-full">
                            {matchedUsers.length === 0 ? (
                              <div className="p-10 text-center text-slate-400">
                                <p className="text-xs font-bold">
                                  {projRecords.length === 0 
                                    ? "Belum ada log absensi tercatat pada proyek ini."
                                    : "Tidak ada personel di proyek ini yang cocok dengan pencarian."}
                                </p>
                              </div>
                            ) : (
                              <table className="w-full text-left whitespace-nowrap sm:whitespace-normal">
                                <thead>
                                  <tr className="bg-slate-50/40 border-b border-slate-100 uppercase text-[9px] font-black text-slate-400 tracking-wider">
                                    <th className="px-6 py-3.5">Personel</th>
                                    <th className="px-6 py-3.5">Perusahaan / Vendor</th>
                                    <th className="px-6 py-3.5 text-center">Logs di Proyek</th>
                                    <th className="px-6 py-3.5">Terakhir Aktif</th>
                                    <th className="px-6 py-3.5">Status Sesi</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {matchedUsers.map(u => {
                                    const userProjLogsCount = projRecords.filter(r => r.user_id === u.id).length;
                                    const userProjActive = projRecords.find(r => r.user_id === u.id && !r.check_out_time);
                                    const userProjLastActive = getUserLastActiveDate(u.id, proj.id);

                                    return (
                                      <tr 
                                        key={u.id}
                                        onClick={() => {
                                          setSelectedProjectId(String(proj.id));
                                          setSelectedUserId(u.id);
                                        }}
                                        className="group hover:bg-slate-50/80 cursor-pointer transition-all"
                                      >
                                        {/* Profile */}
                                        <td className="px-6 py-3.5">
                                          <div className="flex items-center gap-3">
                                            <div 
                                              onClick={(e) => {
                                                if (u.face_reference_url) {
                                                  e.stopPropagation();
                                                  setPreviewFaceUrl(u.face_reference_url);
                                                }
                                              }}
                                              className="relative w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black uppercase shrink-0 overflow-hidden border border-slate-200 group/avatar cursor-pointer"
                                              title={u.face_reference_url ? "Klik untuk melihat foto profil referensi" : "Belum mendaftarkan foto"}
                                            >
                                              {u.face_reference_url ? (
                                                <>
                                                  <img src={u.face_reference_url} alt={u.name} className="w-full h-full object-cover" />
                                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-[7px] font-black uppercase">
                                                    LIHAT
                                                  </div>
                                                </>
                                              ) : (
                                                u.name?.charAt(0)
                                              )}
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <p className="font-black text-slate-800 text-xs group-hover:text-[#003366] transition-colors">{u.name}</p>
                                                {u.face_reference_url ? (
                                                  u.face_verification_enabled !== false ? (
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[7px] font-black uppercase">
                                                      <Check size={8} /> Face OK
                                                    </span>
                                                  ) : (
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[7px] font-black uppercase">
                                                      Bypass
                                                    </span>
                                                  )
                                                ) : (
                                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 text-[7px] font-black uppercase">
                                                    No Face
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-[9px] text-slate-400 font-bold">{u.email}</p>
                                            </div>
                                          </div>
                                        </td>

                                        {/* Company */}
                                        <td className="px-6 py-3.5 font-bold text-slate-600 text-xs">
                                          {u.company_name || "Internal / Vendor"}
                                        </td>

                                        {/* Project Log Count */}
                                        <td className="px-6 py-3.5 text-center font-black text-[#003366] text-xs">
                                          {userProjLogsCount} Logs
                                        </td>

                                        {/* Last Active */}
                                        <td className="px-6 py-3.5 font-bold text-slate-500 text-xs">
                                          {userProjLastActive}
                                        </td>

                                        {/* Live Session Status */}
                                        <td className="px-6 py-3.5">
                                          {userProjActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black uppercase tracking-wider">
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                              On Site ({safeFormatTime(userProjActive.check_in_time)})
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-bold text-slate-400">Selesai</span>
                                          )}
                                        </td>

                                        {/* Action Button */}
                                        <td className="px-6 py-3.5 text-right">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedProjectId(String(proj.id));
                                              setSelectedUserId(u.id);
                                            }}
                                            className="px-3 py-1.5 bg-slate-50 hover:bg-[#003366] hover:text-white text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1 border border-slate-200"
                                          >
                                            Timesheet <ChevronIcon size={12} />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            ) : (

              /* 2. ALL PERSONNEL FLAT TABLE (FILTERED BY SELECTED PROJECT) */
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full max-w-full">
                  <table className="w-full text-left whitespace-nowrap sm:whitespace-normal">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest">
                        <th className="px-4 sm:px-10 py-4 sm:py-6">Personnel</th>
                        <th className="px-4 sm:px-10 py-4 sm:py-6">Main Workplace</th>
                        <th className="px-4 sm:px-10 py-4 sm:py-6 text-center">Total Logs</th>
                        <th className="px-4 sm:px-10 py-4 sm:py-6">Last Active</th>
                        <th className="px-4 sm:px-10 py-4 sm:py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-32 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                              <User size={64} />
                              <p className="font-black uppercase tracking-[0.3em] text-sm">No unique personnel found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr 
                            key={u.id}
                            onClick={() => setSelectedUserId(u.id)}
                            className="group hover:bg-slate-50/80 cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-[#003366]"
                          >
                            {/* Profile row */}
                            <td className="px-4 sm:px-10 py-4 sm:py-6">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div 
                                  onClick={(e) => {
                                    if (u.face_reference_url) {
                                      e.stopPropagation();
                                      setPreviewFaceUrl(u.face_reference_url);
                                    }
                                  }}
                                  className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black group-hover:bg-blue-50 group-hover:text-[#003366] transition-colors uppercase shrink-0 overflow-hidden border border-slate-200 group/avatar cursor-pointer"
                                  title={u.face_reference_url ? "Klik untuk melihat foto profil referensi" : "Belum mendaftarkan foto"}
                                >
                                  {u.face_reference_url ? (
                                    <>
                                      <img src={u.face_reference_url} alt={u.name} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-[7px] font-black uppercase">
                                        LIHAT
                                      </div>
                                    </>
                                  ) : (
                                    u.name?.charAt(0)
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-black text-slate-800 text-xs sm:text-sm group-hover:text-[#003366] transition-colors">{u.name}</p>
                                    {u.face_reference_url ? (
                                      u.face_verification_enabled !== false ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black uppercase tracking-tight">
                                          <Check size={9} /> Face OK
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-black uppercase tracking-tight">
                                          Bypass
                                        </span>
                                      )
                                    ) : (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-tight">
                                        No Face
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5 sm:mt-1">{u.company_name || 'Independent Vendor'}</p>
                                </div>
                              </div>
                            </td>

                            {/* Workplace */}
                            <td className="px-4 sm:px-10 py-4 sm:py-6">
                              <div className="inline-flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-[#0073ea] rounded-lg sm:rounded-xl border border-blue-100 text-[9px] sm:text-[10px] font-black uppercase tracking-tight">
                                {getUserWorkplace(u.id, selectedProjectId)}
                              </div>
                            </td>

                            {/* Total logs */}
                            <td className="px-4 sm:px-10 py-4 sm:py-6 text-center font-bold text-slate-600 text-xs sm:text-sm">
                              {getUserLogCount(u.id, selectedProjectId)} Logs
                            </td>

                            {/* Last active date */}
                            <td className="px-4 sm:px-10 py-4 sm:py-6 font-bold text-slate-500 text-xs sm:text-sm">
                              {getUserLastActiveDate(u.id, selectedProjectId)}
                            </td>

                            {/* Arrow link */}
                            <td className="px-4 sm:px-10 py-4 sm:py-6 text-right">
                              <button className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-lg sm:rounded-xl group-hover:bg-[#003366] group-hover:text-white transition-all">
                                <ChevronIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                              </button>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 sm:p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.4em] flex items-center justify-center sm:justify-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> DSSI Connect Management Portal
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">Displaying {filteredUsers.length} active personnel</p>
                </div>
              </div>
            )}

          </div>
        ) : (
          
          /* B. DETAIL TIMESHEET SCREEN & A4 PRINT PREVIEW */
          <div className="space-y-6">
            
            {/* Action Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setTimesheetRecords([]);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                <ArrowLeft size={14} /> Kembali ke Direktori Personel
              </button>

              <div className="flex flex-wrap items-center gap-3">
                {/* Project Selector inside Timesheet */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
                  <Building2 size={14} className="text-[#0073ea]" />
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Proyek:</span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="bg-transparent font-black text-slate-800 text-xs border-none focus:ring-0 cursor-pointer"
                  >
                    <option value="all">Semua Proyek (Gabungan)</option>
                    {projectsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Month navigation slider */}
                <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl shadow-sm min-w-[200px]">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    {format(selectedMonth, "MMMM yyyy", { locale: id })}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Personnel Biometric Profile & Administrative Controls Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => {
                    if (selectedUserObject?.face_reference_url) {
                      setPreviewFaceUrl(selectedUserObject.face_reference_url);
                    }
                  }}
                  className={`relative group rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedUserObject?.face_reference_url 
                      ? "cursor-pointer border-[#003366] hover:scale-105 shadow-md" 
                      : "border-dashed border-slate-300 bg-slate-50"
                  } w-14 h-14 shrink-0 flex items-center justify-center`}
                  title={selectedUserObject?.face_reference_url ? "Klik untuk melihat foto referensi master" : "Belum ada foto referensi"}
                >
                  {selectedUserObject?.face_reference_url ? (
                    <img 
                      src={selectedUserObject.face_reference_url} 
                      alt={selectedUserObject.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <Camera size={22} className="text-slate-400" />
                  )}
                  {selectedUserObject?.face_reference_url && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[8px] font-black uppercase">
                      Lihat
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-slate-800 text-sm sm:text-base">{selectedUserObject?.name}</h3>
                    {selectedUserObject?.face_reference_url ? (
                      selectedUserObject?.face_verification_enabled !== false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black uppercase tracking-wider">
                          <Check size={9} /> Verifikasi Wajah Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-black uppercase tracking-wider">
                          <AlertTriangle size={9} /> Verifikasi Dibypass
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[8px] font-black uppercase tracking-wider">
                        Belum Terdaftar
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {selectedUserObject?.email} • {selectedUserObject?.company_name || "Internal / Vendor"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Toggle Face Verification */}
                <button
                  onClick={() => handleToggleFaceVerification()}
                  disabled={togglingFace}
                  className={`px-3.5 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 shadow-sm ${
                    selectedUserObject?.face_verification_enabled !== false
                      ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      : "bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600"
                  }`}
                  title="Aktifkan/nonaktifkan kewajiban verifikasi wajah saat absensi"
                >
                  <ShieldCheck size={13} />
                  {selectedUserObject?.face_verification_enabled !== false ? "Bypass Wajah" : "Wajibkan Wajah"}
                </button>

                {/* Reset Face Reference */}
                <button
                  onClick={() => handleResetFace()}
                  disabled={resettingFace}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                  title="Hapus foto referensi agar karyawan diminta foto wajah baru"
                >
                  {resettingFace ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                  Reset Foto Wajah
                </button>

                {/* Upload Face Photo */}
                <button
                  onClick={() => faceUploadInputRef.current?.click()}
                  disabled={uploadingFace}
                  className="px-3.5 py-2 bg-[#003366] hover:bg-blue-900 text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                  title="Upload foto resmi karyawan dari komputer"
                >
                  {uploadingFace ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                  Upload Foto Baru
                </button>
                <input 
                  type="file" 
                  ref={faceUploadInputRef} 
                  onChange={handleFaceUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Interactive print preview wrapper */}
            <div className="bg-slate-200 border border-slate-300 rounded-2xl p-2 sm:p-6 md:p-10 flex justify-start md:justify-center overflow-x-auto shadow-inner w-full max-w-full">
              
              {/* Authentic A4 Document Visual Sheet */}
              <div className="w-[210mm] min-h-[297mm] bg-white border border-slate-300 rounded-2xl shadow-2xl p-12 font-sans text-slate-800 relative flex flex-col justify-between shrink-0">
                
                <div className="space-y-8">
                  
                  {/* Branding headers */}
                  <div className="flex justify-between items-center pb-4 border-b-2 border-[#003366]">
                    <div className="flex items-center gap-3">
                      <img src="/daikin_logo.png" alt="Daikin" className="h-8 object-contain" />
                      <div className="h-6 w-[1px] bg-slate-300"></div>
                      <div className="text-[7px] font-black text-[#003366] uppercase leading-tight tracking-wider">
                        PT DAIKIN APPLIED SOLUTIONS INDONESIA
                      </div>
                    </div>
                    <img src="/logo/Logo DSSI.png" alt="DSSI Connect" className="h-10 sm:h-12 w-auto object-contain" />
                  </div>

                  {/* Document Title */}
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-black text-[#003366] uppercase tracking-widest">LAPORAN TIMESHEET RIWAYAT ABSENSI</h2>
                    <span className="inline-block bg-sky-50 text-[#003366] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded border border-sky-100">
                      {format(selectedMonth, "MMMM yyyy", { locale: id })}
                    </span>
                  </div>

                  {/* Metadata display table */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nama Lengkap</p>
                        <p className="font-black text-slate-800 uppercase text-xs">{selectedUserObject?.name}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Akun</p>
                        <p className="font-bold text-slate-600 text-xs">{selectedUserObject?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Perusahaan / Subkontraktor</p>
                        <p className="font-black text-slate-800 uppercase text-xs">{selectedUserObject?.company_name || 'Independent / Internal'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nama Project</p>
                        <p className="font-bold text-[#00a1e4] uppercase text-xs tracking-wider">{getProjectName()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats summary boxes */}
                  {timesheetRecords.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                        <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest mb-0.5">Total Hari Hadir</p>
                        <p className="text-lg font-black text-emerald-800">{timesheetRecords.length} Hari</p>
                      </div>
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                        <p className="text-[8px] font-black text-blue-700 uppercase tracking-widest mb-0.5">Total Durasi Kerja</p>
                        <p className="text-lg font-black text-blue-800 text-ellipsis overflow-hidden whitespace-nowrap">{totalHoursStr}</p>
                      </div>
                      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-center">
                        <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mb-0.5">Kelebihan Kerja (OT)</p>
                        <p className="text-lg font-black text-amber-800 text-ellipsis overflow-hidden whitespace-nowrap">{totalOvertimeStr}</p>
                      </div>
                    </div>
                  )}

                  {/* Timesheet daily data table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {loadingTimesheet ? (
                      <div className="p-24 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="animate-spin text-[#003366] w-8 h-8" />
                        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Records...</p>
                      </div>
                    ) : timesheetRecords.length === 0 ? (
                      <div className="p-24 text-center text-slate-400 bg-white">
                        <Calendar size={40} className="mx-auto mb-2 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Attendance Data Found</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse bg-white">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[8px] font-black text-slate-400 uppercase tracking-wider">
                            <th className="p-3 w-[15%]">Tanggal</th>
                            <th className="p-3 w-[14%]">Proyek</th>
                            <th className="p-3 w-[10%]">Masuk</th>
                            <th className="p-3 w-[13%]">Lokasi Masuk</th>
                            <th className="p-3 w-[11%]">Keluar</th>
                            <th className="p-3 w-[13%]">Lokasi Keluar</th>
                            <th className="p-3 w-[8%] text-center">Durasi</th>
                            <th className="p-3 w-[7%] text-center">Lembur</th>
                            <th className="p-3 w-[9%] text-center">Foto & Audit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timesheetRecords.map((r, idx) => (
                            <tr key={r.id || idx} className="border-b border-slate-100 hover:bg-slate-50/30">
                              <td className="p-3 font-bold text-slate-700">
                                {safeFormatDate(r.check_in_time, "EEEE, dd MMM yyyy")}
                              </td>
                              <td className="p-3">
                                <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-[#0073ea] border border-blue-100 font-black text-[8px] uppercase tracking-tight max-w-[130px] truncate" title={r.projects?.name || "-"}>
                                  {r.projects?.name || "-"}
                                </span>
                              </td>
                              <td className="p-3 text-emerald-600 font-bold">
                                <div className="flex flex-col">
                                  <span>{safeFormatTime(r.check_in_time)}</span>
                                  {(() => {
                                    const checkIn = new Date(r.check_in_time);
                                    const shiftStart = r.projects?.shift_start_time || "08:00";
                                    const [sh, sm] = shiftStart.split(":").map(Number);
                                    const checkInMins = checkIn.getHours() * 60 + checkIn.getMinutes();
                                    const shiftMins = sh * 60 + sm;
                                    if (checkInMins > shiftMins) {
                                      const diff = checkInMins - shiftMins;
                                      return (
                                        <span className="inline-block mt-0.5 text-[7px] font-black text-rose-600 uppercase tracking-wide bg-rose-50 px-1 py-0.5 rounded border border-rose-100 w-max">
                                          Terlambat {formatMinutesToHoursMins(diff)}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </td>
                              <td className="p-3">
                                {r.check_in_lat !== null ? (
                                  <a
                                    href={getMapsLink(r.check_in_lat, r.check_in_long)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#00a1e4] hover:underline font-bold flex items-center gap-0.5"
                                  >
                                    <MapPin size={10} /> {r.check_in_lat.toFixed(4)}, {r.check_in_long.toFixed(4)}
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="p-3 text-rose-600 font-bold">
                                {r.check_out_time ? (
                                  <div className="flex flex-col">
                                    <span>{safeFormatTime(r.check_out_time)}</span>
                                    {(() => {
                                      const checkOut = new Date(r.check_out_time);
                                      const shiftEnd = r.projects?.shift_end_time || "17:00";
                                      const [eh, em] = shiftEnd.split(":").map(Number);
                                      const checkOutMins = checkOut.getHours() * 60 + checkOut.getMinutes();
                                      const shiftMins = eh * 60 + em;
                                      if (checkOutMins < shiftMins) {
                                        const diff = shiftMins - checkOutMins;
                                        return (
                                          <span className="inline-block mt-0.5 text-[7px] font-black text-rose-600 uppercase tracking-wide bg-rose-50 px-1 py-0.5 rounded border border-rose-100 w-max">
                                            Cepat {formatMinutesToHoursMins(diff)}
                                          </span>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-start gap-1">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[7px] font-black uppercase tracking-wider animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                      Sesi Aktif
                                    </span>
                                    <button
                                      onClick={() => setManualClockOutRecord(r)}
                                      className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white text-[7px] font-black uppercase tracking-wider rounded shadow-sm flex items-center gap-1 transition-all"
                                      title="Clock-Out Manual oleh Admin"
                                    >
                                      <LogOut size={8} /> Clock-Out
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                {r.check_out_lat !== null ? (
                                  <a
                                    href={getMapsLink(r.check_out_lat, r.check_out_long)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#00a1e4] hover:underline font-bold flex items-center gap-0.5"
                                  >
                                    <MapPin size={10} /> {r.check_out_lat.toFixed(4)}, {r.check_out_long.toFixed(4)}
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="p-3 font-black text-slate-800 text-center">
                                {getDurationStr(r.check_in_time, r.check_out_time)}
                              </td>
                              <td className="p-3 font-black text-amber-700 text-center">
                                {formatMinutesToHoursMins(getOvertimeMinutes(r.check_in_time, r.check_out_time, r.projects?.shift_start_time, r.projects?.shift_end_time))}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => setInspectPhotoRecord(r)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#003366] rounded-lg border border-blue-200 text-[8px] font-black uppercase tracking-wider transition-all shadow-sm"
                                  title="Inspeksi foto referensi, clock in, dan clock out"
                                >
                                  {r.check_in_photo ? (
                                    <img src={r.check_in_photo} alt="Thumb" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                                  ) : (
                                    <Eye size={10} className="text-[#00a1e4]" />
                                  )}
                                  <span>Inspeksi</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>

                {/* Signatures at bottom */}
                {timesheetRecords.length > 0 && (
                  <div className="pt-8 mt-16 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-10">
                      <div className="text-center space-y-16">
                        <p className="text-[8px] font-black text-[#003366] uppercase tracking-widest">Tanda Tangan Personel</p>
                        <div className="w-40 h-16 border-b border-slate-200 mx-auto relative flex items-end justify-center">
                          <span className="absolute -bottom-4 text-[7px] font-bold text-slate-400 uppercase">( {selectedUserObject?.name} )</span>
                        </div>
                      </div>

                      <div className="text-center space-y-16">
                        <p className="text-[8px] font-black text-[#003366] uppercase tracking-widest">Verifikasi HRD / Supervisor</p>
                        <div className="w-40 h-16 border-b border-slate-200 mx-auto relative flex items-end justify-center">
                          <span className="absolute -bottom-4 text-[7px] font-bold text-slate-400 uppercase">( PT Daikin Applied Solutions )</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </div>

      {/* 4. MODALS */}
      {inspectPhotoRecord && (
        <BiometricAuditModal
          record={inspectPhotoRecord}
          user={selectedUserObject || inspectPhotoRecord.users}
          onClose={() => setInspectPhotoRecord(null)}
          onResetFace={handleResetFace}
          onManualClockOut={(rec) => {
            setManualClockOutRecord(rec);
            setInspectPhotoRecord(null);
          }}
        />
      )}

      {manualClockOutRecord && (
        <ManualClockOutModal
          record={manualClockOutRecord}
          user={selectedUserObject || manualClockOutRecord.users}
          onClose={() => setManualClockOutRecord(null)}
          onSubmit={handleSubmitManualClockOut}
        />
      )}

      {/* Face Lightbox Preview Modal */}
      {previewFaceUrl && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-[#003366] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} />
                <h3 className="text-sm font-black uppercase tracking-wider">Foto Profil Wajah Master</h3>
              </div>
              <button 
                onClick={() => setPreviewFaceUrl(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="aspect-square w-full rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden relative shadow-inner flex items-center justify-center">
                <img 
                  src={previewFaceUrl} 
                  alt="Face Reference" 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
                <p className="font-black text-slate-800 text-sm truncate">{selectedUserObject?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {selectedUserObject?.email} • {selectedUserObject?.company_name || "Internal / Vendor"}
                </p>
                <p className="text-[9px] text-slate-500 pt-1 leading-relaxed">
                  Foto ini merupakan referensi resmi yang digunakan oleh AI biometrik. Jika foto ini bukan foto wajah yang jelas, silakan tekan <strong>Reset Foto Wajah</strong> di bawah ini.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={async () => {
                    await handleResetFace();
                    setPreviewFaceUrl(null);
                  }}
                  disabled={resettingFace}
                  className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={12} /> Reset Foto Wajah
                </button>
                <button
                  onClick={() => {
                    setPreviewFaceUrl(null);
                    faceUploadInputRef.current?.click();
                  }}
                  className="flex-1 py-2.5 px-3 bg-[#003366] hover:bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <UploadCloud size={12} /> Upload Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, sub, highlight = false }: any) {
  return (
    <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md ${highlight ? 'bg-[#003366] text-white border-blue-900 shadow-md shadow-blue-900/20' : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:border-[#0073ea]'}`}>
       <div className="flex justify-between items-start mb-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${highlight ? 'bg-white/10' : 'bg-slate-50'}`}>
             {React.cloneElement(icon as React.ReactElement, { size: 20, className: "sm:w-5 sm:h-5" } as any)}
          </div>
          <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-50">Active</div>
       </div>
       <div className="space-y-0.5">
          <h4 className="text-2xl sm:text-3xl font-black tracking-tighter">{value}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</p>
       </div>
       <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${highlight ? 'border-white/10' : 'border-slate-50'} flex items-center gap-2`}>
          <div className={`w-1.5 h-1.5 rounded-full ${highlight ? 'bg-emerald-400' : 'bg-blue-500'}`} />
          <p className="text-[8px] font-black uppercase tracking-widest opacity-40 truncate">{sub}</p>
       </div>
    </div>
  );
}
