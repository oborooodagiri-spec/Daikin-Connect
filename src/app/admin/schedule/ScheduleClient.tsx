"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Zap,
  LayoutGrid,
  Info,
  CalendarDays,
  PartyPopper,
  FileSpreadsheet,
  Users,
  Save,
  Filter,
  X,
  Settings,
  ChevronDown,
  Wrench,
  Clock,
  Briefcase,
  UserCheck,
  Printer
} from "lucide-react";
import { getIndonesianHolidays } from "@/app/actions/schedules";
import { getAttendanceForRoster } from "@/app/actions/attendanceAdmin";
import { saveVesSchedule, getVesSchedule } from "@/app/actions/ves_schedule";
import { getAllUsers } from "@/app/actions/users";
import { Search } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

/**
 * Types & Config
 */
type ShiftType = "S1" | "S2" | "S3" | "OFF" | "AM" | "TR" | "MANUAL" | "" | string;
type RoleType = "Resident Engineer" | "STE";

interface Person {
  id: string;
  name: string;
  role: RoleType;
}

interface ScheduleEntry {
  [day: number]: ShiftType;
}

const DEFAULT_SHIFT_INFO: Record<string, { label: string, color: string, textColor: string, duration: number }> = {
  "S1": { label: "07:00-18:00", color: "bg-blue-600", textColor: "text-white", duration: 10 },
  "S2": { label: "15:00-23:00", color: "bg-indigo-600", textColor: "text-white", duration: 7 },
  "S3": { label: "23:00-07:00", color: "bg-slate-800", textColor: "text-white", duration: 7 },
  "OFF": { label: "OFF", color: "bg-rose-100", textColor: "text-rose-600", duration: 0 },
  "AM": { label: "Maint.", color: "bg-emerald-600", textColor: "text-white", duration: 7 },
  "TR": { label: "Test Run", color: "bg-amber-400", textColor: "text-amber-950", duration: 7 },
};

// Calendar for VES LANUD
export default function ScheduleClient() {
  const [viewDate, setViewDate] = useState(new Date());
  const [people, setPeople] = useState<Person[]>([
    { id: "1", name: "Rangga", role: "Resident Engineer" },
    { id: "2", name: "Surya", role: "Resident Engineer" },
    { id: "3", name: "Technician A", role: "STE" },
    { id: "4", name: "Technician B", role: "STE" },
  ]);
  const [schedule, setSchedule] = useState<Record<string, ScheduleEntry>>({});
  const [activeModal, setActiveModal] = useState<"NONE" | "DAILY" | "ANNUAL" | "SHIFT_SETUP">("NONE");
  
  // Enhanced States for Generators
  const [dailyConfig, setDailyConfig] = useState({ 
    shifts: [
      { id: "S1", start: "07:00", end: "18:00", active: true, pattern: [1, 1, 1, 1, 1, 1, 1] }, // Mon-Sun
      { id: "S2", start: "15:00", end: "23:00", active: true, pattern: [1, 1, 1, 1, 1, 0, 0] },
      { id: "S3", start: "23:00", end: "07:00", active: false, pattern: [0, 0, 0, 0, 0, 0, 0] },
    ],
    rotationFrequency: 3,
  });

  const [annualConfig, setAnnualConfig] = useState({
    totalChillers: 5,
    startDay: 1,
    teamIds: [] as string[]
  });

  const [holidays, setHolidays] = useState<any[]>([]);
  const [shiftInfo, setShiftInfo] = useState(DEFAULT_SHIFT_INFO);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportOptionsOpen, setIsExportOptionsOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [exportParams, setExportParams] = useState({
    type: "MONTH" as "MONTH" | "RANGE",
    month: viewDate.getMonth(),
    year: viewDate.getFullYear(),
    startMonth: viewDate.getMonth(),
    startYear: viewDate.getFullYear(),
    endMonth: (viewDate.getMonth() + 1) % 12,
    endYear: viewDate.getFullYear() + (viewDate.getMonth() === 11 ? 1 : 0)
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  
  const [pendingChange, setPendingChange] = useState<{personId: string, day: number, value: ShiftType} | null>(null);
  const [detailPersonId, setDetailPersonId] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const [changeLog, setChangeLog] = useState<any[]>([]);

  /**
   * Action: Save Schedule
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveVesSchedule("4", viewDate.getFullYear(), viewDate.getMonth(), schedule, people, shiftInfo);
      if (res.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.error(res.error || "Failed to save schedule");
      }
    } catch (err) {
      console.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Action: Export PDF
   */
  const handleExportPDF = async () => {
    if (!tableRef.current) return;
    setIsExporting(true);
    setIsExportOptionsOpen(false);

    try {
      const pdf = new jsPDF("l", "mm", "a4");
      let isFirstPage = true;

      if (exportParams.type === "MONTH") {
        await processMonth(pdf, exportParams.month, exportParams.year, true);
      } else {
        // Calculate range of months
        const start = new Date(exportParams.startYear, exportParams.startMonth, 1);
        const end = new Date(exportParams.endYear, exportParams.endMonth, 1);
        
        let current = new Date(start);
        while (current <= end) {
          if (!isFirstPage) pdf.addPage();
          await processMonth(pdf, current.getMonth(), current.getFullYear(), isFirstPage);
          isFirstPage = false;
          // Move to next month
          current.setMonth(current.getMonth() + 1);
          // Safety break if range is too large (e.g. > 12 months)
          if (current.getTime() > start.getTime() + (366 * 24 * 60 * 60 * 1000 * 2)) break; 
        }
      }

      pdf.save(`Schedule_VES_LANUD_Export_${format(new Date(), "yyyyMMdd")}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
    } finally {
      setIsExporting(false);
    }
  };

  const processMonth = async (pdf: jsPDF, month: number, year: number, isFirstPage: boolean) => {
    // 1. Switch View
    setViewDate(new Date(year, month, 1));
    
    // 2. Wait for data loading and UI sync
    await new Promise(r => setTimeout(r, 1800)); // Increased wait for reliability

    // 3. Generate Page
    try {
      // Hide the add personnel row before capture
      const addRow = document.getElementById("add-personnel-row");
      if (addRow) addRow.style.display = "none";

      const canvas = await html2canvas(tableRef.current!, {
        scale: 3, // Increased scale for ultra-clarity
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const table = clonedDoc.getElementById("schedule-table-main");
          if (table) {
            // Force a readable width and taller rows for PDF
            table.style.width = "2800px"; // Wide enough for 31 days clarity
            table.style.transform = "scale(1)";
            
            // Optimize fonts and spacing for PDF visibility
            const cells = table.querySelectorAll("td, th, select");
            cells.forEach((c: any) => {
               c.style.fontSize = "14px";
               c.style.padding = "8px";
            });

            // Ensure manual time entries are visible and large
            const options = table.querySelectorAll("option");
            options.forEach((o: any) => o.style.fontSize = "14px");
          }
        }
      });

      
      if (addRow) addRow.style.display = "";

      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null as any);
          img.src = url;
        });
      };

      const [daikinLogo, eplLogo, wmkLogo] = await Promise.all([
        loadImage("/daikin_logo.png"),
        loadImage("/logo_epl_connect_1.png"),
        loadImage("/logo_wmk.png")
      ]);

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 297;
      const pdfHeight = 210;
      const marginX = 10;
      const marginY = 32;
      const footerSpace = 80;
      const maxImgWidth = pdfWidth - (marginX * 2);
      const maxImgHeight = pdfHeight - marginY - footerSpace;

      const imgRatio = canvas.width / canvas.height;
      let printWidth = maxImgWidth;
      let printHeight = printWidth / imgRatio;

      if (printHeight > maxImgHeight) {
        printHeight = maxImgHeight;
        printWidth = printHeight * imgRatio;
      }

      // --- Header ---
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, 28, "F");
      pdf.setFillColor(0, 51, 102);
      pdf.rect(0, 0, pdfWidth, 2, "F");

      // Logos & Branding (Symmetrical & Proportional)
      const headerLogoHeight = 8; // Target consistent height for both logos
      const headerLogoY = 5;      // Centered Y position
      const headerMargin = 15;    // Standard side margin

      if (daikinLogo) {
        const ratio = daikinLogo.width / daikinLogo.height;
        const h = headerLogoHeight;
        const w = h * ratio;
        pdf.addImage(daikinLogo, "PNG", headerMargin, headerLogoY, w, h);
      }
      
      if (eplLogo) {
        const ratio = eplLogo.width / eplLogo.height;
        const h = headerLogoHeight;
        const w = h * ratio;
        // Position on the right with the same margin
        pdf.addImage(eplLogo, "PNG", pdfWidth - headerMargin - w, headerLogoY, w, h);
      }

      pdf.setDrawColor(220, 225, 230);
      pdf.setLineWidth(0.5);
      pdf.line(10, 18, pdfWidth - 10, 18);

      pdf.setTextColor(0, 51, 102);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("MONTHLY OPERATION SCHEDULE - VES LANUD", 15, 25);
      
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(120, 120, 120);
      const displayDate = new Date(year, month, 1);
      pdf.text(`PERIODE: ${format(displayDate, "MMMM yyyy").toUpperCase()}`, pdfWidth - 15, 25, { align: "right" });

      const xOffset = marginX + (maxImgWidth - printWidth) / 2;
      pdf.addImage(imgData, "PNG", xOffset, marginY, printWidth, printHeight);

      // --- Footer ---
      const dynamicFooterY = marginY + printHeight + 5;
      const footerY = Math.min(dynamicFooterY, pdfHeight - footerSpace + 5); 
      const boxWidth = (pdfWidth - 25) / 3;
      
      pdf.setDrawColor(225, 230, 235);
      pdf.setFillColor(250, 252, 254);
      pdf.roundedRect(10, footerY, boxWidth, 38, 1.5, 1.5, "FD");
      pdf.roundedRect(10 + boxWidth + 2.5, footerY, boxWidth, 38, 1.5, 1.5, "FD");
      pdf.roundedRect(10 + (boxWidth * 2) + 5, footerY, boxWidth, 38, 1.5, 1.5, "FD");

      const titleY = footerY + 6;
      const contentStartY = footerY + 12;
      const lineSpacing = 4.5;

      pdf.setTextColor(0, 51, 102);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(`LEGEND`, 15, titleY);
      
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      
      const customLegend: Record<string, string> = { "OFF": "Libur", "AM": "Chiller Annual Maintenance", "TR": "Test Run" };
      let ly = contentStartY;
      const standardKeys = ["S1", "S2", "S3", "OFF", "AM", "TR"];
      
      standardKeys.forEach(key => {
        const info = shiftInfo[key];
        if (info) {
          pdf.text(`• ${key}: ${customLegend[key] || info.label}`, 15, ly);
          ly += lineSpacing;
        }
      });

      pdf.setTextColor(0, 51, 102);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(`RINCIAN LEMBUR PER PERSONIL`, 15 + boxWidth + 2.5, titleY);
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      
      let currentY = contentStartY;
      const otStats = workloadStats.filter(stat => stat.overtimeHours > 0);
      if (otStats.length === 0) {
        pdf.text(`Tidak ada data lembur`, 15 + boxWidth + 2.5, currentY);
      } else {
        otStats.forEach((stat) => {
          pdf.text(`• ${stat.name}: ${stat.overtimeHours} Jam`, 15 + boxWidth + 2.5, currentY);
          currentY += lineSpacing;
        });
      }

      pdf.setTextColor(0, 51, 102);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(`TOTAL JAM KERJA (PERSONIL)`, 15 + (boxWidth * 2) + 5, titleY);
      
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      
      let summaryY = contentStartY;
      workloadStats.forEach(stat => {
        pdf.setFont("helvetica", "bold");
        pdf.text(`• ${stat.name}: ${stat.totalHours} Jam`, 15 + (boxWidth * 2) + 5, summaryY);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text(`  Masuk Hari Libur: ${stat.holidayWorkDays} Hari`, 15 + (boxWidth * 2) + 5, summaryY + 3.5);
        summaryY += lineSpacing + 2;
      });

      // Signature & System Footer
      const sigY = footerY + 54;
      pdf.setTextColor(0, 51, 102);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Disetujui oleh,", pdfWidth - 40, sigY, { align: "center" });
      
      pdf.setDrawColor(200, 200, 200);
      pdf.line(pdfWidth - 65, sigY + 18, pdfWidth - 15, sigY + 18);
      
      pdf.setFontSize(6);
      pdf.setTextColor(170, 170, 170);
      pdf.text("EPL CONNECT - VALUE ENGINEERING SERVICES PORTAL", 10, pdfHeight - 4);
      pdf.text(`Tgl. Cetak: ${format(new Date(), "dd MMM yyyy HH:mm")}`, pdfWidth - 10, pdfHeight - 4, { align: "right" });

    } catch (err) {
      console.error("Error processing month page", err);
    }
  };

  // Fetch holidays and saved schedule on month change
  React.useEffect(() => {
    async function loadData() {
      // Fallback: Load from LocalStorage first for instant UI
      const localS1 = localStorage.getItem("shift_config_S1");
      const localS2 = localStorage.getItem("shift_config_S2");
      const localS3 = localStorage.getItem("shift_config_S3");
      if (localS1 || localS2 || localS3) {
        setShiftInfo(prev => ({
          ...prev,
          ...(localS1 ? { S1: JSON.parse(localS1) } : {}),
          ...(localS2 ? { S2: JSON.parse(localS2) } : {}),
          ...(localS3 ? { S3: JSON.parse(localS3) } : {}),
        }));
      }

      // Load Holidays
      const holidayRes = await getIndonesianHolidays(viewDate.getFullYear());
      if (holidayRes.success) {
        setHolidays(holidayRes.data);
      }

      // Load Saved Roster
      const [rosterRes, usersRes] = await Promise.all([
        getVesSchedule("4", viewDate.getFullYear(), viewDate.getMonth()),
        getAllUsers()
      ]);
      if (usersRes.success) setAvailableUsers(usersRes.data);
                         </tr>
                       );
                     })}
                     {/* Add Row Button */}
                     <tr id="add-personnel-row">
                         <td className="sticky left-0 bg-white p-4 z-20 border-r border-slate-100">
                            
                             <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                   <button 
                                    onClick={() => setPeople([...people, { id: Date.now().toString(), name: "New RE", role: "Resident Engineer" }])}
                                    className="flex items-center gap-2 text-[#003366] font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-all"
                                   >
                                      <Plus className="w-3 h-3" /> Manual RE
                                   </button>
                                   <button 
                                    onClick={() => setPeople([...people, { id: Date.now().toString(), name: "New STE", role: "STE" }])}
                                    className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest hover:bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl transition-all"
                                   >
                                      <Plus className="w-3 h-3" /> Manual STE
                                   </button>
                                </div>
                                <div className="relative">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                   <input 
                                      type="text" 
                                      placeholder="Cari & Tambah dari Akun..."
                                      value={userSearch}
                                      onChange={e => setUserSearch(e.target.value)}
                                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-[#003366] transition-all"
                                   />
                                   {userSearch && (
                                      <div className="absolute bottom-full mb-2 left-0 w-64 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-[100] max-h-48 overflow-y-auto p-3 flex flex-col gap-1 border-t-4 border-t-[#003366]">
                                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">Hasil Pencarian</p>
                                         {availableUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()))
                                            .slice(0, 10)
                                            .map(u => (
                                               <button 
                                                  key={u.id}
                                                  type="button"
                                                  onClick={() => {
                                                     if (!people.find(p => p.id === u.id.toString())) {
                                                        setPeople([...people, { id: u.id.toString(), name: u.name, role: "Resident Engineer" }]);
                                                     }
                                                     setUserSearch("");
                                                  }}
                                                  className="w-full text-left p-2.5 hover:bg-blue-50 rounded-xl flex items-center justify-between group transition-all"
                                               >
                                                  <div className="flex flex-col">
                                                     <span className="text-[11px] font-bold text-slate-700">{u.name}</span>
                                                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{u.roles?.[0] || 'Member'}</span>
                                                  </div>
                                                  <Plus size={12} className="text-slate-300 group-hover:text-[#003366]" />
                                               </button>
                                            ))
                                         }
                                         {availableUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                                            <p className="p-3 text-center text-[10px] text-slate-400 font-bold italic">Akun tidak ditemukan.</p>
                                         )}
                                      </div>
                                   )}
                                </div>
                             </div>

                         </td>
                        {daysArray.map(d => <td key={d} className="border-r border-slate-50" />)}
                     </tr>
                  </tbody>
               </table>
            </div>

            {/* Bottom Controls */}
            <div className="bg-slate-50 border-t border-slate-100 px-8 py-3 flex items-center justify-between z-40">
                <div className="flex items-center gap-8">
                   {Object.entries(shiftInfo).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                       <div className={`w-4 h-4 rounded-lg ${val.color} border border-slate-200 shadow-sm flex-shrink-0`} />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{val.label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded-lg bg-rose-100 border border-rose-200 shadow-sm" />
                     <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Public Holiday / Sunday</span>
                  </div>
               </div>
               <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg shadow-slate-200/50 
                  ${isSaving ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#003366] text-white hover:bg-[#002b55] hover:-translate-y-0.5 active:translate-y-0'}`}
               >
                  {isSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      Persisting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Schedule
                    </>
                  )}
               </button>
            </div>
         </div>
      </main>

      {/* Success Notification */}
      <AnimatePresence>
         {showSuccess && (
           <motion.div 
             initial={{ opacity: 0, y: 50, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: 50, scale: 0.9 }}
             className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-[#003366] text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl"
           >
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                 <UserCheck className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-sm font-black uppercase tracking-tight">Schedule Synchronized</p>
                 <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Database updated successfully</p>
              </div>
           </motion.div>
         )}

        {/* EXPORT OPTIONS MODAL */}
        {isExportOptionsOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                       <Printer size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Export PDF Options</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select period for report</p>
                    </div>
                 </div>
                 <button onClick={() => setIsExportOptionsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400">
                    <X size={20} />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                   <button 
                     onClick={() => setExportParams(prev => ({ ...prev, type: "MONTH" }))}
                     className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${exportParams.type === "MONTH" ? "bg-white text-[#0073ea] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                   >
                      Specific Month
                   </button>
                   <button 
                     onClick={() => setExportParams(prev => ({ ...prev, type: "RANGE" }))}
                     className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${exportParams.type === "RANGE" ? "bg-white text-[#0073ea] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                   >
                      Custom Range
                   </button>
                </div>

                {exportParams.type === "MONTH" ? (
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Month</label>
                           <select 
                             value={exportParams.month}
                             onChange={(e) => setExportParams(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#0073ea] transition-all"
                           >
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{format(new Date(2026, i, 1), "MMMM")}</option>
                              ))}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Year</label>
                           <select 
                             value={exportParams.year}
                             onChange={(e) => setExportParams(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#0073ea] transition-all"
                           >
                              {[2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                           </select>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dari (Start Period)</label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <select 
                             value={exportParams.startMonth}
                             onChange={(e) => setExportParams(prev => ({ ...prev, startMonth: parseInt(e.target.value) }))}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#0073ea] transition-all"
                           >
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{format(new Date(2026, i, 1), "MMMM")}</option>
                              ))}
                           </select>
                           <select 
                             value={exportParams.startYear}
                             onChange={(e) => setExportParams(prev => ({ ...prev, startYear: parseInt(e.target.value) }))}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#0073ea] transition-all"
                           >
                              {[2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sampai (End Period)</label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <select 
                             value={exportParams.endMonth}
                             onChange={(e) => setExportParams(prev => ({ ...prev, endMonth: parseInt(e.target.value) }))}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#0073ea] transition-all"
                           >
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{format(new Date(2026, i, 1), "MMMM")}</option>
                              ))}
                           </select>
                           <select 
                             value={exportParams.endYear}
                             onChange={(e) => setExportParams(prev => ({ ...prev, endYear: parseInt(e.target.value) }))}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#0073ea] transition-all"
                           >
                              {[2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                           </select>
                        </div>
                     </div>
                  </div>
                )}

                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                   {isExporting ? (
                     <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating PDF...
                     </>
                   ) : (
                     <>
                        <FileSpreadsheet size={18} />
                        Start Export Now
                     </>
                   )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regulatory Detail Modal */}
      <AnimatePresence>
        {detailPersonId && (() => {
          const stat = workloadStats.find(s => s.id === detailPersonId);
          if (!stat) return null;
          return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
                onClick={() => setDetailPersonId(null)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-8 pb-4 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#003366] flex items-center justify-center text-xl font-black">
                      {stat.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{stat.name}</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Regulatory Audit Detail • {format(viewDate, "MMMM yyyy")}</p>
                    </div>
                  </div>
                  <button onClick={() => setDetailPersonId(null)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <div className="p-8 pt-4 overflow-y-auto custom-scrollbar-light space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Total Jam Kerja", value: `${stat.totalHours} Jam`, sub: "Beban Bulanan", color: "text-slate-800" },
                      { label: "Kelebihan Jam", value: `${stat.overtimeHours} Jam`, sub: `Lembur (>${stat.standardHours}h)`, color: "text-rose-500" },
                      { label: "Tunjangan Makan", value: `${stat.mealBenefits} Hari`, sub: "Lembur >4 Jam", color: "text-emerald-600" },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 text-center">
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">{item.label}</div>
                        <div className={`text-lg font-black ${item.color}`}>{item.value}</div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase">{item.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Detailed Explanation Section */}
                  <div className="space-y-6">


                    {/* Regulatory Reference (As requested) */}
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                      <h3 className="text-xs font-black text-slate-600 uppercase mb-4 flex items-center gap-2">
                        <Info size={14} /> Dasar Hukum & Acuan Perhitungan (PP No. 35/2021)
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <div>
                            <p className="text-[10px] font-black text-slate-700 uppercase">Waktu Kerja Standar</p>
                            <p className="text-[9px] font-medium text-slate-500 mt-0.5 leading-relaxed">Maksimal 8 jam per hari atau 40 jam per minggu (untuk 5 hari kerja).</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <div>
                            <p className="text-[10px] font-black text-slate-700 uppercase">Batasan Lembur (Overtime)</p>
                            <p className="text-[9px] font-medium text-slate-500 mt-0.5 leading-relaxed">Waktu kerja lembur maksimal 4 jam dalam 1 hari dan 18 jam dalam 1 minggu.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <div>
                            <p className="text-[10px] font-black text-slate-700 uppercase">Indeks Perhitungan Upah</p>
                            <p className="text-[9px] font-medium text-slate-500 mt-0.5 leading-relaxed">Jam pertama: 1,5x upah per jam. Jam selanjutnya: 2x upah per jam.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <div>
                            <p className="text-[10px] font-black text-slate-700 uppercase">Tunjangan Makan & Minum</p>
                            <p className="text-[9px] font-medium text-slate-500 mt-0.5 leading-relaxed">Wajib diberikan jika waktu kerja lembur dilakukan selama 4 jam atau lebih.</p>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 pt-4 border-t border-slate-200 text-[8px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest italic">
                        * Referensi: Peraturan Pemerintah Nomor 35 Tahun 2021.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => setDetailPersonId(null)}
                    className="w-full bg-[#003366] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all"
                  >
                    Tutup Detail Audit
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Sudden Change Justification Modal */}
      <AnimatePresence>
         {pendingChange && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden p-8"
              >
                 <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg">
                       <Info className="w-8 h-8" />
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-slate-800">Sudden Change Protocol</h2>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Day {pendingChange.day} • {format(viewDate, "MMM yyyy")}</p>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                       Perubahan jadwal mendadak (T+0/T+1) memerlukan alasan operasional untuk keperluan audit integritas data.
                    </p>
                    <textarea 
                      autoFocus
                      placeholder="Contoh: Teknisi Sakit, Masalah Akses Site, atau Perubahan Ruang Lingkup..."
                      value={justification}
                      onChange={e => setJustification(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold min-h-[100px] outline-none focus:border-rose-500 transition-all"
                    />
                    <div className="grid grid-cols-2 gap-3 w-full">
                       <button 
                        onClick={() => setPendingChange(null)}
                        className="py-3 rounded-xl border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                       >
                          Cancel
                       </button>
                       <button 
                        onClick={confirmJustification}
                        disabled={!justification.trim()}
                        className="py-3 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200/50 hover:bg-rose-700 transition-all disabled:opacity-50"
                       >
                          Confirm & Log
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Generator Modals */}
      <AnimatePresence mode="wait">
        {activeModal === "DAILY" && (
          <motion.div 
            key="daily-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900 bg-opacity-60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 m-4"
            >
              <div className="p-8 pb-4 flex justify-between items-start shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Shift Pattern Setup</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">Configure daily requirements and salary base</p>
                </div>
                <button onClick={() => setActiveModal("NONE")} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-8 pt-4 space-y-6 overflow-y-auto custom-scrollbar-light flex-1">
                <div className="space-y-6">
                  {dailyConfig.shifts.map((s, idx) => (
                    <div key={s.id} className={`p-6 rounded-[2.5rem] border-2 transition-all ${s.active ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white ${s.active ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-300'}`}>
                              {s.id}
                           </div>
                           <div>
                              <div className="text-sm font-black text-slate-800 uppercase">Shift {s.id} Pattern</div>
                              <div 
                                onClick={() => {
                                  if (["S1", "S2", "S3"].includes(s.id)) {
                                    const newLabel = window.prompt(`Ubah Jam Shift ${s.id} (Contoh: 07:00-15:00)`, shiftInfo[s.id].label);
                                    if (newLabel && newLabel.trim() !== "" && newLabel !== shiftInfo[s.id].label) {
                                      // Calculate new duration
                                      let newDur = 8;
                                      const match = newLabel.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
                                      if (match) {
                                        const h1 = parseInt(match[1]);
                                        const m1 = parseInt(match[2]);
                                        const h2 = parseInt(match[3]);
                                        const m2 = parseInt(match[4]);
                                        newDur = (h2 + m2/60) - (h1 + m1/60);
                                        if (newDur < 0) newDur += 24;
                                      }

                                      setShiftInfo(prev => ({
                                        ...prev,
                                        [s.id]: { ...prev[s.id], label: newLabel, duration: newDur }
                                      }));
                                    }
                                  }
                                }}
                                className="text-[10px] font-bold text-blue-500 uppercase tracking-widest cursor-pointer hover:text-blue-700 transition-colors"
                                title="Klik untuk merubah jam shift"
                              >
                                {shiftInfo[s.id]?.label || `${s.start} - ${s.end}`}
                              </div>
                           </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={s.active} 
                          onChange={(e) => {
                            const newShifts = [...dailyConfig.shifts];
                            newShifts[idx].active = e.target.checked;
                            setDailyConfig({ ...dailyConfig, shifts: newShifts });
                          }}
                          className="w-6 h-6 rounded-xl border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                        />
                      </div>
                      
                      <div className="grid grid-cols-7 gap-2">
                         {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => (
                           <div key={dIdx} className="space-y-1.5">
                              <div className="text-[8px] font-black text-center text-slate-400 uppercase tracking-tighter">{day}</div>
                              <input 
                                type="number"
                                min="0"
                                max="10"
                                disabled={!s.active}
                                value={s.pattern[dIdx]}
                                onChange={(e) => {
                                  const newShifts = [...dailyConfig.shifts];
                                  newShifts[idx].pattern[dIdx] = parseInt(e.target.value) || 0;
                                  setDailyConfig({ ...dailyConfig, shifts: newShifts });
                                }}
                                className={`w-full text-center py-2.5 rounded-xl text-xs font-black transition-all outline-none border-2
                                  ${s.active 
                                    ? s.pattern[dIdx] > 0 ? 'bg-white border-blue-200 text-blue-600 shadow-sm' : 'bg-white border-slate-100 text-slate-300'
                                    : 'bg-slate-100 border-transparent text-slate-400'}`}
                              />
                           </div>
                         ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rotation Frequency Setting */}
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-[#003366] text-white flex items-center justify-center shadow-lg">
                            <Clock size={20} />
                         </div>
                         <div>
                            <div className="text-sm font-black text-slate-800 uppercase">Rotation Frequency</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days per shift assignment</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200">
                         {[1, 2, 3, 4, 7].map(days => (
                           <button
                             key={days}
                             onClick={() => setDailyConfig({ ...dailyConfig, rotationFrequency: days })}
                             className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${dailyConfig.rotationFrequency === days ? 'bg-[#003366] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                           >
                             {days}D
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Fairness Alert */}
                <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                   <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/20 shrink-0">
                      <Users size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-blue-900 uppercase tracking-tight mb-1">Smart Fairness Algorithm</p>
                      <p className="text-[10px] font-bold text-blue-800/60 leading-relaxed uppercase">
                         Sistem akan menyeimbangkan beban kerja di antara {people.filter(p => p.role === "Resident Engineer").length} Resident Engineer. 
                         Jika total kebutuhan {dailyConfig.shifts.reduce((acc, s) => acc + (s.active ? s.pattern.reduce((a, b) => a + b, 0) : 0), 0)} man-days/minggu melebihi kapasitas, lembur akan dihitung otomatis.
                      </p>
                   </div>
                </div>

                {/* Base Salary Input Removed */}

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={generateDaily}
                    className="flex-1 bg-[#003366] text-white py-4 rounded-3xl font-black uppercase text-xs hover:bg-[#002b55] transition-all shadow-xl active:scale-95"
                  >
                    Apply Pattern & Generate
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeModal === "ANNUAL" && (
          <motion.div 
            key="annual-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900 bg-opacity-60 backdrop-blur-sm"
          >
             <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col m-4"
              >
                 <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar-light">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                             <Zap className="w-6 h-6" />
                          </div>
                          <div>
                             <h2 className="text-xl font-black text-slate-800">Maint. Chiller Wizard</h2>
                             <p className="text-xs text-slate-400 font-bold uppercase">N+1 day parallel scheduling</p>
                          </div>
                       </div>
                       <button onClick={() => setActiveModal("NONE")} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5 text-slate-400" /></button>
                    </div>

                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400">Total Unit Chiller</label>
                             <input 
                               type="number" 
                               value={annualConfig.totalChillers}
                               onChange={e => setAnnualConfig({...annualConfig, totalChillers: parseInt(e.target.value) || 0})}
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-black outline-none focus:border-emerald-500 transition-all"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400">Start Day (Tgl)</label>
                             <input 
                               type="number" 
                               value={annualConfig.startDay}
                               onChange={e => setAnnualConfig({...annualConfig, startDay: parseInt(e.target.value) || 0})}
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-black outline-none focus:border-emerald-500 transition-all"
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400">Select Team Members (STE Only)</label>
                          <div className="grid grid-cols-2 gap-2">
                             {people.filter(p => p.role === "STE").map(p => {
                               const isSelected = annualConfig.teamIds.includes(p.id);
                               return (
                                 <button 
                                   key={p.id}
                                   onClick={() => {
                                     const next = isSelected 
                                       ? annualConfig.teamIds.filter(id => id !== p.id)
                                       : [...annualConfig.teamIds, p.id];
                                     setAnnualConfig({...annualConfig, teamIds: next});
                                   }}
                                   className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${isSelected ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500' : 'bg-slate-50 border-slate-200'}`}
                                 >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                       {isSelected && <UserCheck className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>{p.name}</span>
                                 </button>
                                );
                             })}
                          </div>
                       </div>
                       <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <div className="text-xs font-bold text-emerald-800 leading-relaxed">
                             Setiap 1 Chiller dikerjakan oleh tim berisi <b>{annualConfig.teamIds.length} orang</b> secara paralel. <br/>
                             Total durasi pekerjaan: <b>{annualConfig.totalChillers} hari</b>.
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={generateAnnual}
                      className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700"
                    >
                       Generate Schedule Now
                    </button>
                 </div>
              </motion.div>
          </motion.div>
        )}
        {activeModal === "SHIFT_SETUP" && (
          <motion.div 
            key="shift-setup-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900 bg-opacity-60 backdrop-blur-sm"
          >
             <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col m-4 p-8"
              >
                 <div className="overflow-y-auto custom-scrollbar-light">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                       <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                          <Clock className="w-6 h-6" />
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-slate-800 uppercase">Shift Configuration</h2>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Global hours & duration sync</p>
                       </div>
                    </div>
                    <button onClick={() => setActiveModal("NONE")} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5 text-slate-400" /></button>
                 </div>

                 <div className="space-y-6">
                    {["S1", "S2", "S3"].map((sid) => (
                      <div key={sid} className="space-y-2">
                         <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Shift {sid} Window</label>
                            <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-lg">{shiftInfo[sid].duration} Jam Kerja</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl ${shiftInfo[sid].color} flex items-center justify-center text-white font-black shadow-lg`}>
                               {sid}
                            </div>
                            <input 
                               type="text" 
                               value={shiftInfo[sid].label}
                               onChange={e => {
                                 const newLabel = e.target.value;
                                 let newDur = 8;
                                 const match = newLabel.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
                                 if (match) {
                                   const h1 = parseInt(match[1]);
                                   const m1 = parseInt(match[2]);
                                   const h2 = parseInt(match[3]);
                                   const m2 = parseInt(match[4]);
                                   newDur = (h2 + m2/60) - (h1 + m1/60);
                                   if (newDur < 0) newDur += 24;
                                   if (newDur > 0) newDur = Math.max(0, newDur - 1); // Subtract 1h break
                                 }
                                 setShiftInfo(prev => {
                                   const next = {
                                     ...prev,
                                     [sid]: { ...prev[sid], label: newLabel, duration: newDur }
                                   };
                                   localStorage.setItem(`shift_config_${sid}`, JSON.stringify(next[sid]));
                                   return next;
                                 });

                                 // Sync with Daily Generator Config
                                 setDailyConfig(prev => {
                                   const newShifts = prev.shifts.map(s => {
                                      if (s.id === sid && match) {
                                        return { ...s, start: `${match[1].padStart(2, '0')}:${match[2]}`, end: `${match[3].padStart(2, '0')}:${match[4]}` };
                                      }
                                      return s;
                                   });
                                   return { ...prev, shifts: newShifts };
                                 });
                               }}
                               className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-indigo-500 transition-all text-sm tracking-tight"
                               placeholder="e.g. 07:00-15:00"
                            />
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="mt-8 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                       Perubahan jam di atas akan otomatis merubah <b>akumulasi jam kerja</b> pada dashboard dan laporan PDF. Format wajib: HH:mm-HH:mm.
                    </p>
                 </div>

                 <button 
                    onClick={() => {
                      handleSave();
                      setActiveModal("NONE");
                    }}
                    className="w-full mt-6 py-4 rounded-2xl bg-[#003366] text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 hover:bg-[#002b55]"
                 >
                    Apply & Save Configurations
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
