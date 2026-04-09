import { DigitalStamp } from "./DigitalStamp";
import { t, Language } from "@/lib/i18n";

interface SignatureFooterProps {
  preparedBy: string;
  reviewedBy?: string;
  witnessedBy?: string;
  reviewedDate?: string | Date;
  witnessedDate?: string | Date;
  lang?: Language;
}

export const ReportSignatureFooter = ({
  preparedBy,
  reviewedBy,
  witnessedBy,
  reviewedDate,
  witnessedDate,
  lang = 'id'
}: SignatureFooterProps) => {
  return (
    <div style={{ 
      marginTop: "10mm", 
      display: "grid", 
      gridTemplateColumns: "1fr 1fr 1fr", 
      gap: "5mm",
      width: "100%"
    }}>
      {/* COLUMN 1: PREPARED BY (FIELD STAFF) */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "8pt", fontWeight: 800, color: "#003366", margin: "0 0 15mm 0", textTransform: "uppercase" }}>{t("PREPARED BY", lang)}:</p>
        <div style={{ height: "35mm", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <p style={{ fontSize: "9pt", fontWeight: 900, color: "#111", borderBottom: "1pt solid #003366", paddingBottom: "1mm", display: "inline-block" }}>
                {preparedBy || "TEKNISI LAPANGAN"}
            </p>
        </div>
        <p style={{ fontSize: "6pt", fontWeight: 600, color: "#64748b", marginTop: "1mm" }}>Field Technician</p>
      </div>

      {/* COLUMN 2: REVIEWED BY (INTERNAL ENGINEER) */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "8pt", fontWeight: 800, color: "#003366", margin: "0 0 2mm 0", textTransform: "uppercase" }}>{t("REVIEWED BY", lang)}:</p>
        <div style={{ height: "35mm", position: "relative" }}>
          {reviewedBy ? (
            <DigitalStamp 
              label="REVIEWED" 
              subLabel="EPL CONNECT" 
              name={reviewedBy} 
              date={reviewedDate} 
            />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: "8px", width: "80%", height: "80%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: "7pt", color: "#94a3b8", fontStyle: "italic" }}>Awaiting Review</p>
              </div>
            </div>
          )}
        </div>
        <p style={{ fontSize: "9pt", fontWeight: 900, color: "#111", marginTop: "1mm" }}>{reviewedBy || "-"}</p>
        <p style={{ fontSize: "6pt", fontWeight: 600, color: "#64748b" }}>Internal Engineer</p>
      </div>

      {/* COLUMN 3: WITNESSED BY (CUSTOMER) */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "8pt", fontWeight: 800, color: "#003366", margin: "0 0 2mm 0", textTransform: "uppercase" }}>{t("WITNESSED BY", lang)}:</p>
        <div style={{ height: "35mm", position: "relative" }}>
          {witnessedBy ? (
            <DigitalStamp 
              label="APPROVED" 
              subLabel="CUSTOMER" 
              name={witnessedBy} 
              date={witnessedDate} 
            />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: "8px", width: "80%", height: "80%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: "7pt", color: "#94a3b8", fontStyle: "italic" }}>Awaiting Approval</p>
              </div>
            </div>
          )}
        </div>
        <p style={{ fontSize: "9pt", fontWeight: 900, color: "#111", marginTop: "1mm" }}>{witnessedBy || "-"}</p>
        <p style={{ fontSize: "6pt", fontWeight: 600, color: "#64748b" }}>{t("CUSTOMER PIC", lang)}</p>
      </div>
    </div>
  );
};
