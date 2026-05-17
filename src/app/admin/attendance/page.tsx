"use client";

import React, { useEffect, useState } from "react";
import { 
  getAttendanceRecords, 
  getAttendanceUsers, 
  getUserMonthlyAttendance,
  getAttendanceSummary
} from "@/app/actions/attendanceAdmin";
import { generateAttendancePDF } from "@/lib/attendance-pdf-generator";
import { 
  MapPin, Clock, FileImage, ShieldCheck, Download, Loader2,
  Calendar, User, ChevronLeft, ChevronRight, List, FileText, CheckCircle2,
  Search, ArrowLeft, Building2, Fingerprint, UserCheck, Briefcase, ChevronRight as ChevronIcon
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

export default function AttendanceRecordsPage() {
  // Base states
  const [records, setRecords] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
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

  // 1. Fetch Summary Stats and All Records on Mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [recRes, sumRes] = await Promise.all([
        getAttendanceRecords(),
        getAttendanceSummary()
      ]);

      if (recRes && "success" in recRes && recRes.success) {
        setRecords(recRes.data);
      }
      if (sumRes && "success" in sumRes && sumRes.success) {
        setSummary(sumRes.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  // 2. Fetch Unique Users Directory
  useEffect(() => {
    async function loadUsers() {
      const res = await getAttendanceUsers();
      if (res && "success" in res && res.success) {
        setUsersList(res.data);
      }
    }
    loadUsers();
  }, []);

  // 3. Fetch Monthly Timesheet Records for Selected User
  useEffect(() => {
    async function loadTimesheet() {
      if (selectedUserId === null) return;
      setLoadingTimesheet(true);
      const res = await getUserMonthlyAttendance(
        selectedUserId,
        selectedMonth.getMonth(),
        selectedMonth.getFullYear()
      );
      if (res && "success" in res && res.success) {
        setTimesheetRecords(res.data);
      } else {
        setTimesheetRecords([]);
      }
      setLoadingTimesheet(false);
    }
    loadTimesheet();
  }, [selectedUserId, selectedMonth]);

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

  // Overtime and Duration Calculations
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

  // Filter Unique Users based on Search Input
  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper stats for main listing row
  const getUserLogCount = (userId: number) => {
    return records.filter(r => r.user_id === userId).length;
  };

  const getUserWorkplace = (userId: number) => {
    const userRecs = records.filter(r => r.user_id === userId);
    if (userRecs.length === 0) return "Global Sites";
    return userRecs[0].projects?.name || "Daikin Site";
  };

  const getUserLastActiveDate = (userId: number) => {
    const userRecs = records.filter(r => r.user_id === userId);
    if (userRecs.length === 0) return "-";
    const sorted = [...userRecs].sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
    return format(new Date(sorted[0].check_in_time), "dd MMM yyyy", { locale: id });
  };

  const selectedUserObject = usersList.find(u => u.id === selectedUserId);

  // Calculations for stats summary on print preview
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
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-[#003366] mx-auto w-12 h-12" />
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest animate-pulse">Loading Attendance Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <div className="flex-1 p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto space-y-12">
        
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-3">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#003366] rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                     <Fingerprint size={28} />
                  </div>
                  <div>
                     <h1 className="text-3xl font-black text-[#003366] tracking-tight uppercase">Attendance Record</h1>
                     <p className="text-xs font-bold text-slate-400 mt-1">Unique personnel directory, overtime auditor and print-ready logs.</p>
                  </div>
               </div>
          </div>

          {selectedUserId !== null && (
            <button 
              onClick={handleExportPDF}
              disabled={exportingPDF || timesheetRecords.length === 0}
              className="px-8 py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg flex items-center gap-3"
            >
              {exportingPDF ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Download PDF Report
            </button>
          )}
        </div>

        {/* 2. Summary Stats Panel (Shown only when list is displayed) */}
        {selectedUserId === null && (
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
        {selectedUserId === null ? (
          
          /* A. UNIQUE PERSONNEL LIST SCREEN */
          <div className="space-y-6">
            
            {/* Search Input Box */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Personnel</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name or company..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Personnel Listing Table */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                      <th className="px-10 py-8">Personnel</th>
                      <th className="px-10 py-8">Main Workplace</th>
                      <th className="px-10 py-8 text-center">Total Logs</th>
                      <th className="px-10 py-8">Last Active</th>
                      <th className="px-10 py-8 text-right">Actions</th>
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
                          <td className="px-10 py-7">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black group-hover:bg-blue-50 group-hover:text-[#003366] transition-colors uppercase">
                                {u.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-slate-800 text-sm group-hover:text-[#003366] transition-colors">{u.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">{u.company_name || 'Independent Vendor'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Workplace */}
                          <td className="px-10 py-7">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#0073ea] rounded-xl border border-blue-100 text-[10px] font-black uppercase tracking-tight">
                              {getUserWorkplace(u.id)}
                            </div>
                          </td>

                          {/* Total logs */}
                          <td className="px-10 py-7 text-center font-bold text-slate-600">
                            {getUserLogCount(u.id)} Logs
                          </td>

                          {/* Last active date */}
                          <td className="px-10 py-7 font-bold text-slate-500">
                            {getUserLastActiveDate(u.id)}
                          </td>

                          {/* Arrow link */}
                          <td className="px-10 py-7 text-right">
                            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-[#003366] group-hover:text-white transition-all">
                              <ChevronIcon size={18} />
                            </button>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" /> Administrative Directory Active
                </p>
                <p className="text-[10px] font-bold text-slate-300">Displaying {filteredUsers.length} active personnel</p>
              </div>
            </div>

          </div>
        ) : (
          
          /* B. DETAIL TIMESHEET SCREEN & A4 PRINT PREVIEW */
          <div className="space-y-6">
            
            {/* Action Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setTimesheetRecords([]);
                }}
                className="flex items-center gap-2 px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                <ArrowLeft size={14} /> Back to Personnel Directory
              </button>

              {/* Month navigation slider */}
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

            {/* Interactive print preview wrapper */}
            <div className="bg-slate-200 border border-slate-300 rounded-[2.5rem] p-4 md:p-12 flex justify-center overflow-x-auto shadow-inner">
              
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
                    <img src="/logo_epl_connect_1.png" alt="EPL Connect" className="h-10 object-contain" />
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
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Project Workspace</p>
                        <p className="font-bold text-[#00a1e4] uppercase text-xs tracking-wider">ADMINISTRATIVE PORTAL</p>
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
                            <th className="p-3 w-[20%]">Tanggal</th>
                            <th className="p-3 w-[12%]">Masuk</th>
                            <th className="p-3 w-[18%]">Lokasi Masuk</th>
                            <th className="p-3 w-[12%]">Keluar</th>
                            <th className="p-3 w-[18%]">Lokasi Keluar</th>
                            <th className="p-3 w-[10%] text-center">Durasi</th>
                            <th className="p-3 w-[10%] text-center">Lembur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timesheetRecords.map((r, idx) => (
                            <tr key={r.id || idx} className="border-b border-slate-100 hover:bg-slate-50/30">
                              <td className="p-3 font-bold text-slate-700">
                                {format(new Date(r.check_in_time), "EEEE, dd MMM yyyy", { locale: id })}
                              </td>
                              <td className="p-3 text-emerald-600 font-bold">
                                {format(new Date(r.check_in_time), "HH:mm")}
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
                                {r.check_out_time ? format(new Date(r.check_out_time), "HH:mm") : "-"}
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
                                {formatMinutesToHoursMins(getOvertimeMinutes(r.check_in_time, r.check_out_time))}
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
    </div>
  );
}

function SummaryCard({ label, value, icon, sub, highlight = false }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all ${highlight ? 'bg-[#003366] text-white border-blue-900 shadow-xl shadow-blue-900/20' : 'bg-white text-slate-800 border-slate-100 shadow-sm'}`}>
       <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${highlight ? 'bg-white/10' : 'bg-slate-50'}`}>
             {React.cloneElement(icon as React.ReactElement, { size: 24 })}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Active</div>
       </div>
       <div className="space-y-1">
          <h4 className="text-4xl font-black tracking-tighter">{value}</h4>
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">{label}</p>
       </div>
       <div className={`mt-6 pt-6 border-t ${highlight ? 'border-white/10' : 'border-slate-50'} flex items-center gap-2`}>
          <div className={`w-1.5 h-1.5 rounded-full ${highlight ? 'bg-emerald-400' : 'bg-blue-500'}`} />
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{sub}</p>
       </div>
    </div>
  );
}
