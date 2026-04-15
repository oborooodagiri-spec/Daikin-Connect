"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, User, Mail, Building2, 
  History, Lock, CheckCircle2, AlertCircle,
  Clock, Landmark, Globe, Smartphone, Fingerprint
} from "lucide-react";
import { motion } from "framer-motion";
import { getMySecurityProfile } from "@/app/actions/user_security";
import { format } from "date-fns";

export default function ProfileSecurityPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getMySecurityProfile();
      if (res.success) {
        setProfile(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Secure Environment...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#003366] border border-[#004488] text-[10px] font-black uppercase tracking-widest text-blue-300">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Identity Protection Active</span>
             </div>
             <div>
                <h1 className="text-4xl font-black text-[#003366] tracking-tight">
                  Profile & <span className="text-[#00a1e4]">Security</span>
                </h1>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.3em] mt-2 italic">
                  Command Center Personnel Dashboard
                </p>
             </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-3xl bg-blue-50 border border-blue-100">
             <div className="p-3 rounded-2xl bg-white shadow-sm">
                <ShieldCheck className="w-6 h-6 text-[#00a1e4]" />
             </div>
             <div>
                <p className="text-[10px] font-black text-[#003366] uppercase tracking-widest leading-none mb-1">2FA Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-sm font-black text-emerald-600 uppercase">Active</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Col: Personnel Details */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-[#003366] to-[#00a1e4]" />
              <div className="px-8 pb-10">
                 <div className="relative -mt-12 mb-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-2xl flex items-center justify-center text-[#003366] overfow-hidden">
                       <User size={48} strokeWidth={1.5} />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <h3 className="text-xl font-black text-slate-800 tracking-tight">{profile?.name}</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Personnel</p>
                    </div>

                    <div className="h-[1px] bg-slate-100" />

                    <div className="space-y-4">
                       <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#00a1e4] transition-colors">
                             <Mail size={18} />
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                             <p className="text-sm font-bold text-slate-700">{profile?.email}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#00a1e4] transition-colors">
                             <Building2 size={18} />
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Affiliated Organization</p>
                             <p className="text-sm font-bold text-slate-700">{profile?.company_name || 'Individual Technical Advisor'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 rounded-[2rem] bg-[#003366] text-white space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Lock size={20} className="text-blue-300" />
                 <h4 className="text-sm font-black uppercase tracking-widest">Security Enforcement</h4>
              </div>
              <p className="text-xs text-blue-100/60 leading-relaxed font-medium">
                Your account is protected by platform-wide <span className="text-white font-black italic">Mandatory 2FA</span>. Multi-factor verification is required for all Command Center access attempts to ensure the integrity of Daikin operational data.
              </p>
           </div>
        </div>

        {/* Right Col: Security Timeline */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col min-h-[500px]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-[#003366]" />
                    <h2 className="text-lg font-black text-[#003366] uppercase tracking-tight">Security Audit Timeline</h2>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#00a1e4] bg-blue-50 px-3 py-1 rounded-full">Last 10 Events</span>
              </div>

              <div className="flex-1 p-0">
                 {profile?.audit_logs?.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                       {profile.audit_logs.map((log: any, idx: number) => {
                          const isSuccess = log.action.includes('SUCCESS');
                          const isFailed = log.action.includes('FAILED');
                          
                          return (
                             <motion.div 
                                key={log.id} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-6 md:px-8 hover:bg-slate-50/50 transition-colors flex items-center justify-between group"
                             >
                                <div className="flex items-center gap-6">
                                   <div className={`p-3 rounded-2xl ${isFailed ? 'bg-rose-50 text-rose-500' : isSuccess ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                                      {isFailed ? <AlertCircle size={20} /> : isSuccess ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">{log.action.replace(/_/g, ' ')}</p>
                                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                         <span className="flex items-center gap-1.5"><Globe size={10} /> {log.ip_address}</span>
                                         <span className="w-1 h-1 rounded-full bg-slate-200" />
                                         <span className="flex items-center gap-1.5 truncate max-w-[200px]"><Smartphone size={10} /> {log.user_agent}</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-xs font-black text-[#003366] mb-1">{format(new Date(log.created_at), 'HH:mm')}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(log.created_at), 'dd MMM yyyy')}</p>
                                </div>
                             </motion.div>
                          );
                       })}
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-6 p-20">
                       <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                          <History size={40} />
                       </div>
                       <p className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">No Security Events Recorded</p>
                    </div>
                 )}
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                    All security events are cryptographically hashed and immutable
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
