"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, LayoutGrid, Clock, ChevronRight, X, Command } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  onSelect: (customerId: string, projectId: string) => void;
}

export default function CommandPaletteOverlay({ isOpen, onClose, data, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      const stored = localStorage.getItem("recent_projects");
      if (stored) setRecent(JSON.parse(stored));
    }
  }, [isOpen]);

  // Flatten data for searching
  const allItems: any[] = [];
  data.forEach(customer => {
    // Add customer itself as an option (Global View)
    allItems.push({ id: customer.id.toString(), name: customer.name, type: 'partner', customerId: customer.id.toString(), projectId: 'all' });
    customer.projects?.forEach((p: any) => {
      allItems.push({ id: p.id.toString(), name: p.name, type: 'project', customerId: customer.id.toString(), projectId: p.id.toString(), partner: customer.name });
    });
  });

  const filtered = query === "" 
    ? allItems.slice(0, 0) // Don't show all by default, show recent instead
    : allItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) || 
        (item.partner && item.partner.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8);

  const displayItems = query === "" ? recent : filtered;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex(prev => (prev + 1) % (displayItems.length || 1));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex(prev => (prev - 1 + (displayItems.length || 1)) % (displayItems.length || 1));
    } else if (e.key === "Enter" && displayItems[selectedIndex]) {
      const item = displayItems[selectedIndex];
      handleSelect(item);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSelect = (item: any) => {
    // Save to recent
    const updatedRecent = [item, ...recent.filter(r => r.id !== item.id)].slice(0, 5);
    localStorage.setItem("recent_projects", JSON.stringify(updatedRecent));
    
    onSelect(item.customerId, item.projectId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#001529]/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 relative z-10"
        onKeyDown={handleKeyDown}
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <Search className="w-6 h-6 text-[#00a1e4]" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search partners or projects..."
            className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-800 placeholder:text-slate-400"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
            <span className="text-[10px] font-black text-slate-400">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar-sidebar">
          {query === "" && recent.length > 0 && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3 flex items-center gap-2">
              <Clock size={12} /> RECENTLY VISITED
            </p>
          )}

          {displayItems.length > 0 ? (
            <div className="space-y-1">
              {displayItems.map((item, idx) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    idx === selectedIndex ? "bg-[#00a1e4] text-white shadow-lg shadow-blue-500/20" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      idx === selectedIndex ? "bg-white/20" : "bg-slate-100 text-slate-400"
                    }`}>
                      {item.type === 'partner' ? <Building2 size={20} /> : <LayoutGrid size={20} />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black tracking-tight">{item.name}</p>
                      {item.partner && (
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${
                          idx === selectedIndex ? "text-white/70" : "text-slate-400"
                        }`}>{item.partner}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className={idx === selectedIndex ? "opacity-100" : "opacity-30"} />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Search size={32} />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                {query === "" ? "Start typing to find projects" : "No results found"}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                <span className="p-1 px-1.5 bg-white border border-slate-200 rounded shadow-sm">↑↓</span>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                <span className="p-1 px-1.5 bg-white border border-slate-200 rounded shadow-sm">ENTER</span>
                <span>Select</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Command size={12} className="text-slate-300" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">SMART SEARCH ACTIVE</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
