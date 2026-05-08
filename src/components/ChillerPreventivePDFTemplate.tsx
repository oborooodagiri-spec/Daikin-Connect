import React from "react";
import { ReportSignatureFooter } from "./ReportSignatureFooter";
import { t, Language } from "@/lib/i18n";

export const getChillerPreventiveSections = (data: any, unit: any, engineerName?: string, customerName?: string, lang: Language = 'id') => {
  const { header, scope, technicalAdvice, activity_photos } = data || {};
  
  const chunkArray = (arr: any[], size: number) => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const photoChunks = chunkArray(activity_photos, 6);

  const renderOperatingCondition = () => {
    const v = scope?.voltage || {};
    const fan = scope?.fan_unit || {};
    const water = scope?.water || {};

    return (
      <div key="operating-condition" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>OPERATING CONDITION</div>
        
        {/* Voltage Section */}
        <div style={{ marginBottom: "3mm" }}>
          <div style={subHeaderStyle}>A. VOLTAGE</div>
          <table style={mainTableStyle}>
            <tbody>
              <tr>
                <td style={{ ...tdStyle, width: "10%", fontWeight: 700 }}>RS</td>
                <td style={{ ...tdStyle, width: "23%", textAlign: "center", color: "#003366", fontWeight: 800 }}>{v.rs || "-"}</td>
                <td style={{ ...tdStyle, width: "10%", fontWeight: 700 }}>RT</td>
                <td style={{ ...tdStyle, width: "23%", textAlign: "center", color: "#003366", fontWeight: 800 }}>{v.rt || "-"}</td>
                <td style={{ ...tdStyle, width: "10%", fontWeight: 700 }}>ST</td>
                <td style={{ ...tdStyle, width: "24%", textAlign: "center", color: "#003366", fontWeight: 800 }}>{v.st || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Check Running Section */}
        <div style={{ marginBottom: "3mm" }}>
          <div style={subHeaderStyle}>B. CHECK RUNNING</div>
          <table style={mainTableStyle}>
            <thead>
              <tr style={tableHeaderRow}>
                <th style={{ ...thStyle, width: "15%" }}>CIRCUIT</th>
                <th style={{ ...thStyle, width: "45%" }}>AMPERE (R / S / T)</th>
                <th style={{ ...thStyle, width: "20%" }}>LP (PSI)</th>
                <th style={{ ...thStyle, width: "20%" }}>HP (PSI)</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((num) => {
                const c = scope?.circuits?.[num - 1] || {};
                return (
                  <tr key={num} style={{ height: "8mm" }}>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700 }}>Circuit {num}</td>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>
                      {c.amp_r || "-" } / {c.amp_s || "-" } / {c.amp_t || "-" }
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{c.pressure_lp || "-"}</td>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{c.pressure_hp || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Other Parameters Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5mm" }}>
          <div>
            <div style={subHeaderStyle}>C. CHECK RUNNING AMP FAN UNIT</div>
            <table style={mainTableStyle}>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, width: "15%", fontWeight: 700 }}>R</td>
                  <td style={{ ...tdStyle, width: "15%", fontWeight: 700 }}>S</td>
                  <td style={{ ...tdStyle, width: "15%", fontWeight: 700 }}>T</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{fan.r || "-"}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{fan.s || "-"}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{fan.t || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <div style={subHeaderStyle}>WATER & SETTING</div>
            <table style={mainTableStyle}>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, fontSize: "7pt" }}>Water INLET Temp</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{water.inlet_temp || "-"} °C</td>
                  <td style={{ ...tdStyle, fontSize: "7pt" }}>Water OUTLET Temp</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{water.outlet_temp || "-"} °C</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, fontSize: "7pt", fontWeight: 900, color: "#2563eb" }}>DELTA T (In - Out)</td>
                  <td colSpan={3} style={{ ...tdStyle, textAlign: "center", color: "#2563eb", fontWeight: 900, fontSize: "10pt" }}>{water.delta_t || "-"} °C</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, fontSize: "7pt" }}>Pressure Water INLET</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{water.inlet_pressure || "-"} bar</td>
                  <td style={{ ...tdStyle, fontSize: "7pt" }}>Pressure Water OUTLET</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>{water.outlet_pressure || "-"} bar</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, fontSize: "7pt", fontWeight: 900, color: "#2563eb" }}>DELTA P (In - Out)</td>
                  <td colSpan={3} style={{ ...tdStyle, textAlign: "center", color: "#2563eb", fontWeight: 900, fontSize: "10pt" }}>{water.delta_p || "-"} bar</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ ...tdStyle, fontWeight: 700 }}>Setting Temp EWT</td>
                  <td colSpan={2} style={{ ...tdStyle, textAlign: "center", color: "#16a34a", fontWeight: 900, fontSize: "10pt" }}>{scope?.setting_temp_ewt || "-"} °C</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const CHECKLIST_ROWS = [
    { key: "check_leak", label: "Check Oil & Refrigerant Leaks" },
    { key: "check_vibration", label: "Check Compressor Vibration & Noise" },
    { key: "check_oil_level", label: "Check Oil Level & Color" },
    { key: "check_refrigerant", label: "Check Refrigerant Charge (Sight Glass)" },
    { key: "clean_condenser", label: "Clean Condenser Coils / Tubes" },
    { key: "check_strainer", label: "Check Water Strainer" },
    { key: "check_control", label: "Check Control Panel & Safety Devices" },
  ];

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
                <tr style={{ height: "7mm" }}>
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
                        {isDone ? "DONE" : (s.done || s.before || "N/A")}
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
              <td style={cellVal}>CHILLER (WCP & SMALL)</td>
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
              <td style={cellLabel}>{t("Capacity", lang)}</td>
              <td style={cellVal}>{header?.nominal_capacity || "-"}</td>
            </tr>
            <tr>
               <td style={cellLabel}>{t("Service Team", lang)}</td>
               <td colSpan={5} style={cellVal}>{header?.team_opt || engineerName || "-"}</td>
            </tr>
          </tbody>
        </table>
    </div>,

    renderOperatingCondition(),
    renderChecklistTable("chiller-checklist", "MAINTENANCE CHECKLIST", CHECKLIST_ROWS),

    // FINDINGS & RECOMMENDATIONS
    (scope?.finding || scope?.recommendation || technicalAdvice) ? (
      <div key="findings-section" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>{t("Findings & Recommendations", lang)}</div>
        <table style={mainTableStyle}>
          <tbody>
            {(scope?.finding || technicalAdvice) && (
              <tr>
                <td style={{ ...cellLabelSmall, width: "30%" }}>{t("Finding", lang)}</td>
                <td style={{ ...cellValSmall, width: "70%", whiteSpace: "pre-wrap" }}>
                  {technicalAdvice && technicalAdvice !== "-" ? technicalAdvice : (typeof scope?.finding === 'string' ? scope.finding : scope?.finding?.before || "-")}
                </td>
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

const subHeaderStyle: React.CSSProperties = { fontSize: "8pt", fontWeight: 900, color: "#475569", marginBottom: "1.5mm", textTransform: "uppercase" };
const mainTableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginBottom: "4mm", tableLayout: "fixed" };
const cellLabel: React.CSSProperties = { width: "18%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "7pt", fontWeight: 700, color: "#475569", textTransform: "uppercase" };
const cellVal: React.CSSProperties = { width: "15%", border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "8pt", fontWeight: 700, color: "#0f172a" };
const cellLabelSmall: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1.5mm 2mm", backgroundColor: "#f8fafc", width: "25%", fontSize: "7pt", fontWeight: 900, color: "#475569", textTransform: "uppercase" };
const cellValSmall: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1.5mm 2mm", width: "25%", fontSize: "8pt", fontWeight: 700, color: "#0f172a" };
const categoryHeader: React.CSSProperties = { backgroundColor: "#f1f5f9", paddingTop: "2mm", paddingBottom: "2mm", paddingLeft: "4mm", paddingRight: "4mm", fontSize: "9pt", fontWeight: 900, color: "#003366", borderLeft: "4px solid #00a1e4", marginBottom: "2mm", textTransform: "uppercase", letterSpacing: "0.5px" };
const tableHeaderRow: React.CSSProperties = { backgroundColor: "#f8fafc" };
const thStyle: React.CSSProperties = { border: "1px solid #e2e8f0", paddingTop: "2mm", paddingBottom: "2mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "7.5pt", fontWeight: 900, color: "#475569", textTransform: "uppercase", textAlign: "center" };
const tdStyle: React.CSSProperties = { border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "8.5pt" };
const photoWrapperStyle: React.CSSProperties = { border: "1px solid #e2e8f0", paddingTop: "1mm", paddingBottom: "1mm", paddingLeft: "1mm", paddingRight: "1mm", borderRadius: "1.5mm", backgroundColor: "white", position: "relative" };
const photoImgStyle: React.CSSProperties = { width: "100%", height: "45mm", objectFit: "cover", borderRadius: "1mm" };
const photoCaptionStyle: React.CSSProperties = { fontSize: "6.5pt", marginTop: "1.5mm", textAlign: "center", color: "#64748b", fontWeight: 600 };
