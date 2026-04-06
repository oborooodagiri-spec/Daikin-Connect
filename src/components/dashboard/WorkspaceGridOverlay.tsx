"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, LayoutGrid, X, ArrowRight, Activity, TrendingUp } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  onSelect: (customerId: string, projectId: string) => void;
}

export default function WorkspaceGridOverlay({ isOpen, onClose, data, onSelect }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-12 lg:p-20">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#001529]/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-7xl h-full flex flex-col bg-slate-50/50 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-white/20"
      >
        <div className="p-8 md:p-12 bg-white/40 border-b border-white/20 flex items-center justify-between">
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-[#003366] leading-none mb-4">
              WORKSPACE <span className="text-[#00a1e4] not-italic">PORTFOLIO</span>
            </h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" /> GLOBAL OPERATIONAL OVERVIEW
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-rose-500"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar-sidebar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {data.map((customer, idx) => (
              <motion.div 
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col gap-4"
              >
                {/* Partner Header */}
                <div className="flex items-center gap-3 px-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00a1e4] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Building2 size={16} />
                  </div>
                  <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest truncate">{customer.name}</h3>
                </div>

                {/* Sub Projects Grid */}
                <div className="grid gap-4">
                  {/* Global Link for this customer */}
                  <button
                    onClick={() => onSelect(customer.id.toString(), 'all')}
                    className="group p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-[#00a1e4] hover:shadow-2xl hover:shadow-blue-900/10 transition-all text-left"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#00a1e4]/10 group-hover:text-[#00a1e4] flex items-center justify-center transition-all">
                        <Activity size={20} />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all uppercase tracking-widest">Global View</span>
                    </div>
                    <p className="text-lg font-black text-[#003366] tracking-tight group-hover:text-[#00a1e4] transition-colors">{customer.name} (Global)</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aggregated statistics</p>
                  </button>

                  {/* Individual Projects */}
                  {customer.projects?.map((project: any) => (
                    <button
                      key={project.id}
                      onClick={() => onSelect(customer.id.toString(), project.id.toString())}
                      className="group p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-[#00a1e4] hover:shadow-2xl hover:shadow-blue-900/10 transition-all text-left relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#00a1e4]/10 group-hover:text-[#00a1e4] flex items-center justify-center transition-all">
                          <LayoutGrid size={20} />
                        </div>
                        <ArrowRight size={20} className="text-slate-200 group-hover:text-[#00a1e4] group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-lg font-black text-[#003366] tracking-tight mb-1 relative z-10">{project.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">{project.code || "PROJECT ACCESS UNIT"}</p>
                      
                      {/* Subtle background decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16 group-hover:bg-blue-50 transition-colors z-0"></div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12 bg-[#003366] border-t border-white/10 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-12">
            <div>
               <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Total Scale</p>
               <p className="text-2xl font-black text-white leading-none">{data.length} PARTNERS</p>
            </div>
            <div className="w-[1px] h-10 bg-white/10"></div>
            <div>
               <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Total Assets</p>
               <p className="text-2xl font-black text-white leading-none tracking-tighter">MANAGED ENTITIES</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <img src="/app-logo.png" className="h-6 w-auto brightness-0 invert mb-2 opacity-50" alt="Daikin" />
            <p className="text-[9px] font-black tracking-[0.3em] opacity-40 uppercase">EPL Connect Enterprise</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
