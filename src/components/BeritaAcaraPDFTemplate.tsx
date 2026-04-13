import { ReportSignatureFooter } from './ReportSignatureFooter';
import { t, Language } from '@/lib/i18n';

interface BeritaAcaraProps {
  data: any;
  unit: any;
  engineerName: string;
  isSystemApproved?: boolean;
  customerApproverName?: string;
  approvedAt?: string | Date;
}

export const getBeritaAcaraSections = (data: any, unit: any, engineerName: string, options: any = {}) => {
  const { isSystemApproved, customerApproverName, approvedAt, engineerSignerName, reviewedAt, lang: optLang } = options;
  const lang = (optLang || data.lang) as Language || 'id';
  const currentDate = new Date();
  // BUG FIX: Gunakan created_at untuk mendapatkan Jam yang presisi, service_date seringkali hanya Tanggal.
  const reportDate = data.created_at ? new Date(data.created_at) : (data.service_date ? new Date(data.service_date) : currentDate);

  const sectionHeader: React.CSSProperties = {
    fontSize: "10pt",
    fontWeight: 900,
    color: "#fff",
    backgroundColor: "#003366",
    padding: "1.2mm 2.5mm",
    marginBottom: "2mm",
    marginTop: "3mm",
    clipPath: "polygon(0 0, 97% 0, 100% 100%, 0% 100%)",
    textTransform: "uppercase"
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "8pt",
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "0.2mm"
  };

  const valueStyle: React.CSSProperties = {
    fontSize: "9pt",
    fontWeight: 700,
    color: "#0f172a",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "0.2mm",
    marginBottom: "2.5mm"
  };

  return [
    // INTRO
    <div key="intro">
      <p style={{ textAlign: "center", fontSize: "9pt", fontWeight: 700, color: "#64748b", marginBottom: "4mm", fontStyle: "italic" }}>
        {lang === 'id' ? "Berita Acara resmi atas pekerjaan teknis unit terdaftar." : lang === 'ja' ? "登録済みユニットの技術作業に関する公式報告書。" : "Official minutes of technical work for the registered unit."}
      </p>
    </div>,

    // 1. WAKTU & TEMPAT
    <div key="waktu">
      <div style={sectionHeader}>I. {t("Location", lang)} & {lang === 'ja' ? '日時' : 'Time'}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5mm" }}>
        <div>
          <p style={labelStyle}>{t("Service Date", lang)}</p>
          <p style={valueStyle}>
            {reportDate.toLocaleDateString(lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p style={labelStyle}>{t("Location", lang)}</p>
          <p style={valueStyle}>{unit.customer_name || unit.projects?.name || 'Multi-Project Customer'}</p>
        </div>
        <div>
          <p style={labelStyle}>{lang === 'ja' ? '時間' : 'Time'}</p>
          <p style={valueStyle}>
            {reportDate.toLocaleTimeString(lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })} {lang === 'id' ? 'WIB' : ''}
          </p>
          <p style={labelStyle}>{t("Room / Tenant", lang)}</p>
          <p style={valueStyle}>{unit.area} / {unit.building_floor} / {unit.room_tenant}</p>
        </div>
      </div>
    </div>,

    // 2. IDENTITAS UNIT
    <div key="identitas">
      <div style={sectionHeader}>II. {t("Unit ID", lang)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5mm" }}>
        <div>
          <p style={labelStyle}>{t("Tag Number", lang)}</p>
          <p style={valueStyle}>{unit.tag_number}</p>
        </div>
        <div>
          <p style={labelStyle}>{t("Model / Brand", lang)}</p>
          <p style={valueStyle}>{unit.model} / {unit.brand}</p>
        </div>
        <div>
          <p style={labelStyle}>{t("Serial Number", lang)}</p>
          <p style={valueStyle}>{unit.serial_number || '-'}</p>
        </div>
      </div>
    </div>,

    // 3. HASIL PEKERJAAN
    <div key="hasil">
      <div style={sectionHeader}>III. {t("Technical Advice & Summary", lang)}</div>
      <div style={{ minHeight: "25mm", border: "1px solid #e2e8f0", padding: "3mm", borderRadius: "1.5mm", backgroundColor: "#f8fafd" }}>
        <p style={{ fontSize: "9.5pt", fontWeight: 700, color: "#1e293b", marginBottom: "1.5mm", textDecoration: "underline" }}>
          {lang === 'id' ? 'Jenis Pekerjaan' : lang === 'ja' ? '作業の種類' : 'Activity Type'}: {data.type || 'Service Activity'}
        </p>
        <p style={{ fontSize: "9pt", color: "#334155", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
          {data.engineer_note || (lang === 'id' ? "Pekerjaan telah dilaksanakan sesuai prosedur Daikin." : lang === 'ja' ? "作業はダイキンの手順に従って実施されました。" : "The work has been carried out according to Daikin procedures.")}
        </p>
        {data.technical_advice && (
          <div style={{ marginTop: "2mm", paddingTop: "2mm", borderTop: "1px dashed #cbd5e1" }}>
             <p style={{ fontSize: "8.5pt", fontWeight: 900, color: "#003366", textTransform: "uppercase" }}>
               {lang === 'ja' ? 'アドバイス' : lang === 'id' ? 'SARAN TEKNIS' : 'ADVICE'}:
             </p>
             <p style={{ fontSize: "8.5pt", color: "#475569" }}>{data.technical_advice}</p>
          </div>
        )}
      </div>

      <p style={{ marginTop: "3mm", fontSize: "8pt", color: "#64748b", lineHeight: "1.2" }}>
        {lang === 'id' ? "Demikian Berita Acara ini dibuat sebenarnya untuk dipergunakan semestinya. Data teknis tersedia di sistem Daikin Connect." : lang === 'ja' ? "この報告書は正当な目的のために作成されました。技術データはDaikin Connectシステムで利用可能です。" : "Thus, these minutes are made correctly to be used appropriately. Technical data is available in the Daikin Connect system."}
      </p>
    </div>,

    // 4. SIGNATURES
    <div key="sign" style={{ marginTop: "10mm" }}>
      <ReportSignatureFooter 
        preparedBy={engineerName || ""}
        reviewedBy={engineerSignerName}
        witnessedBy={customerApproverName}
        reviewedDate={reviewedAt}
        witnessedDate={approvedAt}
        lang={lang}
      />
    </div>
  ];
};

// Keep the old component for backward compatibility if needed, but it will wrap the new function
export const BeritaAcaraPDFTemplate = (props: any) => {
  const sections = getBeritaAcaraSections(props.data, props.unit, props.engineerName, props);
  return <div style={{ padding: "0 5mm" }}>{sections}</div>;
};
