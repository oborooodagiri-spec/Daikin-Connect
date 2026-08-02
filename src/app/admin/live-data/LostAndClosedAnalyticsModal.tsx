import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, AlertTriangle, Archive, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

export default function LostAndClosedAnalyticsModal({ isOpen, onClose, deals }: any) {
  const stats = useMemo(() => {
    let lostCount = 0, closedCount = 0;
    let lostValue = 0, closedValue = 0;
    const byPic: Record<string, { lost: number, closed: number, lostVal: number, closedVal: number }> = {};
    const byArea: Record<string, { lost: number, closed: number, lostVal: number, closedVal: number }> = {};
    const byCategory: Record<string, { lost: number, closed: number, lostVal: number, closedVal: number }> = {};
    
    // For timeline (by month of updated_at)
    const timelineData: Record<string, { lostValue: number, closedValue: number }> = {};

    deals.forEach((d: any) => {
      const val = Number(d.quotation) || 0;
      const isLost = d.status === 'L' && !d.is_closed;
      const isClosed = d.is_closed;

      if (isLost) {
        lostCount++;
        lostValue += val;
      }
      if (isClosed) {
        closedCount++;
        closedValue += val;
      }

      // PIC
      const pic = d.pic || "Unassigned";
      if (!byPic[pic]) byPic[pic] = { lost: 0, closed: 0, lostVal: 0, closedVal: 0 };
      if (isLost) { byPic[pic].lost++; byPic[pic].lostVal += val; }
      if (isClosed) { byPic[pic].closed++; byPic[pic].closedVal += val; }

      // Area
      const area = d.area || "Unassigned";
      if (!byArea[area]) byArea[area] = { lost: 0, closed: 0, lostVal: 0, closedVal: 0 };
      if (isLost) { byArea[area].lost++; byArea[area].lostVal += val; }
      if (isClosed) { byArea[area].closed++; byArea[area].closedVal += val; }

      // Category
      const cat = d.category || "Unassigned";
      if (!byCategory[cat]) byCategory[cat] = { lost: 0, closed: 0, lostVal: 0, closedVal: 0 };
      if (isLost) { byCategory[cat].lost++; byCategory[cat].lostVal += val; }
      if (isClosed) { byCategory[cat].closed++; byCategory[cat].closedVal += val; }

      // Timeline (Updated At Month)
      const uDate = new Date(d.updated_at);
      const monthKey = `${uDate.getFullYear()}-${String(uDate.getMonth() + 1).padStart(2, '0')}`;
      if (!timelineData[monthKey]) timelineData[monthKey] = { lostValue: 0, closedValue: 0 };
      if (isLost) timelineData[monthKey].lostValue += val;
      if (isClosed) timelineData[monthKey].closedValue += val;
    });

    // Formatting for Recharts
    const picData = Object.keys(byPic).map(key => ({
      name: key,
      Lost: byPic[key].lostVal,
      Closed: byPic[key].closedVal
    })).sort((a, b) => (b.Lost + b.Closed) - (a.Lost + a.Closed)).slice(0, 10); // Top 10

    const areaData = Object.keys(byArea).map(key => ({
      name: key,
      Lost: byArea[key].lostVal,
      Closed: byArea[key].closedVal
    })).sort((a, b) => (b.Lost + b.Closed) - (a.Lost + a.Closed)).slice(0, 10);

    const categoryData = Object.keys(byCategory).map(key => ({
      name: key,
      value: byCategory[key].lostVal + byCategory[key].closedVal,
      Lost: byCategory[key].lostVal,
      Closed: byCategory[key].closedVal
    })).sort((a, b) => b.value - a.value);

    const timelineArray = Object.keys(timelineData).sort().map(key => ({
      name: key,
      Lost: timelineData[key].lostValue,
      Closed: timelineData[key].closedValue
    }));

    return {
      lostCount, closedCount, lostValue, closedValue,
      picData, areaData, categoryData, timelineArray
    };
  }, [deals]);

  if (!isOpen) return null;

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

  const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#6366f1'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-50 w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Archive className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Closed & Lost Projects Analytics</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Total Closed Value</p>
                <p className="text-xl font-black text-slate-800">{formatRp(stats.closedValue)}</p>
                <p className="text-xs font-semibold text-emerald-600 mt-1">{stats.closedCount} projects</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Total Lost Value</p>
                <p className="text-xl font-black text-slate-800">{formatRp(stats.lostValue)}</p>
                <p className="text-xs font-semibold text-rose-600 mt-1">{stats.lostCount} projects</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-100 uppercase">Combined Value</p>
                <p className="text-xl font-black text-white">{formatRp(stats.closedValue + stats.lostValue)}</p>
                <p className="text-xs font-semibold text-indigo-100 mt-1">{stats.closedCount + stats.lostCount} projects processed</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wide">Historical Timeline Projection</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.timelineArray}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tickFormatter={(val) => {
                      if (val >= 1e12) return `Rp ${(val / 1e12).toFixed(1)}T`;
                      if (val >= 1e9) return `Rp ${(val / 1e9).toFixed(1)}M`;
                      if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(1)}Jt`;
                      return `Rp ${val}`;
                    }} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
                    <RechartsTooltip formatter={(val: any) => formatRp(Number(val) || 0)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 20 }} />
                    <Line type="monotone" dataKey="Closed" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Lost" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales PIC Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wide">Top PICs (Closed vs Lost)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.picData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tickFormatter={(val) => {
                      if (val >= 1e12) return `Rp ${(val / 1e12).toFixed(1)}T`;
                      if (val >= 1e9) return `Rp ${(val / 1e9).toFixed(1)}M`;
                      if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(1)}Jt`;
                      return `Rp ${val}`;
                    }} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} width={80} />
                    <RechartsTooltip formatter={(val: any) => formatRp(Number(val) || 0)} cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                    <Bar dataKey="Closed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Lost" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wide">Area Distribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.areaData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tickFormatter={(val) => {
                      if (val >= 1e12) return `Rp ${(val / 1e12).toFixed(1)}T`;
                      if (val >= 1e9) return `Rp ${(val / 1e9).toFixed(1)}M`;
                      if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(1)}Jt`;
                      return `Rp ${val}`;
                    }} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
                    <RechartsTooltip formatter={(val: any) => formatRp(Number(val) || 0)} cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                    <Bar dataKey="Closed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Lost" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold text-slate-700 w-full mb-2 uppercase tracking-wide">Category Breakdown</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val: any) => formatRp(Number(val) || 0)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
