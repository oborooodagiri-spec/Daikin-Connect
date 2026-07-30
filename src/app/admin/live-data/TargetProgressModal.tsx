import React, { useState, useEffect, useMemo } from "react";
import { X, Target, Trophy, TrendingUp, ChevronDown } from "lucide-react";
import { getTargetSettings, getSalesEngineers } from "@/app/actions/pipeline";

interface TargetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatRp: (val: number) => string;
  deals: any[];
  currentFY: number;
  fyOptions: number[];
}

export default function TargetProgressModal({ isOpen, onClose, formatRp, deals, currentFY, fyOptions }: TargetProgressModalProps) {
  const [totalTarget, setTotalTarget] = useState<number>(0);
  const [picTargets, setPicTargets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [salesEngineers, setSalesEngineers] = useState<string[]>([]);
  const [modalFY, setModalFY] = useState(currentFY);

  useEffect(() => {
    if (isOpen) {
      setModalFY(currentFY);
      loadTargets();
    }
  }, [isOpen]);

  const loadTargets = async () => {
    setLoading(true);
    const [targetRes, seRes] = await Promise.all([
      getTargetSettings(),
      getSalesEngineers()
    ]);
    setTotalTarget(targetRes?.total || 0);
    setPicTargets(targetRes?.byPic || {});
    if (seRes?.success) {
      setSalesEngineers((seRes.data || []).map((u: any) => u.name));
    }
    setLoading(false);
  };

  const calculateProgress = (achievement: number, target: number) => {
    if (!target || target === 0) return 0;
    const pct = (achievement / target) * 100;
    return Math.min(Math.round(pct * 10) / 10, 100);
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return "#00c875";
    if (pct >= 75) return "#ffcb00";
    if (pct >= 50) return "#fdab3d";
    return "#e2445c";
  };

  // Filter closed deals by selected FY
  const { totalAchievement, totalClosedCount, picAchievements } = useMemo(() => {
    let total = 0;
    let closedCount = 0;
    const byPic: Record<string, { value: number; count: number }> = {};

    // FY date range: April 1 of FY year to March 31 of FY+1 year
    const fyStartYear = 2000 + modalFY;
    const fyStart = new Date(fyStartYear, 3, 1).getTime(); // April 1
    const fyEnd = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999).getTime(); // March 31

    deals.forEach(d => {
      if (d.is_closed) {
        const updatedAt = new Date(d.updated_at).getTime();
        if (updatedAt >= fyStart && updatedAt <= fyEnd) {
          const val = Number(d.quotation) || 0;
          total += val;
          closedCount++;
          
          const pic = d.pic || "Unassigned";
          if (!byPic[pic]) byPic[pic] = { value: 0, count: 0 };
          byPic[pic].value += val;
          byPic[pic].count++;
        }
      }
    });

    return { totalAchievement: total, totalClosedCount: closedCount, picAchievements: byPic };
  }, [deals, modalFY]);

  if (!isOpen) return null;

  const totalProgress = calculateProgress(totalAchievement, totalTarget);
  const totalColor = getProgressColor(totalProgress);

  // Combine PIC targets, PIC achievements, and all Sales Engineers
  const allPics = Array.from(new Set([
    ...salesEngineers,
    ...Object.keys(picTargets),
    ...Object.keys(picAchievements)
  ])).sort((a, b) => a.localeCompare(b));

  const picProgressData = allPics.map(pic => {
    const target = picTargets[pic] || 0;
    const achievement = picAchievements[pic]?.value || 0;
    const count = picAchievements[pic]?.count || 0;
    const progress = calculateProgress(achievement, target);
    return { pic, target, achievement, count, progress };
  }).sort((a, b) => b.progress - a.progress);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: 800, background: "white", borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#323338", display: "flex", alignItems: "center", gap: 10 }}>
              <Target size={28} color="#0073ea" /> Target Achievement
            </h2>
            <div style={{ position: "relative" }}>
              <select 
                value={modalFY} 
                onChange={e => setModalFY(Number(e.target.value))}
                style={{ appearance: "none", padding: "6px 28px 6px 12px", background: "#f0f7ff", border: "1px solid #d0e3ff", borderRadius: 8, fontSize: 12, fontWeight: 800, color: "#0073ea", cursor: "pointer", outline: "none" }}
              >
                {fyOptions.map(fy => (
                  <option key={fy} value={fy}>FY{fy} {fy === currentFY ? "(Current)" : ""}</option>
                ))}
              </select>
              <ChevronDown size={12} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#0073ea" }} />
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#f5f6f8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} color="#676879" />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#676879" }}>Loading targets...</div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 32, paddingRight: 8 }}>
            
            {/* OVERALL TARGET CARD */}
            <div style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)", borderRadius: 16, padding: 24, border: "1px solid #e0efff", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0073ea", marginBottom: 8 }}>Sales</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: "#323338" }}>{formatRp(totalAchievement)}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#676879" }}>/ {formatRp(totalTarget)}</span>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#676879", marginTop: 6 }}>{totalClosedCount} projects closed in FY{modalFY}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: totalColor }}>{totalProgress}%</span>
                </div>
              </div>

              <div style={{ width: "100%", height: 12, background: "#e8e8e8", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(totalProgress, 100)}%`, height: "100%", background: totalColor, transition: "width 1s ease-out", borderRadius: 6 }} />
              </div>
            </div>

            {/* PIC TARGETS */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#323338", marginBottom: 16 }}>Sales Leaderboard</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {picProgressData.map((data, index) => {
                  const color = getProgressColor(data.progress);
                  const isTop = index === 0 && data.progress > 0;
                  
                  return (
                    <div key={data.pic} style={{ background: "#f8f9fb", borderRadius: 12, padding: 16, border: "1px solid #e8e8e8", display: "flex", alignItems: "center", gap: 20 }}>
                      
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: isTop ? "#fff9e6" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isTop ? <Trophy size={20} color="#ffcb00" /> : <span style={{ fontSize: 14, fontWeight: 800, color: "#999" }}>{index + 1}</span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#323338" }}>{data.pic}</span>
                          <span style={{ fontSize: 16, fontWeight: 900, color: color }}>{data.progress}%</span>
                        </div>
                        
                        <div style={{ width: "100%", height: 8, background: "#e8e8e8", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                          <div style={{ width: `${Math.min(data.progress, 100)}%`, height: "100%", background: color, borderRadius: 4 }} />
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, color: "#676879" }}>
                          <span>Closed: <span style={{ color: "#323338" }}>{formatRp(data.achievement)}</span> ({data.count} projects)</span>
                          <span>Target: {formatRp(data.target)}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}

                {picProgressData.length === 0 && (
                  <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: "#999", fontStyle: "italic", background: "#f8f9fb", borderRadius: 12, border: "1px solid #e8e8e8" }}>
                    No sales data available.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

