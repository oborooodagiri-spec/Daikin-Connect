"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, LayoutGrid, X, Command, ArrowRight } from "lucide-react";
import ReactDOM from "react-dom";
import { getFilterOptions } from "@/app/actions/dashboard";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? ReactDOM.createPortal(children, document.body) : null;
}

interface ProjectSpotlightProps {
  isOpen: boolean;
  onSelect: (customerId: string, projectId: string, projectName: string) => void;
  onClose?: () => void;
}

export default function ProjectSpotlight({ isOpen, onSelect, onClose }: ProjectSpotlightProps) {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadOptions() {
      const res = await getFilterOptions();
      if (res && 'success' in res && res.success) {
        setData(res.data);
      }
      setLoading(false);
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredData = data.map(customer => {
    const matchingProjects = customer.projects.filter((p: any) => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      customer.name.toLowerCase().includes(query.toLowerCase())
    );
    return matchingProjects.length > 0 ? { ...customer, projects: matchingProjects } : null;
  }).filter(Boolean);

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-blue-900/20 border border-white/50 overflow-hidden relative"
            >
              {/* Search Header */}
              <div className="p-6 border-b border-slate-100 flex items-center gap-4 relative">
                <Search className="text-[#00a1e4]" size={20} />
                <input 
                  ref={inputRef}
                  type="text"
                  placeholder="Search projects or customers..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-[#003366] placeholder:text-slate-300"
                />
                {onClose && (
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                    <X size={18} />
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Command size={10} /> <span>FIND</span>
                </div>
              </div>

              {/* Results List */}
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
                {loading ? (
                   <div className="p-12 flex flex-col items-center justify-center gap-3">
                     <div className="w-8 h-8 border-4 border-[#00a1e4]/20 border-t-[#00a1e4] rounded-full animate-spin" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Building project index...</p>
                   </div>
                ) : filteredData.length === 0 ? (
                  <div className="p-12 text-center">
                     <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                        <LayoutGrid size={32} />
                     </div>
                     <p className="text-sm font-bold text-slate-400">No matching projects found</p>
                     <p className="text-[10px] text-slate-300 uppercase font-black mt-2">Try searching by site name or customer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredData.map((customer: any) => (
                      <div key={customer.id} className="space-y-1">
                        <div className="px-4 py-2 flex items-center gap-2">
                          <Building2 size={14} className="text-slate-300" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{customer.name}</span>
                        </div>
                        {customer.projects.map((project: any) => (
                          <button
                            key={project.id}
                            onClick={() => onSelect(customer.id.toString(), project.id, project.name)}
                            className="w-full flex items-center justify-between p-4 hover:bg-[#00a1e4]/5 rounded-3xl transition-all group border-2 border-transparent hover:border-[#00a1e4]/10 text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-[#003366] group-hover:bg-[#00a1e4] group-hover:text-white transition-colors">
                                <LayoutGrid size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#003366] group-hover:text-[#00a1e4] transition-colors">{project.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{project.code || 'Project ID: ' + project.id}</p>
                              </div>
                            </div>
                            <ArrowRight size={14} className="text-slate-200 group-hover:text-[#00a1e4] group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center px-8">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select project to initialize Command Center</p>
                 <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black text-slate-500 uppercase">Live Indexing</span>
                 </div>
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
