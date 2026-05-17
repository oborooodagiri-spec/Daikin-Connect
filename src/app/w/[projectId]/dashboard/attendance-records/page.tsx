"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  getAttendanceRecords, 
  getAttendanceUsers, 
  getUserMonthlyAttendance 
} from "@/app/actions/attendanceAdmin";
import { generateAttendancePDF } from "@/lib/attendance-pdf-generator";
import { 
  MapPin, Clock, FileImage, ShieldCheck, Download, Loader2,
  Calendar, User, ChevronLeft, ChevronRight, List, FileText, CheckCircle2,
  Search, ArrowLeft, Building2, ChevronRight as ChevronIcon, Map
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

export default function AttendanceRecordsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  
  // Data States
  const [records, setRecords] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Timesheet Detail States
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [timesheetRecords, setTimesheetRecords] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loadingTimesheet, setLoadingTimesheet] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // 1. Fetch All Attendance Records on Mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAttendanceRecords({ projectId });
      if (res && "success" in res && res.success) {
        setRecords(res.data);
      }
      setLoading(false);
    }
    load();
  }, [projectId]);

  // 2. Fetch Active Users List for Main Directory
  useEffect(() => {
    async function loadUsers() {
      const res = await getAttendanceUsers(projectId);
      if (res && "success" in res && res.success) {
        setUsersList(res.data);
      }
    }
    if (projectId) {
      loadUsers();
    }
  }, [projectId]);

  // 3. Fetch Monthly Timesheet Records for Selected User
  useEffect(() => {
    async function loadTimesheet() {
      if (selectedUserId === null) return;
      setLoadingTimesheet(true);
      const res = await getUserMonthlyAttendance(
        selectedUserId,
        selectedMonth.getMonth(),
        selectedMonth.getFullYear(),
        projectId
      );
      if (res && "success" in res && res.success) {
        setTimesheetRecords(res.data);
      } else {
        setTimesheetRecords([]);
      }
      setLoadingTimesheet(false);
    }
    loadTimesheet();
  }, [selectedUserId, selectedMonth, projectId]);

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

  const getMapsLink = (lat: number | null, lng: number | null) => {
    if (lat === null || lng === null) return "#";
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  // Overtime Calculation Helpers
  const getDurationStr = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "Sesi Aktif";
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.round((diffMs % 3600000) / 60000);
    return `${hrs} jam ${mins} menit`;
  };

  const getOvertimeMinutes = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return 0;
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    // Standard work hours: 8 hours = 480 minutes
    const overtime = diffMinutes - 480;
    return overtime > 0 ? overtime : 0;
  };

  const formatMinutesToHoursMins = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0 && mins === 0) return "-";
    return `${hrs}j ${mins}m`;
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

  // Filter Users List based on input query
  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to count logs for a specific user
  const getUserLogCount = (userId: number) => {
    return records.filter(r => r.user_id === userId).length;
  };

  // Helper to get workplace name for a specific user
  const getUserWorkplace = (userId: number) => {
    const userRecs = records.filter(r => r.user_id === userId);
    if (userRecs.length === 0) return "Unknown Project";
    return userRecs[0].projects?.name || "Global Project";
  };

  // Helper to get last active check-in date
  const getUserLastActiveDate = (userId: number) => {
    const userRecs = records.filter(r => r.user_id === userId);
    if (userRecs.length === 0) return "-";
    const sorted = [...userRecs].sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
    return format(new Date(sorted[0].check_in_time), "dd MMM yyyy", { locale: id });
  };

  const selectedUserObject = usersList.find(u => u.id === selectedUserId);

  // Calculations for preview stats summary
  const totalMinutes = timesheetRecords.reduce((acc, r) => {
    if (r.check_in_time && r.check_out_time) {
      return acc + Math.floor((new Date(r.check_out_time).getTime() - new Date(r.check_in_time).getTime()) / 60000);
    }
    return acc;
  }, 0);

  const totalOvertimeMinutes = timesheetRecords.reduce((acc, r) => {
    return acc + getOvertimeMinutes(r.check_in_time, r.check_out_time);
  }, 0);

  const totalHoursStr = `${Math.floor(totalMinutes / 60)} Jam ${totalMinutes % 60} Menit`;
  const totalOvertimeStr = totalOvertimeMinutes > 0 
    ? `${Math.floor(totalOvertimeMinutes / 60)} Jam ${totalOvertimeMinutes % 60} Menit`
    : "0 Jam 0 Menit";

  if (loading) {
    return (
      <div className="p-24 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#003366]" size={40} />
        <p className="text-xs font-black uppercase text-slate-400 tracking-widest animate-pulse">Loading Attendance Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#003366] uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" /> Administrative Attendance
          </h1>
          <p className="text-sm font-bold text-slate-400">Strictly administrative views for vendor presence and timesheets.</p>
        </div>
        
        {selectedUserId !== null && (
          <button 
            onClick={handleExportPDF}
            disabled={exportingPDF || timesheetRecords.length === 0}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            {exportingPDF ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Download Monthly PDF
          </button>
        )}
      </div>

      {/* 2. MAIN WORKFLOW SCREEN (LIST OF UNIQUE EMPLOYEES FIRST) */}
      {selectedUserId === null ? (
        <div className="space-y-6">
          {/* Top Filter Panel matching screenshot */}
          <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Search Personnel</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold pl-9 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#003366] transition-colors"
                />
              </div>
            </div>

            {/* Project dropdown */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Project Site</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold p-3 rounded-xl focus:outline-none focus:border-[#003366] transition-colors"
              >
                <option value="all">All Projects</option>
              </select>
            </div>

            {/* Date Inputs */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold p-2.5 rounded-xl focus:outline-none focus:border-[#003366]"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold p-2.5 rounded-xl focus:outline-none focus:border-[#003366]"
                />
              </div>
            </div>

          </div>

          {/* Personnel list styled rows matching screenshot */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 uppercase text-[9px] font-black text-slate-400 tracking-widest bg-slate-50">
                    <th className="p-4 pl-6">Personnel</th>
                    <th className="p-4">Workplace</th>
                    <th className="p-4">Logs Count</th>
                    <th className="p-4">Last Presence</th>
                    <th className="p-4 text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                        No Personnel Found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr 
                        key={u.id} 
                        onClick={() => setSelectedUserId(u.id)}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                      >
                        {/* 1. Personnel profile row */}
                        <td className="p-4 pl-6 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black uppercase text-sm group-hover:bg-[#003366] group-hover:text-white transition-all shadow-inner">
                            {u.name.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 group-hover:text-[#003366] transition-colors">{u.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{u.company_name || 'Independent Vendor'}</p>
                          </div>
                        </td>

                        {/* 2. Workplace */}
                        <td className="p-4">
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-blue-100">
                            {getUserWorkplace(u.id)}
                          </span>
                        </td>

                        {/* 3. Log Count */}
                        <td className="p-4 font-bold text-slate-600">
                          {getUserLogCount(u.id)} Logs
                        </td>

                        {/* 4. Last Presence */}
                        <td className="p-4 font-bold text-slate-500">
                          {getUserLastActiveDate(u.id)}
                        </td>

                        {/* 5. Chevron arrow */}
                        <td className="p-4 text-right pr-8">
                          <div className="inline-flex w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#003366] items-center justify-center transition-all">
                            <ChevronIcon size={16} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        
        /* 3. WORKTIMESHEET DETAIL / PRINT PREVIEW SCREEN (SHOWN ONLY ON CLICK) */
        <div className="space-y-6">
          
          {/* Back toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <button
              onClick={() => {
                setSelectedUserId(null);
                setTimesheetRecords([]);
              }}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft size={14} /> Back to Personnel List
            </button>

            {/* Period selector */}
            <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl shadow-sm min-w-[220px]">
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

          {/* Interactive Document Sheet Print-Preview */}
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-4 md:p-8 flex justify-center overflow-x-auto shadow-inner">
            
            {/* Visual A4 Document Sheet */}
            <div className="w-[210mm] min-h-[297mm] bg-white border border-slate-300 rounded-xl shadow-2xl p-10 font-sans text-slate-800 relative flex flex-col justify-between shrink-0">
              
              <div className="space-y-6">
                
                {/* A4 branding header */}
                <div className="flex justify-between items-center pb-4 border-b-2 border-[#003366]">
                  <div className="flex items-center gap-3">
                    <img src="/daikin_logo.png" alt="Daikin" className="h-8 object-contain" />
                    <div className="h-6 w-[1px] bg-slate-300"></div>
                    <div className="text-[7px] font-black text-[#003366] uppercase leading-tight tracking-wider">
                      PT DAIKIN APPLIED SOLUTIONS INDONESIA
                    </div>
                  </div>
                  <img src="/logo_epl_connect_1.png" alt="EPL Connect" className="h-10 object-contain" />
                </div>

                {/* Report Title */}
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-black text-[#003366] uppercase tracking-widest">LAPORAN TIMESHEET RIWAYAT ABSENSI</h2>
                  <span className="inline-block bg-sky-50 text-[#003366] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded border border-sky-100">
                    {format(selectedMonth, "MMMM yyyy", { locale: id })}
                  </span>
                </div>

                {/* Metadata Details Grid */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</p>
                      <p className="font-black text-slate-800 uppercase text-xs">{selectedUserObject?.name}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Akun</p>
                      <p className="font-bold text-slate-600 text-xs">{selectedUserObject?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Perusahaan / Subkontraktor</p>
                      <p className="font-black text-slate-800 uppercase text-xs">{selectedUserObject?.company_name || 'Independent / Internal'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Project Workspace</p>
                      <p className="font-bold text-[#00a1e4] uppercase text-xs tracking-wider">ADMINISTRATIVE PORTAL</p>
                    </div>
                  </div>
                </div>

                {/* Summary Statistics Card */}
                {timesheetRecords.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 text-center">
                      <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest mb-0.5">Total Hari Hadir</p>
                      <p className="text-base font-black text-emerald-800">{timesheetRecords.length} Hari</p>
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-center">
                      <p className="text-[8px] font-black text-blue-700 uppercase tracking-widest mb-0.5">Total Durasi Kerja</p>
                      <p className="text-base font-black text-blue-800 text-ellipsis overflow-hidden whitespace-nowrap">{totalHoursStr}</p>
                    </div>
                    <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 text-center">
                      <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mb-0.5">Kelebihan Kerja (OT)</p>
                      <p className="text-base font-black text-amber-800 text-ellipsis overflow-hidden whitespace-nowrap">{totalOvertimeStr}</p>
                    </div>
                  </div>
                )}

                {/* Timesheet Daily Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  {loadingTimesheet ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="animate-spin text-[#003366]" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Loading Records...</p>
                    </div>
                  ) : timesheetRecords.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 bg-white">
                      <Calendar size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Attendance Data Found</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse bg-white">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[8px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="p-2.5 w-[20%]">Tanggal</th>
                          <th className="p-2.5 w-[12%]">Masuk</th>
                          <th className="p-2.5 w-[18%]">Lokasi Masuk</th>
                          <th className="p-2.5 w-[12%]">Keluar</th>
                          <th className="p-2.5 w-[18%]">Lokasi Keluar</th>
                          <th className="p-2.5 w-[10%] text-center">Durasi</th>
                          <th className="p-2.5 w-[10%] text-center">Lembur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timesheetRecords.map((r, idx) => (
                          <tr key={r.id || idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-slate-700">
                              {format(new Date(r.check_in_time), "EEEE, dd MMM yyyy", { locale: id })}
                            </td>
                            <td className="p-2.5 text-emerald-600 font-bold">
                              {format(new Date(r.check_in_time), "HH:mm")}
                            </td>
                            <td className="p-2.5">
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
                            <td className="p-2.5 text-rose-600 font-bold">
                              {r.check_out_time ? format(new Date(r.check_out_time), "HH:mm") : "-"}
                            </td>
                            <td className="p-2.5">
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
                            <td className="p-2.5 font-black text-slate-800 text-center">
                              {getDurationStr(r.check_in_time, r.check_out_time)}
                            </td>
                            <td className="p-2.5 font-black text-amber-700 text-center">
                              {formatMinutesToHoursMins(getOvertimeMinutes(r.check_in_time, r.check_out_time))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* A4 Sign-off block at bottom */}
              {timesheetRecords.length > 0 && (
                <div className="pt-8 mt-10 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="text-center space-y-12">
                      <p className="text-[8px] font-black text-[#003366] uppercase tracking-widest">Tanda Tangan Personel</p>
                      <div className="w-32 h-12 border-b border-slate-200 mx-auto relative flex items-end justify-center">
                        <span className="absolute -bottom-4 text-[7px] font-bold text-slate-400 uppercase">( {selectedUserObject?.name} )</span>
                      </div>
                    </div>

                    <div className="text-center space-y-12">
                      <p className="text-[8px] font-black text-[#003366] uppercase tracking-widest">Verifikasi HRD / Supervisor</p>
                      <div className="w-32 h-12 border-b border-slate-200 mx-auto relative flex items-end justify-center">
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
  );
}
