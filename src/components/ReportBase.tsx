import React, { ReactNode } from "react";

interface ReportBaseProps {
  children: ReactNode;
  reportTitle: string;
  reportCode?: string;
  unit?: any;
  date?: string;
  pageNumber?: number;
  totalPages?: number;
  isFixedHeight?: boolean;
}

export const ReportBase = ({ 
  children, 
  reportTitle, 
  reportCode, 
  unit, 
  date,
  pageNumber = 1,
  totalPages = 1,
  isFixedHeight = true
}: ReportBaseProps) => {
  return (
    <div
      style={{
        width: "210mm",
        height: isFixedHeight ? "297mm" : "auto",
        margin: "0 auto",
        backgroundColor: "white",
        position: "relative",
        boxSizing: "border-box",
        fontFamily: "'Inter', 'Arial', sans-serif",
        color: "#111",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 40px rgba(0,0,0,0.1)", // Only for screen view
        overflow: "hidden" 
      }}
      className="print-report-container"
    >
      {/* HEADER SECTION - FULL BLEED */}
      <div id="report-header" style={{ width: "100%", backgroundColor: "white" }}>
        <div style={{ padding: "10mm 15mm 0 15mm" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5mm" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5mm" }}>
              <img src="/app-logo.png" alt="Daikin" style={{ height: "12mm", objectFit: "contain" }} />
              <div style={{ height: "10mm", width: "1px", backgroundColor: "#003366" }}></div>
              <div style={{ fontSize: "8pt", fontWeight: 900, color: "#003366", textTransform: "uppercase", lineHeight: "1.2", maxWidth: "60mm" }}>
                PT DAIKIN APPLIED SOLUTIONS INDONESIA
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <img src="/logo_epl_connect_1.png" alt="EPL Connect" style={{ height: "14mm", objectFit: "contain" }} />
            </div>
          </div>

          <div style={{ textAlign: "center", position: "relative", marginBottom: "3mm" }}>
            <h1 style={{ fontSize: "20pt", fontWeight: 900, color: "#003366", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
              {reportTitle}
            </h1>
            {reportCode && (
              <div style={{ 
                fontSize: "10pt", 
                fontWeight: 800, 
                color: "#666", 
                backgroundColor: "#f8fafd",
                border: "1px solid #ddd", 
                padding: "2px 15px", 
                marginTop: "4px", 
                display: "inline-block",
                borderRadius: "4px"
              }}>
                {reportCode}
              </div>
            )}
          </div>
          
          {/* THICK BLUE BAR */}
          <div style={{ width: "100%", height: "2mm", backgroundColor: "#003366", marginBottom: "4mm" }}></div>
        </div>
      </div>

      {/* MAIN CONTENT AREA - WITH SIDE PADDING */}
      <div id="report-content" style={{ flex: 1, position: "relative", padding: "0 15mm", overflow: "hidden" }}>
        {children}
      </div>

      {/* FOOTER SECTION - ABSOLUTE BOTTOM */}
      <div 
        id="report-footer" 
        style={{ 
          width: "100%", 
          backgroundColor: "white", 
          position: isFixedHeight ? "absolute" : "relative", 
          bottom: 0, 
          left: 0 
        }}
      >
        <div style={{ borderTop: "1.2pt solid #003366", paddingTop: "2mm", paddingLeft: "15mm", paddingRight: "15mm" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4mm", padding: "0 2mm", marginBottom: "2mm" }}>
            
            {/* COLUMN 1: TUV NORD */}
            <div style={{ width: "18mm" }}>
              <img src="/TUVnord-.png" alt="TUV Nord" style={{ width: "100%", objectFit: "contain" }} />
            </div>

            {/* COLUMN 2: SURABAYA & JAKARTA */}
            <div style={{ flex: 1, fontSize: "4.5pt", lineHeight: "1.3", color: "#333" }}>
              <p style={{ margin: "0 0 1.2mm 0" }}>
                <span style={{ fontWeight: 800 }}>Head Office :</span> Surabaya. Jl. Opak No. 33 Darmo Wonokromo Kota Surabaya Jawa Timur 60241. P. +62-31-9953 9777 F. +62 31 9953 9222
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: 800 }}>Branch Office :</span> Jakarta. L'Avenue Office Building 25th Floor Jl. Raya Pasar Minggu Kav.16 Pancoran, Jakarta Selatan 12780. P. +62-21 - 8066-7118 | F. +62 21 - 8066-7119
              </p>
            </div>

            {/* COLUMN 3: MEDAN, SEMARANG, BALI, TIMIKA */}
            <div style={{ flex: 1.2, fontSize: "4.5pt", lineHeight: "1.3", color: "#333" }}>
              <p style={{ margin: "0 0 0.6mm 0" }}>
                <span style={{ fontWeight: 800 }}>Medan.</span> Komplek Karya Makkur, Jl. Karya No. A4 Kelurahan Sei Agul Kecamatan Medan Barat, Medan.
              </p>
              <p style={{ margin: "0 0 0.6mm 0" }}>
                <span style={{ fontWeight: 800 }}>Semarang.</span> Jl. Jendral Sudirman 75A, Krobokan, Semarang Barat.
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: 800 }}>Timika.</span> Jl. Cendrawasih SP 2 Ruko Segitiga Emas No.9, Timika Papua 99910.
              </p>
            </div>

            {/* COLUMN 4: GBCI LOGO */}
            <div style={{ width: "24mm" }}>
              <img src="/green-building-council-1.png" alt="GBCI" style={{ width: "100%", objectFit: "contain" }} />
            </div>
          </div>

          {/* BLUE GRADIENT URL BAR - TRUE FULL BLEED */}
          <div style={{ 
            height: "8mm", 
            background: "linear-gradient(to right, #009ce1 0%, #003366 100%)", 
            width: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", // Changed for page numbering
            padding: "0 15mm",
            boxSizing: "border-box"
          }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "7pt", fontWeight: 700 }}>
              Page {pageNumber} of {totalPages}
            </span>
            <span style={{ color: "white", fontSize: "9pt", fontWeight: 700, fontStyle: "italic" }}>
              www.daikinapplied.co.id
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
