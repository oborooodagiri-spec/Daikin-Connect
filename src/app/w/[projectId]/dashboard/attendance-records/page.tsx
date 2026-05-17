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
  Search, ArrowLeft, Building2, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

export default function AttendanceRecordsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  
  // Base states
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View toggle: "all" (All Activity Logs) or "timesheet" (Monthly Timesheet per Person)
  const [activeView, setActiveView] = useState<"all" | "timesheet">("all");
  
  // Timesheet View States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [timesheetRecords, setTimesheetRecords] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loadingTimesheet, setLoadingTimesheet] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // 1. Fetch All Raw Logs (Original chronological view)
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

  // 2. Fetch Active Users List for Dropdown
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

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const handleExportCSV = () => {
    const header = "Name,Project,Check In,Check In Loc,Check Out,Check Out Loc,Subcontractor\n";
    const csv = records.map(r => {
      return `"${r.users?.name || 'Unknown'}","${r.projects?.name || ''}","${formatDate(r.check_in_time)}","${r.check_in_lat},${r.check_in_long}","${formatDate(r.check_out_time)}","${r.check_out_lat},${r.check_out_long}","${r.subcontractor_company || '-'}"`;
    }).join("\n");
    
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_Records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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

  // Calculations for stats summary
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

  // Filter users list by search input
  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUserObject = usersList.find(u => u.id === selectedUserId);

  if (loading) {
    return <div className="p-12 flex justify-center items-center"><Loader2 className="animate-spin text-[#00a1e4]" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#003366] uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" /> Administrative Attendance
          </h1>
          <p className="text-sm font-bold text-slate-400">Strictly administrative views for vendor presence and timesheets.</p>
        </div>
        
        {activeView === "all" ? (
          <button 
            onClick={handleExportCSV} 
            className="px-6 py-3 bg-[#003366] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-900 transition-colors shadow-lg flex items-center gap-2"
          >
            <Download size={14} /> Export CSV
          </button>
        ) : selectedUserId !== null ? (
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
        ) : null}
      </div>

      {/* Tabs Switch */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveView("all");
            setSelectedUserId(null); // Reset user selection when swapping tabs
          }}
          className={`py-3 px-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
            activeView === "all"
              ? "border-[#003366] text-[#003366]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <List size={16} /> All Activity Logs
        </button>
        <button
          onClick={() => setActiveView("timesheet")}
          className={`py-3 px-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
            activeView === "timesheet"
              ? "border-[#003366] text-[#003366]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <FileText size={16} /> Monthly Timesheet per Person
        </button>
      </div>

      {/* View 1: ALL ACTIVITY LOGS (Original view) */}
      {activeView === "all" && (
        <div className="bg-white border text-sm border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                  <th className="p-4">Personnel</th>
                  <th className="p-4">Project Workspace</th>
                  <th className="p-4">Check IN</th>
                  <th className="p-4">Check OUT</th>
                  <th className="p-4 text-center">In Photo</th>
                  <th className="p-4 text-center">Out Photo</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      No Attendance Records Found
                    </td>
                  </tr>
                ) : (
                  records.map(r => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{r.users?.name}</p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase">{r.subcontractor_company || 'Independent'}</p>
                      </td>
                      <td className="p-4 font-bold text-slate-600">
                        {r.projects?.name || "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                           <Clock size={12} /> {formatDate(r.check_in_time)}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 mt-1 uppercase tracking-wider">
                           <MapPin size={10} /> {r.check_in_lat?.toFixed(4)}, {r.check_in_long?.toFixed(4)}
                        </div>
                      </td>
                      <td className="p-4">
                        {r.check_out_photo && r.check_out_photo !== "" ? (
                          <>
                            <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                               <Clock size={12} /> {formatDate(r.check_out_time)}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 mt-1 uppercase tracking-wider">
                               <MapPin size={10} /> {r.check_out_lat?.toFixed(4)}, {r.check_out_long?.toFixed(4)}
                            </div>
                          </>
                        ) : (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded">Working...</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {r.check_in_photo ? (
                          <a href={r.check_in_photo} target="_blank" className="inline-block p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                            <FileImage size={16} />
                          </a>
                        ) : "-"}
                      </td>
                      <td className="p-4 text-center">
                        {r.check_out_photo ? (
                          <a href={r.check_out_photo} target="_blank" className="inline-block p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors">
                            <FileImage size={16} />
                          </a>
                        ) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: MONTHLY TIMESHEET PER PERSON (Grouped View) */}
      {activeView === "timesheet" && (
        <div className="space-y-6">
          
          {/* A. PERSONNEL SELECTOR SCREEN */}
          {selectedUserId === null ? (
            <div className="space-y-6">
              {/* Personnel Search & Filter */}
              <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search personnel name, email or subcontractor company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#003366] transition-colors"
                  />
                </div>
                <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Total Active Personnel: {filteredUsers.length}
                </div>
              </div>

              {/* Personnel Grid */}
              {filteredUsers.length === 0 ? (
                <div className="bg-white p-12 text-center text-slate-400 border border-slate-200 rounded-2xl">
                  <User size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">No Active Personnel Match Your Search</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map(u => (
                    <div 
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className="bg-white border border-slate-200 hover:border-[#003366] hover:shadow-md p-5 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#003366] flex items-center justify-center font-black uppercase text-sm group-hover:bg-[#003366] group-hover:text-white transition-all">
                          {u.name.substring(0, 2)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-black text-slate-800 uppercase tracking-tight group-hover:text-[#003366] transition-colors text-sm">{u.name}</h3>
                          <p className="text-xs font-bold text-slate-400">{u.email}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Building2 size={10} className="text-[#00a1e4]" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                              {u.company_name || 'Independent'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-[#003366] group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            
            /* B. DETAILED TIMESHEET PRINT-PREVIEW SCREEN */
            <div className="space-y-6">
              {/* Back & Period Selector Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setSelectedUserId(null);
                    setTimesheetRecords([]);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  <ArrowLeft size={14} /> Back to Personnel List
                </button>

                {/* Period Slider */}
                <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl shadow-sm min-w-[220px]">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    {format(selectedMonth, "MMMM yyyy", { locale: id })}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* HIGH-FIDELITY PRINT PREVIEW CONTAINER */}
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 md:p-8 flex justify-center overflow-x-auto shadow-inner">
                
                {/* Visual A4 Document Sheet */}
                <div className="w-[210mm] min-h-[297mm] bg-white border border-slate-300 rounded-lg shadow-2xl p-10 font-sans text-slate-800 relative flex flex-col justify-between shrink-0">
                  
                  <div className="space-y-6">
                    {/* 1. Header Branding Block */}
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

                    {/* 2. Document Title */}
                    <div className="text-center space-y-1">
                      <h2 className="text-lg font-black text-[#003366] uppercase tracking-widest">LAPORAN TIMESHEET RIWAYAT ABSENSI</h2>
                      <span className="inline-block bg-sky-50 text-[#003366] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded border border-sky-100">
                        {format(selectedMonth, "MMMM yyyy", { locale: id })}
                      </span>
                    </div>

                    {/* 3. Metadata Table Grid */}
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

                    {/* 4. Stats Summary Cards */}
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

                    {/* 5. Timesheet Table */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      {loadingTimesheet ? (
                        <div className="p-16 flex flex-col items-center justify-center gap-2 text-slate-400">
                          <Loader2 className="animate-spin text-[#00a1e4]" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Loading Records...</p>
                        </div>
                      ) : timesheetRecords.length === 0 ? (
                        <div className="p-16 text-center text-slate-400">
                          <Calendar size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No Attendance Data Found</p>
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs border-collapse">
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

                  {/* 6. Sign-off / Footers */}
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
      )}
    </div>
  );
}
