"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, AlertTriangle, ChevronRight, X, Clock, 
  MapPin, ClipboardList, Info 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getGlobalProblemUnits } from "@/app/actions/units";

export default function ProblemNotificationCenter() {
  const [problems, setProblems] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const prevStateRef = useRef<number[]>([]);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Load seen IDs from localStorage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("daikin_seen_problems");
    if (saved) setSeenIds(JSON.parse(saved));
  }, []);

  const fetchProblems = async () => {
    const res = await getGlobalProblemUnits() as any;
    if (res && "success" in res && res.success && res.data) {
      setProblems(res.data);
      
      // Detection: Any ID that wasn't in the previous fetch
      const currentIds = res.data.map((u: any) => u.id);
      const newArrived = currentIds.filter((id: number) => !prevStateRef.current.includes(id));
      
      if (newArrived.length > 0) {
        triggerFeedback();
      }
      prevStateRef.current = currentIds;
    }
  };

  const triggerFeedback = () => {
    if (typeof window !== "undefined") {
      if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    fetchProblems();
    const interval = setInterval(fetchProblems, 10000); 
    return () => clearInterval(interval);
  }, []);

  const unreadCount = problems.filter(p => !seenIds.includes(p.id)).length;

  if (!isMounted) return null;

  const handleUnitClick = (unit: any) => {
    if (!seenIds.includes(unit.id)) {
      const updated = [...seenIds, unit.id];
      setSeenIds(updated);
      localStorage.setItem("daikin_seen_problems", JSON.stringify(updated));
    }
    setIsOpen(false);
    router.push(`/w/${unit.projects.id}/dashboard/customers/${unit.projects.customer_id}/projects/${unit.projects.id}/units`);
  };


  return (
    <div className="relative">
      {/* BELL ICON WITH PULSE */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-400 group transition-all"
      >
        <motion.div
           animate={{ 
             rotate: unreadCount > 0 ? [0, -10, 10, -10, 10, 0] : 0,
             scale: unreadCount > 0 ? [1, 1.1, 1] : 1
           }}
           transition={{ 
             duration: 0.5, 
             repeat: unreadCount > 0 ? Infinity : 0, 
             repeatDelay: 2 
           }}
        >
          <Bell size={20} className={unreadCount > 0 ? "text-rose-500 fill-rose-50" : "text-slate-400 group-hover:text-[#003366]"} />
        </motion.div>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-rose-600 text-white border-2 border-white rounded-full text-[9px] font-black flex items-center justify-center shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN PANEL */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-[-120px] md:left-auto md:right-0 mt-4 w-[calc(100vw-2rem)] max-w-sm md:w-[28rem] bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-[999] overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                   <h4 className="text-[11px] font-black text-[#003366] uppercase tracking-[0.2em] flex items-center gap-2">
                     <AlertTriangle size={14} className="text-rose-500" />
                     Problem Center
                   </h4>
                   <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{unreadCount} UNREAD ALERTS</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                   <X size={14} className="text-slate-400" />
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                {problems.length === 0 ? (
                  <div className="py-12 px-8 text-center flex flex-col items-center gap-3">
                    <div className="p-4 bg-emerald-50 rounded-full text-emerald-500"><ClipboardList size={32} strokeWidth={1} /></div>
                    <p className="text-[11px] font-black text-[#003366] uppercase tracking-widest">System Operational</p>
                    <p className="text-[10px] font-medium text-slate-400 italic">No reported problems detected</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {problems.map((p: any) => {
                      const isUnread = !seenIds.includes(p.id);
                      const createdAt = new Date(p.created_at);
                      const timeStr = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                      const dateStr = createdAt.toLocaleDateString([], { month: 'short', day: 'numeric' });

                      return (
                        <button 
                          key={p.id}
                          onClick={() => handleUnitClick(p)}
                          className={`w-full p-5 text-left transition-all hover:bg-slate-50 group border-l-4 ${isUnread ? "bg-rose-50/30 border-rose-500" : "bg-white border-transparent"}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-black text-[#003366] tracking-tighter uppercase px-2 py-0.5 rounded bg-white shadow-sm border border-slate-100 italic">
                               {p.tag_number || "NO-TAG"}
                             </span>
                             <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock size={10} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{dateStr}, {timeStr}</span>
                             </div>
                          </div>
                          
                          <div className="mb-1">
                             <div className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none group-hover:text-rose-600 transition-colors">
                                UNIT {p.status}
                             </div>
                             <div className="flex items-center gap-1 mt-1.5 text-[10px] font-bold text-slate-400 max-w-[240px] truncate">
                               <MapPin size={10} className="text-[#00a1e4]" />
                               {p.projects?.name}
                             </div>
                          </div>

                          {isUnread && (
                            <div className="mt-3 flex items-center gap-2">
                               <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                               <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">NEW ALERT</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {problems.length > 0 && (
                <div className="p-4 bg-slate-50 flex items-center justify-center border-t border-slate-100">
                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     <Info size={10} />
                     Scroll to view more results
                   </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
