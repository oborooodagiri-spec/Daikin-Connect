"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Building2, Calendar, ChevronDown, ChevronUp } from "lucide-react";

export interface PresentationState {
  title: string;
  subtitle?: string;
  data: any[];
  color: string;
  icon?: any;
}

interface Props {
  state: PresentationState | null;
  onClose: () => void;
  formatRp: (val: number) => string;
  STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }>;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function PresentationModal({ state, onClose, formatRp, STATUS_CONFIG }: Props) {
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // ALL hooks MUST be called before any conditional return
  const data = state?.data || [];

  const filteredData = useMemo(() => {
    return data.filter((d: any) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return d.client_name?.toLowerCase().includes(s) ||
             d.project_name?.toLowerCase().includes(s) ||
             d.pic?.toLowerCase().includes(s) ||
             d.sector?.toLowerCase().includes(s) ||
             d.category?.toLowerCase().includes(s);
    });
  }, [data, search]);

  const totalQuotation = useMemo(() => {
    return filteredData.reduce((acc: number, curr: any) => acc + (Number(curr.quotation) || 0), 0);
  }, [filteredData]);

  const statusSummary = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    filteredData.forEach((d: any) => {
      const s = d.status || "?";
      if (!map[s]) map[s] = { count: 0, value: 0 };
      map[s].count++;
      map[s].value += (Number(d.quotation) || 0);
    });
    return Object.entries(map).sort(([, a], [, b]) => b.value - a.value);
  }, [filteredData]);

  const monthlyGroups = useMemo(() => {
    const groups: Record<string, { deals: any[]; totalValue: number; label: string }> = {};
    filteredData.forEach((d: any) => {
      const date = new Date(d.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
      const label = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
      if (!groups[key]) groups[key] = { deals: [], totalValue: 0, label };
      groups[key].deals.push(d);
      groups[key].totalValue += (Number(d.quotation) || 0);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, val]) => ({ key, label: val.label, deals: val.deals, totalValue: val.totalValue }));
  }, [filteredData]);

  const picSummary = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    filteredData.forEach((d: any) => {
      const pic = d.pic || "Unassigned";
      if (!map[pic]) map[pic] = { count: 0, value: 0 };
      map[pic].count++;
      map[pic].value += (Number(d.quotation) || 0);
    });
    return Object.entries(map).sort(([, a], [, b]) => b.value - a.value);
  }, [filteredData]);

  const overdueCount = useMemo(() => {
    return filteredData.filter((d: any) =>
      d.target_po_date && new Date(d.target_po_date) < new Date() && !["A", "L", "S", "N"].includes(d.status)
    ).length;
  }, [filteredData]);

  // NOW we can do the conditional return
  if (!state) return null;

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(245, 246, 248, 0.98)",
          backdropFilter: "blur(16px)",
          zIndex: 9999,
          display: "flex", flexDirection: "column",
          color: "#323338",
          overflow: "hidden"
        }}
      >
        {/* HEADER */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{
            padding: "28px 48px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: "1px solid #e8e8e8",
            background: `linear-gradient(90deg, ${state.color}18 0%, transparent 60%)`,
            flexShrink: 0
          }}
        >
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
              <span style={{ color: state.color }}>●</span>&nbsp; {state.title}
            </h1>
            {state.subtitle && <p style={{ fontSize: 14, color: "#676879", margin: "4px 0 0 0" }}>{state.subtitle}</p>}
          </div>
          <button onClick={onClose} style={{
            background: "white", border: "1px solid #e8e8e8", borderRadius: 12,
            width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#323338", transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
          >
            <X size={20} />
          </button>
        </motion.div>

        {/* SUMMARY STRIP */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ padding: "20px 48px", display: "flex", gap: 16, flexShrink: 0, flexWrap: "wrap" }}
        >
          {[
            { label: "Total Projects", value: String(filteredData.length), accent: state.color },
            { label: "Total Value", value: formatRp(totalQuotation), accent: "#00c875" },
            { label: "Avg per Project", value: filteredData.length > 0 ? formatRp(Math.round(totalQuotation / filteredData.length)) : "Rp 0", accent: "#0073ea" },
            { label: "Overdue", value: String(overdueCount), accent: overdueCount > 0 ? "#ef4444" : "#10b981" },
            { label: "PIC Terlibat", value: String(picSummary.length), accent: "#7b2cbf" },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.06, duration: 0.3 }}
              style={{
                background: "white", border: "1px solid #e8e8e8",
                padding: "16px 24px", borderRadius: 14, flex: 1, minWidth: 140
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#676879", margin: "0 0 6px 0" }}>{card.label}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: card.accent, margin: 0 }}>{card.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* STATUS BREAKDOWN BAR */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ padding: "0 48px 16px", display: "flex", gap: 6, flexShrink: 0, transformOrigin: "left" }}
        >
          {statusSummary.map(([status, sdata]) => {
            const cfg = STATUS_CONFIG[status] || { label: status, color: "#888" };
            const pct = totalQuotation > 0 ? (sdata.value / totalQuotation * 100) : 0;
            return (
              <div key={status} title={`${cfg.label}: ${formatRp(sdata.value)} (${sdata.count} projects)`}
                style={{ flex: pct, height: 6, background: cfg.color, borderRadius: 3, minWidth: pct > 0 ? 4 : 0, transition: "all 0.5s" }} />
            );
          })}
        </motion.div>

        {/* SEARCH + STATUS TAGS */}
        <div style={{ padding: "0 48px 16px", display: "flex", gap: 16, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <Search size={16} color="#676879" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Cari project, client, PIC, sector..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", height: 42, paddingLeft: 40, paddingRight: 16,
                background: "white", border: "1px solid #e8e8e8",
                borderRadius: 10, color: "#323338", fontSize: 13, fontWeight: 600, outline: "none"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {statusSummary.slice(0, 6).map(([status, sdata]) => {
              const cfg = STATUS_CONFIG[status] || { label: status, color: "#888" };
              return (
                <span key={status} style={{
                  padding: "5px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800,
                  background: `${cfg.color}20`, color: cfg.color, whiteSpace: "nowrap"
                }}>
                  {cfg.label}: {sdata.count} ({formatRp(sdata.value)})
                </span>
              );
            })}
          </div>
        </div>

        {/* MONTHLY GROUPS */}
        <div style={{ flex: 1, padding: "0 48px 32px", overflow: "auto" }} className="scrollbar-hide">
          {monthlyGroups.length === 0 && (
            <div style={{ padding: 80, textAlign: "center", color: "#676879", fontSize: 16, fontWeight: 700 }}>
              Tidak ada data ditemukan
            </div>
          )}
          {monthlyGroups.map((group, gi) => {
            const isExpanded = expandedGroups[group.key] !== false;
            return (
              <motion.div
                key={group.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05, duration: 0.3 }}
                style={{ marginBottom: 16 }}
              >
                {/* Month Header */}
                <div
                  onClick={() => toggleGroup(group.key)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 24px", cursor: "pointer", userSelect: "none",
                    background: "white", borderRadius: isExpanded ? "14px 14px 0 0" : 14,
                    border: "1px solid #e8e8e8",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${state.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Calendar size={18} color={state.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 900, color: "#323338", margin: 0, textTransform: "uppercase", letterSpacing: "0.03em" }}>{group.label}</p>
                      <p style={{ fontSize: 11, color: "#676879", margin: "2px 0 0 0" }}>
                        {group.deals.length} projects
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: state.color }}>{formatRp(group.totalValue)}</span>
                    {isExpanded ? <ChevronUp size={18} color="#676879" /> : <ChevronDown size={18} color="#676879" />}
                  </div>
                </div>

                {/* Month Content */}
                {isExpanded && (
                  <div style={{ overflow: "hidden", background: "white", border: "1px solid #e8e8e8", borderTop: "none", borderRadius: "0 0 14px 14px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e8e8e8" }}>
                          {["Project & Client", "Sector & Category", "Status", "PIC", "Target PO", "Value"].map(th => (
                            <th key={th} style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#676879" }}>{th}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {group.deals.map((d: any, i: number) => {
                          const cfg = STATUS_CONFIG[d.status] || { label: d.status, color: "#888" };
                          const isOverdue = d.target_po_date && new Date(d.target_po_date) < new Date() && !["A", "L", "S", "N"].includes(d.status);
                          return (
                            <tr
                              key={d.id || i}
                              style={{
                                borderBottom: "1px solid #e8e8e8",
                                background: isOverdue ? "rgba(239,68,68,0.08)" : "transparent",
                                transition: "background 0.15s"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = isOverdue ? "rgba(239,68,68,0.14)" : "#f8fafc"}
                              onMouseLeave={(e) => e.currentTarget.style.background = isOverdue ? "rgba(239,68,68,0.08)" : "transparent"}
                            >
                              <td style={{ padding: "16px 20px", maxWidth: 300 }}>
                                <p style={{ fontSize: 14, fontWeight: 800, color: "#323338", margin: "0 0 3px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.project_name}</p>
                                <p style={{ fontSize: 12, color: "#676879", margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
                                  <Building2 size={11} /> {d.client_name} {d.area ? `– ${d.area}` : ""}
                                </p>
                              </td>
                              <td style={{ padding: "16px 20px" }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#323338", margin: "0 0 2px 0" }}>{d.sector || "-"}</p>
                                <p style={{ fontSize: 11, color: "#676879", margin: 0 }}>{d.category || "-"}</p>
                              </td>
                              <td style={{ padding: "16px 20px" }}>
                                <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 800, background: `${cfg.color}20`, color: cfg.color }}>
                                  {cfg.label}
                                </span>
                              </td>
                              <td style={{ padding: "16px 20px", fontSize: 13, fontWeight: 700, color: "#323338" }}>
                                {d.pic || "-"}
                              </td>
                              <td style={{ padding: "16px 20px" }}>
                                {d.target_po_date ? (
                                  <span style={{ fontSize: 12, fontWeight: 700, color: isOverdue ? "#ef4444" : "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 5 }}>
                                    <Calendar size={12} />
                                    {new Date(d.target_po_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                    {isOverdue && <span style={{ fontSize: 9, background: "#ef4444", color: "#323338", padding: "2px 5px", borderRadius: 3, marginLeft: 3, fontWeight: 900 }}>OVERDUE</span>}
                                  </span>
                                ) : <span style={{ color: "#94a3b8", fontSize: 12 }}>–</span>}
                              </td>
                              <td style={{ padding: "16px 20px", fontSize: 15, fontWeight: 900, color: "#323338", fontVariantNumeric: "tabular-nums" }}>
                                {formatRp(Number(d.quotation) || 0)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* PIC SUMMARY */}
          {picSummary.length > 0 && (
            <div style={{
              marginTop: 8, padding: 24,
              background: "white", border: "1px solid #e8e8e8",
              borderRadius: 14
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#676879", margin: "0 0 16px 0" }}>
                Kontribusi per PIC
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {picSummary.map(([pic, pdata], idx) => {
                  const maxVal = Math.max(...picSummary.map(([, d]) => d.value), 1);
                  const pct = (pdata.value / maxVal) * 100;
                  return (
                    <div key={pic} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 100, fontSize: 12, fontWeight: 800, color: "#323338", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pic}</span>
                      <div style={{ flex: 1, height: 24, background: "white", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: state.color, borderRadius: 6, opacity: 0.7, transition: "width 0.8s ease" }} />
                        <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 800, color: "#676879" }}>
                          {pdata.count} projects · {formatRp(pdata.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
