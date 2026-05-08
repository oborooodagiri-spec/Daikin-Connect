import React from "react";
import { ReportBaseLandscape } from "../ReportBaseLandscape";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface LogsheetPDFTemplateProps {
  template: any;
  date: Date;
  entries: any[];
  projectName?: string;
  customerName?: string;
}

export const LogsheetPDFTemplate = ({ 
  template, 
  date, 
  entries,
  projectName = "Replacement HVAC System HOD 7 & 8",
  customerName = "PT Tirta Investama (Mekarsari)"
}: LogsheetPDFTemplateProps) => {
  const timeSlots = template.time_slots ? template.time_slots.split(",") : [];
  const parameters = JSON.parse(template.parameters_json);
  const designValues = template.design_json ? JSON.parse(template.design_json) : {};

  // Map entries by time
  const entryMap = entries.reduce((acc: any, entry: any) => {
    const values = entry.values_json ? JSON.parse(entry.values_json) : {};
    acc[entry.log_time] = { ...entry, values };
    return acc;
  }, {});

  return (
    <ReportBaseLandscape 
      reportTitle="Logsheet - Monitoring HVAC"
      reportCode={`LOG-${template.type.toUpperCase()}-${format(date, 'yyyyMMdd')}`}
    >
      <div style={{ padding: "0 5mm" }}>
        {/* Header Info Block */}
        <table style={{ width: "100%", marginBottom: "5mm", borderCollapse: "collapse", fontSize: "8pt" }}>
          <tbody>
            <tr>
              <td style={{ width: "15%", fontWeight: 900, color: "#003366" }}>Customer</td>
              <td style={{ width: "35%" }}>: {customerName}</td>
              <td style={{ width: "15%", fontWeight: 900, color: "#003366" }}>Pelaksana</td>
              <td style={{ width: "35%" }}>: PT Daikin Applied Solution Indonesia</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 900, color: "#003366" }}>Proyek</td>
              <td>: {projectName}</td>
              <td style={{ fontWeight: 900, color: "#003366" }}>Owner</td>
              <td>: {customerName}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 900, color: "#003366" }}>Tanggal</td>
              <td>: {format(date, "d MMMM yyyy", { locale: id })}</td>
              <td style={{ fontWeight: 900, color: "#003366" }}>Sistem</td>
              <td>: {template.system_name || "-"}</td>
            </tr>
          </tbody>
        </table>

        {/* Main Data Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1pt solid #003366", fontSize: "7pt" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <th rowSpan={2} style={{ border: "1pt solid #003366", padding: "2mm", textAlign: "left", width: "150px" }}>DATE / TIME</th>
              <th rowSpan={2} style={{ border: "1pt solid #003366", padding: "2mm", textAlign: "center", width: "40px" }}>UNIT</th>
              <th rowSpan={2} style={{ border: "1pt solid #003366", padding: "2mm", textAlign: "center", width: "40px", color: "#00a1e4" }}>DESIGN</th>
              {timeSlots.map(time => (
                <th key={time} style={{ border: "1pt solid #003366", padding: "2mm", textAlign: "center" }}>{time}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parameters.map((group: any) => (
              <React.Fragment key={group.group}>
                {/* Group Divider Row */}
                <tr style={{ backgroundColor: "#f1f5f9" }}>
                  <td colSpan={3 + timeSlots.length} style={{ border: "1pt solid #003366", padding: "1.5mm 3mm", fontWeight: 900, color: "#003366" }}>
                    {group.group.toUpperCase()}
                  </td>
                </tr>

                {group.params.map((param: any) => (
                  <tr key={param.key}>
                    <td style={{ border: "1pt solid #003366", padding: "1.5mm 3mm" }}>{param.label}</td>
                    <td style={{ border: "1pt solid #003366", padding: "1.5mm", textAlign: "center", fontStyle: "italic", color: "#64748b" }}>{param.unit || "-"}</td>
                    <td style={{ border: "1pt solid #003366", padding: "1.5mm", textAlign: "center", fontWeight: 700, backgroundColor: "#eff6ff" }}>
                      {designValues[param.key] ?? "-"}
                    </td>
                    {timeSlots.map(time => {
                      const val = entryMap[time]?.values?.[param.key];
                      return (
                        <td key={time} style={{ border: "1pt solid #003366", padding: "1.5mm", textAlign: "center" }}>
                          {val !== undefined && val !== null ? val : ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
            
            {/* Signature Area Placeholder inside table if needed, but usually better in footer or after table */}
          </tbody>
        </table>

        {/* Footer Signatures */}
        <div style={{ marginTop: "10mm", display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "40%", textAlign: "center" }}>
            <p style={{ fontSize: "8pt", fontWeight: 900, marginBottom: "15mm" }}>Pelaksana:</p>
            <p style={{ fontSize: "8pt", fontWeight: 700, textDecoration: "underline" }}>( __________________________ )</p>
            <p style={{ fontSize: "7pt", color: "#64748b" }}>PT DAIKIN APPLIED SOLUTION INDONESIA</p>
          </div>
          <div style={{ width: "40%", textAlign: "center" }}>
            <p style={{ fontSize: "8pt", fontWeight: 900, marginBottom: "15mm" }}>Owner / Representative:</p>
            <p style={{ fontSize: "8pt", fontWeight: 700, textDecoration: "underline" }}>( __________________________ )</p>
            <p style={{ fontSize: "7pt", color: "#64748b" }}>{customerName}</p>
          </div>
        </div>
      </div>
    </ReportBaseLandscape>
  );
};
