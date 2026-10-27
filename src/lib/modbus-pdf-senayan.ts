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

// ─── SENAYAN CHILLER REPORT DEFINITIONS (Exact 1:1 Physical Logsheet) ─────────
export interface SenayanRowDef {
  no: number;
  category: "VAPORATOR" | "CONDENSER" | "COMPRESSOR" | "SETTING" | "UNIT STATUS" | "SYSTEM STATUS";
  name: string;
  standard: string;
  defaultKet?: string;
  defaultPoint?: string;
  matchPatterns: RegExp[];
}

export const SENAYAN_LOGSHEET_ROWS: SenayanRowDef[] = [
  // 1. VAPORATOR (7 rows)
  { no: 1, category: "VAPORATOR", name: "Flow Status", standard: "", defaultKet: "Yes", matchPatterns: [/evap.*flow/i, /fs.*evap/i] },
  { no: 1, category: "VAPORATOR", name: "Leaving Temp", standard: "5.8-8", matchPatterns: [/evap.*leaving/i, /lewt/i] },
  { no: 1, category: "VAPORATOR", name: "Entering Temp", standard: "8-12", matchPatterns: [/evap.*entering/i, /eewt/i] },
  { no: 1, category: "VAPORATOR", name: "Delta Temp", standard: "3-6", matchPatterns: [/delta.*evap/i] },
  { no: 1, category: "VAPORATOR", name: "Approach Temp", standard: "0-3", matchPatterns: [/app.*evap/i] },
  { no: 1, category: "VAPORATOR", name: "Saturated Refrigerant Temp", standard: "5.5-7", matchPatterns: [/sat.*evap/i] },
  { no: 1, category: "VAPORATOR", name: "Refrigerant Press", standard: "241-276", matchPatterns: [/evap.*ref.*press/i, /ref.*press/i] },

  // 2. CONDENSER (7 rows)
  { no: 2, category: "CONDENSER", name: "Flow Status", standard: "", defaultKet: "Yes", matchPatterns: [/cond.*flow/i, /fs.*cond/i] },
  { no: 2, category: "CONDENSER", name: "Leaving Temp", standard: "34-37", matchPatterns: [/cond.*leaving/i, /lcwt/i] },
  { no: 2, category: "CONDENSER", name: "Entering Temp", standard: "29-32", matchPatterns: [/cond.*entering/i, /ecwt/i] },
  { no: 2, category: "CONDENSER", name: "Delta Temp", standard: "4-6", matchPatterns: [/delta.*cond/i] },
  { no: 2, category: "CONDENSER", name: "Approach Temp", standard: "0-3", matchPatterns: [/app.*cond/i] },
  { no: 2, category: "CONDENSER", name: "Saturated Refrigerant Temp", standard: "35-39", matchPatterns: [/sat.*cond/i] },
  { no: 2, category: "CONDENSER", name: "Refrigerant Press", standard: "759-862", matchPatterns: [/cond.*refrig.*press/i, /disch.*press/i] },

  // 3. COMPRESSOR (7 rows)
  { no: 3, category: "COMPRESSOR", name: "Suction Line Temp", standard: "5.5-7", matchPatterns: [/suction.*temp/i] },
  { no: 3, category: "COMPRESSOR", name: "Discharge Line Temp", standard: "35-42", matchPatterns: [/discharge.*temp/i] },
  { no: 3, category: "COMPRESSOR", name: "Liquid Line Temp", standard: "32-35", matchPatterns: [/liquid.*temp/i] },
  { no: 3, category: "COMPRESSOR", name: "Oil Feed Temp", standard: "36-40", matchPatterns: [/oil.*feed.*temp/i] },
  { no: 3, category: "COMPRESSOR", name: "Oil Feed Press", standard: "1000-1300", matchPatterns: [/oil.*feed.*press/i] },
  { no: 3, category: "COMPRESSOR", name: "Oil Sump Temp", standard: "50-60", matchPatterns: [/oil.*sump.*temp/i] },
  { no: 3, category: "COMPRESSOR", name: "Oil Sump Prees", standard: "235-270", matchPatterns: [/oil.*sump.*prees/i, /oil.*sump.*press/i] },

  // 4. SETTING (7 rows)
  { no: 4, category: "SETTING", name: "Mode", standard: "", defaultKet: "Auto", matchPatterns: [/ch.*mode/i, /setting.*mode/i] },
  { no: 4, category: "SETTING", name: "Manual value", standard: "", defaultKet: "Off", matchPatterns: [/manual.*value/i] },
  { no: 4, category: "SETTING", name: "CMV Manual Value", standard: "", defaultKet: "Off", matchPatterns: [/cmv.*manual/i] },
  { no: 4, category: "SETTING", name: "CHW Set Point Mode", standard: "", defaultKet: "Man", matchPatterns: [/chw.*set.*point.*mode/i] },
  { no: 4, category: "SETTING", name: "CHW Set Point Manual Value", standard: "", matchPatterns: [/chw.*set.*point.*manual/i] },
  { no: 4, category: "SETTING", name: "Capacity Limit Set Point", standard: "", matchPatterns: [/cap.*limit.*set/i] },
  { no: 4, category: "SETTING", name: "Failure Riset", standard: "", defaultKet: "Off", matchPatterns: [/failure.*riset/i, /failure.*reset/i] },

  // 5. UNIT STATUS (14 rows)
  { no: 5, category: "UNIT STATUS", name: "Operation Status", standard: "", defaultKet: "Run", matchPatterns: [/operation.*status/i, /sts_ch/i, /run.*status/i] },
  { no: 5, category: "UNIT STATUS", name: "Squence number", standard: "", matchPatterns: [/sequence/i] },
  { no: 5, category: "UNIT STATUS", name: "Control", standard: "", defaultKet: "On", matchPatterns: [/control$/i] },
  { no: 5, category: "UNIT STATUS", name: "FP Switch Position", standard: "", defaultKet: "Rem", matchPatterns: [/fp.*switch/i] },
  { no: 5, category: "UNIT STATUS", name: "CMV Status", standard: "", defaultKet: "Open", matchPatterns: [/cmv.*status/i] },
  { no: 5, category: "UNIT STATUS", name: "CMV Fail To Open", standard: "", defaultKet: "No", matchPatterns: [/cmv.*fail/i] },
  { no: 5, category: "UNIT STATUS", name: "Status", standard: "", defaultKet: "Run", matchPatterns: [/status$/i] },
  { no: 5, category: "UNIT STATUS", name: "Failt To Start", standard: "", defaultKet: "No", matchPatterns: [/fail.*to.*start/i] },
  { no: 5, category: "UNIT STATUS", name: "Alarm Exist", standard: "", defaultKet: "No", matchPatterns: [/alarm.*exist/i] },
  { no: 5, category: "UNIT STATUS", name: "Fault", standard: "", defaultKet: "No", matchPatterns: [/trip/i, /fault/i] },
  { no: 5, category: "UNIT STATUS", name: "Active set point", standard: "", matchPatterns: [/active.*set.*point/i] },
  { no: 5, category: "UNIT STATUS", name: "Actual Running Capacity %", standard: "RLA", matchPatterns: [/capacity.*rla/i, /%rla/i, /actual.*running.*capacity/i] },
  { no: 5, category: "UNIT STATUS", name: "Number Of Start", standard: "", matchPatterns: [/number.*of.*start/i, /start.*count/i] },
  { no: 5, category: "UNIT STATUS", name: "Running Hours", standard: "", matchPatterns: [/running.*hour/i] },

  // 6. SYSTEM STATUS (19 rows)
  { no: 6, category: "SYSTEM STATUS", name: "Mode", standard: "", defaultKet: "Man", matchPatterns: [/system.*mode/i, /sys.*mode/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Manual Value", standard: "", defaultKet: "On", matchPatterns: [/system.*manual/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Sistem Stage", standard: "", matchPatterns: [/sistem.*stage/i, /system.*stage/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Average CH RLA", standard: "", matchPatterns: [/avg.*ch.*rla/i, /average.*rla/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Actual Leaving Temp.", standard: "", matchPatterns: [/actual.*leaving/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Actual Return Temp.", standard: "", matchPatterns: [/actual.*return/i] },
  { no: 6, category: "SYSTEM STATUS", name: "AHU Qty", standard: "", matchPatterns: [/ahu.*qty/i] },
  { no: 6, category: "SYSTEM STATUS", name: "FCU Qty", standard: "", matchPatterns: [/fcu.*qty/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Power Failure Reset", standard: "", defaultKet: "Off", matchPatterns: [/power.*failure.*reset/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Cooling Load", standard: "", matchPatterns: [/cooling.*load$/i, /plant.*cooling.*load/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Cooling Load Required", standard: "", matchPatterns: [/cooling.*load.*required/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Cooling Load Set Point", standard: "", matchPatterns: [/cooling.*load.*set/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Start Interval Timer", standard: "", defaultPoint: "60", matchPatterns: [/start.*interval/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Add Temperature", standard: "", defaultPoint: "6,5", matchPatterns: [/add.*temp/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Add Delay Timer", standard: "", defaultPoint: "100", matchPatterns: [/add.*delay/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Subtract Temperature", standard: "", defaultPoint: "6.0", matchPatterns: [/subtract.*temp/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Subtract Delay Timer", standard: "", defaultPoint: "100", matchPatterns: [/subtract.*delay/i] },
  { no: 6, category: "SYSTEM STATUS", name: "VCD Frekuensi Hz", standard: "", matchPatterns: [/vcd.*frekuensi/i, /vfd.*hz/i] },
  { no: 6, category: "SYSTEM STATUS", name: "Diferensial press (kpa)", standard: "", matchPatterns: [/diferensial.*press/i, /diff.*press/i] },
];

export const SENAYAN_TIME_SLOTS = ["07:00", "08:00", "10:00", "12:00", "14:00", "16:00", "17:00"];

export const SENAYAN_SECTIONS = [
  { no: 1, text: "V\nA\nP\nO\nR\nA\nT\nO\nR", count: 7 },
  { no: 2, text: "C\nO\nN\nD\nE\nN\nS\nE\nR", count: 7 },
  { no: 3, text: "C\nO\nM\nP\nR\nE\nS\nS\nO\nR", count: 7 },
  { no: 4, text: "S\nE\nT\nT\nI\nN\nG", count: 7 },
  { no: 5, text: "U\nN\nI\nT\n \nS\nT\nA\nT\nU\nS", count: 14 },
  { no: 6, text: "S\nY\nS\nT\nE\nM\n \nS\nT\nA\nT\nU\nS", count: 19 },
];

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
      });
    });
  });

  // Save the PDF
  const fileName = `CHILLER_REPORTING_SENTRAL_SENAYAN_2_${startDate}_sd_${endDate}.pdf`;
  doc.save(fileName);
}

function renderSenayanSheet({
  doc,
  gateway,
  logs,
  dateStr,
  chillerNum,
}: {
  doc: jsPDF;
  gateway: GatewayReportInfo;
  logs: ModbusLogItem[];
  dateStr: string;
  chillerNum: string;
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

  // Filter logs for this date
  const logsForDay = (logs || []).filter((l) => l.recorded_at && l.recorded_at.startsWith(dateStr));

  // Match logs into the 7 time slots
  const timeSlotHours = [7, 8, 10, 12, 14, 16, 17];
  const logsBySlot: Record<string, ModbusLogItem[]> = {};

  SENAYAN_TIME_SLOTS.forEach((slot, idx) => {
    const targetHour = timeSlotHours[idx];
    const matchingLogs = logsForDay.filter((l) => {
      const dt = new Date(l.recorded_at);
      const h = dt.getHours();
      return Math.abs(h - targetHour) <= 1;
    });
    logsBySlot[slot] = matchingLogs;
  });

  // Construct Header Rows (matching exact physical paper format)
  const headRows: any[] = [
    // Row 1: Centered Title
    [
      {
        content: "CHILLER REPORTING SENTRAL SENAYAN 2",
        colSpan: 18,
        styles: {
          halign: "center",
          fontStyle: "bold",
          fontSize: 9.5,
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          cellPadding: 1.5,
        },
      },
    ],
    // Row 2: Date
    [
      { content: "Date", colSpan: 2, styles: { halign: "left", fontStyle: "normal", fontSize: 6.5, cellPadding: 0.8 } },
      { content: `: ${formattedDate}`, colSpan: 2, styles: { halign: "left", fontStyle: "bold", fontSize: 6.5, cellPadding: 0.8 } },
      { content: "", colSpan: 14, styles: { fillColor: [255, 255, 255], cellPadding: 0.8 } },
    ],
    // Row 3: Chiller no & "Date" centered over time columns
    [
      { content: "Chiller no", colSpan: 2, styles: { halign: "left", fontStyle: "normal", fontSize: 6.5, cellPadding: 0.8 } },
      { content: `: ${chillerNum}`, colSpan: 2, styles: { halign: "left", fontStyle: "bold", fontSize: 6.5, cellPadding: 0.8 } },
      { content: "Date", colSpan: 14, styles: { halign: "center", fontStyle: "normal", fontSize: 6.5, cellPadding: 0.8 } },
    ],
    // Row 4: Time label & 7 Time Slots
    [
      { content: "Time", colSpan: 2, styles: { halign: "left", fontStyle: "normal", fontSize: 6.5, cellPadding: 0.8 } },
      { content: ":", colSpan: 2, styles: { halign: "left", fontStyle: "bold", fontSize: 6.5, cellPadding: 0.8 } },
      ...SENAYAN_TIME_SLOTS.map((t) => ({
        content: t,
        colSpan: 2,
        styles: { halign: "center", fontStyle: "bold", fontSize: 6.5, cellPadding: 0.8 },
      })),
    ],
    // Row 5: Column Headers
    [
      { content: "No", styles: { halign: "center", fontStyle: "bold", fontSize: 6 } },
      { content: "", styles: { halign: "center", fontStyle: "bold", fontSize: 6 } },
      { content: "Unit", styles: { halign: "left", fontStyle: "bold", fontSize: 6 } },
      { content: "standard", styles: { halign: "center", fontStyle: "bold", fontSize: 6 } },
      ...SENAYAN_TIME_SLOTS.flatMap(() => [
        { content: "Point", styles: { halign: "center", fontStyle: "bold", fontSize: 5.8 } },
        { content: "Ket", styles: { halign: "center", fontStyle: "bold", fontSize: 5.8 } },
      ]),
    ],
  ];

  // Construct Body Rows with rowSpan for No and Category
  const bodyRows: any[] = [];
  let sectionIdx = 0;
  let rowInSection = 0;

  SENAYAN_LOGSHEET_ROWS.forEach((rowDef) => {
    const currentSec = SENAYAN_SECTIONS[sectionIdx];
    const isFirstRowInSec = rowInSection === 0;

    // Resolve slot values (Modbus log or default pre-printed value)
    const slotValues = SENAYAN_TIME_SLOTS.map((slot) => {
      const slotLogs = logsBySlot[slot] || [];
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

      let pointVal = rowDef.defaultPoint || "";
      let ketVal = rowDef.defaultKet || "";

      if (matched) {
        if (typeof matched.scaled_value === "number") {
          pointVal = Number.isInteger(matched.scaled_value)
            ? matched.scaled_value.toString()
            : matched.scaled_value.toFixed(1);
        }
        if (rowDef.defaultKet) {
          ketVal = matched.scaled_value === 0 ? "Off" : rowDef.defaultKet;
        }
      }

      return { point: pointVal, ket: ketVal };
    });

    if (isFirstRowInSec) {
      bodyRows.push([
        {
          content: String(currentSec.no),
          rowSpan: currentSec.count,
          styles: { halign: "center", valign: "middle", fontStyle: "bold", fontSize: 6.5 },
        },
        {
          content: currentSec.text,
          rowSpan: currentSec.count,
          styles: { halign: "center", valign: "middle", fontStyle: "bold", fontSize: 4.5, cellPadding: 0.2 },
        },
        { content: rowDef.name, styles: { halign: "left", fontStyle: "normal", fontSize: 5.5 } },
        { content: rowDef.standard, styles: { halign: "center", fontSize: 5.5 } },
        ...slotValues.flatMap((s) => [
          { content: s.point, styles: { halign: "right", fontSize: 5.3 } },
          { content: s.ket, styles: { halign: "center", fontStyle: "italic", fontSize: 5.3 } },
        ]),
      ]);
    } else {
      // Columns 0 & 1 are omitted due to rowSpan
      bodyRows.push([
        { content: rowDef.name, styles: { halign: "left", fontStyle: "normal", fontSize: 5.5 } },
        { content: rowDef.standard, styles: { halign: "center", fontSize: 5.5 } },
        ...slotValues.flatMap((s) => [
          { content: s.point, styles: { halign: "right", fontSize: 5.3 } },
          { content: s.ket, styles: { halign: "center", fontStyle: "italic", fontSize: 5.3 } },
        ]),
      ]);
    }

    rowInSection++;
    if (rowInSection >= currentSec.count) {
      sectionIdx++;
      rowInSection = 0;
    }
  });

  // Footer Note Row matching photo
  bodyRows.push([
    {
      content: "Note : Condensor Pressure Setting",
      colSpan: 4,
      styles: {
        halign: "left",
        fontStyle: "bold",
        fontSize: 5.8,
        cellPadding: 1,
      },
    },
    {
      content:
        "Chiller No. 1 = 965       Chiller No. 3 = 965\nChiller No. 2 = 962       Chiller No. 4 = 993",
      colSpan: 14,
      styles: {
        halign: "left",
        fontStyle: "normal",
        fontSize: 5.8,
        cellPadding: 1,
      },
    },
  ]);

  // Render autoTable (Single page fit)
  autoTable(doc, {
    startY: startY,
    margin: { left: marginX, right: marginX, top: marginX, bottom: marginX },
    head: headRows,
    body: bodyRows,
    theme: "grid",
    styles: {
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
      valign: "middle",
      cellPadding: 0.45,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 5.5 },
      1: { cellWidth: 4.5 },
      2: { cellWidth: 46.0 },
      3: { cellWidth: 20.0 },
      4: { cellWidth: 8.4 },
      5: { cellWidth: 8.4 },
      6: { cellWidth: 8.4 },
      7: { cellWidth: 8.4 },
      8: { cellWidth: 8.4 },
      9: { cellWidth: 8.4 },
      10: { cellWidth: 8.4 },
      11: { cellWidth: 8.4 },
      12: { cellWidth: 8.4 },
      13: { cellWidth: 8.4 },
      14: { cellWidth: 8.4 },
      15: { cellWidth: 8.4 },
      16: { cellWidth: 8.4 },
      17: { cellWidth: 8.4 },
    },
  });
}
