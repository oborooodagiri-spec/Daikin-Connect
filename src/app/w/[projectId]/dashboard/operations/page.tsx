"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, AlertTriangle, CheckCircle2, Clock, 
  Users, Activity, Filter, Search, MoreHorizontal,
  ChevronRight, MessageSquare, ShieldAlert,
  ArrowUpRight, Target, Plus, Trash2, Circle, CheckCircle,
  ChevronDown, ChevronUp, ClipboardList, Settings, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getGlobalProjectIntelligence, 
  updateProjectIntelligence,
  addProjectIssue,
  updateProjectIssue,
  deleteProjectIssue
} from "@/app/actions/project_intelligence";

export default function OperationsMonitorPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // For Issue input
  const [newIssueText, setNewIssueText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData(true);
  }, []);

  async function fetchData(isInitial = false) {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const res = await getGlobalProjectIntelligence();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load projects");
      }
    } catch (err: any) {
      console.error("CRITICAL OPS ERROR:", err);
      setError(`Database Error: ${err.message}`);
    }
    setLoading(false);
  }

  const handleAddIssue = async (projectId: string) => {
    const text = newIssueText[projectId];
    if (!text?.trim()) return;

    const res = await addProjectIssue(projectId, text);
    if (res.success) {
      setNewIssueText(prev => ({ ...prev, [projectId]: "" }));
      await fetchData();
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    await deleteProjectIssue(issueId);
    await fetchData();
  };

  const filteredData = data.filter(p => {
    const matchesSearch = p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || (p.intelligence?.strategic_status || "Investigation") === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleIssueUpdate = async (issueId: string, updatedFields: any, e?: React.MouseEvent | React.KeyboardEvent) => {
    // Show temporary feedback on button if it was a button click
    const btn = e?.currentTarget as HTMLButtonElement;
    const originalText = btn?.innerText;
    const isModalBtn = btn && btn.tagName === 'BUTTON' && btn.innerText.includes('PLAN');

    if (isModalBtn) {
       btn.innerText = "SAVING...";
    }

    const res = await updateProjectIssue(issueId, updatedFields);
    if (res.success) {
      await fetchData();
      if (isModalBtn) {
         btn.innerText = "SAVED!";
         setTimeout(() => {
            if (btn) btn.innerText = originalText || "SAVE PLAN";
         }, 1500);
      }
    } else {
      console.error("Update failed:", res.error);
      if (isModalBtn) btn.innerText = originalText || "SAVE PLAN";
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedProjectId) return;
    setUpdating(true);
    const res = await updateProjectIntelligence(selectedProjectId, formData);
    if (res.success) {
      await fetchData();
      setIsUpdateModalOpen(false);
    } else {
      alert("Update failed: " + res.error);
    }
    setUpdating(false);
  };

  // Find project in the latest data array
  const currentProjectSelection = data.find(p => p.id === selectedProjectId);

  if (loading && data.length === 0) {
     return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
           <div className="w-12 h-12 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Intelligence...</p>
        </div>
     );
  }

  return (
    <div className="w-full space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* Strategic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-[#00a1e4]">
               <Target className="w-3.5 h-3.5" />
               <span>Strategic Operations Control</span>
            </div>
            <h1 className="text-4xl font-black text-[#003366] tracking-tight">Project <span className="text-[#00a1e4]">Masterboard</span></h1>
         </div>

         <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search Client or Project..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-11 pr-6 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none w-[280px] focus:border-[#00a1e4]"
               />
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
               {["All", "Running", "Delayed"].map(s => (
                 <button 
                   key={s}
                   onClick={() => setFilterStatus(s)}
                   className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white text-[#00a1e4] shadow-sm' : 'text-slate-500'}`}
                 >
                   {s}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Strategic Board */}
      <div className="grid grid-cols-1 gap-6">
         {!error && filteredData.map((p, idx) => {
            const intel = p.intelligence;
            const issues = p.issues || [];
            const successCount = issues.filter((i: any) => i.outcome === "Success").length;
            const totalActions = issues.filter((i: any) => i.roadmap_action).length;
            const successRate = totalActions > 0 ? Math.round((successCount / totalActions) * 100) : 0;
            const isAtRisk = intel?.health_score === "At Risk" || intel?.health_score === "Critical";
            
            return (
               <motion.div 
                 key={p.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden hover:border-[#00a1e4] transition-all duration-300"
               >
                  <div className="flex flex-col lg:flex-row lg:items-stretch">
                     {/* Identity Panel */}
                     <div className="lg:w-80 p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
                        <div className="space-y-6">
                           <div className="flex items-start justify-between">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#003366] group-hover:text-[#00a1e4] transition-colors">
                                 <BarChart3 size={24} />
                              </div>
                              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isAtRisk ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                 {intel?.health_score || "Untracked"}
                              </div>
                           </div>
                           
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.customerName}</p>
                              <h3 className="text-xl font-black text-[#003366] leading-tight">{p.projectName}</h3>
                           </div>

                           <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                              <div className="flex justify-between">
                                 <p className="text-[8px] font-black text-slate-400 uppercase">Action Success Rate</p>
                                 <p className="text-[10px] font-black text-slate-800">{successRate}%</p>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                 <div className={`h-full bg-emerald-500 transition-all duration-1000`} style={{ width: `${successRate}%` }} />
                              </div>
                           </div>

                           <div className="flex flex-wrap gap-2">
                              <div className="p-1 px-3 rounded-lg bg-blue-50 border border-blue-100 text-[9px] font-black text-blue-600 uppercase flex items-center gap-1.5">
                                 <Activity size={10} /> {intel?.strategic_status || "Investigation"}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Tactical Roadmap (Bulleted Sub-list) */}
                     <div className="flex-1 p-8 bg-slate-50/20">
                        <div className="flex items-center justify-between mb-6">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <ClipboardList size={12} /> Strategic Roadmap & Status
                           </p>
                           {issues.some((i: any) => i.urgency === 'Critical') && (
                              <span className="flex items-center gap-1.5 text-[9px] font-black text-rose-600 animate-pulse">
                                 <ShieldAlert size={12} /> CRITICAL BLOCKERS ACTIVE
                              </span>
                           )}
                        </div>

                        <div className="space-y-6">
                           {issues.map((issue: any) => (
                              <div key={issue.id} className="space-y-2">
                                 {/* Parent: The Problem */}
                                 <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    <p className="text-sm font-black text-[#003366]">{issue.issue_text}</p>
                                    {issue.urgency === 'Critical' && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-xl shadow-rose-500/50" />}
                                 </div>

                                 {/* Child: The Action Plan (Bulleted Sub-list) */}
                                 {issue.roadmap_action && (
                                    <div className="ml-5 relative pl-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4 group/action">
                                       <div className="absolute left-[-12px] top-[50%] w-[12px] h-[1px] bg-slate-200" />
                                       
                                       {/* Outcome Indicator - QUICK TOGGLE */}
                                       <button 
                                          onClick={() => {
                                             const outcomes = ['Ongoing', 'Success', 'Failed'];
                                             const nextIdx = (outcomes.indexOf(issue.outcome || 'Ongoing') + 1) % outcomes.length;
                                             handleIssueUpdate(issue.id, { outcome: outcomes[nextIdx] });
                                          }}
                                          className="flex-shrink-0 transition-transform active:scale-90 hover:scale-110"
                                          title="Click to toggle Outcome (Success/Failed)"
                                       >
                                          {issue.outcome === 'Success' ? (
                                             <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                                <CheckCircle2 size={14} />
                                             </div>
                                          ) : issue.outcome === 'Failed' ? (
                                             <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                                <AlertTriangle size={14} />
                                             </div>
                                          ) : (
                                             <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-400">
                                                <Clock size={12} />
                                             </div>
                                          )}
                                       </button>

                                       <div className="flex-1">
                                          <p className={`text-[11px] font-bold leading-relaxed italic ${issue.outcome === 'Success' ? 'text-emerald-700/60 line-through' : 'text-slate-600'}`}>
                                             "{issue.roadmap_action}"
                                          </p>
                                       </div>

                                       {/* Progress Badge - QUICK TOGGLE */}
                                       <button 
                                          onClick={() => {
                                             const statuses = ['Pending', 'In Progress', 'Resolved'];
                                             const nextIdx = (statuses.indexOf(issue.action_status || 'Pending') + 1) % statuses.length;
                                             handleIssueUpdate(issue.id, { action_status: statuses[nextIdx] });
                                          }}
                                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                          issue.action_status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                          issue.action_status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                       }`}>
                                          {issue.action_status || 'Pending'}
                                       </button>
                                    </div>
                                 )}
                              </div>
                           ))}
                           {issues.length === 0 && <p className="text-xs font-bold text-slate-300 italic py-4">No strategic problems mapped for this project.</p>}
                        </div>
                     </div>

                     {/* Action Panel */}
                     <div className="lg:w-72 p-8 bg-white lg:border-l border-slate-100 flex flex-col justify-end">
                        <button 
                           onClick={() => { setSelectedProjectId(p.id); setIsUpdateModalOpen(true); }}
                           className="w-full py-4 rounded-2xl bg-[#003366] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#00a1e4] transition-all active:scale-95 shadow-xl shadow-blue-900/10"
                        >
                           Configure Actions <Settings size={14} className="inline ml-2" />
                        </button>
                     </div>
                  </div>
               </motion.div>
            );
         })}
      </div>

      {/* Hierarchy-Reflecting Modal */}
      <AnimatePresence>
         {isUpdateModalOpen && currentProjectSelection && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUpdateModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                  <div className="p-8 bg-slate-50 flex items-center justify-between border-b">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{currentProjectSelection.customerName}</p>
                        <h3 className="text-xl font-black text-[#003366]">Tactical Room ({currentProjectSelection.projectName})</h3>
                     </div>
                     <button onClick={() => setIsUpdateModalOpen(false)} className="bg-white p-2 rounded-full text-slate-400 hover:text-rose-500 shadow-sm"><Check size={20} /></button>
                  </div>

                  <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                     <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase">Project Status</label>
                           <select 
                             defaultValue={currentProjectSelection.intelligence?.strategic_status || "Investigation"}
                             onChange={(e) => handleUpdate({ strategic_status: e.target.value })}
                             className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#00a1e4]/20"
                           >
                              <option>Proposal Request</option><option>Running</option><option>Delayed</option><option>Final Phase</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase">Overall Health</label>
                           <select 
                             defaultValue={currentProjectSelection.intelligence?.health_score || "Healthy"}
                             onChange={(e) => handleUpdate({ health_score: e.target.value })}
                             className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#00a1e4]/20"
                           >
                              <option>Healthy</option><option>At Risk</option><option>Critical</option>
                           </select>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Operational Roadmap Manager</label>
                        {currentProjectSelection.issues?.map((issue: any) => (
                           <div key={issue.id} className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-200/50 space-y-6">
                              <div className="flex items-start justify-between gap-4">
                                 <p className="flex-1 font-black text-[#003366] text-sm">{issue.issue_text}</p>
                                 <button onClick={() => handleDeleteIssue(issue.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                              </div>

                              <div className="pl-6 border-l-2 border-slate-200 space-y-6">
                                 <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                       <label className="text-[8px] font-black text-slate-400 uppercase">Urgency</label>
                                       <select defaultValue={issue.urgency || "Normal"} onChange={(e) => handleIssueUpdate(issue.id, { urgency: e.target.value })} className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-[10px] font-black outline-none"><option>Normal</option><option>High</option><option>Critical</option></select>
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[8px] font-black text-[#00a1e4] uppercase">Action Progress</label>
                                       <select defaultValue={issue.action_status || "Pending"} onChange={(e) => handleIssueUpdate(issue.id, { action_status: e.target.value })} className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-[10px] font-black outline-none text-blue-600"><option>Pending</option><option>In Progress</option><option>Resolved</option></select>
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[8px] font-black text-slate-400 uppercase">Action Outcome</label>
                                       <select defaultValue={issue.outcome || "Ongoing"} onChange={(e) => handleIssueUpdate(issue.id, { outcome: e.target.value })} className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-[10px] font-black outline-none"><option>Ongoing</option><option>Success</option><option>Failed</option></select>
                                    </div>
                                 </div>

                                 <div className="space-y-2">
                                    <label className="text-[8px] font-black text-slate-400 uppercase">Action Plan (Roadmap)</label>
                                    <textarea 
                                      defaultValue={issue.roadmap_action || ""} 
                                      placeholder="What are the steps to resolve this?" 
                                      onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleIssueUpdate(issue.id, { roadmap_action: e.currentTarget.value }, e); }}
                                      className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-600 outline-none focus:border-blue-400 min-h-[90px] resize-none"
                                    />
                                    <div className="flex justify-end">
                                       <button type="button" onClick={(e) => { const txt = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement; handleIssueUpdate(issue.id, { roadmap_action: txt.value }, e); }} className="px-5 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20">Save Plan</button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}

                        <div className="pt-6 flex gap-2">
                           <input 
                             type="text" 
                             placeholder="Map a new critical problem..." 
                             value={newIssueText[currentProjectSelection.id] || ""} 
                             onChange={(e) => setNewIssueText(prev => ({ ...prev, [currentProjectSelection.id]: e.target.value }))}
                             className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none focus:border-[#00a1e4]"
                           />
                           <button onClick={() => handleAddIssue(currentProjectSelection.id)} className="px-8 bg-[#003366] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/10">Add</button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
