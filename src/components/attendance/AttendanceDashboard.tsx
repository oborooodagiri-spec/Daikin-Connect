"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, Calendar, ChevronRight, Clock, MapPin, 
  User, CheckCircle2, AlertCircle, History, Fingerprint,
  MoreVertical, Download, X, FileImage
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { id } from "date-fns/locale/id";
import dynamic from "next/dynamic";
import { getAttendanceHistory, getAttendanceStats } from "@/app/actions/attendance";
import { motion, AnimatePresence } from "framer-motion";

const AttendanceClient = dynamic(() => import("./AttendanceClient"), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
});

export default function AttendanceDashboard({ projects }: { projects: {id: string, name: string}[] }) {
  const [activeTab, setActiveTab] = useState<"riwayat" | "absensi" | "shift">("riwayat");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects.length === 1 ? projects[0].id : null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

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
                <div 
                  key={idx} 
                  onClick={() => setSelectedHistory(item)}
                  className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer group"
                >
                   <div className="flex items-center gap-4">
                      <div className="text-left">
                         <p className="text-[13px] font-black text-slate-700">
                            {item.check_in_time ? format(new Date(item.check_in_time), "dd MMM") : "-"}
                         </p>
                         <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                            {item.projects?.name || 'Jam kerja'}
                         </p>
                      </div>
                      <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                      <div className="flex items-center gap-6">
                         <div className="text-center">
                            <p className="text-sm font-bold text-slate-800">
                               {item.check_in_time ? format(new Date(item.check_in_time), "HH:mm") : "-"}
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

        <AnimatePresence>
          {selectedHistory && (
             <HistoryDetailModal 
                item={selectedHistory} 
                onClose={() => setSelectedHistory(null)} 
             />
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (!isMounted) return <div className="min-h-screen bg-[#f8fafc]" />;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Header */}
      <div className="bg-[#003366] text-white p-4 pb-14 flex items-center gap-4 sticky top-0 z-50 shadow-lg">
         <button onClick={() => window.history.back()} className="p-2 hover:bg-white/10 rounded-full">
            <ChevronLeft size={24} />
         </button>
         <h1 className="text-xl font-bold">Daftar Absensi</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 -mt-10 pt-6 rounded-t-[3rem] border-b border-slate-100 sticky top-[72px] z-40">
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
               {selectedProjectId ? (
                  <AttendanceClient 
                    projectId={selectedProjectId} 
                    onProjectLocked={(id) => setSelectedProjectId(id)}
                  />
               ) : (
                  <div className="p-6 space-y-6">
                     <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-center">
                        <MapPin className="mx-auto mb-3 text-blue-600" size={32} />
                        <h3 className="text-lg font-black text-slate-800">Pilih Lokasi Proyek</h3>
                        <p className="text-xs font-medium text-slate-500 mt-2">
                           Anda terdaftar di beberapa lokasi. Silakan pilih lokasi tempat Anda bekerja saat ini.
                        </p>
                     </div>

                     <div className="space-y-3">
                        {projects.map((p) => (
                           <button
                              key={p.id}
                              onClick={() => setSelectedProjectId(p.id)}
                              className="w-full bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between hover:border-blue-500 hover:bg-blue-50/30 transition-all group shadow-sm"
                           >
                              <div className="flex items-center gap-4 text-left">
                                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Fingerprint size={20} />
                                 </div>
                                 <span className="font-bold text-slate-700 group-hover:text-blue-700">{p.name}</span>
                              </div>
                              <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                           </button>
                        ))}
                     </div>
                  </div>
               )}
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
        <div 
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

function HistoryDetailModal({ item, onClose }: { item: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
       <motion.div 
         initial={{ opacity: 0 }} 
         animate={{ opacity: 1 }} 
         exit={{ opacity: 0 }}
         onClick={onClose}
         className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
       />
       <motion.div 
         initial={{ y: "100%" }} 
         animate={{ y: 0 }} 
         exit={{ y: "100%" }}
         className="relative w-full max-w-md bg-white rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl"
       >
          <div className="p-8 pb-4 flex justify-between items-start">
             <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Attendance Information</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                   {item.check_in_time ? format(new Date(item.check_in_time), "EEEE, dd MMMM yyyy", { locale: id }) : "-"}
                </p>
             </div>
             <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
             </button>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
             <div className="grid grid-cols-2 gap-4">
                <PhotoCard label="Clock In" url={item.check_in_photo} time={item.check_in_time} color="emerald" />
                <PhotoCard label="Clock Out" url={item.check_out_photo} time={item.check_out_time} color="rose" />
             </div>

             <div className="space-y-4">
                <div className="flex items-start gap-4">
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <MapPin size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasi Proyek</p>
                      <p className="text-sm font-bold text-slate-700">{item.projects?.name || 'Unknown Site'}</p>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Clock size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Durasi Kerja</p>
                      <p className="text-sm font-bold text-slate-700">
                         {item.check_out_time ? 
                            `${Math.round((new Date(item.check_out_time).getTime() - new Date(item.check_in_time).getTime()) / 3600000)} Jam` 
                            : 'Sedang berlangsung'}
                      </p>
                   </div>
                </div>
             </div>

             {item.check_in_notes && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Catatan</p>
                   <p className="text-xs text-slate-600 italic">"{item.check_in_notes}"</p>
                </div>
             )}
          </div>
       </motion.div>
    </div>
  );
}

function PhotoCard({ label, url, time, color }: any) {
  return (
    <div className="space-y-2">
       <p className={`text-[10px] font-black text-${color}-600 uppercase tracking-widest flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`} /> {label}
       </p>
       <div className="aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group">
          {url ? (
             <img src={url} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                <FileImage size={32} className="opacity-20 mb-2" />
                <span className="text-[9px] font-black uppercase">{time ? 'Photo Missing' : 'N/A'}</span>
             </div>
          )}
          {url && (
             <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/40 backdrop-blur-md rounded-xl text-white text-[10px] font-bold text-center">
                {time ? format(new Date(time), "HH:mm") : "-"}
             </div>
          )}
       </div>
    </div>
  );
}
