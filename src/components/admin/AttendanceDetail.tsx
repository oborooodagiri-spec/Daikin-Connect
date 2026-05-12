"use client";

import React from "react";
import { X, MapPin, Clock, FileImage, ExternalLink, User, Building, Mail, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AttendanceDetailProps {
  record: any;
  onClose: () => void;
}

export default function AttendanceDetail({ record, onClose }: AttendanceDetailProps) {
  if (!record) return null;

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[100] flex flex-col border-l border-slate-100"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div>
           <h2 className="text-xl font-black text-[#003366] uppercase tracking-tight">Attendance Information</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verification Snapshot</p>
        </div>
        <button 
          onClick={onClose}
          className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-rose-500 shadow-sm"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {/* User Info Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                 <User size={32} />
              </div>
              <div>
                 <h3 className="text-lg font-black text-slate-800">{record.users?.name}</h3>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                    <Building size={12} className="text-indigo-400" /> {record.users?.company_name || "VENDOR"}
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 lowercase">
                    <Mail size={12} className="text-slate-300" /> {record.users?.email}
                 </div>
              </div>
           </div>
        </section>

        {/* Verification Photos */}
        <section className="space-y-6">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Photo</h4>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Check In
                 </p>
                 <div className="relative aspect-[3/4] bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-slate-50 group shadow-lg">
                    {record.check_in_photo ? (
                       <>
                                                     <img 
                              src={record.check_in_photo} 
                              className="w-full h-full object-cover" 
                              alt="Check In" 
                              onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 if (!target.src.includes('/uploads/')) {
                                    target.src = record.check_in_photo.replace('/api/assets/', '/uploads/');
                                 }
                              }}
                           />
                          <a 
                             href={record.check_in_photo} 
                             target="_blank" 
                             className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-xs font-bold"
                          >
                             <ExternalLink size={16} /> Open Full
                          </a>
                       </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                           <FileImage size={40} className="opacity-20" />
                           <span className="text-[10px] font-black uppercase">No Photo</span>
                        </div>
                    )}
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Check Out
                 </p>
                 <div className="relative aspect-[3/4] bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-slate-50 group shadow-lg">
                    {record.check_out_photo ? (
                       <>
                                                     <img 
                              src={record.check_out_photo} 
                              className="w-full h-full object-cover" 
                              alt="Check Out" 
                              onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 if (!target.src.includes('/uploads/')) {
                                    target.src = record.check_out_photo.replace('/api/assets/', '/uploads/');
                                 }
                              }}
                           />
                          <a 
                             href={record.check_out_photo} 
                             target="_blank" 
                             className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-xs font-bold"
                          >
                             <ExternalLink size={16} /> Open Full
                          </a>
                       </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                           <FileImage size={40} className="opacity-20" />
                           <span className="text-[10px] font-black uppercase">Active on Site</span>
                        </div>
                    )}
                 </div>
              </div>
           </div>
        </section>

        {/* Timeline Section */}
        <section className="space-y-4">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Time & Location</h4>
           <div className="space-y-6">
              <div className="flex gap-4">
                 <div className="w-1 bg-emerald-100 rounded-full" />
                 <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800 flex items-center gap-2">
                       <Clock size={14} className="text-emerald-500" /> {formatDate(record.check_in_time)}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
                       <MapPin size={12} className="text-slate-300" /> {record.check_in_lat}, {record.check_in_long}
                    </p>
                    {record.check_in_notes && (
                       <p className="mt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic border-l-2 border-slate-200">
                          "{record.check_in_notes}"
                       </p>
                    )}
                 </div>
              </div>

              {record.check_out_time && (
                 <div className="flex gap-4">
                    <div className="w-1 bg-rose-100 rounded-full" />
                    <div className="space-y-1">
                       <p className="text-xs font-black text-slate-800 flex items-center gap-2">
                          <Clock size={14} className="text-rose-500" /> {formatDate(record.check_out_time)}
                       </p>
                       <p className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
                          <MapPin size={12} className="text-slate-300" /> {record.check_out_lat}, {record.check_out_long}
                       </p>
                       {record.check_out_notes && (
                          <p className="mt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic border-l-2 border-slate-200">
                             "{record.check_out_notes}"
                          </p>
                       )}
                    </div>
                 </div>
              )}
           </div>
        </section>

        {/* Project Context */}
        <section className="bg-[#003366] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">Project Site</p>
           <h5 className="text-xl font-black tracking-tight">{record.projects?.name}</h5>
           <div className="mt-4 flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Administrative Verification Active</span>
           </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-slate-50 border-t border-slate-100">
         <button 
           onClick={() => {
              // Implementation of map view or similar could go here
              window.open(`https://www.google.com/maps/dir/${record.check_in_lat},${record.check_in_long}/${record.check_out_lat || record.check_in_lat},${record.check_out_long || record.check_in_long}`, '_blank');
           }}
           className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-sm"
         >
           <MapPin size={16} className="text-rose-500" /> Visualize Track on Map
         </button>
      </div>
    </motion.div>
  );
}
