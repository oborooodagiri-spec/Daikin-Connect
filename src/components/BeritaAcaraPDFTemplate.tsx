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

export const BeritaAcaraPDFTemplate = ({ 
  data, 
  unit, 
  engineerName, 
  isSystemApproved, 
  customerApproverName, 
  approvedAt 
}: BeritaAcaraProps) => {
  const currentDate = new Date();
  const reportDate = data.service_date ? new Date(data.service_date) : currentDate;

  const sectionHeader: React.CSSProperties = {
    fontSize: "11pt",
    fontWeight: 900,
    color: "#fff",
    backgroundColor: "#003366",
    padding: "2mm 4mm",
    marginBottom: "4mm",
    marginTop: "6mm",
    clipPath: "polygon(0 0, 97% 0, 100% 100%, 0% 100%)",
    textTransform: "uppercase"
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "9pt",
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "1mm"
  };

  const valueStyle: React.CSSProperties = {
    fontSize: "11pt",
    fontWeight: 700,
    color: "#0f172a",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "1mm",
    marginBottom: "4mm"
  };

  return (
    <div style={{ padding: "5mm 10mm" }}>
      <p style={{ textAlign: "center", fontSize: "10pt", fontWeight: 700, color: "#64748b", marginBottom: "8mm", fontStyle: "italic" }}>
        Dokumen ini merupakan Berita Acara resmi atas pekerjaan teknis yang telah dilaksanakan pada unit terdaftar.
      </p>

      {/* 1. WAKTU & TEMPAT */}
      <div style={sectionHeader}>I. Waktu & Lokasi Pelaksanaan</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8mm" }}>
        <div>
          <p style={labelStyle}>Hari / Tanggal</p>
          <p style={valueStyle}>
            {reportDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p style={labelStyle}>Lokasi Proyek</p>
          <p style={valueStyle}>{unit.customer_name || unit.projects?.name || 'Multi-Project Customer'}</p>
        </div>
        <div>
          <p style={labelStyle}>Waktu Pelaksanaan</p>
          <p style={valueStyle}>
            {reportDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
          </p>
          <p style={labelStyle}>Area / Lantai / Ruangan</p>
          <p style={valueStyle}>{unit.area} / {unit.building_floor} / {unit.room_tenant}</p>
        </div>
      </div>

      {/* 2. IDENTITAS UNIT */}
      <div style={sectionHeader}>II. Identitas Unit</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6mm" }}>
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

      {/* 3. HASIL PEKERJAAN */}
      <div style={sectionHeader}>III. Ringkasan Pekerjaan & Temuan</div>
      <div style={{ minHeight: "40mm", border: "1px solid #e2e8f0", padding: "4mm", borderRadius: "2mm", backgroundColor: "#f8fafd" }}>
        <p style={{ fontSize: "10pt", fontWeight: 700, color: "#1e293b", marginBottom: "2mm", textDecoration: "underline" }}>Jenis Pekerjaan: {data.type || 'Service Activity'}</p>
        <p style={{ fontSize: "10pt", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
          {data.engineer_note || "Pekerjaan telah dilaksanakan sesuai dengan standar prosedur Daikin. Parameter teknis telah dicatat dalam lembar pemeriksaan (Checksheet) terlampir."}
        </p>
        {data.technical_advice && (
          <div style={{ marginTop: "4mm", paddingTop: "4mm", borderTop: "1px dashed #cbd5e1" }}>
             <p style={{ fontSize: "9pt", fontWeight: 900, color: "#003366", textTransform: "uppercase" }}>Saran & Rekomendasi:</p>
             <p style={{ fontSize: "9pt", color: "#475569" }}>{data.technical_advice}</p>
          </div>
        )}
      </div>

      <p style={{ marginTop: "6mm", fontSize: "9pt", color: "#64748b", lineHeight: "1.4" }}>
        Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya. Seluruh data teknis pendukung tersedia dalam sistem Daikin Connect.
      </p>

      {/* 4. SIGNATURES */}
      <div style={{ marginTop: "12mm", display: "flex", justifyContent: "space-between", gap: "5mm" }}>
        
        {/* Auditor / Engineer */}
        <div style={{ flex: 1, textAlign: "center", border: "1px solid #f1f5f9", padding: "4mm", borderRadius: "2mm" }}>
          <p style={{ fontSize: "8pt", fontWeight: 900, color: "#64748b", textTransform: "uppercase", marginBottom: "15mm" }}>Prepared by (Auditor),</p>
          <div style={{ marginBottom: "2mm" }}>
            <p style={{ fontSize: "10pt", fontWeight: 900, color: "#003366", margin: 0 }}>{engineerName}</p>
            <p style={{ fontSize: "7pt", fontWeight: 700, color: "#059669", margin: 0 }}>[ DIGITALLY SIGNED ]</p>
          </div>
          <div style={{ width: "100%", height: "0.5mm", backgroundColor: "#003366" }}></div>
          <p style={{ fontSize: "7pt", color: "#94a3b8", marginTop: "1mm" }}>Technician / PIC</p>
        </div>

        {/* Customer / PIC */}
        <div style={{ flex: 1, textAlign: "center", border: "1px solid #f1f5f9", padding: "4mm", borderRadius: "2mm", position: "relative" }}>
          <p style={{ fontSize: "8pt", fontWeight: 900, color: "#64748b", textTransform: "uppercase", marginBottom: "15mm" }}>Witnessed by (Customer),</p>
          {isSystemApproved ? (
            <div style={{ marginBottom: "2mm" }}>
              <p style={{ fontSize: "10pt", fontWeight: 900, color: "#003366", margin: 0 }}>{customerApproverName}</p>
              <p style={{ fontSize: "7pt", fontWeight: 700, color: "#059669", margin: 0 }}>[ SYSTEM VERIFIED BY CLICK ]</p>
              <p style={{ fontSize: "6pt", color: "#94a3b8" }}>Date: {approvedAt ? new Date(approvedAt).toLocaleString() : '-'}</p>
            </div>
          ) : (
            <div style={{ height: "18mm", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <p style={{ fontSize: "8pt", color: "#cbd5e1", fontStyle: "italic" }}>Waiting for Signature</p>
            </div>
          )}
          <div style={{ width: "100%", height: "0.5mm", backgroundColor: "#003366" }}></div>
          <p style={{ fontSize: "7pt", color: "#94a3b8", marginTop: "1mm" }}>Building Manager / PIC</p>
        </div>

        {/* Management (Acknowledged) */}
        <div style={{ flex: 1, textAlign: "center", border: "1px solid #f1f5f9", padding: "4mm", borderRadius: "2mm" }}>
          <p style={{ fontSize: "8pt", fontWeight: 900, color: "#64748b", textTransform: "uppercase", marginBottom: "15mm" }}>Acknowledged by,</p>
          <div style={{ height: "18mm" }}></div>
          <div style={{ width: "100%", height: "0.5mm", backgroundColor: "#003366" }}></div>
          <p style={{ fontSize: "7pt", color: "#94a3b8", marginTop: "1mm" }}>Facility Management</p>
        </div>

      </div>
    </div>
  );
};
