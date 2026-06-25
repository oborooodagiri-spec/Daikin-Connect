import React from "react";
import { ReportSignatureFooter } from "./ReportSignatureFooter";
import { t, Language } from "@/lib/i18n";
import { getPhotoUrl } from "@/lib/photo_utils";

export const getMciSections = (data: any, unit: any, engineerName?: string, customerName?: string, lang: Language = 'id') => {
  const parsed = typeof data.technical_json === 'string' ? JSON.parse(data.technical_json) : (data.technical_json || {});
  const formData = parsed.formData || {};
  const activity_photos = data.photos || parsed.mediaItems || [];

  const chunkArray = (arr: any[], size: number) => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };
  const photoChunks = chunkArray(activity_photos, 6);

  const checkBoxes = (checked: boolean) => (
    <span style={{ fontSize: "10pt", border: "1px solid #000", display: "inline-block", width: "10px", height: "10px", lineHeight: "10px", textAlign: "center", marginRight: "4px", backgroundColor: checked ? "#000" : "#fff", color: checked ? "#fff" : "#fff" }}>
      {checked ? "X" : ""}
    </span>
  );

  return [
    // TITLE
    <div key="title" style={{ textAlign: "center", marginBottom: "8mm" }}>
      <h2 style={{ margin: 0, fontSize: "12pt", fontWeight: "bold", textTransform: "uppercase" }}>
        WARRANTY VISIT CHECK LIST
      </h2>
      <h3 style={{ margin: "2px 0 0 0", fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase" }}>
        DAIKIN WATER COOLED CENTRIFUGAL & SCREW CHILLER
      </h3>
    </div>,

    // HEADER INFO
    <div key="info" style={{ marginBottom: "6mm", display: "flex", justifyContent: "space-between", fontSize: "9pt" }}>
      <div style={{ width: "48%" }}>
        <div style={{ display: "flex", marginBottom: "4px" }}>
          <span style={{ width: "100px" }}>CUSTOMER</span> <span>: {formData.customer}</span>
        </div>
        <div style={{ display: "flex", marginBottom: "4px" }}>
          <span style={{ width: "100px" }}>Chiller Model</span> <span>: {formData.chiller_model}</span>
        </div>
        <div style={{ display: "flex", marginBottom: "4px" }}>
          <span style={{ width: "100px" }}>Serial Number</span> <span>: {formData.serial_number}</span>
        </div>
        <div style={{ display: "flex", marginBottom: "4px" }}>
          <span style={{ width: "100px" }}>SO Number</span> <span>: {formData.so_number}</span>
        </div>
      </div>
      <div style={{ width: "48%" }}>
        <div style={{ display: "flex", marginBottom: "4px" }}>
          <span style={{ width: "140px" }}>Inspections Date</span> <span>: {formData.inspections_date}</span>
        </div>
        <div style={{ display: "flex", marginBottom: "4px" }}>
          <span style={{ width: "140px" }}>Chiller Tag Number</span> <span>: {formData.chiller_tag_number}</span>
        </div>
      </div>
    </div>,

    // 2-COLUMN LAYOUT FOR CHECKLIST
    <div key="content" style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5pt", lineHeight: "1.4" }}>
      {/* LEFT COLUMN */}
      <div style={{ width: "48%" }}>
        {/* Q1 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>1. Review chiller log sheet (Log Sheet taken by Customer)</div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "4px" }}>
            <label>{checkBoxes(formData.q1_status === 'Optimal')} Optimal</label>
            <label>{checkBoxes(formData.q1_status === 'Not optimal')} Not optimal</label>
            <label>{checkBoxes(formData.q1_status === 'Not in operation')} Not in operation</label>
          </div>
          <div style={{ marginLeft: "10px" }}>
            <div>Comp 1. Running hours : <u style={{ minWidth: "30px", display: "inline-block", textAlign: "center" }}>{formData.q1_c1_rh}</u> Start counter <u style={{ minWidth: "30px", display: "inline-block", textAlign: "center" }}>{formData.q1_c1_sc}</u></div>
            <div>Comp 2. Running hours : <u style={{ minWidth: "30px", display: "inline-block", textAlign: "center" }}>{formData.q1_c2_rh}</u> Start counter <u style={{ minWidth: "30px", display: "inline-block", textAlign: "center" }}>{formData.q1_c2_sc}</u></div>
            <div>Comp 3. Running hours : <u style={{ minWidth: "30px", display: "inline-block", textAlign: "center" }}>{formData.q1_c3_rh}</u> Start counter <u style={{ minWidth: "30px", display: "inline-block", textAlign: "center" }}>{formData.q1_c3_sc}</u></div>
            <div>Voltage : <u style={{ minWidth: "60px", display: "inline-block", textAlign: "center" }}>{formData.q1_voltage}</u> Volt</div>
          </div>
        </div>

        {/* Q2 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>2. Check condition and setting of Control panels, safety controls and sensors, to ensure optimum performance and reliability.</div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
            <label>{checkBoxes(formData.q2_status === 'Good')} Good</label>
            <label>{checkBoxes(formData.q2_status === 'No Good')} No Good</label>
          </div>
          <div>Comment : <u>{formData.q2_comment || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
        </div>

        {/* Q3 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>3. Check Stater Panel conditions, connections and wiring tightness to ensure optimum performance and reliability.</div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
            <label>{checkBoxes(formData.q3_status === 'Good')} Good</label>
            <label>{checkBoxes(formData.q3_status === 'No Good')} No Good</label>
          </div>
          <div>Comment : <u>{formData.q3_comment || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
        </div>

        {/* Q4 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>4. Check for leak, bolts and nuts tightness.</div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
            <label>{checkBoxes(formData.q4_status === 'Good')} Good</label>
            <label>{checkBoxes(formData.q4_status === 'No Good')} No Good</label>
          </div>
          <div>Comment : <u>{formData.q4_comment || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
        </div>

        {/* Q5 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>5. Check Condenser water pressure drop and flow switch operation</div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
            <label>{checkBoxes(formData.q5_status === 'Good')} Good</label>
            <label>{checkBoxes(formData.q5_status === 'No Good')} No Good</label>
          </div>
          <div>Comment : <u>{formData.q5_comment || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
        </div>

        {/* Q6 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>6. Check Chilled water pressure drop and flow switch operation</div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
            <label>{checkBoxes(formData.q6_status === 'Good')} Good</label>
            <label>{checkBoxes(formData.q6_status === 'No Good')} No Good</label>
          </div>
          <div>Comment : <u>{formData.q6_comment || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
        </div>

        {/* Q7 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>7. Start chiller and completing log sheet (log sheet attached).</div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
            <label>{checkBoxes(formData.q7_status === 'Good')} Good</label>
            <label>{checkBoxes(formData.q7_status === 'No Good')} No Good</label>
          </div>
          <div>Comment : <u>{formData.q7_comment || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ width: "48%" }}>
        {/* Q8 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>8. Check for proper refrigerant charge.</div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
            <label>{checkBoxes(formData.q8_status === 'Good')} Good</label>
            <label>{checkBoxes(formData.q8_status === 'No Good')} No Good</label>
          </div>
          <div>Comment : <u>{formData.q8_comment || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
        </div>

        {/* Q9 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>9. Check for Oil Pump Operations (Centrifugal Only) and Oil Level</div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
            <label>{checkBoxes(formData.q9_status === 'Good')} Good</label>
            <label>{checkBoxes(formData.q9_status === 'No Good')} No Good</label>
          </div>
          <div>Comment : <u>{formData.q9_comment || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
        </div>

        {/* Q10 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>10. Determine level of heat exchanger tube fouling from analysis of available log reading or reading taken during inspection</div>
          <div style={{ marginBottom: "2px" }}>Δ T sat. condenser temp. - Condenser liquid leaving temp. : <u style={{ minWidth: "30px", display: "inline-block", textAlign: "center" }}>{formData.q10_delta_t}</u> °F</div>
          <div>Comment : <u>{formData.q10_comment || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
        </div>

        {/* Q11 */}
        <div style={{ marginBottom: "4mm" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>11. Review log sheet (after running test) and verifying proper equipment operation though analysis and provide written report to customer detailing any deficiencies</div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
            <label>{checkBoxes(formData.q11_status === 'Optimal')} Optimal</label>
            <label>{checkBoxes(formData.q11_status === 'Not optimal')} Not optimal</label>
          </div>
          <div style={{ marginBottom: "2px" }}>Mechanic's Remarks : <u>{formData.q11_mechanic_remarks || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
          <div>Comment : <u>{formData.q11_comment || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}</u></div>
        </div>
      </div>
    </div>,
    
    // TEXT BELOW THE TWO COLUMNS
    <div key="footer-text" style={{ fontSize: "8.5pt", marginTop: "4mm", marginBottom: "20mm" }}>
      The above check has been performed as per the instruction
    </div>,

    // SIGNATURES
    <div key="sign" style={{ display: "flex", justifyContent: "space-between", marginTop: "10mm", fontSize: "9pt", fontWeight: "bold" }}>
      <div style={{ width: "40%", textAlign: "center" }}>
        <div>CUSTOMER'S SIGNATURE</div>
        <div style={{ height: "25mm", margin: "10px 0" }}>
          {data.reviewer_signature && (
             <img src={data.reviewer_signature} alt="Sign" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
          )}
        </div>
        <div>( .............................................................. )</div>
        <div style={{ marginTop: "5px" }}>Date : ............................................</div>
      </div>
      <div style={{ width: "40%", textAlign: "center" }}>
        <div>DAIKIN SIGNATURE</div>
        <div style={{ height: "25mm", margin: "10px 0" }}>
          {/* Internal Engineer signature can go here if provided, else use reviewer_signature as customer? Actually in standard form it's Daikin engineer & Customer. */}
          {data.engineer_signer_name && (
             <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", height: "100%", fontStyle: "italic", fontWeight: "normal" }}>
               Signed by {data.engineer_signer_name}
             </div>
          )}
        </div>
        <div>( {data.engineer_signer_name || ".............................................................."} )</div>
        <div style={{ marginTop: "5px" }}>Date : {data.created_at ? new Date(data.created_at).toLocaleDateString() : "....................."}</div>
      </div>
    </div>,

    // PHOTOS
    ...(photoChunks.length > 0 ? (
      photoChunks.map((chunk, chunkIdx) => (
        <div key={`photos-${chunkIdx}`} style={{ width: "100%", marginTop: "10mm", pageBreakBefore: "always" }}>
          <div style={categoryHeader}>
            {t("Maintenance Documentation Photos", lang)} {photoChunks.length > 1 ? `(Page ${chunkIdx + 1})` : ''}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm" }}>
            {chunk.map((p: any, i: number) => (
              <div key={i} style={photoWrapperStyle}>
                <img 
                  src={getPhotoUrl(p.photo_url)} 
                  alt={`Photo ${i}`} 
                  style={photoImgStyle} 
                />
                <p style={photoCaptionStyle}>
                  Photo {chunkIdx * 6 + i + 1}: {p.description || 'Maintenance Documentation'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))
    ) : [])
  ].filter(Boolean);
};

// --- STYLING ---
const categoryHeader: React.CSSProperties = { 
  fontSize: "9pt", 
  fontWeight: 900, 
  color: "#003366", 
  borderLeft: "4px solid #003366", 
  paddingLeft: "2mm", 
  marginBottom: "2mm", 
  textTransform: "uppercase",
  backgroundColor: "hsl(210, 50%, 96%)",
  padding: "1.5mm 2mm"
};

const photoWrapperStyle: React.CSSProperties = { border: "1px solid #e2e8f0", padding: "1mm", borderRadius: "1.5mm", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const photoImgStyle: React.CSSProperties = { width: "100%", height: "50mm", objectFit: "cover", borderRadius: "1mm" };
const photoCaptionStyle: React.CSSProperties = { fontSize: "7pt", margin: "1mm 0 0.5mm 0", textAlign: "center", color: "#64748b", fontWeight: 700 };
