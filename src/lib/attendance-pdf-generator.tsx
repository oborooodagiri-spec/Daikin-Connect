"use client";

import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

interface UserInfo {
  id: number;
  name: string;
  email: string;
  company_name?: string | null;
}

interface AttendanceRecord {
  id: number;
  check_in_time: string;
  check_out_time: string | null;
  check_in_lat: number | null;
  check_in_long: number | null;
  check_out_lat: number | null;
  check_out_long: number | null;
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

export async function generateAttendancePDF(
  user: UserInfo,
  records: AttendanceRecord[],
  selectedMonth: Date,
  projectName?: string
) {
  const { ReportBase } = await import("@/components/ReportBase");
  const { createRoot } = await import("react-dom/client");

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();

  const monthName = format(selectedMonth, "MMMM yyyy", { locale: id });
  
  // Calculate total hours and overtime
  let totalMinutes = 0;
  let totalOvertimeMinutes = 0;
  
  records.forEach((r) => {
    if (r.check_in_time && r.check_out_time) {
      const diff = new Date(r.check_out_time).getTime() - new Date(r.check_in_time).getTime();
      const diffMins = Math.floor(diff / 60000);
      totalMinutes += diffMins;

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
      if (ot > 0) totalOvertimeMinutes += Math.min(diffMins, ot);
    }
  });

  const totalHoursStr = `${Math.floor(totalMinutes / 60)} Jam ${totalMinutes % 60} Menit`;
  const totalOvertimeStr = totalOvertimeMinutes > 0 
    ? `${Math.floor(totalOvertimeMinutes / 60)} Jam ${totalOvertimeMinutes % 60} Menit`
    : "0 Jam 0 Menit";

  // Format date helper
  const formatDateFull = (dateStr: string) => {
    return format(new Date(dateStr), "EEEE, dd MMM yyyy", { locale: id });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "HH:mm");
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

    const overtime = diffMins - standardWorkMinutes;
    const actualOvertime = Math.min(diffMins, overtime);
    if (actualOvertime > 0) {
      const hrs = Math.floor(actualOvertime / 60);
      const mins = actualOvertime % 60;
      return `${hrs} Jam ${mins} Menit`;
    }
    return "0 Jam 0 Menit";
  };

  const getMapsLink = (lat: number | null, lng: number | null) => {
    if (lat === null || lng === null) return "-";
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  // Adaptive record chunking:
  // If total records <= 15: all fit on Page 1 (with title, metadata, stats, table, and signatures)!
  // If total records > 15:
  // Page 1 gets up to 16 records (title, metadata, stats, table - no signatures).
  // Subsequent pages don't have title, metadata, or stats (minimalHeader={true}).
  // Middle pages take up to 28 records; the last page (with signatures) takes up to 22 records.
  const pageChunks: AttendanceRecord[][] = [];
  const tempRecords = [...records];
  
  if (tempRecords.length <= 15) {
    pageChunks.push(tempRecords);
  } else {
    pageChunks.push(tempRecords.splice(0, 16));
    while (tempRecords.length > 0) {
      if (tempRecords.length <= 22) {
        pageChunks.push(tempRecords.splice(0, tempRecords.length));
      } else {
        pageChunks.push(tempRecords.splice(0, 28));
      }
    }
  }

  const totalPages = pageChunks.length;

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();

    const pageDiv = document.createElement("div");
    pageDiv.style.width = "210mm";
    pageDiv.style.height = "297mm";
    pageDiv.style.position = "absolute";
    pageDiv.style.left = "-9999px";
    pageDiv.style.top = "-9999px";
    pageDiv.style.background = "#ffffff";
    document.body.appendChild(pageDiv);

    const root = createRoot(pageDiv);

    const isLastPage = i === totalPages - 1;
    const pageRecords = pageChunks[i];

    await new Promise<void>((resolve) => {
      root.render(
        <ReportBase
          reportTitle="TIMESHEET"
          projectName={i === 0 ? monthName.toUpperCase() : undefined}
          pageNumber={i + 1}
          totalPages={totalPages}
          isFixedHeight={true}
          minimalHeader={i > 0}
        >
          <div className="py-2.5 space-y-3 text-slate-800">
            {/* Header info - ONLY ON PAGE 1 */}
            {i === 0 && (
              <>
                {/* Personnel & Project Metadata */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs font-sans">
                  <div className="space-y-1.5">
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[8px]">Nama Lengkap</p>
                      <p className="text-xs font-black text-slate-800 uppercase">{user.name}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[8px]">Email Akun</p>
                      <p className="text-[10px] font-bold text-slate-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[8px]">Perusahaan / Subkontraktor</p>
                      <p className="text-xs font-black text-slate-800 uppercase">{user.company_name || "Independent / Internal"}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[8px]">Nama Project</p>
                      <p className="text-[10px] font-bold text-[#00a1e4] uppercase tracking-wider">{projectName || "Semua Proyek"}</p>
                    </div>
                  </div>
                </div>

                {/* Stats Summary Boxes */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-center">
                    <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest mb-0.5">Total Hari Hadir</p>
                    <p className="text-base font-black text-emerald-800">{records.length} Hari</p>
                  </div>
                  <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 text-center">
                    <p className="text-[8px] font-black text-blue-700 uppercase tracking-widest mb-0.5">Total Durasi Kerja</p>
                    <p className="text-base font-black text-blue-800 truncate">{totalHoursStr}</p>
                  </div>
                  <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 text-center">
                    <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mb-0.5">Overtime</p>
                    <p className="text-base font-black text-amber-800 truncate">{totalOvertimeStr}</p>
                  </div>
                </div>
              </>
            )}

            {/* Attendance Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden font-sans">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[8.5px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-2 px-3 w-[18%]">Tanggal</th>
                    <th className="py-2 px-3 w-[16%]">Proyek</th>
                    <th className="py-2 px-3 w-[12%]">Masuk</th>
                    <th className="py-2 px-3 w-[12%]">Keluar</th>
                    <th className="py-2 px-3 w-[11%] text-center">Durasi</th>
                    <th className="py-2 px-3 w-[11%] text-center">Overtime</th>
                    <th className="py-2 px-3 w-[20%]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRecords.map((r, index) => (
                    <tr key={r.id || index} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-bold text-slate-700 whitespace-nowrap text-[10px]">
                        {formatDateFull(r.check_in_time)}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-[#003366] uppercase text-[9px] truncate max-w-[110px] block" title={r.projects?.name || "-"}>
                          {r.projects?.name || "-"}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold">
                        <div className="flex flex-col text-emerald-600 leading-tight">
                          <span className="text-[10px] font-black">{formatTime(r.check_in_time)}</span>
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
                               const diffStr = hrs > 0 ? (mins > 0 ? `${hrs}j ${mins}m` : `${hrs}j`) : `${mins}m`;
                               return (
                                  <span className="inline-block mt-0.5 text-[6.5px] font-black text-rose-600 uppercase tracking-wide bg-rose-50 px-1 py-0.2 rounded border border-rose-100 w-max">
                                     +Terlambat {diffStr}
                                  </span>
                               );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-bold">
                        <div className="flex flex-col text-rose-600 leading-tight">
                          <span className="text-[10px] font-black">{formatTime(r.check_out_time)}</span>
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
                               const diffStr = hrs > 0 ? (mins > 0 ? `${hrs}j ${mins}m` : `${hrs}j`) : `${mins}m`;
                               return (
                                  <span className="inline-block mt-0.5 text-[6.5px] font-black text-rose-600 uppercase tracking-wide bg-rose-50 px-1 py-0.2 rounded border border-rose-100 w-max">
                                     Cepat {diffStr}
                                  </span>
                               );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-black text-slate-800 text-center whitespace-nowrap text-[10px]">
                        {getDuration(r)}
                      </td>
                      <td className="py-2 px-3 font-black text-amber-700 text-center whitespace-nowrap text-[10px]">
                        {getOvertimeStr(r)}
                      </td>
                      <td className="py-2 px-3 text-[8.5px] font-medium text-slate-600 max-w-[130px] break-words">
                        {r.check_out_notes || r.check_in_notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures at bottom - ONLY ON LAST PAGE */}
            {isLastPage && (
              <div className="pt-4 mt-6 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center space-y-8">
                    <p className="text-[7.5px] font-black text-[#003366] uppercase tracking-widest">
                      Tanda Tangan Personel
                    </p>
                    <div className="border-b border-dashed border-slate-300 w-40 mx-auto pb-1">
                      <p className="text-[9px] font-black uppercase text-slate-800">{user.name}</p>
                    </div>
                  </div>
                  <div className="text-center space-y-8">
                    <p className="text-[7.5px] font-black text-[#003366] uppercase tracking-widest">
                      Penyetuju / Koordinator Lapangan
                    </p>
                    <div className="border-b border-dashed border-slate-300 w-40 mx-auto pb-1">
                      <p className="text-[9px] font-black uppercase text-slate-800">Site Supervisor / HR</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </ReportBase>
      );
      setTimeout(resolve, 300);
    });

    const canvas = await html2canvas(pageDiv, {
      scale: 1.5,
      useCORS: true,
      windowWidth: 794,
      height: 1123,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.85);
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, A4_HEIGHT_MM, undefined, "FAST");

    root.unmount();
    document.body.removeChild(pageDiv);
  }

  const filename = `AttendanceReport_${user.name.replace(/\s+/g, "_")}_${format(selectedMonth, "yyyy_MM")}.pdf`;
  pdf.save(filename);
}
