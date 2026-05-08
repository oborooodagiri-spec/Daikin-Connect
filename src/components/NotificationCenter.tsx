"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Check, X, Clock, Info, AlertTriangle, 
  CheckCircle2, BellRing, Settings, Trash2, ExternalLink,
  PlusCircle, Edit3, Trash, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getMyNotifications, markAsRead } from "@/app/actions/notifications";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Prepare sound
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audioRef.current.volume = 0.3;
  }, []);

  const fetchNotifications = async () => {
    const res = await getMyNotifications();
    if (res.success && res.data) {
      // Check for new unread notifications to trigger sound
      const prevUnreadCount = notifications.filter(n => !n.is_read).length;
      const currentUnreadCount = res.data.filter((n: any) => !n.is_read).length;
      
      if (currentUnreadCount > prevUnreadCount) {
        audioRef.current?.play().catch(() => {});
      }
      
      setNotifications(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [notifications.length]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: number, link?: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    if (link) {
      setIsOpen(false);
      router.push(link);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0073ea] group transition-all"
      >
        <motion.div
           animate={{ 
             rotate: unreadCount > 0 ? [0, -10, 10, -10, 10, 0] : 0,
           }}
           transition={{ 
             duration: 0.5, 
             repeat: unreadCount > 0 ? Infinity : 0, 
             repeatDelay: 3 
           }}
        >
          <Bell size={20} className={unreadCount > 0 ? "text-[#0073ea] fill-[#0073ea]/10" : "text-slate-400 group-hover:text-[#0073ea]"} />
        </motion.div>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#0073ea] text-white border-2 border-white rounded-full text-[9px] font-black flex items-center justify-center shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[999] bg-slate-900/10 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed top-0 left-0 w-full h-full md:top-20 md:left-auto md:right-[22px] md:w-[26rem] md:h-auto md:max-h-[75vh] bg-white border border-slate-200 md:rounded-[2.5rem] shadow-2xl z-[1000] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex flex-row-reverse items-center justify-between bg-white sticky top-0 z-10">
                <div className="text-right">
                   <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center justify-end gap-2 italic">
                     <span className="not-italic text-[#0073ea]">Notifikasi</span> System
                   </h4>
                   <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{unreadCount} UNREAD UPDATES</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                {notifications.length === 0 ? (
                  <div className="py-20 px-8 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 text-[#0073ea] rounded-full flex items-center justify-center shadow-inner">
                       <BellRing size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-widest">No Notifications Yet</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 italic">Everything is quiet across the platform.</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <NotificationItem 
                        key={n.id} 
                        notification={n} 
                        onClick={() => handleMarkAsRead(n.id, n.link)} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 bg-white border-t border-slate-100 text-center">
                   <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0073ea] transition-colors">
                      Clear All Notifications
                   </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ notification, onClick }: any) {
  const isUnread = !notification.is_read;
  const timeStr = new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = new Date(notification.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });

  const icons: any = {
    success: <CheckCircle2 size={16} className="text-emerald-500" />,
    warning: <AlertTriangle size={16} className="text-amber-500" />,
    error: <Zap size={16} className="text-rose-500" />,
    info: <Info size={16} className="text-[#0073ea]" />,
    alert: <BellRing size={16} className="text-[#0073ea]" />,
  };

  const bgs: any = {
    success: "bg-emerald-50",
    warning: "bg-amber-50",
    error: "bg-rose-50",
    info: "bg-blue-50",
    alert: "bg-blue-50",
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full p-6 text-left transition-all hover:bg-white flex gap-4 border-l-4 ${isUnread ? "bg-white border-[#0073ea]" : "bg-slate-50/30 border-transparent opacity-80"}`}
    >
      <div className={`w-10 h-10 rounded-2xl ${bgs[notification.type] || bgs.info} flex items-center justify-center shrink-0 shadow-sm`}>
        {icons[notification.type] || icons.info}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1 gap-4">
          <h5 className={`text-[11px] font-black uppercase tracking-tight truncate ${isUnread ? "text-slate-800" : "text-slate-500"}`}>
            {notification.title}
          </h5>
          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-tighter shrink-0">{dateStr}, {timeStr}</span>
        </div>
        <p className={`text-[10px] leading-relaxed line-clamp-2 ${isUnread ? "text-slate-600 font-medium" : "text-slate-400"}`}>
          {notification.message}
        </p>
        
        {notification.link && (
          <div className="mt-3 flex items-center gap-1 text-[9px] font-black text-[#0073ea] uppercase tracking-widest group">
            Open Detail <ExternalLink size={10} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
      
      {isUnread && (
        <div className="w-2 h-2 rounded-full bg-[#0073ea] mt-2 animate-pulse shrink-0" />
      )}
    </button>
  );
}
