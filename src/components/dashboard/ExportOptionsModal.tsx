"use client";

import React, { useState } from "react";
import { X, Calendar, Download, FileText, Loader2 } from "lucide-react";
import { format, subMonths } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "../Portal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExport: (startDate: string, endDate: string) => void;
  isProcessing: boolean;
}

export default function ExportOptionsModal({ isOpen, onClose, onExport, isProcessing }: Props) {
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100"
            >
              {/* Header */}
              <div className="bg-[#003366] p-8 text-white relative">
                <button 
                  onClick={onClose}
                  className="absolute right-6 top-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <FileText className="text-[#00a1e4]" />
                  </div>
                  <h2 className="text-xl font-black italic tracking-wider">PROJECT REPORT EXPORT</h2>
                </div>
                <p className="text-xs text-white/60 font-bold uppercase tracking-widest">Select period for comprehensive PDF report</p>
              </div>

              {/* Body */}
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} className="text-[#00a1e4]" /> Start Date
                    </label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00a1e4]/20 focus:border-[#00a1e4] transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} className="text-[#00a1e4]" /> End Date
                    </label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00a1e4]/20 focus:border-[#00a1e4] transition-all"
                    />
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                   <ul className="space-y-3">
                     {[
                       "Executive Summary & KPI Analytics",
                       "Operational Trend Visualizations",
                       "Scheduled vs Actual Maintenance Logs",
                       "Problem & Resolution Pareto Analysis",
                       "Official Daikin/EPL Header & Footer"
                     ].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-600">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#00a1e4]" /> {item}
                       </li>
                     ))}
                   </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 px-6 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => onExport(startDate, endDate)}
                  className="flex-[2] py-4 px-6 bg-[#00a1e4] hover:bg-[#0081b8] disabled:bg-slate-300 rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all transform active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download Report
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
