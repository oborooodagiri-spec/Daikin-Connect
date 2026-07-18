import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Building2, Calendar } from "lucide-react";

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

export default function PresentationModal({ state, onClose, formatRp, STATUS_CONFIG }: Props) {
  const [search, setSearch] = useState("");

  if (!state) return null;

  const totalQuotation = state.data.reduce((acc, curr) => acc + (Number(curr.quotation) || 0), 0);
  
  
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();

  const getCategory = (d: any) => {
    const dTime = new Date(d.updated_at || d.created_at).getTime();
    if (dTime >= thisMonthStart) return "Bulan Ini";
    if (dTime >= lastMonthStart && dTime <= lastMonthEnd) return "Bulan Lalu";
    return "Bulan Lainnya (FY Berjalan)";
  };

  const groupedData = filteredData.reduce((acc, d) => {
    const cat = getCategory(d);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(d);
    return acc;
  }, {} as Record<string, any[]>);
  
  const categoryOrder = ["Bulan Ini", "Bulan Lalu", "Bulan Lainnya (FY Berjalan)"];

  const filteredData = state.data.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    return d.client_name?.toLowerCase().includes(s) || 
           d.project_name?.toLowerCase().includes(s) || 
           d.pic?.toLowerCase().includes(s);
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(10, 22, 40, 0.95)",
          backdropFilter: "blur(12px)",
          zIndex: 9999,
          display: "flex", flexDirection: "column",
          color: "white"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "32px 48px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          background: `linear-gradient(90deg, ${state.color}15 0%, transparent 100%)`
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              {state.icon && <div style={{ color: state.color }}>{state.icon}</div>}
              <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                {state.title}
              </h1>
            </div>
            {state.subtitle && <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", margin: 0 }}>{state.subtitle}</p>}
          </div>

          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%",
            width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "white", transition: "background 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            <X size={24} />
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ padding: "0 48px", marginTop: -24, display: "flex", gap: 24 }}>
          <div style={{ background: "#111b2b", border: "1px solid rgba(255,255,255,0.1)", padding: 24, borderRadius: 16, flex: 1, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Total Projects</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: "white", margin: 0 }}>{state.data.length}</p>
          </div>
          <div style={{ background: "#111b2b", border: "1px solid rgba(255,255,255,0.1)", padding: 24, borderRadius: 16, flex: 2, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Total Quotation Value</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: state.color, margin: 0 }}>{formatRp(totalQuotation)}</p>
          </div>
          <div style={{ background: "#111b2b", border: "1px solid rgba(255,255,255,0.1)", padding: 24, borderRadius: 16, flex: 2, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", position: "relative" }}>
             <Search size={20} color="rgba(255,255,255,0.5)" style={{ position: "absolute", left: 40, top: "50%", transform: "translateY(-50%)" }} />
             <input 
               type="text" 
               placeholder="Search projects or clients..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               style={{ 
                 width: "100%", height: "100%", background: "transparent", border: "none", 
                 color: "white", fontSize: 18, fontWeight: 600, paddingLeft: 48, outline: "none" 
               }} 
             />
          </div>
        </div>

        {/* Data Grid */}
        <div style={{ flex: 1, padding: "32px 48px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#111b2b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ overflowY: "auto", flex: 1 }} className="scrollbar-hide">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ position: "sticky", top: 0, background: "#0a121e", zIndex: 10 }}>
                  <tr>
                    {["Project & Client", "Sector & Category", "Status", "PIC", "Target PO", "Quotation Value"].map(th => (
                      <th key={th} style={{ padding: "20px 24px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>{th}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categoryOrder.map(cat => {
    const items = groupedData[cat];
    if (!items || items.length === 0) return null;
    return (
      <React.Fragment key={cat}>
        <tr>
          <td colSpan={6} style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {cat} ({items.length} Projects)
          </td>
        </tr>
        {items.map((d, i) => {
          const cfg = STATUS_CONFIG[d.status] || { label: d.status, color: "#888" };
          const isOverdue = d.target_po_date && new Date(d.target_po_date) < new Date() && !["A", "L", "S", "N"].includes(d.status);
          return (
            <motion.tr 
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: isOverdue ? "rgba(239,68,68,0.1)" : "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = isOverdue ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = isOverdue ? "rgba(239,68,68,0.1)" : "transparent"}
            >
              <td style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: "white", margin: "0 0 4px 0" }}>{d.project_name}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <Building2 size={12} /> {d.client_name} {d.area ? `- ${d.area}` : ""}
                </p>
              </td>
              <td style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: "0 0 4px 0" }}>{d.sector}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>{d.category}</p>
              </td>
              <td style={{ padding: "20px 24px" }}>
                <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, background: `${cfg.color}20`, color: cfg.color }}>
                  {cfg.label}
                </span>
              </td>
              <td style={{ padding: "20px 24px", fontSize: 14, fontWeight: 700, color: "white" }}>
                {d.pic || "-"}
              </td>
              <td style={{ padding: "20px 24px" }}>
                {d.target_po_date ? (
                  <span style={{ fontSize: 14, fontWeight: 700, color: isOverdue ? "#ef4444" : "white", display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={14} /> 
                    {new Date(d.target_po_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    {isOverdue && <span style={{ fontSize: 10, background: "#ef4444", color: "white", padding: "2px 6px", borderRadius: 4, marginLeft: 4 }}>OVERDUE</span>}
                  </span>
                ) : <span style={{ color: "rgba(255,255,255,0.3)" }}>-</span>}
              </td>
              <td style={{ padding: "20px 24px", fontSize: 16, fontWeight: 900, color: "white" }}>
                {formatRp(Number(d.quotation) || 0)}
              </td>
            </motion.tr>
          );
        })}
      </React.Fragment>
    );
  })}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 60, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>No matching records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
