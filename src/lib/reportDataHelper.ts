import { calculateUnitHealth, parseCapacityToKW } from "./physics/enthalpy";

export const getEfficiencyLabel = (score: number) => {
  if (score >= 90) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-50" };
  if (score >= 80) return { label: "Stable", color: "text-[#00a1e4]", bg: "bg-blue-50" };
  if (score >= 60) return { label: "Moderate", color: "text-amber-500", bg: "bg-amber-50" };
  return { label: "Critical", color: "text-rose-500", bg: "bg-rose-50" };
};

export const processReportData = (report: any) => {
  if (!report) return null;

  // 1. Resolve Technical JSON
  let t: any = {};
  try {
    if (typeof report.technical_json === 'string') {
      t = JSON.parse(report.technical_json);
      if (typeof t === 'string') t = JSON.parse(t);
    } else if (report.technical_json) {
      t = report.technical_json;
    }
  } catch (e) {
    console.error("JSON Parse Error in processReportData", e);
  }

  // 2. Resolve Photos with Folder Fallbacks
  const rawPhotos = report.activity_photos || [];
  const photos = rawPhotos.map((p: any) => {
    let url = p.photo_url || "";
    if (url && !url.startsWith('http') && !url.startsWith('/')) {
      let folder = (report.type || "misc").toLowerCase();
      if (p.media_type === "video") folder = "videos";
      else if (folder === "audit") folder = "photos";
      else if (folder === "preventive") folder = "preventive";
      else if (folder === "corrective") folder = "corrective";
      
      url = `/uploads/${folder}/${url}`;
    }
    return { ...p, photo_url: url };
  });

  // 3. Performance Analytics Calculation (Automation Core)
  // SYNCED WITH UNIT MODAL & PHYSICS ENGINE
  let performance: any = { score: 0, rating: "N/A", color: "text-slate-400" };
  
  if (report.type === "Audit" || report.type === "Preventive") {
    // Determine Measured Airflow
    let measuredFlow = report.measured_airflow || t.measured_airflow || t.totalCfmSupply * 1.699 || report.design_airflow || 1000;
    
    // Determine Design Capacity
    const designCapStr = report.design_cooling_capacity > 0 
      ? `${report.design_cooling_capacity} BTU` 
      : (report.units?.capacity || t.design_cooling_capacity || "10 kW");

    const calculation = calculateUnitHealth(
       report.entering_db || t.entering_db || t.temp_inlet || 25,
       report.entering_rh || t.entering_rh || 50,
       report.leaving_db || t.leaving_db || t.temp_outlet || 15,
       report.leaving_rh || t.leaving_rh || 50,
       measuredFlow,
       designCapStr
    );

    performance.score = calculation.healthScore;
    const rating = getEfficiencyLabel(performance.score);
    performance.rating = rating.label;
    performance.color = rating.color;
    performance.bg = rating.bg;
    performance.actualCapacity = calculation.actualCapacitykW.toFixed(2);
  }

  // 4. Type-Specific Enrichment
  
  // A. PREVENTIVE
  if (report.type === "Preventive") {
    const labels = [
      { label: "Power Supply", key: "power_supply" },
      { label: "Ampere", key: "ampere_motor" },
      { label: "Pressure Inlet", key: "pressure_inlet" },
      { label: "Pressure Outlet", key: "pressure_outlet" },
      { label: "Temperature Inlet", key: "temp_inlet" },
      { label: "Temperature Outlet", key: "temp_outlet" },
      { label: "Return Air", key: "return_air_temp" },
      { label: "Supply Air", key: "supply_air_temp" },
      { label: "Air filter", key: "clean_air_filter" },
      { label: "Cleaning coil", key: "clean_coil" },
      { label: "Cleaning drainage", key: "clean_drainage" },
      { label: "V-Belt", key: "check_vbelt" },
      { label: "Bearing", key: "check_bearing" },
    ];

    const scope: any = {};
    Object.keys(t).forEach(dbLabel => {
      const found = labels.find(l => dbLabel.toLowerCase().includes(l.label.toLowerCase()));
      if (found) {
        const val = t[dbLabel];
        if (typeof val === 'object') {
           scope[found.key] = { before: val.before, after: val.after, remarks: val.remarks };
        } else {
           scope[found.key] = { done: val, remarks: "" };
        }
      }
    });

    return {
      ...report,
      ...t, // Spread technical data
      performance,
      header: t.header || {
        project: report.units?.project_name || report.project_name,
        date: report.service_date,
        model: report.units?.model || report.unit_model,
        serial_number: report.units?.serial_number || report.unit_serial,
        unit_number: report.units?.tag_number || report.unit_tag,
        location: report.units?.area || report.unit_area,
        so_number: report.reference_id || "PM-" + report.id
      },
      scope: Object.keys(scope).length > 0 ? scope : t.scope,
      parts: t.parts || [],
      technicalAdvice: report.technical_advice || t.technicalAdvice || "-",
      engineerName: report.inspector_name || report.engineer || t.engineerName || "-",
      customerName: t.customerName || "-",
      activity_photos: photos,
      reportCode: report.reference_id || `REPORT-${report.id}`,
      reportTitle: "PREVENTIVE MAINTENANCE REPORT"
    };
  }

  // B. CORRECTIVE
  if (report.type === "Corrective") {
    return {
      ...report,
      ...t,
      personnel: t.personnel || { 
        technician_name: report.inspector_name || report.engineer, 
        service_date: report.service_date 
      },
      pic: t.pic || {},
      analysis: t.analysis || {
        case_complain: t.case_complain || "-",
        root_cause: t.root_cause || "-",
        temp_action: t.temp_action || "-",
        perm_action: t.perm_action || "-",
        recommendation: t.recommendation || report.technical_advice
      },
      engineerNote: report.engineer_note || t.engineerNote || "-",
      activity_photos: photos,
      reportCode: report.reference_id || `REPORT-${report.id}`,
      reportTitle: "CORRECTIVE MAINTENANCE REPORT"
    };
  }

  // C. AUDIT
  if (report.type === "Audit") {
    const vps = report.audit_velocity_points || [];
    const supply = new Array(15).fill("");
    const return_ = new Array(15).fill("");
    const fresh = new Array(15).fill("");
    vps.forEach((vp: any) => {
      if (vp.point_number >= 1 && vp.point_number <= 15) supply[vp.point_number - 1] = vp.velocity_value;
      if (vp.point_number >= 16 && vp.point_number <= 30) return_[vp.point_number - 16] = vp.velocity_value;
      if (vp.point_number >= 31 && vp.point_number <= 45) fresh[vp.point_number - 31] = vp.velocity_value;
    });

    return { 
      ...report, 
      ...t, 
      performance,
      t: { ...t, supplyVelocity: supply, returnVelocity: return_, freshVelocity: fresh }, 
      activity_photos: photos,
      reportCode: report.reference_id || `REPORT-${report.id}`,
      reportTitle: "AUDIT TECHNICAL REPORT"
    };
  }

  // Default Fallback
  return { 
    ...report, 
    ...t, 
    performance,
    activity_photos: photos,
    reportCode: report.reference_id || `REPORT-${report.id}`,
    reportTitle: `${(report.type || 'Activity').toUpperCase()} REPORT`
  };
};
