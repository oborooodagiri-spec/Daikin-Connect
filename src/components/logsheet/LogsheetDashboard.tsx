"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Calendar as CalendarIcon, ClipboardList, 
  ChevronRight, Filter, Snowflake, Wind, Fan, Server, 
  ArrowLeft, Download, CheckCircle2, AlertTriangle, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import LogsheetGrid from "./LogsheetGrid";
import LogsheetTemplateSetup from "./LogsheetTemplateSetup";
import { getLogsheetEntries } from "@/app/actions/logsheets";
import { LOGSHEET_CONFIGS } from "@/lib/logsheet-config";

interface LogsheetDashboardProps {
  projectId: string;
  session: any;
  initialTemplates: any[];
}

export default function LogsheetDashboard({ projectId, session, initialTemplates }: LogsheetDashboardProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (activeTemplate) {
      fetchEntries();
    }
  }, [activeTemplate, selectedDate]);

  const fetchEntries = async () => {
    if (!activeTemplate) return;
    setLoading(true);
    const result = await getLogsheetEntries(activeTemplate.id, selectedDate.toISOString());
    if (result.success) {
      setEntries(result.data);
    }
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Chiller": return <Snowflake size={20} />;
      case "AHU": return <Wind size={20} />;
      case "FCU": return <Fan size={20} />;
      case "CRAC": return <Server size={20} />;
      default: return <ClipboardList size={20} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "Chiller": return "text-blue-600 bg-blue-50 border-blue-100";
      case "AHU": return "text-indigo-600 bg-indigo-50 border-indigo-100";
      case "FCU": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "CRAC": return "text-rose-600 bg-rose-50 border-rose-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  if (activeTemplate) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTemplate(null)}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#003366] hover:border-[#003366] transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getColor(activeTemplate.type)}`}>
                  {activeTemplate.type} Logsheet
                </span>
                <span className="text-[10px] font-bold text-slate-300">•</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeTemplate.system_name || "HVAC System"}</span>
              </div>
              <h1 className="text-2xl font-black text-[#003366] uppercase tracking-tight">{activeTemplate.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#00a1e4] transition-all group"
              >
                <CalendarIcon size={18} className="text-slate-400 group-hover:text-[#00a1e4]" />
                <span className="text-sm font-black text-[#003366]">{format(selectedDate, "dd MMMM yyyy", { locale: id })}</span>
              </button>
              
              {/* Date shortcut picker could go here */}
            </div>

            <button className="flex items-center gap-2 px-6 py-3 bg-[#00a1e4] text-white rounded-2xl shadow-lg shadow-[#00a1e4]/20 hover:bg-[#003366] transition-all font-black text-xs uppercase tracking-widest">
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>

        <LogsheetGrid 
          template={activeTemplate} 
          date={selectedDate} 
          entries={entries} 
          onEntrySubmit={fetchEntries}
          session={session}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#003366] uppercase tracking-tighter mb-2">HVAC Logsheets</h1>
          <p className="text-slate-400 font-bold text-sm tracking-wide">Pilih atau buat template logsheet untuk monitoring harian sistem HVAC</p>
        </div>
        
        <button 
          onClick={() => setShowSetup(true)}
          className="flex items-center gap-3 px-8 py-4 bg-[#003366] text-white rounded-[2rem] shadow-xl shadow-[#003366]/20 hover:bg-[#00a1e4] transition-all group"
        >
          <div className="p-2 bg-white/10 rounded-xl group-hover:rotate-90 transition-transform">
            <Plus size={20} />
          </div>
          <span className="font-black uppercase tracking-widest text-xs">Create New Template</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Templates</p>
            <p className="text-3xl font-black text-[#003366]">{templates.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Today's Entries</p>
            <p className="text-3xl font-black text-[#003366]">0</p> 
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600">
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Abnormal Readings</p>
            <p className="text-3xl font-black text-[#003366]">0</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <ClipboardList className="text-[#00a1e4]" />
          <h2 className="text-lg font-black text-[#003366] uppercase tracking-widest">Active Templates</h2>
        </div>

        {templates.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <ClipboardList size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight">Belum ada template</h3>
              <p className="text-slate-400 font-bold text-sm max-w-xs mx-auto">Buat template baru untuk mulai mencatat logsheet monitoring HVAC.</p>
            </div>
            <button 
              onClick={() => setShowSetup(true)}
              className="px-8 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#003366] hover:text-white transition-all"
            >
              Configure First Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-2xl font-black text-[#003366] mb-2 uppercase tracking-tighter break-all">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setActiveTemplate(template)}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150 ${getColor(template.type).split(' ')[1]}`}></div>
                
                <div className="flex flex-col h-full justify-between items-start">
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-3xl border ${getColor(template.type)} shadow-sm transition-transform duration-500 group-hover:rotate-12`}>
                        {getIcon(template.type)}
                      </div>
                      <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-slate-100">
                        {template.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-[#003366] uppercase tracking-tighter leading-none mb-3 group-hover:text-[#00a1e4] transition-colors">{template.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{template.system_name || "HVAC System"}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[#00a1e4] font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    Open Dashboard <ChevronRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSetup && (
          <LogsheetTemplateSetup 
            projectId={projectId} 
            onClose={() => setShowSetup(false)} 
            onSuccess={(newTemplate) => {
              setTemplates([newTemplate, ...templates]);
              setShowSetup(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
