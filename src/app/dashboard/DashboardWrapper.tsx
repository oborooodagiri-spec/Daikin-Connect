"use client";

import { useEffect, useState } from "react";
import { getDashboardData, getTrendChartData } from "../actions/dashboard";
import SummaryCards from "../../components/dashboard/SummaryCards";
import TrendChart from "../../components/dashboard/TrendChart";
import { Clock } from "lucide-react"; // Will require standard `npm install lucide-react`

export default function DashboardWrapper() {
  const [location, setLocation] = useState("GLOBAL PARTNER");
  const [summaryData, setSummaryData] = useState({
    corrective: 0, preventive: 0, audit: 0, databaseAssets: 0, totalCustomers: 0, activeSites: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Real-time fetch based on filter changes
    async function fetchData() {
      const dbStats = await getDashboardData(location);
      setSummaryData(dbStats);

      const dbChart = await getTrendChartData(location);
      setChartData(dbChart);
    }
    fetchData();
  }, [location]);

  return (
    <div className="w-full flex-col space-y-6 flex">
      <div className="flex w-full items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-black italic tracking-tight text-[#0F3A70]">COMMAND <span className="text-[#1D212A]">CENTER</span></h1>
          <p className="flex items-center text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> {location}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            className="rounded-full px-6 py-2.5 bg-white text-xs font-black shadow-sm border border-slate-100 uppercase tracking-widest text-[#2A2B33]"
          >
            <option value="GLOBAL PARTNER">GLOBAL PARTNER</option>
            <option value="PLAZA INDONESIA">PLAZA INDONESIA</option>
            <option value="WM K">WM K</option>
          </select>
          <button className="rounded-full px-6 py-2.5 bg-white text-xs font-black shadow-sm border border-slate-100 uppercase tracking-widest text-[#2A2B33]">
            ALL PROJECT SITES
          </button>
          <button className="rounded-full px-6 py-2.5 bg-[#0F3A70] text-white text-xs font-black shadow-sm uppercase tracking-widest flex items-center gap-2">
            EXPORT
          </button>
        </div>
      </div>

      <SummaryCards data={summaryData} />

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mt-6 relative w-full h-[600px]">
        <div className="flex justify-between w-full mb-8">
          <h2 className="text-sm font-black italic tracking-widest text-[#2A2B33] border-l-4 border-cyan-400 pl-3">OPERATIONAL TREND ANALYSIS 2026</h2>
          <div className="flex gap-6 text-[10px] font-black tracking-widest text-slate-400 uppercase">
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00A0E9]"></div> AUDIT</span>
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00B06B]"></div> PREVENTIVE</span>
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#F39C12]"></div> CORRECTIVE</span>
          </div>
        </div>

        <TrendChart data={chartData} />

        <div className="absolute right-8 bottom-8 flex gap-4">
          <div className="bg-white shadow-lg rounded-2xl px-6 py-3 border border-slate-100 flex items-center gap-4">
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 opacity-60">LOCAL TIME</p>
              <p className="text-lg font-black text-[#2A2B33]">08:21:46</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
              <Clock size={16} className="text-[#00A0E9]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
