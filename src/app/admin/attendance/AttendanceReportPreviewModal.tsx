"use client";

import React, { useRef } from "react";
import { X, Printer, Download, Loader2, FileText, Calendar, Building2, User, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

interface AttendanceRecord {
  id: number;
  check_in_time: string;
  check_out_time: string | null;
  check_in_photo?: string | null;
  check_out_photo?: string | null;
  check_in_notes?: string | null;
  check_out_notes?: string | null;
  projects?: {
    name: string;
    shift_start_time?: string;
    shift_end_time?: string;
  } | null;
}

interface AttendanceReportPreviewModalProps {
  user: any;
  records: AttendanceRecord[];
  selectedMonth: Date;
  projectName: string;
  totalHoursStr: string;
  totalOvertimeStr: string;
  onClose: () => void;
  onDownloadPDF: () => Promise<void>;
  exportingPDF: boolean;
}

export default function AttendanceReportPreviewModal({
  user,
  records,
  selectedMonth,
  projectName,
  totalHoursStr,
  totalOvertimeStr,
  onClose,
  onDownloadPDF,
  exportingPDF,
}: AttendanceReportPreviewModalProps) {
  const printSheetRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const safeFormatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEEE, dd MMM yyyy", { locale: id });
    } catch {
      return "-";
    }
  };

  const safeFormatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "HH:mm");
    } catch {
      return "-";
    }
  };

  const getDuration = (r: AttendanceRecord) => {
    if (!r.check_out_time) return "Sesi Aktif";
    const diffMs = new Date(r.check_out_time).getTime() - new Date(r.check_in_time).getTime();
    if (diffMs <= 0) return "-";
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.round((diffMs % 3600000) / 60000);
    return `${hrs} Jam ${mins} Menit`;
  };

  const getOvertimeStr = (r: AttendanceRecord) => {
    if (!r.check_in_time || !r.check_out_time) return "-";
    const inDate = new Date(r.check_in_time);
    const outDate = new Date(r.check_out_time);
    const diffMs = outDate.getTime() - inDate.getTime();
    if (diffMs <= 0) return "-";
    const diffMins = Math.floor(diffMs / 60000);

    let standardWorkMinutes = 480;
    const shiftStart = r.projects?.shift_start_time || "08:00";
    const shiftEnd = r.projects?.shift_end_time || "17:00";
    const [sh, sm] = shiftStart.split(":").map(Number);
    const [eh, em] = shiftEnd.split(":").map(Number);
    let shiftDiff = (eh * 60 + em) - (sh * 60 + sm);
    if (shiftDiff < 0) shiftDiff += 1440;
    if (shiftDiff > 360) standardWorkMinutes = shiftDiff - 60;
    else if (shiftDiff > 0) standardWorkMinutes = shiftDiff;
    if (standardWorkMinutes <= 0) standardWorkMinutes = 480;

    const ot = diffMins - standardWorkMinutes;
    const actualOvertime = Math.min(diffMins, ot);
    if (actualOvertime > 0) {
      const hrs = Math.floor(actualOvertime / 60);
      const mins = actualOvertime % 60;
      return `${hrs} Jam ${mins} Menit`;
    }
    return "0 Jam 0 Menit";
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-start p-2 sm:p-6 overflow-y-auto">
      {/* Top Modal Control Bar */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-2 z-20">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Preview Laporan Timesheet
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
              {user?.name} • Periode {format(selectedMonth, "MMMM yyyy", { locale: id })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            title="Cetak langsung dokumen via printer / dialog print browser"
          >
            <Printer size={15} className="text-[#003366]" />
            Cetak (Print)
          </button>

          <button
            onClick={onDownloadPDF}
            disabled={exportingPDF}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            title="Download file PDF resmi ke komputer"
          >
            {exportingPDF ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Download PDF
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Tutup Preview"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="w-full flex justify-center pb-12">
        <div
          ref={printSheetRef}
          id="modal-printable-sheet"
          className="w-[210mm] min-h-[297mm] bg-white border border-slate-300 rounded-2xl shadow-2xl p-10 sm:p-12 font-sans text-slate-800 relative flex flex-col justify-between shrink-0"
        >
          <div className="space-y-6">
            {/* Branding Header */}
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
              <h2 className="text-2xl font-black text-[#003366] uppercase tracking-widest">
                TIMESHEET
              </h2>
              <span className="inline-block bg-sky-50 text-[#003366] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded border border-sky-100">
                {format(selectedMonth, "MMMM yyyy", { locale: id })}
              </span>
            </div>

            {/* Personnel & Project Metadata */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2.5">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nama Lengkap</p>
                  <p className="font-black text-slate-800 uppercase text-xs">{user?.name}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Akun</p>
                  <p className="font-bold text-slate-600 text-xs">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Perusahaan / Subkontraktor</p>
                  <p className="font-black text-slate-800 uppercase text-xs">{user?.company_name || "Internal / Vendor"}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nama Project</p>
                  <p className="font-bold text-[#00a1e4] uppercase text-xs tracking-wider">{projectName}</p>
                </div>
              </div>
            </div>

            {/* Stats Summary Boxes */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-center">
                <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest mb-0.5">Total Hari Hadir</p>
                <p className="text-base font-black text-emerald-800">{records.length} Hari</p>
              </div>
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-center">
                <p className="text-[8px] font-black text-blue-700 uppercase tracking-widest mb-0.5">Total Durasi Kerja</p>
                <p className="text-base font-black text-blue-800 truncate">{totalHoursStr}</p>
              </div>
              <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100 text-center">
                <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mb-0.5">Overtime</p>
                <p className="text-base font-black text-amber-800 truncate">{totalOvertimeStr}</p>
              </div>
            </div>

            {/* Timesheet Clean Table (NO GPS coordinates) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[8px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="p-2.5 w-[18%]">Tanggal</th>
                    <th className="p-2.5 w-[18%]">Proyek</th>
                    <th className="p-2.5 w-[12%]">Masuk</th>
                    <th className="p-2.5 w-[12%]">Keluar</th>
                    <th className="p-2.5 w-[10%] text-center">Durasi</th>
                    <th className="p-2.5 w-[10%] text-center">Overtime</th>
                    <th className="p-2.5 w-[20%]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 text-xs font-bold uppercase">
                        Tidak Ada Data Kehadiran
                      </td>
                    </tr>
                  ) : (
                    records.map((r, idx) => (
                      <tr key={r.id || idx} className="hover:bg-slate-50/40">
                        <td className="p-2.5 font-bold text-slate-700 text-[10px]">
                          {safeFormatDate(r.check_in_time)}
                        </td>
                        <td className="p-2.5 font-bold text-[#003366] uppercase text-[10px]">
                          {r.projects?.name || "-"}
                        </td>
                        <td className="p-2.5 font-bold text-[10px]">
                          <div className="flex flex-col text-emerald-600">
                            <span>{safeFormatTime(r.check_in_time)}</span>
                            {(() => {
                              if (!r.check_in_time) return null;
                              const checkIn = new Date(r.check_in_time);
                              const shiftStart = r.projects?.shift_start_time || "08:00";
                              const [sh, sm] = shiftStart.split(":").map(Number);
                              const checkInMins = checkIn.getHours() * 60 + checkIn.getMinutes();
                              const shiftMins = sh * 60 + sm;
                              if (checkInMins > shiftMins) {
                                const diff = checkInMins - shiftMins;
                                const hrs = Math.floor(diff / 60);
                                const mins = diff % 60;
                                const diffStr = hrs > 0 ? (mins > 0 ? `${hrs} Jam ${mins} Menit` : `${hrs} Jam`) : `${mins} Menit`;
                                return (
                                  <span className="inline-block mt-0.5 text-[7px] font-black text-rose-600 uppercase tracking-wide bg-rose-50 px-1 py-0.5 rounded border border-rose-100 w-max">
                                    Terlambat {diffStr}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>
                        <td className="p-2.5 text-rose-600 font-bold text-[10px]">
                          <div className="flex flex-col">
                            <span>{safeFormatTime(r.check_out_time)}</span>
                            {(() => {
                              if (!r.check_out_time) return null;
                              const checkOut = new Date(r.check_out_time);
                              const shiftEnd = r.projects?.shift_end_time || "17:00";
                              const [eh, em] = shiftEnd.split(":").map(Number);
                              const checkOutMins = checkOut.getHours() * 60 + checkOut.getMinutes();
                              const shiftMins = eh * 60 + em;
                              if (checkOutMins < shiftMins) {
                                const diff = shiftMins - checkOutMins;
                                const hrs = Math.floor(diff / 60);
                                const mins = diff % 60;
                                const diffStr = hrs > 0 ? (mins > 0 ? `${hrs} Jam ${mins} Menit` : `${hrs} Jam`) : `${mins} Menit`;
                                return (
                                  <span className="inline-block mt-0.5 text-[7px] font-black text-rose-600 uppercase tracking-wide bg-rose-50 px-1 py-0.5 rounded border border-rose-100 w-max">
                                    Cepat {diffStr}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>
                        <td className="p-2.5 font-black text-slate-800 text-center text-[10px]">
                          {getDuration(r)}
                        </td>
                        <td className="p-2.5 font-black text-amber-700 text-center text-[10px]">
                          {getOvertimeStr(r)}
                        </td>
                        <td className="p-2.5 text-[9px] font-medium text-slate-600 max-w-[150px] break-words">
                          {r.check_out_notes || r.check_in_notes || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures at Bottom */}
          {records.length > 0 && (
            <div className="pt-8 mt-12 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-10">
                <div className="text-center space-y-16">
                  <p className="text-[8px] font-black text-[#003366] uppercase tracking-widest">
                    Tanda Tangan Personel
                  </p>
                  <div className="border-b border-dashed border-slate-300 w-44 mx-auto pb-1">
                    <p className="text-[10px] font-black uppercase text-slate-800">{user?.name}</p>
                  </div>
                </div>

                <div className="text-center space-y-16">
                  <p className="text-[8px] font-black text-[#003366] uppercase tracking-widest">
                    Penyetuju / Koordinator Lapangan
                  </p>
                  <div className="border-b border-dashed border-slate-300 w-44 mx-auto pb-1">
                    <p className="text-[10px] font-black uppercase text-slate-800">Site Supervisor / HR</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
