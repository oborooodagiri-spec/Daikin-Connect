"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface Deal {
  id: number;
  quotation: number | bigint;
  status: string;
  target_po_date?: string | null;
  sector?: string;
  [key: string]: any;
}

interface SectorPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  initialFY?: number;
  sectorName: string;
  color?: string;
}

export default function SectorPipelineModal({ 
  isOpen, 
  onClose, 
  deals, 
  initialFY = 26, 
  sectorName,
  color = "#0073ea"
}: SectorPipelineModalProps) {
  
  const [selectedFY, setSelectedFY] = useState(initialFY);

  useEffect(() => {
    if (isOpen) setSelectedFY(initialFY);
  }, [isOpen, initialFY]);

  const { columns, rows, totals, grandTotal, chartData } = useMemo(() => {
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
      if (['L', 'H'].includes(d.status)) return; // Exclude lost/hold usually
      if (!d.target_po_date) return;
      
      const dt = new Date(d.target_po_date);
      if (isNaN(dt.getTime())) return;

      const mYear = dt.getFullYear();
      const key = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      
      if (!colSet.has(key)) return; 
      
      const val = Number(d.quotation || 0);
      const status = d.status || "Unknown";

      if (!rowMap[status]) rowMap[status] = {};
      rowMap[status][key] = (rowMap[status][key] || 0) + val;
      rowMap[status]["total"] = (rowMap[status]["total"] || 0) + val;
      
      totals[key] = (totals[key] || 0) + val;
      grandTotal += val;
    });

    const rows = Object.keys(rowMap).sort().map(status => ({
      status,
      values: rowMap[status],
      total: rowMap[status]["total"]
    }));

    // Prepare chart data (Stacked Bar Chart)
    const chartData = columns.map(col => {
      const dataPoint: any = { name: col.label };
      rows.forEach(r => {
        dataPoint[r.status] = r.values[col.key] || 0;
      });
      return dataPoint;
    });

    return { columns, rows, totals, grandTotal, chartData };
  }, [deals, selectedFY]);

  const formatRp = (val: number) => {
    if (val === 0 || !val) return "-";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const STATUS_COLORS: Record<string, string> = {
    'A': '#10b981',
    'B': '#3b82f6',
    'C': '#8b5cf6',
    'D': '#f59e0b',
    'E': '#ef4444',
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
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Pipeline By Sector: {sectorName}</h2>
                <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500, marginTop: 2 }}>Distribution of quotation values by status over time</p>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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

          <div style={{ flex: 1, overflow: "auto", padding: 32, background: "#ffffff" }}>
            {/* Infographic Chart */}
            <div style={{ marginBottom: 32, padding: 24, background: "#f8fafc", borderRadius: 20, border: "1px solid #e2e8f0" }}>
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
                      tickFormatter={(value) => `Rp ${(value / 1000000000).toFixed(0)}B`}
                      dx={-10}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatRp(value)}
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontWeight: 600 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 12, fontWeight: 600 }} />
                    {rows.map(r => (
                      <Bar key={r.status} dataKey={r.status} stackId="a" fill={STATUS_COLORS[r.status] || color} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pivot Table */}
            <div style={{ background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontSize: 13, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", position: "sticky", left: 0, zIndex: 10 }}>
                        Status
                      </th>
                      {columns.map(col => (
                        <th key={col.key} style={{ padding: "16px 12px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 120 }}>
                          {col.label}
                        </th>
                      ))}
                      <th style={{ padding: "16px 24px", background: "#f1f5f9", borderBottom: "2px solid #e2e8f0", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.status} style={{ borderBottom: "1px solid #e2e8f0", background: "white", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 700, color: "#334155", position: "sticky", left: 0, background: "inherit", zIndex: 5, borderRight: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: STATUS_COLORS[row.status] || color }} />
                          {row.status}
                        </td>
                        {columns.map(col => (
                          <td key={col.key} style={{ padding: "16px 12px", textAlign: "right", fontSize: 13, color: "#64748b", fontWeight: 500, borderRight: "1px dashed #f1f5f9" }}>
                            {formatRp(row.values[col.key] || 0)}
                          </td>
                        ))}
                        <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 14, fontWeight: 800, color: "#0f172a", background: "#f8fafc" }}>
                          {formatRp(row.total)}
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={columns.length + 2} style={{ padding: "32px", textAlign: "center", color: "#64748b", fontSize: 14 }}>
                          No project data available for {sectorName} in FY{selectedFY}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {rows.length > 0 && (
                    <tfoot>
                      <tr>
                        <td style={{ padding: "20px 24px", background: "#0f172a", color: "white", fontWeight: 800, position: "sticky", left: 0, zIndex: 10, borderRadius: "0 0 0 20px" }}>
                          Total Quotation
                        </td>
                        {columns.map(col => (
                          <td key={col.key} style={{ padding: "20px 12px", background: "#0f172a", color: "white", textAlign: "right", fontWeight: 700, fontSize: 13 }}>
                            {formatRp(totals[col.key] || 0)}
                          </td>
                        ))}
                        <td style={{ padding: "20px 24px", background: color, color: "white", textAlign: "right", fontWeight: 800, fontSize: 15, borderRadius: "0 0 20px 0" }}>
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
