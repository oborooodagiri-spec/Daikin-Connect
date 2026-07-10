// ╔════════════════════════════════════════════════════════════════════════╗
// ║  DAIKIN ERROR CODES DATABASE                                          ║
// ║  Source: Simple Self-Diagnosis by Malfunction Code (SM-TS2)           ║
// ║  After Sales Service Division                                         ║
// ╚════════════════════════════════════════════════════════════════════════╝

export type ErrorSeverity = "critical" | "warning" | "info";
export type UnitCategory = "indoor" | "outdoor" | "system" | "others";
export type ModelType = "RA" | "SkyAir" | "VRV" | "Package" | "HRV" | "Chiller";

export interface ErrorCode {
  code: string;
  category: UnitCategory;
  contents: string;
  causes: string[];
  models: ModelType[];
  severity: ErrorSeverity;
}

function sev(code: string): ErrorSeverity {
  const c = code.charAt(0);
  // Compressor/overcurrent/HPS = critical
  if (["E","L","J"].includes(c)) return "critical";
  // Sensor/thermistor/PCB = warning
  if (["H","F","P"].includes(c)) return "warning";
  // System/transmission/settings = info
  return "info";
}

const ALL: ModelType[] = ["RA","SkyAir","VRV","Package","HRV","Chiller"];
const RA_SKY_VRV: ModelType[] = ["RA","SkyAir","VRV"];
const VRV_ONLY: ModelType[] = ["VRV"];
const CHILLER: ModelType[] = ["Chiller"];
const PKG: ModelType[] = ["Package"];
const HRV_ONLY: ModelType[] = ["HRV"];
const RA_SKY_VRV_PKG: ModelType[] = ["RA","SkyAir","VRV","Package"];
const RA_SKY_VRV_PKG_HRV: ModelType[] = ["RA","SkyAir","VRV","Package","HRV"];
const VRV_PKG: ModelType[] = ["VRV","Package"];
const VRV_PKG_CHILLER: ModelType[] = ["VRV","Package","Chiller"];

export const ERROR_CODES: ErrorCode[] = [
  // ═══════════════════════════ INDOOR UNIT ═══════════════════════════
  { code: "A0", category: "indoor", contents: "External protection device activated", causes: ["External protection device connected to terminal strip T1-T2 of indoor unit is activated"], models: ALL, severity: "warning" },
  { code: "A1", category: "indoor", contents: "Malfunction of indoor unit PCB", causes: ["Malfunction due to noise", "Defect of indoor unit PCB"], models: ALL, severity: "warning" },
  { code: "A3", category: "indoor", contents: "Malfunction of drain level control system", causes: ["Drain piping clogging, improper drain piping work", "Defect of drain pump", "Defect of float switch"], models: ALL, severity: "warning" },
  { code: "A4", category: "indoor", contents: "Malfunction of freezing protection", causes: ["Shortage of water volume", "Defect of 26WL", "Defect of water temperature thermistor"], models: ALL, severity: "warning" },
  { code: "A5", category: "indoor", contents: "High pressure control in heating, freeze-up protection control in cooling", causes: ["Clogged air filter of indoor unit and short-circuit", "Defect of indoor unit heat exchanger thermistor"], models: ALL, severity: "warning" },
  { code: "A6", category: "indoor", contents: "Fan motor locked, overload, overcurrent", causes: ["Defect of connector contact", "Defect of fan motor", "Defect of indoor unit PCB"], models: ALL, severity: "critical" },
  { code: "A7", category: "indoor", contents: "Malfunction of swing flap motor", causes: ["Failure of swing flap motor", "Defect of indoor unit PCB", "Jammed swing mechanism/blade"], models: RA_SKY_VRV, severity: "warning" },
  { code: "A8", category: "indoor", contents: "Malfunction of power supply or AC input overcurrent", causes: ["Defect of power supply voltage", "Overcurrent of AC input"], models: ALL, severity: "critical" },
  { code: "A9", category: "indoor", contents: "Malfunction of electronic expansion valve drive", causes: ["Defect of electronic expansion valve coil", "Defect of indoor unit PCB", "Defect of connector contact"], models: ALL, severity: "warning" },
  { code: "AA", category: "indoor", contents: "Heater overheat", causes: ["26WH is activated"], models: RA_SKY_VRV_PKG, severity: "critical" },
  { code: "AF", category: "indoor", contents: "Malfunction of a humidifier system", causes: ["Water leakage of humidifier (option)", "Failure of swing float switch", "Improper drain piping incline"], models: VRV_ONLY, severity: "warning" },
  { code: "AH", category: "indoor", contents: "Malfunction of dust collector of air cleaner", causes: ["Defect of dust collecting element", "Defect of high voltage power supply unit"], models: RA_SKY_VRV, severity: "info" },
  { code: "AJ", category: "indoor", contents: "Malfunction of capacity setting (Indoor unit PCB)", causes: ["Capacity setting adaptor is not installed when replacing PCB", "Defect of indoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "C1", category: "indoor", contents: "Failure of transmission (between indoor unit PCB and fan PCB)", causes: ["Defect of transmission of fan motor control driver"], models: VRV_ONLY, severity: "warning" },
  { code: "C4", category: "indoor", contents: "Malfunction of liquid pipe thermistor for heat exchanger", causes: ["Defect of connector contact", "Defect of liquid pipe thermistor for heat exchanger"], models: ALL, severity: "warning" },
  { code: "C5", category: "indoor", contents: "Malfunction of gas pipe thermistor for heat exchanger", causes: ["Defect of connector contact", "Defect of gas pipe thermistor for heat exchanger"], models: ALL, severity: "warning" },
  { code: "C6", category: "indoor", contents: "Malfunction of fan motor control driver", causes: ["Defect of fan motor sensor system", "Defect of fan motor control driver"], models: VRV_ONLY, severity: "warning" },
  { code: "C7", category: "indoor", contents: "Front panel driving motor fault", causes: ["Defect of front panel driving motor", "Defect of limit switch"], models: RA_SKY_VRV, severity: "info" },
  { code: "C9", category: "indoor", contents: "Malfunction of suction air thermistor", causes: ["Defect of connector contact", "Defect of thermistor for suction air"], models: ALL, severity: "warning" },
  { code: "CA", category: "indoor", contents: "Malfunction of discharge air thermistor", causes: ["Defect of connector contact", "Defect of thermistor for discharge air"], models: VRV_ONLY, severity: "warning" },
  { code: "CC", category: "indoor", contents: "Malfunction of humidity sensor system", causes: ["Defect of connector contact", "Defect of humidity sensor"], models: VRV_ONLY, severity: "warning" },
  { code: "CJ", category: "indoor", contents: "Malfunction of thermostat sensor in remote controller", causes: ["Defect of remote controller thermistor", "Malfunction due to noise", "Defect of remote controller PCB"], models: RA_SKY_VRV, severity: "info" },

  // ═══════════════════════════ OUTDOOR UNIT ═══════════════════════════
  { code: "E0", category: "outdoor", contents: "Protection devices actuated (unified)", causes: ["Protection device connected to outdoor PCB actuated", "Defect of protection device connector contact", "Defect of outdoor unit PCB", "Malfunction due to noise"], models: ALL, severity: "critical" },
  { code: "E1", category: "outdoor", contents: "Actuation of high pressure switch (HPS)", causes: ["Dirty outdoor unit heat exchanger and suction filter", "Defect of HPS", "Clogged refrigerant piping", "Defect of connector contact"], models: ALL, severity: "critical" },
  { code: "E3", category: "outdoor", contents: "Actuation of low pressure switch (LPS)", causes: ["Clogged refrigerant piping", "Defect of connecting connector"], models: ALL, severity: "critical" },
  { code: "E4", category: "outdoor", contents: "Overheat of inverter compressor motor", causes: ["Shortage of refrigerant amount", "Leakage of four way valve", "Inverter compressor motor lock"], models: RA_SKY_VRV, severity: "critical" },
  { code: "E5", category: "outdoor", contents: "STD compressor motor overcurrent/lock", causes: ["Inverter compressor lock", "Incorrect wiring", "Closed stop valve", "STD compressor lock"], models: ALL, severity: "critical" },
  { code: "E6", category: "outdoor", contents: "Malfunction of outdoor unit fan motor", causes: ["Faulty contact of fan motor connector", "Defect of fan motor", "Defect of fan motor driver"], models: ALL, severity: "critical" },
  { code: "E7", category: "outdoor", contents: "Overcurrent of inverter compressor", causes: ["Defect of compressor", "Defect of outdoor unit PCB", "Defect of inverter main circuit capacitor", "Defect of power transistor"], models: RA_SKY_VRV, severity: "critical" },
  { code: "E8", category: "outdoor", contents: "Malfunction of electronic expansion valve coil", causes: ["Defect of electronic expansion valve", "Defect of outdoor unit PCB"], models: ALL, severity: "warning" },
  { code: "E9", category: "outdoor", contents: "Malfunction of four way valve", causes: ["Defect of four way valve", "Defect of outdoor unit PCB"], models: ALL, severity: "critical" },
  { code: "EA", category: "outdoor", contents: "Malfunction of entering water temperature", causes: ["Malfunction of cooling water temperature", "Defect of thermistor", "Defect of outdoor unit PCB"], models: VRV_PKG_CHILLER, severity: "warning" },
  { code: "EC", category: "outdoor", contents: "Malfunction of thermal storage unit", causes: ["Defect of electronic expansion valve of thermal storage unit", "Defect of thermal storage PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "EF", category: "outdoor", contents: "Malfunction of discharge pipe temperature", causes: ["Shortage of gas", "Defect of connector contact", "Abnormal high pressure in cooling"], models: ALL, severity: "critical" },
  { code: "F3", category: "outdoor", contents: "Malfunction of sensor system of compressor", causes: ["Harness is disconnected, or defective connection", "Defect of PCB"], models: ALL, severity: "warning" },
  { code: "F6", category: "outdoor", contents: "Malfunction of humidifier unit damper", causes: ["Defect of limit switch", "Defect of damper"], models: VRV_ONLY, severity: "warning" },
  { code: "H0", category: "outdoor", contents: "Malfunction of high pressure switch (HPS)", causes: ["Defect of high pressure switch", "Defect of connector contact"], models: ALL, severity: "critical" },
  { code: "H1", category: "outdoor", contents: "Malfunction of low pressure switch (LPS)", causes: ["Defect of low pressure switch", "Defect of connector contact"], models: RA_SKY_VRV, severity: "critical" },
  { code: "H3", category: "outdoor", contents: "Malfunction of compressor motor overload thermistor", causes: ["Defect of connector contact", "Defect of compressor motor overload thermistor"], models: RA_SKY_VRV, severity: "warning" },
  { code: "H4", category: "outdoor", contents: "Malfunction of position detection sensor", causes: ["Faulty contact of compressor cable", "Defect of compressor", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "H5", category: "outdoor", contents: "Malfunction of outdoor fan motor signal", causes: ["Faulty contact of fan wiring", "Defect of fan motor", "Defect of fan motor driver"], models: ALL, severity: "warning" },
  { code: "H6", category: "outdoor", contents: "Malfunction of compressor input (CT) system", causes: ["Defect of power transistor", "Defect of reactor", "Faulty wiring of inverter system", "Defect of outdoor unit PCB"], models: ALL, severity: "warning" },
  { code: "H7", category: "outdoor", contents: "Malfunction of outdoor air thermistor", causes: ["Defect of connector contact", "Defect of thermistor for outdoor air"], models: ALL, severity: "warning" },
  { code: "H8", category: "outdoor", contents: "Malfunction of discharge air thermistor", causes: ["Defect of connector contact", "Defect of thermistor for discharge air"], models: VRV_ONLY, severity: "warning" },
  { code: "H9", category: "outdoor", contents: "Malfunction of (hot) water temperature thermistor", causes: ["Defect of connector contact", "Defect of outdoor unit PCB", "Defect of thermistor for water temperature"], models: VRV_PKG_CHILLER, severity: "warning" },
  { code: "HC", category: "outdoor", contents: "Alarm in thermal storage unit with ice", causes: ["Thermal storage group defective wiring", "Defect of setting", "Excess of thermal storage tank numbers"], models: VRV_ONLY, severity: "warning" },
  { code: "HF", category: "outdoor", contents: "Malfunction of thermal storage tank water level", causes: ["Low water level", "Water level detecting sensor failure"], models: VRV_ONLY, severity: "warning" },
  { code: "HJ", category: "outdoor", contents: "High room temperature alarm", causes: ["Dirty heat exchanger", "Defect of thermistor", "Three-way valve malfunction", "Defect of water temperature setting"], models: CHILLER, severity: "warning" },
  { code: "J1", category: "outdoor", contents: "Malfunction of pressure sensor", causes: ["Defect of pressure sensor connector contact", "Defect of pressure sensor", "Defect of outdoor unit PCB"], models: ALL, severity: "warning" },
  { code: "J2", category: "outdoor", contents: "Malfunction of current sensor of compressor", causes: ["Defect of current sensor", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "J3", category: "outdoor", contents: "Malfunction of discharge pipe thermistor", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: ALL, severity: "warning" },
  { code: "J4", category: "outdoor", contents: "Malfunction of low pressure equivalent saturated temperature sensor system", causes: ["Defect of connector contact", "Defect of thermistor", "Defect of outdoor unit PCB (Multi-split, Super-multi)"], models: RA_SKY_VRV, severity: "warning" },
  { code: "J5", category: "outdoor", contents: "Malfunction of suction pipe thermistor", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: ALL, severity: "warning" },
  { code: "J6", category: "outdoor", contents: "Malfunction of heat exchanger thermistor", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: ALL, severity: "warning" },
  { code: "J7", category: "outdoor", contents: "Malfunction of liquid pipe thermistor (Refrigerant circuit)", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "J8", category: "outdoor", contents: "Malfunction of liquid pipe thermistor (Refrigerant circuit)", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "J9", category: "outdoor", contents: "Malfunction of gas pipe thermistor (Refrigerant circuit)", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "JA", category: "outdoor", contents: "Malfunction of high pressure sensor", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "JC", category: "outdoor", contents: "Malfunction of low pressure sensor", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "JE", category: "outdoor", contents: "Malfunction of sub-tank thermistor", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "JF", category: "outdoor", contents: "Malfunction of heating thermistor for heat exchanger", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "JH", category: "outdoor", contents: "Malfunction of oil temperature thermistor", causes: ["Defect of connector contact", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "L0", category: "outdoor", contents: "Malfunction of inverter system", causes: ["Shortage of power supply capacity", "Defect of inverter PCB"], models: ALL, severity: "critical" },
  { code: "L1", category: "outdoor", contents: "Malfunction of inverter PCB", causes: ["Defect of compressor wiring", "Blown fuse"], models: VRV_ONLY, severity: "critical" },
  { code: "L3", category: "outdoor", contents: "Electrical box temperature rise", causes: ["Fin temperature rise due to short-circuit", "Defect of power transistor"], models: ALL, severity: "critical" },
  { code: "L4", category: "outdoor", contents: "Malfunction of inverter radiating fin temperature rise", causes: ["Fin temperature rise due to short-circuit", "Defect of fin thermistor"], models: ALL, severity: "critical" },
  { code: "L5", category: "outdoor", contents: "Inverter instantaneous overcurrent (DC output)", causes: ["Closed stop valve", "Defect of compressor"], models: ALL, severity: "critical" },
  { code: "L6", category: "outdoor", contents: "Inverter instantaneous overcurrent (AC output)", causes: ["Overcharge of refrigerant amount", "Defect of compressor"], models: VRV_ONLY, severity: "critical" },
  { code: "L8", category: "outdoor", contents: "Overcurrent of inverter compressor", causes: ["Abnormal high pressure rise due to clogged refrigerant circuit", "Defect of compressor"], models: ALL, severity: "critical" },
  { code: "L9", category: "outdoor", contents: "Malfunction of inverter compressor startup (Stall prevention)", causes: ["Faulty of pressure equalization", "Defect of compressor wiring"], models: ALL, severity: "critical" },
  { code: "LA", category: "outdoor", contents: "Malfunction of power transistor", causes: ["Defect of power transistor", "Defect of inverter PCB"], models: ALL, severity: "critical" },
  { code: "LC", category: "outdoor", contents: "Malfunction of transmission between control and inverter PCB", causes: ["Defect of connector contact", "Malfunction due to noise", "Defect of inverter PCB", "Defect of outdoor unit control PCB"], models: ALL, severity: "warning" },
  { code: "P0", category: "outdoor", contents: "Shortage of refrigerant amount (thermal storage unit)", causes: ["Shortage of refrigerant", "Clogged refrigerant piping"], models: VRV_ONLY, severity: "critical" },
  { code: "P1", category: "outdoor", contents: "Power voltage imbalance, open phase", causes: ["Open phase", "Voltage imbalance between phases", "Faulty main circuit capacitor"], models: ALL, severity: "critical" },
  { code: "P2", category: "outdoor", contents: "Automatic refrigerant charge operation stop", causes: ["Closed stop valve", "Closed valve of refrigerant tank"], models: VRV_ONLY, severity: "info" },
  { code: "P3", category: "outdoor", contents: "Malfunction of thermistor in electrical box", causes: ["Electrical box temperature rise (ambient temperature rise)", "Defect of fin thermistor", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "P4", category: "outdoor", contents: "Malfunction of radiating fin temperature sensor", causes: ["Defect of radiating fin thermistor", "Defect of wiring contact", "Defect of outdoor unit PCB"], models: ALL, severity: "warning" },
  { code: "P8", category: "outdoor", contents: "Heat exchanger freezing protection during automatic refrigerant charging", causes: ["Close the refrigerant cylinder. Start again from step 1."], models: VRV_ONLY, severity: "info" },
  { code: "P9", category: "outdoor", contents: "Automatic refrigerant charge operation completed", causes: ["Charging complete - no action needed"], models: VRV_ONLY, severity: "info" },
  { code: "PA", category: "outdoor", contents: "Empty refrigerant cylinder during automatic refrigerant charging", causes: ["Refrigerant cylinder of master unit is empty", "Refrigerant cylinder of slave unit is empty"], models: VRV_ONLY, severity: "info" },
  { code: "PC", category: "outdoor", contents: "Automatic refrigerant charge operation nearly completed", causes: ["Nearly complete - monitor progress"], models: VRV_ONLY, severity: "info" },
  { code: "PE", category: "outdoor", contents: "Malfunction of capacity setting (Outdoor unit PCB)", causes: ["Capacity setting adaptor is not installed", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "PH", category: "outdoor", contents: "Improper combination between inverter and fan driver", causes: ["Mistake of inverter PCB", "Mistake of control PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "PJ", category: "outdoor", contents: "Shortage of refrigerant", causes: ["Shortage of refrigerant", "Closed stop valve"], models: ALL, severity: "critical" },

  // ═══════════════════════════ SYSTEM ═══════════════════════════
  { code: "U0", category: "system", contents: "Reverse phase, open phase", causes: ["Reverse phase, open phase of power wiring", "Wrong wiring", "Defect of outdoor unit PCB"], models: ALL, severity: "critical" },
  { code: "U1", category: "system", contents: "Defect of power supply voltage or instantaneous power failure", causes: ["Defect of power supply voltage", "Defect of wiring contact"], models: ALL, severity: "critical" },
  { code: "U2", category: "system", contents: "Check operation not executed or transmission error", causes: ["Check operation not executed", "Malfunction of transmission", "Wrong wiring", "Malfunction due to noise", "Defect of outdoor unit PCB"], models: ALL, severity: "info" },
  { code: "U3", category: "system", contents: "Malfunction of transmission between indoor and outdoor unit", causes: ["Defect of indoor-outdoor transmission wiring", "Malfunction due to noise", "Defect of indoor unit PCB and outdoor unit PCB"], models: ALL, severity: "warning" },
  { code: "U4", category: "system", contents: "Malfunction of transmission between indoor unit and remote controller", causes: ["Defect of remote controller wiring", "Defect of indoor unit PCB", "Malfunction due to noise", "Defect of remote controller main/sub setting"], models: ALL, severity: "warning" },
  { code: "U5", category: "system", contents: "Malfunction of transmission between indoor units", causes: ["Faulty wiring", "Malfunction due to noise", "Defect of indoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "U6", category: "system", contents: "Malfunction of transmission between outdoor unit PCB and micro-computer", causes: ["Harness disconnection/broken wire between PCB", "Defect of outdoor unit PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "U7", category: "system", contents: "Malfunction of transmission between outdoor units", causes: ["Defect of wiring between outdoor units", "Defect of outdoor unit switch setting", "Defect of wiring between outdoor - thermal storage units"], models: ALL, severity: "warning" },
  { code: "U8", category: "system", contents: "Malfunction of transmission between remote controllers", causes: ["Defect of remote controller main/sub setting", "Defect of remote controller wiring", "Defect of remote controller PCB"], models: RA_SKY_VRV, severity: "info" },
  { code: "U9", category: "system", contents: "Malfunction of transmission (other system)", causes: ["Defect of communication between other indoor unit and outdoor unit", "Other indoor unit electronic expansion valve failure"], models: VRV_ONLY, severity: "warning" },
  { code: "UA", category: "system", contents: "Improper combination of indoor and outdoor units / Defect of power supply", causes: ["Wrong model connections", "Wrong PCB connected", "Excess of connected indoor units", "Defect of indoor/outdoor power supply"], models: ALL, severity: "warning" },
  { code: "UC", category: "system", contents: "Malfunction of setting of centralized controller address", causes: ["Address duplication of centralized controller", "Centralized control reset switch ON", "Central remote controller address change"], models: VRV_ONLY, severity: "info" },
  { code: "UE", category: "system", contents: "Malfunction of transmission between indoor unit and centralized controller", causes: ["Malfunction of wiring between indoor unit and centralized controller"], models: VRV_ONLY, severity: "warning" },
  { code: "UF", category: "system", contents: "Wiring and piping mismatch", causes: ["Improper connection of transmission wiring between indoor-outdoor units and outdoor-outdoor units", "Defect of setting of group number", "Defect of indoor unit PCB"], models: ALL, severity: "warning" },
  { code: "UH", category: "system", contents: "Malfunction of system", causes: ["Improper connection of transmission wiring between indoor-outdoor units and outdoor-outdoor units", "Defect of indoor and outdoor unit PCB", "Mismatching indoor and outdoor units (RA)", "Defect of voltage", "Freeze protection in other indoor unit"], models: ALL, severity: "critical" },
  { code: "UJ", category: "system", contents: "Malfunction of field setting", causes: ["Malfunction of field setting by remote controller", "Defect of remote controller wiring", "Defective connection of optional device", "Defect of indoor unit PCB", "Uncanceled service mode"], models: ALL, severity: "info" },
  { code: "M1", category: "system", contents: "Malfunction of transmission (accessory device)", causes: ["Defect of accessory devices", "Faulty wiring"], models: VRV_ONLY, severity: "warning" },
  { code: "M8", category: "system", contents: "Malfunction of centralized remote controller PCB", causes: ["Defect of centralized remote controller PCB"], models: VRV_ONLY, severity: "warning" },
  { code: "MA", category: "system", contents: "Malfunction of transmission between optional controllers for centralized control", causes: ["Other centralized control power disconnection", "Defect of transmission wiring"], models: VRV_ONLY, severity: "warning" },
  { code: "MC", category: "system", contents: "Improper combination of optional controllers for centralized control", causes: ["Improper combination of optional controllers for centralized control", "More than one master controller is connected", "Faulty setting of centralized control", "Defect of centralized control"], models: VRV_ONLY, severity: "warning" },

  // ═══════════════════════════ OTHERS (HRV / Chiller) ═══════════════════════════
  { code: "60", category: "others", contents: "External protection device actuated (HRV)", causes: ["Actuation of external protection device", "Defect of output signal wiring", "Defect of control PCB"], models: HRV_ONLY, severity: "critical" },
  { code: "64", category: "others", contents: "Malfunction of indoor air thermistor (HRV)", causes: ["Defect of connecting connector", "Defect of control PCB"], models: HRV_ONLY, severity: "warning" },
  { code: "65", category: "others", contents: "Malfunction of outdoor air thermistor (HRV)", causes: ["Defect of connector contact", "Defect of control PCB"], models: HRV_ONLY, severity: "warning" },
  { code: "6A", category: "others", contents: "Malfunction of damper system (HRV)", causes: ["Defect of connector contact", "Defect of damper motor"], models: HRV_ONLY, severity: "warning" },
  { code: "70", category: "others", contents: "System No. 2 Compressor overload", causes: ["Shortage of refrigerant amount", "Defect of connector contact", "Leakage of four way valve"], models: CHILLER, severity: "critical" },
  { code: "71", category: "others", contents: "System No. 2 Compressor overcurrent", causes: ["Shortage of refrigerant amount", "Short-circuit", "Defect of compressor"], models: CHILLER, severity: "critical" },
  { code: "72", category: "others", contents: "System No. 2 Fan motor overcurrent", causes: ["Defect of fan motor connector contact", "Defect of fan motor", "Defect of PCB"], models: CHILLER, severity: "critical" },
  { code: "73", category: "others", contents: "System No. 2 Malfunction of high pressure (HPS) actuated", causes: ["Dirty heat exchanger", "Clogged refrigerant piping", "Defect of HPS"], models: CHILLER, severity: "critical" },
  { code: "74", category: "others", contents: "System No. 2 Malfunction of low pressure switch (LPS)", causes: ["Clogged refrigerant piping", "Shortage of gas"], models: CHILLER, severity: "critical" },
  { code: "75", category: "others", contents: "System No. 2 Malfunction of low pressure sensor", causes: ["Defect of connector contact", "Defect of low pressure sensor", "Defect of PCB"], models: CHILLER, severity: "warning" },
  { code: "76", category: "others", contents: "System No. 2 Malfunction of high pressure sensor", causes: ["Defect of connector contact", "Defect of high pressure sensor", "Defect of PCB"], models: CHILLER, severity: "warning" },
  { code: "77", category: "others", contents: "System No. 1 Malfunction of fan inter lock", causes: ["Defect of relay contact", "Broken wire"], models: CHILLER, severity: "warning" },
  { code: "78", category: "others", contents: "System No. 2 Malfunction of fan inter lock", causes: ["Defect of relay contact", "Broken wire"], models: CHILLER, severity: "warning" },
  { code: "7A", category: "others", contents: "System No. 2 Malfunction of current sensor of compressor", causes: ["Defect of current sensor", "Defect of compressor", "Defect of outdoor unit PCB"], models: CHILLER, severity: "warning" },
  { code: "7C", category: "others", contents: "System No. 2 Malfunction of pump inter lock", causes: ["Cooling water pump interlock actuated"], models: CHILLER, severity: "warning" },
  { code: "80", category: "others", contents: "Malfunction of entering water temperature thermistor", causes: ["Defect of connector contact", "Defect of entering water temperature thermistor"], models: CHILLER, severity: "warning" },
  { code: "81", category: "others", contents: "Malfunction of leaving water temperature thermistor", causes: ["Defect of connector contact", "Defect of leaving water temperature thermistor"], models: CHILLER, severity: "warning" },
  { code: "82", category: "others", contents: "System No. 1 Malfunction of refrigerant thermistor", causes: ["Defect of connector contact", "Defect of refrigerant thermistor"], models: CHILLER, severity: "warning" },
  { code: "83", category: "others", contents: "System No. 2 Malfunction of refrigerant thermistor", causes: ["Defect of connector contact", "Defect of refrigerant thermistor"], models: CHILLER, severity: "warning" },
  { code: "84", category: "others", contents: "System No. 1 Malfunction of heat exchanger thermistor", causes: ["Defect of connector contact", "Defect of heat exchanger thermistor"], models: CHILLER, severity: "warning" },
  { code: "85", category: "others", contents: "System No. 2 Malfunction of heat exchanger thermistor", causes: ["Defect of connector contact", "Defect of heat exchanger thermistor"], models: CHILLER, severity: "warning" },
  { code: "86", category: "others", contents: "System No. 1 Malfunction of discharge pipe thermistor", causes: ["Defect of connecting connector", "Defect of discharge pipe thermistor"], models: CHILLER, severity: "warning" },
  { code: "88", category: "others", contents: "System No. 2 Malfunction of discharge pipe temperature", causes: ["Shortage of gas", "Defect of discharge pipe thermistor", "Defect of connector contact"], models: CHILLER, severity: "warning" },
  { code: "89", category: "others", contents: "Malfunction of brazed-plate heat exchanger freezing", causes: ["Shortage of refrigerant amount"], models: CHILLER, severity: "critical" },
  { code: "8A", category: "others", contents: "System No. 2 Malfunction of leaving water temperature thermistor", causes: ["Defect of connector contact", "Defect of leaving water temperature thermistor"], models: CHILLER, severity: "warning" },
  { code: "8E", category: "others", contents: "System No. 1 Malfunction of suction pipe thermistor 1 for heating", causes: ["Defect of connector contact", "Defect of suction pipe thermistor"], models: CHILLER, severity: "warning" },
  { code: "8F", category: "others", contents: "System No. 1 Malfunction of suction pipe thermistor 2 for heating", causes: ["Defect of connector contact", "Defect of suction pipe thermistor"], models: CHILLER, severity: "warning" },
  { code: "8H", category: "others", contents: "Abnormal high hot water temperature", causes: ["Defect of thermistor"], models: CHILLER, severity: "critical" },
  { code: "90", category: "others", contents: "Abnormal chilled water quantity, abnormal AXP", causes: ["Shortage of water volume", "Disconnection of AXP"], models: CHILLER, severity: "critical" },
  { code: "91", category: "others", contents: "System No. 2 Malfunction of electronic expansion valve", causes: ["Defect of connector contact", "Defect of electronic expansion valve coil"], models: CHILLER, severity: "warning" },
  { code: "92", category: "others", contents: "System No. 2 Malfunction of suction pipe thermistor", causes: ["Defect of connector contact", "Defect of suction pipe thermistor"], models: CHILLER, severity: "warning" },
  { code: "94", category: "others", contents: "Malfunction of transmission (between heat reclaim ventilation unit and fan unit)", causes: ["Defect of fan unit PCB", "Defect of connecting wire between (1) and (2)"], models: VRV_ONLY, severity: "warning" },
  { code: "95", category: "others", contents: "System No. 1 Malfunction of inverter system", causes: ["Defect of fan inverter unit"], models: CHILLER, severity: "critical" },
  { code: "96", category: "others", contents: "System No. 2 Malfunction of inverter system", causes: ["Defect of fan inverter unit"], models: CHILLER, severity: "critical" },
  { code: "97", category: "others", contents: "Malfunction of thermal storage unit", causes: ["Defect of thermal storage unit"], models: VRV_ONLY, severity: "warning" },
  { code: "98", category: "others", contents: "Malfunction of thermal storage brine pump", causes: ["Actuation of thermal storage brine pump overcurrent (OC)"], models: VRV_ONLY, severity: "warning" },
  { code: "99", category: "others", contents: "Malfunction of thermal storage brine tank", causes: ["Low water level of thermal storage brine tank"], models: VRV_ONLY, severity: "warning" },
];

// Remote Controller Self-Diagnosis Guide Data
export interface RemoteGuide {
  id: string;
  title: string;
  type: "wireless" | "wired";
  models: string[];
  steps: string[];
}

export const REMOTE_GUIDES: RemoteGuide[] = [
  {
    id: "wireless-1",
    title: "Wireless Remote Controller (Residential)",
    type: "wireless",
    models: ["ARC455A", "ARC452A", "ARC433B", "ARC423A", "ARC417A"],
    steps: [
      "Hold the TIMER CANCEL button down for 5 seconds, with the remote controller set toward the indoor unit.",
      "The temperature display on the remote controller changes to the error code display and a long beep notifies this indication change.",
      "To cancel indication of malfunction code, hold the TIMER CANCEL button down for 5 seconds.",
      "The code display also cancels itself if the button is not pressed for 1 minute."
    ]
  },
  {
    id: "wireless-2",
    title: "Wireless Remote Controller (ARC447A)",
    type: "wireless",
    models: ["ARC447A"],
    steps: [
      "When the TIMER CANCEL button is held down for 5 seconds, a '00' indication flashes on the temperature display section.",
      "Press the TIMER CANCEL button repeatedly until a continuous beep is produced.",
      "The code indication changes in sequence and notifies with a long beep.",
      "A short beep and two consecutive beeps indicate non-corresponding codes.",
      "To cancel the code display, hold the TIMER CANCEL button down for 5 seconds."
    ]
  },
  {
    id: "wireless-3",
    title: "Wireless Remote Controller (ARC433B67/68/69/76)",
    type: "wireless",
    models: ["ARC433B67", "ARC433B68", "ARC433B69", "ARC433B76"],
    steps: [
      "Press the 3 buttons (TEMP ▲, TEMP ▼, MODE) simultaneously to enter the diagnosis mode.",
      "The figure of the ten's place blinks. Try again from the start when the figure does not blink.",
      "Press TEMP ▲ or ▼ button and change the figure until you hear 'beep' or 'pi pi'.",
      "'pi' = The figure does not match the malfunction code.",
      "'pi pi' = The ten's place matches but the one's does not.",
      "'beep' = Both ten's and one's place match the malfunction code.",
      "Press the MODE button. The figure of the one's place blinks.",
      "Repeat the same process for the one's place digit.",
      "Press MODE button to exit diagnosis mode.",
      "Press ON/OFF button twice to return to normal mode."
    ]
  },
  {
    id: "wired-1",
    title: "Wired Remote Controller (SkyAir, VRV)",
    type: "wired",
    models: ["BRC1C62"],
    steps: [
      "If operation stops due to malfunction, the operation LED blinks and the malfunction code is displayed.",
      "Even if stop operation is carried out, malfunction contents are displayed when the inspection mode is entered.",
      "Press the INSPECTION/TEST button to select 'Inspection'.",
      "The equipment enters inspection mode. The 'Unit' indication lights and Unit No. display shows flashing '0'.",
      "Press UP or DOWN button to change the Unit No. until the buzzer is generated from the indoor unit.",
      "3 short beeps = Conduct all following operations | 1 short beep = Conduct steps 3 and 4 | Continuous beep = No abnormality.",
      "Press the MODE selector button. The left '0' (upper digit) of malfunction code flashes.",
      "Press UP or DOWN button to change upper digit until the matching buzzer is generated.",
      "Continuous beep = Both digits matched | 2 short beeps = Upper digit matched | 1 short beep = Lower digit matched.",
      "Press MODE selector button. The right '0' (lower digit) flashes.",
      "Press UP or DOWN to change lower digit until continuous beep.",
      "While in malfunction code display, pressing ON/OFF button for 4+ seconds will clear history."
    ]
  },
  {
    id: "wired-2",
    title: "Wired Remote Controller (BRC1E61)",
    type: "wired",
    models: ["BRC1E61"],
    steps: [
      "If operation stops due to malfunction, the operation indicator blinks. The message 'Error: Press Menu Button' appears at the bottom of the screen.",
      "Press 'Menu/Enter' button — the malfunction code will be displayed.",
      "Press 'Menu/Enter' button — malfunction history is displayed in 'Main Menu' mode.",
      "Select 'Service Contact / Model Info' and press 'Menu/Enter' button for more details.",
      "Press 'Cancel' button to return to previous screen."
    ]
  },
];
