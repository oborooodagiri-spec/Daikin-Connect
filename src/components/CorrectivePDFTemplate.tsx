import React from "react";
import { DigitalStamp } from "./DigitalStamp";

export const getCorrectiveSections = (data: any, unit: any) => {
  const { personnel, pic, analysis, engineerNote, activity_photos } = data || {};

  return [
    // SECTION 01: GENERAL INFO
    <div key="s1" style={{ marginBottom: "4mm" }}>
       <div style={sectionHeader}>01 - UNIT & PERSONNEL INFORMATION</div>
       <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", fontWeight: "bold" }}>
         <tbody>
           <tr>
             <td style={cellLabel}>Customer / Project</td>
             <td style={cellVal}>{unit?.project_name || "-"}</td>
             <td style={cellLabel}>Service Date</td>
             <td style={cellVal}>{personnel?.service_date ? new Date(personnel.service_date).toLocaleDateString('id-ID') : "-"}</td>
           </tr>
           <tr>
             <td style={cellLabel}>Unit Model</td>
             <td style={cellVal}>{unit?.model || "-"}</td>
             <td style={cellLabel}>SO / WO Number</td>
             <td style={cellVal}>{personnel?.wo_number || "-"}</td>
           </tr>
           <tr>
             <td style={cellLabel}>Unit Tag Number</td>
             <td style={cellVal}>{unit?.tag_number || "-"}</td>
             <td style={cellLabel}>Location Area</td>
             <td style={cellVal}>{unit?.area || "-"}</td>
           </tr>
           <tr>
             <td style={cellLabel}>Technician / Engineer</td>
             <td style={cellVal}>{personnel?.name || "-"}</td>
             <td style={cellLabel}>Visit Count</td>
             <td style={cellVal}>{personnel?.visit || "1"}</td>
           </tr>
         </tbody>
       </table>
    </div>,

    // SECTION 02: PIC CONTACT
    <div key="s2" style={{ marginBottom: "4mm" }}>
      <div style={sectionHeader}>02 - CUSTOMER REPRESENTATIVE (PIC)</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", fontWeight: "bold" }}>
        <tbody>
          <tr>
            <td style={cellLabel}>PIC Name</td>
            <td style={cellVal}>{pic?.name || "-"}</td>
            <td style={cellLabel}>Department</td>
            <td style={cellVal}>{pic?.department || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}>Phone / WA</td>
            <td style={cellVal}>{pic?.phone || "-"}</td>
            <td style={cellLabel}>Email</td>
            <td style={cellVal}>{pic?.email || "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>,

    // SECTION 03: ANALYSIS & ACTIONS
    <div key="s3" style={{ marginBottom: "4mm" }}>
      <div style={sectionHeader}>03 - ANALYSIS & CORRECTIVE ACTION</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5mm" }}>
        <AnalysisBlock label="CASE / COMPLAINT" value={analysis?.complain} color="#dc2626" />
        <AnalysisBlock label="ROOT CAUSE ANALYSIS" value={analysis?.root_cause} color="#d97706" />
        <div style={{ display: "flex", gap: "2mm" }}>
          <AnalysisBlock label="TEMPORARY ACTION" value={analysis?.temp_action} color="#2563eb" flex={1} />
          <AnalysisBlock label="PERMANENT ACTION" value={analysis?.perm_action} color="#059669" flex={1} />
        </div>
        <AnalysisBlock label="RECOMMENDATION" value={analysis?.recommendation} color="#7c3aed" />
      </div>
    </div>,

    // SECTION 04: ENGINEER NOTES
    <div key="s4" style={{ marginBottom: "4mm" }}>
      <div style={sectionHeader}>04 - ADDITIONAL ENGINEER NOTES</div>
      <div style={{ border: "1px solid #ddd", padding: "2mm", fontSize: "8pt", fontWeight: 500, whiteSpace: "pre-wrap", color: "#444" }}>
        {engineerNote || "-"}
      </div>
    </div>,

    // SIGNATURE SECTION - NO BREAK
    <div key="sign" style={{ display: "flex", gap: "4mm", marginTop: "2mm", marginBottom: "6mm" }}>
      <div style={signBox}>
        <p style={signTitle}>Service Engineer</p>
        <div style={{ flex: 1, minHeight: "10mm" }}></div>
        <div style={signDetail}>
          <p style={{ margin: "0.5mm 0" }}>Name: {personnel?.name || "-"}</p>
          <p style={{ margin: "0.5mm 0" }}>Date: {personnel?.service_date ? new Date(personnel.service_date).toLocaleDateString("id-ID") : "-"}</p>
        </div>
      </div>
      <div style={{ ...signBox, position: "relative" }}>
         <div style={{ position: "absolute", top: "-4mm", right: "2mm", zIndex: 10 }}>
            <DigitalStamp />
         </div>
        <p style={signTitle}>Acknowledged by (PIC)</p>
        <div style={{ flex: 1, minHeight: "10mm" }}></div>
        <div style={signDetail}>
          <p style={{ margin: "0.5mm 0" }}>Name: {pic?.name || "-"}</p>
          <p style={{ margin: "0.5mm 0" }}>Date: ________________</p>
        </div>
      </div>
      <div style={signBox}>
        <p style={signTitle}>Approved by (Manager)</p>
        <div style={{ flex: 1, minHeight: "10mm" }}></div>
        <div style={signDetail}>
          <p style={{ margin: "0.5mm 0" }}>Name: ________________</p>
          <p style={{ margin: "0.5mm 0" }}>Date: ________________</p>
        </div>
      </div>
    </div>,

    // PHOTOS SECTION
    ...(activity_photos && activity_photos.length > 0 ? [
      <div key="photos" style={{ marginTop: "4mm" }}>
        <div style={sectionHeader}>05 - DOCUMENTATION PHOTOS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3mm" }}>
          {activity_photos.map((p: any, i: number) => (
            <div key={i} style={{ border: "1px solid #ddd", padding: "1.5mm", borderRadius: "1.5mm" }}>
              <img 
                src={p.photo_url} 
                alt={`Photo ${i}`} 
                style={{ width: "100%", height: "55mm", objectFit: "cover", borderRadius: "1mm" }} 
              />
              <p style={{ fontSize: "7pt", margin: "1.5mm 0 0 0", textAlign: "center", color: "#666", fontWeight: 700 }}>
                Photo {i+1}: {p.description || 'Corrective Documentation'}
              </p>
            </div>
          ))}
        </div>
      </div>
    ] : [])
  ];
};

function AnalysisBlock({ label, value, color, flex }: { label: string, value?: string, color: string, flex?: number }) {
  return (
    <div style={{ flex: flex || "none", border: `1px solid ${color}44`, borderRadius: "1mm", overflow: "hidden" }}>
      <div style={{ backgroundColor: `${color}11`, padding: "1mm 2mm", borderBottom: `1px solid ${color}44`, fontSize: "7pt", fontWeight: 900, color: color }}>
        {label}
      </div>
      <div style={{ padding: "2mm", fontSize: "8pt", fontWeight: 500, color: "#333", whiteSpace: "pre-wrap" }}>
        {value || "-"}
      </div>
    </div>
  );
}

const cellLabel: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 2mm", backgroundColor: "#f8fafd", width: "22%", fontSize: "7pt", fontWeight: 800, color: "#003366" };
const cellVal: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 2mm", width: "28%", fontSize: "8pt", fontWeight: 600, color: "#111" };
const sectionHeader: React.CSSProperties = { fontSize: "10pt", fontStyle: "italic", fontWeight: 900, color: "#003366", borderBottom: "2px solid #003366", paddingBottom: "1mm", marginBottom: "2mm", textTransform: "uppercase" };
const signBox: React.CSSProperties = { flex: 1, border: "1px solid #ddd", padding: "2mm", display: "flex", flexDirection: "column" };
const signTitle: React.CSSProperties = { fontSize: "7pt", fontWeight: 900, margin: "0 0 2mm 0", textTransform: "uppercase" };
const signDetail: React.CSSProperties = { borderTop: "1px solid #ddd", paddingTop: "1mm", fontSize: "7pt", fontWeight: 600 };
