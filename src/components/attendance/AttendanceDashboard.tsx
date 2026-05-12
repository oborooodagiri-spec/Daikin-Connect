"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, Calendar, ChevronRight, Clock, MapPin, 
  User, CheckCircle2, AlertCircle, History, Fingerprint,
  MoreVertical, Download
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import AttendanceClient from "./AttendanceClient";
import { getAttendanceHistory, getAttendanceStats } from "@/app/actions/attendance";
import { motion, AnimatePresence } from "framer-motion";

export default function AttendanceDashboard({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState<"riwayat" | "absensi" | "shift">("riwayat");
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    const [histRes, statsRes] = await Promise.all([
      getAttendanceHistory(selectedMonth.getMonth(), selectedMonth.getFullYear()),
      getAttendanceStats(selectedMonth.getMonth(), selectedMonth.getFullYear())
    ]);

    if (histRes.success) setHistory(histRes.data);
    if (statsRes.success) setStats(statsRes.data);
    setLoading(false);
  };

  const renderHistory = () => {
    if (loading) return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

    return (
      <div className="p-4 space-y-6 pb-24">
        {/* Month Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                 <Calendar size={20} />
              </div>
              <span className="font-bold text-slate-700">
                {format(selectedMonth, "MMMM yyyy", { locale: id })}
              </span>
           </div>
           <MoreVertical size={20} className="text-slate-400" />
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <div className="grid grid-cols-3 gap-4 relative z-10">
              <StatItem label="Absent" value={stats?.absent || 0} />
              <StatItem label="Late clock in" value={stats?.late || 0} />
              <StatItem label="Early clock out" value={stats?.earlyOut || 0} />
              <StatItem label="No clock in" value={stats?.noClockIn || 0} />
              <StatItem label="No clock out" value={stats?.noClockOut || 0} />
           </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
           {history.length === 0 ? (
             <div className="text-center py-12 text-slate-400">
                <History size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Belum ada riwayat absensi bulan ini</p>
             </div>
           ) : (
             history.map((item, idx) => (
               <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                     <div className="text-left">
                        <p className="text-[13px] font-black text-slate-700">
                           {format(new Date(item.check_in_time), "dd MMM")}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                           Jam kerja
                        </p>
                     </div>
                     <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                     <div className="flex items-center gap-6">
                        <div className="text-center">
                           <p className="text-sm font-bold text-slate-800">
                              {format(new Date(item.check_in_time), "HH:mm")}
                           </p>
                        </div>
                        <div className="text-center">
                           <p className="text-sm font-bold text-slate-800">
                              {item.check_out_time ? format(new Date(item.check_out_time), "HH:mm") : "-"}
                           </p>
                        </div>
                     </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
               </div>
             ))
           )}
        </div>
      </div>
    );
  };

  if (!isMounted) return <div className="min-h-screen bg-[#f8fafc]" />;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Header */}
      <div className="bg-[#e11d48] text-white p-4 pb-10 flex items-center gap-4 sticky top-0 z-50 shadow-lg">
         <button onClick={() => window.history.back()} className="p-2 hover:bg-white/10 rounded-full">
            <ChevronLeft size={24} />
         </button>
         <h1 className="text-xl font-black tracking-tight">Daftar Absensi</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 -mt-6 pt-2 rounded-t-[2.5rem] border-b border-slate-100 sticky top-[64px] z-40">
         <div className="flex justify-around">
            <TabItem active={activeTab === "riwayat"} onClick={() => setActiveTab("riwayat")}>Riwayat</TabItem>
            <TabItem active={activeTab === "absensi"} onClick={() => setActiveTab("absensi")}>Absensi</TabItem>
            <TabItem active={activeTab === "shift"} onClick={() => setActiveTab("shift")}>Shift</TabItem>
         </div>
      </div>

      <main className="max-w-md mx-auto">
         {activeTab === "riwayat" && renderHistory()}
         {activeTab === "absensi" && (
           <div className="py-4">
              <AttendanceClient projectId={projectId} />
           </div>
         )}
         {activeTab === "shift" && (
           <div className="p-8 text-center text-slate-400">
              <Clock size={48} className="mx-auto mb-4 opacity-20" />
              <p>Halaman Shift akan segera hadir</p>
           </div>
         )}
      </main>

      {/* Bottom Nav Mock (Floating Action or just spacer) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-around md:hidden">
         {/* Simple spacing for mobile home button */}
      </div>
    </div>
  );
}

function TabItem({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`py-3 px-6 text-sm font-black transition-all relative ${active ? 'text-blue-600' : 'text-slate-400'}`}
    >
      {children}
      {active && (
        <motion.div 
          layoutId="activeTab" 
          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
        />
      )}
    </button>
  );
}

function StatItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="text-left">
       <p className="text-[11px] font-bold text-slate-500 mb-1 leading-tight">{label}</p>
       <p className="text-xl font-black text-slate-800">{value}</p>
    </div>
  );
}
