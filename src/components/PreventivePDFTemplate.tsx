import React from "react";
import { DigitalStamp } from "./DigitalStamp";

const SCOPE_ROWS = [
  { key: "power_supply", label: "Power Supply", type: "measure" },
  { key: "ampere_motor", label: "Ampere Motor", type: "measure" },
  { key: "pressure_inlet", label: "Pressure Inlet Water", type: "measure" },
  { key: "pressure_outlet", label: "Pressure Outlet Water", type: "measure" },
  { key: "temp_inlet", label: "Temperature Inlet Water", type: "measure" },
  { key: "temp_outlet", label: "Temperature Outlet Water", type: "measure" },
  { key: "return_air_temp", label: "Return Air Temperature", type: "measure" },
  { key: "supply_air_temp", label: "Supply Air Temperature", type: "measure" },
  { key: "clean_air_filter", label: "Cleaning or Replace Air Filter", type: "action" },
  { key: "clean_coil", label: "Cleaning Coil AHU/FCU", type: "action" },
  { key: "clean_drainage", label: "Cleaning Drainage", type: "action" },
  { key: "clean_body", label: "Cleaning Body Unit", type: "action" },
  { key: "check_vbelt", label: "Check V-Belt / Tension", type: "action" },
  { key: "check_bearing", label: "Check Bearing Motor/Blower", type: "action" },
];

export const getPreventiveSections = (data: any, unit: any, engineerName?: string, customerName?: string) => {
  const { header, scope, parts, technicalAdvice, activity_photos } = data || {};

  return [
    // PAGE 1 HEADER TITLE
    <p key="title" style={{ fontSize: "11pt", fontWeight: 900, color: "#003366", textAlign: "center", marginBottom: "3mm", marginTop: "-1mm" }}>UNIT FCU / AHU</p>,

    // SECTION: UNIT INFO
    <div key="info" style={{ marginBottom: "4mm" }}>
       <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", fontWeight: "bold" }}>
          <tbody>
            <tr>
              <td style={cellLabel}>Room / Tenant</td>
              <td style={cellVal}>{header?.room_tenant || unit?.room_tenant || "-"}</td>
              <td style={cellLabel}>Service Date</td>
              <td style={cellVal}>{header?.date ? new Date(header.date).toLocaleDateString('id-ID') : "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>Model Number</td>
              <td style={cellVal}>{header?.model || unit?.model || "-"}</td>
              <td style={cellLabel}>SO / WO Number</td>
              <td style={cellVal}>{header?.so_number || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>Serial Number</td>
              <td style={cellVal}>{header?.serial_number || unit?.serial_number || "-"}</td>
              <td style={cellLabel}>Visit Number</td>
              <td style={cellVal}>{header?.visit || "1"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>Unit Tag Number</td>
              <td style={cellVal}>{header?.unit_number || unit?.tag_number || "-"}</td>
              <td style={cellLabel}>Capacity</td>
              <td style={cellVal}>{header?.nominal_capacity || unit?.capacity || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>Room / Tenant</td>
              <td style={cellVal}>{header?.location || unit?.area || "-"}</td>
              <td style={cellLabel}>Service Team</td>
              <td style={cellVal}>{header?.team_opt || engineerName || "-"}</td>
            </tr>
          </tbody>
        </table>
    </div>,

    // SECTION: SCOPE OF WORK
    <div key="scope" style={{ marginBottom: "4mm" }}>
      <div style={sectionHeader}>Maintenance Scope of Work</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt", fontWeight: "bold" }}>
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9" }}>
            <th style={{ ...thStyle, width: "15%" }}>Before</th>
            <th style={{ ...thStyle, width: "15%" }}>After</th>
            <th style={{ ...thStyle, width: "30%" }}>Margin / Result</th>
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
       <div style={sectionHeader}>Parts & Components Information</div>
       <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7pt", fontWeight: "bold" }}>
          <tbody>
            <tr>
              <td style={cellLabelSmall}>V-Belt Type / Qty</td>
              <td style={cellValSmall}>{parts?.vbelt_type || "-"}</td>
              <td style={cellLabelSmall}>Motor Pulley Type</td>
              <td style={cellValSmall}>{parts?.motor_pulley || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabelSmall}>Motor Bearing Type / Qty</td>
              <td style={cellValSmall}>{parts?.motor_bearing || "-"}</td>
              <td style={cellLabelSmall}>Blower Pulley Type</td>
              <td style={cellValSmall}>{parts?.blower_pulley || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabelSmall}>Blower Bearing Type / Qty</td>
              <td style={cellValSmall}>{parts?.blower_bearing || "-"}</td>
              <td style={cellLabelSmall}>-</td>
              <td style={cellValSmall}>-</td>
            </tr>
          </tbody>
        </table>
    </div>,

    // SECTION: TECHNICAL ADVICE
    <div key="advice" style={{ marginBottom: "4mm" }}>
      <div style={sectionHeader}>Technical Advice & Summary</div>
      <div style={{ border: "1px solid #ddd", padding: "2mm", fontSize: "8pt", fontWeight: 500, whiteSpace: "pre-wrap", color: "#444" }}>
        {technicalAdvice || "-"}
      </div>
    </div>,

    <div key="sign" style={{ display: "flex", gap: "5mm", marginTop: "2mm", marginBottom: "6mm" }}>
      <div style={signBox}>
        <p style={signTitle}>Service Engineer Signature</p>
        <div style={{ flex: 1, minHeight: "10mm" }}></div>
        <div style={signDetail}>
          <p style={{ margin: "0.5mm 0" }}>Name: {engineerName || "-"}</p>
          <p style={{ margin: "0.5mm 0" }}>Date: {header?.date ? new Date(header.date).toLocaleDateString("id-ID") : "-"}</p>
        </div>
      </div>
      <div style={{ ...signBox, position: "relative" }}>
         {data.isApproved && (
           <div style={{ position: "absolute", top: "-5mm", right: "5mm", zIndex: 10 }}>
              <DigitalStamp />
           </div>
         )}
        <p style={signTitle}>Customer Acknowledgment</p>
        <div style={{ flex: 1, minHeight: "10mm", display: "flex", alignItems: "center", justifyContent: "center" }}>
           {data.isApproved ? (
              <p style={{ fontSize: "8pt", color: "#059669", fontWeight: 800, textTransform: "uppercase" }}>[ Digitally Approved ]</p>
           ) : (
              <p style={{ fontSize: "7pt", color: "#cbd5e1", fontStyle: "italic" }}>Waiting for Signature</p>
           )}
        </div>
        <div style={signDetail}>
          <p style={{ margin: "0.5mm 0" }}>Name: {data.customerApproverName || customerName || "-"}</p>
          <p style={{ margin: "0.5mm 0" }}>Date: {data.approvedAt ? new Date(data.approvedAt).toLocaleDateString("id-ID") : "________________"}</p>
        </div>
      </div>
    </div>,

    // PHOTOS
    ...(activity_photos && activity_photos.length > 0 ? [
      <div key="photos" style={{ marginTop: "4mm" }}>
        <div style={sectionHeader}>Maintenance Documentation Photos</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3mm" }}>
          {activity_photos.map((p: any, i: number) => (
            <div key={i} style={{ border: "1px solid #ddd", padding: "1.5mm", borderRadius: "1.5mm" }}>
              <img 
                src={p.photo_url} 
                alt={`Photo ${i}`} 
                style={{ width: "100%", height: "55mm", objectFit: "cover", borderRadius: "1mm" }} 
              />
              <p style={{ fontSize: "7pt", margin: "1.5mm 0 0 0", textAlign: "center", color: "#666", fontWeight: 700 }}>
                Photo {i+1}: {p.description || 'Maintenance Documentation'}
              </p>
            </div>
          ))}
        </div>
      </div>
    ] : [])
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
