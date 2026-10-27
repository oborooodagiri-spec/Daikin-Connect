import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ModbusLogItem {
  id: string;
  gateway_id: number;
  raw_value: number;
  scaled_value: number;
  recorded_at: string;
  register?: {
    name: string;
    unit?: string | null;
    register_address: number;
    category?: string | null;
    sub_category?: string | null;
    scale_factor?: number | null;
  };
}

export interface GatewayReportInfo {
  id: number | string;
  name: string;
  description?: string | null;
  ip_address: string;
  port: number;
  slave_id: number;
  poll_interval: number;
  site_photo_url?: string | null;
}

// ─── SENAYAN CHILLER REPORT DEFINITIONS (Matching Physical Logsheet) ─────────
export interface SenayanRowDef {
  no: number;
  category: "VAPORATOR" | "CONDENSER" | "COMPRESSOR" | "SETTING" | "UNIT STATUS" | "SYSTEM STATUS";
  name: string;
  standard: string;
  defaultKet?: string;
  matchPatterns: RegExp[];
}

export const SENAYAN_LOGSHEET_ROWS: SenayanRowDef[] = [
  // 1. VAPORATOR
  { no: 1, category: "VAPORATOR", name: "Flow Status", standard: "", defaultKet: "Yes", matchPatterns: [/evap.*flow/i, /fs.*evap/i] },
  { no: 1, category: "VAPORATOR", name: "Leaving Temp", standard: "5.8-8", defaultKet: "", matchPatterns: [/evap.*leaving/i, /lewt/i] },
  { no: 1, category: "VAPORATOR", name: "Entering Temp", standard: "8-12", defaultKet: "", matchPatterns: [/evap.*entering/i, /eewt/i] },
  { no: 1, category: "VAPORATOR", name: "Delta Temp", standard: "3-6", defaultKet: "", matchPatterns: [/delta.*evap/i] },
  { no: 1, category: "VAPORATOR", name: "Approach Temp", standard: "0-3", defaultKet: "", matchPatterns: [/app.*evap/i] },
  { no: 1, category: "VAPORATOR", name: "Saturated Refrigerant Temp", standard: "5.5-7", defaultKet: "", matchPatterns: [/sat.*evap/i] },
  { no: 1, category: "VAPORATOR", name: "Refrigerant Press", standard: "241-276", defaultKet: "", matchPatterns: [/evap.*ref.*press/i, /ref.*press/i] },

  // 2. CONDENSER
  { no: 2, category: "CONDENSER", name: "Flow Status", standard: "", defaultKet: "Yes", matchPatterns: [/cond.*flow/i, /fs.*cond/i] },
  { no: 2, category: "CONDENSER", name: "Leaving Temp", standard: "34-37", defaultKet: "", matchPatterns: [/cond.*leaving/i, /lcwt/i] },
  { no: 2, category: "CONDENSER", name: "Entering Temp", standard: "29-32", defaultKet: "", matchPatterns: [/cond.*entering/i, /ecwt/i] },
  { no: 2, category: "CONDENSER", name: "Delta Temp", standard: "4-6", defaultKet: "", matchPatterns: [/delta.*cond/i] },
  { no: 2, category: "CONDENSER", name: "Approach Temp", standard: "0-3", defaultKet: "", matchPatterns: [/app.*cond/i] },
  { no: 2, category: "CONDENSER", name: "Saturated Refrigerant Temp", standard: "35-39", defaultKet: "", matchPatterns: [/sat.*cond/i] },
  { no: 2, category: "CONDENSER", name: "Refrigerant Press", standard: "759-862", defaultKet: "", matchPatterns: [/cond.*refrig.*press/i, /disch.*press/i] },

  // 3. COMPRESSOR
  { no: 3, category: "COMPRESSOR", name: "Suction Line Temp", standard: "5.5-7", defaultKet: "", matchPatterns: [/suction.*temp/i] },
  { no: 3, category: "COMPRESSOR", name: "Discharge Line Temp", standard: "35-42", defaultKet: "", matchPatterns: [/discharge.*temp/i] },
  { no: 3, category: "COMPRESSOR", name: "Liquid Line Temp", standard: "32-35", defaultKet: "", matchPatterns: [/liquid.*temp/i] },
  { no: 3, category: "COMPRESSOR", name: "Oil Feed Temp", standard: "36-40", defaultKet: "", matchPatterns: [/oil.*feed.*temp/i] },
  { no: 3, category: "COMPRESSOR", name: "Oil Feed Press", standard: "1000-1300", defaultKet: "", matchPatterns: [/oil.*feed.*press/i] },
  { no: 3, category: "COMPRESSOR", name: "Oil Sump Temp", standard: "50-60", defaultKet: "", matchPatterns: [/oil.*sump.*temp/i] },
  { no: 3, category: "COMPRESSOR", name: "Oil Sump Prees", standard: "235-270", defaultKet: "", matchPatterns: [/oil.*sump.*prees/i, /oil.*sump.*press/i] },

  // 4. SETTING
  { no: 4, category: "SETTING", name: "Mode", standard: "", defaultKet: "Auto", matchPatterns: [/ch.*mode/i, /setting.*mode/i] },
  { no: 4, category: "SETTING", name: "Manual value", standard: "", defaultKet: "Off", matchPatterns: [/manual.*value/i] },
  { no: 4, category: "SETTING", name: "CMV Manual Value", standard: "", defaultKet: "Off", matchPatterns: [/cmv.*manual/i] },
  { no: 4, category: "SETTING", name: "CHW Set Point Mode", standard: "", defaultKet: "Man", matchPatterns: [/chw.*set.*point.*mode/i] },
  { no: 4, category: "SETTING", name: "CHW Set Point Manual Value", standard: "", defaultKet: "", matchPatterns: [/chw.*set.*point.*manual/i] },
  { no: 4, category: "SETTING", name: "Capacity Limit Set Point", standard: "", defaultKet: "", matchPatterns: [/cap.*limit.*set/i] },
  { no: 4, category: "SETTING", name: "Failure Riset", standard: "", defaultKet: "Off", matchPatterns: [/failure.*riset/i, /failure.*reset/i] },

  // 5. UNIT STATUS
  { no: 5, category: "UNIT STATUS", name: "Operation Status", standard: "", defaultKet: "Run", matchPatterns: [/operation.*status/i, /sts_ch/i, /run.*status/i] },
  { no: 5, category: "UNIT STATUS", name: "Sequnce number", standard: "", defaultKet: "", matchPatterns: [/sequence/i] },
  { no: 5, category: "UNIT STATUS", name: "Control", standard: "", defaultKet: "On", matchPatterns: [/control$/i] },
  { no: 5, category: "UNIT STATUS", name: "FP Switch Position", standard: "", defaultKet: "Rem", matchPatterns: [/fp.*switch/i] },
  { no: 5, category: "UNIT STATUS", name: "CMV Status", standard: "", defaultKet: "Open", matchPatterns: [/cmv.*status/i] },
  { no: 5, category: "UNIT STATUS", name: "CMV Fail To Open", standard: "", defaultKet: "No", matchPatterns: [/cmv.*fail/i] },
  { no: 5, category: "UNIT STATUS", name: "Status", standard: "", defaultKet: "Run", matchPatterns: [/status$/i] },
  { no: 5, category: "UNIT STATUS", name: "Failt To Start", standard: "", defaultKet: "No", matchPatterns: [/fail.*to.*start/i] },
  { no: 5, category: "UNIT STATUS", name: "Alarm Exist", standard: "", defaultKet: "No", matchPatterns: [/alarm.*exist/i] },
  { no: 5, category: "UNIT STATUS", name: "Fault", standard: "", defaultKet: "No", matchPatterns: [/trip/i, /fault/i] },
  { no: 5, category: "UNIT STATUS", name: "Active set point", standard: "", defaultKet: "", matchPatterns: [/active.*set.*point/i] },
  { no: 5, category: "UNIT STATUS", name: "Actual Running Capacity %", standard: "RLA", defaultKet: "", matchPatterns: [/capacity.*rla/i, /%rla/i, /actual.*running.*capacity/i] },
  { no: 5, category: "UNIT STATUS", name: "Number Of Start", standard: "", defaultKet: "", matchPatterns: [/number.*of.*start/i, /start.*count/i] },
  { no: 5, category: "UNIT STATUS", name: "Running Hours", standard: "", defaultKet: "", matchPatterns: [/running.*hour/i] },

  // 6. SYSTEM STATUS
  { no: 6, category: "SYSTEM STATUS", name: "Mode", standard: "", defaultKet: "Man", matchPatterns: [/system.*mode/i, /sys.*mode/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Manual Value", standard: "", defaultKet: "On", matchPatterns: [/system.*manual/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Sistem Stage", standard: "", defaultKet: "", matchPatterns: [/sistem.*stage/i, /system.*stage/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Average CH RLA", standard: "", defaultKet: "", matchPatterns: [/avg.*ch.*rla/i, /average.*rla/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Actual Leaving Temp.", standard: "", defaultKet: "", matchPatterns: [/actual.*leaving/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Actual Return Temp.", standard: "", defaultKet: "", matchPatterns: [/actual.*return/i] },
  { no: 6, category: "SYSTEM STATUS", name: "AHU Qty", standard: "", defaultKet: "", matchPatterns: [/ahu.*qty/i] },
  { no: 6, category: "SYSTEM STATUS", name: "FCU Qty", standard: "", defaultKet: "", matchPatterns: [/fcu.*qty/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Power Failure Reset", standard: "", defaultKet: "Off", matchPatterns: [/power.*failure.*reset/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Cooling Load", standard: "", defaultKet: "", matchPatterns: [/cooling.*load$/i, /plant.*cooling.*load/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Cooling Load Required", standard: "", defaultKet: "", matchPatterns: [/cooling.*load.*required/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Cooling Load Set Point", standard: "", defaultKet: "", matchPatterns: [/cooling.*load.*set/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Start Interval Timer", standard: "60", defaultKet: "", matchPatterns: [/start.*interval/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Add Temperature", standard: "6,5", defaultKet: "", matchPatterns: [/add.*temp/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Add Delay Timer", standard: "100", defaultKet: "", matchPatterns: [/add.*delay/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Subtract Temperature", standard: "6.0", defaultKet: "", matchPatterns: [/subtract.*temp/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Subtract Delay Timer", standard: "100", defaultKet: "", matchPatterns: [/subtract.*delay/i] },
  { no: 6, category: "SYSTEM STATUS", name: "VCD Frekuensi Hz", standard: "", defaultKet: "", matchPatterns: [/vcd.*frekuensi/i, /vfd.*hz/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Diferensial press (kpa)", standard: "", defaultKet: "", matchPatterns: [/diferensial.*press/i, /diff.*press/i] },
];

export const SENAYAN_TIME_SLOTS = ["07:00", "08:00", "10:00", "12:00", "14:00", "16:00", "17:00"];

export function generateSenayanModbusPDF({
  gateway,
  logs,
  startDate,
  endDate,
  selectedChiller = "all",
}: {
  gateway: GatewayReportInfo;
  logs: ModbusLogItem[];
  startDate: string;
  endDate: string;
  selectedChiller?: "all" | "1" | "2" | "3" | "4";
}) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  // Parse dates in range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateList: string[] = [];

  const curr = new Date(start);
  while (curr <= end) {
    dateList.push(curr.toISOString().split("T")[0]);
    curr.setDate(curr.getDate() + 1);
  }

  // Determine chillers to render
  const chillersToRender =
    selectedChiller === "all" ? ["1", "2", "3", "4"] : [selectedChiller];

  let isFirstPage = true;

  // Render each date and each chiller
  dateList.forEach((dateStr) => {
    chillersToRender.forEach((chillerNum) => {
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      renderSenayanSheet({
        doc,
        gateway,
        logs,
        dateStr,
        chillerNum,
        pageWidth,
        pageHeight,
      });
    });
  });

  // Save the PDF
  const cleanName = (gateway.name || "Sentral_Senayan_2").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `CHILLER_REPORTING_SENTRAL_SENAYAN_2_${startDate}_sd_${endDate}.pdf`;
  doc.save(fileName);
}

function renderSenayanSheet({
  doc,
  gateway,
  logs,
  dateStr,
  chillerNum,
  pageWidth,
  pageHeight,
}: {
  doc: jsPDF;
  gateway: GatewayReportInfo;
  logs: ModbusLogItem[];
  dateStr: string;
  chillerNum: string;
  pageWidth: number;
  pageHeight: number;
}) {
  const marginX = 8;
  const startY = 8;

  // Format Date String for Header: e.g. "24 Juni 2026"
  const dObj = new Date(dateStr);
  const idMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const formattedDate = `${dObj.getDate()} ${idMonths[dObj.getMonth()]} ${dObj.getFullYear()}`;

  // 1. Filter logs for this date and this chiller (plus plant/system logs)
  const logsForDay = logs.filter((l) => l.recorded_at.startsWith(dateStr));

  // Match logs into time slots
  // For each time slot (07:00, 08:00, etc.), pick the log closest to the target hour
  const timeSlotHours = [7, 8, 10, 12, 14, 16, 17];
  const logsBySlot: Record<string, ModbusLogItem[]> = {};

  SENAYAN_TIME_SLOTS.forEach((slot, idx) => {
    const targetHour = timeSlotHours[idx];
    // Find logs recorded between targetHour - 1 and targetHour + 1
    const matchingLogs = logsForDay.filter((l) => {
      const dt = new Date(l.recorded_at);
      const h = dt.getHours();
      return Math.abs(h - targetHour) <= 1;
    });
    logsBySlot[slot] = matchingLogs;
  });

  // 2. Title Header (Exact text matching photo)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text("CHILLER REPORTING SENTRAL SENAYAN 2", pageWidth / 2, startY + 4, { align: "center" });

  // 3. Metadata Sub-Header Table
  // Left: Date, Chiller no, Time
  // Right columns: 07:00, 08:00, 10:00, 12:00, 14:00, 16:00, 17:00
  const metaTableY = startY + 6.5;

  // Construct autoTable Header Rows
  const headRows: any[] = [
    // Top Row: Date, Chiller no, Time slots
    [
      { content: `Date\nChiller no\nTime`, colSpan: 3, styles: { halign: "left", fontStyle: "bold", fontSize: 6.8, cellPadding: 1 } },
      { content: `: ${formattedDate}\n: ${chillerNum}\n: `, colSpan: 1, styles: { halign: "left", fontStyle: "bold", fontSize: 6.8, cellPadding: 1 } },
      ...SENAYAN_TIME_SLOTS.map((slot) => ({
        content: slot,
        colSpan: 2,
        styles: { halign: "center", fontStyle: "bold", fontSize: 7, fillColor: [245, 245, 245] },
      })),
    ],
    // Sub-header Row: No | Unit | standard | Point | Ket | Point | Ket ...
    [
      { content: "No", styles: { halign: "center", fontStyle: "bold", cellWidth: 7 } },
      { content: "", styles: { halign: "center", fontStyle: "bold", cellWidth: 5 } }, // Category narrow indicator
      { content: "Unit", styles: { halign: "left", fontStyle: "bold", cellWidth: 46 } },
      { content: "standard", styles: { halign: "center", fontStyle: "bold", cellWidth: 20 } },
      ...SENAYAN_TIME_SLOTS.flatMap(() => [
        { content: "Point", styles: { halign: "center", fontStyle: "bold", cellWidth: 8 } },
        { content: "Ket", styles: { halign: "center", fontStyle: "bold", cellWidth: 8 } },
      ]),
    ],
  ];

  // 4. Construct Body Rows
  const bodyRows: any[] = [];

  let currentCategory = "";
  SENAYAN_LOGSHEET_ROWS.forEach((rowDef) => {
    const isNewCat = rowDef.category !== currentCategory;
    currentCategory = rowDef.category;

    // Helper to find log value for this rowDef and time slot
    const slotValues = SENAYAN_TIME_SLOTS.map((slot) => {
      const slotLogs = logsBySlot[slot] || [];
      // Search matching log for this chiller & parameter
      const matched = slotLogs.find((l) => {
        const regName = l.register?.name || "";
        const subCat = l.register?.sub_category || "";
        const isChillerMatch =
          subCat.toLowerCase().includes(`chiller ${chillerNum}`) ||
          subCat.toLowerCase().includes("plant") ||
          regName.toLowerCase().includes(`ch${chillerNum}`) ||
          rowDef.category === "SYSTEM STATUS";

        if (!isChillerMatch) return false;
        return rowDef.matchPatterns.some((p) => p.test(regName));
      });

      let pointVal = "";
      let ketVal = rowDef.defaultKet || "";

      if (matched) {
        if (typeof matched.scaled_value === "number") {
          pointVal = Number.isInteger(matched.scaled_value)
            ? matched.scaled_value.toString()
            : matched.scaled_value.toFixed(1);
        }
        // If it's a binary status
        if (rowDef.defaultKet) {
          ketVal = matched.scaled_value === 0 ? "Off" : rowDef.defaultKet;
        }
      }

      return { point: pointVal, ket: ketVal };
    });

    const categoryShort =
      rowDef.category === "VAPORATOR"
        ? "V\nA\nP"
        : rowDef.category === "CONDENSER"
        ? "C\nO\nN"
        : rowDef.category === "COMPRESSOR"
        ? "C\nO\nM"
        : rowDef.category === "SETTING"
        ? "S\nE\nT"
        : rowDef.category === "UNIT STATUS"
        ? "U\nN\nI"
        : "S\nY\nS";

    const rowData: any[] = [
      rowDef.no,
      categoryShort,
      rowDef.name,
      rowDef.standard,
      ...slotValues.flatMap((s) => [s.point, s.ket]),
    ];

    bodyRows.push(rowData);
  });

  // Footer Note Row
  bodyRows.push([
    {
      content:
        "Note : Condensor Pressure Setting | Chiller No. 1 = 965   Chiller No. 3 = 965\n                                   | Chiller No. 2 = 962   Chiller No. 4 = 993",
      colSpan: 18,
      styles: {
        halign: "left",
        fontStyle: "bold",
        fontSize: 6.2,
        fillColor: [250, 250, 250],
        cellPadding: 1.5,
      },
    },
  ]);

  // 5. Render autoTable
  autoTable(doc, {
    startY: metaTableY,
    margin: { left: marginX, right: marginX },
    head: headRows,
    body: bodyRows,
    theme: "grid",
    styles: {
      fontSize: 5.6,
      cellPadding: 0.8,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
      valign: "middle",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      fontStyle: "bold",
      fontSize: 6.2,
    },
    columnStyles: {
      0: { halign: "center", fontStyle: "bold", cellWidth: 6 },
      1: { halign: "center", fontStyle: "bold", cellWidth: 5, fontSize: 4.8 },
      2: { halign: "left", fontStyle: "bold", cellWidth: 46 },
      3: { halign: "center", cellWidth: 19 },
      // 7 time slots * 2 = 14 columns
      4: { halign: "right", cellWidth: 8 },
      5: { halign: "center", cellWidth: 8 },
      6: { halign: "right", cellWidth: 8 },
      7: { halign: "center", cellWidth: 8 },
      8: { halign: "right", cellWidth: 8 },
      9: { halign: "center", cellWidth: 8 },
      10: { halign: "right", cellWidth: 8 },
      11: { halign: "center", cellWidth: 8 },
      12: { halign: "right", cellWidth: 8 },
      13: { halign: "center", cellWidth: 8 },
      14: { halign: "right", cellWidth: 8 },
      15: { halign: "center", cellWidth: 8 },
      16: { halign: "right", cellWidth: 8 },
      17: { halign: "center", cellWidth: 8 },
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
  });
}
