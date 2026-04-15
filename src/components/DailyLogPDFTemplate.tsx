import { ReportSignatureFooter } from "./ReportSignatureFooter";
import { t, Language } from "@/lib/i18n";
import { format } from "date-fns";

export const getDailyLogSections = (data: any, unit: any, engineerName?: string, customerName?: string, lang: Language = 'id') => {
  const log = data.activity || data;
  
  const cellLabel: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 2mm", backgroundColor: "#f8fafd", width: "22%", fontSize: "7pt", fontWeight: 800, color: "#003366" };
  const cellVal: React.CSSProperties = { border: "1px solid #ddd", padding: "1mm 2mm", width: "28%", fontSize: "8pt", fontWeight: 600, color: "#111" };
  const sectionHeader: React.CSSProperties = { fontSize: "10pt", fontStyle: "italic", fontWeight: 900, color: "#003366", borderBottom: "2px solid #003366", paddingBottom: "1mm", marginBottom: "2mm", textTransform: "uppercase", marginTop: "4mm" };
  const fieldLabel: React.CSSProperties = { fontSize: "7pt", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5mm" };
  const fieldVal: React.CSSProperties = { fontSize: "9pt", fontWeight: 900, color: "#003366" };

  return [
    // PAGE TITLE
    <p key="title" style={{ fontSize: "11pt", fontWeight: 900, color: "#003366", textAlign: "center", marginBottom: "3mm", marginTop: "-1mm" }}>DAILY OPERATIONAL LOGSHEET</p>,

    // SECTION: UNIT INFO
    <div key="info" style={{ marginBottom: "4mm" }}>
       <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", fontWeight: "bold" }}>
          <tbody>
            <tr>
              <td style={cellLabel}>{t("Room / Tenant", lang)}</td>
              <td style={cellVal}>{unit?.room_tenant || "-"}</td>
              <td style={cellLabel}>{t("Log Date", lang)}</td>
              <td style={cellVal}>{log.service_date ? format(new Date(log.service_date), "dd MMM yyyy") : "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Unit Tag", lang)}</td>
              <td style={cellVal}>{unit?.tag_number || "-"}</td>
              <td style={cellLabel}>{t("Inspector", lang)}</td>
              <td style={cellVal}>{log.inspector_name || "-"}</td>
            </tr>
            <tr>
              <td style={cellLabel}>{t("Model / Brand", lang)}</td>
              <td style={cellVal}>{unit?.model} / {unit?.brand || "Daikin"}</td>
              <td style={cellLabel}>{t("Location", lang)}</td>
              <td style={cellVal}>{unit?.building_floor} / {unit?.area || "-"}</td>
            </tr>
          </tbody>
        </table>
    </div>,

    // SECTION: ELECTRICAL
    <div key="electrical">
      <div style={sectionHeader}>Electrical Parameters</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", marginBottom: "4mm" }}>
         {/* FAN MOTOR */}
         <div style={{ padding: "3mm", border: "1px solid #e2e8f0", borderRadius: "2mm" }}>
            <div style={{ fontSize: "8pt", fontWeight: 900, color: "#0369a1", marginBottom: "2mm", borderBottom: "1px solid #e2e8f0" }}>FAN MOTOR {log.fan_on ? "(ON)" : "(OFF)"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm", marginBottom: "2mm" }}>
               <div>
                  <div style={fieldLabel}>Fan Speed</div>
                  <div style={fieldVal}>{log.fan_speed || "0"} %</div>
               </div>
            </div>
            <div style={{ marginBottom: "2mm" }}>
               <div style={fieldLabel}>Amperage (R-S-T)</div>
               <div style={{ ...fieldVal, fontSize: "8pt" }}>{log.fan_curr_r || "0"} | {log.fan_curr_s || "0"} | {log.fan_curr_t || "0"} <span style={{fontSize: "7pt", fontWeight: 500}}>Amp</span></div>
            </div>
            <div>
               <div style={fieldLabel}>Voltage (RS-ST-RT)</div>
               <div style={{ ...fieldVal, fontSize: "8pt" }}>{log.fan_volt_r || "0"} | {log.fan_volt_s || "0"} | {log.fan_volt_t || "0"} <span style={{fontSize: "7pt", fontWeight: 500}}>Volt</span></div>
            </div>
         </div>

         {/* HEATER */}
         <div style={{ padding: "3mm", border: "1px solid #fee2e2", borderRadius: "2mm", backgroundColor: "#fffafb" }}>
            <div style={{ fontSize: "8pt", fontWeight: 900, color: "#be123c", marginBottom: "2mm", borderBottom: "1px solid #fee2e2" }}>ELECTRIC HEATER {log.heater_on ? "(ON)" : "(OFF)"}</div>
            {log.heater_on ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2mm" }}>
                <div>
                  <div style={fieldLabel}>Amperage (R-S-T)</div>
                  <div style={{ ...fieldVal, color: "#be123c" }}>{log.heater_curr_r || "0"} | {log.heater_curr_s || "0"} | {log.heater_curr_t || "0"} <span style={{fontSize: "7pt", fontWeight: 500}}>Amp</span></div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "7pt", color: "#999", fontStyle: "italic", textAlign: "center", paddingTop: "5mm" }}>Heater is inactive</div>
            )}
         </div>
      </div>
    </div>,

    // SECTION: MECHANICAL & AIR
    <div key="mechanical">
       <div style={sectionHeader}>Mechanical & Air Conditions</div>
       <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", marginBottom: "4mm" }}>
          <tbody>
             <tr>
                <td style={{ ...cellLabel, width: "25%" }}>Valve Opening</td>
                <td style={{ ...cellVal, width: "25%", color: "#00a1e4" }}>{log.valve_opening || "0"}%</td>
                <td style={{ ...cellLabel, width: "25%" }}>Static Pressure</td>
                <td style={{ ...cellVal, width: "25%" }}>{log.static_pressure || "0"} Pa</td>
             </tr>
             <tr>
                <td style={cellLabel}>Supply Air (T / RH)</td>
                <td style={cellVal}>{log.supply_temp}°C / {log.supply_rh}%</td>
                <td style={cellLabel}>Return Air (T / RH)</td>
                <td style={cellVal}>{log.return_temp}°C / {log.return_rh}%</td>
             </tr>
             <tr>
                <td style={cellLabel}>Outdoor Air (T / RH)</td>
                <td style={cellVal}>{log.fresh_temp}°C / {log.fresh_rh}%</td>
                <td style={cellLabel}>Room Temperature</td>
                <td style={cellVal}>{log.room_temp || "0"}°C</td>
             </tr>
          </tbody>
       </table>
    </div>,

    // SECTION: FILTERS & MAPPING
    <div key="mapping">
       <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "4mm", marginBottom: "4mm" }}>
          {/* FILTER STATUS */}
          <div>
            <div style={sectionHeader}>Filter Status</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.5pt" }}>
               <tbody>
                  <tr>
                    <td style={{ ...cellLabel, width: "50%" }}>Pre-Filter</td>
                    <td style={{ ...cellVal, width: "50%", color: log.filter_pre === 'Kotor' ? '#e11d48' : '#059669' }}>{log.filter_pre}</td>
                  </tr>
                  <tr>
                    <td style={cellLabel}>Medium Filter</td>
                    <td style={{ ...cellVal, color: log.filter_med === 'Kotor' ? '#e11d48' : '#059669' }}>{log.filter_med}</td>
                  </tr>
                  <tr>
                    <td style={cellLabel}>HEPA Filter</td>
                    <td style={{ ...cellVal, color: log.filter_hepa === 'Kotor' ? '#e11d48' : '#059669' }}>{log.filter_hepa}</td>
                  </tr>
               </tbody>
            </table>
          </div>

          {/* ROOM STATS */}
          <div>
            <div style={sectionHeader}>Room Environment</div>
            <div style={{ padding: "3mm", border: "1px solid #e2e8f0", borderRadius: "2mm", backgroundColor: "#f8fafc" }}>
               <div style={{ marginBottom: "2mm" }}>
                  <div style={fieldLabel}>Differential Pressure</div>
                  <div style={fieldVal}>{log.room_diff_press || "0"} Pa</div>
               </div>
               <div style={fieldLabel}>Temperature Mapping (Spots)</div>
               <div style={{ display: "flex", gap: "2mm", marginTop: "1mm" }}>
                  {[log.temp_s1, log.temp_s2, log.temp_s3, log.temp_s4, log.temp_s5].map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center", padding: "1mm", border: "1px solid #cbd5e1", borderRadius: "1mm", backgroundColor: "#fff" }}>
                       <div style={{ fontSize: "6pt", color: "#94a3b8" }}>S{i+1}</div>
                       <div style={{ fontSize: "7pt", fontWeight: 900 }}>{s || "-"}</div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
       </div>
    </div>,

    // SECTION: STATUS CHECKS
    <div key="checks" style={{ marginBottom: "4mm" }}>
       <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
             <tr>
                <td style={{ ...cellLabel, width: "25%" }}>Vibration Motor</td>
                <td style={{ ...cellVal, width: "25%", color: log.vibration_status === 'Ada' ? '#e11d48' : '#059669' }}>{log.vibration_status}</td>
                <td style={{ ...cellLabel, width: "25%" }}>Condensate Drain</td>
                <td style={{ ...cellVal, width: "25%", color: log.drainage_status === 'Abnormal' ? '#e11d48' : '#059669' }}>{log.drainage_status}</td>
             </tr>
          </tbody>
       </table>
    </div>,

    // SECTION: NOTES
    <div key="notes" style={{ marginBottom: "6mm" }}>
      <div style={sectionHeader}>Findings & Remarks</div>
      <div style={{ border: "1px solid #ddd", padding: "3mm", fontSize: "8pt", minHeight: "15mm", fontWeight: 500, color: "#444", fontStyle: "italic" }}>
        {log.notes || "No special findings for today."}
      </div>
    </div>,

    // SIGNATURES
    <div key="sign" style={{ marginTop: "10mm" }}>
       <ReportSignatureFooter 
         preparedBy={log.inspector_name || ""}
         reviewedBy={log.engineer_signer_name}
         witnessedBy={log.customer_approver_name || customerName}
         reviewedDate={log.engineer_approved_at}
         witnessedDate={log.customer_approved_at}
         lang={lang}
       />
    </div>
  ];
};
