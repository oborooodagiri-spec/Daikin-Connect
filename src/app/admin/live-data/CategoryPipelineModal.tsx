"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, BarChart3, PieChart , ChevronDown, ChevronRight } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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
  quotation: number | bigint;
  status: string;
  target_po_date?: string | null;
  est_booking_month?: string | Date | null;
  sector?: string;
  [key: string]: any;
}

interface CategoryPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  initialFY?: number;
  categoryName: string;
  color?: string;
}

export default function CategoryPipelineModal({ 
  isOpen, 
  onClose, 
  deals, 
  initialFY = 26, 
  categoryName,
  color = "#fdab3d"
}: CategoryPipelineModalProps) {
  
  const [selectedFY, setSelectedFY] = useState(initialFY);
  const [showTender, setShowTender] = useState(false);
  const [showHold, setShowHold] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedFY(initialFY);
      setShowTender(false);
      setShowHold(false);
    }
  }, [isOpen, initialFY]);

  const { columns, rows, totals, grandTotal, chartData, tree } = useMemo(() => {
    const year = 2000 + selectedFY;
    const columns: { key: string; label: string }[] = [];
    const colSet = new Set<string>();
    
    // FY starts in April
    for (let i = 0; i < 12; i++) {
      const d = new Date(year, 3 + i, 1);
      const mYear = d.getFullYear();
      const mStr = d.toLocaleString('default', { month: 'short' });
      const key = `${mYear}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      columns.push({ key, label: `${mStr} ${mYear}` });
      colSet.add(key);
    }

    const rowMap: Record<string, Record<string, number>> = {};
    const totals: Record<string, number> = {};
    let grandTotal = 0;

    deals.forEach(d => {
      if (['L', 'H', 'T', 'A'].includes(d.status)) {
        if (d.status === 'T' && !showTender) return;
        if (d.status === 'H' && !showHold) return;
        if (d.status === 'A' || d.status === 'L') return;
      }
      
      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return;
      const dt = new Date(rawDate);
      if (isNaN(dt.getTime())) return;

      const mYear = dt.getFullYear();
      const key = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      
      if (!colSet.has(key)) return; 
      
      const val = Number(d.quotation || 0);
      let category = d.category || "Others";
      if (category.toLowerCase().startsWith("cont")) category = "Control";

      if (!rowMap[category]) rowMap[category] = {};
      rowMap[category][key] = (rowMap[category][key] || 0) + val;
      rowMap[category]["total"] = (rowMap[category]["total"] || 0) + val;
      
      totals[key] = (totals[key] || 0) + val;
      grandTotal += val;
    });

    const rows = Object.keys(rowMap).map(status => ({
      status,
      values: rowMap[status],
      total: rowMap[status]["total"]
    })).sort((a, b) => b.total - a.total);

    // Prepare chart data (Stacked Bar Chart)
    const chartData = columns.map(col => {
      const dataPoint: any = { name: col.label };
      rows.forEach(r => {
        dataPoint[r.status] = r.values[col.key] || 0;
      });
      return dataPoint;
    });

    
    const root: TreeNode = {
      id: "root", name: "Root", level: 0, values: {}, total: 0, children: {}
    };

    const addValueToNode = (node: TreeNode, colKey: string, val: number) => {
      node.values[colKey] = (node.values[colKey] || 0) + val;
      node.total += val;
    };

    deals.forEach(d => {
      if (d.status === 'L') return;
      if (typeof showTender !== 'undefined' && !showTender && d.status === 'T') return;
      if (typeof showHold !== 'undefined' && !showHold && d.status === 'H') return;
      
      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return;
      const dt = new Date(rawDate);
      if (isNaN(dt.getTime())) return;

      const mYear = dt.getFullYear();
      const key = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (!colSet.has(key)) return; 
      
      const val = Number(d.quotation || 0);
      
      let category = d.category || "Others";
      if (category.toLowerCase().startsWith("cont")) category = "Control";

      const topLevelColor = (name) => {
        return {'EPL': '#fdab3d', 'RC': '#7b2cbf', 'IAQ': '#00c875', 'Control': '#0073ea', 'VES': '#e44258', 'Others': '#94a3b8'}[name] || '#ccc';
      };

      const path = [
        { key: category, name: category },
        { key: d.pic || "Unassigned", name: d.pic || "Unassigned" },
        { key: d.id.toString(), name: d.client_name || "Unknown Customer", subtitle: (d.is_closed && !d.is_partial_close ? "🔴 [CLOSED] " : "") + (d.is_partial_close ? `🟡 [PARTIAL CLOSE ${d.partial_percentage || ""}%] ` : "") + (d.project_name || "Unknown Project") }
      ];

      
      addValueToNode(root, key, val);
      let current = root;
      let currentId = "root";

      path.forEach((partObj, idx) => {
        const { key: pKey, name, subtitle } = partObj;
        currentId += "|" + pKey;
        if (!current.children[pKey]) {
          current.children[pKey] = {
            id: currentId, name: name, subtitle: subtitle, level: idx + 1, values: {}, total: 0, children: {}
          };
          if (idx === 0) {
            current.children[pKey].color = topLevelColor ? topLevelColor(pKey) : "#ccc";
          }
        }
        current = current.children[pKey];
        addValueToNode(current, key, val);
      });
    });

    return { columns, rows, totals, grandTotal, chartData, tree: root };
  }, [deals, selectedFY, showTender, showHold]);

  
  const renderTree = (nodes: Record<string, TreeNode>) => {
    return Object.values(nodes)
      .sort((a, b) => {
        // Sort level 1 according to original logic if needed, otherwise alphabetical
        return a.name.localeCompare(b.name);
      })
      .map(node => {
        const hasChildren = Object.keys(node.children).length > 0;
        const isExpanded = !!expandedNodes[node.id];
        const paddingLeft = node.level === 1 ? 8 : (node.level - 1) * 24 + 8;

        return (
          <React.Fragment key={node.id}>
            <tr style={{ background: node.level % 2 === 1 ? "#ffffff" : "#fafafa", borderBottom: "1px solid #f0f0f0", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseOut={(e) => e.currentTarget.style.background = node.level % 2 === 1 ? "#ffffff" : "#fafafa"}>
              <td style={{ position: "sticky", left: 0, zIndex: 10, background: node.level % 2 === 1 ? "#ffffff" : "#fafafa", padding: "10px 16px", fontSize: 13, fontWeight: node.level < 3 ? 800 : 500, color: node.level < 3 ? "#323338" : "#475569", borderRight: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", paddingLeft }}>
                  {hasChildren ? (
                    <button onClick={() => toggleNode(node.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, marginRight: 8, color: "#676879", borderRadius: 4 }}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : (
                    <div style={{ width: 32 }} />
                  )}
                  {node.level === 1 && <div style={{ width: 12, height: 12, borderRadius: "50%", background: node.color || "#ccc", marginRight: 8 }} />}
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
                <td key={col.key} style={{ padding: "10px 12px", fontSize: 13, fontWeight: node.level < 3 ? 700 : 500, color: node.values[col.key] > 0 ? (node.level < 3 ? "#0f172a" : "#334155") : "#cbd5e1", textAlign: "right", borderRight: "1px dashed #f1f5f9" }}>
                  {node.values[col.key] > 0 ? formatRp(node.values[col.key]) : "-"}
                </td>
              ))}
              <td style={{ position: "sticky", right: 0, zIndex: 10, padding: "10px 24px", fontSize: 13, fontWeight: 900, color: "#0f172a", textAlign: "right", background: "#f8fafc", borderLeft: "1px solid #e2e8f0" }}>
                {formatRp(node.total)}
              </td>
            </tr>
            {isExpanded && hasChildren && renderTree(node.children)}
          </React.Fragment>
        );
      });
  };

  const formatRp = (val: number) => {
    if (val === 0 || !val) return "-";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const CAT_COLORS: Record<string, string> = {
    'EPL': '#fdab3d',
    'RC': '#7b2cbf',
    'IAQ': '#00c875',
    'Control': '#0073ea',
    'VES': '#e44258',
    'Others': '#94a3b8'
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)" }}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{ 
            position: "relative", 
            width: "95%", 
            maxWidth: 1400, 
            height: "90vh", 
            background: "#ffffff", 
            borderRadius: 24, 
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 16px ${color}40` }}>
                <PieChart size={24} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Pipeline By Category{categoryName && categoryName !== "Overview" ? `: ${categoryName}` : ""}</h2>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "white", padding: "6px 12px", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <div style={{ position: "relative", width: 32, height: 18, background: showTender ? "#f97316" : "#cbd5e1", borderRadius: 20, transition: "0.3s" }}>
                    <div style={{ position: "absolute", top: 2, left: showTender ? 16 : 2, width: 14, height: 14, background: "white", borderRadius: "50%", transition: "0.3s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: showTender ? "#f97316" : "#64748b" }}>Engineering Review</span>
                  <input type="checkbox" checked={showTender} onChange={e => setShowTender(e.target.checked)} style={{ display: "none" }} />
                </label>
                
                <div style={{ width: 1, height: 16, background: "#e2e8f0" }} />
                
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <div style={{ position: "relative", width: 32, height: 18, background: showHold ? "#64748b" : "#cbd5e1", borderRadius: 20, transition: "0.3s" }}>
                    <div style={{ position: "absolute", top: 2, left: showHold ? 16 : 2, width: 14, height: 14, background: "white", borderRadius: "50%", transition: "0.3s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: showHold ? "#e44258" : "#64748b" }}>Hold</span>
                  <input type="checkbox" checked={showHold} onChange={e => setShowHold(e.target.checked)} style={{ display: "none" }} />
                </label>
              </div>

              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(Number(e.target.value))}
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#334155",
                  outline: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                }}
              >
                {[24, 25, 26, 27].map(y => (
                  <option key={y} value={y}>FY{y}</option>
                ))}
              </select>
              <button 
                onClick={onClose}
                style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: "white", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: 32, gap: 32, background: "#ffffff" }}>
            {/* Infographic Chart */}
            <div style={{ flex: "none", padding: 24, background: "#f8fafc", borderRadius: 20, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <BarChart3 size={20} color={color} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#334155" }}>Monthly Trend Breakdown</h3>
              </div>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                      tickFormatter={(value) => {
                        if (value >= 1e12) return `Rp ${(value / 1e12).toFixed(0)}T`;
                        if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(0)}M`;
                        if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(0)}Jt`;
                        return `Rp ${value}`;
                      }}
                      dx={-10}
                    />
                    <Tooltip 
                      formatter={formatRp as any} 
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontWeight: 600 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 12, fontWeight: 600 }} />
                    {rows.map(r => (
                      <Bar key={r.status} dataKey={r.status} stackId="a" fill={CAT_COLORS[r.status] || '#94a3b8'} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pivot Table */}
            <div style={{ flex: 1, minHeight: 400, display: "flex", flexDirection: "column", background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <div style={{ flex: 1, overflow: "auto", maxHeight: "60vh" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontSize: 13, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", position: "sticky", top: 0, left: 0, zIndex: 30, borderRight: "1px solid #e2e8f0" }}>
                        Category
                      </th>
                      {columns.map(col => (
                        <th key={col.key} style={{ position: "sticky", top: 0, zIndex: 20, padding: "16px 12px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 120 }}>
                          {col.label}
                        </th>
                      ))}
                      <th style={{ padding: "16px 24px", background: "#f1f5f9", borderBottom: "2px solid #e2e8f0", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", position: "sticky", top: 0, right: 0, zIndex: 30, borderLeft: "1px solid #e2e8f0" }}>
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tree && Object.keys(tree.children).length > 0 ? renderTree(tree.children) : (
                      <tr>
                        <td colSpan={columns.length + 2} style={{ padding: "32px", textAlign: "center", color: "#64748b", fontSize: 14 }}>
                          No project data available in FY{selectedFY}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {rows.length > 0 && (
                    <tfoot>
                      <tr>
                        <td style={{ padding: "20px 24px", background: "#0f172a", color: "white", fontWeight: 800, position: "sticky", bottom: 0, left: 0, zIndex: 30, borderRadius: "0 0 0 20px", borderTop: "2px solid #334155", borderRight: "1px solid #334155" }}>
                          Total Quotation
                        </td>
                        {columns.map(col => (
                          <td key={col.key} style={{ position: "sticky", bottom: 0, zIndex: 25, padding: "20px 12px", background: "#0f172a", color: "white", textAlign: "right", fontWeight: 700, fontSize: 13, borderTop: "2px solid #334155" }}>
                            {formatRp(totals[col.key] || 0)}
                          </td>
                        ))}
                        <td style={{ position: "sticky", bottom: 0, right: 0, zIndex: 30, padding: "20px 24px", background: color, color: "white", textAlign: "right", fontWeight: 800, fontSize: 15, borderRadius: "0 0 20px 0", borderTop: "2px solid rgba(0,0,0,0.1)", borderLeft: "1px solid rgba(0,0,0,0.1)" }}>
                          {formatRp(grandTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
