import React from "react";
import { ReportSignatureFooter } from "./ReportSignatureFooter";
import { t, Language } from "@/lib/i18n";
import { getPhotoUrl } from "@/lib/photo_utils";

export const getPreventiveSections = (data: any, unit: any, engineerName?: string, customerName?: string, lang: Language = 'id') => {
  const { header, scope, parts, technicalAdvice, activity_photos } = data || {};
  const unitType = (unit?.unit_type || "").toUpperCase();

  // DYNAMIC ROW CONFIGURATION
  let ELECTRICAL_ROWS = [
    { key: "ampere_nameplate", label: "Compressor Name Plate (A)" },
    { key: "ampere_motor", label: "Compressor Current (A)" },
    { key: "ampere_r", label: "Compressor Current - Phase R (A)" },
  ];

  let AIR_SIDE_ROWS = [
    { key: "return_air_temp", label: t("Return Air Temperature", lang) },
    { key: "supply_air_temp", label: t("Supply Air Temperature", lang) },
    { key: "room_temp", label: t("Room Temp", lang) },
    { key: "air_flow_rate", label: t("Air Flow Rate", lang) },
  ];

  let AHU_TECHNICAL_ROWS: any[] = [];
  let CHECKLIST_ROWS = [
    { key: "clean_air_filter", label: t("Filter Cleaning/Replacement", lang) },
    { key: "clean_coil", label: t("AHU Coil Cleaning", lang) },
    { key: "clean_drainage", label: t("Condensate Drain Cleaning", lang) },
    { key: "clean_body", label: t("Unit Cabinet Cleaning", lang) },
  ];

  if (unitType.includes("AHU")) {
    ELECTRICAL_ROWS = []; // AHU usually focuses on fan/motor metrics
    AIR_SIDE_ROWS = [
        { key: "return_air_temp", label: "Return Air Temperature" },
        { key: "supply_air_temp", label: "Supply Air Temperature" },
        { key: "air_flow_rate", label: "Air Flow Rate" },
    ];
    AHU_TECHNICAL_ROWS = [
      { key: "fan_rpm", label: "Fan RPM" },
      { key: "static_pressure", label: "Static Pressure (Pa)" },
      { key: "filter_dp", label: "Filter dP (Pa)" },
      { key: "enthalpy_in", label: "Enthalpy In (kJ/kg)" },
      { key: "enthalpy_out", label: "Enthalpy Out (kJ/kg)" },
    ];
    CHECKLIST_ROWS.push(
      { key: "check_vbelt", label: "V-Belt Inspection & Tension" },
      { key: "check_bearing", label: "Motor/Blower Bearing Inspection" }
    );
  } else if (unitType.includes("FCU")) {
    AIR_SIDE_ROWS.push(
        { key: "diffuser_count", label: "Number of Diffusers" },
        { key: "air_volume", label: "Air Volume (CFM)" }
    );
  } else if (unitType.includes("SPLIT DUCT") || unitType.includes("DUCTED")) {
    ELECTRICAL_ROWS.push(
        { key: "ampere_s", label: "Compressor Current - Phase S (A)" },
        { key: "ampere_t", label: "Compressor Current - Phase T (A)" }
    );
  } else {
    // Split Wall / VRV (Generic)
    // Only show Phase R / Single Phase
  }

  const WATER_SIDE_ROWS = [
    { key: "pressure_inlet", label: t("Entering Water Pressure", lang), hideIfEmpty: true },
    { key: "pressure_outlet", label: t("Leaving Water Pressure", lang), hideIfEmpty: true },
    { key: "temp_inlet", label: t("Entering Water Temperature", lang), hideIfEmpty: true },
    { key: "temp_outlet", label: t("Leaving Water Temperature", lang), hideIfEmpty: true },
  ];
  
  const chunkArray = (arr: any[], size: number) => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const photoChunks = chunkArray(activity_photos, 6);

  const renderMeasurementTable = (key: string, title: string, rows: any[]) => {
    const activeRows = rows.filter(r => !r.hideIfEmpty || (scope?.[r.key] && (scope[r.key].before !== "-" || scope[r.key].after !== "-")));
    if (activeRows.length === 0) return null;

    return (
      <div key={key} style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>{title}</div>
        <table style={mainTableStyle}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={{ ...thStyle, width: "40%", textAlign: "left", paddingLeft: "4mm" }}>PARAMETER</th>
              <th style={{ ...thStyle, width: "20%" }}>{t("Before", lang)}</th>
              <th style={{ ...thStyle, width: "20%" }}>{t("After", lang)}</th>
              <th style={{ ...thStyle, width: "20%" }}>{t("Margin / Result", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {activeRows.map((row) => {
              const s = scope?.[row.key] || {};
              return (
                <tr key={row.key} style={{ height: "7mm" }}>
                  <td style={{ ...tdStyle, textAlign: "left", paddingLeft: "4mm" }}>{row.label}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "hsl(210, 100%, 25%)", fontWeight: 800 }}>{s.before || "-"}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "hsl(210, 100%, 25%)", fontWeight: 800 }}>{s.after || "-"}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "hsl(200, 10%, 40%)" }}>{s.remarks || "-"}</td>
                </tr>
              );
            })}
          </tbody>
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
              const isDone = s.done?.toLowerCase().includes("done") || s.done?.toLowerCase().includes("selesai");
              return (
                <tr key={row.key} style={{ height: "7mm" }}>
                  <td style={{ ...tdStyle, textAlign: "left", paddingLeft: "4mm" }}>{row.label}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, color: isDone ? "#059669" : "#dc2626" }}>
                    {s.done || "N/A"}
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
    // PAGE 1 HEADER TITLE
    <p key="title" style={pageTitleStyle}>
       PREVENTIVE MAINTENANCE SPLIT DUCT TECHNICAL REPORT
    </p>,

    // SECTION: UNIT INFO (EXPANDED TO 3 COLUMNS TO FIT ALL SPREADSHEET DATA)
    <div key="info" style={{ marginBottom: "6mm" }}>
       <table style={infoTableStyle}>
          <tbody>
            <tr>
              <td style={cellLabel}>{t("Category", lang)}</td>
              <td style={cellVal}>{header?.category || "-"}</td>
              <td style={cellLabel}>{t("Brand", lang)}</td>
              <td style={cellVal}>{header?.brand || "-"}</td>
              <td style={cellLabel}>{t("Service Date", lang)}</td>
              <td style={cellVal}>{header?.date ? new Date(header.date).toLocaleDateString(lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'id-ID') : "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Floor", lang)}</td>
              <td style={cellVal}>{header?.floor || "-"}</td>
              <td style={cellLabel}>{t("Model Number", lang)}</td>
              <td style={cellVal}>{header?.model || unit?.model || "-"}</td>
              <td style={cellLabel}>{t("SO / WO Number", lang)}</td>
              <td style={cellVal}>{header?.so_number || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Area", lang)}</td>
              <td style={cellVal}>{header?.area || "-"}</td>
              <td style={cellLabel}>{t("Serial Number", lang)}</td>
              <td style={cellVal}>{header?.serial_number || unit?.serial_number || "-"}</td>
              <td style={cellLabel}>{t("Visit Number", lang)}</td>
              <td style={cellVal}>{header?.visit || "1"}</td>
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

    // CATEGORIZED PERFORMANCE TABLES
    renderMeasurementTable("electrical", t("ELECTRICAL PERFORMANCE", lang), ELECTRICAL_ROWS),
    renderMeasurementTable("ahu-tech", t("AHU TECHNICAL PERFORMANCE", lang), AHU_TECHNICAL_ROWS),
    renderMeasurementTable("airside", t("AIR SIDE PERFORMANCE", lang), AIR_SIDE_ROWS),
    renderMeasurementTable("waterside", t("WATER SIDE PERFORMANCE", lang), WATER_SIDE_ROWS),
    renderChecklistTable("force-break-checklist", t("MAINTENANCE CHECKLIST", lang), CHECKLIST_ROWS),

    // SECTION: PARTS & COMPONENTS
    <div key="parts" style={{ marginBottom: "5mm" }}>
       <div style={categoryHeader}>{t("Parts & Components Information", lang)}</div>
       <table style={mainTableStyle}>
          <tbody>
            <tr>
              <td style={cellLabelSmall}>{t("V-Belt Type / Qty", lang)}</td>
              <td style={cellValSmall}>{parts?.vbelt_type || "-"}</td>
              <td style={cellLabelSmall}>{t("Motor Pulley Type", lang)}</td>
              <td style={cellValSmall}>{parts?.motor_pulley || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabelSmall}>{t("Motor Bearing Type / Qty", lang)}</td>
              <td style={cellValSmall}>{parts?.motor_bearing || "-"}</td>
              <td style={cellLabelSmall}>{t("Blower Pulley Type", lang)}</td>
              <td style={cellValSmall}>{parts?.blower_pulley || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabelSmall}>{t("Blower Bearing Type / Qty", lang)}</td>
              <td style={cellValSmall}>{parts?.blower_bearing || "-"}</td>
              <td style={cellLabelSmall}>-</td>
              <td style={cellValSmall}>-</td>
            </tr>
          </tbody>
        </table>
    </div>,

    // SECTION: TECHNICAL ADVICE
    <div key="advice" style={{ marginBottom: "6mm" }}>
      <div style={categoryHeader}>{t("Technical Advice & Summary", lang)}</div>
      <div style={adviceBoxStyle}>
        {technicalAdvice || "-"}
      </div>
    </div>,

    // FINDINGS & RECOMMENDATIONS
    (scope?.finding || scope?.recommendation) ? (
      <div key="findings-section" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>{t("Findings & Recommendations", lang)}</div>
        <table style={mainTableStyle}>
          <tbody>
            {scope?.finding && (
              <tr>
                <td style={{ ...cellLabelSmall, width: "30%" }}>{t("Finding", lang)}</td>
                <td style={{ ...cellValSmall, width: "70%", whiteSpace: "pre-wrap" }}>{typeof scope.finding === 'string' ? scope.finding : scope.finding.before}</td>
              </tr>
            )}
            {scope?.recommendation && (
              <tr>
                <td style={{ ...cellLabelSmall, width: "30%" }}>{t("Recommendation", lang)}</td>
                <td style={{ ...cellValSmall, width: "70%", whiteSpace: "pre-wrap" }}>{typeof scope.recommendation === 'string' ? scope.recommendation : scope.recommendation.before}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    ) : null,

    <div key="sign-force-break" style={{ marginTop: "10mm", minHeight: "200px" }}>
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

    // PHOTOS (ALWAYS SHOW SECTION)
    ...(photoChunks.length > 0 ? (
      photoChunks.map((chunk, chunkIdx) => (
        <div key={`photos-${chunkIdx}`} style={{ width: "100%", marginTop: "5mm" }}>
          <div style={categoryHeader}>
            {t("Maintenance Documentation Photos", lang)} {photoChunks.length > 1 ? `(Page ${chunkIdx + 1})` : ''}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm" }}>
            {chunk.map((p: any, i: number) => (
              <div key={i} style={photoWrapperStyle}>
                <img 
                  src={getPhotoUrl(p.photo_url)} 
                  alt={`Photo ${i}`} 
                  style={photoImgStyle} 
                />
                <p style={photoCaptionStyle}>
                  Photo {chunkIdx * 6 + i + 1}: {p.description || 'Maintenance Documentation'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))
    ) : [
      <div key="photos-placeholder" style={{ width: "100%", marginTop: "5mm" }}>
        <div style={categoryHeader}>{t("Maintenance Documentation Photos", lang)}</div>
        <div style={{ border: "1px dashed #cbd5e1", borderRadius: "2mm", padding: "10mm", textAlign: "center", color: "#94a3b8", fontSize: "8pt" }}>
          {t("No reports found.", lang)}
        </div>
      </div>
    ])
  ].filter(Boolean);
};

// --- STYLING (PREMIUM AESTHETICS) ---
const pageTitleStyle: React.CSSProperties = { 
  fontSize: "14pt", 
  fontWeight: 900, 
  color: "hsl(210, 100%, 20%)", 
  textAlign: "center", 
  marginBottom: "5mm", 
  marginTop: "-2mm", 
  textTransform: "uppercase",
  letterSpacing: "0.5mm"
};

const categoryHeader: React.CSSProperties = { 
  fontSize: "9pt", 
  fontWeight: 900, 
  color: "#003366", 
  borderLeft: "4px solid #003366", 
  paddingLeft: "2mm", 
  marginBottom: "2mm", 
  textTransform: "uppercase",
  backgroundColor: "hsl(210, 50%, 96%)",
  padding: "1.5mm 2mm"
};

const mainTableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "7.5pt" };
const tableHeaderRow: React.CSSProperties = { backgroundColor: "hsl(210, 30%, 94%)", borderBottom: "2px solid #003366" };
const thStyle: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "2mm 1mm", textAlign: "center", fontWeight: 900, fontSize: "7pt", color: "#003366" };
const tdStyle: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1.5mm 1mm", fontWeight: 600, color: "#1e293b" };

const infoTableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "8pt" };
const cellLabel: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1.2mm 2mm", backgroundColor: "hsl(210, 40%, 98%)", width: "15%", fontSize: "6.5pt", fontWeight: 900, color: "#475569", textTransform: "uppercase" };
const cellVal: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1.2mm 2mm", width: "18.3%", fontSize: "7.5pt", fontWeight: 700, color: "#0f172a" };

const cellLabelSmall: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1mm 2mm", backgroundColor: "hsl(210, 40%, 98%)", width: "25%", fontSize: "6.5pt", fontWeight: 900, color: "#475569", textTransform: "uppercase" };
const cellValSmall: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1mm 2mm", width: "25%", fontSize: "7.5pt", fontWeight: 700, color: "#0f172a" };

const adviceBoxStyle: React.CSSProperties = { 
  border: "1px solid #e2e8f0", 
  padding: "4mm", 
  fontSize: "8.5pt", 
  fontWeight: 500, 
  whiteSpace: "pre-wrap", 
  color: "#334155", 
  backgroundColor: "hsl(0, 0%, 99%)",
  minHeight: "15mm",
  borderRadius: "1mm"
};

const photoWrapperStyle: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1mm", borderRadius: "1.5mm", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const photoImgStyle: React.CSSProperties = { width: "100%", height: "50mm", objectFit: "cover", borderRadius: "1mm" };
const photoCaptionStyle: React.CSSProperties = { fontSize: "7pt", margin: "1mm 0 0.5mm 0", textAlign: "center", color: "#64748b", fontWeight: 700 };
