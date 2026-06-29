import React from "react";
import { ReportSignatureFooter } from "./ReportSignatureFooter";
import { t, Language } from "@/lib/i18n";
import { getPhotoUrl } from "@/lib/photo_utils";

export const getUWAPPreventiveSections = (data: any, unit: any, engineerName?: string, customerName?: string, lang: Language = 'id') => {
  const { header, scope, technicalAdvice, activity_photos } = data || {};
  
  const chunkArray = (arr: any[], size: number) => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const photoChunks = chunkArray(activity_photos, 6);

  const getVal = (key: string) => {
    if (scope && scope[key] && typeof scope[key] === 'object') {
      return scope[key].before || "-";
    }
    return "-";
  };

  const getAction = (key: string) => {
    if (scope && scope[key] && typeof scope[key] === 'object') {
      return scope[key].done || "N/A";
    }
    return "N/A";
  };

  const renderUnitInformation = () => {
    return (
      <div key="page1-header" style={{ marginBottom: "5mm" }}>
        <div style={categoryHeader}>UNIT INFORMATION</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr>
              <td style={cellLabel}>{t("Category", lang)}</td>
              <td style={cellVal}>{unit?.unit_type?.split(" > ").pop() || unit?.unit_type || "-"}</td>
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
      </div>
    );
  };

  const renderParameters = () => {
    const rows = [
      { k: "error", l: "Error" },
      { k: "temp_set_point_lwt", l: "Temp Set Point (LWT) (°C)" },
      { k: "temp_set_point_heat", l: "Temp Set Point (Heat) (°C)" },
      { k: "inlet_water_temp", l: "Inlet Water Temp (°C)" },
      { k: "outlet_water_temp", l: "Outlet Water Temp (°C)" },
      { k: "outdoor_temp", l: "Outdoor Temp (°C)" },
      { k: "discharge_temp_1", l: "Discharge Temp 1 (°C)" },
      { k: "discharge_temp_2", l: "Discharge Temp 2 (°C)" },
      { k: "suction_temp_1", l: "Suction Temp 1 (°C)" },
      { k: "suction_temp_2", l: "Suction Temp 2 (°C)" },
      { k: "capacity_1", l: "Capacity 1 (%)" },
      { k: "capacity_2", l: "Capacity 2 (%)" },
      { k: "fan_mode_1", l: "Fan Mode 1" },
      { k: "fan_mode_2", l: "Fan Mode 2" },
      { k: "running_time", l: "Running Time (min)" },
      { k: "running_hour_comp_1", l: "Running Hour Comp#1 (Hour)" },
      { k: "running_hour_comp_2", l: "Running Hour Comp#2 (Hour)" }
    ];

    const part1 = rows.slice(0, 14); // Up to Fan Mode 2
    const part2 = rows.slice(14); // From Running Time onwards

    return [
      <div key="section-1-part1" style={{ marginBottom: "5mm" }}>
        <div style={subHeaderStyle}>1. PARAMETER</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr style={tableHeaderRow}>
              <th style={{...thStyle, width:"50%", textAlign:"left", paddingLeft:"8px"}}>Description / Menu</th>
              <th style={{...thStyle, width:"50%"}}>Value</th>
            </tr>
            {part1.map((row, i) => (
              <tr key={i} style={{ height: "6mm" }}>
                <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>{row.l}</td>
                <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal(row.k)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
      <div key="section-1-part2" style={{ pageBreakBefore: "always", marginBottom: "5mm" }}>
        <div style={subHeaderStyle}>1. PARAMETER (CONT.)</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr style={tableHeaderRow}>
              <th style={{...thStyle, width:"50%", textAlign:"left", paddingLeft:"8px"}}>Description / Menu</th>
              <th style={{...thStyle, width:"50%"}}>Value</th>
            </tr>
            {part2.map((row, i) => (
              <tr key={i} style={{ height: "6mm" }}>
                <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>{row.l}</td>
                <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal(row.k)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ];
  };

  const renderOtherMeasures = () => {
    return (
      <div key="section-measures" style={{ marginBottom: "5mm" }}>
        
        <div style={subHeaderStyle}>2. REFRIGERANT PRESSURE</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr style={tableHeaderRow}>
              <th style={{...thStyle, width:"50%", textAlign:"left", paddingLeft:"8px"}}>Description / Menu</th>
              <th style={{...thStyle, width:"50%"}}>Value</th>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>High Pressure (Mpa)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("refrigerant_high_pressure")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Low Pressure (Mpa)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("refrigerant_low_pressure")}</td>
            </tr>
          </tbody>
        </table>
        <br/>

        <div style={subHeaderStyle}>3. OIL LEVEL</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr style={tableHeaderRow}>
              <th style={{...thStyle, width:"50%", textAlign:"left", paddingLeft:"8px"}}>Description / Menu</th>
              <th style={{...thStyle, width:"50%"}}>Value</th>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Upper Level Sight Glass (%)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("oil_upper_level")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Lower Level Sight Glass (%)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("oil_lower_level")}</td>
            </tr>
          </tbody>
        </table>
        <br/>

        <div style={subHeaderStyle}>4. LIQUID LINE</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr style={tableHeaderRow}>
              <th style={{...thStyle, width:"50%", textAlign:"left", paddingLeft:"8px"}}>Description / Menu</th>
              <th style={{...thStyle, width:"50%"}}>Value</th>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Sight Glass (Clear/Bubble)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("liquid_sight_glass")}</td>
            </tr>
          </tbody>
        </table>
        <br/>

        <div style={subHeaderStyle}>5. WATER PRESSURE</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr style={tableHeaderRow}>
              <th style={{...thStyle, width:"50%", textAlign:"left", paddingLeft:"8px"}}>Description / Menu</th>
              <th style={{...thStyle, width:"50%"}}>Value</th>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Inlet Evap Press (Kg/cm²)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("water_inlet_evap_press")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Outlet Evap Press (Kg/cm²)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("water_outlet_evap_press")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Evap Delta Press (Kg/cm²)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("water_evap_delta_press")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderElectricalMeasurement = () => {
    return (
      <div key="force-break-electrical" style={{ marginBottom: "5mm" }}>
        <div style={subHeaderStyle}>6. ELECTRICAL MEASUREMENT</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr style={tableHeaderRow}>
              <th style={{...thStyle, width:"50%", textAlign:"left", paddingLeft:"8px"}}>Description / Menu</th>
              <th style={{...thStyle, width:"50%"}}>Value</th>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Voltage R-S (Volts)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("voltage_rs")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Voltage R-T (Volts)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("voltage_rt")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Voltage S-T (Volts)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("voltage_st")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Current R (Amps)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("current_r")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Current S (Amps)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("current_s")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Current T (Amps)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("current_t")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Grounding Amps (Amps)</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("grounding_amps")}</td>
            </tr>
            <tr style={{ height: "6mm" }}>
              <td style={{ ...tdStyle, paddingLeft:"8px", fontSize:"8pt", fontWeight: 700, backgroundColor: "#f8fafc" }}>Number of Fans On</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize:"9pt", fontWeight: 800, color: "#003366" }}>{getVal("number_of_fans_on")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderChecklist = () => {
    const checklistItems = [
      { key: "check_leak", label: "Check Oil & Refrigerant Leaks" },
      { key: "check_vibration", label: "Check Compressor Vibration & Noise" },
      { key: "check_oil_level", label: "Check Oil Level & Color" },
      { key: "check_refrigerant", label: "Check Refrigerant Charge (Sight Glass)" },
      { key: "clean_condenser", label: "Clean Condenser Coils / Tubes" },
      { key: "check_strainer", label: "Check Water Strainer" },
      { key: "check_control", label: "Check Control Panel & Safety Devices" }
    ];
    return (
      <div key="section-checklist" style={{ marginBottom: "5mm" }}>
        <div style={subHeaderStyle}>MAINTENANCE CHECKLIST</div>
        <table style={{ ...mainTableStyle, marginTop: "2mm" }}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={{ ...thStyle, width: "70%", textAlign: "left", paddingLeft: "8px" }}>{t("Action Item", lang)}</th>
              <th style={{ ...thStyle, width: "30%", textAlign: "center" }}>{t("Status", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {checklistItems.map((item, index) => {
              const status = getAction(item.key);
              let badgeColor = "#64748b"; // default slate
              let badgeBg = "#f8fafc";
              if (status === "Done") { badgeColor = "#16a34a"; badgeBg = "#dcfce7"; }
              if (status === "Not Done" || status === "N/A") { badgeColor = "#dc2626"; badgeBg = "#fee2e2"; }
              if (status === "Replaced") { badgeColor = "#0284c7"; badgeBg = "#e0f2fe"; }
              
              return (
                <tr key={index} style={{ height: "7mm" }}>
                  <td style={{ ...tdStyle, paddingLeft: "8px", fontSize: "8pt", color: "#334155" }}>
                    {t(item.label, lang)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <div style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      fontSize: "7pt",
                      fontWeight: 800,
                      textTransform: "uppercase"
                    }}>
                      {status}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAdviceAndSignature = () => {
    return (
      <div key="force-break-signature" style={{ marginTop: "10mm", marginBottom: "5mm" }}>
        <div style={{...subHeaderStyle, marginBottom:"2mm"}}>DOCUMENTATION & ADVICE</div>
        <div style={{ fontSize: "9pt", fontWeight: "bold", marginBottom: "2mm", color:"#003366" }}>{t("TECHNICAL ADVICE & SUMMARY", lang)}</div>
        <table style={mainTableStyle}>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, width: "25%", backgroundColor: "#f8fafc", fontWeight: 700, fontSize: "8pt", padding: "8px" }}>
                {t("TECHNICAL ADVICE", lang)}
              </td>
              <td style={{ ...tdStyle, width: "75%", fontSize: "8pt", padding: "8px", verticalAlign: "top", minHeight: "20mm" }}>
                {technicalAdvice || "-"}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ marginTop: "10mm" }}>
          <ReportSignatureFooter 
             preparedBy={data.reviewedBy || engineerName || "TEKNISI LAPANGAN"}
             witnessedBy={customerName}
             reviewedBy={""}
             reviewedDate={data.reviewedAt}
             witnessedDate={data.approvedAt}
             lang={lang}
             isBulkSync={data.isBulkSync}
             customerSignatureUrl={typeof data !== 'undefined' ? (data.customerSignatureUrl || data.customer_signature) : undefined}
             engineerSignatureUrl={typeof data !== 'undefined' ? (data.reviewerSignatureUrl || data.reviewer_signature || data.engineerSignatureUrl || data.engineer_signature) : undefined}
             reviewerSignatureUrl={undefined}
             onCustomerSignClick={typeof data !== 'undefined' ? data.onCustomerSignClick : undefined}
             onEngineerSignClick={typeof data !== 'undefined' ? data.onEngineerSignClick : undefined}
          />
        </div>
      </div>
    );
  };

  const renderPhotos = () => {
    if (!photoChunks || photoChunks.length === 0) return [
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
    ];
    return photoChunks.map((chunk, chunkIndex) => (
      <div key={`force-break-photos-${chunkIndex}`} style={{ width: "100%", marginTop: "5mm", marginBottom: "5mm" }}>
        <div style={categoryHeader}>
          {t("Maintenance Documentation Photos", lang)} {photoChunks.length > 1 ? `(Page ${chunkIndex + 1})` : ''}
        </div>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4mm",
          justifyContent: "flex-start",
        }}>
          {chunk.map((p: any, index: number) => (
            <div key={index} style={{
              width: "calc(50% - 2mm)",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "#ffffff",
              marginBottom: "4mm"
            }}>
              <div style={{
                height: "140px",
                backgroundColor: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderBottom: "1px solid #e2e8f0"
              }}>
                <img 
                  src={getPhotoUrl(p.photo_url || p.url || p)} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  alt="Documentation" 
                />
              </div>
              <div style={{
                padding: "8px",
                fontSize: "7pt",
                color: "#64748b",
                textAlign: "center",
                fontWeight: 600,
                minHeight: "15px"
              }}>
                {p.label || p.description || `Photo ${chunkIndex * 6 + index + 1}: -`}
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return [
    renderUnitInformation(),
    ...renderParameters(),
    renderOtherMeasures(),
    renderElectricalMeasurement(),
    renderChecklist(),
    renderAdviceAndSignature(),
    ...renderPhotos()
  ];
};

const categoryHeader: React.CSSProperties = { backgroundColor: "#f1f5f9", paddingTop: "2.5mm", paddingBottom: "2.5mm", paddingLeft: "4mm", paddingRight: "4mm", fontSize: "10pt", fontWeight: 900, color: "#003366", borderLeft: "5px solid #00a1e4", marginBottom: "4mm", textTransform: "uppercase", letterSpacing: "0.5px" };

const subHeaderStyle = {
  backgroundColor: "#f1f5f9",
  color: "#003366",
  fontWeight: "bold",
  fontSize: "10pt",
  padding: "4px 8px",
  borderLeft: "4px solid #00a1e4",
  marginBottom: "3px"
};

const mainTableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: "Helvetica, Arial, sans-serif",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
};

const tableHeaderRow = {
  backgroundColor: "#f8fafc",
  color: "#003366",
};

const cellLabel: React.CSSProperties = { width: "18%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "7pt", fontWeight: 700, color: "#475569", textTransform: "uppercase" };
const cellVal: React.CSSProperties = { width: "15%", border: "1px solid #e2e8f0", paddingTop: "1.5mm", paddingBottom: "1.5mm", paddingLeft: "2mm", paddingRight: "2mm", fontSize: "8pt", fontWeight: 700, color: "#0f172a" };

const thStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  padding: "4px",
  fontSize: "8pt",
  fontWeight: "bold",
  textAlign: "center",
  textTransform: "uppercase"
};

const thSubStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  padding: "3px",
  fontSize: "7pt",
  fontWeight: 600,
  textAlign: "center",
  color: "#64748b"
};

const tdStyle = {
  border: "1px solid #e2e8f0",
  padding: "4px",
  fontSize: "8pt",
  color: "#334155"
};
