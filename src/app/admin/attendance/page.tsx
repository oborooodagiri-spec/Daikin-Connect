"use client";

import React, { useEffect, useState } from "react";
import { getAttendanceRecords } from "@/app/actions/attendanceAdmin";
import { MapPin, Clock, FileImage, ShieldCheck, Download, Loader2 } from "lucide-react";

export default function AttendanceRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Calling without projectId to get global records
      const res = await getAttendanceRecords();
      if (res && "success" in res && res.success) {
        setRecords(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const handleExport = () => {
    // Basic CSV export logic
    const header = "Name,Project,Check In,Check In Loc,Check Out,Check Out Loc,Subcontractor\n";
    const csv = records.map(r => {
      return `"${r.users?.name || 'Unknown'}","${r.projects?.name || ''}","${formatDate(r.check_in_time)}","${r.check_in_lat},${r.check_in_long}","${formatDate(r.check_out_time)}","${r.check_out_lat},${r.check_out_long}","${r.subcontractor_company || '-'}"`;
    }).join("\n");
    
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Global_Attendance_Records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="animate-spin text-[#00a1e4] w-12 h-12" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Global Attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:p-20">
      <div className="max-w-[1400px] mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#003366] uppercase tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-emerald-500 w-10 h-10" /> 
              Global <span className="text-[#00a1e4]">Attendance</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.3em] italic">
              Strictly administrative monitoring for vendor presence across all projects.
            </p>
          </div>
          <button 
            onClick={handleExport} 
            className="px-8 py-4 bg-[#003366] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3"
          >
            <Download size={16} /> Export Global Data
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                  <th className="px-8 py-6">Personnel</th>
                  <th className="px-8 py-6">Project Workspace</th>
                  <th className="px-8 py-6">Check IN</th>
                  <th className="px-8 py-6">Check OUT</th>
                  <th className="px-8 py-6 text-center">In Photo</th>
                  <th className="px-8 py-6 text-center">Out Photo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">
                      No Attendance Records Found
                    </td>
                  </tr>
                ) : (
                  records.map(r => (
                    <tr key={r.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800 text-sm">{r.users?.name}</p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide mt-1">{r.subcontractor_company || 'Independent'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0073ea] rounded-full border border-blue-100 text-[10px] font-black uppercase tracking-tight">
                           {r.projects?.name || "Global"}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                           <Clock size={14} /> {formatDate(r.check_in_time)}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 mt-2 uppercase tracking-wider">
                           <MapPin size={10} /> {r.check_in_lat?.toFixed(6)}, {r.check_in_long?.toFixed(6)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {r.check_out_time ? (
                          <>
                            <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                               <Clock size={14} /> {formatDate(r.check_out_time)}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 mt-2 uppercase tracking-wider">
                               <MapPin size={10} /> {r.check_out_lat?.toFixed(6)}, {r.check_out_long?.toFixed(6)}
                            </div>
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase rounded-full">Active on Site</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center">
                        {r.check_in_photo ? (
                          <a href={r.check_in_photo} target="_blank" className="inline-flex p-3 bg-white border border-slate-100 text-emerald-600 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm">
                            <FileImage size={18} />
                          </a>
                        ) : <span className="text-slate-200">—</span>}
                      </td>
                      <td className="px-8 py-6 text-center">
                        {r.check_out_photo ? (
                          <a href={r.check_out_photo} target="_blank" className="inline-flex p-3 bg-white border border-slate-100 text-rose-600 rounded-2xl hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                            <FileImage size={18} />
                          </a>
                        ) : <span className="text-slate-200">—</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
               <ShieldCheck size={12} /> SECURE ATTENDANCE LOGGING ENFORCED
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
