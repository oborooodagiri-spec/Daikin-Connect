"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, Table2 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

interface Deal {
  id: number;
  quotation: number | bigint;
  status: string;
  est_booking_month?: string;
}

interface ProjectByStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  A: { label: "Won (A)", color: "#00c875" },
  B: { label: "Budgeted (B)", color: "#0073ea" },
  C: { label: "Contracted (C)", color: "#7b2cbf" },
  D: { label: "Planning (D)", color: "#fdab3d" },
  E: { label: "Submitted (E)", color: "#66ccff" },
  H: { label: "Hold (H)", color: "#676879" },
  L: { label: "Lost (L)", color: "#e44258" },
  T: { label: "Tender (T)", color: "#ff9f43" },
  S: { label: "Done (S)", color: "#00c875" },
  N: { label: "No Response (N)", color: "#c4c4c4" },
};

export default function ProjectByStatusModal({ isOpen, onClose, deals }: ProjectByStatusModalProps) {
  
  const { columns, rows, totals, chartData } = useMemo(() => {
    const monthMap: Record<string, Record<string, number>> = {};
    const colSet = new Set<string>();

    deals.forEach(d => {
      if (!d.est_booking_month) return;
      if (['L', 'H'].includes(d.status)) return;
      
      const dt = new Date(d.est_booking_month);
      if (isNaN(dt.getTime())) return;

      const year = dt.getFullYear();
      const month = dt.toLocaleString('default', { month: 'short' });
      const monthKey = `${month} ${year}`;
      
      const sortKey = `${year}-${String(dt.getMonth() + 1).padStart(2, '0')} ${monthKey}`;
      colSet.add(sortKey);
      
      if (!monthMap[d.status]) monthMap[d.status] = {};
      monthMap[d.status][sortKey] = (monthMap[d.status][sortKey] || 0) + Number(d.quotation || 0);
    });

    const sortedCols = Array.from(colSet).sort();
    const columns = sortedCols.map(c => ({ key: c, label: c.substring(8) }));
    
    const relevantStatuses = ["A", "B", "C", "D", "E"];
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

    return { columns, rows, totals, grandTotal, chartData };
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
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#323338", display: "flex", alignItems: "center", gap: 12 }}>
                <BarChart3 size={24} color="#0073ea" />
                Project By Status Analytics
              </h2>
              <p style={{ fontSize: 13, color: "#676879", marginTop: 4, fontWeight: 500 }}>
                Monthly pipeline projection based on estimated booking dates
              </p>
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
                      tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`}
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
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Pivot Table Matrix</h3>
              </div>
              
              <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "16px", background: "#f8fafc", color: "#676879", fontSize: 12, fontWeight: 800, textTransform: "uppercase", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                        Row Labels
                      </th>
                      {columns.map(col => (
                        <th key={col.key} style={{ padding: "16px", background: "#f8fafc", color: "#676879", fontSize: 12, fontWeight: 800, textTransform: "uppercase", textAlign: "right", borderBottom: "2px solid #e5e7eb", minWidth: 120 }}>
                          {col.label}
                        </th>
                      ))}
                      <th style={{ padding: "16px", background: "#f0f4f8", color: "#0f172a", fontSize: 12, fontWeight: 900, textTransform: "uppercase", textAlign: "right", borderBottom: "2px solid #cbd5e1" }}>
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.status} style={{ background: idx % 2 === 0 ? "#ffffff" : "#fafafa", transition: "background 0.2s" }}>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#323338", borderBottom: "1px solid #f0f0f0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: STATUS_CONFIG[row.status]?.color || "#ccc" }} />
                            {row.status} - {STATUS_CONFIG[row.status]?.label?.split(' ')[0]}
                          </div>
                        </td>
                        {columns.map(col => (
                          <td key={col.key} style={{ padding: "14px 16px", fontSize: 13, fontWeight: 500, color: row.values[col.key] > 0 ? "#334155" : "#cbd5e1", textAlign: "right", borderBottom: "1px solid #f0f0f0", fontVariantNumeric: "tabular-nums" }}>
                            {row.values[col.key] > 0 ? formatRp(row.values[col.key]) : "-"}
                          </td>
                        ))}
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "#0f172a", textAlign: "right", borderBottom: "1px solid #f0f0f0", background: "#f8fafc", fontVariantNumeric: "tabular-nums" }}>
                          {formatRp(row.rowTotal)}
                        </td>
                      </tr>
                    ))}
                    {/* Grand Total Row */}
                    <tr style={{ background: "#e2e8f0" }}>
                      <td style={{ padding: "16px", fontSize: 13, fontWeight: 900, color: "#0f172a", borderTop: "2px solid #cbd5e1" }}>
                        Grand Total
                      </td>
                      {columns.map(col => (
                        <td key={col.key} style={{ padding: "16px", fontSize: 13, fontWeight: 800, color: "#0f172a", textAlign: "right", borderTop: "2px solid #cbd5e1", fontVariantNumeric: "tabular-nums" }}>
                          {totals[col.key] > 0 ? formatRp(totals[col.key]) : "-"}
                        </td>
                      ))}
                      <td style={{ padding: "16px", fontSize: 14, fontWeight: 900, color: "#0f172a", textAlign: "right", borderTop: "2px solid #94a3b8", background: "#cbd5e1", fontVariantNumeric: "tabular-nums" }}>
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
