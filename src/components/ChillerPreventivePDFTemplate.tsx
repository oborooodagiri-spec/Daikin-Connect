import React from "react";
import { ReportSignatureFooter } from "./ReportSignatureFooter";
import { t, Language } from "@/lib/i18n";
import { getPhotoUrl } from "@/lib/photo_utils";

export const getChillerPreventiveSections = (data: any, unit: any, engineerName?: string, customerName?: string, lang: Language = 'id') => {
  const { header, scope, technicalAdvice, activity_photos } = data || {};
  
  const chunkArray = (arr: any[], size: number) => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const photoChunks = chunkArray(activity_photos, 6);

  const formatMeasurement = (val: any) => {
    if (typeof val === "object" && val !== null) {
      const bStr = val.before && val.before !== "-" && val.before !== "" ? val.before : "";
      const aStr = val.after && val.after !== "-" && val.after !== "" ? val.after : "";
      let r = val.remarks && val.remarks !== "-" && val.remarks !== "" ? val.remarks : "";

      if (bStr && aStr) {
        const bNum = parseFloat(String(bStr).replace(',', '.'));
        const aNum = parseFloat(String(aStr).replace(',', '.'));
        
        if (!isNaN(bNum) && !isNaN(aNum)) {
            const diff = aNum - bNum;
            r = diff === 0 ? "0.00" : diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
        }

        if (r) return `${bStr} ➔ ${aStr} [${r}]`;
        return `${bStr} ➔ ${aStr}`;
      }
      return aStr || bStr || "-";
    }
    return val || "-";
  };

  const renderVoltage = () => {
    const v = scope?.voltage || {};
    return (
      <div key="section-a" style={{ marginBottom: "5mm" }}>
        <div style={subHeaderStyle}>A. VOLTAGE</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr>
              <td style={cellLabelSmall}>RS</td>
              <td style={{ ...cellValSmall, textAlign: "center" }}>{formatMeasurement(v.rs)}</td>
              <td style={cellLabelSmall}>RT</td>
              <td style={{ ...cellValSmall, textAlign: "center" }}>{formatMeasurement(v.rt)}</td>
              <td style={cellLabelSmall}>ST</td>
              <td style={{ ...cellValSmall, textAlign: "center" }}>{formatMeasurement(v.st)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderCheckRunning = () => {
    const circuits = scope?.circuits || [1, 2, 3, 4, 5].map(i => ({ amp_r: "-", amp_s: "-", amp_t: "-", lp: "-", hp: "-" }));
    return (
      <div key="section-b" style={{ marginBottom: "5mm" }}>
        <div style={subHeaderStyle}>B. CHECK RUNNING (COMPRESSOR)</div>
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
            {circuits.map((c: any, i: number) => (
              <tr key={i} style={{ height: "8mm" }}>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, backgroundColor: "#f8fafc" }}>Circuit {i + 1}</td>
                <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "7pt" }}>
                    <span>R: {formatMeasurement(c.amp_r)}</span>
                    <span>S: {formatMeasurement(c.amp_s)}</span>
                    <span>T: {formatMeasurement(c.amp_t)}</span>
                  </div>
                </td>
                <td style={{ ...tdStyle, textAlign: "center", fontSize: "8pt" }}>{formatMeasurement(c.lp)}</td>
                <td style={{ ...tdStyle, textAlign: "center", fontSize: "8pt" }}>{formatMeasurement(c.hp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFanUnit = () => {
    const fan = scope?.fan_unit || {};
    return (
      <div key="section-c" style={{ marginBottom: "5mm" }}>
        <div style={subHeaderStyle}>C. FAN UNIT AMP</div>
        <table style={mainTableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>R</th>
              <th style={thStyle}>S</th>
              <th style={thStyle}>T</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800, fontSize: "9pt" }}>{formatMeasurement(fan.r)}</td>
              <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800, fontSize: "9pt" }}>{formatMeasurement(fan.s)}</td>
              <td style={{ ...tdStyle, textAlign: "center", color: "#003366", fontWeight: 800, fontSize: "9pt" }}>{formatMeasurement(fan.t)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderWaterParameters = () => {
    const water = scope?.water || {};
    return (
      <div key="section-d" style={{ marginBottom: "5mm" }}>
        <div style={subHeaderStyle}>D. WATER PARAMETERS</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr>
              <td style={cellLabelSmall}>Inlet Temp</td>
              <td style={{ ...cellValSmall, textAlign: "center" }}>{formatMeasurement(water.inlet_temp)} °C</td>
              <td style={cellLabelSmall}>Outlet Temp</td>
              <td style={{ ...cellValSmall, textAlign: "center" }}>{formatMeasurement(water.outlet_temp)} °C</td>
              <td style={{ ...cellLabelSmall, color: "#2563eb", backgroundColor: "#eff6ff" }}>DELTA T</td>
              <td style={{ ...cellValSmall, textAlign: "center", color: "#2563eb" }}>{formatMeasurement(water.delta_t)} °C</td>
            </tr>
            <tr>
              <td style={cellLabelSmall}>Inlet Press</td>
              <td style={{ ...cellValSmall, textAlign: "center" }}>{formatMeasurement(water.inlet_pressure)} bar</td>
              <td style={cellLabelSmall}>Outlet Press</td>
              <td style={{ ...cellValSmall, textAlign: "center" }}>{formatMeasurement(water.outlet_pressure)} bar</td>
              <td style={{ ...cellLabelSmall, color: "#2563eb", backgroundColor: "#eff6ff" }}>DELTA P</td>
              <td style={{ ...cellValSmall, textAlign: "center", color: "#2563eb" }}>{formatMeasurement(water.delta_p)} bar</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderSetting = () => {
    return (
      <div key="section-e" style={{ marginBottom: "5mm" }}>
        <div style={subHeaderStyle}>E. SETTING</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr>
              <td style={{ ...cellLabelSmall, width: "50%", textAlign: "right", paddingRight: "4mm" }}>Setting Temp EWT</td>
              <td style={{ ...cellValSmall, width: "50%", textAlign: "center", color: "#16a34a", fontSize: "10pt" }}>{formatMeasurement(scope?.setting_temp_ewt)} °C</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderChecklistTable = () => {
    const rows = [
      { key: "check_leak", label: "Check Oil & Refrigerant Leaks" },
      { key: "check_vibration", label: "Check Compressor Vibration & Noise" },
      { key: "check_oil_level", label: "Check Oil Level & Color" },
      { key: "check_refrigerant", label: "Check Refrigerant Charge (Sight Glass)" },
      { key: "clean_condenser", label: "Clean Condenser Coils / Tubes" },
      { key: "check_strainer", label: "Check Water Strainer" },
      { key: "check_control", label: "Check Control Panel & Safety Devices" },
    ];

    return (
      <div key="checklist" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>MAINTENANCE CHECKLIST</div>
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
                <tr key={row.key} style={{ height: "7.5mm" }}>
                  <td style={{ ...tdStyle, textAlign: "left", paddingLeft: "4mm" }}>{row.label}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                     <span style={{ 
                        padding: "1mm 3mm",
                        borderRadius: "1mm", 
                        backgroundColor: isDone ? "#f0fdf4" : "#fef2f2",
                        color: isDone ? "#16a34a" : "#dc2626",
                        fontSize: "7pt",
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
    // PAGE 1: HEADER & OPERATING CONDITION
    <div key="page1-header" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>UNIT INFORMATION</div>
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
          </tbody>
        </table>
    </div>,

    <div key="op-header" style={categoryHeader}>OPERATING CONDITION</div>,
    renderVoltage(),
    renderCheckRunning(),
    
    // Force page break before C/D/E to prevent footer truncation
    <div key="force-break-cde" style={{ width: "100%" }}>
      {renderFanUnit()}
      {renderWaterParameters()}
      {renderSetting()}
    </div>,

    renderChecklistTable(),

    // PAGE: DOCUMENTATION & ADVICE (Force new page, keep header+content together)
    <div key="force-break-documentation" style={{ width: "100%" }}>
      <div style={{ ...categoryHeader, marginBottom: "5mm" }}>DOCUMENTATION & ADVICE</div>
      
      <div style={{ marginBottom: "5mm" }}>
        <div style={subHeaderStyle}>TECHNICAL ADVICE & SUMMARY</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr>
              <td style={{ ...cellLabelSmall, width: "25%" }}>{t("Technical Advice", lang)}</td>
              <td style={{ ...cellValSmall, width: "75%", height: "20mm", verticalAlign: "top" }}>
                {technicalAdvice && technicalAdvice !== "-" ? technicalAdvice : (scope?.finding || "-")}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "10mm" }}>
           <ReportSignatureFooter 
             preparedBy={engineerName || ""}
             reviewedBy={data.engineerSignerName}
             witnessedBy={data.customerApproverName}
             reviewedDate={data.reviewedAt}
             witnessedDate={data.approvedAt}
             lang={lang}
             isBulkSync={data.isBulkSync}
           />
        </div>
      </div>
    </div>,

    // PHOTOS (each chunk gets its own page)
    ...(photoChunks.length > 0 ? (
      photoChunks.map((chunk, chunkIdx) => (
        <div key={`photos-${chunkIdx}`} style={{ width: "100%", marginBottom: "5mm" }}>
          <div style={subHeaderStyle}>
            {t("Maintenance Documentation Photos", lang)} {photoChunks.length > 1 ? `(Set ${chunkIdx + 1})` : ''}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3mm" }}>
            {chunk.map((p: any, i: number) => (
              <div key={i} style={photoWrapperStyle}>
                <img src={getPhotoUrl(p.photo_url)} alt={`Photo ${i}`} style={photoImgStyle} />
                <p style={photoCaptionStyle}>{p.label || p.description || 'Maintenance Documentation'}</p>
              </div>
            ))}
          </div>
        </div>
      ))
    ) : null),
  ].filter(Boolean);
};

const subHeaderStyle: React.CSSProperties = { fontSize: "8.5pt", fontWeight: 900, color: "#1e293b", marginBottom: "2mm", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", paddingBottom: "1mm" };
const mainTableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginBottom: "4mm", tableLayout: "fixed" };
const cellLabel: React.CSSProperties = { width: "18%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "7pt", fontWeight: 700, color: "#475569", textTransform: "uppercase" };
const cellVal: React.CSSProperties = { width: "15%", border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "8pt", fontWeight: 700, color: "#0f172a" };
const cellLabelSmall: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1.5mm 2mm", backgroundColor: "#f8fafc", width: "25%", fontSize: "7pt", fontWeight: 900, color: "#475569", textTransform: "uppercase" };
const cellValSmall: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1.5mm 2mm", width: "25%", fontSize: "8pt", fontWeight: 700, color: "#0f172a" };
const categoryHeader: React.CSSProperties = { backgroundColor: "#f1f5f9", paddingTop: "2.5mm", paddingBottom: "2.5mm", paddingLeft: "4mm", paddingRight: "4mm", fontSize: "10pt", fontWeight: 900, color: "#003366", borderLeft: "5px solid #00a1e4", marginBottom: "4mm", textTransform: "uppercase", letterSpacing: "0.5px" };
const tableHeaderRow: React.CSSProperties = { backgroundColor: "#f8fafc" };
const thStyle: React.CSSProperties = { border: "1px solid #e2e8f0", paddingTop: "2mm", paddingBottom: "2mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "7.5pt", fontWeight: 900, color: "#475569", textTransform: "uppercase", textAlign: "center" };
const tdStyle: React.CSSProperties = { border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "8.5pt" };
const photoWrapperStyle: React.CSSProperties = { border: "1px solid #e2e8f0", paddingTop: "1mm", paddingBottom: "1mm", paddingLeft: "1mm", paddingRight: "1mm", borderRadius: "1.5mm", backgroundColor: "white", position: "relative" };
const photoImgStyle: React.CSSProperties = { width: "100%", height: "45mm", objectFit: "cover", borderRadius: "1mm" };
const photoCaptionStyle: React.CSSProperties = { fontSize: "6.5pt", marginTop: "1.5mm", textAlign: "center", color: "#64748b", fontWeight: 600 };
