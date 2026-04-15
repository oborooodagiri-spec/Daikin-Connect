"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, LayoutGrid, ChevronDown, Command } from "lucide-react";
import { getFilterOptions } from "@/app/actions/dashboard";
import CommandPaletteOverlay from "./CommandPaletteOverlay";
import WorkspaceGridOverlay from "./WorkspaceGridOverlay";

interface Props {
  onFilterChange: (filters: { customerId?: string; projectId?: string }) => void;
}

export default function SmartProjectNavigator({ onFilterChange }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<{ label: string; customerId: string; projectId: string }>({
    label: "GLOBAL PARTNER",
    customerId: "all",
    projectId: "all"
  });
  
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function load() {
      const res = await getFilterOptions();
      if (res && 'success' in res && res.success) {
        setData(res.data as any[]);
      }
    }
    load();
  }, []);

  // Global Command+K Listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsPaletteOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (customerId: string, projectId: string) => {
    let label = "GLOBAL PARTNER";
    
    if (customerId !== "all") {
      const customer = data.find(c => c.id.toString() === customerId);
      if (projectId === "all") {
        label = customer?.name || "Partner View";
      } else {
        const project = customer?.projects?.find((p: any) => p.id.toString() === projectId);
        label = project?.name || "Project View";
      }
    }

    setSelected({ label, customerId, projectId });
    onFilterChange(customerId === "all" ? {} : { 
      customerId, 
      projectId: projectId === "all" ? undefined : projectId 
    });
  };

  if (!isMounted) return <div className="h-14 w-80 bg-slate-50 animate-pulse rounded-[2rem]" />;

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Main Navigator Trigger */}
        <button
          onClick={() => setIsPaletteOpen(true)}
          className="group relative flex items-center gap-4 pl-5 pr-10 py-4 bg-white border border-slate-200 rounded-[2rem] hover:border-[#00a1e4] hover:shadow-2xl hover:shadow-blue-900/5 transition-all text-left min-w-[280px] md:min-w-[320px]"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#00a1e4] group-hover:text-white flex items-center justify-center transition-all shadow-sm">
            {selected.projectId === "all" ? <Building2 size={20} /> : <LayoutGrid size={20} />}
          </div>
          
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none group-hover:text-[#00a1e4] transition-colors flex items-center gap-2">
              Portfolio Navigation <Command size={10} className="text-slate-300" />
            </p>
            <h3 className="text-sm font-black text-[#003366] truncate uppercase tracking-tighter">
              {selected.label}
            </h3>
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <ChevronDown size={14} className="text-slate-400 group-hover:text-[#00a1e4]" />
            <span className="text-[8px] font-black text-slate-400 hidden md:block">⌘K</span>
          </div>
        </button>

        {/* Visual Portfolio Grid Trigger */}
        <button
          onClick={() => setIsGridOpen(true)}
          className="w-14 h-14 bg-[#003366] text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-900/20 hover:bg-[#00a1e4] hover:scale-105 active:scale-95 transition-all"
          title="Open Workspace Portfolio Grid"
        >
          <LayoutGrid size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isPaletteOpen && (
          <CommandPaletteOverlay 
            isOpen={isPaletteOpen} 
            onClose={() => setIsPaletteOpen(false)} 
            data={data}
            onSelect={handleSelect}
          />
        )}
        {isGridOpen && (
          <WorkspaceGridOverlay 
            isOpen={isGridOpen} 
            onClose={() => setIsGridOpen(false)} 
            data={data}
            onSelect={handleSelect}
          />
        )}
      </AnimatePresence>
    </>
  );
}
