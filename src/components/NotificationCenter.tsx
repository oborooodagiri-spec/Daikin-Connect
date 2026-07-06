"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, X, Info, AlertTriangle,
  CheckCircle2, BellRing, ExternalLink,
  Zap, CheckCheck, Trash2
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  getMyNotifications, markAsRead, markAllAsRead, clearAllNotifications, getUnreadCount
} from "@/app/actions/notifications";

// ─── Relative Time Helper ────────────────────────────────────────────
function relativeTime(dateIn: any): string {
  if (!dateIn) return "-";
  const d = typeof dateIn === "string" ? new Date(dateIn) : dateIn;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Type Config ─────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: any; bg: string; accent: string; border: string }> = {
  success: { icon: CheckCircle2, bg: "bg-emerald-50", accent: "text-emerald-500", border: "border-emerald-400" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50", accent: "text-amber-500", border: "border-amber-400" },
  error:   { icon: Zap,           bg: "bg-rose-50",    accent: "text-rose-500",    border: "border-rose-400" },
  info:    { icon: Info,          bg: "bg-blue-50",     accent: "text-blue-500",    border: "border-blue-400" },
  alert:   { icon: BellRing,     bg: "bg-indigo-50",   accent: "text-indigo-500",  border: "border-indigo-400" },
};

// ─── Main Component ──────────────────────────────────────────────────
export default function NotificationCenter({ projectId, variant = "default" }: {
  projectId?: string;
  variant?: "default" | "fab";
}) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);

  const routeProjectId = params?.projectId as string | undefined;
  const activeProjectId = projectId || routeProjectId;
  const cleanProjectId = (activeProjectId && activeProjectId !== "empty" && activeProjectId !== "undefined")
    ? activeProjectId : undefined;

  const isGlobalMode = !cleanProjectId;

  useEffect(() => { setIsMounted(true); }, []);

  // Lightweight badge polling — only fetches count (not full data)
  const pollBadge = useCallback(async () => {
    const res = await getUnreadCount(cleanProjectId);
    if (typeof res.count === "number") setUnreadCount(res.count);
  }, [cleanProjectId]);

  // Full data fetch — only when panel is opened
  const fetchFull = useCallback(async () => {
    setLoading(true);
    const res = await getMyNotifications(cleanProjectId);
    if (res.success && res.data) {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
    }
    setLoading(false);
  }, [cleanProjectId]);

  // Badge polling every 30 seconds
  useEffect(() => {
    pollBadge();
    const interval = setInterval(pollBadge, 30000);
    return () => clearInterval(interval);
  }, [pollBadge]);

  // Fetch full data when panel opens
  useEffect(() => {
    if (isOpen) fetchFull();
  }, [isOpen, fetchFull]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleMarkAsRead = async (id: number, link?: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    if (link) { setIsOpen(false); router.push(link); }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    await markAllAsRead(cleanProjectId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    setActionLoading(false);
  };

  const handleClearAll = async () => {
    setActionLoading(true);
    await clearAllNotifications(cleanProjectId);
    setNotifications(prev => prev.filter(n => !n.is_read));
    setActionLoading(false);
  };

  if (!isMounted) return null;

  // ─── Group by project in Global Mode ─────────────────────────────
  const groupedNotifications = isGlobalMode
    ? notifications.reduce((acc: Record<string, any[]>, n) => {
        const key = n.project_name || "General";
        if (!acc[key]) acc[key] = [];
        acc[key].push(n);
        return acc;
      }, {})
    : null;

  const isFab = variant === "fab";

  return (
    <>
      {/* ─── Bell / FAB Button ──────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          isFab
            ? "fixed bottom-6 right-6 z-[190] w-14 h-14 bg-[#003366] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#004488] active:scale-95 transition-all md:hidden"
            : "relative p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0073ea] group transition-all"
        }
      >
        <motion.div
          animate={{
            rotate: unreadCount > 0 ? [0, -10, 10, -10, 10, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            repeat: unreadCount > 0 ? Infinity : 0,
            repeatDelay: 4,
          }}
        >
          <Bell
            size={isFab ? 24 : 20}
            className={
              isFab
                ? "text-white"
                : unreadCount > 0
                  ? "text-[#0073ea] fill-[#0073ea]/10"
                  : "text-slate-400 group-hover:text-[#0073ea]"
            }
          />
        </motion.div>

        {unreadCount > 0 && (
          <span className={
            isFab
              ? "absolute -top-1 -right-1 h-6 w-6 bg-rose-500 text-white border-2 border-white rounded-full text-[10px] font-black flex items-center justify-center shadow-lg"
              : "absolute -top-1 -right-1 h-5 w-5 bg-[#0073ea] text-white border-2 border-white rounded-full text-[9px] font-black flex items-center justify-center shadow-lg"
          }>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ─── Notification Panel ─────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-slate-900/20 backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel — Mobile: slide up from bottom. Desktop: dropdown from top-right */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="fixed inset-x-0 bottom-0 z-[201] max-h-[85vh]
                sm:inset-auto sm:top-20 sm:right-6 sm:bottom-auto sm:w-[26rem] sm:max-h-[75vh]
                bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl border border-slate-200/60
                flex flex-col overflow-hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              {/* ── Header ─────────────────────────────────────── */}
              <div className="px-6 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                {/* Mobile drag handle */}
                <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-4 sm:hidden" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                      <Bell size={16} className="text-[#0073ea]" />
                      Notifications
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                      {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#0073ea] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Mark all as read"
                      >
                        <CheckCheck size={12} />
                        <span className="hidden sm:inline">Read All</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      <X size={18} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Content ────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {loading ? (
                  <div className="py-20 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#0073ea] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-20 px-8 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 text-[#0073ea] rounded-2xl flex items-center justify-center shadow-inner">
                      <BellRing size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-700 tracking-tight">No Notifications</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1">
                        Everything is running smoothly.
                      </p>
                    </div>
                  </div>
                ) : isGlobalMode && groupedNotifications ? (
                  /* ── Global Mode: Grouped by Project ──────── */
                  <div>
                    {Object.entries(groupedNotifications).map(([projectName, items]: [string, any[]]) => (
                      <div key={projectName}>
                        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 sticky top-0 z-[5]">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {projectName}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {items.map((n: any) => (
                            <NotificationItem
                              key={n.id}
                              notification={n}
                              onClick={() => handleMarkAsRead(n.id, n.link)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ── Project Mode: Flat List ──────────────── */
                  <div className="divide-y divide-slate-50">
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

              {/* ── Footer ─────────────────────────────────────── */}
              {notifications.length > 0 && (
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-center gap-4">
                  <button
                    onClick={handleClearAll}
                    disabled={actionLoading || !notifications.some(n => n.is_read)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
                  >
                    <Trash2 size={12} />
                    Clear Read
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Notification Item Component ─────────────────────────────────────
function NotificationItem({ notification, onClick }: { notification: any; onClick: () => void }) {
  const isUnread = !notification.is_read;
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
  const IconComponent = config.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full px-6 py-4 text-left transition-all hover:bg-slate-50/80 flex gap-3.5 border-l-[3px] ${
        isUnread ? `bg-white ${config.border}` : "bg-transparent border-transparent opacity-70"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
        <IconComponent size={16} className={config.accent} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-3 mb-0.5">
          <h5 className={`text-[11px] font-bold truncate leading-tight ${isUnread ? "text-slate-800" : "text-slate-500"}`}>
            {notification.title}
          </h5>
          <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap shrink-0">
            {relativeTime(notification.created_at)}
          </span>
        </div>
        <p className={`text-[10px] leading-relaxed line-clamp-2 ${isUnread ? "text-slate-600" : "text-slate-400"}`}>
          {notification.message}
        </p>

        {notification.link && (
          <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-[#0073ea] group/link">
            View Details <ExternalLink size={9} className="transition-transform group-hover/link:translate-x-0.5" />
          </div>
        )}
      </div>

      {isUnread && (
        <div className="w-2 h-2 rounded-full bg-[#0073ea] mt-2 animate-pulse shrink-0" />
      )}
    </button>
  );
}
