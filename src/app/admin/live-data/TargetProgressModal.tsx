import React, { useState, useEffect, useMemo } from "react";
import { X, Target, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { getTargetSettings } from "@/app/actions/pipeline";

interface TargetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatRp: (val: number) => string;
  deals: any[];
}

export default function TargetProgressModal({ isOpen, onClose, formatRp, deals }: TargetProgressModalProps) {
  const [totalTarget, setTotalTarget] = useState<number>(0);
  const [picTargets, setPicTargets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTargets();
    }
  }, [isOpen]);

  const loadTargets = async () => {
    setLoading(true);
    const res = await getTargetSettings();
    setTotalTarget(res?.total || 0);
    setPicTargets(res?.byPic || {});
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

  const { totalAchievement, picAchievements } = useMemo(() => {
    let total = 0;
    const byPic: Record<string, number> = {};

    deals.forEach(d => {
      if (d.is_closed) {
        const val = Number(d.quotation) || 0;
        total += val;
        
        const pic = d.pic || "Unassigned";
        byPic[pic] = (byPic[pic] || 0) + val;
      }
    });

    return { totalAchievement: total, picAchievements: byPic };
  }, [deals]);

  if (!isOpen) return null;

  const totalProgress = calculateProgress(totalAchievement, totalTarget);
  const totalColor = getProgressColor(totalProgress);

  // Combine PIC targets and PIC achievements
  const allPics = Array.from(new Set([
    ...Object.keys(picTargets),
    ...Object.keys(picAchievements)
  ])).sort((a, b) => a.localeCompare(b));

  const picProgressData = allPics.map(pic => {
    const target = picTargets[pic] || 0;
    const achievement = picAchievements[pic] || 0;
    const progress = calculateProgress(achievement, target);
    return { pic, target, achievement, progress };
  }).sort((a, b) => b.progress - a.progress); // Sort by progress descending

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: 800, background: "white", borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#323338", display: "flex", alignItems: "center", gap: 10 }}>
              <Target size={28} color="#0073ea" /> Target Achievement
            </h2>
            <p style={{ fontSize: 13, color: "#676879", marginTop: 4 }}>Track individual sales performance based on closed projects.</p>
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
                  <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0073ea", marginBottom: 8 }}>Overall Performance (Closed)</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: "#323338" }}>{formatRp(totalAchievement)}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#676879" }}>/ {formatRp(totalTarget)}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: totalColor }}>{totalProgress}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: "100%", height: 12, background: "#e8e8e8", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(totalProgress, 100)}%`, height: "100%", background: totalColor, transition: "width 1s ease-out", borderRadius: 6 }} />
              </div>
            </div>

            {/* PIC TARGETS */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#323338", marginBottom: 16 }}>PIC Achievement Leaderboard</h3>
              
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
                          <span>Closed Achieved: <span style={{ color: "#323338" }}>{formatRp(data.achievement)}</span></span>
                          <span>Target: {formatRp(data.target)}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}

                {picProgressData.length === 0 && (
                  <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: "#999", fontStyle: "italic", background: "#f8f9fb", borderRadius: 12, border: "1px solid #e8e8e8" }}>
                    No PIC data available.
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
