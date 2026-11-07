"use client";

import React, { useState } from "react";
import { X, LogOut, Clock, AlertCircle, Loader2, ShieldCheck, User } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

interface ManualClockOutModalProps {
  record: any;
  user: any;
  onClose: () => void;
  onSubmit: (params: { attendanceId: number; notes: string; checkOutTime?: string }) => Promise<void>;
}

export default function ManualClockOutModal({
  record,
  user,
  onClose,
  onSubmit
}: ManualClockOutModalProps) {
  const [notes, setNotes] = useState("");
  const [timeStr, setTimeStr] = useState(format(new Date(), "HH:mm"));
  const [submitting, setSubmitting] = useState(false);

  const userName = user?.name || record?.users?.name || "Personel";
  const projectName = record?.projects?.name || "Daikin Project";
  const checkInTime = record?.check_in_time 
    ? format(new Date(record.check_in_time), "dd MMMM yyyy, HH:mm WIB", { locale: id })
    : "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert("Mohon masukkan catatan alasan clock-out manual.");
      return;
    }

    setSubmitting(true);
    try {
      let customDateStr: string | undefined = undefined;
      if (timeStr && record?.check_in_time) {
        const inDate = new Date(record.check_in_time);
        const [hours, mins] = timeStr.split(":").map(Number);
        const outDate = new Date(inDate);
        outDate.setHours(hours, mins, 0, 0);
        customDateStr = outDate.toISOString();
      }

      await onSubmit({
        attendanceId: record.id,
        notes: notes.trim(),
        checkOutTime: customDateStr
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-5 bg-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <LogOut size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">Clock-Out Manual (Override)</h2>
              <p className="text-[10px] text-amber-100 font-bold uppercase tracking-wider">
                Emergency Admin Action
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-relaxed font-bold">
              Fitur ini digunakan saat teknisi di lapangan tidak dapat clock-out karena kegagalan verifikasi wajah, kamera rusak, atau kendala perangkat. Catatan alasan wajib diisi untuk rekam jejak audit.
            </p>
          </div>

          {/* Info Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Personel</p>
              <p className="font-black text-slate-800 text-xs truncate mt-0.5">{userName}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Proyek</p>
              <p className="font-black text-[#00a1e4] text-xs truncate mt-0.5">{projectName}</p>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-200">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Waktu Masuk (Clock-In)</p>
              <p className="font-bold text-slate-700 text-xs mt-0.5">{checkInTime}</p>
            </div>
          </div>

          {/* Jam Keluar Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12} /> Jam Keluar (WIB)
            </label>
            <input 
              type="time" 
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
            />
          </div>

          {/* Catatan Alasan Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Alasan Clock-Out Manual <span className="text-rose-500">*</span>
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Karyawan gagal verifikasi biometrik karena foto referensi gelap; telah disetujui oleh Supervisor."
              required
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-200 flex items-center gap-2 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogOut size={14} />
                  <span>Konfirmasi Clock-Out</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
