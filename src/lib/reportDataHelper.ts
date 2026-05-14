import { calculateUnitHealth, parseCapacityToKW } from "./physics/enthalpy";
import { calculateBalancedAHI } from "./physics/ahi-calculation";

export const getEfficiencyLabel = (score: number) => {
  if (score >= 80) return { label: "Normal Condition", color: "text-emerald-500", bg: "bg-emerald-50" };
  if (score >= 50) return { label: "Need Repair", color: "text-amber-500", bg: "bg-amber-50" };
  return { label: "Need Replace", color: "text-rose-500", bg: "bg-rose-50" };
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

  const isBulkSync = t.is_bulk_sync || t.import_source?.includes("Bulk") || (typeof report.technical_json === 'string' && report.technical_json.includes("is_bulk_sync"));

  // 1.5. Flatten Native Nested Payloads (Mechanical, Performance, Environment, Functionality)
  // This ensures the web UI and PDF generator see flattened data
  if (t.mechanical) t = { ...t, ...t.mechanical };
  if (t.performance) t = { ...t, ...t.performance };
  if (t.environment) t = { ...t, ...t.environment };
  if (t.functionality) t = { ...t, ...t.functionality };

  // 2. Resolve Photos with Folder Fallbacks
  const rawPhotos = report.activity_photos || [];
  const photos = rawPhotos.map((p: any) => {
    let url = p.photo_url || "";
    
    if (url && !url.startsWith('http')) {
      // 1. Clean up redundant prefixes if they exist
      url = url.replace(/^\/api\/assets\//, '');
      url = url.replace(/^\/uploads\//, '');
      
      // 2. Extract folder and filename
      let parts = url.split('/').filter(Boolean);
      let filename = parts[parts.length - 1] || "";
      
      // 3. Determine target folder
      let folder = (report.type || "misc").toLowerCase();
      if (folder === "audit") folder = "audit";
      else if (folder === "preventive" || folder === "pm") folder = "preventive";
      else if (folder === "corrective") folder = "corrective";
      else if (folder === "ba" || folder === "berita_acara") folder = "berita-acara";
      else if (p.media_type === "video") folder = "videos";
      else if (parts.length > 1) folder = parts[0]; // keep original folder if present
      else folder = "photos";

      // 4. Force through Asset Proxy
      url = `/api/assets/${folder}/${filename}`;
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
    
    // NEW: For Audit, if we have component states, use the balanced AHI
    if (report.type === "Audit") {
      const ahi = calculateBalancedAHI({
        fincoil: t.fincoil_cond || report.fincoil_cond || 'GOOD',
        drainPan: t.drain_pan_cond || report.drain_pan_cond || 'GOOD',
        blowerFan: t.blower_fan_cond || report.blower_fan_cond || 'GOOD',
        accessories: [...(t.inlet || []), ...(t.outlet || [])],
        enteringDB: report.entering_db || t.entering_db || t.temp_inlet || 25,
        leavingDB: report.leaving_db || t.leaving_db || t.temp_outlet || 15,
        enteringRH: report.entering_rh || t.entering_rh || 50,
        leavingRH: report.leaving_rh || t.leaving_rh || 50,
        measuredAirflow: measuredFlow,
        designCapacityStr: designCapStr,
        yearOfInstall: report.units?.yoi || report.unit_age
      });
      performance.score = ahi.totalScore;
    }

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
      { label: "Ampere Name Plate", key: "ampere_nameplate" },
      { label: "Power Supply", key: "power_supply" },
      { label: "Ampere Motor", key: "ampere_motor" },
      { label: "Ampere (Phase R)", key: "ampere_r" },
      { label: "Ampere (Phase S)", key: "ampere_s" },
      { label: "Ampere (Phase T)", key: "ampere_t" },
      { label: "Pressure Inlet", key: "pressure_inlet" },
      { label: "Pressure Outlet", key: "pressure_outlet" },
      { label: "Temperature Inlet", key: "temp_inlet" },
      { label: "Temperature Outlet", key: "temp_outlet" },
      { label: "Supply Air", key: "supply_air_temp" },
      { label: "Return Air", key: "return_air_temp" },
      { label: "Room Temp", key: "room_temp" },
      { label: "Diff. Temp", key: "diff_temp" },
      { label: "Air Flow", key: "air_flow" },
      { label: "Performa Unit", key: "performa_unit" },
      { label: "Air filter", key: "clean_air_filter" },
      { label: "Cleaning coil", key: "clean_coil" },
      { label: "Cleaning drainage", key: "clean_drainage" },
      { label: "Cleaning body", key: "clean_body" },
      { label: "V-Belt", key: "check_vbelt" },
      { label: "Bearing", key: "check_bearing" },
      // Chiller Specific Checklist
      { label: "Check Oil & Refrigerant Leaks", key: "check_leak" },
      { label: "Check Compressor Vibration & Noise", key: "check_vibration" },
      { label: "Check Oil Level & Color", key: "check_oil_level" },
      { label: "Check Refrigerant Charge (Sight Glass)", key: "check_refrigerant" },
      { label: "Clean Condenser Coils / Tubes", key: "clean_condenser" },
      { label: "Check Water Strainer", key: "check_strainer" },
      { label: "Check Control Panel & Safety Devices", key: "check_control" },
      // Indonesian Variations
      { label: "Cek Kebocoran Oli & Refrigerant", key: "check_leak" },
      { label: "Cek Getaran & Suara Kompresor", key: "check_vibration" },
      { label: "Cek Level & Warna Oli", key: "check_oil_level" },
      { label: "Cek Refrigerant Charge", key: "check_refrigerant" },
      { label: "Pembersihan Kondensor", key: "clean_condenser" },
      { label: "Cek Strainer Air", key: "check_strainer" },
      { label: "Cek Control Panel & Safety", key: "check_control" },
      // Chiller Specific Operating Condition
      { label: "Voltage RS", key: "voltage_rs" },
      { label: "Voltage RT", key: "voltage_rt" },
      { label: "Voltage ST", key: "voltage_st" },
      // Short variations for spreadsheet sync
      { label: "V-RS", key: "voltage_rs" },
      { label: "V-RT", key: "voltage_rt" },
      { label: "V-ST", key: "voltage_st" },
      { label: "Phase RS", key: "voltage_rs" },
      { label: "Phase RT", key: "voltage_rt" },
      { label: "Phase ST", key: "voltage_st" },
      { label: "Circuit 1 - Amp R", key: "circuit_1_amp_r" },
      { label: "Circuit 1 - Amp S", key: "circuit_1_amp_s" },
      { label: "Circuit 1 - Amp T", key: "circuit_1_amp_t" },
      { label: "Circuit 1 - LP", key: "circuit_1_pressure_lp" },
      { label: "Circuit 1 - HP", key: "circuit_1_pressure_hp" },
      { label: "C1 Amp R", key: "circuit_1_amp_r" },
      { label: "C1 Amp S", key: "circuit_1_amp_s" },
      { label: "C1 Amp T", key: "circuit_1_amp_t" },
      { label: "C1 LP", key: "circuit_1_pressure_lp" },
      { label: "C1 HP", key: "circuit_1_pressure_hp" },
      { label: "Circuit 2 - Amp R", key: "circuit_2_amp_r" },
      { label: "Circuit 2 - Amp S", key: "circuit_2_amp_s" },
      { label: "Circuit 2 - Amp T", key: "circuit_2_amp_t" },
      { label: "Circuit 2 - LP", key: "circuit_2_pressure_lp" },
      { label: "Circuit 2 - HP", key: "circuit_2_pressure_hp" },
      { label: "C2 Amp R", key: "circuit_2_amp_r" },
      { label: "C2 Amp S", key: "circuit_2_amp_s" },
      { label: "C2 Amp T", key: "circuit_2_amp_t" },
      { label: "C2 LP", key: "circuit_2_pressure_lp" },
      { label: "C2 HP", key: "circuit_2_pressure_hp" },
      { label: "Circuit 3 - Amp R", key: "circuit_3_amp_r" },
      { label: "Circuit 3 - Amp S", key: "circuit_3_amp_s" },
      { label: "Circuit 3 - Amp T", key: "circuit_3_amp_t" },
      { label: "Circuit 3 - LP", key: "circuit_3_pressure_lp" },
      { label: "Circuit 3 - HP", key: "circuit_3_pressure_hp" },
      { label: "C3 Amp R", key: "circuit_3_amp_r" },
      { label: "C3 Amp S", key: "circuit_3_amp_s" },
      { label: "C3 Amp T", key: "circuit_3_amp_t" },
      { label: "C3 LP", key: "circuit_3_pressure_lp" },
      { label: "C3 HP", key: "circuit_3_pressure_hp" },
      { label: "Circuit 4 - Amp R", key: "circuit_4_amp_r" },
      { label: "Circuit 4 - Amp S", key: "circuit_4_amp_s" },
      { label: "Circuit 4 - Amp T", key: "circuit_4_amp_t" },
      { label: "Circuit 4 - LP", key: "circuit_4_pressure_lp" },
      { label: "Circuit 4 - HP", key: "circuit_4_pressure_hp" },
      { label: "C4 Amp R", key: "circuit_4_amp_r" },
      { label: "C4 Amp S", key: "circuit_4_amp_s" },
      { label: "C4 Amp T", key: "circuit_4_amp_t" },
      { label: "C4 LP", key: "circuit_4_pressure_lp" },
      { label: "C4 HP", key: "circuit_4_pressure_hp" },
      { label: "Circuit 5 - Amp R", key: "circuit_5_amp_r" },
      { label: "Circuit 5 - Amp S", key: "circuit_5_amp_s" },
      { label: "Circuit 5 - Amp T", key: "circuit_5_amp_t" },
      { label: "Circuit 5 - LP", key: "circuit_5_pressure_lp" },
      { label: "Circuit 5 - HP", key: "circuit_5_pressure_hp" },
      { label: "C5 Amp R", key: "circuit_5_amp_r" },
      { label: "C5 Amp S", key: "circuit_5_amp_s" },
      { label: "C5 Amp T", key: "circuit_5_amp_t" },
      { label: "C5 LP", key: "circuit_5_pressure_lp" },
      { label: "C5 HP", key: "circuit_5_pressure_hp" },
      { label: "Fan Unit R", key: "fan_unit_r" },
      { label: "Fan Unit S", key: "fan_unit_s" },
      { label: "Fan Unit T", key: "fan_unit_t" },
      { label: "Fan R", key: "fan_unit_r" },
      { label: "Fan S", key: "fan_unit_s" },
      { label: "Fan T", key: "fan_unit_t" },
      { label: "Water Inlet Temp", key: "water_inlet_temp" },
      { label: "Water Outlet Temp", key: "water_outlet_temp" },
      { label: "Water Inlet Pressure", key: "water_inlet_pressure" },
      { label: "Water Outlet Pressure", key: "water_outlet_pressure" },
      { label: "Inlet Temp", key: "water_inlet_temp" },
      { label: "Outlet Temp", key: "water_outlet_temp" },
      { label: "Inlet Press", key: "water_inlet_pressure" },
      { label: "Outlet Press", key: "water_outlet_pressure" },
      { label: "Setting Temp EWT", key: "setting_temp_ewt" },
      { label: "EWT Setting", key: "setting_temp_ewt" },
    ];

    const scope: any = {};

    const processVal = (dbLabel: string, val: any) => {
      // 1. Clean labels for better fuzzy matching
      const cleanLabel = (s: string) => {
        let cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
        // Normalize abbreviations common in spreadsheets
        cleaned = cleaned.replace(/^c([1-5])/, 'circuit$1'); // c1 -> circuit1
        cleaned = cleaned.replace(/press$/, 'pressure');
        cleaned = cleaned.replace(/temp$/, 'temperature');
        cleaned = cleaned.replace(/amperer$/, 'ampr');
        cleaned = cleaned.replace(/amperes$/, 'amps');
        cleaned = cleaned.replace(/amperet$/, 'ampt');
        return cleaned;
      };
      const targetLabel = cleanLabel(dbLabel);

      const found = labels.find(l => {
        const lClean = cleanLabel(l.label);
        // Direct match or one contains the other
        return targetLabel === lClean || targetLabel.includes(lClean) || lClean.includes(targetLabel) || 
               // Special case for Voltage
               (targetLabel === 'rs' && lClean === 'voltagers') ||
               (targetLabel === 'rt' && lClean === 'voltagert') ||
               (targetLabel === 'st' && lClean === 'voltagest') ||
               // Special case for Phase
               (targetLabel.includes('phasers') && lClean === 'voltagers') ||
               (targetLabel.includes('phasert') && lClean === 'voltagert') ||
               (targetLabel.includes('phasest') && lClean === 'voltagest');
      });

      if (found) {
        if (typeof val === 'object' && val !== null) {
          const before = val.before ?? val.Before ?? val.b ?? "-";
          const after = val.after ?? val.After ?? val.a ?? "-";
          
          // AUTO MARGIN: Calculate difference automatically
          let margin = val.remarks ?? val.Remarks ?? val.r ?? "";
          const bNum = parseFloat(String(before).replace(',', '.'));
          const aNum = parseFloat(String(after).replace(',', '.'));
          
          if (!isNaN(bNum) && !isNaN(aNum)) {
             const diff = aNum - bNum;
             margin = diff === 0 ? "0" : diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
          }

          scope[found.key] = { 
            before, 
            after, 
            remarks: margin 
          };
        } else {
          // If single value, map to 'before' or 'after' based on label
          const isAfterLabel = dbLabel.toLowerCase().includes("after") || dbLabel.toLowerCase().includes("sesudah");
          scope[found.key] = isAfterLabel 
            ? { before: "-", after: val || "-", remarks: "" }
            : { before: val || "-", after: "-", remarks: "" };
        }
      }
    };

    // 1. Process root keys
    Object.keys(t).forEach(dbLabel => processVal(dbLabel, t[dbLabel]));

    // 1.5. CRITICAL: Merge pre-existing scope from web form submission
    // The web form (PreventiveFormClient) stores technical data as:
    // { header: {...}, scope: { voltage_rs: {before, after}, circuit_1_amp_r: {before, after}, ... }, parts: [...] }
    // The processVal loop above only processes root keys ('header', 'scope', 'parts') which don't match any labels.
    // We must merge t.scope into our local scope variable so Chiller post-processing can find the data.
    if (t.scope && typeof t.scope === 'object' && !Array.isArray(t.scope)) {
      Object.keys(t.scope).forEach(key => {
        if (!scope[key]) {
          const val = t.scope[key];
          if (val && typeof val === 'object' && (val.before !== undefined || val.after !== undefined)) {
            // Already in {before, after, remarks} format from the web form
            scope[key] = val;
          } else if (val !== null && val !== undefined) {
            // Simple value
            scope[key] = { before: String(val), after: "-", remarks: "" };
          }
        }
      });
    }

    // 2. Process nested parameters or metrics (Bulk Sync)
    if (t.parameters || t.metrics) {
      const p = t.parameters || t.metrics || {};
      // Amperes (Handle R,S,T or single)
      if (p.amp || p.ampere_after) {
        if (typeof p.amp === 'object') {
          if (p.amp.nameplate) processVal("Ampere Name Plate", p.amp.nameplate);
          if (p.amp.r) {
            processVal("Ampere (Phase R)", p.amp.r);
            if (!p.amp.s && !p.amp.t) processVal("Ampere Motor", p.amp.r);
          }
          if (p.amp.s) processVal("Ampere (Phase S)", p.amp.s);
          if (p.amp.t) processVal("Ampere (Phase T)", p.amp.t);
          if (!p.amp.r && !p.amp.s && !p.amp.t) processVal("Ampere Motor", p.amp);
        } else {
          processVal("Ampere Motor", p.amp || p.ampere_after);
        }
      }
      if (p.diff_temp) processVal("Diff. Temp", p.diff_temp);
      if (p.supply_air_temp || p.supply_temp || p.temp_after) processVal("Supply Air", p.supply_air_temp || p.supply_temp || p.temp_after);
      if (p.return_air_temp || p.return_temp || p.temp_before) processVal("Return Air", p.return_air_temp || p.return_temp || p.temp_before);
      if (p.room_temp) {
        processVal("Room Temp", p.room_temp);
        if (!p.return_air_temp && !p.return_temp && !p.temp_before) processVal("Return Air", p.room_temp);
      }
      if (p.air_flow || p.airflow || p.air_volume) processVal("Air Flow", p.air_flow || p.airflow || p.air_volume);
      if (p.finding) scope["finding"] = { before: p.finding, after: "-", remarks: "" };
      if (p.recommendation) scope["recommendation"] = { before: p.recommendation, after: "-", remarks: "" };
      if (p.performa_unit !== undefined && p.performa_unit !== null) {
        if (typeof p.performa_unit === 'object') {
          scope["performa_unit"] = { before: p.performa_unit.before, after: p.performa_unit.after, remarks: "" };
        } else {
          scope["performa_unit"] = { before: p.performa_unit, after: "-", remarks: "" };
        }
      }
      if (p.kw) scope["kw"] = { before: p.kw.before, after: p.kw.after, remarks: "" };
      if (p.rpm) scope["rpm"] = { before: p.rpm.before, after: p.rpm.after, remarks: "" };
      if (p.diff_temp) scope["diff_temp"] = { before: p.diff_temp.before, after: p.diff_temp.after, remarks: "" };
      if (p.diffuser_count) scope["diffuser_count"] = { before: p.diffuser_count, after: p.diffuser_count, remarks: "" };
      if (p.air_volume_actual) scope["air_volume_actual"] = { before: p.air_volume_actual, after: p.air_volume_actual, remarks: "" };
      if (p.air_volume_nameplate) scope["air_volume_nameplate"] = { before: p.air_volume_nameplate, after: p.air_volume_nameplate, remarks: "" };
      if (p.performa_cfm) scope["performa_cfm"] = { before: p.performa_cfm, after: p.performa_cfm, remarks: "" };
      if (p.performa_score) scope["performa_score"] = { before: p.performa_score + "%", after: p.performa_score + "%", remarks: "" };
    }
    
    // 3. Post-Process Chiller Structure
    const uType = (report.unit_type || report.units?.unit_type || "").toUpperCase().trim();
    const isChiller = uType.includes('CHILL') || uType.includes('WCP');
    
    let reportTitle = "PREVENTIVE MAINTENANCE REPORT";
    if (isChiller) {
      reportTitle = "PREVENTIVE MAINTENANCE CHILLER";
      scope.voltage = {
        rs: scope.voltage_rs?.after || scope.voltage_rs?.before || "-",
        rt: scope.voltage_rt?.after || scope.voltage_rt?.before || "-",
        st: scope.voltage_st?.after || scope.voltage_st?.before || "-"
      };
      scope.fan_unit = {
        r: scope.fan_unit_r?.after || scope.fan_unit_r?.before || "-",
        s: scope.fan_unit_s?.after || scope.fan_unit_s?.before || "-",
        t: scope.fan_unit_t?.after || scope.fan_unit_t?.before || "-"
      };
      scope.water = {
        inlet_temp: scope.water_inlet_temp?.after || scope.water_inlet_temp?.before || "-",
        outlet_temp: scope.water_outlet_temp?.after || scope.water_outlet_temp?.before || "-",
        delta_t: scope.water_delta_t?.after || scope.water_delta_t?.before || "-",
        inlet_pressure: scope.water_inlet_pressure?.after || scope.water_inlet_pressure?.before || "-",
        outlet_pressure: scope.water_outlet_pressure?.after || scope.water_outlet_pressure?.before || "-",
        delta_p: scope.water_delta_p?.after || scope.water_delta_p?.before || "-"
      };
      scope.setting_temp_ewt = scope.setting_temp_ewt?.after || scope.setting_temp_ewt?.before || "-";
      
      // Circuits (Handle mapping from technical_json directly if possible, or flattened keys)
      if (t.circuits) {
        scope.circuits = t.circuits;
      } else {
        // Fallback or mapped from spreadsheet keys if any
        scope.circuits = [1, 2, 3, 4, 5].map(i => ({
          amp_r: scope[`circuit_${i}_amp_r`]?.before || scope[`circuit_${i}_amp_r`]?.after || "-",
          amp_s: scope[`circuit_${i}_amp_s`]?.before || scope[`circuit_${i}_amp_s`]?.after || "-",
          amp_t: scope[`circuit_${i}_amp_t`]?.before || scope[`circuit_${i}_amp_t`]?.after || "-",
          lp: scope[`circuit_${i}_pressure_lp`]?.before || scope[`circuit_${i}_pressure_lp`]?.after || "-",
          hp: scope[`circuit_${i}_pressure_hp`]?.before || scope[`circuit_${i}_pressure_hp`]?.after || "-"
        }));
      }
    }

    // 4. Capture Phase Amperes if they exist in root (Fallback for direct DB fields)
    if (report.amp_r && report.amp_r !== "0" && !scope["ampere_r"]) scope["ampere_r"] = { before: "-", after: report.amp_r, remarks: "" };
    if (report.amp_s && report.amp_s !== "0" && !scope["ampere_s"]) scope["ampere_s"] = { before: "-", after: report.amp_s, remarks: "" };
    if (report.amp_t && report.amp_t !== "0" && !scope["ampere_t"]) scope["ampere_t"] = { before: "-", after: report.amp_t, remarks: "" };

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
        so_number: report.reference_id || "PM-" + report.id,
        nominal_capacity: report.units?.capacity || report.units?.capacity_pk || t.header?.nominal_capacity || "-",
        category: report.unit_type || report.units?.unit_type || report.units?.category || "-",
        floor: report.units?.building_floor || report.location || "-",
        area: report.units?.area || report.unit_area || "-",
        tenant: report.units?.room_tenant || "-",
        brand: report.units?.brand || report.unit_brand || "-",
        capacity_pk: report.units?.capacity_pk || "-"
      },
      scope: Object.keys(scope).length > 0 ? scope : t.scope,
      parts: t.parts || [],
      technicalAdvice: report.technical_advice || report.engineer_note || t.technicalAdvice || "-",
      engineerName: report.inspector_name || report.engineer || t.engineerName || "-",
      customerName: t.customerName || "-",
      activity_photos: photos,
      reportCode: report.reference_id || `REPORT-${report.id}`,
      reportTitle: reportTitle,
      isBulkSync: !!isBulkSync
    };
  }

  // B. CORRECTIVE
  if (report.type === "Corrective") {
    const isComplaint = t.is_complaint || t.import_source?.includes("Complaint") || t.category || (typeof report.technical_json === 'string' && report.technical_json.includes("Complaint"));
    
    // Technician handling - remove "Tim Teknisi PI" and replace with "Bulk Synchronized" if needed
    let techName = report.inspector_name || report.engineer || t.personnel?.technician_name;
    if (techName === "Tim Teknisi PI") techName = "Bulk Synchronized";

    return {
      ...report,
      ...t,
      personnel: t.personnel || { 
        technician_name: techName, 
        service_date: report.service_date 
      },
      inspector_name: techName,
      pic: t.pic || {},
      analysis: {
        complain: t.analysis?.complain || t.analysis?.case_complain || t.case_complain || t.category || t.kategori || report.engineer_note || "-",
        root_cause: t.analysis?.root_cause || t.root_cause || "-",
        temp_action: t.analysis?.temp_action || t.temp_action || "-",
        perm_action: t.analysis?.perm_action || t.perm_action || t.corrective_action || "-",
        recommendation: t.analysis?.recommendation || t.rekomendasi || report.technical_advice || t.recommendation || "-",
        qty: t.qty || t.analysis?.qty || t.Qty || "-",
        corrective_action: t.corrective_action || t.analysis?.corrective_action || t.perm_action || t.corrective_action || "-",
        status: t.status || t.analysis?.status || t.Status || report.status || "-"
      },
      isComplaint,
      engineerNote: report.engineer_note || t.engineerNote || "-",
      activity_photos: photos,
      reportCode: report.reference_id || `REPORT-${report.id}`,
      reportTitle: isComplaint ? "COMPLAINT REPORT" : "CORRECTIVE MAINTENANCE REPORT",
      isBulkSync: !!isBulkSync
    };
  }

  // C. AUDIT
  if (report.type === "Audit") {
    const vps = report.audit_velocity_points || [];
    const supply = new Array(15).fill("");
    const return_ = new Array(15).fill("");
    const fresh = new Array(15).fill("");
    vps.forEach((vp: any) => {
      const val = vp.velocity_value ? parseFloat(vp.velocity_value.toString()) : "";
      if (vp.point_number >= 1 && vp.point_number <= 15) supply[vp.point_number - 1] = val;
      if (vp.point_number >= 16 && vp.point_number <= 30) return_[vp.point_number - 16] = val;
      if (vp.point_number >= 31 && vp.point_number <= 45) fresh[vp.point_number - 31] = val;
    });

    // Map bulk-synced fields from technical_json to template-expected keys
    // health_score from spreadsheet is a decimal (0.88) → convert to percentage (88)
    let healthScore = t.health_score ?? performance.score ?? 0;
    if (healthScore > 0 && healthScore <= 1) healthScore = Math.round(healthScore * 100);
    const healthStatus = t.health_status || performance.rating || "N/A";

    // Resolve enthalpy/airflow: prefer technical_json, fallback to DB columns
    const entering_enthalpy = t.entering_enthalpy || 0;
    const leaving_enthalpy = t.leaving_enthalpy || 0;
    const enthalpy_diff = t.enthalpy_diff || 0;
    const face_velocity = t.face_velocity || 0;
    const face_area = t.face_area || 0;
    const actual_airflow = t.actual_airflow || report.measured_airflow || 0;
    const actual_cooling_capacity = t.actual_cooling_capacity || performance.actualCapacity || 0;
    const power_kw = t.power_kw || 0;

    return { 
      ...report, 
      ...t, 
      performance,
      // Explicitly mapped fields for template
      entering_enthalpy,
      leaving_enthalpy,
      enthalpy_diff,
      face_velocity,
      face_area,
      actual_airflow,
      actual_cooling_capacity,
      healthScore,
      healthStatus,
      power_kw,
      t: { 
        ...t, 
        supplyVelocity: supply, 
        returnVelocity: return_, 
        freshVelocity: fresh,
        // Ensure CFMs are recalculatable or carried over
        totalCfmSupply: t.totalCfmSupply || "-",
        totalCfmReturn: t.totalCfmReturn || "-",
        totalCfmFresh: t.totalCfmFresh || "-"
      }, 
      activity_photos: photos,
      reportCode: report.reference_id || `REPORT-${report.id}`,
      reportTitle: "AUDIT TECHNICAL REPORT",
      isBulkSync: !!isBulkSync
    };
  }

  // Default Fallback
  return { 
    ...report, 
    ...t, 
    performance,
    activity_photos: photos,
    reportCode: report.reference_id || `REPORT-${report.id}`,
    reportTitle: `${(report.type || 'Activity').toUpperCase()} REPORT`,
    isBulkSync: !!isBulkSync
  };
};
