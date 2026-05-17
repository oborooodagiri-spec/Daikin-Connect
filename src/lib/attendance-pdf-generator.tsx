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
  projects?: {
    name: string;
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
  
  // Calculate total hours
  let totalMinutes = 0;
  records.forEach((r) => {
    if (r.check_in_time && r.check_out_time) {
      const diff = new Date(r.check_out_time).getTime() - new Date(r.check_in_time).getTime();
      totalMinutes += Math.floor(diff / 60000);
    }
  });
  const totalHoursStr = `${Math.floor(totalMinutes / 60)} Jam ${totalMinutes % 60} Menit`;

  // Format date helper
  const formatDateFull = (dateStr: string) => {
    return format(new Date(dateStr), "EEEE, dd MMM yyyy", { locale: id });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "HH:mm");
  };

  const getDuration = (r: AttendanceRecord) => {
    if (!r.check_out_time) return "Sedang Berlangsung";
    const diffMs = new Date(r.check_out_time).getTime() - new Date(r.check_in_time).getTime();
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.round((diffMs % 3600000) / 60000);
    return `${hrs}j ${mins}m`;
  };

  const getMapsLink = (lat: number | null, lng: number | null) => {
    if (lat === null || lng === null) return "-";
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  // Split records across pages to prevent overflow
  // Page 1 can fit around 14 records along with the User Information & Summary cards.
  // Subsequent pages can fit around 20 records.
  const pageChunks: AttendanceRecord[][] = [];
  let tempRecords = [...records];
  
  if (tempRecords.length <= 14) {
    pageChunks.push(tempRecords);
  } else {
    pageChunks.push(tempRecords.splice(0, 14));
    while (tempRecords.length > 0) {
      pageChunks.push(tempRecords.splice(0, 18));
    }
  }

  const totalPages = pageChunks.length;

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();

    const pageDiv = document.createElement("div");
    pageDiv.style.width = "210mm";
    pageDiv.style.height = "297mm";
    pageDiv.style.position = "fixed";
    pageDiv.style.top = "0";
    pageDiv.style.left = "0";
    pageDiv.style.zIndex = "-1000";
    pageDiv.style.opacity = "0";
    pageDiv.style.pointerEvents = "none";
    document.body.appendChild(pageDiv);

    const root = createRoot(pageDiv);

    const isLastPage = i === totalPages - 1;
    const pageRecords = pageChunks[i];

    await new Promise<void>((resolve) => {
      root.render(
        <ReportBase
          reportTitle="LAPORAN RIWAYAT KEHADIRAN BULANAN"
          projectName={projectName || "GLOBAL ATTENDANCE"}
          pageNumber={i + 1}
          totalPages={totalPages}
          isFixedHeight={true}
        >
          <div className="py-6 space-y-6 text-slate-800">
            {/* Header info - ONLY ON PAGE 1 */}
            {i === 0 && (
              <>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-2">
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Nama Lengkap</p>
                    <p className="text-sm font-black text-slate-800 uppercase">{user.name}</p>
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mt-2">Email Akun</p>
                    <p className="text-xs font-bold text-slate-600">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Perusahaan / Subkontraktor</p>
                    <p className="text-sm font-black text-slate-800 uppercase">{user.company_name || "Independent / Internal"}</p>
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mt-2">Periode Laporan</p>
                    <p className="text-xs font-bold text-[#00a1e4] uppercase tracking-wider">{monthName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Total Hari Hadir</p>
                    <p className="text-xl font-black text-emerald-800">{records.length} Hari</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                    <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-1">Total Durasi Kerja</p>
                    <p className="text-xl font-black text-blue-800">{totalHoursStr}</p>
                  </div>
                </div>
              </>
            )}

            {/* Attendance Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden font-sans">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="p-3 w-[25%]">Tanggal</th>
                    <th className="p-3 w-[15%]">Masuk</th>
                    <th className="p-3 w-[20%]">Lokasi Masuk</th>
                    <th className="p-3 w-[15%]">Keluar</th>
                    <th className="p-3 w-[20%]">Lokasi Keluar</th>
                    <th className="p-3 w-[10%] text-center">Durasi</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRecords.map((r, index) => (
                    <tr key={r.id || index} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-700">
                        {formatDateFull(r.check_in_time)}
                      </td>
                      <td className="p-3 text-emerald-600 font-bold">
                        {formatTime(r.check_in_time)}
                      </td>
                      <td className="p-3">
                        {r.check_in_lat !== null ? (
                          <a
                            href={getMapsLink(r.check_in_lat, r.check_in_long)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00a1e4] hover:underline font-bold"
                          >
                            {r.check_in_lat.toFixed(4)}, {r.check_in_long?.toFixed(4)}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 text-rose-600 font-bold">
                        {formatTime(r.check_out_time)}
                      </td>
                      <td className="p-3">
                        {r.check_out_lat !== null ? (
                          <a
                            href={getMapsLink(r.check_out_lat, r.check_out_long)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00a1e4] hover:underline font-bold"
                          >
                            {r.check_out_lat.toFixed(4)}, {r.check_out_long?.toFixed(4)}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 font-black text-slate-800 text-center">
                        {getDuration(r)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Block - ONLY ON LAST PAGE */}
            {isLastPage && (
              <div className="pt-8 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-10">
                  <div className="text-center space-y-16">
                    <p className="text-[9px] font-black text-[#003366] uppercase tracking-widest">Tanda Tangan Personel</p>
                    <div className="w-40 h-16 border-b border-slate-200 mx-auto relative flex items-end justify-center">
                      <span className="absolute -bottom-5 text-[8px] font-bold text-slate-400 uppercase">( {user.name} )</span>
                    </div>
                  </div>

                  <div className="text-center space-y-16">
                    <p className="text-[9px] font-black text-[#003366] uppercase tracking-widest">Verifikasi HRD / Supervisor</p>
                    <div className="w-40 h-16 border-b border-slate-200 mx-auto relative flex items-end justify-center">
                      <span className="absolute -bottom-5 text-[8px] font-bold text-slate-400 uppercase">( PT Daikin Applied Solutions )</span>
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
