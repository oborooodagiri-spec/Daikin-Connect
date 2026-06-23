import { DigitalStamp } from "./DigitalStamp";
import { t, Language } from "@/lib/i18n";

interface SignatureFooterProps {
  preparedBy: string;
  reviewedBy?: string;
  witnessedBy?: string;
  reviewedDate?: string | Date;
  witnessedDate?: string | Date;
  lang?: Language;
  isBulkSync?: boolean;
  customerSignatureUrl?: string | null;
  engineerSignatureUrl?: string | null;
  onCustomerSignClick?: () => void;
  onEngineerSignClick?: () => void;
}

export const ReportSignatureFooter = ({
  preparedBy,
  reviewedBy,
  witnessedBy,
  reviewedDate,
  witnessedDate,
  lang = 'id',
  isBulkSync = false,
  customerSignatureUrl,
  engineerSignatureUrl,
  onCustomerSignClick,
  onEngineerSignClick
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
        <p style={{ fontSize: "8pt", fontWeight: 800, color: "#003366", margin: "0 0 2mm 0", textTransform: "uppercase" }}>{t("PREPARED BY", lang)}:</p>
        <div style={{ height: "35mm", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative" }}>
          {engineerSignatureUrl ? (
             <img src={engineerSignatureUrl} alt="Engineer Signature" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", marginBottom: "2mm" }} />
          ) : isBulkSync ? (
             <p style={{ fontSize: "9pt", fontWeight: 900, color: "#111", borderBottom: "1pt solid #003366", paddingBottom: "1mm", display: "inline-block" }}>
                {t("Synchronized by System", lang)}
            </p>
          ) : (
             <div style={{ position: 'absolute', bottom: "2mm", width: "100%", textAlign: "center" }}>
                <p style={{ fontSize: "9pt", fontWeight: 900, color: "#111", borderBottom: "1pt solid #003366", paddingBottom: "1mm", display: "inline-block" }}>
                    {preparedBy || "TEKNISI LAPANGAN"}
                </p>
             </div>
          )}
        </div>
        <p style={{ fontSize: "6pt", fontWeight: 600, color: "#64748b", marginTop: "1mm" }}>{isBulkSync ? "BULK IMPORT" : t("Field Technician", lang)}</p>
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
            <div 
              style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: onEngineerSignClick ? 'pointer' : 'default' }}
              onClick={onEngineerSignClick}
            >
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: "8px", width: "80%", height: "80%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: onEngineerSignClick ? '#f8fafc' : 'transparent', transition: 'background-color 0.2s' }}>
                <p style={{ fontSize: "7pt", color: onEngineerSignClick ? "#3b82f6" : "#94a3b8", fontStyle: "italic", fontWeight: onEngineerSignClick ? 600 : 400 }}>
                  {onEngineerSignClick ? "Klik untuk Tanda Tangan" : t("Awaiting Review", lang)}
                </p>
              </div>
            </div>
          )}
        </div>
        <p style={{ fontSize: "9pt", fontWeight: 900, color: "#111", marginTop: "1mm" }}>{reviewedBy || "-"}</p>
        <p style={{ fontSize: "6pt", fontWeight: 600, color: "#64748b" }}>{t("Internal Engineer", lang)}</p>
      </div>

      {/* COLUMN 3: WITNESSED BY (CUSTOMER) */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "8pt", fontWeight: 800, color: "#003366", margin: "0 0 2mm 0", textTransform: "uppercase" }}>{t("WITNESSED BY", lang)}:</p>
        <div style={{ height: "35mm", position: "relative" }}>
          {customerSignatureUrl ? (
            <img src={customerSignatureUrl} alt="Customer Signature" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", margin: "auto" }} />
          ) : witnessedBy ? (
            <DigitalStamp 
              label="APPROVED" 
              subLabel="CUSTOMER" 
              name={witnessedBy} 
              date={witnessedDate} 
            />
          ) : (
            <div 
              style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: onCustomerSignClick ? 'pointer' : 'default' }}
              onClick={onCustomerSignClick}
            >
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: "8px", width: "80%", height: "80%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: onCustomerSignClick ? '#f8fafc' : 'transparent', transition: 'background-color 0.2s' }}>
                <p style={{ fontSize: "7pt", color: onCustomerSignClick ? "#3b82f6" : "#94a3b8", fontStyle: "italic", fontWeight: onCustomerSignClick ? 600 : 400 }}>
                  {onCustomerSignClick ? "Klik untuk Tanda Tangan" : t("Awaiting Approval", lang)}
                </p>
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

