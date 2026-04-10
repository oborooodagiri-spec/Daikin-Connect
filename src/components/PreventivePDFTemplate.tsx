import { ReportSignatureFooter } from "./ReportSignatureFooter";
import { t, Language } from "@/lib/i18n";

export const getPreventiveSections = (data: any, unit: any, engineerName?: string, customerName?: string) => {
  const { header, scope, parts, technicalAdvice, activity_photos } = data || {};
  const lang = data.lang as Language || 'id';
  
  const SCOPE_ROWS = [
    { key: "power_supply", label: t("Power Supply", lang), type: "measure" },
    { key: "ampere_motor", label: t("Ampere Motor", lang), type: "measure" },
    { key: "pressure_inlet", label: t("Pressure Inlet Water", lang), type: "measure" },
    { key: "pressure_outlet", label: t("Pressure Outlet Water", lang), type: "measure" },
    { key: "temp_inlet", label: t("Temperature Inlet Water", lang), type: "measure" },
    { key: "temp_outlet", label: t("Temperature Outlet Water", lang), type: "measure" },
    { key: "return_air_temp", label: t("Return Air Temperature", lang), type: "measure" },
    { key: "supply_air_temp", label: t("Supply Air Temperature", lang), type: "measure" },
    { key: "clean_air_filter", label: t("Cleaning or Replace Air Filter", lang), type: "action" },
    { key: "clean_coil", label: t("Cleaning Coil AHU/FCU", lang), type: "action" },
    { key: "clean_drainage", label: t("Cleaning Drainage", lang), type: "action" },
    { key: "clean_body", label: t("Cleaning Body Unit", lang), type: "action" },
    { key: "check_vbelt", label: t("Check V-Belt / Tension", lang), type: "action" },
    { key: "check_bearing", label: t("Check Bearing Motor/Blower", lang), type: "action" },
  ];
  
  const chunkArray = (arr: any[], size: number) => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const photoChunks = chunkArray(activity_photos, 6);

  return [
    // PAGE 1 HEADER TITLE
    <p key="title" style={{ fontSize: "11pt", fontWeight: 900, color: "#003366", textAlign: "center", marginBottom: "3mm", marginTop: "-1mm" }}>UNIT FCU / AHU</p>,

    // SECTION: UNIT INFO
    <div key="info" style={{ marginBottom: "4mm" }}>
       <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", fontWeight: "bold" }}>
          <tbody>
            <tr>
              <td style={cellLabel}>{t("Room / Tenant", lang)}</td>
              <td style={cellVal}>{header?.room_tenant || unit?.room_tenant || "-"}</td>
              <td style={cellLabel}>{t("Service Date", lang)}</td>
              <td style={cellVal}>{header?.date ? new Date(header.date).toLocaleDateString(lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'id-ID') : "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Model Number", lang)}</td>
              <td style={cellVal}>{header?.model || unit?.model || "-"}</td>
              <td style={cellLabel}>{t("SO / WO Number", lang)}</td>
              <td style={cellVal}>{header?.so_number || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Serial Number", lang)}</td>
              <td style={cellVal}>{header?.serial_number || unit?.serial_number || "-"}</td>
              <td style={cellLabel}>{t("Visit Number", lang)}</td>
              <td style={cellVal}>{header?.visit || "1"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Unit Tag Number", lang)}</td>
              <td style={cellVal}>{header?.unit_number || unit?.tag_number || "-"}</td>
              <td style={cellLabel}>{t("Capacity", lang)}</td>
              <td style={cellVal}>{header?.nominal_capacity || unit?.capacity || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Location", lang)}</td>
              <td style={cellVal}>{header?.location || unit?.area || "-"}</td>
              <td style={cellLabel}>{t("Service Team", lang)}</td>
              <td style={cellVal}>{header?.team_opt || engineerName || "-"}</td>
            </tr>
          </tbody>
        </table>
    </div>,

    // SECTION: SCOPE OF WORK
    <div key="scope" style={{ marginBottom: "4mm" }}>
      <div style={sectionHeader}>{t("Maintenance Scope of Work", lang)}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt", fontWeight: "bold" }}>
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9" }}>
            <th style={{ ...thStyle, width: "15%" }}>{t("Before", lang)}</th>
            <th style={{ ...thStyle, width: "15%" }}>{t("After", lang)}</th>
            <th style={{ ...thStyle, width: "30%" }}>{t("Margin / Result", lang)}</th>
          </tr>
        </thead>
        <tbody>
          {SCOPE_ROWS.map((row) => {
            const s = scope?.[row.key] || {};
            return (
              <tr key={row.key} style={{ height: "6mm" }}>
                <td style={{ ...tdStyle, textAlign: "left", paddingLeft: "3mm" }}>{row.label}</td>
                {row.type === "measure" ? (
                  <>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#003366" }}>{s.before || "-"}</td>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#003366" }}>{s.after || "-"}</td>
                    <td style={{ ...tdStyle, textAlign: "left", paddingLeft: "2mm" }}>{s.remarks || "-"}</td>
                  </>
                ) : (
                  <>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#ccc" }}>-</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, color: s.done?.toLowerCase().includes("done") ? "#059669" : "#dc2626" }}>
                      {s.done || "-"}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "left", paddingLeft: "2mm" }}>{s.remarks || "-"}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>,

    // SECTION: PARTS & COMPONENTS
    <div key="parts" style={{ marginBottom: "4mm" }}>
       <div style={sectionHeader}>{t("Parts & Components Information", lang)}</div>
       <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt", fontWeight: "bold" }}>
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
    <div key="advice" style={{ marginBottom: "4mm" }}>
      <div style={sectionHeader}>{t("Technical Advice & Summary", lang)}</div>
      <div style={{ border: "1px solid #ddd", padding: "2mm", fontSize: "8pt", fontWeight: 500, whiteSpace: "pre-wrap", color: "#444" }}>
        {technicalAdvice || "-"}
      </div>
    </div>,

    <div key="sign" style={{ marginTop: "10mm" }}>
       <ReportSignatureFooter 
         preparedBy={engineerName || ""}
         reviewedBy={data.engineerSignerName}
         witnessedBy={data.customerApproverName || customerName}
         reviewedDate={data.reviewedAt}
         witnessedDate={data.approvedAt}
         lang={lang}
       />
    </div>,

    // PHOTOS
    ...photoChunks.map((chunk, chunkIdx) => (
      <div key={`photos-${chunkIdx}`} style={{ width: "100%" }}>
        <div style={sectionHeader}>
          {t("Maintenance Documentation Photos", lang)} {photoChunks.length > 1 ? `(Page ${chunkIdx + 1})` : ''}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5mm" }}>
          {chunk.map((p: any, i: number) => (
            <div key={i} style={{ border: "1px solid #ddd", padding: "0.8mm", borderRadius: "1mm" }}>
              <img 
                src={p.photo_url} 
                alt={`Photo ${i}`} 
                style={{ width: "100%", height: "48mm", objectFit: "cover", borderRadius: "0.5mm" }} 
              />
              <p style={{ fontSize: "7pt", margin: "0.5mm 0 0 0", textAlign: "center", color: "#666", fontWeight: 700 }}>
                Photo {chunkIdx * 6 + i + 1}: {p.description || 'Maintenance Documentation'}
              </p>
            </div>
          ))}
        </div>
      </div>
    ))
  ];
};

const cellLabel: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 2mm", backgroundColor: "#f8fafd", width: "22%", fontSize: "7pt", fontWeight: 800, color: "#003366" };
const cellVal: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 2mm", width: "28%", fontSize: "8pt", fontWeight: 600, color: "#111" };
const cellLabelSmall: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 1.5mm", backgroundColor: "#f8fafd", width: "25%", fontSize: "6.5pt", fontWeight: 800, color: "#003366" };
const cellValSmall: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 1.5mm", width: "25%", fontSize: "7pt", fontWeight: 600, color: "#111" };
const thStyle: React.CSSProperties = { border: "1px solid #ddd", padding: "1.5mm 1mm", textAlign: "center", fontWeight: 900, fontSize: "7pt", color: "#003366", textTransform: "uppercase" };
const tdStyle: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 1mm", fontSize: "7pt", fontWeight: 700, color: "#333" };
const sectionHeader: React.CSSProperties = { fontSize: "10pt", fontStyle: "italic", fontWeight: 900, color: "#003366", borderBottom: "2px solid #003366", paddingBottom: "1mm", marginBottom: "2mm", textTransform: "uppercase" };
const signBox: React.CSSProperties = { flex: 1, border: "1px solid #ddd", padding: "2mm", display: "flex", flexDirection: "column" };
const signTitle: React.CSSProperties = { fontSize: "7pt", fontWeight: 900, margin: "0 0 2mm 0", textTransform: "uppercase" };
const signDetail: React.CSSProperties = { borderTop: "1px solid #ddd", paddingTop: "1mm", fontSize: "7pt", fontWeight: 600 };
