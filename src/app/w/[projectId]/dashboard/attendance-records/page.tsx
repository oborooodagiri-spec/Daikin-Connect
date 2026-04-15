"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAttendanceRecords } from "@/app/actions/attendanceAdmin";
import { MapPin, Clock, FileImage, ShieldCheck, Download, Loader2 } from "lucide-react";

export default function AttendanceRecordsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAttendanceRecords(projectId);
      if (res && "success" in res && res.success) {
        setRecords(res.data);
      }
      setLoading(false);
    }
    load();
  }, [projectId]);

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const handleExport = () => {
    // Basic CSV export logic
    const header = "Name,Project,Check In,Check In Loc,Check Out,Check Out Loc,Subcontractor\n";
    const csv = records.map(r => {
      return `"${r.users?.name || 'Unknown'}","${r.projects?.name || ''}","${formatDate(r.check_in)}","${r.check_in_lat},${r.check_in_lng}","${formatDate(r.check_out)}","${r.check_out_lat},${r.check_out_lng}","${r.subcontractor_company || '-'}"`;
    }).join("\n");
    
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_Records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="p-12 flex justify-center items-center"><Loader2 className="animate-spin text-[#00a1e4]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#003366] uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" /> Administrative Attendance
          </h1>
          <p className="text-sm font-bold text-slate-400">Strictly administrative views for vendor presence.</p>
        </div>
        <button onClick={handleExport} className="px-6 py-3 bg-[#003366] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-900 transition-colors shadow-lg flex items-center gap-2">
          <Download size={14} /> Export CSV
        </button>
      </div>

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
                         <Clock size={12} /> {formatDate(r.check_in)}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 mt-1 uppercase tracking-wider">
                         <MapPin size={10} /> {r.check_in_lat?.toFixed(4)}, {r.check_in_lng?.toFixed(4)}
                      </div>
                    </td>
                    <td className="p-4">
                      {r.check_out ? (
                        <>
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                             <Clock size={12} /> {formatDate(r.check_out)}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 mt-1 uppercase tracking-wider">
                             <MapPin size={10} /> {r.check_out_lat?.toFixed(4)}, {r.check_out_lng?.toFixed(4)}
                          </div>
                        </>
                      ) : (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded">Working...</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {r.check_in_photo_url ? (
                        <a href={r.check_in_photo_url} target="_blank" className="inline-block p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                          <FileImage size={16} />
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-4 text-center">
                      {r.check_out_photo_url ? (
                        <a href={r.check_out_photo_url} target="_blank" className="inline-block p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors">
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
    </div>
  );
}
