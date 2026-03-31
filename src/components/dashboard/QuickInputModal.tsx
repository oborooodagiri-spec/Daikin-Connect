"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Wrench, ClipboardCheck, ArrowLeft, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CorrectiveFormClient from "@/app/passport/[token]/corrective/CorrectiveFormClient";
import PreventiveFormClient from "@/app/passport/[token]/preventive/PreventiveFormClient";
import AuditFormClient from "@/app/passport/[token]/audit/AuditFormClient";

interface QuickInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: any;
}

export default function QuickInputModal({ isOpen, onClose, unit }: QuickInputModalProps) {
  const [selectedType, setSelectedType] = useState<"corrective" | "preventive" | "audit" | null>(null);

  if (!isOpen || !unit) return null;

  const handleBackToSelect = () => setSelectedType(null);

  const formTypes = [
    {
      id: "corrective",
      title: "Corrective Maintenance",
      description: "Repair breakdowns, fix issues, and restore functionality.",
      icon: AlertTriangle,
      color: "rose",
      bg: "bg-rose-50",
      border: "border-rose-100",
      iconBg: "bg-rose-500",
      textColor: "text-rose-700"
    },
    {
      id: "preventive",
      title: "Preventive Maintenance",
      description: "Routine cleaning, inspection, and scheduled servicing.",
      icon: Wrench,
      color: "emerald",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-500",
      textColor: "text-emerald-700"
    },
    {
      id: "audit",
      title: "Technical Audit",
      description: "Deep inspection, measurement, and asset health audit.",
      icon: ClipboardCheck,
      color: "blue",
      bg: "bg-blue-50",
      border: "border-blue-100",
      iconBg: "bg-blue-500",
      textColor: "text-blue-700"
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
      >
        <motion.div
          initial={{ y: 50, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 50, scale: 0.95 }}
          className="bg-slate-50 w-full h-full md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative"
        >
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-[110]">
            <div className="flex items-center gap-3">
              {selectedType ? (
                <button 
                  onClick={handleBackToSelect}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <div className="p-2 bg-[#003366] text-white rounded-lg">
                  <Database size={18} />
                </div>
              )}
              <div>
                <h2 className="text-sm font-black text-[#003366] uppercase tracking-widest">
                  {selectedType ? "Manual Report Entry" : "Select Report Type"}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  Unit: {unit.tag_number} — {unit.area}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {!selectedType ? (
              <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-black text-[#003366] tracking-tight">Apa yang ingin Anda laporkan?</h3>
                  <p className="text-sm font-bold text-slate-400 mt-2">Pilih jenis pekerjaan servis yang telah dilakukan pada unit ini.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {formTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id as any)}
                      className={`group relative text-left p-6 ${type.bg} border-2 ${type.border} rounded-3xl hover:border-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl ${type.iconBg} text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                          <type.icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-lg font-black ${type.textColor} uppercase tracking-tight`}>{type.title}</h4>
                          <p className="text-xs font-bold text-slate-500 leading-relaxed mt-1">{type.description}</p>
                        </div>
                        <button className="p-3 bg-white/50 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-8 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Manual Input System V1.0</p>
                </div>
              </div>
            ) : (
              <div className="h-full">
                {selectedType === "corrective" && <CorrectiveFormClient unit={unit} />}
                {selectedType === "preventive" && <PreventiveFormClient unit={unit} />}
                {selectedType === "audit" && <AuditFormClient unit={unit} />}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ChevronRight({ size, className = "" }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
