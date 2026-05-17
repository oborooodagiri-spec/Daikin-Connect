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
  Calendar, User, ChevronLeft, ChevronRight, List, FileText, CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

export default function AttendanceRecordsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab/View selection: "all" (All Activity Logs) or "timesheet" (Monthly Timesheet per Person)
  const [activeView, setActiveView] = useState<"all" | "timesheet">("all");
  
  // Timesheet View States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [timesheetRecords, setTimesheetRecords] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loadingTimesheet, setLoadingTimesheet] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // 1. Fetch All Raw Logs (Original View)
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

  // 2. Fetch Users List for Dropdown Selection
  useEffect(() => {
    async function loadUsers() {
      const res = await getAttendanceUsers(projectId);
      if (res && "success" in res && res.success) {
        setUsersList(res.data);
        if (res.data.length > 0) {
          setSelectedUserId(res.data[0].id);
        }
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

  const getDurationStr = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "Sedang Berlangsung";
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.round((diffMs % 3600000) / 60000);
    return `${hrs} jam ${mins} menit`;
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

  // Timesheet Summary Stats
  const totalMinutes = timesheetRecords.reduce((acc, r) => {
    if (r.check_in_time && r.check_out_time) {
      return acc + Math.floor((new Date(r.check_out_time).getTime() - new Date(r.check_in_time).getTime()) / 60000);
    }
    return acc;
  }, 0);
  const totalHoursStr = `${Math.floor(totalMinutes / 60)} Jam ${totalMinutes % 60} Menit`;

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
        ) : (
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

      {/* Tabs Switch */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveView("all")}
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

      {/* View 2: MONTHLY TIMESHEET PER PERSON (Requested view) */}
      {activeView === "timesheet" && (
        <div className="space-y-6">
          {/* Controls row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Person selector */}
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <User size={14} className="text-[#00a1e4]" /> Select Personnel
              </label>
              <select
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold p-3 rounded-xl focus:outline-none focus:border-[#003366] transition-colors"
              >
                {usersList.length === 0 ? (
                  <option value="">No Active Personnel Found</option>
                ) : (
                  usersList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.company_name || 'Independent'})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Month Picker */}
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-2 justify-between">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Calendar size={14} className="text-[#00a1e4]" /> Select Month & Year
              </label>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-black text-slate-700 uppercase tracking-wide">
                  {format(selectedMonth, "MMMM yyyy", { locale: id })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Summary metrics bar */}
          {selectedUserId !== null && timesheetRecords.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Hari Hadir</p>
                  <p className="text-lg font-black text-emerald-800">{timesheetRecords.length} Hari</p>
                </div>
              </div>
              <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Total Durasi Kerja</p>
                  <p className="text-lg font-black text-blue-800">{totalHoursStr}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timesheet List Table */}
          <div className="bg-white border text-sm border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loadingTimesheet ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="animate-spin text-[#00a1e4]" size={32} />
                <p className="text-xs font-bold uppercase tracking-wider">Loading Timesheet...</p>
              </div>
            ) : timesheetRecords.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No Attendance Records Found for this Month</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Jam Masuk</th>
                      <th className="p-4">Titik Lokasi Masuk</th>
                      <th className="p-4">Jam Keluar</th>
                      <th className="p-4">Titik Lokasi Keluar</th>
                      <th className="p-4 text-center">Durasi Kerja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timesheetRecords.map((r) => (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-800">
                          {format(new Date(r.check_in_time), "EEEE, dd MMMM yyyy", { locale: id })}
                        </td>
                        <td className="p-4 font-black text-emerald-600">
                          {format(new Date(r.check_in_time), "HH:mm")}
                        </td>
                        <td className="p-4">
                          {r.check_in_lat !== null ? (
                            <a
                              href={getMapsLink(r.check_in_lat, r.check_in_long)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#00a1e4] hover:underline font-bold flex items-center gap-1"
                            >
                              <MapPin size={12} /> {r.check_in_lat.toFixed(4)}, {r.check_in_long.toFixed(4)}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-4 font-black text-rose-600">
                          {r.check_out_time ? format(new Date(r.check_out_time), "HH:mm") : "-"}
                        </td>
                        <td className="p-4">
                          {r.check_out_lat !== null ? (
                            <a
                              href={getMapsLink(r.check_out_lat, r.check_out_long)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#00a1e4] hover:underline font-bold flex items-center gap-1"
                            >
                              <MapPin size={12} /> {r.check_out_lat.toFixed(4)}, {r.check_out_long.toFixed(4)}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-4 font-black text-slate-700 text-center">
                          {getDurationStr(r.check_in_time, r.check_out_time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
