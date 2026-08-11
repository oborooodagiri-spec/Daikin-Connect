import React, { useMemo, useState } from 'react';
import { Archive, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import LostAndClosedAnalyticsModal from './LostAndClosedAnalyticsModal';

export default function ClosedProjectsWidget({ 
  deals, 
  currentFY,
  selectedFY,
  setSelectedFY,
  selectedMonth,
  setSelectedMonth,
  fyOptions,
  MONTH_OPTIONS
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const getMonthRange = useMemo(() => {
    if (selectedMonth === 0) return null;
    const fyYear = 2000 + selectedFY;
    const calendarMonth = selectedMonth <= 9 ? selectedMonth + 2 : selectedMonth - 10;
    const calendarYear = selectedMonth <= 9 ? fyYear : fyYear + 1;
    const start = new Date(calendarYear, calendarMonth, 1).getTime();
    const end = new Date(calendarYear, calendarMonth + 1, 0, 23, 59, 59, 999).getTime();
    return { start, end };
  }, [selectedFY, selectedMonth]);

  const closedDeals = useMemo(() => {
    return deals.filter((d: any) => {
      if (!d.is_closed && d.status !== 'L') return false;
      
      const uTime = new Date(d.updated_at).getTime();
      const fyStart = new Date(2000 + selectedFY, 3, 1).getTime();
      const fyEnd = new Date(2000 + selectedFY + 1, 2, 31, 23, 59, 59, 999).getTime();
      
      if (uTime < fyStart || uTime > fyEnd) return false;
      
      if (getMonthRange) {
        if (uTime < getMonthRange.start || uTime > getMonthRange.end) return false;
      }
      return true;
    });
  }, [deals, selectedFY, getMonthRange]);

  const totalValue = closedDeals.reduce((sum: number, d: any) => sum + (Number(d.quotation) || 0), 0);

  const formatRp = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  return (
    <div style={{ padding: "0 24px", marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Archive size={20} color="#6366f1" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#323338" }}>Lost & Closed Projects</h2>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
            style={{ padding: "8px 12px", background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#475569", outline: "none", cursor: "pointer" }}>
            {MONTH_OPTIONS.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select value={selectedFY} onChange={e => setSelectedFY(Number(e.target.value))}
            style={{ padding: "8px 12px", background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#475569", outline: "none", cursor: "pointer" }}>
            {fyOptions.map((fy: number) => (
              <option key={fy} value={fy}>FY{fy} {fy === currentFY ? "(Current)" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" onClick={() => setIsModalOpen(true)} style={{ cursor: "pointer" }}>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", 
            borderRadius: 20, 
            padding: 24, 
            color: "white",
            boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 160
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>Total Value (Lost & Closed)</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>FY{selectedFY} {selectedMonth > 0 ? MONTH_OPTIONS.find((m:any) => m.value === selectedMonth)?.label : ""}</p>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
              <TrendingUp size={24} color="white" />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.02em" }}>{formatRp(totalValue)}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{closedDeals.length} projects in archive</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} style={{ background: "white", borderRadius: 20, border: "1px solid #e2e8f0", padding: 20, maxHeight: 300, overflowY: "auto" }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: "#475569", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Lost & Closed Projects</h3>
          {closedDeals.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {closedDeals.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 10).map((deal: any) => (
                <div key={deal.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "#f8fafc", borderRadius: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{deal.project_name}</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginTop: 4 }}>{deal.client_name} • PIC: {deal.pic}</div>
                  </div>
                  <div style={{ textAlign: "right", marginLeft: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>{formatRp(Number(deal.quotation) || 0)}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginTop: 4 }}>{new Date(deal.updated_at).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
              No lost or closed projects found for the selected period.
            </div>
          )}
        </motion.div>
      </div>

      <LostAndClosedAnalyticsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        deals={closedDeals} 
      />
    </div>
  );
}
