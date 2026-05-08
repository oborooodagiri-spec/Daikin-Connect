"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, User, Mail, Building2, 
  History, Lock, CheckCircle2, AlertCircle,
  Clock, Landmark, Globe, Smartphone, Fingerprint
} from "lucide-react";
import { motion } from "framer-motion";
import { getMySecurityProfile, getGlobalAuditLogs, getSessionTimeline } from "@/app/actions/user_security";
import { format } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon, Filter, ExternalLink, Activity } from "lucide-react";

export default function ProfileSecurityPage() {
  const [profile, setProfile] = useState<any>(null);
  const [globalLogs, setGlobalLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"personal" | "global">("global");
  
  // Filtering & Modal States
  const [startDate, setStartDate] = useState(format(new Date().setDate(new Date().getDate() - 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [sessionDuration, setSessionDuration] = useState<string | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const fetchLogs = async () => {
    setIsFiltering(true);
    const gRes = await getGlobalAuditLogs(startDate, endDate);
    if (gRes.success) {
      setGlobalLogs(gRes.logs || []);
    }
    setIsFiltering(false);
  };

  useEffect(() => {
    async function load() {
      const res = await getMySecurityProfile();
      if (res.success) {
        const user = res.data;
        const isAdmin = (user.roles?.role_name?.toLowerCase() || "").match(/admin|super/) || 
                        user.user_roles?.some((ur: any) => (ur.roles?.role_name?.toLowerCase() || "").match(/admin|super/));
        
        if (!isAdmin) {
           setProfile({ unauthorized: true });
           setLoading(false);
           return;
        }

        setProfile(res.data);
        fetchLogs();
      }
      setLoading(false);
    }
    load();
  }, []);

  // Fetch logs whenever date changes
  useEffect(() => {
    if (viewMode === 'global' && !loading) {
      fetchLogs();
    }
  }, [startDate, endDate, viewMode]);

  const handleRowClick = async (log: any) => {
    setSelectedLog(log);
    setIsModalOpen(true);
    setLoadingTimeline(true);
    setTimeline([]);
    setSessionDuration(null);

    const res = await getSessionTimeline(log.userId, log.created_at);
    if (res.success && res.logs) {
      setTimeline(res.logs);
      
      // Advanced Duration Calculation
      const baseIdx = res.logs.findIndex((l: any) => l.time === log.created_at);
      if (baseIdx !== -1) {
        // 1. Look for explicit session end (Next Login or Logout)
        const nextSessionBoundary = res.logs.find((l: any, i: number) => 
          i > baseIdx && (l.action === 'LOGOUT_WEB' || l.action === 'LOGIN_SUCCESS_WEB')
        );

        // 2. Fallback to the last activity if no explicit boundary is found
        const sessionEnd = nextSessionBoundary || res.logs[res.logs.length - 1];

        if (sessionEnd && sessionEnd.time !== log.created_at) {
          const diffMs = new Date(sessionEnd.time).getTime() - new Date(log.created_at).getTime();
          const mins = Math.floor(diffMs / 60000);
          
          if (mins < 1) {
            setSessionDuration("< 1 min");
          } else {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            setSessionDuration(h > 0 ? `${h}h ${m}m` : `${m} mins`);
          }
        } else {
          setSessionDuration("Active Session");
        }
      }
    }
    setLoadingTimeline(false);
  };

  if (loading) {
    return (
      <div className="min-h-[100vh] flex flex-col items-center justify-center gap-4 bg-white">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Secure Environment...</p>
      </div>
    );
  }

  if (profile?.unauthorized) {
    return (
       <div className="min-h-[100vh] flex flex-col items-center justify-center text-center px-8 bg-white">
          <div className="w-20 h-20 rounded-[2.5rem] bg-rose-50 flex items-center justify-center text-rose-500 mb-8">
             <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-black text-[#003366] uppercase tracking-tight mb-2">Restricted Access</h1>
          <p className="text-slate-500 font-medium max-w-sm">This interface is reserved for Command Center Administrators. You do not have the required clearance level to view security audit logs.</p>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:p-20">
      <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#003366] border border-[#004488] text-[10px] font-black uppercase tracking-widest text-blue-300">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Admin Level Clearance</span>
              </div>
              <div>
                  <h1 className="text-4xl font-black text-[#003366] tracking-tight">
                    Security <span className="text-[#00a1e4]">Intelligence</span>
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.3em] mt-2 italic">
                    Global User Activity & Authentication Monitoring
                  </p>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setViewMode("personal")}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'personal' ? 'bg-white text-[#00a1e4] shadow-sm' : 'text-slate-500'}`}
              >
                My Profile
              </button>
              <button 
                onClick={() => setViewMode("global")}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'global' ? 'bg-white text-[#00a1e4] shadow-sm' : 'text-slate-500'}`}
              >
                Global Logs
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Profile Info (Sticky Left) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden sticky top-24">
                <div className="h-24 bg-gradient-to-r from-[#003366] to-[#00a1e4]" />
                <div className="px-8 pb-10">
                  <div className="relative -mt-12 mb-8">
                      <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-2xl flex items-center justify-center text-[#003366] overflow-hidden">
                        <User size={48} strokeWidth={1.5} />
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{profile?.name}</h3>
                        <p className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full display-inline-block uppercase tracking-widest mt-2">
                            {profile?.roles?.role_name || "Administrator"}
                        </p>
                      </div>

                      <div className="h-[1px] bg-slate-100" />

                      <div className="space-y-4">
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#00a1e4] transition-colors">
                              <Mail size={18} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                              <p className="text-[11px] font-bold text-slate-700 truncate">{profile?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#00a1e4] transition-colors">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Organization</p>
                              <p className="text-[11px] font-bold text-slate-700 truncate">{profile?.company_name || 'Daikin HQ'}</p>
                            </div>
                        </div>
                      </div>
                  </div>
                </div>
            </div>
          </div>

          {/* Audit Log (Right Column) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col min-h-[600px]">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-[#003366]" />
                      <h2 className="text-lg font-black text-[#003366] uppercase tracking-tight">
                        {viewMode === 'personal' ? 'My Security Audit' : 'Global Access Intelligence'}
                      </h2>
                  </div>
                    <div className="flex items-center gap-3">
                      {viewMode === 'global' && (
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                          <CalendarIcon size={12} className="text-[#003366]" />
                          <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-[10px] font-black text-slate-600 outline-none"
                          />
                          <span className="text-slate-300">/</span>
                          <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-[10px] font-black text-slate-600 outline-none"
                          />
                        </div>
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border flex items-center gap-2 transition-all ${isFiltering ? 'bg-amber-50 text-amber-600 border-amber-100' : 'text-[#00a1e4] bg-blue-50 border-blue-100'}`}>
                        {isFiltering ? <div className="w-2 h-2 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> : <Clock size={12} />} 
                        {isFiltering ? 'Filtering...' : 'Live Monitoring'}
                      </span>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Event / User</th>
                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Device / Source</th>
                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(viewMode === 'personal' ? (profile?.audit_logs || []) : globalLogs).map((log: any, idx: number) => {
                            const isSuccess = log.action.includes('SUCCESS');
                            const isFailed = log.action.includes('FAILED');
                            const isChallenge = log.action.includes('CHALLENGE');

                            return (
                                <motion.tr 
                                  key={log.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.02 }}
                                  onClick={() => handleRowClick(log)}
                                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  <td className="px-8 py-5">
                                      <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isFailed ? 'bg-rose-50 text-rose-500' : isSuccess ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-[#00a1e4]'}`}>
                                            {isFailed ? <AlertCircle size={14} /> : isSuccess ? <CheckCircle2 size={14} /> : <Lock size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                                              {viewMode === 'personal' ? 'Me' : (log.userName || 'System Operation')}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                              {viewMode === 'personal' ? (profile?.roles?.role_name || 'Admin') : (log.userRole || 'Internal System')}
                                            </p>
                                        </div>
                                      </div>
                                  </td>
                                  <td className="px-8 py-5">
                                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-100 bg-white shadow-sm">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isFailed ? 'bg-rose-500' : isSuccess ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                      </div>
                                  </td>
                                  <td className="px-8 py-5">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                            <Globe size={12} className="text-slate-300" />
                                            <span>{log.ip_address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Smartphone size={12} className="text-slate-300" />
                                            <span className="truncate max-w-[180px]">{log.user_agent}</span>
                                        </div>
                                      </div>
                                  </td>
                                  <td className="px-8 py-5">
                                      <div className="text-right whitespace-nowrap">
                                        <p className="text-[11px] font-black text-[#003366] font-mono">{format(new Date(log.created_at), 'HH:mm:ss')}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(log.created_at), 'dd MMM yyyy')}</p>
                                      </div>
                                  </td>
                                </motion.tr>
                            );
                        })}
                      </tbody>
                  </table>

                  {((viewMode === 'personal' ? profile?.audit_logs : globalLogs) || []).length === 0 && (
                      <div className="py-20 flex flex-col items-center justify-center text-center">
                        <History size={48} className="text-slate-100 mb-4" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Activity Records Found</p>
                      </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <ShieldCheck size={12} /> SECURE AUDIT CHAIN ENFORCED • NO DELETION ALLOWED
                  </p>
                </div>
            </div>
          </div>
        </div>

          {/* Audit Detail Modal */}
          <AnimatePresence>
            {isModalOpen && selectedLog && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
                >
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3 text-[#003366]">
                          <Activity className="w-6 h-6" />
                          <h3 className="text-xl font-black uppercase tracking-tight">Activity Details</h3>
                      </div>
                      <button 
                          onClick={() => setIsModalOpen(false)}
                          className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                      >
                          <X size={20} />
                      </button>
                    </div>

                    <div className="p-10 space-y-10">
                      <div className="flex items-start justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#00a1e4] text-[10px] font-black uppercase tracking-widest">
                                  {selectedLog.action.replace(/_/g, ' ')}
                                </div>
                                {sessionDuration && (
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                      <Clock size={10} /> Online: {sessionDuration}
                                  </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 leading-tight">
                                  {selectedLog.userName}
                                </h4>
                                <p className="text-xs font-black text-[#00a1e4] uppercase tracking-widest mt-1">
                                  {selectedLog.userRole}
                                </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-[#003366] font-mono leading-none">
                                {format(new Date(selectedLog.created_at), 'HH:mm:ss')}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                                {format(new Date(selectedLog.created_at), 'EEEE, dd MMMM yyyy')}
                            </p>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={12} /> Session Activity (Timeline)
                          </p>
                          <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                            {loadingTimeline ? (
                                <div className="py-4 flex items-center gap-3">
                                  <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analyzing Session...</span>
                                </div>
                            ) : timeline.length > 0 ? timeline.slice(timeline.findIndex(t => t.time === selectedLog.created_at)).map((t, i) => (
                                <div key={i} className="relative group">
                                  <div className={`absolute -left-[25px] top-1.5 w-3 h-3 rounded-full border-2 border-white transition-all ${t.action.includes('SUCCESS') ? 'bg-emerald-500 scale-125' : t.action.includes('LOGOUT') ? 'bg-rose-500' : 'bg-blue-400'}`} />
                                  <div className="flex items-center justify-between">
                                      <p className={`text-[11px] font-bold uppercase tracking-tight ${t.time === selectedLog.created_at ? 'text-[#00a1e4]' : 'text-slate-600'}`}>
                                        {t.message}
                                      </p>
                                      <p className="text-[10px] font-mono font-bold text-slate-400">{format(new Date(t.time), 'HH:mm:ss')}</p>
                                  </div>
                                </div>
                            )) : (
                                <p className="text-[10px] font-bold text-slate-300 italic">No additional session data.</p>
                            )}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Globe size={12} /> IP Address
                            </p>
                            <p className="font-mono text-sm font-black text-[#003366]">{selectedLog.ip_address}</p>
                          </div>
                          <div className="space-y-2 text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-2">
                                Device Type <Smartphone size={12} />
                            </p>
                            <p className="text-xs font-bold text-slate-600 truncate">{selectedLog.user_agent.split('(')[1]?.split(')')[0] || 'Unknown Object'}</p>
                          </div>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-50/50 text-center border-t border-slate-50">
                      <p className="text-[10px] font-black text-[#00a1e4] uppercase tracking-widest flex items-center justify-center gap-2">
                          <ShieldCheck size={14} /> IMMUTABLE SECURITY RECORD
                      </p>
                    </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}
