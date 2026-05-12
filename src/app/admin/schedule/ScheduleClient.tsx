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
import { saveVesSchedule, getVesSchedule } from "@/app/actions/ves_schedule";
import { getAllUsers } from "@/app/actions/users";
import { Search } from "lucide-react";
import { format, parseISO } from "date-fns";

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
      if (rosterRes.success && rosterRes.data) {
        setSchedule(rosterRes.data.schedule || {});
        setPeople(rosterRes.data.people || []);
        if (rosterRes.data.shiftInfo) {
          setShiftInfo(rosterRes.data.shiftInfo);
          // Update local storage to match DB
          Object.entries(rosterRes.data.shiftInfo).forEach(([k, v]) => {
            if (["S1", "S2", "S3"].includes(k)) localStorage.setItem(`shift_config_${k}`, JSON.stringify(v));
          });
        }
      } else {
        // Reset or keep default if no data
        setSchedule({});
      }
    }
    loadData();
  }, [viewDate]);


  const holidaysByDay = useMemo(() => {
    const map: Record<number, any> = {};
    holidays.forEach(h => {
      const date = parseISO(h.tanggal);
      if (date.getMonth() === viewDate.getMonth()) {
        map[date.getDate()] = h.keterangan;
      }
    });
    return map;
  }, [holidays, viewDate]);

  // Calendar Helpers
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const updateCell = (personId: string, day: number, value: ShiftType) => {
    if (value === "MANUAL") {
      const input = window.prompt("Input Jam Masuk - Jam Keluar (Format: HH:mm-HH:mm)\nContoh: 08:00-17:00", "08:00-17:00");
      if (!input || !input.includes("-")) return;
      
      const label = input.trim();
      let duration = 8;
      const match = label.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
      if (match) {
        const h1 = parseInt(match[1]);
        const m1 = parseInt(match[2]);
        const h2 = parseInt(match[3]);
        const m2 = parseInt(match[4]);
        duration = (h2 + m2/60) - (h1 + m1/60);
        if (duration < 0) duration += 24;
        if (duration > 0) duration = Math.max(0, duration - 1); // Subtract 1h break
      }

      // Add to shiftInfo so it renders correctly
      if (!shiftInfo[label]) {
        setShiftInfo(prev => ({
          ...prev,
          [label]: { label, color: "bg-slate-200", textColor: "text-slate-700", duration }
        }));
      }
      
      value = label;
    }

    const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const diffTime = cellDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Sudden Change: Today (0) or Tomorrow (1)
    if (diffDays >= 0 && diffDays <= 1) {
      setPendingChange({ personId, day, value });
      setJustification("");
      return;
    }

    applyCellUpdate(personId, day, value);
  };

  const applyCellUpdate = (personId: string, day: number, value: ShiftType, reason?: string) => {
    setSchedule(prev => ({
      ...prev,
      [personId]: {
        ...(prev[personId] || {}),
        [day]: value
      }
    }));

    if (reason) {
      const person = people.find(p => p.id === personId);
      setChangeLog(prev => [{
        date: new Date(),
        personName: person?.name,
        targetDay: day,
        newValue: value,
        reason: reason
      }, ...prev]);
    }
  };

  const confirmJustification = () => {
    if (!pendingChange || !justification.trim()) return;
    applyCellUpdate(pendingChange.personId, pendingChange.day, pendingChange.value, justification);
    setPendingChange(null);
  };

  /**
   * Generator: Daily Logsheet (Smart Coverage Algorithm)
   * Adheres to:
   * - Mon-Fri: S1 & S2 Coverage (2 people)
   * - Sat-Sun: S1 Only Coverage (1 person)
   * - Rest: Min 16h between shifts (No S2 -> S1)
   * - Fairness: Equal distribution of shift counts
   */
  const generateDaily = () => {
    const newSchedule = { ...schedule };
    const residents = people.filter(p => p.role === "Resident Engineer");
    const activeShifts = dailyConfig.shifts.filter(s => s.active);
    
    residents.forEach(p => newSchedule[p.id] = {});

    const stats = residents.map(p => ({ 
      id: p.id, 
      shiftCount: 0, 
      weeklyHours: 0, 
      consecutiveDays: 0,
      shiftTypeCounts: { S1: 0, S2: 0, S3: 0, AM: 0, TR: 0 } as Record<string, number>
    }));

    daysArray.forEach(day => {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const dayOfWeek = date.getDay(); // 0: Sun, 1: Mon...
      const patternIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Map to 0: Mon, 6: Sun
      
      // Reset weekly on Monday BEFORE assigning shifts
      if (dayOfWeek === 1) stats.forEach(s => s.weeklyHours = 0);
      
      activeShifts.forEach(shiftDef => {
        const requiredCount = shiftDef.pattern[patternIdx];
        
        for(let i = 0; i < requiredCount; i++) {
          const candidates = residents
            .filter(p => !newSchedule[p.id][day])
            .filter(p => {
              const yesterdayVal = newSchedule[p.id][day - 1];
              if (shiftDef.id === "S1" && yesterdayVal === "S2") return false;
              
              let streak = 0;
              for (let j = 1; j <= 6; j++) {
                if (newSchedule[p.id][day - j] && newSchedule[p.id][day - j] !== "OFF") streak++;
                else break;
              }
              return streak < 6;
            })
            .sort((a, b) => {
              const aS = stats.find(s => s.id === a.id)!;
              const bS = stats.find(s => s.id === b.id)!;
              
              // 0. Global Timeline Rotation (Mencegah Reset Saat Ganti Bulan)
              // Logika: Menggunakan tanggal absolut (Epoch) agar urutan tetap nyambung antar bulan.
              const freq = dailyConfig.rotationFrequency || 3;
              const epoch = new Date(2024, 0, 1).getTime(); // Senin, 1 Jan 2024
              const diffDays = Math.floor((date.getTime() - epoch) / (1000 * 60 * 60 * 24));
              const globalBlockIdx = Math.floor(diffDays / freq);
              
              // Shift offset agar S1 dan S2 tidak mengambil orang yang sama di blok yang sama
              const shiftOffsetMap: Record<string, number> = { "S1": 0, "S2": 1, "S3": 2, "AM": 3, "TR": 4 };
              const shiftOffset = shiftOffsetMap[shiftDef.id] || 0;
              
              const getTurnScore = (id: string) => {
                const pIdx = residents.findIndex(r => r.id === id);
                const currentTurnIdx = (globalBlockIdx + shiftOffset) % residents.length;
                return (pIdx + residents.length - currentTurnIdx) % residents.length;
              };

              const aTurn = getTurnScore(a.id);
              const bTurn = getTurnScore(b.id);
              if (aTurn !== bTurn) return aTurn - bTurn;

              // 1. Kepatuhan Mingguan (Keseimbangan dalam minggu)
              if (aS.weeklyHours !== bS.weeklyHours) return aS.weeklyHours - bS.weeklyHours;
              
              // 2. Keadilan Beban Bulanan (Total Shift)
              if (aS.shiftCount !== bS.shiftCount) return aS.shiftCount - bS.shiftCount;
              
              // 3. Rotasi Shift Bergantian (Pilih yang paling jarang ambil tipe shift ini)
              const aShiftFreq = aS.shiftTypeCounts[shiftDef.id] || 0;
              const bShiftFreq = bS.shiftTypeCounts[shiftDef.id] || 0;
              if (aShiftFreq !== bShiftFreq) return aShiftFreq - bShiftFreq;

              // 4. Monthly Rotation Anchor
              const rotationOffset = (viewDate.getMonth() + viewDate.getFullYear()) % residents.length;
              const aIdx = (residents.findIndex(r => r.id === a.id) + residents.length - rotationOffset) % residents.length;
              const bIdx = (residents.findIndex(r => r.id === b.id) + residents.length - rotationOffset) % residents.length;
              return aIdx - bIdx;
            });

          if (candidates.length > 0) {
            const chosen = candidates[0];
            newSchedule[chosen.id][day] = shiftDef.id as ShiftType;
            const s = stats.find(stat => stat.id === chosen.id)!;
            s.shiftCount++;
            s.weeklyHours += 8;
            s.shiftTypeCounts[shiftDef.id] = (s.shiftTypeCounts[shiftDef.id] || 0) + 1;
          }
        }
      });

      residents.forEach(p => { if (!newSchedule[p.id][day]) newSchedule[p.id][day] = "OFF"; });
    });

    setSchedule(newSchedule);
    setActiveModal("NONE");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  /**
   * Workload Analysis Logic
   */
  const workloadStats = useMemo(() => {
    let standardWorkHours = 0;
    daysArray.forEach(day => {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isHoliday = !!holidaysByDay[day];
      if (!isWeekend && !isHoliday) standardWorkHours += 8;
    });

    const residents = people.filter(p => p.role === "Resident Engineer");
    return residents.map(p => {
      let totalHours = 0;
      let violations: string[] = [];
      let consecutiveDays = 0;
      let maxConsecutive = 0;
      let totalOTIndex = 0; // PP 35/2021 Multiplier Units
      let mealBenefits = 0; // Days with >4h overtime
      
      // Track weekly hours per ISO week
      const weeklyHoursMap: Record<number, number> = {};
      let holidayWorkDays = 0;

      daysArray.forEach(day => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isHoliday = !!holidaysByDay[day];
        const shift = schedule[p.id]?.[day] || "";
        
        // 1. Basic Hour Tracking
        if (shift && shift !== "OFF") {
          const hours = shiftInfo[shift]?.duration || 8;
          totalHours += hours;
          
          // Weekly tracking (Monday start)
          const jan1 = new Date(date.getFullYear(), 0, 1);
          const weekNum = Math.ceil((((date.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
          weeklyHoursMap[weekNum] = (weeklyHoursMap[weekNum] || 0) + hours;

          consecutiveDays++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
          
          // 2. Regulatory Index Calculation (PP 35/2021)
          if (isHoliday || date.getDay() === 0) {
            // Holiday/Sunday: First 8h = 2x index, 9th = 3x, 10th-12th = 4x
            // Since our shifts are fixed 8h, we assign 16 units (8 * 2)
            totalOTIndex += 16;
            holidayWorkDays++;
          } else {
            // Normal Day: Overtime happens if >40h/week. 
            // In a simple daily view, we check if they are working extra shifts or just tracking the load
            // For now, if hours > 160/month, we start applying multipliers to the excess
          }
        } else {
          consecutiveDays = 0;
        }
      });

      // Weekly Violation Check
      let weekViolated = false;
      Object.values(weeklyHoursMap).forEach(h => {
        if (h > 40) weekViolated = true;
      });
      if (weekViolated) violations.push("Jam kerja seminggu melebihi batas 40 jam (PP 35/2021)");

      if (maxConsecutive > 6) {
        violations.push("Bekerja > 6 hari berturut-turut melanggar aturan istirahat mingguan");
      }

      // Final OT Index Calculation based on Monthly Excess
      // PP 35/2021: First 1.5x for 1st hour, 2.0x for subsequent
      if (totalHours > standardWorkHours) {
        const excess = totalHours - standardWorkHours;
        // Simplified: 1st excess hour of each day would be 1.5, but we aggregate monthly
        // We assume 1.5 index for the first 4 hours of excess (avg 1 week), 2.0 for the rest
        totalOTIndex += (Math.min(4, excess) * 1.5) + (Math.max(0, excess - 4) * 2);
        
        // Meal Benefit: If OT > 4 hours in a day. 
        // With 8h shifts, OT > 4h usually happens if a person covers TWO shifts (16h)
        daysArray.forEach(d => {
          // This is a placeholder for logic where we'd check multiple shifts per day
        });
      }

        return {
          id: p.id,
          name: p.name,
          totalHours,
          standardHours: standardWorkHours,
          violations,
          isCompliant: violations.length === 0,
          otIndex: totalOTIndex.toFixed(1),
          overtimeHours: Math.max(0, totalHours - standardWorkHours),
          mealBenefits: totalHours > (standardWorkHours + 20) ? Math.floor((totalHours - standardWorkHours)/8) : 0, 
          nightShiftCount: daysArray.filter(d => schedule[p.id]?.[d] === "S3").length,
          isOvertimeExcessive: (totalHours - standardWorkHours) > 72,
          holidayWorkDays
        };
      });
  }, [people, schedule, daysArray, viewDate, holidaysByDay]);

  /**
   * Generator: Annual Maintenance
   * 1 Day Work + 1 Day Test Run (Parallel)
   */
  const generateAnnual = () => {
    const newSchedule = { ...schedule };
    const { totalChillers, startDay, teamIds } = annualConfig;

    if (!teamIds || teamIds.length === 0) return;

    // Pipeline Logic: 
    // - Days 1 to N: AM for Chiller 1 to N (TR for previous chiller happens simultaneously)
    // - Day N+1: TR for the last chiller
    for (let i = 0; i < totalChillers; i++) {
      const amDay = startDay + i;
      if (amDay > daysInMonth) break;

      teamIds.forEach(personId => {
        const personSchedule = { ...(newSchedule[personId] || {}) };
        personSchedule[amDay] = "AM";
        newSchedule[personId] = personSchedule;
      });
    }

    // Add 1 final day for Test Run & Monitoring of the last unit
    const finalTrDay = startDay + totalChillers;
    if (finalTrDay <= daysInMonth) {
      teamIds.forEach(personId => {
        const personSchedule = { ...(newSchedule[personId] || {}) };
        personSchedule[finalTrDay] = "TR";
        newSchedule[personId] = personSchedule;
      });
    }

    setSchedule(newSchedule);
    setActiveModal("NONE");
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
           <div className="bg-[#003366] p-2.5 rounded-xl text-white shadow-lg">
              <Calendar className="w-5 h-5" />
           </div>
           <div>
              <h1 className="text-lg font-black tracking-tight text-[#003366] uppercase italic">Schedule VES LANUD</h1>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronLeft className="w-4 h-4" /></button>
              <span className="px-4 font-bold text-sm min-w-[140px] text-center">
                {viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronRight className="w-4 h-4" /></button>
           </div>

           <button 
              onClick={() => setIsExportOptionsOpen(true)}
              disabled={isExporting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-200/50 
                ${isExporting ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0'}`}
           >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" /> Export Options
                </>
              )}
           </button>

           <div className="relative group">
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                 <Plus className="w-4 h-4" />
                 Input Schedule
                 <ChevronDown className="w-4 h-4 opacity-50" />
              </button>
              
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                 <button 
                  onClick={() => setActiveModal("DAILY")}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all text-left group/item"
                 >
                    <div className="bg-blue-100 p-2 rounded-lg group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                       <Clock className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="text-xs font-black text-slate-700">Daily Logsheet</div>
                       <div className="text-[10px] text-slate-400">Target: Resident Engineers</div>
                    </div>
                 </button>
                 <button 
                  onClick={() => setActiveModal("ANNUAL")}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all text-left group/item"
                 >
                    <div className="bg-emerald-100 p-2 rounded-lg group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                       <Zap className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="text-xs font-black text-slate-700">Annual Maintenance</div>
                       <div className="text-[10px] text-slate-400">Target: STE Members</div>
                    </div>
                 </button>
                 <div className="h-px bg-slate-100 my-1 mx-2" />
                 <button 
                  onClick={() => setActiveModal("SHIFT_SETUP")}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all text-left group/item"
                 >
                    <div className="bg-indigo-100 p-2 rounded-lg group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                       <Settings className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="text-xs font-black text-slate-700">Shift Configurations</div>
                       <div className="text-[10px] text-slate-400">Edit S1, S2, S3 Hours</div>
                    </div>
                 </button>
              </div>
           </div>

           <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400">
              <Settings className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Optimized Header Area */}
      <div className="px-8 py-2 flex flex-col gap-4">
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white border border-slate-200 rounded-3xl p-4 shadow-sm gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[#003366] flex items-center justify-center text-white shadow-lg">
                  <CalendarDays size={24} />
               </div>
               <div>
                  <h2 className="text-lg font-black text-[#003366] uppercase tracking-tight">{format(viewDate, "MMMM yyyy")}</h2>
                  <div className="flex items-center gap-3 mt-0.5">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{daysInMonth} Days Total</span>
                     <div className="w-1 h-1 rounded-full bg-slate-200" />
                     <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{Object.keys(holidaysByDay).length + daysArray.filter(d => new Date(viewDate.getFullYear(), viewDate.getMonth(), d).getDay() === 0).length} Off Days</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 max-w-2xl hidden lg:block overflow-x-auto custom-scrollbar-light">
               <div className="flex gap-4">
                  {Object.entries(holidaysByDay).map(([day, ket]) => (
                    <div key={day} className="flex items-center gap-2 shrink-0 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                       <span className="text-[10px] font-black text-rose-600">{day}</span>
                       <span className="text-[10px] font-bold text-rose-800/60 uppercase tracking-tight truncate max-w-[120px]">{ket as string}</span>
                    </div>
                  ))}
                  {Object.keys(holidaysByDay).length === 0 && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">No national holidays this month</p>
                  )}
               </div>
            </div>

         </div>

         {/* Workload & Compliance Dashboard */}
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-3 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <LayoutGrid size={120} />
               </div>
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                     <FileSpreadsheet size={20} />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Workload & Labor Compliance</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Ref: PP No. 35/2021 & UU No. 6/2023</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workloadStats.map(stat => (
                    <div 
                      key={stat.id} 
                      onClick={() => setDetailPersonId(stat.id)}
                      className="bg-slate-50 border border-slate-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:bg-white cursor-pointer group relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Info size={16} className="text-blue-400" />
                       </div>

                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100 group-hover:bg-[#003366] group-hover:text-white transition-all">
                                {stat.name.charAt(0)}
                             </div>
                             <div>
                                <div className="text-sm font-black text-slate-700">{stat.name}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Resident Engineer</div>
                             </div>
                          </div>
                          <div className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest ${stat.isCompliant ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                             {stat.isCompliant ? 'Compliant' : 'Violation'}
                          </div>
                       </div>
                       
                       <div className="space-y-3">
                          <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-tight">
                             <span>Monthly Load</span>
                             <span className="text-slate-800">{stat.totalHours} / {stat.standardHours} Hours</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                             <div 
                                className={`h-full transition-all duration-700 ${stat.totalHours > stat.standardHours ? 'bg-rose-500' : 'bg-[#00a1e4]'}`} 
                                style={{ width: `${Math.min(100, (stat.totalHours / stat.standardHours) * 100)}%` }} 
                             />
                          </div>
                       </div>

                       <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                          <div>
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kelebihan Jam</div>
                             <div className="text-sm font-black text-rose-500">{stat.overtimeHours} Jam</div>
                          </div>
                          <div className="text-right">
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</div>
                             <div className="text-[9px] font-black text-slate-600 uppercase flex items-center gap-1">
                                <Clock size={10} /> Details
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-[#003366] text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
               
               <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                     <Info size={14} className="text-blue-300" /> Legal Reference Center
                  </h3>
                  <div className="space-y-4">
                     <a 
                      href="https://legalsatu.id/blog/wp-content/uploads/2024/03/UU-Nomor-6-Tahun-2023.pdf#page=549" 
                      target="_blank"
                      className="block group"
                     >
                        <div className="text-[10px] font-black uppercase text-blue-300 group-hover:text-white transition-colors">UU No. 6 Tahun 2023 (PDF)</div>
                        <div className="text-[8px] font-bold text-white/50 uppercase leading-tight mt-0.5 italic">Pasal 81: Amandemen UU Ketenagakerjaan (Halaman 549).</div>
                     </a>
                     <a 
                      href="https://jdih.kemnaker.go.id/asset/data_puu/PP352021.pdf#page=14" 
                      target="_blank"
                      className="block group"
                     >
                        <div className="text-[10px] font-black uppercase text-blue-300 group-hover:text-white transition-colors">PP No. 35 Tahun 2021 (PDF)</div>
                        <div className="text-[8px] font-bold text-white/50 uppercase leading-tight mt-0.5 italic">Pasal 21: Waktu Kerja & Istirahat (Halaman 14).</div>
                     </a>
                     <a 
                      href="https://jdih.kemnaker.go.id/" 
                      target="_blank"
                      className="block group border-t border-white/10 pt-3"
                     >
                        <div className="text-[10px] font-black uppercase text-emerald-400 group-hover:text-white transition-colors flex items-center gap-2">
                           <FileSpreadsheet size={12} /> JDIH Kemnaker RI
                        </div>
                        <div className="text-[8px] font-bold text-white/40 uppercase leading-tight mt-0.5">Basis data resmi Kementerian Ketenagakerjaan.</div>
                     </a>
                  </div>
               </div>

                <div className="mt-8 pt-4 border-t border-white/10">
                   <div className="bg-white/10 rounded-2xl p-3 border border-white/5">
                      <p className="text-[8px] font-black uppercase text-blue-200 mb-1 italic">Compliance & Benefit Notes:</p>
                      <p className="text-[9px] font-medium leading-relaxed text-white/80">
                         • <b>OT Index</b>: Total unit pengali upah (Indeks 1.5/2.0/3.0/4.0).<br/>
                         • <b>Meal Benefit</b>: Wajib diberikan jika lembur {">"}4 jam (PP 35/2021).<br/>
                         • <b>Night Shift</b>: S3 berhak atas premi malam/insentif tambahan.<br/>
                         • <b>OT Max</b>: Batas lembur 4 jam/hari & 18 jam/minggu.
                      </p>
                   </div>
                </div>
            </div>
         </div>
      </div>

      <main className="flex-1 p-6 pt-0 overflow-hidden flex flex-col">
         <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm flex-1 overflow-hidden flex flex-col relative">
            
            {/* Table Header Section */}
            <div className="overflow-x-auto custom-scrollbar-light flex-1">
               <table id="schedule-table-main" ref={tableRef} className="w-full border-collapse">
                  <thead className="sticky top-0 z-20 bg-white">
                     <tr className="border-b border-slate-100">
                        <th className="sticky left-0 bg-white z-30 p-6 text-left border-r border-slate-100 w-[280px]">
                           <div className="flex items-center gap-3 text-slate-400">
                              <Users className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Personnel & Role</span>
                           </div>
                        </th>
                        {daysArray.map(day => {
                          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                          const holiday = holidaysByDay[day];
                          const isHoliday = !!holiday;
                          
                          return (
                            <th key={day} className={`p-4 text-center border-r border-slate-50 min-w-[80px] transition-colors relative ${isHoliday ? 'bg-rose-50/80' : isWeekend ? 'bg-slate-50/50' : ''}`}>
                               <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                               <div className={`text-xl font-black ${(isHoliday || date.getDay() === 0) ? 'text-rose-500' : isWeekend ? 'text-blue-500' : 'text-[#003366]'}`}>{day}</div>
                               {isHoliday && (
                                 <div className="absolute top-0 inset-x-0 flex justify-center">
                                    <div className="w-1 h-1 bg-rose-500 rounded-full" />
                                 </div>
                               )}
                               {isHoliday && (
                                 <div className="mt-1 px-1 py-0.5 bg-rose-100 text-rose-600 text-[7px] font-black rounded uppercase truncate max-w-[70px] mx-auto" title={holiday}>
                                    {holiday}
                                 </div>
                               )}
                            </th>
                          );
                        })}
                     </tr>
                  </thead>
                  <tbody>
                     {people.map((p) => {
                       // Fatigue Check: Check consecutive work days
                       let maxConsecutive = 0;
                       let currentStreak = 0;
                       daysArray.forEach(d => {
                         const val = schedule[p.id]?.[d] || "";
                         if (val && val !== "OFF") {
                           currentStreak++;
                           maxConsecutive = Math.max(maxConsecutive, currentStreak);
                         } else {
                           currentStreak = 0;
                         }
                       });
                       const isFatigued = maxConsecutive >= 6;

                       return (
                         <tr key={p.id} className={`border-b border-slate-50 group hover:bg-slate-50/30 transition-colors ${isFatigued ? 'bg-rose-50/30' : ''}`}>
                            <td className={`sticky left-0 group-hover:bg-slate-50 z-10 p-5 border-r border-slate-100 shadow-[2px_0_10px_rgba(0,0,0,0.02)] ${isFatigued ? 'bg-rose-50' : 'bg-white'}`}>
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm relative 
                                    ${isFatigued ? 'bg-rose-200 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                                     {p.name.charAt(0)}
                                     {isFatigued && (
                                       <div className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 border-2 border-rose-50 shadow-lg">
                                          <Info className="w-2 h-2" />
                                       </div>
                                     )}
                                  </div>
                                  <div className="min-w-0">
                                     <div className="flex items-center gap-2">
                                        {isExporting ? (
                                          <span className={`text-sm font-black w-full inline-block pb-1 ${isFatigued ? 'text-rose-700' : 'text-slate-700'}`}>
                                            {p.name}
                                          </span>
                                        ) : (
                                          <input 
                                            value={p.name} 
                                            onChange={(e) => {
                                              const newPeople = [...people];
                                              const idx = newPeople.findIndex(x => x.id === p.id);
                                              newPeople[idx].name = e.target.value;
                                              setPeople(newPeople);
                                            }}
                                            className={`text-sm font-black bg-transparent outline-none focus:text-blue-600 transition-colors w-full 
                                              ${isFatigued ? 'text-rose-700' : 'text-slate-700'}`}
                                          />
                                        )}
                                        {isFatigued && (
                                          <span className="shrink-0 bg-rose-600 text-[6px] font-black text-white px-1 py-0.5 rounded uppercase tracking-widest">Fatigue Risk</span>
                                        )}
                                     </div>
                                     {isExporting ? (
                                       <div className="text-[10px] font-black text-[#00a1e4] uppercase tracking-widest px-1 mt-1">
                                          {p.role}
                                       </div>
                                     ) : (
                                       <select 
                                         value={p.role} 
                                         onChange={(e) => {
                                           const newPeople = [...people];
                                           const idx = newPeople.findIndex(x => x.id === p.id);
                                           newPeople[idx].role = e.target.value as RoleType;
                                           setPeople(newPeople);
                                         }}
                                         className="text-[10px] font-black text-[#00a1e4] uppercase tracking-widest bg-transparent outline-none cursor-pointer hover:bg-blue-50 px-1 rounded transition-colors"
                                       >
                                          <option value="Resident Engineer">Resident Engineer</option>
                                          <option value="STE">STE</option>
                                       </select>
                                     )}
                                  </div>
                               </div>
                            </td>
                             {daysArray.map(day => {
                               const val = schedule[p.id]?.[day] || "";
                               const info = shiftInfo[val];
                               const holiday = holidaysByDay[day];
                               const isHoliday = !!holiday;
                               const isSunday = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).getDay() === 0;
                               const isPast = new Date(viewDate.getFullYear(), viewDate.getMonth(), day) < new Date().setHours(0,0,0,0);

                               return (
                                 <td 
                                   key={day} 
                                   className={`p-1 border-r border-slate-50 h-[80px] transition-colors relative group ${(isHoliday || isSunday) ? 'bg-rose-50/20' : ''}`}
                                 >
                                    <select 
                                      value={val}
                                      disabled={isPast}
                                      onChange={(e) => updateCell(p.id, day, e.target.value as ShiftType)}
                                      className={`w-full h-full appearance-none rounded-xl border-2 border-transparent transition-all font-black text-xs outline-none text-center
                                        ${isPast ? 'opacity-40 cursor-not-allowed grayscale-[0.5]' : 'cursor-pointer'}
                                        ${info ? `${info.color} ${info.textColor} border-slate-100 ring-1 ring-black/5 shadow-sm` : 'hover:bg-slate-50 hover:border-slate-200'}`}
                                    >
                                       <option value="">-</option>
                                       {p.role === "Resident Engineer" ? (
                                         <>
                                           <option value="S1">S1</option>
                                           <option value="S2">S2</option>
                                           <option value="S3">S3</option>
                                         </>
                                       ) : (
                                         <>
                                           <option value="AM">AM</option>
                                           <option value="TR">TR</option>
                                         </>
                                       )}
                                       <option value="OFF">OFF</option>
                                        <option value="MANUAL">⌨️ MANUAL</option>
                                    </select>
                                    {isPast && (
                                      <div className="absolute top-1 right-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                         <Briefcase className="w-2.5 h-2.5 text-slate-400" />
                                      </div>
                                    )}
                                 </td>
                               );
                             })}
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
