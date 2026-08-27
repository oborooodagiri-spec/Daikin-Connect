import React, { useState, useEffect, useMemo } from "react";
import { X, Target, Trophy, TrendingUp, ChevronDown, Handshake } from "lucide-react";
import { getTargetSettings, getSalesEngineers, getPartnershipPICs } from "@/app/actions/pipeline";

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
  const [partnershipPICs, setPartnershipPICs] = useState<string[]>([]);
  const [modalFY, setModalFY] = useState(currentFY);
  const [activeTab, setActiveTab] = useState<"sales" | "partner" | "backlog">("sales");
  const [expandedBacklogPic, setExpandedBacklogPic] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setModalFY(currentFY);
      loadTargets();
    }
  }, [isOpen]);

  const loadTargets = async () => {
    setLoading(true);
    const [targetRes, seRes, picRes] = await Promise.all([
      getTargetSettings(),
      getSalesEngineers(),
      getPartnershipPICs()
    ]);
    setTotalTarget(targetRes?.total || 0);
    const rawTargets = targetRes?.byPic || {};
    const normalizedTargets: Record<string, number> = {};
    for (const k in rawTargets) {
      normalizedTargets[k.trim().toUpperCase()] = rawTargets[k];
    }
    setPicTargets(normalizedTargets);

    if (seRes?.success) {
      setSalesEngineers((seRes.data || []).map((u: any) => u.name.trim().toUpperCase()));
    }
    if (picRes) setPartnershipPICs(picRes.map((p: string) => p.trim().toUpperCase()));
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
  const { totalAchievement, totalClosedCount, picAchievements, partnerAchievements, backlogByPic, backlogByPartner } = useMemo(() => {
    let total = 0;
    let closedCount = 0;
    const byPic: Record<string, { value: number; count: number }> = {};
    const byPartner: Record<string, { value: number; count: number }> = {};
    const backlogByPic: Record<string, { 
      legacyValue: number; 
      currentValue: number; 
      legacyProjects: any[]; 
      currentProjects: any[] 
    }> = {};
    const backlogByPartner: Record<string, { value: number; count: number }> = {};

    // FY date range: April 1 of FY year to March 31 of FY+1 year
    const fyStartYear = 2000 + modalFY;
    const fyStart = new Date(fyStartYear, 3, 1).getTime(); // April 1
    const fyEnd = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999).getTime(); // March 31

    deals.forEach(d => {
      const pic = (d.pic || "Unassigned").trim().toUpperCase();
      const salesPlanners = d.sales_planner ? String(d.sales_planner).split(",").map(s => s.trim().toUpperCase()).filter(s => s) : [];
      const val = Number(d.quotation) || 0;

      if (d.is_closed) {
        const updatedAt = new Date(d.updated_at).getTime();
        if (updatedAt >= fyStart && updatedAt <= fyEnd) {
          total += val;
          closedCount++;
          
          if (!byPic[pic]) byPic[pic] = { value: 0, count: 0 };
          byPic[pic].value += val;
          byPic[pic].count++;

          // Credit the main PIC if they are a Partnership PIC
          if (partnershipPICs.includes(pic)) {
            if (!byPartner[pic]) byPartner[pic] = { value: 0, count: 0 };
            byPartner[pic].value += val;
            byPartner[pic].count++;
          }

          // Credit ALL sales_planners (assisting partners) regardless of 'source'
          salesPlanners.forEach(sp => {
            if (sp !== pic) {
              if (!byPartner[sp]) byPartner[sp] = { value: 0, count: 0 };
              byPartner[sp].value += val;
              byPartner[sp].count++;
            }
          });
        }
      } else if (d.status === "A") {
        // BACKLOG: Status A and not closed
        if (!backlogByPic[pic]) {
          backlogByPic[pic] = { legacyValue: 0, currentValue: 0, legacyProjects: [], currentProjects: [] };
        }
        
        const poDate = d.target_po_date || d.est_booking_month || d.updated_at;
        const poTime = new Date(poDate).getTime();
        
        let poFY = new Date(poDate).getFullYear() % 100;
        if (new Date(poDate).getMonth() < 3) poFY -= 1;
        
        if (poTime < fyStart) {
          backlogByPic[pic].legacyValue += val;
          backlogByPic[pic].legacyProjects.push({ name: d.project_name, value: val, date: poDate, fy: poFY });
        } else {
          backlogByPic[pic].currentValue += val;
          backlogByPic[pic].currentProjects.push({ name: d.project_name, value: val, date: poDate, fy: poFY });
        }

        // Also track Backlog for Partners
        if (partnershipPICs.includes(pic)) {
          if (!backlogByPartner[pic]) backlogByPartner[pic] = { value: 0, count: 0 };
          backlogByPartner[pic].value += val;
          backlogByPartner[pic].count++;
        }
        if (salesPlanner !== "" && salesPlanner !== pic) {
          if (!backlogByPartner[salesPlanner]) backlogByPartner[salesPlanner] = { value: 0, count: 0 };
          backlogByPartner[salesPlanner].value += val;
          backlogByPartner[salesPlanner].count++;
        }
      }
    });

    return { totalAchievement: total, totalClosedCount: closedCount, picAchievements: byPic, partnerAchievements: byPartner, backlogByPic, backlogByPartner };
  }, [deals, modalFY, partnershipPICs]);

  if (!isOpen) return null;

  const totalProgress = calculateProgress(totalAchievement, totalTarget);
  const totalColor = getProgressColor(totalProgress);

  // Combine PIC targets, PIC achievements, and all Sales Engineers
  const allPics = Array.from(new Set([
    ...salesEngineers,
    ...Object.keys(picTargets),
    ...Object.keys(picAchievements)
  ]))
  .filter(pic => !partnershipPICs.includes(pic))
  .sort((a, b) => a.localeCompare(b));

  const picProgressData = allPics.map(pic => {
    const target = picTargets[pic] || 0;
    const achievement = picAchievements[pic]?.value || 0;
    const count = picAchievements[pic]?.count || 0;
    const progress = calculateProgress(achievement, target);
    
    const backlog = backlogByPic[pic] || { legacyValue: 0, currentValue: 0, legacyProjects: [], currentProjects: [] };
    const totalBacklog = backlog.legacyValue + backlog.currentValue;
    const backlogCoverage = target > 0 ? ((totalBacklog / target) * 100).toFixed(1) : "0.0";
    
    return { pic, target, achievement, count, progress, backlog, totalBacklog, backlogCoverage };
  }).sort((a, b) => b.progress - a.progress);

  const partnerProgressData = Array.from(new Set([
    ...partnershipPICs,
    ...Object.keys(partnerAchievements),
    ...Object.keys(backlogByPartner)
  ])).map(partner => {
    const achievement = partnerAchievements[partner]?.value || 0;
    const count = partnerAchievements[partner]?.count || 0;
    const backlogValue = backlogByPartner[partner]?.value || 0;
    const backlogCount = backlogByPartner[partner]?.count || 0;
    
    // Total contribution is closed + backlog
    const totalValue = achievement + backlogValue;
    const totalCount = count + backlogCount;

    return { partner, achievement, count, backlogValue, backlogCount, totalValue, totalCount };
  }).sort((a, b) => b.totalValue - a.totalValue);

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

            {/* TABS */}
            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <button 
                onClick={() => setActiveTab("sales")}
                style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", border: "none", background: activeTab === "sales" ? "#323338" : "#f5f6f8", color: activeTab === "sales" ? "white" : "#676879", transition: "all 0.2s" }}
              >
                Sales Leaderboard
              </button>
              <button 
                onClick={() => setActiveTab("partner")}
                style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", border: "none", background: activeTab === "partner" ? "#0073ea" : "#f5f6f8", color: activeTab === "partner" ? "white" : "#676879", transition: "all 0.2s" }}
              >
                Partner Relation
              </button>
              <button 
                onClick={() => setActiveTab("backlog")}
                style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", border: "none", background: activeTab === "backlog" ? "#ffcb00" : "#f5f6f8", color: activeTab === "backlog" ? "#323338" : "#676879", transition: "all 0.2s" }}
              >
                Backlog Review
              </button>
            </div>

            {/* SALES LEADERBOARD */}
            {activeTab === "sales" && (
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
                            <div style={{ display: "flex", gap: 12 }}>
                              <span>Closed: <span style={{ color: "#10b981" }}>{formatRp(data.achievement)}</span> ({data.count} projects)</span>
                              <span>Backlog: <span style={{ color: "#0ea5e9" }}>{formatRp(data.totalBacklog)}</span></span>
                              <span style={{ color: "#f59e0b" }}>Total: <span style={{ fontWeight: 800 }}>{formatRp(data.achievement + data.totalBacklog)}</span></span>
                            </div>
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
            )}

            {/* PARTNER RELATION */}
            {activeTab === "partner" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0073ea", marginBottom: 16 }}>Partnership Contribution</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {partnerProgressData.map((data, index) => {
                    const isTop = index === 0 && data.totalValue > 0;
                    
                    return (
                      <div key={data.partner} style={{ background: "#f0f7ff", borderRadius: 12, padding: 16, border: "1px solid #d0e3ff", display: "flex", alignItems: "center", gap: 20 }}>
                        
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: isTop ? "#0073ea" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: isTop ? "none" : "1px solid #d0e3ff" }}>
                          {isTop ? <Handshake size={20} color="#fff" /> : <Handshake size={20} color="#0073ea" />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#0073ea" }}>{data.partner}</span>
                          </div>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#676879" }}>Closed ({data.count}): <span style={{ color: "#323338", fontWeight: 800 }}>{formatRp(data.achievement)}</span></span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#676879" }}>Backlog ({data.backlogCount}): <span style={{ color: "#323338", fontWeight: 800 }}>{formatRp(data.backlogValue)}</span></span>
                            </div>
                            <div style={{ textAlign: "right", display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: "#676879", textTransform: "uppercase" }}>Total Progress</span>
                              <span style={{ fontSize: 16, fontWeight: 900, color: "#323338" }}>{formatRp(data.totalValue)}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {partnerProgressData.length === 0 && (
                    <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: "#999", fontStyle: "italic", background: "#f8f9fb", borderRadius: 12, border: "1px solid #e8e8e8" }}>
                      No partnership contribution data available.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BACKLOG REVIEW */}
            {activeTab === "backlog" && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#323338", marginBottom: 16 }}>Backlog Pipeline (Status A)</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {picProgressData.map((data) => {
                    const hasBacklog = data.totalBacklog > 0;
                    if (!hasBacklog) return null;
                    
                    const isExpanded = expandedBacklogPic === data.pic;
                    
                    return (
                      <div key={data.pic} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", overflow: "hidden" }}>
                        <div 
                          onClick={() => setExpandedBacklogPic(isExpanded ? null : data.pic)}
                          style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, cursor: "pointer", background: isExpanded ? "#f8f9fb" : "transparent" }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 800, color: "#323338" }}>{data.pic}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 16, fontWeight: 900, color: "#ffcb00" }}>{formatRp(data.totalBacklog)}</span>
                                <ChevronDown size={16} style={{ color: "#999", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 12, fontSize: 11, fontWeight: 600 }}>
                              <span style={{ color: "#e2445c" }}>Backlog: {formatRp(data.backlog.legacyValue)}</span>
                              <span style={{ color: "#00c875" }}>Current: {formatRp(data.backlog.currentValue)}</span>
                              <span style={{ color: "#676879", marginLeft: "auto" }}>Covers {data.backlogCoverage}% of target</span>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ padding: "0 16px 16px 16px", borderTop: "1px solid #e8e8e8", background: "#fcfdfd" }}>
                            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                              {data.backlog.legacyProjects.map((p: any, i: number) => (
                                <div key={`legacy-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #ffe8eb" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", background: "#e2445c", color: "white", borderRadius: 4 }}>FY{p.fy}</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#323338" }}>{p.name}</span>
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 800, color: "#e2445c" }}>{formatRp(p.value)}</span>
                                </div>
                              ))}
                              
                              {data.backlog.currentProjects.map((p: any, i: number) => (
                                <div key={`current-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #e0efff" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", background: "#00c875", color: "white", borderRadius: 4 }}>FY{modalFY}</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#323338" }}>{p.name}</span>
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 800, color: "#00c875" }}>{formatRp(p.value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!picProgressData.some(d => d.totalBacklog > 0) && (
                    <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: "#999", fontStyle: "italic", background: "#f8f9fb", borderRadius: 12, border: "1px solid #e8e8e8" }}>
                      No active backlog (Status A) found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

