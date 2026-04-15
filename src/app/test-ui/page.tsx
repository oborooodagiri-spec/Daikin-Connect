"use client";

import React from "react";
import UnitDetailModal from "@/components/UnitDetailModal";
import DashboardHome from "@/app/dashboard/page"; // This might be a server component or have auth
// I'll just import some key components to build a "Fake" dashboard for the screenshot.
import { Activity, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function UIPreviewPage() {
  return (
    <div className="p-8 bg-[#070514] min-h-screen text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Mock Dashboard Header */}
        <div className="flex justify-between items-center bg-[#1e1b4b]/50 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl">
           <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Command Center</h1>
              <p className="text-slate-400">Operational Real-time Monitoring</p>
           </div>
           <div className="flex gap-4">
              <div className="text-right">
                 <p className="text-[10px] font-bold text-[#00f2ff] uppercase tracking-widest">System Health</p>
                 <p className="text-2xl font-black">98.4%</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#00f2ff]/20 flex items-center justify-center text-[#00f2ff]">
                 <Activity size={24} />
              </div>
           </div>
        </div>

        {/* Mock Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-4">
              <ShieldCheck className="text-[#00f2ff]" size={32} />
              <h3 className="text-xl font-bold uppercase">Audit Compliance</h3>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full w-full bg-[#00f2ff]" />
              </div>
              <p className="text-sm text-slate-400">100% Verified Reports</p>
           </div>
           
           <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-4">
              <Zap className="text-[#00f2ff]" size={32} />
              <h3 className="text-xl font-bold uppercase">Unit Passport</h3>
              <p className="text-sm text-slate-400">Instant QR Identification for over 500+ Assets.</p>
           </div>

           <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-4">
              <BarChart3 className="text-[#00f2ff]" size={32} />
              <h3 className="text-xl font-bold uppercase">Efficiency Tracking</h3>
              <p className="text-sm text-slate-400">Energy and performance metrics visualized in real-time.</p>
           </div>
        </div>

        {/* Fake Report Table */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden">
           <div className="p-6 border-b border-white/5 bg-white/5">
              <p className="text-xs font-black uppercase tracking-widest text-[#00f2ff]">Recent Maintenance Logs</p>
           </div>
           <table className="w-full text-left text-sm">
              <thead>
                 <tr className="text-slate-500 uppercase text-[10px] tracking-widest border-b border-white/5">
                    <th className="p-6">Unit ID</th>
                    <th className="p-6">Type</th>
                    <th className="p-6">Date</th>
                    <th className="p-6">Status</th>
                 </tr>
              </thead>
              <tbody>
                 <tr className="border-b border-white/5">
                    <td className="p-6 font-bold">DAI-CH-001</td>
                    <td className="p-6 text-slate-400 uppercase">Preventive</td>
                    <td className="p-6">Oct 12, 2023</td>
                    <td className="p-6"><span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold">COMPLETED</span></td>
                 </tr>
                 <tr>
                    <td className="p-6 font-bold">DAI-AHU-042</td>
                    <td className="p-6 text-slate-400 uppercase">Audit</td>
                    <td className="p-6">Oct 11, 2023</td>
                    <td className="p-6"><span className="px-3 py-1 bg-[#00f2ff]/10 text-[#00f2ff] rounded-full text-[10px] font-bold">SYNCED</span></td>
                 </tr>
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
