"use client";

import React, { useState } from "react";
import { X, FileText, CheckCircle2, Clock, AlertCircle, Loader2, Sparkles, User, Building2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

interface AttendanceNoteModalProps {
  record: any;
  user: any;
  onClose: () => void;
  onSubmit: (params: { attendanceId: number; notes: string }) => Promise<void>;
}

export default function AttendanceNoteModal({
  record,
  user,
  onClose,
  onSubmit
}: AttendanceNoteModalProps) {
  // Pre-fill with existing note if any
  const existingNote = record?.check_out_notes || record?.check_in_notes || "";
  const [notes, setNotes] = useState(existingNote);
  const [submitting, setSubmitting] = useState(false);

  const userName = user?.name || record?.users?.name || "Personel";
  const projectName = record?.projects?.name || "Daikin Project";

  const checkInStr = record?.check_in_time 
    ? format(new Date(record.check_in_time), "dd MMM yyyy, HH:mm", { locale: id })
    : "-";

  const checkOutStr = record?.check_out_time 
    ? format(new Date(record.check_out_time), "dd MMM yyyy, HH:mm", { locale: id })
    : "Sesi Aktif (Belum Keluar)";

  const quickPresets = [
    {
      label: "Lupa Clock Out",
      text: "[LUPA CLOCK OUT] Aktual pulang normal sesuai jam shift kerja, terlambat clock out di aplikasi.",
      color: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
    },
    {
      label: "Error Sistem / Jaringan",
      text: "[ERROR SISTEM] Terjadi kendala teknis/koneksi jaringan saat proses absensi di lokasi proyek.",
      color: "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
    },
    {
      label: "Pergantian Shift",
      text: "[PERGANTIAN SHIFT] Penyesuaian jadwal kerja lapangan atas instruksi Koordinator Lapangan.",
      color: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
    },
    {
      label: "Lembur Terverifikasi",
      text: "[LEMBUR TERVERIFIKASI] Kelebihan jam kerja riil telah diperiksa dan disetujui Admin/SPV.",
      color: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
    }
  ];

  const handleApplyPreset = (text: string) => {
    if (!notes.trim()) {
      setNotes(text);
    } else {
      setNotes((prev: string) => `${prev}\n${text}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        attendanceId: record.id,
        notes: notes.trim()
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#003366] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">Catatan & Keterangan Admin</h2>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">
                Audit Log Absensi Karyawan
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Metadata Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Personel</p>
              <p className="font-black text-slate-800 text-xs truncate mt-0.5">{userName}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Proyek</p>
              <p className="font-black text-slate-800 text-xs truncate mt-0.5">{projectName}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jam Masuk</p>
              <p className="font-bold text-slate-600 text-[11px] mt-0.5">{checkInStr}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jam Keluar</p>
              <p className="font-bold text-slate-600 text-[11px] mt-0.5">{checkOutStr}</p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" />
              Pilih Keterangan Cepat (Preset):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset.text)}
                  className={`px-2.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border text-left transition-all ${preset.color}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                Keterangan / Catatan Admin:
              </label>
              {notes && (
                <button
                  type="button"
                  onClick={() => setNotes("")}
                  className="text-[9px] text-slate-400 hover:text-rose-600 font-bold uppercase transition-colors"
                >
                  Bersihkan
                </button>
              )}
            </div>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Teknisi lupa clock out sore, aktual keluar jam 17:00 sesuai shift. Disetujui oleh Koordinator."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#003366] transition-all resize-none"
            />
            <p className="text-[9px] text-slate-400 leading-normal font-bold">
              Catatan ini akan tersimpan permanen pada riwayat absensi dan tampil di laporan rekap untuk audit resmi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#003366] hover:bg-blue-900 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  Simpan Keterangan
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
