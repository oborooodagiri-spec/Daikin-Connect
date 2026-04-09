"use client";

import { useEffect, useState, useMemo } from "react";
import { getClientInventory } from "@/app/actions/client_dashboard";
import { 
  Package, Search, ChevronRight,
  ShieldCheck, AlertTriangle, 
  CheckCircle2, Info, MapPin,
  ExternalLink, ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UnitDetailModal from "@/components/UnitDetailModal";

export default function ClientInventoryPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getClientInventory();
    if (res.success) setUnits(res.data);
    setLoading(false);
  };

  const sortedUnits = useMemo(() => {
    const list = [...units].filter(u => {
      const s = search.toLowerCase();
      return (
        u.tag_number?.toLowerCase().includes(s) ||
        u.model?.toLowerCase().includes(s) ||
        u.serial_number?.toLowerCase().includes(s) ||
        u.code?.toLowerCase().includes(s) ||
        u.room_tenant?.toLowerCase().includes(s) ||
        u.area?.toLowerCase().includes(s) ||
        u.location?.toLowerCase().includes(s) ||
        u.brand?.toLowerCase().includes(s) ||
        u.unit_type?.toLowerCase().includes(s) ||
        u.capacity?.toLowerCase().includes(s)
      );
    });

    return list.sort((a, b) => {
      const rank: any = { Problem: 0, Critical: 0, Warning: 1, On_Progress: 2, Pending: 2, Normal: 3 };
      const rankA = rank[a.status] || 99;
      const rankB = rank[b.status] || 99;
      
      if (rankA !== rankB) return rankA - rankB;

      // For Errors (rank 0), sort by date (oldest first)
      if (rankA === 0) {
        const dateA = new Date(a.last_service_date || a.created_at || 0).getTime();
        const dateB = new Date(b.last_service_date || b.created_at || 0).getTime();
        if (dateA !== dateB) return dateA - dateB;
      }

      return (a.tag_number || "").localeCompare(b.tag_number || "");
    });
  }, [units, search]);

  const totalPages = Math.ceil(sortedUnits.length / itemsPerPage);
  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUnits.slice(start, start + itemsPerPage);
  }, [sortedUnits, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-30">
        <div className="w-12 h-12 border-4 border-t-blue-600 border-slate-100 rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest">Inventory Sync...</p>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    const isBlinking = ["Problem", "Critical", "Pending", "On_Progress", "Warning"].includes(status);
    const colors: any = {
      Normal: "bg-emerald-50 text-emerald-600 border-emerald-100",
      Warning: "bg-amber-50 text-amber-600 border-amber-100",
      Problem: "bg-rose-50 text-rose-600 border-rose-100",
      Critical: "bg-rose-50 text-rose-600 border-rose-100",
      Pending: "bg-blue-50 text-blue-600 border-blue-100",
      On_Progress: "bg-indigo-50 text-indigo-600 border-indigo-100"
    };
    const accent: any = {
      Normal: "bg-emerald-500",
      Warning: "bg-amber-500",
      Problem: "bg-rose-500",
      Critical: "bg-rose-500",
      Pending: "bg-blue-500",
      On_Progress: "bg-indigo-500"
    };

    return { classes: colors[status] || colors.Normal, accent: accent[status] || accent.Normal, isBlinking };
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#003366] tracking-tighter">
            Asset <span className="text-[#00a1e4]">Inventory</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold mt-2">
            Managing <span className="text-[#003366] font-black">{units.length} registered units</span> across your facility.
          </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative group w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00a1e4] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Smart Search (Tag, Code, Serial, Room...)" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#00a1e4] transition-all shadow-sm"
              />
           </div>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-[1000px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity / Tag</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Spec / Cap</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Area / Floor</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Health Index</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="wait">
                {paginatedUnits.map((u, i) => {
                  const sInfo = getStatusInfo(u.status);
                  return (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => setSelectedUnit(u)}
                      className={`group transition-colors cursor-pointer hover:bg-slate-50/50 border-l-[6px] ${
                        u.status === 'Problem' || u.status === 'Critical' ? 'border-l-rose-500 bg-rose-50/10' : 
                        sInfo.accent.replace('bg-', 'border-l-').replace('500', '400')
                      }`}
                    >
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                            <div className="min-w-0">
                               <p className="text-base font-black text-[#003366] tracking-tighter truncate leading-tight group-hover:text-[#00a1e4] transition-colors">{u.room_tenant || "Unnamed Room"}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] font-black text-[#00a1e4] uppercase tracking-widest">{u.tag_number || "NO-TAG"}</span>
                                  <span className="text-[9px] font-mono font-medium text-slate-400">S/N: {u.serial_number || "---"}</span>
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-sm font-bold text-slate-700">{u.brand || "Daikin"} - {u.model}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{u.unit_type} · {u.capacity}</p>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-xs font-black text-slate-600 uppercase tracking-tight">{u.area}</p>
                         <p className="text-[10px] font-bold text-slate-400">{u.building_floor}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                           <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] pl-0.5">Health</span>
                           <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-black tracking-tighter border w-fit ${
                             u.health_score >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             u.health_score >= 50 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             'bg-rose-50 text-rose-600 border-rose-100'
                           }`}>
                             {Math.round(u.health_score || 0)}%
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${sInfo.classes} ${sInfo.isBlinking ? 'animate-pulse' : ''}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${sInfo.accent}`} />
                            {u.status.replace("_", " ")}
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <button className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-white group-hover:text-[#00a1e4] group-hover:shadow-md transition-all">
                            <ChevronRight size={18} />
                         </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Showing {(currentPage-1)*itemsPerPage + 1} - {Math.min(currentPage*itemsPerPage, sortedUnits.length)} of {sortedUnits.length} assets</p>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-xl bg-white disabled:opacity-30 hover:bg-slate-50 transition-all"
                >
                   <ChevronLeft size={18} className="text-[#003366]"/>
                </button>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-[#003366]">
                   {currentPage} / {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-xl bg-white disabled:opacity-30 hover:bg-slate-50 transition-all"
                >
                   <ChevronRightIcon size={18} className="text-[#003366]"/>
                </button>
             </div>
          </div>
        )}
      </div>

      {sortedUnits.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-300 grayscale opacity-40 bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
           <Package size={64} />
           <p className="mt-4 font-black uppercase tracking-widest text-xs">No assets matching your search</p>
        </div>
      )}

      {selectedUnit && (
        <UnitDetailModal 
          unit={selectedUnit} 
          isOpen={!!selectedUnit} 
          onClose={() => setSelectedUnit(null)} 
        />
      )}
    </div>
  );
}
