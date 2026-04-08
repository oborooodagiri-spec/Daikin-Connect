import React from 'react';
import { ReportBase } from './ReportBase';

interface BeritaAcaraProps {
  data: any;
  unit: any;
  engineerName: string;
  isSystemApproved?: boolean;
  customerApproverName?: string;
  approvedAt?: string | Date;
}

export const getBeritaAcaraSections = (data: any, unit: any, engineerName: string, options: any = {}) => {
  const { isSystemApproved, customerApproverName, approvedAt } = options;
  const currentDate = new Date();
  const reportDate = data.service_date ? new Date(data.service_date) : currentDate;

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
        Berita Acara resmi atas pekerjaan teknis unit terdaftar.
      </p>
    </div>,

    // 1. WAKTU & TEMPAT
    <div key="waktu">
      <div style={sectionHeader}>I. Waktu & Lokasi</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5mm" }}>
        <div>
          <p style={labelStyle}>Hari / Tanggal</p>
          <p style={valueStyle}>
            {reportDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p style={labelStyle}>Lokasi Proyek</p>
          <p style={valueStyle}>{unit.customer_name || unit.projects?.name || 'Multi-Project Customer'}</p>
        </div>
        <div>
          <p style={labelStyle}>Waktu</p>
          <p style={valueStyle}>
            {reportDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
          </p>
          <p style={labelStyle}>Area / Lantai / Ruangan</p>
          <p style={valueStyle}>{unit.area} / {unit.building_floor} / {unit.room_tenant}</p>
        </div>
      </div>
    </div>,

    // 2. IDENTITAS UNIT
    <div key="identitas">
      <div style={sectionHeader}>II. Identitas Unit</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5mm" }}>
        <div>
          <p style={labelStyle}>Tag Number</p>
          <p style={valueStyle}>{unit.tag_number}</p>
        </div>
        <div>
          <p style={labelStyle}>Model / Brand</p>
          <p style={valueStyle}>{unit.model} / {unit.brand}</p>
        </div>
        <div>
          <p style={labelStyle}>Serial Number</p>
          <p style={valueStyle}>{unit.serial_number || '-'}</p>
        </div>
      </div>
    </div>,

    // 3. HASIL PEKERJAAN
    <div key="hasil">
      <div style={sectionHeader}>III. Ringkasan Pekerjaan</div>
      <div style={{ minHeight: "25mm", border: "1px solid #e2e8f0", padding: "3mm", borderRadius: "1.5mm", backgroundColor: "#f8fafd" }}>
        <p style={{ fontSize: "9.5pt", fontWeight: 700, color: "#1e293b", marginBottom: "1.5mm", textDecoration: "underline" }}>Jenis Pekerjaan: {data.type || 'Service Activity'}</p>
        <p style={{ fontSize: "9pt", color: "#334155", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
          {data.engineer_note || "Pekerjaan telah dilaksanakan sesuai prosedur Daikin."}
        </p>
        {data.technical_advice && (
          <div style={{ marginTop: "2mm", paddingTop: "2mm", borderTop: "1px dashed #cbd5e1" }}>
             <p style={{ fontSize: "8.5pt", fontWeight: 900, color: "#003366", textTransform: "uppercase" }}>Saran:</p>
             <p style={{ fontSize: "8.5pt", color: "#475569" }}>{data.technical_advice}</p>
          </div>
        )}
      </div>

      <p style={{ marginTop: "3mm", fontSize: "8pt", color: "#64748b", lineHeight: "1.2" }}>
        Demikian Berita Acara ini dibuat sebenarnya untuk dipergunakan semestinya. Data teknis tersedia di sistem Daikin Connect.
      </p>
    </div>,

    // 4. SIGNATURES
    <div key="sign" style={{ marginTop: "4mm", display: "flex", justifyContent: "space-between", gap: "3mm" }}>
      {/* Auditor / Engineer */}
      <div style={{ flex: 1, textAlign: "center", border: "1px solid #f1f5f9", padding: "2.5mm", borderRadius: "1.5mm" }}>
        <p style={{ fontSize: "7pt", fontWeight: 900, color: "#64748b", textTransform: "uppercase", marginBottom: "10mm" }}>Prepared by,</p>
        <div style={{ marginBottom: "1.5mm" }}>
          <p style={{ fontSize: "8.5pt", fontWeight: 900, color: "#003366", margin: 0 }}>{engineerName}</p>
          <p style={{ fontSize: "6pt", fontWeight: 700, color: "#059669", margin: 0 }}>[ DIGITALLY SIGNED ]</p>
        </div>
        <div style={{ width: "100%", height: "0.4mm", backgroundColor: "#003366" }}></div>
        <p style={{ fontSize: "6pt", color: "#94a3b8", marginTop: "0.5mm" }}>Technician / PIC</p>
      </div>

      {/* Customer / PIC */}
      <div style={{ flex: 1, textAlign: "center", border: "1px solid #f1f5f9", padding: "2.5mm", borderRadius: "1.5mm", position: "relative" }}>
        <p style={{ fontSize: "7pt", fontWeight: 900, color: "#64748b", textTransform: "uppercase", marginBottom: "10mm" }}>Witnessed by,</p>
        {isSystemApproved ? (
          <div style={{ marginBottom: "1.5mm" }}>
            <p style={{ fontSize: "8.5pt", fontWeight: 900, color: "#003366", margin: 0 }}>{customerApproverName}</p>
            <p style={{ fontSize: "6pt", fontWeight: 700, color: "#059669", margin: 0 }}>[ SYSTEM VERIFIED ]</p>
            <p style={{ fontSize: "5.5pt", color: "#94a3b8" }}>{approvedAt ? new Date(approvedAt).toLocaleDateString() : '-'}</p>
          </div>
        ) : (
          <div style={{ height: "12mm", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <p style={{ fontSize: "7pt", color: "#cbd5e1", fontStyle: "italic" }}>Waiting</p>
          </div>
        )}
        <div style={{ width: "100%", height: "0.4mm", backgroundColor: "#003366" }}></div>
        <p style={{ fontSize: "6pt", color: "#94a3b8", marginTop: "0.5mm" }}>Building Manager / PIC</p>
      </div>

      {/* Management */}
      <div style={{ flex: 1, textAlign: "center", border: "1px solid #f1f5f9", padding: "2.5mm", borderRadius: "1.5mm" }}>
        <p style={{ fontSize: "7pt", fontWeight: 900, color: "#64748b", textTransform: "uppercase", marginBottom: "10mm" }}>Acknowledged,</p>
        <div style={{ height: "12mm" }}></div>
        <div style={{ width: "100%", height: "0.4mm", backgroundColor: "#003366" }}></div>
        <p style={{ fontSize: "6pt", color: "#94a3b8", marginTop: "0.5mm" }}>Facility Management</p>
      </div>
    </div>
  ];
};

// Keep the old component for backward compatibility if needed, but it will wrap the new function
export const BeritaAcaraPDFTemplate = (props: any) => {
  const sections = getBeritaAcaraSections(props.data, props.unit, props.engineerName, props);
  return <div style={{ padding: "0 5mm" }}>{sections}</div>;
};
