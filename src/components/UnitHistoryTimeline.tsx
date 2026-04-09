"use client";

import React, { useState } from "react";
import { 
  Clock, 
  FileText, 
  CheckCircle2, 
  History, 
  Download, 
  ExternalLink, 
  Activity, 
  ShieldCheck, 
  Loader2 
} from "lucide-react";
import { softDeleteActivity } from "@/app/actions/units";
import { Trash2 } from "lucide-react";

interface HistoryItem {
  id: string;
  type: string;
  date: string | Date;
  engineer: string;
  note: string;
  pdf?: string | null;
  baPdf?: string | null;
  isApproved?: boolean;
  approverName?: string;
  approvedAt?: string | Date;
  technical_json?: string | null;
  technical_advice?: string | null;
  isFormal?: boolean;
  healthScore?: number;
}

export default function UnitHistoryTimeline({ history, session, unit }: { history: HistoryItem[], session?: any, unit?: any }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const normalizeUrl = (url: string | null | undefined, type: string) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('/')) return url;
    
    // Check multiple folder candidates for legacy files
    const candidates = [
      (type || "misc").toLowerCase(),
      "reports",
      "audit",
      "preventive",
      "corrective",
      "berita-acara"
    ];

    // For now, we'll try the most likely one based on type
    let folder = candidates[0];
    if (folder.includes('acara')) folder = "berita-acara";
    
    return `/uploads/${folder}/${url}`;
  };


  const handleGenerateReport = (item: HistoryItem) => {
    if (!unit) return alert("Unit data missing for generation.");
    // Open the new Report Hub in a new tab
    window.open(`/reports/${item.type}/${item.id}`, "_blank");
  };

  // Helper for internal roles
  const isInternal = session?.isInternal || session?.roles?.some((r: any) => 
    ['admin', 'management', 'sales engineer', 'engineer', 'sales_engineer'].includes(r.toLowerCase())
  );
  const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(r.toLowerCase()));

  const handleGenerateBA = (item: HistoryItem) => {
    if (!unit) return alert("Unit data missing for generation.");
    // Open the new Report Hub as Berita Acara
    window.open(`/reports/BA/${item.id}`, "_blank");
  };

  const handleApprove = (item: HistoryItem) => {
    // Redirect to BA report in hubs, it will handle the signing
    window.open(`/reports/BA/${item.id}`, "_blank");
  };

  const handleDelete = async (item: HistoryItem) => {
    const confirmMsg = `PERHATIAN: Laporan ini akan dipindahkan ke Trash selama 7 hari sebelum dihapus PERMANEN.\n\nApakah Anda yakin ingin menghapus laporan ${item.type} ini?`;
    if (!confirm(confirmMsg)) return;

    setIsDeleting(item.id);
    try {
      const res = await softDeleteActivity(Number(item.id), item.isFormal ? 'formal' : 'quick');
      if (res.success) {
        alert("Laporan berhasil dipindahkan ke Trash.");
        window.location.reload();
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="py-12 text-center">
        <History className="w-12 h-12 mx-auto text-slate-200 mb-3" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Belum Ada Riwayat Servis</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
      {history.map((item) => (
        <div key={item.id} className="relative flex items-start gap-6 group">
          {/* Icon Circle */}
          <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-110 
            ${item.type === 'Corrective' ? 'bg-rose-500 text-white' : 
              item.type === 'Audit' ? 'bg-emerald-500 text-white' : 
              item.type === 'Preventive' ? 'bg-[#00a1e4] text-white' : 
              'bg-slate-400 text-white'}`}>
            {item.type === 'Corrective' ? <Clock size={16} /> : 
             item.type === 'Audit' ? <FileText size={16} /> : 
             <CheckCircle2 size={16} />}
          </div>

          {/* Content Card */}
          <div className="flex-1 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border 
                  ${item.type === 'Corrective' ? 'text-rose-600 border-rose-100 bg-rose-50' : 
                    item.type === 'Audit' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 
                    'text-blue-600 border-blue-100 bg-blue-50'}`}>
                  {item.type}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {item.type === 'Audit' && (
                  <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-100 flex items-center gap-1">
                    <Activity size={10} /> Vitalitas: {item.healthScore || 100}%
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* UNIVERSAL BUTTONS FOR TECHNICAL ACTIVITIES */}
                {['audit', 'preventive', 'corrective'].includes(item.type.toLowerCase()) && (
                  <>
                    <button 
                      onClick={() => handleGenerateReport(item)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm"
                      title="Lihat Laporan Teknis"
                    >
                      <Download size={12} />
                      {item.pdf ? 'View Technical Report' : 'Technical Report'}
                    </button>

                    <button 
                      onClick={() => handleGenerateBA(item)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors shadow-sm"
                      title="Lihat Berita Acara (BA)"
                    >
                      <FileText size={12} />
                      {item.baPdf ? 'View Berita Acara' : 'Berita Acara'}
                    </button>
                  </>
                )}
                
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(item)}
                    disabled={isDeleting === item.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-wider rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors shadow-sm"
                    title="Hapus Laporan (Soft Delete 7 Hari)"
                  >
                    {isDeleting === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm group-hover:border-slate-300 transition-colors">
              <p className="text-xs font-black text-[#003366] mb-1">{item.engineer || "Teknisi Lapangan"}</p>
              <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                "{item.note || "Tidak ada catatan tambahan."}"
              </p>
              
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {!item.isFormal && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <ExternalLink size={10} /> Quick Report via Passport
                    </div>
                  )}
                  {item.isApproved && (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                      <ShieldCheck size={12} /> Digitally Verified: {item.approverName}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.baPdf && !item.isApproved && !isInternal && (
                    <button
                      onClick={() => handleApprove(item)}
                      className="px-4 py-2 bg-[#00a1e4] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#008cc6] transition-all shadow-md shadow-blue-200 flex items-center gap-2"
                    >
                      <ShieldCheck size={14} /> Approve & Tanda Tangan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
