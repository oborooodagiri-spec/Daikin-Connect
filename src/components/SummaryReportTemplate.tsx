import React from "react";

interface SummaryReportTemplateProps {
  data: {
    period: { from: string; to: string };
    dailyServices: any[];
    complaints: any[];
    performance: {
      pm: {
        totalScheduled: number;
        onSchedule: number;
        delay: number;
        outOfSchedule: number;
        totalServiced: number;
      };
      reasons: { label: string; value: number }[];
      complaintCategories: { label: string; value: number }[];
    };
  };
}

export const getSummarySections = (data: SummaryReportTemplateProps["data"]) => {
  const { period, dailyServices, complaints, performance } = data;

  const formatDate = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  };

  const sections: any[] = [];

  // PAGE 1: COVER & EXECUTIVE SUMMARY
  sections.push(
    <div key="cover" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
       <div style={{ marginTop: "10mm", textAlign: "center", marginBottom: "15mm" }}>
          <h2 style={{ fontSize: "28pt", fontWeight: 900, color: "#003366", margin: 0, letterSpacing: "-1px" }}>SUMMARY REPORT</h2>
          <p style={{ fontSize: "12pt", color: "#64748b", fontWeight: 700, marginTop: "2mm", textTransform: "uppercase", letterSpacing: "1px" }}>
             Periode: {formatDate(period.from)} — {formatDate(period.to)}
          </p>
       </div>

       {/* QUICK STATS CARDS */}
       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5mm", marginBottom: "10mm" }}>
          <StatCard label="Total Preventive" value={performance.pm.totalServiced} sub="Units Serviced" color="#00a1e4" />
          <StatCard label="Total Corrective" value={complaints.length} sub="Resolved Issues" color="#e11d48" />
          <StatCard label="Actual Progress" value={`${performance.pm.totalScheduled > 0 ? Math.round((performance.pm.onSchedule / performance.pm.totalScheduled) * 100) : 100}%`} sub="On-Schedule" color="#059669" />
       </div>

       {/* PERFORMANCE ANALYTICS SECTION */}
       <div style={{ display: "flex", gap: "8mm", marginBottom: "10mm" }}>
          <div style={{ flex: 1.2, backgroundColor: "#f8fafd", padding: "6mm", borderRadius: "4mm", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
             <h3 style={sectionSubHeader}>PM Performance Tracking</h3>
             <div style={{ marginTop: "4mm" }}>
                <ProgressBar label="On Schedule" value={performance.pm.onSchedule} total={performance.pm.totalScheduled} color="#059669" />
                <ProgressBar label="Delay" value={performance.pm.delay} total={performance.pm.totalScheduled} color="#f59e0b" />
                <ProgressBar label="Out of Schedule" value={performance.pm.outOfSchedule} total={performance.pm.totalScheduled || 1} color="#6366f1" isExtra />
             </div>
             
             <div style={{ marginTop: "6mm", borderTop: "1px solid #e2e8f0", paddingTop: "4mm", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm" }}>
                <div>
                   <p style={{ fontSize: "6.5pt", fontWeight: 900, color: "#64748b", textTransform: "uppercase" }}>Total Planned</p>
                   <p style={{ fontSize: "14pt", fontWeight: 900, color: "#003366" }}>{performance.pm.totalScheduled}</p>
                </div>
                <div>
                   <p style={{ fontSize: "6.5pt", fontWeight: 900, color: "#64748b", textTransform: "uppercase" }}>Success Rate</p>
                   <p style={{ fontSize: "14pt", fontWeight: 900, color: "#059669" }}>{performance.pm.totalScheduled > 0 ? Math.round((performance.pm.onSchedule / performance.pm.totalScheduled) * 100) : 100}%</p>
                </div>
             </div>
          </div>
          
          <div style={{ flex: 1, backgroundColor: "#fff", padding: "6mm", borderRadius: "4mm", border: "1.5pt solid #fee2e2" }}>
             <h3 style={{ ...sectionSubHeader, color: "#991b1b", borderBottomColor: "#fee2e2" }}>Non-Service Reasons</h3>
             <div style={{ marginTop: "5mm" }}>
                {performance.reasons.length > 0 ? performance.reasons.map((r, i) => (
                  <div key={i} style={{ marginBottom: "3mm" }}>
                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1mm" }}>
                        <span style={{ fontSize: "7pt", fontWeight: 800, color: "#991b1b" }}>{r.label}</span>
                        <span style={{ fontSize: "7pt", fontWeight: 900, color: "#991b1b" }}>{r.value}</span>
                     </div>
                     <div style={{ width: "100%", height: "1.5mm", backgroundColor: "#fee2e2", borderRadius: "1mm", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(100, (r.value / (performance.pm.totalServiced || 1)) * 100)}%`, height: "100%", backgroundColor: "#e11d48" }}></div>
                     </div>
                  </div>
                )) : (
                  <div style={{ textAlign: "center", paddingTop: "10mm" }}>
                     <p style={{ fontSize: "8pt", color: "#166534", fontWeight: 800 }}>✓ All units inspected</p>
                  </div>
                )}
             </div>
          </div>
       </div>

       {/* COMPLAINT ANALYSIS CHART */}
       <div style={{ backgroundColor: "#f0fdf4", padding: "6mm", borderRadius: "4mm", border: "1px solid #dcfce7" }}>
          <h3 style={{ ...sectionSubHeader, color: "#166534", borderBottomColor: "#dcfce7" }}>Complaint Analytics by Category</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10mm", marginTop: "5mm" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "3.5mm" }}>
                {performance.complaintCategories.map((c, i) => (
                   <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1mm" }}>
                         <span style={{ fontSize: "7.5pt", fontWeight: 800, color: "#166534" }}>{c.label}</span>
                         <span style={{ fontSize: "7.5pt", fontWeight: 900, color: "#166534" }}>{c.value}</span>
                      </div>
                      <div style={{ width: "100%", height: "2mm", backgroundColor: "#dcfce7", borderRadius: "1mm", overflow: "hidden" }}>
                         <div style={{ width: `${Math.min(100, (c.value / (complaints.length || 1)) * 100)}%`, height: "100%", backgroundColor: "#059669" }}></div>
                      </div>
                   </div>
                ))}
                {performance.complaintCategories.length === 0 && <p style={{ fontSize: "8pt", color: "#166534", fontStyle: "italic" }}>No corrective actions recorded.</p>}
             </div>
             
             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px dashed #dcfce7", paddingLeft: "10mm" }}>
                <div style={{ textAlign: "center" }}>
                   <p style={{ fontSize: "28pt", fontWeight: 900, color: "#166534", margin: 0 }}>{complaints.length}</p>
                   <p style={{ fontSize: "7pt", fontWeight: 900, color: "#166534", textTransform: "uppercase", margin: 0, letterSpacing: "1mm" }}>Total Complaints</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  // PAGE 2: DAILY LIST SERVICE
  if (dailyServices.length > 0) {
    // Split daily services into chunks if needed, but for now we put them starting on Page 2
    const rowsPerPage = 18;
    for (let i = 0; i < dailyServices.length; i += rowsPerPage) {
      const chunk = dailyServices.slice(i, i + rowsPerPage);
      sections.push(
        <div key={`daily_${i}`} style={{ height: "100%" }}>
           <h3 style={tableHeader}>DAILY LIST SERVICE</h3>
           <table style={tableStyle}>
              <thead>
                 <tr style={thGroup}>
                    <th style={thCol}>No</th>
                    <th style={thCol}>Tanggal</th>
                    <th style={thCol}>Lantai</th>
                    <th style={thCol}>Ruangan / Tenant</th>
                    <th style={thCol}>Brand/Model</th>
                    <th style={thCol}>Tipe</th>
                    <th style={thCol}>Finding (Kategori)</th>
                 </tr>
              </thead>
              <tbody>
                 {chunk.map((s, idx) => (
                   <tr key={idx} style={idx % 2 === 0 ? trEven : trOdd}>
                      <td style={tdCol}>{i + idx + 1}</td>
                      <td style={tdCol}>{new Date(s.date).toLocaleDateString('id-ID')}</td>
                      <td style={tdCol}>{s.floor}</td>
                      <td style={tdCol}>{s.room}</td>
                      <td style={tdCol}>{s.brand} / {s.model}</td>
                      <td style={tdCol}>{s.type}</td>
                      <td style={tdCol}>
                         <div style={{ color: s.status === 'NOT_SERVICED' ? '#e11d48' : '#111' }}>
                            {s.status === 'NOT_SERVICED' ? `[NOT SERVICED] ${s.reason}` : s.finding}
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      );
    }
  }

  // PAGE 3: LIST COMPLAINT
  if (complaints.length > 0) {
    const rowsPerPage = 5; // Complaints take more horizontal space, maybe one per row or compact
    for (let i = 0; i < complaints.length; i += rowsPerPage) {
      const chunk = complaints.slice(i, i + rowsPerPage);
      sections.push(
        <div key={`complaints_${i}`} style={{ height: "100%" }}>
           <h3 style={{ ...tableHeader, color: "#991b1b", borderLeftColor: "#991b1b" }}>LIST COMPLAINT & ANALYSIS</h3>
           <div style={{ display: "flex", flexDirection: "column", gap: "4mm" }}>
              {chunk.map((c, idx) => (
                <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: "2mm", overflow: "hidden" }}>
                   <div style={{ backgroundColor: "#f1f5f9", padding: "2mm 4mm", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "8pt", fontWeight: 900, color: "#003366" }}>#{i + idx + 1} | {c.tag} ({c.brand} {c.model})</span>
                      <span style={{ fontSize: "7pt", fontWeight: 700, color: "#64748b" }}>{new Date(c.date).toLocaleDateString('id-ID')} {c.time}</span>
                   </div>
                   <div style={{ padding: "3mm 4mm", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", fontSize: "7.5pt" }}>
                      <div>
                         <p style={compLabel}>Issue / Category</p>
                         <p style={compVal}><span style={{ color: "#e11d48" }}>[{c.category}]</span> {c.rootCause}</p>
                         <p style={compLabel}>Technician</p>
                         <p style={compVal}>{c.technician}</p>
                      </div>
                      <div>
                         <p style={compLabel}>Actions (Temp / Perm)</p>
                         <p style={compVal}>{c.tempAction} / {c.permAction}</p>
                         <p style={compLabel}>Recommendation</p>
                         <p style={compVal}>{c.recommendation}</p>
                         <p style={compLabel}>Last PM</p>
                         <p style={compVal}>{formatDate(c.lastPm)}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      );
    }
  }

  return sections;
};

// HELPER COMPONENTS
const StatCard = ({ label, value, sub, color }: any) => (
  <div style={{ backgroundColor: "white", padding: "6mm", borderRadius: "4mm", border: `1.5pt solid ${color}`, textAlign: "center", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
     <p style={{ fontSize: "8pt", fontWeight: 900, color: "#64748b", textTransform: "uppercase", margin: 0 }}>{label}</p>
     <p style={{ fontSize: "22pt", fontWeight: 900, color: "#003366", margin: "1mm 0" }}>{value}</p>
     <p style={{ fontSize: "7pt", fontWeight: 700, color: color, margin: 0, textTransform: "uppercase" }}>{sub}</p>
  </div>
);

const ProgressBar = ({ label, value, total, color, isExtra }: any) => {
  const percentage = Math.min(100, Math.round((value / (total || 1)) * 100));
  return (
    <div style={{ marginBottom: "3mm" }}>
       <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7.5pt", fontWeight: 800, color: "#334155", marginBottom: "1mm" }}>
          <span>{label} {isExtra && "(Outside Schedule)"}</span>
          <span>{value} Units ({percentage}%)</span>
       </div>
       <div style={{ width: "100%", height: "2.5mm", backgroundColor: "#e2e8f0", borderRadius: "1mm", overflow: "hidden" }}>
          <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: color }}></div>
       </div>
    </div>
  );
};

// STYLES
const sectionSubHeader: React.CSSProperties = { fontSize: "10pt", fontWeight: 900, color: "#003366", margin: 0, textTransform: "uppercase", borderBottom: "1.5pt solid #e2e8f0", paddingBottom: "2mm", marginBottom: "3mm" };
const tableHeader: React.CSSProperties = { fontSize: "11pt", fontWeight: 900, color: "#003366", margin: "5mm 0 4mm 0", paddingLeft: "3mm", borderLeft: "4pt solid #00a1e4", textTransform: "uppercase" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "7.5pt" };
const thGroup: React.CSSProperties = { backgroundColor: "#003366", color: "white" };
const thCol: React.CSSProperties = { padding: "3mm 2mm", textAlign: "left", fontWeight: 900, border: "0.5pt solid #004080" };
const tdCol: React.CSSProperties = { padding: "2.5mm 2mm", borderBottom: "0.5pt solid #e2e8f0", color: "#334155", fontWeight: 600 };
const trEven: React.CSSProperties = { backgroundColor: "#ffffff" };
const trOdd: React.CSSProperties = { backgroundColor: "#f8fafc" };
const compLabel: React.CSSProperties = { margin: "0 0 0.5mm 0", fontSize: "6.5pt", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" };
const compVal: React.CSSProperties = { margin: "0 0 2mm 0", fontWeight: 700, color: "#334155", lineHeight: "1.3" };
