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

export function generateSenayanModbusPDF({
  gateway,
  logs,
  startDate,
  endDate,
}: {
  gateway: GatewayReportInfo;
  logs: ModbusLogItem[];
  startDate: string;
  endDate: string;
}) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Primary Daikin Brand Colors
  const navyColor = [0, 51, 102]; // #003366
  const cyanColor = [0, 161, 228]; // #00a1e4
  const lightBg = [241, 245, 249]; // #f1f5f9
  const textDark = [30, 41, 59]; // #1e293b

  // 1. Top Decorative Brand Bar
  doc.setFillColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.rect(0, 0, pageWidth, 5, "F");

  // Cyan Accent Strip
  doc.setFillColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  doc.rect(0, 5, pageWidth, 1.5, "F");

  // 2. Header Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text("PT DAIKIN APPLIED SOLUTIONS INDONESIA", 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  doc.text("SUPERVISORY CONTROL & DATA ACQUISITION (SCADA) / MODBUS MONITORING", 14, 21);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text("LAPORAN OPERASIONAL & LOGGING PARAMETER", 14, 28);

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 31, pageWidth - 14, 31);

  // 3. Metadata Grid (Site & Gateway Info)
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, 34, pageWidth - 28, 26, 2, 2, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 34, pageWidth - 28, 26, 2, 2, "S");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text("Nama Gedung / Site :", 18, 40);
  doc.text("IP Gateway / Slave :", 18, 46);
  doc.text("Periode Laporan :", 18, 52);

  doc.text("Deskripsi / Unit :", 110, 40);
  doc.text("Interval Polling :", 110, 46);
  doc.text("Waktu Cetak :", 110, 52);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(gateway.name || "Sentral Senayan 2", 53, 40);
  doc.text(`${gateway.ip_address}:${gateway.port} (Slave ID: ${gateway.slave_id})`, 53, 46);
  doc.text(`${startDate} s/d ${endDate}`, 53, 52);

  doc.text(gateway.description || "STSI Sentral Senayan 2 Chiller Plant", 140, 40);
  doc.text(`${gateway.poll_interval} detik`, 140, 46);
  doc.text(`${new Date().toLocaleString("id-ID")} WIB`, 140, 52);

  // 4. Parameter Statistical Summary Calculation
  const regMap: Record<
    string,
    {
      name: string;
      category: string;
      unit: string;
      address: number;
      values: number[];
      latest: number;
    }
  > = {};

  logs.forEach((log) => {
    const regName = log.register?.name || `Register #${log.register?.register_address || "Unknown"}`;
    const key = `${log.register?.category || "General"} - ${regName}`;
    if (!regMap[key]) {
      regMap[key] = {
        name: regName,
        category: log.register?.category || "Chiller",
        unit: log.register?.unit || "",
        address: log.register?.register_address || 0,
        values: [],
        latest: log.scaled_value,
      };
    }
    regMap[key].values.push(log.scaled_value);
    regMap[key].latest = log.scaled_value;
  });

  const summaryRows = Object.keys(regMap)
    .sort()
    .map((k) => {
      const item = regMap[k];
      const count = item.values.length;
      const min = Math.min(...item.values);
      const max = Math.max(...item.values);
      const avg = item.values.reduce((a, b) => a + b, 0) / (count || 1);
      return [
        item.category,
        item.name,
        min.toFixed(2),
        max.toFixed(2),
        avg.toFixed(2),
        item.latest.toFixed(2),
        item.unit,
        "Normal",
      ];
    });

  let currentY = 64;

  // Section 1 Header: Rangkuman Statistik
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text("I. RANGKUMAN STATISTIK OPERASIONAL PARAMETER (SUMMARY)", 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [
      [
        "Kategori",
        "Parameter / Register",
        "Min",
        "Max",
        "Rata-rata",
        "Terakhir",
        "Satuan",
        "Status",
      ],
    ],
    body: summaryRows.length > 0 ? summaryRows : [["-", "Tidak ada rekaman data pada periode ini", "-", "-", "-", "-", "-", "-"]],
    theme: "grid",
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    columnStyles: {
      0: { fontStyle: "bold", halign: "left", cellWidth: 26 },
      1: { halign: "left", cellWidth: 50 },
      2: { halign: "right", cellWidth: 16 },
      3: { halign: "right", cellWidth: 16 },
      4: { halign: "right", cellWidth: 18 },
      5: { halign: "right", cellWidth: 18 },
      6: { halign: "center", cellWidth: 16 },
      7: { halign: "center", cellWidth: 22 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 120;

  // Check if we need a new page for detailed logsheet
  if (finalY > pageHeight - 50) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = finalY + 10;
  }

  // Section 2 Header: Logsheet Rinci
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text("II. LOGSHEET DATA MONITORING PERIODE (DETAILED CHRONOLOGICAL LOGS)", 14, currentY);

  // Format log rows
  const detailRows = logs.map((l) => {
    const dt = new Date(l.recorded_at);
    const dateFormatted = `${String(dt.getDate()).padStart(2, "0")}/${String(
      dt.getMonth() + 1
    ).padStart(2, "0")}/${dt.getFullYear()} ${String(dt.getHours()).padStart(
      2,
      "0"
    )}:${String(dt.getMinutes()).padStart(2, "0")}:${String(
      dt.getSeconds()
    ).padStart(2, "0")}`;

    return [
      dateFormatted,
      l.register?.category || "-",
      l.register?.name || `Register #${l.register?.register_address || ""}`,
      (l.register?.register_address ?? "-").toString(),
      l.scaled_value.toString(),
      l.register?.unit || "",
      "Valid",
    ];
  });

  autoTable(doc, {
    startY: currentY + 3,
    head: [
      [
        "Waktu (WIB)",
        "Kategori",
        "Parameter",
        "Register",
        "Nilai Ukur",
        "Satuan",
        "Status",
      ],
    ],
    body:
      detailRows.length > 0
        ? detailRows
        : [["-", "-", "Tidak ada log untuk rentang tanggal yang dipilih", "-", "-", "-", "-"]],
    theme: "grid",
    styles: {
      fontSize: 7.2,
      cellPadding: 1.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.8,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 32 },
      1: { fontStyle: "bold", halign: "left", cellWidth: 26 },
      2: { halign: "left", cellWidth: 54 },
      3: { halign: "center", cellWidth: 18 },
      4: { halign: "right", cellWidth: 20 },
      5: { halign: "center", cellWidth: 16 },
      6: { halign: "center", cellWidth: 16 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // 5. Add Running Footers with Page Numbers to All Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      "PT Daikin Applied Solutions Indonesia — Dokumen Resmi Monitoring Modbus Senayan",
      14,
      pageHeight - 7
    );

    doc.setFont("helvetica", "bold");
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - 14, pageHeight - 7, {
      align: "right",
    });
  }

  // 6. Save PDF
  const cleanName = (gateway.name || "Senayan").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Laporan_Modbus_${cleanName}_${startDate}_sd_${endDate}.pdf`;
  doc.save(fileName);
}
