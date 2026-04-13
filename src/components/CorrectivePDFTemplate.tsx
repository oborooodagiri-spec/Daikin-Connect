import { ReportSignatureFooter } from "./ReportSignatureFooter";
import { t, Language } from "@/lib/i18n";

export const getCorrectiveSections = (data: any, unit: any) => {
  const lang = data.lang as Language || 'id';
  const { personnel, pic, analysis, engineerNote, activity_photos } = data || {};
  
  const chunkArray = (arr: any[], size: number) => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const photoChunks = chunkArray(activity_photos, 6);

  return [
    // SECTION 01: GENERAL INFO
    <div key="s1" style={{ marginBottom: "4mm" }}>
       <div style={sectionHeader}>01 - {t("A. GENERAL DATA", lang).replace("A. ", "")}</div>
       <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", fontWeight: "bold" }}>
          <tbody>
            <tr>
              <td style={cellLabel}>{t("Room / Tenant", lang)}</td>
              <td style={cellVal}>{unit?.room_tenant || "-"}</td>
              <td style={cellLabel}>{t("Service Date", lang)}</td>
              <td style={cellVal}>{personnel?.service_date ? new Date(personnel.service_date).toLocaleDateString(lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'id-ID') : "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Model Number", lang)}</td>
              <td style={cellVal}>{unit?.model || "-"}</td>
              <td style={cellLabel}>{t("SO / WO Number", lang)}</td>
              <td style={cellVal}>{personnel?.wo_number || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Unit Tag Number", lang)}</td>
              <td style={cellVal}>{unit?.tag_number || "-"}</td>
              <td style={cellLabel}>{t("Location", lang)}</td>
              <td style={cellVal}>{unit?.area || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Service Team", lang)}</td>
              <td style={cellVal}>{personnel?.name || "-"}</td>
              <td style={cellLabel}>{t("Visit Number", lang)}</td>
              <td style={cellVal}>{personnel?.visit || "1"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Service Time", lang)}</td>
              <td style={cellVal}>{personnel?.service_time || "-"} {lang === 'id' ? 'WIB' : ''}</td>
              <td style={cellLabel}>{t("Last PM Date", lang)}</td>
              <td style={cellVal}>{data.lastPreventiveDate ? new Date(data.lastPreventiveDate).toLocaleDateString(lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'id-ID') : "N/A"}</td>
            </tr>
          </tbody>
        </table>
    </div>,

    // SECTION 02: PIC CONTACT
    <div key="s2" style={{ marginBottom: "4mm" }}>
      <div style={sectionHeader}>02 - {lang === 'id' ? 'KONTAK PIC CUSTOMER' : lang === 'ja' ? '顧客担当者 (PIC)' : 'CUSTOMER PIC CONTACT'}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", fontWeight: "bold" }}>
        <tbody>
          <tr>
            <td style={cellLabel}>{t("WITNESSED BY", lang)} (PIC)</td>
            <td style={cellVal}>{pic?.name || "-"}</td>
            <td style={cellLabel}>{t("Department", lang)}</td>
            <td style={cellVal}>{pic?.department || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}>{lang === 'id' ? 'No. HP / WA' : 'Phone / WA'}</td>
            <td style={cellVal}>{pic?.phone || "-"}</td>
            <td style={cellLabel}>{lang === 'id' ? 'Email' : 'Email'}</td>
            <td style={cellVal}>{pic?.email || "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>,

    // SECTION 03: ANALYSIS & ACTIONS
    <div key="s3" style={{ marginBottom: "4mm" }}>
      <div style={sectionHeader}>03 - {t("Technical Advice & Summary", lang)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5mm" }}>
        <AnalysisBlock label={t("CASE / COMPLAINT", lang)} value={analysis?.complain} color="#dc2626" />
        <AnalysisBlock label={t("ROOT CAUSE ANALYSIS", lang)} value={analysis?.root_cause} color="#d97706" />
        <div style={{ display: "flex", gap: "2mm" }}>
          <AnalysisBlock label={t("TEMPORARY ACTION", lang)} value={analysis?.temp_action} color="#2563eb" flex={1} />
          <AnalysisBlock label={t("PERMANENT ACTION", lang)} value={analysis?.perm_action} color="#059669" flex={1} />
        </div>
        <AnalysisBlock label={t("RECOMMENDATION", lang)} value={analysis?.recommendation} color="#7c3aed" />
      </div>
    </div>,

    // SECTION 04: ENGINEER NOTES
    <div key="s4" style={{ marginBottom: "4mm" }}>
      <div style={sectionHeader}>04 - {t("Technical Advice & Summary", lang)}</div>
      <div style={{ border: "1px solid #ddd", padding: "2mm", fontSize: "8pt", fontWeight: 500, whiteSpace: "pre-wrap", color: "#444" }}>
        {engineerNote || "-"}
      </div>
    </div>,

    // SIGNATURE SECTION
    <div key="sign" style={{ marginTop: "10mm" }}>
       <ReportSignatureFooter 
         preparedBy={personnel?.name || ""}
         reviewedBy={data.engineerSignerName}
         witnessedBy={data.customerApproverName || pic?.name}
         reviewedDate={data.reviewedAt}
         witnessedDate={data.approvedAt}
         lang={lang}
       />
    </div>,

    // PHOTOS SECTION
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
                Photo {chunkIdx * 6 + i + 1}
              </p>
            </div>
          ))}
        </div>
      </div>
    ))
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
