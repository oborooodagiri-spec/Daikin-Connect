import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Medal } from 'lucide-react';
import { getUsersAvatarMap } from '@/app/actions/users';
import { getPartnershipPICs } from '@/app/actions/pipeline';

interface Deal {
  id: number;
  quotation: number | bigint;
  status: string;
  pic?: string | null;
  target_po_date?: string | null;
  est_booking_month?: string | null;
  [key: string]: any;
}

interface TopSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  initialFY: number;
}

const formatRp = (val: number | bigint) => {
  if (val >= 1e12) return `Rp ${(Number(val) / 1e12).toFixed(1)}T`;
  if (val >= 1e9) return `Rp ${(Number(val) / 1e9).toFixed(1)}M`;
  if (val >= 1e6) return `Rp ${(Number(val) / 1e6).toFixed(0)}Jt`;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(val));
};

export default function TopSalesModal({ isOpen, onClose, deals, initialFY }: TopSalesModalProps) {
  const [selectedFY, setSelectedFY] = useState(`FY${initialFY}`);
  const [activeRoleTab, setActiveRoleTab] = useState<'Sales Engineer' | 'Sales Partnership'>('Sales Engineer');
  const [userInfoMap, setUserInfoMap] = useState<Record<string, { avatar_url?: string | null, isSales: boolean, isSalesEngineer: boolean, isSalesPartnership: boolean, roles: string[] }>>({});

  const [partnershipPICs, setPartnershipPICs] = useState<string[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      getUsersAvatarMap().then(res => {
        if (res.success && res.data) {
          setUserInfoMap(res.data);
        }
      }).catch(err => console.error("Error fetching users:", err));
      
      getPartnershipPICs().then(res => {
        if (res) setPartnershipPICs(res);
      }).catch(err => console.error("Error fetching partnership PICs:", err));
    }
  }, [isOpen]);



  const availableFYs = useMemo(() => {
    const set = new Set<string>();
    deals.forEach(d => {
      const rawDate = d.target_po_date || d.est_booking_month;
      if (rawDate) {
        const dt = new Date(rawDate);
        if (!isNaN(dt.getTime())) {
          const m = dt.getMonth() + 1;
          const y = dt.getFullYear();
          const fy = m >= 4 ? `FY${String(y).slice(-2)}` : `FY${String(y - 1).slice(-2)}`;
          set.add(fy);
        }
      }
    });
    const arr = Array.from(set).sort();
    const initialFYStr = `FY${initialFY}`;
    if (!arr.includes(initialFYStr)) arr.push(initialFYStr);
    return arr.sort();
  }, [deals, initialFY]);

  const { leaderboard } = useMemo(() => {
    const picDataMap: Record<string, { salesValue: number, bookingValue: number, totalDeals: number }> = {};

    const fyYearStr = selectedFY.replace('FY', '');
    const fyYear = 2000 + parseInt(fyYearStr, 10);
    const fyStartTime = new Date(fyYear, 3, 1).getTime();
    const fyEndTime = new Date(fyYear + 1, 2, 31, 23, 59, 59, 999).getTime();

    deals.forEach(d => {
      if (['L', 'H'].includes(d.status)) return;

      let isIncluded = false;
      
      if (d.is_closed) {
        const ut = new Date(d.updated_at || d.created_at || Date.now()).getTime();
        if (ut >= fyStartTime && ut <= fyEndTime) {
          isIncluded = true;
        }
      } else if (d.status === 'A') {
        isIncluded = true;
      } else {
        const rawDate = d.target_po_date || d.est_booking_month || d.updated_at || d.created_at || Date.now();
        if (rawDate) {
          const dt = new Date(rawDate).getTime();
          // Include active deals that fall within or before the end of this FY
          if (!isNaN(dt) && dt <= fyEndTime) {
            isIncluded = true;
          }
        }
      }

      if (!isIncluded) return;
      
      let picName = '';
      if (activeRoleTab === 'Sales Engineer') {
        picName = d.pic?.trim() || '(Unassigned)';
      } else {
        if (!d.sales_planner || d.sales_planner.trim() === '') return;
        picName = d.sales_planner.trim();
      }
      
      if (picName !== '(Unassigned)' && picName !== '') {
        const matchingKey = Object.keys(userInfoMap).find(k => k.toLowerCase() === picName.toLowerCase());
        if (matchingKey) {
          picName = matchingKey;
        } else {
          picName = picName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
      }
      
      if (picName === '(Unassigned)' || picName === '') return;
      if (activeRoleTab === 'Sales Engineer' && partnershipPICs.includes(picName)) return;

      if (!picDataMap[picName]) {
        picDataMap[picName] = { salesValue: 0, bookingValue: 0, totalDeals: 0 };
      }
      
      picDataMap[picName].totalDeals += 1;
      
      const val = Number(d.quotation) || 0;
      if (d.is_closed) { // Closed / Sales
        picDataMap[picName].salesValue += val;
      } else if (d.status === 'A') { // PO / Booking (Not yet closed)
        picDataMap[picName].bookingValue += val;
      }
    });

    if (activeRoleTab === 'Sales Partnership') {
      partnershipPICs.forEach(pic => {
        const existingKey = Object.keys(picDataMap).find(k => k.toLowerCase() === pic.toLowerCase());
        if (!existingKey) {
          picDataMap[pic] = { salesValue: 0, bookingValue: 0, totalDeals: 0 };
        }
      });
    } else if (activeRoleTab === 'Sales Engineer') {
      Object.keys(userInfoMap).forEach(pic => {
        if (userInfoMap[pic].isSales && !partnershipPICs.includes(pic)) {
          const existingKey = Object.keys(picDataMap).find(k => k.toLowerCase() === pic.toLowerCase());
          if (!existingKey) {
            picDataMap[pic] = { salesValue: 0, bookingValue: 0, totalDeals: 0 };
          }
        }
      });
    }

    const arr = Object.keys(picDataMap)
      .map(pic => ({
        pic,
        salesValue: picDataMap[pic].salesValue,
        bookingValue: picDataMap[pic].bookingValue,
        totalDeals: picDataMap[pic].totalDeals
      }))
      .sort((a, b) => (b.bookingValue + b.salesValue) - (a.bookingValue + a.salesValue)); // Sort strictly by bookingValue, then salesValue

    return { leaderboard: arr };
  }, [deals, selectedFY, userInfoMap, activeRoleTab, partnershipPICs]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getAvatarUrl = (name: string, rank: number) => {
    const avatar = userInfoMap[name]?.avatar_url;
    if (avatar) return avatar;
    let bg = '0ea5e9';
    let color = 'fff';
    if (rank === 1) bg = 'fbbf24'; // Gold
    if (rank === 2) bg = '94a3b8'; // Silver
    if (rank === 3) bg = 'b45309'; // Bronze
    if (rank > 3) {
      bg = 'f1f5f9';
      color = '334155';
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${color}&size=128&bold=true`;
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
            width: "100%", maxWidth: 1000,
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
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 24,
                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)"
              }}>
                <Trophy size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                  Top Sales Performers
                </h2>
                
                {/* Tabs for Role Selection */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => setActiveRoleTab('Sales Engineer')}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: activeRoleTab === 'Sales Engineer' ? "#0ea5e9" : "#e2e8f0",
                      color: activeRoleTab === 'Sales Engineer' ? "#ffffff" : "#64748b",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Sales Engineer
                  </button>
                  <button
                    onClick={() => setActiveRoleTab('Sales Partnership')}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: activeRoleTab === 'Sales Partnership' ? "#0ea5e9" : "#e2e8f0",
                      color: activeRoleTab === 'Sales Partnership' ? "#ffffff" : "#64748b",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Sales Partnership
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                style={{
                  padding: "8px 16px", borderRadius: 12, border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff", fontSize: 14, fontWeight: 700, color: "#0f172a",
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
          <div style={{ padding: "40px", overflowY: "auto", flex: 1, backgroundColor: "#f8fafc" }}>
            <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {leaderboard.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: 16, fontWeight: 600 }}>
                  Belum ada data project untuk tahun buku ini.
                </div>
              ) : activeRoleTab === 'Sales Partnership' ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ width: '100%', maxWidth: 700, backgroundColor: 'white', borderRadius: 20, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: 20 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {leaderboard.map((item, idx) => (
                          <tr key={item.pic} style={{ borderBottom: idx === leaderboard.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <img src={getAvatarUrl(item.pic, 4)} alt={item.pic} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #e2e8f0' }} />
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{item.pic}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                                  <span style={{ fontSize: 14, fontWeight: 900, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Backlog</span> 
                                    {formatRp(item.bookingValue)}
                                  </span>
                                  <span style={{ fontSize: 14, fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sales</span>{formatRp(item.salesValue)}</span>
                                  <span style={{ fontSize: 15, fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>{formatRp(item.bookingValue + item.salesValue)}</span>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginTop: 2 }}>{item.totalDeals} Projects</span>
                                </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                ) : (
                  <>
                    {/* Podium Showdown */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 48, height: 350, marginTop: 40 }}>
                    
                    {/* Rank 2 (Silver) */}
                    {top3[1] && (
                      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: 140 }}>
                        <img src={getAvatarUrl(top3[1].pic, 2)} alt={top3[1].pic} style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid #cbd5e1', marginBottom: -20, zIndex: 2, backgroundColor: 'white', objectFit: 'cover' }} />
                        <div style={{ width: '100%', height: 230, background: 'linear-gradient(to top, #94a3b8, #e2e8f0)', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, color: '#334155', boxShadow: '0 10px 25px -5px rgba(148,163,184,0.4)' }}>
                          <span style={{ fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.9)', lineHeight: 1 }}>2</span>
                          <span style={{ fontSize: 13, fontWeight: 800, textAlign: 'center', padding: '0 8px', marginTop: 'auto', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', color: '#1e293b' }}>{top3[1].pic}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.7)', padding: '4px 8px', borderRadius: 10, color: '#0ea5e9' }}>Backlog {formatRp(top3[1].bookingValue)}</span>
                            <span style={{ fontSize: 11, fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.7)', padding: '4px 8px', borderRadius: 10, color: '#10b981' }}>Sales {formatRp(top3[1].salesValue)}</span>
                            <span style={{ fontSize: 12, fontWeight: 900, backgroundColor: '#94a3b8', padding: '4px 8px', borderRadius: 10, color: 'white', marginTop: 4 }}>Total {formatRp(top3[1].bookingValue + top3[1].salesValue)}</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 16 }}>{top3[1].totalDeals} Projects</span>
                        </div>
                      </motion.div>
                    )}
  
                    {/* Rank 1 (Gold) */}
                    {top3[0] && (
                      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: 160 }}>
                        <div style={{ position: 'relative' }}>
                          <img src={getAvatarUrl(top3[0].pic, 1)} alt={top3[0].pic} style={{ width: 110, height: 110, borderRadius: '50%', border: '6px solid #fbbf24', marginBottom: -30, zIndex: 2, backgroundColor: 'white', position: 'relative', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', zIndex: 3, filter: 'drop-shadow(0 4px 6px rgba(251,191,36,0.5))' }}>
                            <Medal size={40} color="#fbbf24" fill="#fef3c7" strokeWidth={1.5} />
                          </div>
                        </div>
                        <div style={{ width: '100%', height: 290, background: 'linear-gradient(to top, #0284c7, #38bdf8)', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 36, color: 'white', boxShadow: '0 20px 30px -5px rgba(2,132,199,0.5)' }}>
                          <span style={{ fontSize: 72, fontWeight: 900, color: 'rgba(255,255,255,0.95)', lineHeight: 1, textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>1</span>
                          <span style={{ fontSize: 15, fontWeight: 900, textAlign: 'center', padding: '0 8px', marginTop: 'auto', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{top3[0].pic}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 900, backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px 12px', borderRadius: 12, color: '#0284c7', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Backlog {formatRp(top3[0].bookingValue)}</span>
                            <span style={{ fontSize: 12, fontWeight: 900, backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px 12px', borderRadius: 12, color: '#059669', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Sales {formatRp(top3[0].salesValue)}</span>
                            <span style={{ fontSize: 13, fontWeight: 900, backgroundColor: '#fbbf24', padding: '5px 12px', borderRadius: 12, color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: 4 }}>Total {formatRp(top3[0].bookingValue + top3[0].salesValue)}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 20 }}>{top3[0].totalDeals} Projects</span>
                        </div>
                      </motion.div>
                    )}
  
                    {/* Rank 3 (Bronze) */}
                    {top3[2] && (
                      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: 140 }}>
                        <img src={getAvatarUrl(top3[2].pic, 3)} alt={top3[2].pic} style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid #b45309', marginBottom: -20, zIndex: 2, backgroundColor: 'white', objectFit: 'cover' }} />
                        <div style={{ width: '100%', height: 200, background: 'linear-gradient(to top, #b45309, #f59e0b)', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, color: 'white', boxShadow: '0 10px 25px -5px rgba(180,83,9,0.4)' }}>
                          <span style={{ fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.9)', lineHeight: 1 }}>3</span>
                          <span style={{ fontSize: 13, fontWeight: 800, textAlign: 'center', padding: '0 8px', marginTop: 'auto', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{top3[2].pic}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.85)', padding: '4px 8px', borderRadius: 10, color: '#d97706' }}>Backlog {formatRp(top3[2].bookingValue)}</span>
                            <span style={{ fontSize: 11, fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.85)', padding: '4px 8px', borderRadius: 10, color: '#059669' }}>Sales {formatRp(top3[2].salesValue)}</span>
                            <span style={{ fontSize: 12, fontWeight: 900, backgroundColor: '#b45309', padding: '4px 8px', borderRadius: 10, color: 'white', marginTop: 4 }}>Total {formatRp(top3[2].bookingValue + top3[2].salesValue)}</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 16 }}>{top3[2].totalDeals} Projects</span>
                        </div>
                      </motion.div>
                    )}
  
                  </div>
  
                  {/* Rest of the leaderboard */}
                  {rest.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ width: '100%', maxWidth: 700, backgroundColor: 'white', borderRadius: 20, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          {rest.map((item, idx) => (
                            <tr key={item.pic} style={{ borderBottom: idx === rest.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <td style={{ padding: '16px 24px', width: 60, textAlign: 'center', fontSize: 16, fontWeight: 900, color: '#94a3b8' }}>{idx + 4}</td>
                              <td style={{ padding: '16px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <img src={getAvatarUrl(item.pic, idx + 4)} alt={item.pic} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #e2e8f0' }} />
                                  <span style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{item.pic}</span>
                                </div>
                              </td>
                              <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: 14, fontWeight: 900, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Backlog</span> 
                                      {formatRp(item.bookingValue)}
                                    </span>
                                    <span style={{ fontSize: 14, fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sales</span>{formatRp(item.salesValue)}</span>
                                  <span style={{ fontSize: 15, fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>{formatRp(item.bookingValue + item.salesValue)}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginTop: 2 }}>{item.totalDeals} Projects</span>
                                  </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
