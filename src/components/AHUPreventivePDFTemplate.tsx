import React from "react";
import { ReportSignatureFooter } from "./ReportSignatureFooter";
import { t, Language } from "@/lib/i18n";

export const getAHUPreventiveSections = (data: any, unit: any, engineerName?: string, customerName?: string, lang: Language = 'id') => {
  const { header, scope, parts, technicalAdvice, activity_photos } = data || {};
  
  const chunkArray = (arr: any[], size: number) => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const photoChunks = chunkArray(activity_photos, 6);

  const renderAmpereTable = () => {
    // Flattened keys from reportDataHelper
    const r = scope?.["ampere_r"] || {};
    const s = scope?.["ampere_s"] || {};
    const t_ph = scope?.["ampere_t"] || {};
    const np = scope?.["ampere_nameplate"]?.before || "-";
    const kw = scope?.["kw"]?.before || "-";
    const rpm = scope?.["rpm"]?.before || "-";

    return (
      <div key="ampere" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>PERFORMA ELEKTRIKAL - AMPERE (A)</div>
        <table style={mainTableStyle}>
          <thead>
            <tr style={tableHeaderRow}>
              <th colSpan={3} style={thStyle}>NAME PLATE</th>
              <th colSpan={3} style={thStyle}>BEFORE</th>
              <th colSpan={3} style={thStyle}>AFTER</th>
              <th colSpan={3} style={thStyle}>MARGIN</th>
            </tr>
            <tr style={tableHeaderRow}>
              <th style={thSubStyle}>Kw</th>
              <th style={thSubStyle}>Rpm</th>
              <th style={thSubStyle}>Amp</th>
              <th style={thSubStyle}>R</th>
              <th style={thSubStyle}>S</th>
              <th style={thSubStyle}>T</th>
              <th style={thSubStyle}>R</th>
              <th style={thSubStyle}>S</th>
              <th style={thSubStyle}>T</th>
              <th style={thSubStyle}>R</th>
              <th style={thSubStyle}>S</th>
              <th style={thSubStyle}>T</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: "7mm" }}>
              <td style={tdCenterStyle}>{kw}</td>
              <td style={tdCenterStyle}>{rpm}</td>
              <td style={tdCenterStyle}>{np}</td>
              <td style={tdBlueStyle}>{r.before || "-"}</td>
              <td style={tdBlueStyle}>{s.before || "-"}</td>
              <td style={tdBlueStyle}>{t_ph.before || "-"}</td>
              <td style={tdBlueStyle}>{r.after || "-"}</td>
              <td style={tdBlueStyle}>{s.after || "-"}</td>
              <td style={tdBlueStyle}>{t_ph.after || "-"}</td>
              <td style={tdCenterStyle}>{r.remarks || "-"}</td>
              <td style={tdCenterStyle}>{s.remarks || "-"}</td>
              <td style={tdCenterStyle}>{t_ph.remarks || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderPerformanceTable = () => {
    const supply = scope?.["supply_air_temp"] || {};
    const return_t = scope?.["return_air_temp"] || {};
    const room = scope?.["room_temp"] || {};
    const airflow = scope?.["air_flow"] || {};

    return (
      <div key="performance" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>PERFORMA TERMAL & UDARA</div>
        <table style={mainTableStyle}>
          <thead>
            <tr style={tableHeaderRow}>
              <th colSpan={3} style={thStyle}>SUPPLY AIR (oC)</th>
              <th colSpan={3} style={thStyle}>RETURN AIR (oC)</th>
              <th colSpan={3} style={thStyle}>ROOM TEMPERATURE (C)</th>
              <th colSpan={3} style={thStyle}>AIR FLOW (FT/M)</th>
            </tr>
            <tr style={tableHeaderRow}>
              <th style={thSubStyle}>Before</th>
              <th style={thSubStyle}>After</th>
              <th style={thSubStyle}>Margin</th>
              <th style={thSubStyle}>Before</th>
              <th style={thSubStyle}>After</th>
              <th style={thSubStyle}>Margin</th>
              <th style={thSubStyle}>Before</th>
              <th style={thSubStyle}>After</th>
              <th style={thSubStyle}>Margin</th>
              <th style={thSubStyle}>Before</th>
              <th style={thSubStyle}>After</th>
              <th style={thSubStyle}>Margin</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: "8mm" }}>
              <td style={tdBlueStyle}>{supply.before || "-"}</td>
              <td style={tdBlueStyle}>{supply.after || "-"}</td>
              <td style={tdCenterStyle}>{supply.remarks || "-"}</td>
              <td style={tdBlueStyle}>{return_t.before || "-"}</td>
              <td style={tdBlueStyle}>{return_t.after || "-"}</td>
              <td style={tdCenterStyle}>{return_t.remarks || "-"}</td>
              <td style={tdBlueStyle}>{room.before || "-"}</td>
              <td style={tdBlueStyle}>{room.after || "-"}</td>
              <td style={tdCenterStyle}>{room.remarks || "-"}</td>
              <td style={tdBlueStyle}>{airflow.before || "-"}</td>
              <td style={tdBlueStyle}>{airflow.after || "-"}</td>
              <td style={tdCenterStyle}>{airflow.remarks || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummaryTable = () => (
    <div key="summary" style={{ marginBottom: "5mm" }}>
       <table style={mainTableStyle}>
          <thead>
            <tr style={tableHeaderRow}>
               <th style={{ ...thStyle, width: "25%" }}>PERFORMA UNIT</th>
               <th style={{ ...thStyle, width: "75%", textAlign: "left", paddingLeft: "4mm" }}>CATATAN TEKNIS / REMARKS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
               <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, color: "#16a34a", fontSize: "12pt" }}>
                  {scope?.["performa_unit"]?.before || "-"}
               </td>
               <td style={{ ...tdStyle, verticalAlign: "top", height: "15mm", padding: "2mm 4mm", fontWeight: 500, color: "#334155" }}>
                  {header?.engineer_note || technicalAdvice || "-"}
               </td>
            </tr>
          </tbody>
       </table>
    </div>
  );

  return [
    // PAGE TITLE
    <p key="title" style={pageTitleStyle}>
       PREVENTIVE MAINTENANCE AHU TECHNICAL REPORT
    </p>,

    // UNIT INFO
    <div key="info" style={{ marginBottom: "5mm" }}>
       <table style={infoTableStyle}>
          <tbody>
            <tr>
              <td style={cellLabel}>{t("Category", lang)}</td>
              <td style={cellVal}>AHU</td>
              <td style={cellLabel}>{t("Brand", lang)}</td>
              <td style={cellVal}>{header?.brand || unit?.brand || "-"}</td>
              <td style={cellLabel}>{t("Service Date", lang)}</td>
              <td style={cellVal}>{header?.date ? new Date(header.date).toLocaleDateString() : "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Floor", lang)}</td>
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
              <td style={cellLabel}>Visit Number</td>
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

    renderAmpereTable(),
    renderPerformanceTable(),
    renderSummaryTable(),

    // FINDINGS & RECOMMENDATIONS
    (scope?.finding || scope?.recommendation) ? (
      <div key="findings-section" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>{t("Findings & Recommendations", lang)}</div>
        <table style={mainTableStyle}>
          <tbody>
            {scope?.finding && (
              <tr>
                <td style={{ ...cellLabel, width: "30%" }}>{t("Finding", lang)}</td>
                <td style={{ ...cellVal, width: "70%", whiteSpace: "pre-wrap" }}>{scope.finding.before}</td>
              </tr>
            )}
            {scope?.recommendation && (
              <tr>
                <td style={{ ...cellLabel, width: "30%" }}>{t("Recommendation", lang)}</td>
                <td style={{ ...cellVal, width: "70%", whiteSpace: "pre-wrap" }}>{scope.recommendation.before}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    ) : null,

    // SIGNATURE
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

    // PHOTOS
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
                <p style={photoCaptionStyle}>Photo {chunkIdx * 6 + i + 1}: {p.description || 'Maintenance Documentation'}</p>
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

// --- STYLING ---
const pageTitleStyle: React.CSSProperties = { fontSize: "14pt", fontWeight: 900, color: "#003366", textAlign: "center", marginBottom: "5mm", textTransform: "uppercase", letterSpacing: "0.5mm" };
const categoryHeader: React.CSSProperties = { fontSize: "9pt", fontWeight: 900, color: "#003366", borderLeft: "4px solid #00a1e4", padding: "1.5mm 2mm", marginBottom: "2mm", textTransform: "uppercase", backgroundColor: "#f1f5f9" };
const mainTableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "7.5pt", tableLayout: "fixed" };
const tableHeaderRow: React.CSSProperties = { backgroundColor: "#f8fafc" };
const thStyle: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "2mm 1mm", textAlign: "center", fontWeight: 900, color: "#475569", textTransform: "uppercase" };
const thSubStyle: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1mm", textAlign: "center", fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "6.5pt", backgroundColor: "white" };
const tdStyle: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1.5mm 2mm", fontWeight: 600, color: "#1e293b" };
const tdCenterStyle: React.CSSProperties = { ...tdStyle, textAlign: "center" };
const tdBlueStyle: React.CSSProperties = { ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 };

const infoTableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "8pt" };
const cellLabel: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1.2mm 2mm", backgroundColor: "#f8fafc", width: "15%", fontSize: "6.5pt", fontWeight: 900, color: "#475569", textTransform: "uppercase" };
const cellVal: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1.2mm 2mm", width: "18.3%", fontSize: "7.5pt", fontWeight: 700, color: "#0f172a" };

const photoWrapperStyle: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1mm", borderRadius: "1.5mm", backgroundColor: "white" };
const photoImgStyle: React.CSSProperties = { width: "100%", height: "45mm", objectFit: "cover", borderRadius: "1mm" };
const photoCaptionStyle: React.CSSProperties = { fontSize: "6.5pt", margin: "1mm 0", textAlign: "center", color: "#64748b", fontWeight: 700 };
