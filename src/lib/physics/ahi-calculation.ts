/**
 * Asset Health Index (AHI) Calculation Utility
 * Based on CIBSE Guide M and ASHRAE Guideline 1.1
 * Balanced Scoring: Physical Condition (40%), Performance (40%), Reliability (20%)
 */

import { calculateUnitHealth, CapacityResult } from "./enthalpy";

export interface AHIResult {
  totalScore: number;
  conditionScore: number;
  performanceScore: number;
  reliabilityScore: number;
  breakdown: {
    condition: { fincoil: number; drainPan: number; blowerFan: number; accessories: number };
    performance: { deltaT: number; capacityEfficiency: number };
    reliability: { age: number; ageFactor: number };
  };
  physics?: CapacityResult;
}

export function calculateBalancedAHI(params: {
  fincoil: 'GOOD' | 'BAD';
  drainPan: 'GOOD' | 'BAD';
  blowerFan: 'GOOD' | 'BAD';
  accessories: string[]; // ['OK', 'DEFECT', 'N/A', ...]
  enteringDB: number;
  leavingDB: number;
  enteringRH?: number;
  leavingRH?: number;
  measuredAirflow?: number;
  designCapacityStr?: string;
  yearOfInstall?: number;
}): AHIResult {
  
  // 1. CONDITION SCORE (40% Weight)
  const fcScore = params.fincoil === 'GOOD' ? 100 : 0;
  const dpScore = params.drainPan === 'GOOD' ? 100 : 0;
  const bfScore = params.blowerFan === 'GOOD' ? 100 : 0;
  
  const accTotal = params.accessories.filter(a => a !== 'N/A').length;
  const accOk = params.accessories.filter(a => a === 'OK').length;
  const accScore = accTotal > 0 ? (accOk / accTotal) * 100 : 100;
  
  // Condition Weights: Fincoil (25%), DrainPan (15%), Blower (25%), Acc (35%)
  const conditionScore = Math.round(
    (fcScore * 0.25) + 
    (dpScore * 0.15) + 
    (bfScore * 0.25) + 
    (accScore * 0.35)
  );

  // 2. PERFORMANCE SCORE (40% Weight)
  let performanceScore = 100;
  let capacityEfficiency = 100;
  let physics: CapacityResult | undefined;
  
  // If we have airflow and design capacity, use physics engine
  if (params.measuredAirflow && params.designCapacityStr) {
    physics = calculateUnitHealth(
      params.enteringDB,
      params.enteringRH || 50,
      params.leavingDB,
      params.leavingRH || 50,
      params.measuredAirflow,
      params.designCapacityStr
    );
    performanceScore = physics.healthScore;
    capacityEfficiency = physics.healthScore;
  } else {
    // Fallback to simple Delta T scoring if physics data incomplete
    const deltaT = params.enteringDB - params.leavingDB;
    if (deltaT > 0) {
      if (deltaT < 7 || deltaT > 14) performanceScore = 40;
      else if (deltaT < 8 || deltaT > 12) performanceScore = 70;
      else performanceScore = 100;
    } else {
      performanceScore = 30; // Critical/No cooling
    }
  }

  // 3. RELIABILITY SCORE (20% Weight)
  let reliabilityScore = 100;
  let age = 0;
  if (params.yearOfInstall) {
    age = new Date().getFullYear() - params.yearOfInstall;
    if (age > 15) reliabilityScore = 20;
    else if (age > 10) reliabilityScore = 50;
    else if (age > 7) reliabilityScore = 80;
    else reliabilityScore = 100;
  }

  const totalScore = Math.round(
    (conditionScore * 0.40) + 
    (performanceScore * 0.40) + 
    (reliabilityScore * 0.20)
  );

  return {
    totalScore,
    conditionScore,
    performanceScore,
    reliabilityScore,
    breakdown: {
      condition: { fincoil: fcScore, drainPan: dpScore, blowerFan: bfScore, accessories: Math.round(accScore) },
      performance: { deltaT: params.enteringDB - params.leavingDB, capacityEfficiency: Math.round(capacityEfficiency) },
      reliability: { age, ageFactor: reliabilityScore }
    },
    physics
  };
}
