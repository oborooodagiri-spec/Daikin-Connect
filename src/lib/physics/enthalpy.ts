/**
 * Enthalpy & Cooling Capacity Calculation Utility
 * Based on Standard Psychrometric Formulas
 */

export interface PsychrometricResult {
  temperature: number;
  humidity: number;
  enthalpy: number; // kJ/kg
  humidityRatio: number; // kg/kg
}

export interface CapacityResult {
  entering: PsychrometricResult;
  leaving: PsychrometricResult;
  airflow: number; // m3/h
  actualCapacitykW: number;
  designCapacitykW: number;
  healthScore: number;
  status: 'optimal' | 'degrading' | 'critical';
}

/**
 * Calculate Saturation Vapor Pressure (Pws) in kPa
 * Magnus-Tetens formula
 */
function calculatePws(T: number): number {
  return 0.6112 * Math.exp((17.62 * T) / (T + 243.12));
}

/**
 * Calculate Humidity Ratio (w) in kg water / kg dry air
 */
function calculateHumidityRatio(T: number, RH: number): number {
  const Pws = calculatePws(T);
  const Pw = (RH / 100) * Pws;
  const Patm = 101.325; // Standard atmosphere in kPa
  return (0.622 * Pw) / (Patm - Pw);
}

/**
 * Calculate Specific Enthalpy (h) in kJ/kg
 */
function calculateEnthalpy(T: number, RH: number): { h: number; w: number } {
  const w = calculateHumidityRatio(T, RH);
  const h = 1.006 * T + w * (2501 + 1.86 * T);
  return { h, w };
}

/**
 * Convert PK string to kW (approximate cooling capacity)
 * Standard industry approx: 1 PK = 9000 BTU/h = 2.6 kW
 */
export function parseCapacityToKW(capacityStr: string): number {
  if (!capacityStr) return 0;
  
  const cleanStr = capacityStr.toLowerCase();
  
  // Direct kW check
  if (cleanStr.includes('kw')) {
    return parseFloat(cleanStr) || 0;
  }
  
  // PK conversion
  if (cleanStr.includes('pk')) {
    const pkVal = parseFloat(cleanStr) || 0;
    return pkVal * 2.6;
  }
  
  // BTU conversion
  if (cleanStr.includes('btu')) {
    const btuVal = parseFloat(cleanStr) || 0;
    return btuVal / 3412.14; // 1 kW = 3412 BTU/h
  }

  return parseFloat(cleanStr) || 0;
}

/**
 * Calculate Health Score based on measured air properties
 */
export function calculateUnitHealth(
  enteringT: number, 
  enteringRH: number, 
  leavingT: number, 
  leavingRH: number, 
  measuredAirflow: number, // m3/h
  designCapacityStr: string
): CapacityResult {
  // Defensive defaults for missing field data
  const eRH = enteringRH || 50;
  const lRH = leavingRH || 50;
  
  const entIn = calculateEnthalpy(enteringT, eRH);
  const entOut = calculateEnthalpy(leavingT, lRH);
  
  // Air Density (approx)
  const rho = 1.204; // kg/m3
  
  // Air Mass Flow (kg/s)
  const massFlow = (measuredAirflow * rho) / 3600;
  
  // actual Capacity (kW) = massFlow * delta enthalpy
  const actualCapacity = massFlow * (entIn.h - entOut.h);
  
  const designCapacity = parseCapacityToKW(designCapacityStr);
  
  const healthScore = designCapacity > 0 
    ? Math.min(100, Math.max(0, (actualCapacity / designCapacity) * 100)) 
    : 0;

  let status: 'optimal' | 'degrading' | 'critical' = 'optimal';
  if (healthScore < 60) status = 'critical';
  else if (healthScore < 85) status = 'degrading';

  return {
    entering: { temperature: enteringT, humidity: enteringRH, enthalpy: entIn.h, humidityRatio: entIn.w },
    leaving: { temperature: leavingT, humidity: leavingRH, enthalpy: entOut.h, humidityRatio: entOut.w },
    airflow: measuredAirflow,
    actualCapacitykW: parseFloat(actualCapacity.toFixed(2)),
    designCapacitykW: parseFloat(designCapacity.toFixed(2)),
    healthScore: Math.round(healthScore),
    status
  };
}
