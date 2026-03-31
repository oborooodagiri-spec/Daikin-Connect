"use client";

import { Clock, FileText, CheckCircle2, History, Download, ExternalLink } from "lucide-react";

interface HistoryItem {
  id: string;
  type: string;
  date: string | Date;
  engineer: string;
  note: string;
  pdf?: string | null;
  isFormal?: boolean;
}

export default function UnitHistoryTimeline({ history }: { history: HistoryItem[] }) {
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
      {history.map((item, idx) => (
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
              </div>
              {item.pdf && (
                <a 
                  href={item.pdf} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#00a1e4] hover:underline"
                >
                  <Download size={12} /> Laporan PDF
                </a>
              )}
            </div>
            
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm group-hover:border-slate-300 transition-colors">
              <p className="text-xs font-black text-[#003366] mb-1">{item.engineer || "Teknisi Lapangan"}</p>
              <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                "{item.note || "Tidak ada catatan tambahan."}"
              </p>
              
              {!item.isFormal && (
                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <ExternalLink size={10} /> Quick Report via Passport
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
