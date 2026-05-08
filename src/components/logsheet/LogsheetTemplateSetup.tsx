"use client";

import React, { useState } from "react";
import { X, Check, ArrowRight, Settings, Info, Save, Layers, Clock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LOGSHEET_CONFIGS, getDefaultTimeSlots, getDesignValues } from "@/lib/logsheet-config";
import { createLogsheetTemplate } from "@/app/actions/logsheets";

interface LogsheetTemplateSetupProps {
  projectId: string;
  onClose: () => void;
  onSuccess: (newTemplate: any) => void;
}

export default function LogsheetTemplateSetup({ projectId, onClose, onSuccess }: LogsheetTemplateSetupProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [systemName, setSystemName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [designValues, setDesignValues] = useState<Record<string, any>>({});
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeSelect = (selectedType: string) => {
    setType(selectedType);
    setDesignValues(getDesignValues(selectedType));
    setTimeSlots(getDefaultTimeSlots(selectedType));
    
    // Default names
    const config = LOGSHEET_CONFIGS[selectedType];
    setName(`${config.label} - New`);
    setSystemName("HVAC System");
    
    setStep(2);
  };

  const handleCreate = async () => {
    if (!type) return;
    setIsSubmitting(true);
    
    const config = LOGSHEET_CONFIGS[type];
    const result = await createLogsheetTemplate(projectId, {
        name,
        type,
        system_name: systemName,
        room_name: roomName,
        parameters: config.groups, // Save the structure
        designValues,
        time_slots: timeSlots
    });

    if (result.success) {
      onSuccess(result.data);
    } else {
      alert("Gagal membuat template.");
      setIsSubmitting(false);
    }
  };

  const addTimeSlot = (time: string) => {
    if (!time || timeSlots.includes(time)) return;
    const newSlots = [...timeSlots, time].sort();
    setTimeSlots(newSlots);
  };

  const removeTimeSlot = (time: string) => {
    setTimeSlots(timeSlots.filter(t => t !== time));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="relative bg-white w-full max-w-5xl h-[85vh] rounded-[3.5rem] shadow-2xl shadow-blue-900/20 overflow-hidden flex"
      >
        {/* Left Side - Progress Icons */}
        <div className="w-24 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-12 gap-8 shrink-0">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s ? "bg-[#003366] text-white shadow-lg shadow-[#003366]/20" : "bg-white text-slate-200 border border-slate-100"}`}
            >
              {step > s ? <Check size={20} /> : <span className="font-black">{s}</span>}
            </div>
          ))}
        </div>

        {/* Right Side - Form Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-10 border-b border-slate-50 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Setup Logsheet Template</h2>
              <p className="text-slate-400 font-bold text-sm tracking-wide">
                {step === 1 ? "Pilih format dokumen logsheet sesuai kebutuhan sistem" : 
                 step === 2 ? "Konfigurasi detail identitas dan target values" : 
                 "Tentukan jadwal waktu monitoring harian"}
              </p>
            </div>
            <button onClick={onClose} className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-500 transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {Object.values(LOGSHEET_CONFIGS).map((config) => (
                    <div 
                      key={config.type}
                      onClick={() => handleTypeSelect(config.type)}
                      className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 hover:border-[#00a1e4] hover:shadow-xl hover:shadow-[#00a1e4]/5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-6 mb-6">
                         <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-[#00a1e4] group-hover:text-white transition-all shadow-sm">
                            <Layers size={32} />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight">{config.label}</h3>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-lg">Default Template</span>
                         </div>
                      </div>
                      <p className="text-sm font-bold text-slate-400 leading-relaxed mb-6">{config.description}</p>
                      <div className="flex items-center gap-2 text-[#00a1e4] font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                        Select Format <ArrowRight size={14} />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {step === 2 && type && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:border-[#00a1e4] outline-none font-bold text-[#003366]"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System/Building Name</label>
                      <input 
                        type="text" 
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:border-[#00a1e4] outline-none font-bold text-[#003366]"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                       <ShieldCheck className="text-[#00a1e4]" />
                       <h3 className="text-lg font-black text-[#003366] uppercase tracking-tighter">Adjust Design / Target Values</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {LOGSHEET_CONFIGS[type].groups.flatMap(g => g.params).filter(p => p.design !== undefined).map(param => (
                        <div key={param.key} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate block">{param.label}</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={designValues[param.key] ?? ""}
                              onChange={(e) => setDesignValues({...designValues, [param.key]: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-black text-[#00a1e4] outline-none focus:border-[#00a1e4]"
                            />
                            <span className="text-[8px] font-black text-slate-300">{param.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="bg-[#003366] p-10 rounded-[3rem] text-white space-y-8 shadow-2xl shadow-blue-900/20">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl">
                           <Clock />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Monitoring Schedule</h3>
                     </div>
                     <p className="text-blue-200/60 font-bold text-sm max-w-md">Tambahkan slot waktu di mana pembacaan data harus dilakukan setiap harinya.</p>
                     
                     <div className="flex flex-wrap gap-3">
                        {timeSlots.map(time => (
                          <div key={time} className="px-6 py-3 bg-white text-[#003366] rounded-2xl font-black text-sm flex items-center gap-3">
                            {time}
                            <button onClick={() => removeTimeSlot(time)} className="text-rose-500 hover:scale-125 transition-transform"><X size={14} /></button>
                          </div>
                        ))}
                        <button className="px-6 py-3 bg-white/10 border-2 border-dashed border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                           <input 
                             type="time" 
                             onChange={(e) => addTimeSlot(e.target.value)}
                             className="bg-transparent outline-none w-20"
                           />
                        </button>
                     </div>
                  </div>

                  <div className="bg-slate-50 rounded-[2.5rem] p-10 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#00a1e4] shadow-sm">
                           <Settings size={32} />
                        </div>
                        <div>
                           <h4 className="text-xl font-black text-[#003366] uppercase tracking-tighter">Ready to Deploy</h4>
                           <p className="text-slate-400 font-bold text-sm">Review configuration and finalize template creation.</p>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="p-10 border-t border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/20">
             <button 
               onClick={() => step > 1 && setStep(step - 1)}
               disabled={step === 1}
               className="px-10 py-4 bg-white border border-slate-200 text-slate-400 font-black uppercase text-xs tracking-widest rounded-3xl hover:border-[#003366] hover:text-[#003366] transition-all disabled:opacity-0"
             >
                Back
             </button>

             {step < 3 ? (
               <button 
                 onClick={() => step < 3 && type && setStep(step + 1)}
                 disabled={!type}
                 className="flex items-center gap-3 px-10 py-4 bg-[#003366] text-white rounded-3xl shadow-xl shadow-[#003366]/20 hover:bg-[#00a1e4] transition-all font-black uppercase text-xs tracking-widest"
               >
                 Continue <ArrowRight size={16} />
               </button>
             ) : (
               <button 
                 onClick={handleCreate}
                 disabled={isSubmitting}
                 className="flex items-center gap-3 px-12 py-4 bg-emerald-500 text-white rounded-3xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all font-black uppercase text-xs tracking-widest"
               >
                 {isSubmitting ? "Generating..." : <><Save size={16} /> Create Template</>}
               </button>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
