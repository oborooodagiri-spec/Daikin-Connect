"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Building2, LayoutGrid } from "lucide-react";
import { getFilterOptions } from "@/app/actions/dashboard";

interface Props {
  onFilterChange: (filters: { customerId?: string; projectId?: string }) => void;
}

export default function CustomerProjectSelector({ onFilterChange }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await getFilterOptions();
      if (res && 'success' in res && res.success) {
        setData(res.data as any[]);
      }
    }
    load();
  }, []);

  const handleCustomerChange = (val: string) => {
    setSelectedCustomer(val);
    setSelectedProject("all");
    
    if (val === "all") {
      setProjects([]);
      onFilterChange({});
    } else {
      const customer = data.find(c => c.id.toString() === val);
      setProjects(customer?.projects || []);
      onFilterChange({ customerId: val });
    }
  };

  const handleProjectChange = (val: string) => {
    setSelectedProject(val);
    if (val === "all") {
      onFilterChange({ customerId: selectedCustomer });
    } else {
      onFilterChange({ customerId: selectedCustomer, projectId: val });
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Customer Select */}
      <div className="relative group">
        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-[#00a1e4] transition-colors" />
        <select
          value={selectedCustomer}
          onChange={(e) => handleCustomerChange(e.target.value)}
          className="pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm hover:border-[#00a1e4] transition-all appearance-none cursor-pointer min-w-[200px]"
        >
          <option value="all">🌐 GLOBAL PARTNER</option>
          {data.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {/* Project Select */}
      <div className={`relative group transition-all duration-300 ${selectedCustomer === "all" ? "opacity-40 grayscale pointer-events-none scale-95" : "opacity-100"}`}>
        <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-[#00a1e4] transition-colors" />
        <select
          value={selectedProject}
          onChange={(e) => handleProjectChange(e.target.value)}
          className="pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm hover:border-[#00a1e4] transition-all appearance-none cursor-pointer min-w-[200px]"
        >
          <option value="all">📂 ALL PROJECTS</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
