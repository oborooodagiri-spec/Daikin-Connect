"use client";

import React, { useState } from "react";
import { 
  X, Camera, MapPin, Clock, RotateCcw, LogOut, CheckCircle2, 
  AlertTriangle, ShieldCheck, ExternalLink, Loader2, User 
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

interface BiometricAuditModalProps {
  record: any;
  user: any;
  onClose: () => void;
  onResetFace: (userId: number) => Promise<void>;
  onManualClockOut: (record: any) => void;
}

export default function BiometricAuditModal({
  record,
  user,
  onClose,
  onResetFace,
  onManualClockOut
}: BiometricAuditModalProps) {
  const [resetting, setResetting] = useState(false);

  const getMapsLink = (lat: any, lng: any) => {
    if (lat == null || lng == null) return "#";
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  const formatCoords = (lat: any, lng: any) => {
    if (lat == null || lng == null) return "-";
    const nLat = Number(lat);
    const nLng = Number(lng);
    if (isNaN(nLat) || isNaN(nLng)) return "-";
    return `${nLat.toFixed(4)}, ${nLng.toFixed(4)}`;
  };

  const formatTimeSafe = (dateVal: any) => {
    if (!dateVal) return "-";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "-";
      return `${format(d, "HH:mm")} WIB`;
    } catch {
      return "-";
    }
  };

  const formatDateSafe = (dateVal: any) => {
    if (!dateVal) return "-";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "-";
      return format(d, "dd MMM yyyy, HH:mm", { locale: id });
    } catch {
      return "-";
    }
  };

  const handleReset = async () => {
    if (!user?.id) return;
    setResetting(true);
    try {
      await onResetFace(user.id);
    } finally {
      setResetting(false);
    }
  };

  const faceUrl = user?.face_reference_url || record?.users?.face_reference_url;
  const userName = user?.name || record?.users?.name || "Personel";
  const userCompany = user?.company_name || record?.users?.company_name || "Independent Vendor";
  const projectName = record?.projects?.name || "Daikin Project";

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#003366] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">Audit Foto Biometrik Kehadiran</h2>
              <p className="text-[10px] sm:text-xs text-blue-200 font-bold uppercase tracking-wider">
                {userName} • {userCompany} • {projectName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - 3 Comparison Columns */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. MASTER FACE PROFILE */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Referensi Master</span>
                  {faceUrl ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black uppercase tracking-wider">
                      Terdaftar
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[8px] font-black uppercase tracking-wider">
                      Belum Ada
                    </span>
                  )}
                </div>

                {/* Photo Box */}
                <div className="aspect-square w-full rounded-2xl bg-white border border-slate-200 overflow-hidden relative group flex items-center justify-center shadow-inner">
                  {faceUrl ? (
                    <img 
                      src={faceUrl} 
                      alt="Referensi Master" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-300 space-y-2">
                      <Camera size={40} className="mx-auto" strokeWidth={1.5} />
                      <p className="text-[10px] font-black uppercase tracking-wider">Tidak Ada Foto Referensi</p>
                    </div>
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-black text-slate-800 text-xs truncate">{userName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Foto Profil Biometrik Resmi</p>
                  <p className="text-[9px] text-slate-500 leading-relaxed pt-1">
                    Digunakan oleh AI sistem sebagai tolok ukur (*Image 1: Authorized Reference*) saat karyawan melakukan clock-in & clock-out.
                  </p>
                </div>
              </div>

              {faceUrl && (
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  title="Gunakan ini jika foto referensi buram/gelap/salah orang"
                >
                  {resetting ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                  Reset Foto Wajah Ini
                </button>
              )}
            </div>

            {/* 2. CLOCK-IN PHOTO */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clock-In (Masuk)</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0073ea] border border-blue-200 text-[8px] font-black uppercase tracking-wider">
                    {formatTimeSafe(record?.check_in_time)}
                  </span>
                </div>

                {/* Photo Box */}
                <div className="aspect-square w-full rounded-2xl bg-white border border-slate-200 overflow-hidden relative group flex items-center justify-center shadow-inner">
                  {record?.check_in_photo ? (
                    <img 
                      src={record.check_in_photo} 
                      alt="Clock-In" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-300 space-y-2">
                      <Camera size={40} className="mx-auto" strokeWidth={1.5} />
                      <p className="text-[10px] font-black uppercase tracking-wider">Tidak Ada Foto</p>
                    </div>
                  )}
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={10} /> Tanggal
                    </span>
                    <span className="font-bold text-[10px]">
                      {formatDateSafe(record?.check_in_time)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin size={10} /> Lokasi
                    </span>
                    {record?.check_in_lat != null && record?.check_in_long != null ? (
                      <a
                        href={getMapsLink(record.check_in_lat, record.check_in_long)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00a1e4] hover:underline font-bold text-[10px] flex items-center gap-0.5"
                      >
                        {formatCoords(record.check_in_lat, record.check_in_long)} <ExternalLink size={8} />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[10px]">-</span>
                    )}
                  </div>

                  {record?.check_in_notes && (
                    <div className="p-2 bg-white rounded-lg border border-slate-100 text-[9px] text-slate-600">
                      <span className="font-black text-slate-400 uppercase tracking-wider block">Catatan:</span>
                      {record.check_in_notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. CLOCK-OUT PHOTO */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clock-Out (Keluar)</span>
                  {record?.check_out_time ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black uppercase tracking-wider">
                      {formatTimeSafe(record.check_out_time)}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-black uppercase tracking-wider animate-pulse">
                      Sesi Aktif
                    </span>
                  )}
                </div>

                {/* Photo Box */}
                <div className="aspect-square w-full rounded-2xl bg-white border border-slate-200 overflow-hidden relative group flex items-center justify-center shadow-inner">
                  {record?.check_out_photo ? (
                    <img 
                      src={record.check_out_photo} 
                      alt="Clock-Out" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400 space-y-2">
                      <Clock size={40} className="mx-auto text-amber-500 animate-pulse" strokeWidth={1.5} />
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Belum Clock-Out</p>
                      <p className="text-[8px] text-slate-400">Personel sedang bertugas di lokasi</p>
                    </div>
                  )}
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  {record?.check_out_time ? (
                    <>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock size={10} /> Tanggal
                        </span>
                        <span className="font-bold text-[10px]">
                          {formatDateSafe(record.check_out_time)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin size={10} /> Lokasi
                        </span>
                        {record?.check_out_lat != null && record?.check_out_long != null ? (
                          <a
                            href={getMapsLink(record.check_out_lat, record.check_out_long)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00a1e4] hover:underline font-bold text-[10px] flex items-center gap-0.5"
                          >
                            {formatCoords(record.check_out_lat, record.check_out_long)} <ExternalLink size={8} />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </div>

                      {record?.check_out_notes && (
                        <div className="p-2 bg-white rounded-lg border border-slate-100 text-[9px] text-slate-600">
                          <span className="font-black text-slate-400 uppercase tracking-wider block">Catatan:</span>
                          {record.check_out_notes}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-center space-y-1">
                      <p className="text-[9px] font-black text-amber-800 uppercase tracking-wider">Sesi Absensi Masih Terbuka</p>
                      <p className="text-[8px] text-amber-700">Jika karyawan terkendala verifikasi wajah atau kamera rusak, Admin dapat melakukan Clock-Out Manual di bawah ini.</p>
                    </div>
                  )}
                </div>
              </div>

              {!record?.check_out_time && (
                <button
                  onClick={() => onManualClockOut(record)}
                  className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <LogOut size={12} />
                  Clock-Out Manual Sekarang
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-500" /> Daikin Biometric Audit Engine
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
