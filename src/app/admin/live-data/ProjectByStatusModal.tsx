"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, Table2, ChevronRight, ChevronDown } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

interface TreeNode {
  id: string;
  name: string;
  subtitle?: string;
  level: number;
  values: Record<string, number>;
  total: number;
  children: Record<string, TreeNode>;
  color?: string;
}

interface Deal {
  id: number;
  project_name: string;
  client_name: string;
  category?: string | null;
  pic?: string | null;
  status: string;
  quotation: number | string | null;
  target_po_date?: string | Date | null;
  created_at?: string | Date;
}

interface ProjectByStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  initialFY?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  A: { label: "A", color: "#00c875" },
  B: { label: "B", color: "#0073ea" },
  C: { label: "C", color: "#7b2cbf" },
  D: { label: "D", color: "#fdab3d" },
  E: { label: "E", color: "#66ccff" },
  H: { label: "H", color: "#676879" },
  L: { label: "L", color: "#e44258" },
  T: { label: "T", color: "#ff9f43" },
  S: { label: "S", color: "#00c875" },
  N: { label: "N", color: "#c4c4c4" },
};

export default function ProjectByStatusModal({ isOpen, onClose, deals }: ProjectByStatusModalProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { columns, rows, totals, grandTotal, chartData, tree } = useMemo(() => {
    const monthMap: Record<string, Record<string, number>> = {};
    
    // Find min and max dates
    let minTime = Infinity;
    let maxTime = -Infinity;

    deals.forEach(d => {
      if (['L', 'H'].includes(d.status)) return;
      const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
      const dt = rawDate ? new Date(rawDate) : null;
      if (!dt || isNaN(dt.getTime())) return;
      
      const t = dt.getTime();
      if (t < minTime) minTime = t;
      if (t > maxTime) maxTime = t;
    });

    if (minTime === Infinity) {
      minTime = new Date().getTime();
      maxTime = new Date().getTime();
    }

    const columns: { key: string; label: string }[] = [];
    const minDate = new Date(minTime);
    const maxDate = new Date(maxTime);

    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    // Limit to max 36 months to prevent infinite loop or huge charts if data is weird
    let safetyCounter = 0;
    while (current <= end && safetyCounter < 36) {
      const mYear = current.getFullYear();
      const mStr = current.toLocaleString('default', { month: 'short' });
      const key = `${mYear}-${String(current.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
      columns.push({ key, label: `${mStr} ${mYear}` });
      current.setMonth(current.getMonth() + 1);
      safetyCounter++;
    }

    deals.forEach(d => {
      const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
      if (!rawDate) return;
      if (['L', 'H'].includes(d.status)) return;
      
      const dt = new Date(rawDate);
      if (isNaN(dt.getTime())) return;

      const mYear = dt.getFullYear();
      const mStr = dt.toLocaleString('default', { month: 'short' });
      const sortKey = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
      
      if (!monthMap[d.status]) monthMap[d.status] = {};
      monthMap[d.status][sortKey] = (monthMap[d.status][sortKey] || 0) + Number(d.quotation || 0);
    });
    
    const relevantStatuses = ["A", "B", "C", "D", "E"];
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

    const rows = relevantStatuses.map(status => {
      const rowData = monthMap[status] || {};
      let rowTotal = 0;
      const values: Record<string, number> = {};
      columns.forEach(col => {
        const val = rowData[col.key] || 0;
        values[col.key] = val;
        rowTotal += val;
      });
      return { status, values, rowTotal };
    }).filter(r => r.rowTotal > 0);

    deals.forEach(d => {
      if (['L', 'H', 'T'].includes(d.status)) return;
      if (!relevantStatuses.includes(d.status)) return;
      
      const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
      if (!rawDate) return;
      const dt = new Date(rawDate);
      if (isNaN(dt.getTime())) return;

      const mYear = dt.getFullYear();
      const mStr = dt.toLocaleString('default', { month: 'short' });
      const sortKey = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
      
      if (!columns.find(c => c.key === sortKey)) return;
      
      const val = Number(d.quotation || 0);

      // Hierarchy: Status > PIC > Customer Name > Project Name
      const path = [
        { key: d.status || "Unknown Status", name: d.status || "Unknown Status" },
        { key: d.pic || "Unassigned", name: d.pic || "Unassigned" },
        { key: d.category || "Uncategorized", name: d.category || "Uncategorized" },
        { key: d.id.toString(), name: d.client_name || "Unknown Customer", subtitle: (d.is_closed && !d.is_partial_close ? "🔴 [CLOSED] " : "") + (d.is_partial_close ? `🟡 [PARTIAL CLOSE ${d.partial_percentage || ""}%] ` : "") + (d.project_name || "Unknown Project") }
      ];

      addValueToNode(root, sortKey, val);

      let current = root;
      let currentId = "root";

      path.forEach((partObj, idx) => {
        const { key: pKey, name, subtitle } = partObj;
        currentId += `|${pKey}`;
        if (!current.children[pKey]) {
          current.children[pKey] = {
            id: currentId,
            name: name,
            subtitle: subtitle,
            level: idx + 1,
            values: {},
            total: 0,
            children: {}
          };
          if (idx === 0) { // Status level
            current.children[pKey].color = STATUS_CONFIG[pKey]?.color || "#ccc";
          }
        }
        current = current.children[pKey];
        addValueToNode(current, sortKey, val);
      });
    });

    const totals: Record<string, number> = {};
    let grandTotal = 0;
    columns.forEach(col => {
      totals[col.key] = rows.reduce((sum, row) => sum + row.values[col.key], 0);
      grandTotal += totals[col.key];
    });

    const chartData = columns.map(col => {
      const dataPoint: any = { name: col.label };
      rows.forEach(row => {
        dataPoint[row.status] = row.values[col.key];
      });
      return dataPoint;
    });

    return { columns, rows, totals, grandTotal, chartData, tree: root };
  }, [deals]);

  const formatRp = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "white", padding: "12px", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "1px solid #f0f0f0" }}>
          <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            entry.value > 0 && (
              <div key={index} style={{ display: "flex", gap: "12px", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: entry.color, fontWeight: 700 }}>{STATUS_CONFIG[entry.dataKey]?.label || entry.dataKey}</span>
                <span style={{ fontWeight: 800 }}>{formatRp(entry.value)}</span>
              </div>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  const renderTree = (nodes: Record<string, TreeNode>) => {
    return Object.values(nodes)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(node => {
        const hasChildren = Object.keys(node.children).length > 0;
        const isExpanded = !!expandedNodes[node.id];
        const paddingLeft = node.level === 1 ? 8 : (node.level - 1) * 24 + 8;

        return (
          <React.Fragment key={node.id}>
            <tr style={{ background: node.level % 2 === 1 ? "#ffffff" : "#fafafa", borderBottom: "1px solid #f0f0f0", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseOut={(e) => e.currentTarget.style.background = node.level % 2 === 1 ? "#ffffff" : "#fafafa"}>
              <td style={{ position: "sticky", left: 0, zIndex: 10, background: node.level % 2 === 1 ? "#ffffff" : "#fafafa", padding: "10px 16px", fontSize: 13, fontWeight: node.level < 3 ? 800 : 500, color: node.level < 3 ? "#323338" : "#475569", borderRight: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", alignItems: "center", paddingLeft }}>
                  {hasChildren ? (
                    <button onClick={() => toggleNode(node.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, marginRight: 8, color: "#676879", borderRadius: 4 }}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : (
                    <div style={{ width: 32 }} />
                  )}
                  {node.level === 1 && <div style={{ width: 12, height: 12, borderRadius: "50%", background: node.color, marginRight: 8 }} />}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: node.level === 3 ? 14 : 13, fontWeight: node.level === 3 ? 800 : (node.level < 3 ? 800 : 500), color: node.level === 3 ? "#1e293b" : "inherit" }}>
                      {node.level === 1 ? (STATUS_CONFIG[node.name]?.label || node.name) : node.name}
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
                <td key={col.key} style={{ padding: "10px 16px", fontSize: 13, fontWeight: node.level < 3 ? 700 : 500, color: node.values[col.key] > 0 ? (node.level < 3 ? "#0f172a" : "#334155") : "#cbd5e1", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {node.values[col.key] > 0 ? formatRp(node.values[col.key]) : "-"}
                </td>
              ))}
              <td style={{ position: "sticky", right: 0, zIndex: 10, padding: "10px 16px", fontSize: 13, fontWeight: 900, color: "#0f172a", textAlign: "right", background: "#f8fafc", fontVariantNumeric: "tabular-nums", borderLeft: "1px solid #e5e7eb" }}>
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
            maxWidth: "1100px",
            maxHeight: "90vh",
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{ padding: "24px 32px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <BarChart3 size={24} color="#0073ea" />
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: "#323338" }}>Project By Status Analytics</h2>
                </div>
              </div>
            <button
              onClick={onClose}
              style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f4f4", border: "none", cursor: "pointer", transition: "all 0.2s" }}
            >
              <X size={18} color="#676879" />
            </button>
          </div>

          <div style={{ padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 40 }}>
            
            {/* Chart Section */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 24, background: "#0073ea", borderRadius: 4 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Booking Forecast Overview</h3>
              </div>
              <div style={{ height: 350, width: "100%", background: "#fcfcfc", borderRadius: 16, border: "1px solid #f0f0f0", padding: "20px 20px 0 0" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "#676879" }} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: "#676879" }}
                      tickFormatter={(value) => {
                        if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
                        if (value >= 1e9) return `${(value / 1e9).toFixed(1)}M`;
                        if (value >= 1e6) return `${(value / 1e6).toFixed(1)}Jt`;
                        return `${value}`;
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,115,234,0.05)' }} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} iconType="circle" />
                    {rows.map(row => (
                      <Bar 
                        key={row.status} 
                        dataKey={row.status} 
                        name={STATUS_CONFIG[row.status]?.label || row.status} 
                        stackId="a" 
                        fill={STATUS_CONFIG[row.status]?.color || "#ccc"} 
                        radius={[0, 0, 0, 0]} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table Section */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 24, background: "#7b2cbf", borderRadius: 4 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Table Matrix</h3>
              </div>
              
              <div style={{ overflow: "auto", maxHeight: "65vh", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                  <thead>
                    <tr>
                      <th style={{ position: "sticky", top: 0, left: 0, zIndex: 30, padding: "16px", background: "#f8fafc", color: "#676879", fontSize: 12, fontWeight: 800, textTransform: "uppercase", textAlign: "left", borderBottom: "2px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}>
                        Row Labels
                      </th>
                      {columns.map(col => (
                        <th key={col.key} style={{ position: "sticky", top: 0, zIndex: 20, padding: "16px", background: "#f8fafc", color: "#676879", fontSize: 12, fontWeight: 800, textTransform: "uppercase", textAlign: "right", borderBottom: "2px solid #e5e7eb", minWidth: 120 }}>
                          {col.label}
                        </th>
                      ))}
                      <th style={{ position: "sticky", top: 0, right: 0, zIndex: 30, padding: "16px", background: "#f0f4f8", color: "#0f172a", fontSize: 12, fontWeight: 900, textTransform: "uppercase", textAlign: "right", borderBottom: "2px solid #cbd5e1", borderLeft: "1px solid #cbd5e1" }}>
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tree && renderTree(tree.children)}
                    {/* Grand Total Row */}
                    <tr style={{ position: "sticky", bottom: 0, zIndex: 25, background: "#e2e8f0" }}>
                      <td style={{ position: "sticky", left: 0, zIndex: 30, background: "#e2e8f0", padding: "16px", fontSize: 13, fontWeight: 900, color: "#0f172a", borderTop: "2px solid #cbd5e1", borderRight: "1px solid #cbd5e1" }}>
                        Grand Total
                      </td>
                      {columns.map(col => (
                        <td key={col.key} style={{ padding: "16px", fontSize: 13, fontWeight: 800, color: "#0f172a", textAlign: "right", borderTop: "2px solid #cbd5e1", fontVariantNumeric: "tabular-nums" }}>
                          {totals[col.key] > 0 ? formatRp(totals[col.key]) : "-"}
                        </td>
                      ))}
                      <td style={{ position: "sticky", right: 0, zIndex: 30, padding: "16px", fontSize: 14, fontWeight: 900, color: "#0f172a", textAlign: "right", borderTop: "2px solid #94a3b8", background: "#cbd5e1", fontVariantNumeric: "tabular-nums", borderLeft: "1px solid #94a3b8" }}>
                        {formatRp(rows.reduce((sum, r) => sum + r.rowTotal, 0))}
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
