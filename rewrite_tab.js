const fs = require('fs');
let code = fs.readFileSync('src/app/w/[projectId]/client/dashboard/OutstandingTab.tsx', 'utf8');

// We will overwrite it directly.
const newCode = `import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { getOutstandingCases, addOutstandingCase, resolveOutstandingCase, getProjectWaTargets, updateProjectWaTargets } from "@/app/actions/outstanding";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export default function OutstandingTab({ projectId, isAdmin }: { projectId: any, isAdmin: boolean }) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [unitName, setUnitName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Settings State (Schedules only)
  const [schedules, setSchedules] = useState<string[]>(["06:00", "18:00"]);
  const [newSchedule, setNewSchedule] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadCases();
    if (isAdmin) {
      loadSettings();
    }
    
    // Auto-polling every 10 seconds
    const interval = setInterval(() => {
      loadCases(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [projectId, isAdmin]);

  const loadSettings = async () => {
    const res = await getProjectWaTargets(projectId);
    if (res.success && res.data) {
      const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      if (data.schedules) setSchedules(data.schedules);
    }
  };

  const loadCases = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const res = await getOutstandingCases(projectId);
    if (res.success) {
      setCases(res.data || []);
    }
    if (showLoading) setLoading(false);
  };

  const handleSaveSettings = async (newSchedules: string[]) => {
    setSavingSettings(true);
    // Keep old numbers/template if they exist just in case, but overwrite schedules
    const existing = await getProjectWaTargets(projectId);
    let settingsData = { schedules: newSchedules };
    if (existing.success && existing.data) {
       const old = typeof existing.data === 'string' ? JSON.parse(existing.data) : existing.data;
       settingsData = { ...old, schedules: newSchedules };
    }
    
    await updateProjectWaTargets(projectId, settingsData);
    setSavingSettings(false);
  };

  const addSchedule = () => {
    if (newSchedule && !schedules.includes(newSchedule)) {
      const updated = [...schedules, newSchedule].sort();
      setSchedules(updated);
      setNewSchedule("");
      handleSaveSettings(updated);
    }
  };

  const removeSchedule = (index: number) => {
    const updated = [...schedules];
    updated.splice(index, 1);
    setSchedules(updated);
    handleSaveSettings(updated);
  };

  const handleError = (err: any) => {
    const msg = err?.message || err?.toString() || "";
    if (msg.includes("older or newer deployment") || msg.includes("Failed to find Server Action")) {
      alert("System updated in background. Refreshing...");
      window.location.reload();
    } else {
      alert("Error: " + msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);
    try {
      const res = await addOutstandingCase({ project_id: projectId, title, unit_name: unitName });
      if (res.success) {
        setShowForm(false);
        setTitle("");
        setUnitName("");
        await loadCases();
      } else {
        alert("Error: " + res.error);
      }
    } catch (err: any) { handleError(err); }
    setSubmitting(false);
  };

  const handleResolve = async (id: string) => {
    if (!confirm("Mark this case as resolved?")) return;
    try {
      await resolveOutstandingCase(id, projectId);
      await loadCases();
    } catch (err: any) { handleError(err); }
  };

  if (loading) return <div className="p-8 text-center text-sm font-bold text-slate-400">Loading cases...</div>;

  const pendingCases = cases.filter(c => c.status === "Pending");
  const completedCases = cases.filter(c => c.status === "Completed");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-black text-[#00102a] tracking-tight uppercase">OUTSTANDING CASES</h2>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#0073ea] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#005bb5] transition-colors shadow-sm hover:shadow-md"
            >
              <Plus size={16} /> Add Case
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-[#fcfcfd] border border-blue-100 p-4 rounded-xl flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Automated WA Reports</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {schedules.map((sch, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100">
                {sch}
                <button onClick={() => removeSchedule(i)} className="text-blue-400 hover:text-red-500 transition-colors">&times;</button>
              </div>
            ))}
            <div className="flex items-center gap-2 ml-2">
              <input 
                type="time" 
                value={newSchedule} 
                onChange={e => setNewSchedule(e.target.value)} 
                className="px-2 py-1 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={addSchedule}
                disabled={savingSettings}
                className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Add Time
              </button>
            </div>
          </div>
        </div>
      )}

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
                placeholder="Ex: AC leaking on Level 2"
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
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm flex flex-col h-[500px]">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-600 flex items-center gap-2 mb-6 shrink-0">
              <AlertCircle size={16} /> Pending ({pendingCases.length})
           </h3>
           
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
             {pendingCases.length === 0 ? (
               <p className="text-xs font-bold text-slate-400 text-center py-8">No pending cases.</p>
             ) : (
               <div className="space-y-4">
                 {pendingCases.map(c => (
                   <div key={c.id} className="p-4 rounded-xl border border-[#e6e9ef] bg-[#fcfcfd] flex items-center justify-between gap-4">
                     <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-bold text-[#323338]">{c.title}</h4>
                       {c.unit_name && <p className="text-xs font-bold text-slate-500 mt-1">Unit: {c.unit_name}</p>}
                       <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <Clock size={12} /> {format(new Date(c.created_at), "dd MMM yyyy", { locale: enUS })}
                       </div>
                     </div>
                     {isAdmin && (
                       <button 
                         onClick={() => handleResolve(c.id)}
                         className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors shrink-0 flex items-center gap-2"
                       >
                         <CheckCircle2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Resolve</span>
                       </button>
                     )}
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

        {/* Completed Cases */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm flex flex-col h-[500px]">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2 mb-6 shrink-0">
              <CheckCircle2 size={16} /> Completed ({completedCases.length})
           </h3>
           
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
             {completedCases.length === 0 ? (
               <p className="text-xs font-bold text-slate-400 text-center py-8">No cases resolved.</p>
             ) : (
               <div className="space-y-4">
                 {completedCases.map(c => (
                   <div key={c.id} className="p-4 rounded-xl border border-emerald-50 bg-emerald-50/30 flex items-center justify-between gap-4">
                     <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-bold text-emerald-900 line-through decoration-emerald-300">{c.title}</h4>
                       {c.unit_name && <p className="text-xs font-bold text-emerald-600/70 mt-1">Unit: {c.unit_name}</p>}
                       <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                         Resolved on {format(new Date(c.updated_at), "dd MMM yyyy", { locale: enUS })}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
`

fs.writeFileSync('src/app/w/[projectId]/client/dashboard/OutstandingTab.tsx', newCode, 'utf8');
