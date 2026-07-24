import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface Deal {
  id: number;
  quotation: number | bigint;
  status: string;
  pic?: string | null;
  [key: string]: any;
}

interface TopSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  initialFY: string;
}

// Helper to format currency
const formatRp = (val: number | bigint) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(val));
};

const STATUSES = ['B', 'C', 'D', 'E']; // Typically A is omitted or included based on exact requirement. Let's include A as well since the PIC sheet has no header A but usually A is included. Let's just use what's found.
// Actually, let's include 'A' too, just in case. Or dynamic based on deals. Let's use ['A', 'B', 'C', 'D', 'E'].
const ALL_STATUSES = ['A', 'B', 'C', 'D', 'E'];
const STATUS_COLORS: Record<string, string> = {
  A: '#3b82f6', // Blue
  B: '#8b5cf6', // Purple
  C: '#10b981', // Green
  D: '#f59e0b', // Amber
  E: '#ef4444', // Red
};

export default function TopSalesModal({ isOpen, onClose, deals, initialFY }: TopSalesModalProps) {
  const [selectedFY, setSelectedFY] = useState(initialFY);

  // Derive available FYs from deals to allow switching
  const availableFYs = useMemo(() => {
    const set = new Set<string>();
    deals.forEach(d => {
      if (d.est_booking_month) {
        const dt = new Date(d.est_booking_month);
        if (!isNaN(dt.getTime())) {
          const m = dt.getMonth() + 1;
          const y = dt.getFullYear();
          const fy = m >= 4 ? `FY${String(y).slice(-2)}` : `FY${String(y - 1).slice(-2)}`;
          set.add(fy);
        }
      }
    });
    const arr = Array.from(set).sort();
    if (!arr.includes(initialFY)) arr.push(initialFY);
    return arr.sort();
  }, [deals, initialFY]);

  // Pivot data calculation
  const { pivotData, grandTotal, totalsByStatus } = useMemo(() => {
    const picMap: Record<string, Record<string, number>> = {};
    const totals: Record<string, number> = {};
    let gTotal = 0;

    ALL_STATUSES.forEach(s => totals[s] = 0);

    deals.forEach(d => {
      // Filter by FY
      if (d.est_booking_month) {
        const dt = new Date(d.est_booking_month);
        if (!isNaN(dt.getTime())) {
          const m = dt.getMonth() + 1;
          const y = dt.getFullYear();
          const fy = m >= 4 ? `FY${String(y).slice(-2)}` : `FY${String(y - 1).slice(-2)}`;
          if (fy !== selectedFY) return;
        } else {
          return;
        }
      } else {
        return;
      }

      if (['L', 'H'].includes(d.status)) return;
      const status = d.status;
      if (!ALL_STATUSES.includes(status)) return;
      
      const picName = d.pic?.trim() || '(blank)';
      const val = Number(d.quotation) || 0;

      if (!picMap[picName]) {
        picMap[picName] = {};
        ALL_STATUSES.forEach(s => picMap[picName][s] = 0);
      }
      
      picMap[picName][status] += val;
      totals[status] += val;
      gTotal += val;
    });

    // Convert picMap to array for table and chart
    const data = Object.keys(picMap).map(pic => {
      const row = picMap[pic];
      const rowTotal = ALL_STATUSES.reduce((sum, s) => sum + row[s], 0);
      return {
        pic,
        ...row,
        total: rowTotal
      };
    }).sort((a, b) => b.total - a.total); // Sort by highest total

    return { pivotData: data, grandTotal: gTotal, totalsByStatus: totals };
  }, [deals, selectedFY]);

  // Chart data
  const chartData = pivotData.slice(0, 15); // Show top 15 in chart

  // Calculate percentages for tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: '#1e293b' }}>{label}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value === 0) return null;
            const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: 12, height: 12, backgroundColor: entry.color, borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: '#64748b' }}>Status {entry.name}:</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{formatRp(entry.value)} ({pct}%)</span>
              </div>
            );
          })}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
            <span>Total:</span>
            <span>{formatRp(total)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            backgroundColor: "#ffffff",
            width: "100%", maxWidth: 1200,
            maxHeight: "90vh",
            borderRadius: 24,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            display: "flex", flexDirection: "column",
            overflow: "hidden"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: "24px 32px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(to right, #f8fafc, #ffffff)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16,
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 24,
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
              }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                  Top Sales Performance (PIC)
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0 0" }}>
                  Pipeline matrix grouped by Sales PIC and Status
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                style={{
                  padding: "8px 16px", borderRadius: 12, border: "1px solid #cbd5e1",
                  backgroundColor: "#f8fafc", fontSize: 14, fontWeight: 600, color: "#334155",
                  outline: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
              >
                {availableFYs.map(fy => (
                  <option key={fy} value={fy}>{fy}</option>
                ))}
              </select>
              <button 
                onClick={onClose}
                style={{
                  width: 40, height: 40, borderRadius: '50%', border: 'none',
                  backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "32px", overflowY: "auto", flex: 1, backgroundColor: "#f8fafc" }}>
            
            {/* Infographic Section */}
            <div style={{ 
              backgroundColor: "white", padding: 24, borderRadius: 20, 
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)",
              marginBottom: 32
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 20px 0" }}>
                PIC Performance Distribution (Top 15)
              </h3>
              <div style={{ height: 350, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="pic" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(val) => `Rp ${(val / 1e9).toFixed(1)}B`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} iconType="circle" />
                    
                    {ALL_STATUSES.map((status) => (
                      <Bar 
                        key={status}
                        dataKey={status} 
                        name={`Status ${status}`} 
                        stackId="a" 
                        fill={STATUS_COLORS[status]}
                        radius={[0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Matrix Table Section */}
            <div style={{ 
              backgroundColor: "white", borderRadius: 20, overflow: "hidden",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)"
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "16px 20px", backgroundColor: "#f1f5f9", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#475569", borderBottom: "2px solid #e2e8f0" }}>Row Labels</th>
                      {ALL_STATUSES.map(s => (
                        <th key={s} style={{ padding: "16px 20px", backgroundColor: "#f1f5f9", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#475569", borderBottom: "2px solid #e2e8f0" }}>
                          {s}
                        </th>
                      ))}
                      <th style={{ padding: "16px 20px", backgroundColor: "#e2e8f0", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#0f172a", borderBottom: "2px solid #cbd5e1" }}>
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pivotData.length > 0 ? (
                      pivotData.map((row, idx) => (
                        <tr key={row.pic} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#f8fafc"}>
                          <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #e2e8f0" }}>
                            {row.pic}
                          </td>
                          {ALL_STATUSES.map(s => (
                            <td key={s} style={{ padding: "14px 20px", fontSize: 13, color: row[s] > 0 ? "#334155" : "#94a3b8", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>
                              {row[s] > 0 ? formatRp(row[s]) : "-"}
                            </td>
                          ))}
                          <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a", textAlign: "right", borderBottom: "1px solid #e2e8f0", backgroundColor: "rgba(226, 232, 240, 0.2)" }}>
                            {formatRp(row.total)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={ALL_STATUSES.length + 2} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                          No data available for {selectedFY}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {pivotData.length > 0 && (
                    <tfoot>
                      <tr style={{ backgroundColor: "#1e293b" }}>
                        <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 700, color: "#ffffff", borderTop: "none" }}>
                          Grand Total
                        </td>
                        {ALL_STATUSES.map(s => (
                          <td key={s} style={{ padding: "16px 20px", fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "right", borderTop: "none" }}>
                            {totalsByStatus[s] > 0 ? formatRp(totalsByStatus[s]) : "-"}
                          </td>
                        ))}
                        <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 800, color: "#38bdf8", textAlign: "right", borderTop: "none" }}>
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
      </motion.div>
    </AnimatePresence>
  );
}
