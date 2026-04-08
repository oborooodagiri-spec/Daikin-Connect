import React, { ReactNode } from "react";

interface ReportBaseLandscapeProps {
  children: ReactNode;
  reportTitle: string;
  reportCode?: string;
  pageNumber?: number;
  totalPages?: number;
}

export const ReportBaseLandscape = ({ 
  children, 
  reportTitle, 
  reportCode, 
  pageNumber = 1,
  totalPages = 1
}: ReportBaseLandscapeProps) => {
  return (
    <div
      style={{
        width: "297mm",
        height: "210mm",
        margin: "0 auto",
        backgroundColor: "white",
        position: "relative",
        boxSizing: "border-box",
        fontFamily: "'Inter', 'Arial', sans-serif",
        color: "#111",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden" 
      }}
      className="print-report-container landscape"
    >
      {/* HEADER SECTION */}
      <div id="report-header" style={{ width: "100%", backgroundColor: "white" }}>
        <div style={{ padding: "8mm 15mm 0 15mm" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4mm" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5mm" }}>
              <img src="/daikin_logo.png" alt="Daikin" style={{ height: "10mm", objectFit: "contain" }} />
              <div style={{ height: "8mm", width: "1px", backgroundColor: "#003366" }}></div>
              <div style={{ fontSize: "7pt", fontWeight: 900, color: "#003366", textTransform: "uppercase", lineHeight: "1.2" }}>
                PT DAIKIN APPLIED SOLUTIONS INDONESIA
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
               <h1 style={{ fontSize: "16pt", fontWeight: 900, color: "#003366", margin: 0, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                 {reportTitle}
               </h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <img src="/logo_epl_connect_1.png" alt="EPL Connect" style={{ height: "12mm", objectFit: "contain" }} />
            </div>
          </div>
          
          <div style={{ 
            width: "100%", 
            height: "1.5mm", 
            backgroundColor: "#00a1e4", 
            marginBottom: "3mm",
            borderRadius: "0.5mm"
          }}></div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div id="report-content-landscape" style={{ flex: 1, position: "relative", padding: "0 15mm", overflow: "hidden" }}>
        {children}
      </div>

      {/* FOOTER SECTION */}
      <div id="report-footer" style={{ width: "100%", backgroundColor: "white" }}>
        <div style={{ borderTop: "1pt solid #003366", paddingTop: "0mm" }}>
          <div style={{ 
            height: "6mm", 
            background: "linear-gradient(to right, #009ce1 0%, #003366 100%)", 
            width: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            padding: "0 15mm",
            boxSizing: "border-box"
          }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "6pt", fontWeight: 700 }}>
              {reportCode} • Page {pageNumber} of {totalPages}
            </span>
            <span style={{ color: "white", fontSize: "8pt", fontWeight: 700, fontStyle: "italic" }}>
              Automated Operations Analytics Hub
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
