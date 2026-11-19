"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, Calendar, Building2, AlertCircle, Save, CheckCircle2, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

interface ProjectOption {
  id: string | number;
  name: string;
  shift_start_time?: string;
  shift_end_time?: string;
}

interface AttendanceAdjustmentModalProps {
  record: any;
  user: any;
  projectsList: ProjectOption[];
  onClose: () => void;
  onSubmit: (params: {
    attendanceId: number;
    checkInTime: string;
    checkOutTime?: string | null;
    projectId?: string | number;
    notes?: string;
  }) => Promise<void>;
}

export default function AttendanceAdjustmentModal({
  record,
  user,
  projectsList,
  onClose,
  onSubmit,
}: AttendanceAdjustmentModalProps) {
  // Format to YYYY-MM-DDTHH:mm for datetime-local input
  const toLocalDatetime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [checkIn, setCheckIn] = useState<string>(toLocalDatetime(record.check_in_time));
  const [hasCheckOut, setHasCheckOut] = useState<boolean>(!!record.check_out_time);
  const [checkOut, setCheckOut] = useState<string>(toLocalDatetime(record.check_out_time));
  const [projectId, setProjectId] = useState<string | number>(
    record.project_id ? String(record.project_id) : (record.projects?.id ? String(record.projects.id) : (projectsList[0]?.id || ""))
  );
  const [notes, setNotes] = useState<string>(record.check_out_notes || record.check_in_notes || "");
  const [loading, setLoading] = useState(false);

  // Quick Preset Notes
  const presetNotes = [
    "[LUPA CLOCK OUT] Jam keluar disesuaikan sesuai akhir shift kerja.",
    "[KENDALA APLIKASI] Penyesuaian waktu karena kendala jaringan/perangkat lapangan.",
    "[LEMBUR RESMI] Jam lembur disesuaikan atas persetujuan koordinator lapangan.",
    "[KOREKSI SHIFT] Penyesuaian jam kerja sesuai penugasan jadwal aktual."
  ];

  const handleApplyPreset = (text: string) => {
    setNotes((prev: string) => {
      const cleanPrev = prev ? prev.trim() : "";
      if (!cleanPrev) return text;
      if (cleanPrev.includes(text)) return cleanPrev;
      return `${cleanPrev} | ${text}`;
    });
  };

  // Calculate live preview of duration & overtime
  const selectedProj = projectsList.find((p) => String(p.id) === String(projectId));
  let calculatedDuration = "-";
  let calculatedOvertime = "-";

  if (checkIn && hasCheckOut && checkOut) {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffMs = outDate.getTime() - inDate.getTime();
    if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / 60000);
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      calculatedDuration = `${hrs} Jam ${mins} Menit`;

      // Standard shift calculation
      let standardWorkMinutes = 480;
      const shiftStart = selectedProj?.shift_start_time || record.projects?.shift_start_time || "08:00";
      const shiftEnd = selectedProj?.shift_end_time || record.projects?.shift_end_time || "17:00";
      const [sh, sm] = shiftStart.split(":").map(Number);
      const [eh, em] = shiftEnd.split(":").map(Number);
      let shiftDiff = (eh * 60 + em) - (sh * 60 + sm);
      if (shiftDiff < 0) shiftDiff += 1440;
      if (shiftDiff > 0) standardWorkMinutes = shiftDiff;

      const overtime = diffMins - standardWorkMinutes;
      const actualOvertime = Math.min(diffMins, overtime);
      if (actualOvertime > 0) {
        calculatedOvertime = `${Math.floor(actualOvertime / 60)} Jam ${actualOvertime % 60} Menit`;
      } else {
        calculatedOvertime = "0 Jam 0 Menit";
      }
    } else {
      calculatedDuration = "Waktu keluar harus setelah waktu masuk!";
      calculatedOvertime = "-";
    }
  } else if (!hasCheckOut) {
    calculatedDuration = "Sesi Aktif (Belum Clock-Out)";
    calculatedOvertime = "0 Jam 0 Menit";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn) {
      alert("Waktu masuk wajib diisi.");
      return;
    }
    if (hasCheckOut && checkOut) {
      if (new Date(checkOut).getTime() <= new Date(checkIn).getTime()) {
        alert("Waktu keluar harus lebih lambat dari waktu masuk.");
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit({
        attendanceId: record.id,
        checkInTime: new Date(checkIn).toISOString(),
        checkOutTime: hasCheckOut && checkOut ? new Date(checkOut).toISOString() : null,
        projectId: projectId ? String(projectId) : undefined,
        notes: notes.trim()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="bg-[#003366] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                Penyesuaian & Koreksi Jam Absensi
              </h3>
              <p className="text-[10px] text-sky-200 font-bold uppercase tracking-tight">
                {user?.name || "Personel"} • {record.projects?.name || "Proyek Lapangan"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Selection */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Lokasi Penugasan / Proyek
            </label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#003366]"
              >
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.shift_start_time ? `(Shift: ${p.shift_start_time} - ${p.shift_end_time || ""})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Adjustment Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Check-In */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Jam Masuk (Check-In)
              </label>
              <input
                type="datetime-local"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003366]"
              />
              <p className="text-[9px] text-slate-400 font-semibold">
                Aktual: {record.check_in_time ? format(new Date(record.check_in_time), "dd/MM/yyyy HH:mm") : "-"}
              </p>
            </div>

            {/* Check-Out */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Jam Keluar (Check-Out)
                </label>
                <label className="flex items-center gap-1 text-[9px] font-bold text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCheckOut}
                    onChange={(e) => {
                      setHasCheckOut(e.target.checked);
                      if (e.target.checked && !checkOut) {
                        setCheckOut(checkIn || toLocalDatetime(new Date().toISOString()));
                      }
                    }}
                    className="rounded border-slate-300 text-[#003366] focus:ring-0"
                  />
                  Telah Pulang
                </label>
              </div>

              {hasCheckOut ? (
                <>
                  <input
                    type="datetime-local"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required={hasCheckOut}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003366]"
                  />
                  <p className="text-[9px] text-slate-400 font-semibold">
                    Aktual: {record.check_out_time ? format(new Date(record.check_out_time), "dd/MM/yyyy HH:mm") : "Sesi Aktif"}
                  </p>
                </>
              ) : (
                <div className="py-2.5 px-3 bg-amber-50 border border-amber-200 rounded-lg text-center text-[10px] font-bold text-amber-800">
                  Status: Personel masih berada di lokasi (Sesi Aktif)
                </div>
              )}
            </div>
          </div>

          {/* Live Calculated Stats Preview Card */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0073ea] shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#003366]">Kalkulasi Hasil Penyesuaian</p>
                <p className="text-[10px] font-bold text-slate-600">Durasi & Overtime akan terhitung ulang otomatis</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="block text-[8px] font-black uppercase text-slate-400">Total Durasi</span>
                <span className="text-xs font-black text-slate-800">{calculatedDuration}</span>
              </div>
              <div className="w-[1px] h-6 bg-blue-200"></div>
              <div className="text-right">
                <span className="block text-[8px] font-black uppercase text-amber-600">Overtime</span>
                <span className="text-xs font-black text-amber-800">{calculatedOvertime}</span>
              </div>
            </div>
          </div>

          {/* Notes and Justification */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Catatan / Alasan Penyesuaian Admin
            </label>
            
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {presetNotes.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[8px] font-bold transition-colors text-left"
                >
                  + {preset.split("]")[0]}]
                </button>
              ))}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan keterangan detail alasan penyesuaian jam kerja (misal: penugasan lembur darurat, perbaikan lupa clock out, dsb)..."
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#003366] resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#003366] hover:bg-blue-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={14} />
              {loading ? "Menyimpan..." : "Simpan Penyesuaian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
