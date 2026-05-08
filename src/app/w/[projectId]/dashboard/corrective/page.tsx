"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, 
  Settings, Wrench, Camera, X, Play, Save, ChevronRight, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUnitsByProject } from "@/app/actions/units";
import { submitCorrectiveMaintenanceForm } from "@/app/actions/corrective_maintenance";
import imageCompression from "browser-image-compression";

const SHOPPING_LIST_ITEMS = [
  "Penggantian Motor FCU & AHU",
  "Penggantian Fan Blower AHU",
  "Penggantian Fan Blower FCU",
  "Penggantian Thermostat",
  "Penggantian Capasitor",
  "Penggantian Relay & Timers",
  "Penggantian V-Belt",
  "Penggantian Compressor",
  "Penggantian Bearing",
  "Penggantian Bak Drain",
  "Perbaikan Drain Bocor",
  "Pemasangan Watter Mur",
  "Pekerjaan Pengelasan",
  "Lain-lain"
];

export default function CorrectiveMaintenancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const workspaceId = params.projectId as string;
  const siteProjectId = searchParams.get("projectId");

  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnitList, setShowUnitList] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    unit_id: "",
    technician_name: "",
    service_date: new Date().toISOString().split("T")[0],
    wo_number: "",
    problem_reported: "",
    actual_finding: "",
    service_action: "",
    sparepart_tambahan: "",
    lain_lain_desc: "",
  });

  // Shopping List State
  const [shoppingList, setShoppingList] = useState<Record<string, number>>({});

  // Media (Before & After)
  const [beforePhotos, setBeforePhotos] = useState<{file: File | null, preview: string}[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<{file: File | null, preview: string}[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    if (!siteProjectId) return;
    async function fetchUnits() {
      const res = await getUnitsByProject(siteProjectId!);
      if (res && "success" in res && res.success) {
        setUnits(res.data || []);
      }
      setLoading(false);
    }
    fetchUnits();
  }, [siteProjectId]);

  const handleToggleShopping = (item: string) => {
    setShoppingList(prev => {
      const next = { ...prev };
      if (next[item]) {
        delete next[item];
      } else {
        next[item] = 1;
      }
      return next;
    });
  };

  const handleQtyChange = (item: string, qty: number) => {
    if (qty < 1) return;
    setShoppingList(prev => ({ ...prev, [item]: qty }));
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    const currentList = type === "before" ? beforePhotos : afterPhotos;
    if (currentList.length + files.length > 5) { 
        alert(`Maksimal 5 foto untuk dokumentasi ${type}!`); 
        return; 
    }

    setUploadingMedia(true);
    const newItems: any[] = [];

    for (const f of files) {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true };
        const compressed = await imageCompression(f, options);
        newItems.push({ file: compressed, preview: URL.createObjectURL(compressed) });
      } catch (err) { console.error(err); }
    }

    if (type === "before") setBeforePhotos(prev => [...prev, ...newItems]);
    else setAfterPhotos(prev => [...prev, ...newItems]);
    
    setUploadingMedia(false);
  };

  const removeMedia = (idx: number, type: "before" | "after") => {
    if (type === "before") setBeforePhotos(prev => prev.filter((_, i) => i !== idx));
    else setAfterPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!formData.technician_name) { alert("Nama Teknisi wajib diisi!"); setStep(1); return; }
    if ((beforePhotos.length + afterPhotos.length) < 3) { alert("Minimal harus 3 foto dokumentasi yang diinput!"); setStep(3); return; }

    startTransition(async () => {
      // Upload Photos
      const uploadedBefore = [];
      for (const [idx, item] of beforePhotos.entries()) {
        if (item.file) {
          try {
            const f = new FormData(); 
            f.append("file", item.file, `before_${idx}.jpg`); 
            f.append("folder", "corrective-before");
            const r = await fetch("/api/upload", { method: "POST", body: f });
            const d = await r.json() as any;
            if (d.success) uploadedBefore.push(d.url);
            else console.error("Upload failed for before photo", idx, d.error);
          } catch (err) {
            console.error("Upload error for before photo", idx, err);
          }
        }
      }

      const uploadedAfter = [];
      for (const [idx, item] of afterPhotos.entries()) {
        if (item.file) {
          try {
            const f = new FormData(); 
            f.append("file", item.file, `after_${idx}.jpg`); 
            f.append("folder", "corrective-after");
            const r = await fetch("/api/upload", { method: "POST", body: f });
            const d = await r.json() as any;
            if (d.success) uploadedAfter.push(d.url);
            else console.error("Upload failed for after photo", idx, d.error);
          } catch (err) {
            console.error("Upload error for after photo", idx, err);
          }
        }
      }

      const payload = {
        unit_id: formData.unit_id ? parseInt(formData.unit_id) : null,
        technician_name: formData.technician_name,
        service_date: formData.service_date,
        problem_reported: formData.problem_reported,
        technicalData: {
          wo_number: formData.wo_number,
          actual_finding: formData.actual_finding,
          service_action: formData.service_action,
          sparepart_tambahan: formData.sparepart_tambahan,
          lain_lain_desc: formData.lain_lain_desc,
          shopping_list: shoppingList,
          photos: {
            before: uploadedBefore,
            after: uploadedAfter
          }
        }
      };

      const res = await submitCorrectiveMaintenanceForm(payload);
      if (res && res.success) {
        setSuccess(true);
      } else {
        alert(res.error || "Gagal menyimpan data.");
      }
    });
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center p-6">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} className="text-orange-500" />
        </div>
        <h1 className="text-3xl font-black text-[#003366] tracking-tight mb-2">Form Berhasil Disimpan!</h1>
        <p className="text-slate-500 mb-8 max-w-sm">Data Corrective Maintenance & rincian penagihan telah tercatat di sistem.</p>
        <button 
          onClick={() => {
            if (siteProjectId) {
              // Redirect back to project detail page
              router.push(`/w/${workspaceId}/dashboard/customers/projects?projectId=${siteProjectId}`);
            } else {
              router.back();
            }
          }} 
          className="px-8 py-4 bg-[#003366] text-white font-black rounded-2xl uppercase tracking-widest text-sm hover:scale-105 transition-transform"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-24 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <button onClick={() => router.back()} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-orange-600 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>Corrective Maintenance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#003366] tracking-tight">Formulir Penagihan & Perbaikan</h1>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-orange-500' : 'bg-slate-200'}`} />
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8">
        <AnimatePresence mode="wait">

          {/* STEP 1: GENERAL & VALIDATION */}
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <h2 className="text-lg font-black text-slate-800 border-b pb-3 uppercase tracking-widest">1. Data Umum & Validasi</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Unit (Tag / Tenant) - Opsional</label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Cari berdasarkan Tag atau Tenant..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowUnitList(true);
                      }}
                      onFocus={() => setShowUnitList(true)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-300"
                    />
                    {showUnitList && searchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {units.filter(u => 
                          u.tag_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.room_tenant?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length > 0 ? (
                          units.filter(u => 
                            u.tag_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.room_tenant?.toLowerCase().includes(searchTerm.toLowerCase())
                          ).map(u => (
                            <div 
                              key={u.id} 
                              onClick={() => {
                                setFormData({...formData, unit_id: u.id.toString()});
                                setSearchTerm(`${u.tag_number} - ${u.room_tenant || u.area}`);
                                setShowUnitList(false);
                              }}
                              className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-slate-50 last:border-0"
                            >
                              <p className="text-sm font-bold text-slate-700">{u.tag_number}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{u.room_tenant || u.area}</p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-400 italic">Tidak ada unit ditemukan</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Perbaikan</label>
                  <input type="date" value={formData.service_date} onChange={e => setFormData({...formData, service_date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Teknisi Pelaksana</label>
                  <input type="text" value={formData.technician_name} onChange={e => setFormData({...formData, technician_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Nama Lengkap" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor WO (Opsional)</label>
                  <input type="text" value={formData.wo_number} onChange={e => setFormData({...formData, wo_number: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="WO-..." />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Problem Reported (Keluhan Awal)</label>
                  <textarea rows={2} value={formData.problem_reported} onChange={e => setFormData({...formData, problem_reported: e.target.value})} className="w-full p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-200" placeholder="AC tidak dingin, netes, mati total..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Actual Finding (Temuan Aktual)</label>
                  <textarea rows={3} value={formData.actual_finding} onChange={e => setFormData({...formData, actual_finding: e.target.value})} className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-200" placeholder="Kompresor jebol, freon kosong..." />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SHOPPING LIST */}
          {step === 2 && (
            <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <h2 className="text-lg font-black text-slate-800 border-b pb-3 uppercase tracking-widest">2. Labour / Shopping List</h2>
              <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4 mb-4">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Pilih item pekerjaan dan masukkan Quantity (Qty) untuk dasar penagihan.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2">
                {SHOPPING_LIST_ITEMS.map((item, idx) => {
                  const isChecked = !!shoppingList[item];
                  return (
                    <div key={idx} className={`flex flex-col p-3 border rounded-xl transition-all ${isChecked ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between w-full">
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => handleToggleShopping(item)}
                            className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className={`text-xs font-bold ${isChecked ? 'text-orange-800' : 'text-slate-600'}`}>{item}</span>
                        </label>
                        {isChecked && item !== "Lain-lain" && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-orange-400">QTY:</span>
                            <input 
                              type="number" min="1" 
                              value={shoppingList[item] || 1} 
                              onChange={(e) => handleQtyChange(item, parseInt(e.target.value) || 1)}
                              className="w-16 p-1.5 text-center text-xs font-black border border-orange-200 rounded-lg bg-white"
                            />
                          </div>
                        )}
                      </div>
                      {isChecked && item === "Lain-lain" && (
                        <div className="mt-3">
                          <input 
                            type="text" 
                            value={formData.lain_lain_desc} 
                            onChange={e => setFormData({...formData, lain_lain_desc: e.target.value})}
                            placeholder="Sebutkan pekerjaan lain..."
                            className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-200"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sparepart Tambahan / Deskripsi (Jika ada)</label>
                <textarea rows={2} value={formData.sparepart_tambahan} onChange={e => setFormData({...formData, sparepart_tambahan: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" placeholder="Pipa 2 meter, Kabel 3 meter..." />
              </div>
            </motion.div>
          )}

          {/* STEP 3: PHOTOS */}
          {step === 3 && (
            <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <h2 className="text-lg font-black text-slate-800 border-b pb-3 uppercase tracking-widest">3. Dokumentasi Foto</h2>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Service Action (Tindakan Perbaikan)</label>
                <textarea rows={3} value={formData.service_action} onChange={e => setFormData({...formData, service_action: e.target.value})} className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-200" placeholder="Melakukan penggantian kompresor, vakum, dan isi freon..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Before Photos */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-rose-500">Before Repair</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{beforePhotos.length}/5</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {beforePhotos.map((item, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                        <img src={item.preview} className="w-full h-full object-cover" alt="Before"/>
                        <button onClick={() => removeMedia(i, "before")} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-80 hover:opacity-100">
                          <X size={12}/>
                        </button>
                      </div>
                    ))}
                    {beforePhotos.length < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors">
                        <Camera size={20} className="mb-1" />
                        <span className="text-[8px] font-bold uppercase">Tambah</span>
                        <input type="file" accept="image/*" multiple onChange={(e) => handleMediaUpload(e, "before")} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* After Photos */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-emerald-500">After Repair</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{afterPhotos.length}/5</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {afterPhotos.map((item, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                        <img src={item.preview} className="w-full h-full object-cover" alt="After"/>
                        <button onClick={() => removeMedia(i, "after")} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-80 hover:opacity-100">
                          <X size={12}/>
                        </button>
                      </div>
                    ))}
                    {afterPhotos.length < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center text-emerald-300 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer transition-colors">
                        <Camera size={20} className="mb-1" />
                        <span className="text-[8px] font-bold uppercase">Tambah</span>
                        <input type="file" accept="image/*" multiple onChange={(e) => handleMediaUpload(e, "after")} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {uploadingMedia && (
                <p className="text-[10px] text-orange-500 animate-pulse text-center font-bold">Compressing images...</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4 mt-6">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors uppercase text-xs tracking-widest shadow-sm">
            <ChevronLeft size={16} /> Kembali
          </button>
        ) : <div className="flex-1"></div>}

        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} className="flex-1 py-4 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 uppercase text-xs tracking-widest">
            Lanjut <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isPending || uploadingMedia} className="flex-[2] py-4 bg-[#003366] text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#002244] transition-colors shadow-lg shadow-blue-900/20 uppercase text-xs tracking-widest disabled:opacity-50">
            {isPending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
            {isPending ? "Menyimpan..." : "Simpan"}
          </button>
        )}
      </div>
    </div>
  );
}
