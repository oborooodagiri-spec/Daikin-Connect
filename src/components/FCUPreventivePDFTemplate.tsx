import React from "react";
import { ReportSignatureFooter } from "./ReportSignatureFooter";
import { t, Language } from "@/lib/i18n";

export const getFCUPreventiveSections = (data: any, unit: any, engineerName?: string, customerName?: string, lang: Language = 'id') => {
  const { header, scope, parts, technicalAdvice, activity_photos } = data || {};
  
  const ELECTRICAL_PHASES = [
    { key_r: "ampere_r", key_s: "ampere_s", key_t: "ampere_t", label: "Ampere (A)" }
  ];

  const THERMAL_ROWS = [
    { key: "diff_temp", label: "Diff. Temp (oC)" },
    { key: "room_temp", label: "Room Temp (oC)" },
    { key: "air_flow", label: "Air Flow (Ft/M)" },
  ];

  const CHECKLIST_ROWS = [
    { key: "clean_air_filter", label: t("Filter Cleaning/Replacement", lang) },
    { key: "clean_coil", label: "Cleaning Coil" },
    { key: "clean_drainage", label: t("Condensate Drain Cleaning", lang) },
    { key: "clean_body", label: t("Unit Cabinet Cleaning", lang) },
    { key: "check_motor", label: "Check Motor Fan & Bearing" },
  ];
  
  const chunkArray = (arr: any[], size: number) => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const photoChunks = chunkArray(activity_photos, 6);

  const renderElectricalTable = () => {
    const sR = scope?.["ampere_r"] || scope?.["ampere_motor"] || {};
    const sS = scope?.["ampere_s"] || {};
    const sT = scope?.["ampere_t"] || {};
    const np = scope?.["ampere_nameplate"]?.before || "-";

    return (
      <div key="electrical" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>PERFORMA ELEKTRIKAL</div>
        <table style={mainTableStyle}>
          <thead>
            <tr style={tableHeaderRow}>
              <th rowSpan={2} style={{ ...thStyle, width: "15%" }}>PHASE</th>
              <th rowSpan={2} style={{ ...thStyle, width: "15%" }}>NAME PLATE</th>
              <th colSpan={3} style={{ ...thStyle, width: "70%" }}>AMPERE (A)</th>
            </tr>
            <tr style={tableHeaderRow}>
              <th style={thStyle}>{t("Before", lang)}</th>
              <th style={thStyle}>{t("After", lang)}</th>
              <th style={thStyle}>MARGIN</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: "7mm" }}>
              <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900 }}>R</td>
              <td style={{ ...tdStyle, textAlign: "center" }} rowSpan={3}>{np}</td>
              <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{sR.before || "-"}</td>
              <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{sR.after || "-"}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{sR.remarks || "-"}</td>
            </tr>
            <tr style={{ height: "7mm" }}>
              <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900 }}>S</td>
              <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{sS.before || "-"}</td>
              <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{sS.after || "-"}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{sS.remarks || "-"}</td>
            </tr>
            <tr style={{ height: "7mm" }}>
              <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900 }}>T</td>
              <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{sT.before || "-"}</td>
              <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{sT.after || "-"}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{sT.remarks || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderThermalTable = () => {
    return (
      <div key="thermal" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>PERFORMA TERMAL & UDARA</div>
        <table style={mainTableStyle}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={{ ...thStyle, width: "40%", textAlign: "left", paddingLeft: "4mm" }}>PARAMETER</th>
              <th style={{ ...thStyle, width: "20%" }}>{t("Before", lang)}</th>
              <th style={{ ...thStyle, width: "20%" }}>{t("After", lang)}</th>
              <th style={{ ...thStyle, width: "20%" }}>MARGIN</th>
            </tr>
          </thead>
          <tbody>
            {THERMAL_ROWS.map((row) => {
              const s = scope?.[row.key] || {};
              return (
                <tr key={row.key} style={{ height: "7mm" }}>
                  <td style={{ ...tdStyle, textAlign: "left", paddingLeft: "4mm" }}>{row.label}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{s.before || "-"}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{s.after || "-"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{s.remarks || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummaryTable = () => {
    const dCount = scope?.["diffuser_count"]?.before || "-";
    const avActual = scope?.["air_volume_actual"]?.before || "-";
    const avNP = scope?.["air_volume_nameplate"]?.before || "-";
    const perf = scope?.["performa_score"]?.before || "-";

    return (
      <div key="summary" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>RINGKASAN PERFORMA UNIT</div>
        <table style={mainTableStyle}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={thStyle}>JUMLAH DIFFUSER</th>
              <th colSpan={2} style={thStyle}>AIR VOLUME (CFM)</th>
              <th style={thStyle}>PERFORMANCE (%)</th>
            </tr>
            <tr style={tableHeaderRow}>
              <th style={{ ...thStyle, backgroundColor: "white" }}>{dCount}</th>
              <th style={thSubStyle}>ACTUAL: {avActual}</th>
              <th style={thSubStyle}>NAME PLATE: {avNP}</th>
              <th style={{ ...thStyle, backgroundColor: "white", color: "#16a34a" }}>{perf}</th>
            </tr>
          </thead>
        </table>
      </div>
    );
  };

  const renderChecklistTable = (key: string, title: string, rows: any[]) => {
    return (
      <div key={key} style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>{title}</div>
        <table style={mainTableStyle}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={{ ...thStyle, width: "70%", textAlign: "left", paddingLeft: "4mm" }}>ACTION ITEM</th>
              <th style={{ ...thStyle, width: "30%" }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const s = scope?.[row.key] || {};
              const isDone = s.done?.toLowerCase().includes("done") || s.done?.toLowerCase().includes("selesai") || s.before?.toLowerCase().includes("done");
              return (
                <tr key={row.key} style={{ height: "7mm" }}>
                  <td style={{ ...tdStyle, textAlign: "left", paddingLeft: "4mm" }}>{row.label}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                     <span style={{ 
                        paddingTop: "1px",
                        paddingBottom: "1px",
                        paddingLeft: "6px",
                        paddingRight: "6px", 
                        borderRadius: "1mm", 
                        backgroundColor: isDone ? "#f0fdf4" : "#fef2f2",
                        color: isDone ? "#16a34a" : "#dc2626",
                        fontSize: "6.5pt",
                        fontWeight: 900,
                        border: `1px solid ${isDone ? "#bbf7d0" : "#fecaca"}`
                     }}>
                        {isDone ? "DONE" : (s.done || s.before || "-")}
                     </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return [
    // HEADER INFO
    <div key="header" style={{ marginBottom: "5mm" }}>
        <table style={mainTableStyle}>
          <tbody>
            <tr>
              <td style={cellLabel}>{t("Category", lang)}</td>
              <td style={cellVal}>FCU</td>
              <td style={cellLabel}>{t("Brand", lang)}</td>
              <td style={cellVal}>{header?.brand || unit?.brand || "-"}</td>
              <td style={cellLabel}>{t("Date of Service", lang)}</td>
              <td style={cellVal}>{header?.date ? new Date(header.date).toLocaleDateString() : "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Building Floor", lang)}</td>
              <td style={cellVal}>{header?.floor || unit?.building_floor || "-"}</td>
              <td style={cellLabel}>{t("Model Number", lang)}</td>
              <td style={cellVal}>{header?.model || unit?.model || "-"}</td>
              <td style={cellLabel}>SO / WO Number</td>
              <td style={cellVal}>{header?.so_number || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Area", lang)}</td>
              <td style={cellVal}>{header?.area || unit?.area || "-"}</td>
              <td style={cellLabel}>{t("Serial Number", lang)}</td>
              <td style={cellVal}>{header?.serial_number || unit?.serial_number || "-"}</td>
              <td style={cellLabel}>{t("Visit Count", lang)}</td>
              <td style={cellVal}>1</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Room / Tenant", lang)}</td>
              <td style={cellVal}>{header?.tenant || "-"}</td>
              <td style={cellLabel}>{t("Unit Tag Number", lang)}</td>
              <td style={cellVal}>{header?.unit_number || unit?.tag_number || "-"}</td>
              <td style={cellLabel}>{t("Capacity", lang)} (PK)</td>
              <td style={cellVal}>{header?.capacity_pk || "-"}</td>
            </tr>
            <tr>
               <td style={cellLabel}>{t("Service Team", lang)}</td>
               <td colSpan={5} style={cellVal}>{header?.team_opt || engineerName || "-"}</td>
            </tr>
          </tbody>
        </table>
    </div>,

    renderElectricalTable(),
    renderThermalTable(),
    renderSummaryTable(),
    renderChecklistTable("checklist", "MAINTENANCE CHECKLIST", CHECKLIST_ROWS),

    <div key="advice" style={{ marginBottom: "6mm" }}>
      <div style={categoryHeader}>{t("Technical Advice & Summary", lang)}</div>
      <div style={adviceBoxStyle}>
        {technicalAdvice || "-"}
      </div>
    </div>,

    <div key="sign-force-break" style={{ marginTop: "5mm", minHeight: "180px" }}>
       <ReportSignatureFooter 
         preparedBy={engineerName || ""}
         reviewedBy={data.engineerSignerName}
         witnessedBy={data.customerApproverName}
         reviewedDate={data.reviewedAt}
         witnessedDate={data.approvedAt}
         lang={lang}
         isBulkSync={data.isBulkSync}
       />
    </div>,

    ...(photoChunks.length > 0 ? (
      photoChunks.map((chunk, chunkIdx) => (
        <div key={`photos-${chunkIdx}`} style={{ width: "100%", marginTop: "5mm" }}>
          <div style={categoryHeader}>
            {t("Maintenance Documentation Photos", lang)} {photoChunks.length > 1 ? `(Page ${chunkIdx + 1})` : ''}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm" }}>
            {chunk.map((p: any, i: number) => (
              <div key={i} style={photoWrapperStyle}>
                <img src={p.photo_url} alt={`Photo ${i}`} style={photoImgStyle} />
                <p style={photoCaptionStyle}>Photo {chunkIdx * 6 + i + 1}: {p.label || p.description || 'Maintenance Documentation'}</p>
              </div>
            ))}
          </div>
        </div>
      ))
    ) : [
      <div key="photos-placeholder" style={{ width: "100%", marginTop: "5mm" }}>
        <div style={categoryHeader}>{t("Maintenance Documentation Photos", lang)}</div>
        <div style={{ 
          border: "1px dashed #cbd5e1", 
          borderRadius: "2mm", 
          paddingTop: "10mm", 
          paddingBottom: "10mm", 
          paddingLeft: "10mm", 
          paddingRight: "10mm", 
          textAlign: "center", 
          color: "#94a3b8", 
          fontSize: "8pt" 
        }}>
          {t("No reports found.", lang)}
        </div>
      </div>
    ])
  ].filter(Boolean);
};

const mainTableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginBottom: "4mm", tableLayout: "fixed" };
const cellLabel: React.CSSProperties = { width: "18%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "7pt", fontWeight: 700, color: "#475569", textTransform: "uppercase" };
const cellVal: React.CSSProperties = { width: "15%", border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "8pt", fontWeight: 700, color: "#0f172a" };
const categoryHeader: React.CSSProperties = { backgroundColor: "#f1f5f9", paddingTop: "2mm", paddingBottom: "2mm", paddingLeft: "4mm", paddingRight: "4mm", fontSize: "9pt", fontWeight: 900, color: "#003366", borderLeft: "4px solid #00a1e4", marginBottom: "2mm", textTransform: "uppercase", letterSpacing: "0.5px" };
const tableHeaderRow: React.CSSProperties = { backgroundColor: "#f8fafc" };
const thStyle: React.CSSProperties = { border: "1px solid #e2e8f0", paddingTop: "2mm", paddingBottom: "2mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "7.5pt", fontWeight: 900, color: "#475569", textTransform: "uppercase", textAlign: "center" };
const thSubStyle: React.CSSProperties = { border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "1.5mm", paddingRight: "1.5mm", fontSize: "6.5pt", fontWeight: 700, color: "#64748b", textTransform: "uppercase", textAlign: "center", backgroundColor: "white" };
const tdStyle: React.CSSProperties = { border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "8.5pt" };
const adviceBoxStyle: React.CSSProperties = { border: "1px solid #e2e8f0", borderRadius: "1mm", paddingTop: "4mm", paddingBottom: "4mm", paddingLeft: "4mm", paddingRight: "4mm", minHeight: "20mm", fontSize: "9pt", color: "#1e293b", lineHeight: "1.5", backgroundColor: "#fcfcfc" };
const photoWrapperStyle: React.CSSProperties = { border: "1px solid #e2e8f0", paddingTop: "1mm", paddingBottom: "1mm", paddingLeft: "1mm", paddingRight: "1mm", borderRadius: "1.5mm", backgroundColor: "white", position: "relative" };
const photoImgStyle: React.CSSProperties = { width: "100%", height: "45mm", objectFit: "cover", borderRadius: "1mm" };
const photoCaptionStyle: React.CSSProperties = { fontSize: "6.5pt", marginTop: "1.5mm", textAlign: "center", color: "#64748b", fontWeight: 600 };
