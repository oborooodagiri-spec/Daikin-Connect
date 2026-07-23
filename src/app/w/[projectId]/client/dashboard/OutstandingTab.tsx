"use client";

import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { getOutstandingCases, addOutstandingCase, resolveOutstandingCase } from "@/app/actions/outstanding";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function OutstandingTab({ projectId, isAdmin }: { projectId: any, isAdmin: boolean }) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [unitName, setUnitName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCases();
  }, [projectId]);

  const loadCases = async () => {
    setLoading(true);
    const res = await getOutstandingCases(projectId);
    if (res.success) {
      setCases(res.data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setSubmitting(true);
    const res = await addOutstandingCase({ project_id: projectId, title, unit_name: unitName });
    if (res.success) {
      setTitle("");
      setUnitName("");
      setShowForm(false);
      await loadCases();
    } else {
      alert("Error: " + res.error);
    }
    setSubmitting(false);
  };

  const handleResolve = async (id: string) => {
    if (!confirm("Tandai kasus ini sudah selesai?")) return;
    await resolveOutstandingCase(id, projectId);
    await loadCases();
  };

  if (loading) {
    return <div className="animate-pulse bg-white rounded-2xl h-96 border border-[#e6e9ef]"></div>;
  }

  const pendingCases = cases.filter(c => c.status === "Pending");
  const completedCases = cases.filter(c => c.status === "Completed");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-[#323338]">Outstanding Cases</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage manual checklists & issues</p>
        </div>
        
        {isAdmin && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-[#0073ea] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#005bb5] transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Add Case
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#0073ea] p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#0073ea] mb-4">New Outstanding Case</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Title / Description *</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e6e9ef] focus:outline-none focus:border-[#0073ea] focus:ring-1 focus:ring-[#0073ea] text-sm font-bold text-[#323338]"
                placeholder="Ex: Filter replacement needed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Unit Name (Optional)</label>
              <input 
                type="text" 
                value={unitName} 
                onChange={e => setUnitName(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-[#e6e9ef] focus:outline-none focus:border-[#0073ea] focus:ring-1 focus:ring-[#0073ea] text-sm font-bold text-[#323338]"
                placeholder="Ex: AC-01"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="px-6 py-3 bg-[#0073ea] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#005bb5] transition-all disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Case"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending Cases */}
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-600 flex items-center gap-2 mb-6">
              <AlertCircle size={16} /> Pending ({pendingCases.length})
           </h3>
           
           {pendingCases.length === 0 ? (
             <p className="text-xs font-bold text-slate-400 text-center py-8">Tidak ada kasus pending.</p>
           ) : (
             <div className="space-y-4">
               {pendingCases.map(c => (
                 <div key={c.id} className="p-4 rounded-xl border border-[#e6e9ef] bg-[#fcfcfd] flex items-center justify-between gap-4">
                   <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-bold text-[#323338]">{c.title}</h4>
                     {c.unit_name && <p className="text-xs font-bold text-slate-500 mt-1">Unit: {c.unit_name}</p>}
                     <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <Clock size={12} /> {format(new Date(c.created_at), "dd MMM yyyy", { locale: localeId })}
                     </div>
                   </div>
                   {isAdmin && (
                     <button 
                       onClick={() => handleResolve(c.id)}
                       className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors shrink-0 flex items-center gap-2"
                     >
                       <CheckCircle2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Selesai</span>
                     </button>
                   )}
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Completed Cases */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2 mb-6">
              <CheckCircle2 size={16} /> Completed ({completedCases.length})
           </h3>
           
           {completedCases.length === 0 ? (
             <p className="text-xs font-bold text-slate-400 text-center py-8">Belum ada kasus diselesaikan.</p>
           ) : (
             <div className="space-y-4">
               {completedCases.map(c => (
                 <div key={c.id} className="p-4 rounded-xl border border-emerald-50 bg-emerald-50/30 flex items-center justify-between gap-4">
                   <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-bold text-emerald-900 line-through decoration-emerald-300">{c.title}</h4>
                     {c.unit_name && <p className="text-xs font-bold text-emerald-600/70 mt-1">Unit: {c.unit_name}</p>}
                     <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                       Selesai pada {format(new Date(c.updated_at), "dd MMM yyyy", { locale: localeId })}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
