import { ReportSignatureFooter } from './ReportSignatureFooter';
import { t, Language } from '@/lib/i18n';

export const getAuditSections = (data: any, unit: any) => {
  const techData = data.t || data.technical_json || {};
  const { activity_photos } = data || {};

  // Matrix Averages calculation
  const getAvg = (arr: any) => {
    const valid = arr?.filter((v: any) => v && !isNaN(v)) || [];
    return valid.length > 0 ? (valid.reduce((a: any, b: any) => parseFloat(a) + parseFloat(b), 0) / valid.length).toFixed(2) : "0.00";
  };

  const avgSupply = getAvg(techData.supplyVelocity);
  const avgReturn = getAvg(techData.returnVelocity);
  const avgFresh = getAvg(techData.freshVelocity);
  
  const chunkArray = (arr: any[], size: number) => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const photoChunks = chunkArray(activity_photos, 6);
  const lang = data.lang as Language || 'id';

  return [
    // TITLE
    <div key="title_section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4mm" }}>
      <p style={{ fontSize: "12pt", fontWeight: 900, color: "#003366", textDecoration: "underline", margin: 0 }}>
        {t("FORM PENGUKURAN (AUDIT)", lang)}
      </p>
      {data.healthScore !== undefined && (
        <div style={{ padding: "1.5mm 4mm", border: "1.5pt solid #003366", borderRadius: "1.5mm", textAlign: "center" }}>
          <p style={{ fontSize: "6pt", fontWeight: 900, color: "#003366", margin: 0, textTransform: "uppercase" }}>Health Vitality Score</p>
          <p style={{ fontSize: "14pt", fontWeight: 900, color: data.healthScore < 50 ? "#e11d48" : "#059669", margin: 0 }}>{data.healthScore}%</p>
          <p style={{ fontSize: "6pt", fontWeight: 900, color: "#64748b", margin: 0 }}>Status: {data.healthStatus || 'N/A'}</p>
        </div>
      )}
    </div>,

    // SECTION A: GENERAL DATA
    <div key="general" style={{ marginBottom: "5mm" }}>
      <div style={sectionHeader}>{t("A. GENERAL DATA", lang)}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", fontWeight: "bold" }}>
        <tbody>
            <tr>
              <td style={cellLabel}>{t("Room / Tenant", lang)}</td>
              <td style={cellVal}>{unit?.room_tenant || "-"}</td>
            <td style={cellLabel}>Design Air Temp</td>
            <td style={cellVal}>{data.design_temp || 'N/A'} (°C)</td>
          </tr>
          <tr>
            <td style={cellLabel}>Unit Tag Number</td>
            <td style={cellVal}>{data.unit_tag || unit?.tag_number || '-'}</td>
            <td style={cellLabel}>Design Cooling Cap.</td>
            <td style={cellVal}>{data.design_cooling_capacity || '0'} (Btu/h)</td>
          </tr>
          <tr>
            <td style={cellLabel}>Machine Brand</td>
            <td style={cellVal}>{unit?.brand || '-'} ({unit?.model})</td>
            <td style={cellLabel}>Design Air Flow</td>
            <td style={cellVal}>{data.design_airflow || '0'} (Cfm)</td>
          </tr>
          <tr>
            <td style={cellLabel}>Machine Type</td>
            <td style={cellVal}>{unit?.unit_type || 'FCU/AHU'}</td>
            <td style={cellLabel}>-</td>
            <td style={cellVal}>-</td>
          </tr>
        </tbody>
      </table>
    </div>,

    // SECTION B: AIR SIDE
    <div key="airside" style={{ marginBottom: "5mm" }}>
      <div style={sectionHeader}>{t("B. AIR SIDE MEASUREMENTS", lang)}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", fontWeight: "bold", textAlign: "center", marginBottom: "2mm" }}>
        <tbody style={{ backgroundColor: "#f8fafc" }}>
          <tr>
            <td style={{ ...tdStyle, textAlign: "left", width: "25%", backgroundColor: "#f1f5f9" }}>{t("Leaving Coil Temp", lang)}</td>
            <td style={tdStyle}>{data.leaving_db || '0'} (°C) DB</td>
            <td style={tdStyle}>{data.leaving_wb || '0'} (°C) WB</td>
            <td style={tdStyle}>{data.leaving_rh || '0'} % RH</td>
          </tr>
          <tr>
            <td style={{ ...tdStyle, textAlign: "left", backgroundColor: "#f1f5f9" }}>{t("Entering Coil Temp", lang)}</td>
            <td style={tdStyle}>{data.entering_db || '0'} (°C) DB</td>
            <td style={tdStyle}>{data.entering_wb || '0'} (°C) WB</td>
            <td style={tdStyle}>{data.entering_rh || '0'} % RH</td>
          </tr>
        </tbody>
      </table>
      
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt", fontWeight: "bold", textAlign: "center" }}>
        <thead>
          <tr style={{ backgroundColor: "#003366", color: "white" }}>
             <th colSpan={3} style={thStyleWhite}>{t("Unit ID", lang)} Area (m2)</th>
             <th colSpan={3} style={thStyleWhite}>{t("Air Velocity", lang)} (m/s) - 15 Points Matrix</th>
          </tr>
          <tr style={{ backgroundColor: "#f1f5f9", color: "#003366" }}>
             <th style={thStyle}>{t("Supply", lang)}</th><th style={thStyle}>{t("Return", lang)}</th><th style={thStyle}>{t("Fresh Air", lang)}</th>
             <th style={thStyle}>{t("Supply", lang)}</th><th style={thStyle}>{t("Return", lang)}</th><th style={thStyle}>{t("Fresh Air", lang)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>{techData.supplyArea || 'N/A'}</td>
            <td style={tdStyle}>{techData.returnArea || 'N/A'}</td>
            <td style={tdStyle}>{techData.freshArea || 'N/A'}</td>
            
            <td style={{ ...tdStyle, textAlign: "left", verticalAlign: "top", padding: "1mm" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px" }}>
                {Array.from({length: 15}).map((_, i) => (
                  <div key={i} style={{ borderBottom: "0.1pt solid #eee" }}>{i+1}. {techData.supplyVelocity?.[i] || '0'}</div>
                ))}
              </div>
              <div style={{ marginTop: "1mm", color: "#00a1e4", borderTop: "1px solid #ddd", paddingTop: "0.5mm" }}>Avg: {avgSupply} m/s</div>
            </td>
            
            <td style={{ ...tdStyle, textAlign: "left", verticalAlign: "top", padding: "1mm" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px" }}>
                {Array.from({length: 15}).map((_, i) => (
                  <div key={i} style={{ borderBottom: "0.1pt solid #eee" }}>{i+1}. {techData.returnVelocity?.[i] || '0'}</div>
                ))}
              </div>
              <div style={{ marginTop: "1mm", color: "#00a1e4", borderTop: "1px solid #ddd", paddingTop: "0.5mm" }}>Avg: {avgReturn} m/s</div>
            </td>
            
            <td style={{ ...tdStyle, textAlign: "left", verticalAlign: "top", padding: "1mm" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px" }}>
                {Array.from({length: 15}).map((_, i) => (
                  <div key={i} style={{ borderBottom: "0.1pt solid #eee" }}>{i+1}. {techData.freshVelocity?.[i] || '0'}</div>
                ))}
              </div>
              <div style={{ marginTop: "1mm", color: "#00a1e4", borderTop: "1px solid #ddd", paddingTop: "0.5mm" }}>Avg: {avgFresh} m/s</div>
            </td>
          </tr>
          <tr style={{ backgroundColor: "#f8fafc", fontWeight: "900" }}>
            <td colSpan={3} style={{ ...tdStyle, textAlign: "right", color: "#003366" }}>TOTAL CALCULATED AIR FLOW (Cfm)</td>
            <td style={{ ...tdStyle, color: "#d946ef" }}>{techData.totalCfmSupply || '0'}</td>
            <td style={{ ...tdStyle, color: "#d946ef" }}>{techData.totalCfmReturn || '0'}</td>
            <td style={{ ...tdStyle, color: "#d946ef" }}>{techData.totalCfmFresh || '0'}</td>
          </tr>
        </tbody>
      </table>
    </div>,

    // SECTION C & D: WATER & ELECTRICAL
    <div key="waterside" style={{ display: "flex", gap: "4mm", marginBottom: "5mm" }}>
      <div style={{ flex: 1 }}>
        <div style={sectionHeader}>{t("C. WATER SIDE", lang)}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt", fontWeight: "bold" }}>
          <tbody>
            <tr>
              <td style={cellLabelCompact}>CHWS Temp</td>
              <td style={cellValCompact}>{data.chws_temp || '0'} °C</td>
              <td style={cellLabelCompact}>CHWS Press</td>
              <td style={cellValCompact}>{data.chws_press || '0'} Bar</td>
            </tr>
            <tr>
              <td style={cellLabelCompact}>CHWR Temp</td>
              <td style={cellValCompact}>{data.chwr_temp || '0'} °C</td>
              <td style={cellLabelCompact}>CHWR Press</td>
              <td style={cellValCompact}>{data.chwr_press || '0'} Bar</td>
            </tr>
            <tr>
              <td style={cellLabelCompact}>Flow Rate</td>
              <td style={cellValCompact}>{data.water_flow_gpm || '0'} m3/h</td>
              <td style={cellLabelCompact}>Pipe Size</td>
              <td style={cellValCompact}>{data.pipe_size || 'N/A'} mm</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ flex: 1 }}>
        <div style={sectionHeader}>{t("D. ELECTRICAL", lang)}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt", fontWeight: "bold" }}>
          <tbody>
            <tr>
              <td style={cellLabelCompact}>Current (A)</td>
              <td style={cellValCompact}>R: {data.amp_r || '0'}</td>
              <td style={cellValCompact}>S: {data.amp_s || '0'}</td>
              <td style={cellValCompact}>T: {data.amp_t || '0'}</td>
            </tr>
            <tr>
              <td style={cellLabelCompact}>Voltage (V)</td>
              <td style={cellValCompact}>RS: {data.volt_rs || '0'}</td>
              <td style={cellValCompact}>ST: {data.volt_st || '0'}</td>
              <td style={cellValCompact}>RT: {data.volt_rt || '0'}</td>
            </tr>
            <tr>
              <td style={cellLabelCompact}>Elect. Info</td>
              <td style={cellValCompact}>P: {data.power_kw || '0'} kW</td>
              <td style={cellLabelCompact}>V L-N</td>
              <td style={cellValCompact}>{data.volt_ln || '0'} V</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>,

    // SECTION E: COMPONENT & ACCESSORIES
    <div key="components" style={{ marginBottom: "5mm" }}>
      <div style={sectionHeader}>{t("E. COMPONENT & ACCESSORIES CONDITION", lang)}</div>
      
      {/* Major Components Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.5pt", fontWeight: "bold", marginBottom: "3mm" }}>
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9" }}>
            <th style={{ ...tdStyle, width: "33.3%", textAlign: "center" }}>{t("Unit Fincoil", lang)}</th>
            <th style={{ ...tdStyle, width: "33.3%", textAlign: "center" }}>{t("Unit Drain Pan", lang)}</th>
            <th style={{ ...tdStyle, width: "33.3%", textAlign: "center" }}>{t("Unit Blower Fan", lang)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...tdStyle, textAlign: "center", color: techData.fincoil_cond === 'BAD' ? '#e11d48' : '#059669', fontSize: '9pt' }}>
              {techData.fincoil_cond === 'BAD' ? '✖ BAD' : '✔ GOOD'}
            </td>
            <td style={{ ...tdStyle, textAlign: "center", color: techData.drain_pan_cond === 'BAD' ? '#e11d48' : '#059669', fontSize: '9pt' }}>
              {techData.drain_pan_cond === 'BAD' ? '✖ BAD' : '✔ GOOD'}
            </td>
            <td style={{ ...tdStyle, textAlign: "center", color: techData.blower_fan_cond === 'BAD' ? '#e11d48' : '#059669', fontSize: '9pt' }}>
              {techData.blower_fan_cond === 'BAD' ? '✖ BAD' : '✔ GOOD'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Accessories Matrix */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt", fontWeight: "bold" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8fafc" }}>
            <th style={{ ...tdStyle, width: "40%", textAlign: "left" }}>Accessories Description</th>
            <th style={{ ...tdStyle, textAlign: "center" }}>Inlet Condition</th>
            <th style={{ ...tdStyle, textAlign: "center" }}>Outlet Condition</th>
          </tr>
        </thead>
        <tbody>
          {["Gate/Butterfly Valve", "Flexible Joint", "Motorized Valve", "Balancing Valve", "Thermometer", "Pressure Gauge"].map((acc, i) => (
            <tr key={i}>
              <td style={tdStyle}>{i+1}. {acc}</td>
              <td style={{ ...tdStyle, textAlign: "center", color: techData.inlet?.[i] === 'DEFECT' ? '#e11d48' : '#333' }}>{techData.inlet?.[i] || 'N/A'}</td>
              <td style={{ ...tdStyle, textAlign: "center", color: techData.outlet?.[i] === 'DEFECT' ? '#e11d48' : '#333' }}>{techData.outlet?.[i] || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <p style={{ fontSize: "6pt", color: "#64748b", fontStyle: "italic", marginTop: "2mm" }}>
        * Unit Health Score refers to balanced scoring based on CIBSE Guide M & ASHRAE 1.1 Standard.
      </p>
    </div>,

    // SIGNATURES
    <div key="sign" style={{ marginTop: "10mm" }}>
       <ReportSignatureFooter 
         preparedBy={data.prepared_by || data.inspector_name || ""}
         reviewedBy={data.engineerSignerName}
         witnessedBy={data.customerApproverName}
         reviewedDate={data.reviewedAt}
         witnessedDate={data.approvedAt}
         lang={lang}
       />
    </div>,

    // PHOTOS
    ...photoChunks.map((chunk, chunkIdx) => (
      <div key={`photos-${chunkIdx}`} style={{ marginTop: "4mm" }}>
        <div style={sectionHeader}>
          {t("Audit Documentation Photos", lang)} {photoChunks.length > 1 ? `(Page ${chunkIdx + 1})` : ''}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(3, 1fr)", gap: "3mm" }}>
          {chunk.map((p: any, i: number) => (
            <div key={i} style={{ border: "1px solid #ddd", padding: "1.5mm", borderRadius: "1.5mm" }}>
              <img src={p.photo_url} alt={`Audit ${i}`} style={{ width: "100%", height: "55mm", objectFit: "cover", borderRadius: "1mm" }} />
              <p style={{ fontSize: "7pt", margin: "1mm 0 0 0", textAlign: "center", color: "#666", fontWeight: 700 }}>
                Photo {chunkIdx * 6 + i + 1}
              </p>
            </div>
          ))}
        </div>
      </div>
    ))
  ];
};

const cellLabel: React.CSSProperties = { border: "1px solid #ddd", padding: "1.5mm 2mm", backgroundColor: "#f8fafd", width: "25%", fontSize: "7.5pt", fontWeight: 800, color: "#003366" };
const cellVal: React.CSSProperties = { border: "1px solid #ddd", padding: "1.5mm 2mm", width: "25%", fontSize: "8pt", fontWeight: 600, color: "#111" };
const cellLabelCompact: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 1.5mm", backgroundColor: "#f8fafd", width: "30%", fontSize: "6.5pt", fontWeight: 800, color: "#003366" };
const cellValCompact: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 1.5mm", fontSize: "7pt", fontWeight: 600, color: "#111" };
const thStyle: React.CSSProperties = { border: "1px solid #ddd", padding: "1.5mm 1mm", textAlign: "center", fontWeight: 900, fontSize: "7pt", color: "#003366" };
const thStyleWhite: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm", textAlign: "center", fontWeight: 900, fontSize: "7.5pt", color: "white" };
const tdStyle: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm", fontSize: "7.5pt", fontWeight: 700, color: "#333" };
const sectionHeader: React.CSSProperties = { fontSize: "10pt", fontWeight: 900, color: "#fff", backgroundColor: "#003366", padding: "1.5mm 3mm", marginBottom: "2.5mm", clipPath: "polygon(0 0, 95% 0, 100% 100%, 0% 100%)" };
