"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Plus, CheckCircle2 } from "lucide-react";
import { getOutstandingCases, resolveOutstandingCase } from "@/app/actions/outstanding";

export default function OutstandingCaseWidget({ projectId, isAdmin }: { projectId: any, isAdmin: boolean }) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, [projectId]);

  const loadCases = async () => {
    setLoading(true);
    const res = await getOutstandingCases(projectId);
    if (res.success) {
      setCases(res.data?.filter(c => c.status === "Pending") || []);
    }
    setLoading(false);
  };

  const handleResolve = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tandai kasus ini sudah selesai?")) return;
    
    await resolveOutstandingCase(id, projectId);
    await loadCases();
  };

  if (loading) {
    return <div className="animate-pulse bg-white rounded-2xl h-64 border border-[#e6e9ef]"></div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e6e9ef] overflow-hidden shadow-sm flex flex-col">
      <div className="p-6 border-b border-[#f7f8fa] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#323338]">Outstanding Cases</h3>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Attention Required</p>
          </div>
        </div>
        <div className="text-xl font-black text-rose-600 bg-rose-50 px-4 py-2 rounded-xl">
          {cases.length}
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
        {cases.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center h-full">
            <CheckCircle2 size={32} className="text-emerald-300 mb-2" />
            <p className="text-xs font-bold text-slate-400">Semua outstanding telah diselesaikan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-[#e6e9ef] bg-[#fcfcfd] flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#323338] truncate">{c.title}</h4>
                  {c.unit_name && <p className="text-[10px] font-bold text-slate-400 truncate mt-1">{c.unit_name}</p>}
                </div>
                {isAdmin && (
                  <button 
                    onClick={(e) => handleResolve(c.id, e)}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
                    title="Tandai Selesai"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
