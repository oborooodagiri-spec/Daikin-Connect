"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, ChevronRight, ChevronDown } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

interface Deal {
  id: number;
  quotation: number | bigint;
  status: string;
  est_booking_month?: string;
  target_po_date?: string;
  booking_fc?: string;
  region?: string;
  pic?: string;
  source: string;
  category?: string;
  project_name: string;
  client_name?: string;
  bill_material?: string;
}

interface BookingForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  initialFY?: number;
}

interface TreeNode {
  id: string;
  name: string;
  subtitle?: string;
  level: number;
  values: Record<string, number>;
  total: number;
  children: Record<string, TreeNode>;
}

export default function BookingForecastModal({ isOpen, onClose, deals, initialFY = 26 }: BookingForecastModalProps) {
  
  const [selectedFY, setSelectedFY] = useState(initialFY);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setSelectedFY(initialFY);
      setExpandedNodes({}); // collapse all on open
    }
  }, [isOpen, initialFY]);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { columns, tree, totals, grandTotal, chartData } = useMemo(() => {
    const year = 2000 + selectedFY;
    const columns: { key: string; label: string }[] = [];
    const colSet = new Set<string>();
    
    for (let i = 0; i < 12; i++) {
      const d = new Date(year, 3 + i, 1);
      const mYear = d.getFullYear();
      const mStr = d.toLocaleString('default', { month: 'short' });
      const key = `${mYear}-${String(d.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
      columns.push({ key, label: `${mStr} ${mYear}` });
      colSet.add(key);
    }

    const root: TreeNode = {
      id: "root",
      name: "Root",
      level: 0,
      values: {},
      total: 0,
      children: {}
    };

    const addValueToNode = (node: TreeNode, colKey: string, val: number) => {
      node.values[colKey] = (node.values[colKey] || 0) + val;
      node.total += val;
    };

    deals.forEach(d => {
      // Include Status B
      if (d.status !== 'B') return;
      
      // Use target_po_date (Est Booking Month from Excel) for date bucketing
      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return;
      const dt = new Date(rawDate);
      if (isNaN(dt.getTime())) return;

      const mYear = dt.getFullYear();
      const mStr = dt.toLocaleString('default', { month: 'short' });
      const sortKey = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
      
      if (!colSet.has(sortKey)) return; 
      
      const val = Number(d.quotation || 0);

      // Hierarchy: Region > PIC > Project Name
      const path = [
        { key: d.region || "Uncategorized Region", name: d.region || "Uncategorized Region" },
        { key: d.pic || "Unassigned PIC", name: d.pic || "Unassigned PIC" },
        { key: d.category || "Uncategorized", name: d.category || "Uncategorized" },
        { key: d.id.toString(), 
          name: d.client_name || "Unknown Client", 
          subtitle: d.project_name || "" 
        }
      ];

      addValueToNode(root, sortKey, val);

      let current = root;
      let currentId = "root";

      path.forEach((partObj, idx) => {
        const { key, name, subtitle } = partObj;
        currentId += `|${key}`;
        if (!current.children[key]) {
          current.children[key] = {
            id: currentId,
            name: name,
            subtitle: subtitle,
            level: idx + 1,
            values: {},
            total: 0,
            children: {}
          };
        }
        current = current.children[key];
        addValueToNode(current, sortKey, val);
      });
    });

    const totals: Record<string, number> = {};
    columns.forEach(col => {
      totals[col.key] = root.values[col.key] || 0;
    });

    const chartData = columns.map(col => ({
      name: col.label,
      "Forecast Value": totals[col.key] || 0
    }));

    return { columns, tree: root, totals, grandTotal: root.total, chartData };
  }, [deals, selectedFY]);

  const formatRp = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const formatYAxis = (val: number) => {
    if (val >= 1e12) return `${(val / 1e12).toFixed(1)}T`;
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)}M`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(0)}Jt`;
    return val.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "white", padding: "12px", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "1px solid #f0f0f0" }}>
          <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>{label}</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: payload[0].color, fontWeight: 700 }}>Forecast</span>
            <span style={{ fontWeight: 800 }}>{formatRp(payload[0].value)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderTree = (nodes: Record<string, TreeNode>) => {
    return Object.values(nodes)
      .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
      .map(node => {
        const hasChildren = Object.keys(node.children).length > 0;
        const isExpanded = !!expandedNodes[node.id];
        const paddingLeft = node.level === 1 ? 8 : (node.level - 1) * 24 + 8;

        return (
          <React.Fragment key={node.id}>
            <tr style={{ background: node.level % 2 === 1 ? "#ffffff" : "#fafafa", borderBottom: "1px solid #f0f0f0", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseOut={(e) => e.currentTarget.style.background = node.level % 2 === 1 ? "#ffffff" : "#fafafa"}>
              <td style={{ position: "sticky", left: 0, zIndex: 10, background: node.level % 2 === 1 ? "#ffffff" : "#fafafa", padding: "10px 16px", fontSize: 13, fontWeight: node.level < 3 ? 800 : 700, color: node.level < 3 ? "#323338" : "#475569", borderRight: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", alignItems: "center", paddingLeft }}>
                  {hasChildren ? (
                    <button onClick={() => toggleNode(node.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, marginRight: 4, color: "#676879" }}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : (
                    <div style={{ width: 28 }} />
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: node.level === 3 ? 14 : 13, fontWeight: node.level === 3 ? 800 : (node.level < 3 ? 800 : 500), color: node.level === 3 ? "#1e293b" : "inherit" }}>
                      {node.name}
                    </span>
                    {node.subtitle && (
                      <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500 }}>
                        {node.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              {columns.map(col => (
                <td key={col.key} style={{ padding: "10px 16px", fontSize: 13, fontWeight: node.level < 4 ? 700 : 500, color: node.values[col.key] > 0 ? (node.level < 4 ? "#0f172a" : "#334155") : "#cbd5e1", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {formatRp(node.values[col.key] || 0)}
                </td>
              ))}
              <td style={{ position: "sticky", right: 0, zIndex: 10, padding: "10px 16px", fontSize: 13, fontWeight: 900, color: "#0f172a", textAlign: "right", background: "#f8fafc", fontVariantNumeric: "tabular-nums", borderLeft: "1px solid #cbd5e1" }}>
                {formatRp(node.total)}
              </td>
            </tr>
            {isExpanded && hasChildren && renderTree(node.children)}
          </React.Fragment>
        );
      });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "absolute", inset: 0, background: "rgba(10, 22, 40, 0.6)", backdropFilter: "blur(4px)" }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "1300px",
            maxHeight: "94vh",
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{ padding: "24px 32px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(to right, #ffffff, #f0f9ff)" }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#323338", display: "flex", alignItems: "center", gap: 12 }}>
                <TrendingUp size={24} color="#0ea5e9" />
                Booking Forecast Matrix
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <p style={{ fontSize: 13, color: "#676879", fontWeight: 500 }}>
                  Financial projection for FY
                </p>
                <select 
                  value={selectedFY} 
                  onChange={e => setSelectedFY(Number(e.target.value))}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #bae6fd", fontSize: 13, fontWeight: 700, color: "#0369a1", outline: "none", cursor: "pointer", background: "#e0f2fe" }}
                >
                  <option value={24}>FY 24</option>
                  <option value={25}>FY 25</option>
                  <option value={26}>FY 26</option>
                  <option value={27}>FY 27</option>
                  <option value={28}>FY 28</option>
                </select>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f4f4", border: "none", cursor: "pointer", transition: "all 0.2s" }}
            >
              <X size={18} color="#676879" />
            </button>
          </div>

          <div style={{ padding: "0 32px 32px 32px", overflow: "auto", display: "flex", flexDirection: "column", gap: 32 }}>
            
            {/* Infographic Chart */}
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", flex: "none", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 24, background: "#0ea5e9", borderRadius: 4 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Booking Forecast Trend</h3>
              </div>
              <div style={{ height: 300, width: "100%", background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9", padding: "24px 20px 0 0" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 30, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                      tickFormatter={formatYAxis}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: "4 4" }} />
                    <Area type="monotone" dataKey="Forecast Value" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" activeDot={{ r: 6, fill: "#0284c7" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pivot Table */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 24, background: "#6366f1", borderRadius: 4 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Forecast Matrix</h3>
              </div>
              
              <div style={{ flex: 1, borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
                  <thead>
                    <tr>
                      <th style={{ position: "sticky", top: 0, left: 0, zIndex: 30, padding: "16px", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 800, textTransform: "uppercase", textAlign: "left", borderBottom: "2px solid #cbd5e1", borderRight: "1px solid #cbd5e1" }}>
                        Row Labels
                      </th>
                      {columns.map(col => (
                        <th key={col.key} style={{ position: "sticky", top: 0, zIndex: 20, padding: "16px", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 800, textTransform: "uppercase", textAlign: "right", borderBottom: "2px solid #cbd5e1", minWidth: 120 }}>
                          {col.label}
                        </th>
                      ))}
                      <th style={{ position: "sticky", top: 0, right: 0, zIndex: 30, padding: "16px", background: "#f1f5f9", color: "#0f172a", fontSize: 12, fontWeight: 900, textTransform: "uppercase", textAlign: "right", borderBottom: "2px solid #94a3b8", borderLeft: "1px solid #94a3b8" }}>
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render tree recursively */}
                    {renderTree(tree.children)}
                    
                    {/* Grand Total Row */}
                    <tr style={{ position: "sticky", bottom: 0, zIndex: 25, background: "#e2e8f0" }}>
                      <td style={{ position: "sticky", left: 0, zIndex: 30, background: "#e2e8f0", padding: "16px", fontSize: 13, fontWeight: 900, color: "#0f172a", borderTop: "2px solid #cbd5e1", borderRight: "1px solid #cbd5e1" }}>
                        Grand Total
                      </td>
                      {columns.map(col => (
                        <td key={col.key} style={{ padding: "16px", fontSize: 13, fontWeight: 800, color: "#0f172a", textAlign: "right", borderTop: "2px solid #cbd5e1", fontVariantNumeric: "tabular-nums" }}>
                          {formatRp(totals[col.key] || 0)}
                        </td>
                      ))}
                      <td style={{ position: "sticky", right: 0, zIndex: 30, padding: "16px", fontSize: 14, fontWeight: 900, color: "#0f172a", textAlign: "right", borderTop: "2px solid #94a3b8", background: "#cbd5e1", fontVariantNumeric: "tabular-nums", borderLeft: "1px solid #94a3b8" }}>
                        {formatRp(grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
