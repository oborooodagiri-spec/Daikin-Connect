"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Plus, CheckCircle2, AlertCircle, Clock, Settings, RefreshCw, QrCode } from "lucide-react";
import { getOutstandingCases, addOutstandingCase, resolveOutstandingCase, getProjectWaTargets, updateProjectWaTargets, getWaBotStatus, logoutWaBot } from "@/app/actions/outstanding";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false, loading: () => <div className="w-[200px] h-[200px] bg-slate-100 animate-pulse rounded-xl" /> });

export default function OutstandingTab({ projectId, isAdmin }: { projectId: any, isAdmin: boolean }) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [unitName, setUnitName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [waSettings, setWaSettings] = useState({
    numbers: [] as string[],
    groups: [] as string[],
    schedules: ["06:00", "18:00"],
    template: ""
  });
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Bot Connection State
  const [botStatus, setBotStatus] = useState("DISCONNECTED");
  const [botQr, setBotQr] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Temp inputs for arrays
  const [newNumber, setNewNumber] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSchedule, setNewSchedule] = useState("");

  useEffect(() => {
    loadCases();
    if (isAdmin) {
      loadSettings();
    }
  }, [projectId, isAdmin]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showSettings && isAdmin) {
      checkBotStatus();
      interval = setInterval(checkBotStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [showSettings, isAdmin]);

  const checkBotStatus = async () => {
    const res = await getWaBotStatus();
    if (res.success && res.data) {
      setBotStatus(res.data.status);
      setBotQr(res.data.qr_string || "");
      if (res.data.status !== "DISCONNECTED") {
        setIsLoggingOut(false);
      }
    }
  };

  const handleLogoutBot = async () => {
    if (!confirm("Yakin ingin memutuskan koneksi Bot WhatsApp ini? Bapak harus melakukan scan QR Code ulang setelahnya.")) return;
    setIsLoggingOut(true);
    await logoutWaBot();
  };

  const loadSettings = async () => {
    const res = await getProjectWaTargets(projectId);
    if (res.success && res.data) {
      let data = res.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
      }
      setWaSettings({
        numbers: data?.numbers || [],
        groups: data?.groups || [],
        schedules: data?.schedules || ["06:00", "18:00"],
        template: data?.template || "*OUTSTANDING CASE REPORT*\nProyek: {{ProjectName}}\nTanggal: {{Date}}\n\n*DAFTAR OUTSTANDING PENDING*:\n{{PendingList}}\n\n*DISELESAIKAN HARI INI*:\n{{CompletedList}}\nMohon kerja samanya untuk segera menyelesaikan case yang masih pending.\nPesan ini dikirim secara otomatis oleh Robot Daikin Connect."
      });
    }
  };

  const addArrayItem = (field: "numbers" | "groups" | "schedules", val: string, setter: any) => {
    if (!val) return;
    setWaSettings(prev => ({ ...prev, [field]: [...prev[field], val] }));
    setter("");
  };

  const removeArrayItem = (field: "numbers" | "groups" | "schedules", idx: number) => {
    setWaSettings(prev => ({ 
      ...prev, 
      [field]: prev[field].filter((_, i) => i !== idx) 
    }));
  };

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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const res = await updateProjectWaTargets(projectId, waSettings);
    if (res.success) {
      alert("Pengaturan WA berhasil disimpan.");
      setShowSettings(false);
    } else {
      alert("Error: " + res.error);
    }
    setSavingSettings(false);
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
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-3 bg-white border border-[#e6e9ef] text-slate-500 rounded-2xl hover:border-[#0073ea] hover:text-[#0073ea] transition-all"
              title="WA Notification Settings"
            >
              <Settings size={16} />
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[#0073ea] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#005bb5] transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Add Case
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="bg-white rounded-2xl border border-[#0073ea] p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#0073ea] mb-6 flex items-center gap-2">
            <Settings size={14} /> Advanced WA Notification Settings
          </h3>

          {/* BOT CONNECTION STATUS */}
          <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
              <QrCode size={14} /> Bot Connection Status
            </h4>
            
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              {botStatus === "READY" && (
                <div className="text-center space-y-4 w-full">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Bot Terhubung & Siap Mengirim Pesan
                  </div>
                  <div className="block">
                    <button 
                      onClick={handleLogoutBot}
                      disabled={isLoggingOut}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isLoggingOut ? "Memutuskan Koneksi..." : "Ganti Nomor Pengirim (Logout)"}
                    </button>
                  </div>
                </div>
              )}

              {botStatus === "QR" && botQr && (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-xs font-bold mb-2">
                    <AlertCircle size={14} />
                    Menunggu Scan Barcode
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm inline-block">
                    <QRCode value={botQr} size={200} />
                  </div>
                  <p className="text-xs text-slate-500 font-bold max-w-xs mx-auto">
                    Silakan buka WhatsApp di HP Bot, pilih **Linked Devices**, lalu scan barcode di atas.
                  </p>
                </div>
              )}

              {botStatus === "DISCONNECTED" && (
                <div className="text-center space-y-3 py-6">
                  <RefreshCw size={24} className="mx-auto text-slate-400 animate-spin" />
                  <p className="text-xs font-bold text-slate-500">Memulai ulang server robot...</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Numbers */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Personal Numbers</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newNumber} onChange={e => setNewNumber(e.target.value)} placeholder="Ex: 6281234567890" className="flex-1 px-3 py-2 rounded-xl border border-[#e6e9ef] text-sm focus:border-[#0073ea] focus:outline-none"/>
                  <button type="button" onClick={() => addArrayItem("numbers", newNumber, setNewNumber)} className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200">Add</button>
                </div>
                <div className="space-y-1">
                  {(waSettings?.numbers || []).map((num, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg text-sm font-bold text-slate-700">
                      {num}
                      <button onClick={() => removeArrayItem("numbers", i)} className="text-red-500 hover:text-red-700">&times;</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Groups */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Group IDs</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newGroup} onChange={e => setNewGroup(e.target.value)} placeholder="Ex: 120363123@g.us" className="flex-1 px-3 py-2 rounded-xl border border-[#e6e9ef] text-sm focus:border-[#0073ea] focus:outline-none"/>
                  <button type="button" onClick={() => addArrayItem("groups", newGroup, setNewGroup)} className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200">Add</button>
                </div>
                <div className="space-y-1">
                  {(waSettings?.groups || []).map((grp, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg text-sm font-bold text-slate-700">
                      {grp}
                      <button onClick={() => removeArrayItem("groups", i)} className="text-red-500 hover:text-red-700">&times;</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedules */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Schedules (HH:mm)</label>
              <div className="flex gap-2 mb-2">
                <input type="time" value={newSchedule} onChange={e => setNewSchedule(e.target.value)} className="px-3 py-2 rounded-xl border border-[#e6e9ef] text-sm focus:border-[#0073ea] focus:outline-none"/>
                <button type="button" onClick={() => addArrayItem("schedules", newSchedule, setNewSchedule)} className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200">Add Time</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(waSettings?.schedules || []).map((sch, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#0073ea]/10 text-[#0073ea] px-3 py-1.5 rounded-lg text-sm font-bold">
                    <Clock size={14} /> {sch}
                    <button onClick={() => removeArrayItem("schedules", i)} className="ml-1 hover:text-red-500">&times;</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Template */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Message Template</label>
              <textarea 
                value={waSettings?.template || ""} 
                onChange={e => setWaSettings(prev => ({ ...prev, template: e.target.value }))} 
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-[#e6e9ef] focus:outline-none focus:border-[#0073ea] focus:ring-1 focus:ring-[#0073ea] text-sm text-[#323338]"
                placeholder="Template text here..."
              />
              <p className="text-[10px] font-bold text-slate-400 mt-2">
                Available variables: <code className="bg-slate-100 px-1 py-0.5 rounded">{{ProjectName}}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{{Date}}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{{PendingList}}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{{CompletedList}}</code>
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e6e9ef]">
              <button 
                type="button" 
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Close
              </button>
              <button 
                type="button" 
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-6 py-3 bg-[#0073ea] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#005bb5] transition-all disabled:opacity-50"
              >
                {savingSettings ? "Saving..." : "Save Settings"}
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
