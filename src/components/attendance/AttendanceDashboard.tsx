"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, Calendar, ChevronRight, Clock, MapPin, 
  User, CheckCircle2, AlertCircle, History, Fingerprint,
  MoreVertical, Download, X, FileImage, UserMinus, AlertTriangle, FastForward
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { id } from "date-fns/locale/id";
import dynamic from "next/dynamic";
import { getAttendanceHistory, getAttendanceStats, getActiveAttendance } from "@/app/actions/attendance";
import { generateAttendancePDF } from "@/lib/attendance-pdf-generator";
import { motion, AnimatePresence } from "framer-motion";

const AttendanceClient = dynamic(() => import("./AttendanceClient"), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
});

export default function AttendanceDashboard({ 
  projects, 
  session 
}: { 
  projects: {
    id: string; 
    name: string; 
    shift_start_time?: string; 
    shift_end_time?: string; 
    radius_meters?: number;
  }[]; 
  session: any; 
}) {
  const [activeTab, setActiveTab] = useState<"riwayat" | "absensi" | "shift">("riwayat");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects.length === 1 ? projects[0].id : null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function autoSelectActiveProject() {
      try {
        const res = await getActiveAttendance("empty");
        if (res && (res as any).success && (res as any).data) {
          setSelectedProjectId(String((res as any).data.project_id));
          setActiveTab("absensi"); // Langsung ke tab absensi jika ada sesi aktif
        }
      } catch (err) {
        console.error("Auto-select active project error:", err);
      }
    }
    if (isMounted) {
      autoSelectActiveProject();
    }
  }, [isMounted]);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    const [histRes, statsRes] = await Promise.all([
      getAttendanceHistory(selectedMonth.getMonth(), selectedMonth.getFullYear()),
      getAttendanceStats(selectedMonth.getMonth(), selectedMonth.getFullYear())
    ]);

    if ((histRes as any).success) setHistory((histRes as any).data);
    if ((statsRes as any).success) setStats((statsRes as any).data);
    setLoading(false);
  };

  const handlePrevMonth = () => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleExportPDF = async () => {
    if (history.length === 0 || !session) return;
    setExporting(true);
    try {
      const userForPDF = {
        id: parseInt(session.userId),
        name: session.name,
        email: session.email,
        company_name: session.company_name || null
      };
      await generateAttendancePDF(userForPDF, history, selectedMonth, "MY ATTENDANCE RECORD");
    } catch (err) {
      console.error("Failed to export PDF:", err);
    } finally {
      setExporting(false);
    }
  };

  const renderHistory = () => {
    if (loading) return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

    return (
      <div className="p-4 space-y-6 pb-24">
        {/* Month Navigation & PDF Export */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-1.5">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-black text-slate-700 min-w-[110px] text-center text-xs uppercase tracking-wider">
                {format(selectedMonth, "MMMM yyyy", { locale: id })}
              </span>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
           </div>
           
           <button 
             onClick={handleExportPDF}
             disabled={exporting || history.length === 0}
             className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-100 flex items-center gap-1.5"
           >
             {exporting ? (
               <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
             ) : (
               <Download size={12} />
             )}
             Export PDF
           </button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
           <StatItem label="Absent" value={stats?.absent || 0} icon={UserMinus} colorClass="text-rose-600" bgClass="bg-rose-50" />
           <StatItem label="Late In" value={stats?.late || 0} icon={AlertTriangle} colorClass="text-amber-600" bgClass="bg-amber-50" />
           <StatItem label="Early Out" value={stats?.earlyOut || 0} icon={FastForward} colorClass="text-orange-600" bgClass="bg-orange-50" />
           <StatItem label="No Clock In" value={stats?.noClockIn || 0} icon={Clock} colorClass="text-slate-500" bgClass="bg-slate-100" />
           <StatItem label="No Clock Out" value={stats?.noClockOut || 0} icon={History} colorClass="text-slate-500" bgClass="bg-slate-100" />
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
                                {item.check_out_photo && item.check_out_photo !== "" ? format(new Date(item.check_out_time), "HH:mm") : "-"}
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
      <div className="bg-white/90 backdrop-blur-md text-[#323338] p-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
         <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
               <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <h1 className="text-lg font-black tracking-tight">Daftar Absensi</h1>
         </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 pt-4 pb-2 border-b border-slate-100 sticky top-[60px] z-40">
         <div className="flex p-1 bg-slate-50/80 border border-slate-100 rounded-2xl">
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
           <div className="p-4 space-y-6 pb-24">
              {/* Premium Shift Header Card */}
              <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-6 border border-blue-800 shadow-md relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                 <div className="flex items-start gap-4 relative z-10">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-blue-300">
                       <Clock size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black tracking-wide uppercase">Jadwal Shift Kerja</h3>
                       <p className="text-[11px] text-blue-100/80 font-medium mt-1 leading-relaxed">
                          Jadwal shift kerja ditentukan secara dinamis per proyek oleh administrator. Keterlambatan check-in atau kepulangan lebih awal akan tercatat secara otomatis pada sistem.
                       </p>
                    </div>
                 </div>
              </div>

              {/* Projects Shift List */}
              <div className="space-y-4">
                 {projects.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                       <Clock size={40} className="mx-auto mb-3 opacity-20" />
                       <p className="text-sm">Belum ada proyek yang ditugaskan</p>
                    </div>
                 ) : (
                    projects.map((project) => {
                       const start = project.shift_start_time || "08:00";
                       const end = project.shift_end_time || "17:00";
                       const radius = project.radius_meters || 100;
                       return (
                          <div 
                             key={project.id} 
                             className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 hover:border-blue-200 transition-colors"
                          >
                             <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                      LOKASI PROYEK
                                   </p>
                                   <h4 className="text-sm font-black text-slate-800 leading-snug">
                                      {project.name}
                                   </h4>
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100 flex items-center gap-1">
                                   <MapPin size={10} /> {radius}m Radius
                                </span>
                             </div>
                             
                             <div className="h-[1px] bg-slate-100" />
                             
                             <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50/80 rounded-xl space-y-1 border border-slate-100">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> JAM MASUK
                                   </span>
                                   <p className="text-sm font-black text-slate-700">{start}</p>
                                </div>
                                
                                <div className="p-3 bg-slate-50/80 rounded-xl space-y-1 border border-slate-100">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> JAM PULANG
                                   </span>
                                   <p className="text-sm font-black text-slate-700">{end}</p>
                                </div>
                             </div>
                          </div>
                       );
                    })
                 )}
              </div>
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
      className={`flex-1 py-2.5 px-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${active ? 'bg-white text-[#0073ea] shadow-sm border border-slate-100/50' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {children}
    </button>
  );
}

function StatItem({ label, value, icon: Icon, colorClass, bgClass }: { label: string, value: number, icon: any, colorClass: string, bgClass: string }) {
  return (
    <div className="flex flex-col bg-white p-3.5 rounded-2xl border border-slate-100 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.05)] transition-all hover:shadow-md hover:-translate-y-0.5">
       <div className={`w-8 h-8 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center mb-2.5 shrink-0`}>
          <Icon size={14} />
       </div>
       <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5 line-clamp-1">{label}</p>
       <p className={`text-xl font-black text-slate-800 tracking-tight`}>{value}</p>
    </div>
  );
}

function HistoryDetailModal({ item, onClose }: { item: any; onClose: () => void }) {
  const shiftStart = item.projects?.shift_start_time || "08:00";
  const shiftEnd = item.projects?.shift_end_time || "17:00";

  let isLate = false;
  let lateMinutes = 0;
  if (item.check_in_time) {
    const checkIn = new Date(item.check_in_time);
    const [sh, sm] = shiftStart.split(":").map(Number);
    const checkInMins = checkIn.getHours() * 60 + checkIn.getMinutes();
    const shiftStartMins = sh * 60 + sm;
    if (checkInMins > shiftStartMins) {
      isLate = true;
      lateMinutes = checkInMins - shiftStartMins;
    }
  }

  let isEarlyOut = false;
  let earlyMinutes = 0;
  if (item.check_out_time && item.check_out_photo && item.check_out_photo !== "") {
    const checkOut = new Date(item.check_out_time);
    const [eh, em] = shiftEnd.split(":").map(Number);
    const checkOutMins = checkOut.getHours() * 60 + checkOut.getMinutes();
    const shiftEndMins = eh * 60 + em;
    if (checkOutMins < shiftEndMins) {
      isEarlyOut = true;
      earlyMinutes = shiftEndMins - checkOutMins;
    }
  }

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
                <PhotoCard label="Clock Out" url={item.check_out_photo} time={item.check_out_photo && item.check_out_photo !== "" ? item.check_out_time : null} color="rose" />
             </div>

             {/* Dynamic Compliance & Shift Info Banner */}
             {isLate || isEarlyOut ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                   <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                      <AlertCircle size={12} /> Status Kedisiplinan
                   </p>
                   <div className="space-y-1">
                      {isLate && (
                         <p className="text-xs font-bold text-amber-800">
                            Terlambat Check-in: <span className="text-rose-600">+{lateMinutes} menit</span> (Jadwal: {shiftStart})
                         </p>
                      )}
                      {isEarlyOut && (
                         <p className="text-xs font-bold text-amber-800">
                            Pulang Lebih Awal: <span className="text-rose-600">-{earlyMinutes} menit</span> (Jadwal: {shiftEnd})
                         </p>
                      )}
                   </div>
                </div>
             ) : item.check_in_time && item.check_out_time && item.check_out_photo && item.check_out_photo !== "" ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 mb-1">
                      <CheckCircle2 size={12} /> Status Kedisiplinan
                   </p>
                   <p className="text-xs font-bold text-emerald-800">
                      Sesuai Jadwal (Tepat waktu sesuai shift proyek: {shiftStart} - {shiftEnd})
                   </p>
                </div>
             ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                      <Clock size={12} /> Info Shift Proyek
                   </p>
                   <p className="text-xs font-bold text-slate-700">
                      Shift Aktif: {shiftStart} - {shiftEnd}
                   </p>
                </div>
             )}

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
                         {item.check_out_photo && item.check_out_photo !== "" ? 
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
