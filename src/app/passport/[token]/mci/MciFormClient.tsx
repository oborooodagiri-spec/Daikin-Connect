"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { savePendingSubmission, saveDraft, loadDraft, deleteDraft } from "@/lib/offline-db";
import { t, Language } from "@/lib/i18n";
import { createMciActivity } from "@/app/actions/mci";
import {
  ChevronLeft, Camera, Save, CheckCircle2, X, AlertCircle, Loader2
} from "lucide-react";
import { SignatureModal } from "@/components/ui/SignatureModal";
import { motion, AnimatePresence } from "framer-motion";

export default function MciFormClient({ unit, initialData, onSuccess }: { unit: any, initialData?: any, onSuccess?: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lang, setLang] = useState<Language>('id');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
    const savedLang = localStorage.getItem("daikin_lang") as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  // --- DRAFT STATE & LOGIC ---
  const [draftStatus, setDraftStatus] = useState<string>('');
  
  useEffect(() => {
    if (!initialData && isMounted) {
      loadDraft(`MCI_${unit.id}`).then((draft) => {
        if (draft) {
          if (confirm(lang === 'ja' ? '保存された下書きがあります。復元しますか？' : 'Draft tersimpan ditemukan. Apakah Anda ingin melanjutkan dari draft?')) {
            setFormData(draft.data.formData);
            setMediaItems(draft.data.mediaItems.map((m: any) => ({
              ...m,
              preview: m.file ? URL.createObjectURL(m.file) : m.preview
            })));
          }
        }
      });
    }
  }, [isMounted, unit.id, initialData, lang]);

  const parsed = initialData?.technical_json ? (typeof initialData.technical_json === 'string' ? JSON.parse(initialData.technical_json) : initialData.technical_json) : null;

  const [formData, setFormData] = useState(parsed?.formData || {
    customer: unit.projectName || "",
    inspections_date: new Date().toISOString().split("T")[0],
    chiller_model: unit.model || "",
    chiller_tag_number: unit.tag_number || "",
    serial_number: unit.serial_number || "",
    so_number: "",
    
    // Q1
    q1_status: "",
    q1_c1_rh: "", q1_c1_sc: "",
    q1_c2_rh: "", q1_c2_sc: "",
    q1_c3_rh: "", q1_c3_sc: "",
    q1_voltage: "",

    // Q2-Q9
    q2_status: "", q2_comment: "",
    q3_status: "", q3_comment: "",
    q4_status: "", q4_comment: "",
    q5_status: "", q5_comment: "",
    q6_status: "", q6_comment: "",
    q7_status: "", q7_comment: "",
    q8_status: "", q8_comment: "",
    q9_status: "", q9_comment: "",

    // Q10
    q10_delta_t: "", q10_comment: "",

    // Q11
    q11_status: "", q11_mechanic_remarks: "", q11_comment: "",
    
    inspector_name: initialData?.inspector_name || "",
  });

  const [mediaItems, setMediaItems] = useState<any[]>(parsed?.mediaItems || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveDraft = async () => {
    try {
      setDraftStatus('saving');
      await saveDraft({
        draftId: `MCI_${unit.id}`,
        data: {
          formData,
          mediaItems: mediaItems.map(m => ({ ...m, preview: m.file ? "" : m.preview }))
        }
      });
      setDraftStatus('saved');
      setTimeout(() => setDraftStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setDraftStatus('error');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true });
      const previewUrl = URL.createObjectURL(compressed);
      setMediaItems(prev => [...prev, { file: compressed, preview: previewUrl, description: "", type: "image" }]);
    } catch (err) {
      console.error("Compression failed", err);
      alert(t("Gagal mengkompresi gambar.", lang));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateMediaDesc = (index: number, desc: string) => {
    setMediaItems(prev => prev.map((m, i) => i === index ? { ...m, description: desc } : m));
  };

  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const handleSubmitInit = () => {
    if (!formData.inspector_name) {
      alert("Mohon isi nama inspektur (Engineer Name) terlebih dahulu.");
      return;
    }
    setShowSignatureModal(true);
  };

  const executeSubmit = async (signatureBase64: string, signerName: string) => {
    setLoading(true);
    startTransition(async () => {
      try {
        // Upload photos if online
        const uploadedPhotos = [];
        if (navigator.onLine) {
          for (const item of mediaItems) {
            if (item.file) {
              const fb = new FormData();
              fb.append("file", item.file);
              const res = await fetch("/api/upload", { method: "POST", body: fb });
              if (res.ok) {
                const { url } = await res.json();
                uploadedPhotos.push({ photo_url: url, description: item.description, media_type: item.type });
              }
            } else if (item.preview && !item.preview.startsWith('blob:')) {
              uploadedPhotos.push({ photo_url: item.preview, description: item.description, media_type: item.type });
            }
          }
        }

        const payload = {
          unit_id: unit.id,
          unit_tag: unit.tag_number,
          location: unit.building_floor,
          inspector_name: signerName,
          engineer_signer_name: signerName,
          reviewer_signature: signatureBase64,
          technical_json: JSON.stringify({ formData, mediaItems: navigator.onLine ? uploadedPhotos : [] }),
          engineer_note: formData.q11_mechanic_remarks,
          photos: uploadedPhotos
        };

        if (!navigator.onLine) {
          await savePendingSubmission({
            type: 'MCI' as any,
            data: payload,
            photos: mediaItems.map(m => m.file).filter(Boolean)
          });
          await deleteDraft(`MCI_${unit.id}`);
          setSuccess(true);
          setTimeout(() => { if (onSuccess) onSuccess(); else router.push(`/passport/${unit.qr_token}`); }, 2000);
          return;
        }

        const result = await createMciActivity(payload) as any;
        if (result && result.success) {
          await deleteDraft(`MCI_${unit.id}`);
          setSuccess(true);
          setTimeout(() => { if (onSuccess) onSuccess(); else router.push(`/passport/${unit.qr_token}`); }, 2000);
        } else {
          alert(result?.error || "Gagal menyimpan form MCI.");
        }
      } catch (err: any) {
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  if (!isMounted) return null;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-[#e6e9ef] shadow-sm">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6" />
        <h3 className="text-2xl font-black text-slate-800 uppercase italic">Success!</h3>
        <p className="text-slate-500 mt-2 text-sm font-medium">MCI Report has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f8] min-h-screen pb-32">
      {/* STEPS HEADER */}
      <div className="bg-white px-4 py-6 shadow-sm border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 w-12 rounded-full transition-all ${step === s ? 'bg-[#0073ea]' : step > s ? 'bg-emerald-400' : 'bg-slate-100'}`} />
          ))}
        </div>
        <span className="text-xs font-black uppercase text-[#0073ea] tracking-widest">
          {step === 1 ? 'Header & Q1-Q5' : step === 2 ? 'Q6-Q11' : 'Photos & Submit'}
        </span>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <Section title="Header Info">
                <div className="space-y-4">
                  <InputField label="Customer" value={formData.customer} onChange={(v: string) => setFormData({...formData, customer: v})} />
                  <InputField label="Inspections Date" type="date" value={formData.inspections_date} onChange={(v: string) => setFormData({...formData, inspections_date: v})} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Chiller Model" value={formData.chiller_model} onChange={(v: string) => setFormData({...formData, chiller_model: v})} />
                    <InputField label="Chiller Tag Number" value={formData.chiller_tag_number} onChange={(v: string) => setFormData({...formData, chiller_tag_number: v})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Serial Number" value={formData.serial_number} onChange={(v: string) => setFormData({...formData, serial_number: v})} />
                    <InputField label="SO Number" value={formData.so_number} onChange={(v: string) => setFormData({...formData, so_number: v})} />
                  </div>
                </div>
              </Section>

              <Section title="1. Review chiller log sheet">
                 <div className="space-y-4">
                    <RadioGroup 
                      options={['Optimal', 'Not optimal', 'Not in operation']} 
                      value={formData.q1_status} 
                      onChange={v => setFormData({...formData, q1_status: v})} 
                    />
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <InputField label="Comp 1. Running hours" value={formData.q1_c1_rh} onChange={(v: string) => setFormData({...formData, q1_c1_rh: v})} />
                      <InputField label="Start counter" value={formData.q1_c1_sc} onChange={(v: string) => setFormData({...formData, q1_c1_sc: v})} />
                      <InputField label="Comp 2. Running hours" value={formData.q1_c2_rh} onChange={(v: string) => setFormData({...formData, q1_c2_rh: v})} />
                      <InputField label="Start counter" value={formData.q1_c2_sc} onChange={(v: string) => setFormData({...formData, q1_c2_sc: v})} />
                      <InputField label="Comp 3. Running hours" value={formData.q1_c3_rh} onChange={(v: string) => setFormData({...formData, q1_c3_rh: v})} />
                      <InputField label="Start counter" value={formData.q1_c3_sc} onChange={(v: string) => setFormData({...formData, q1_c3_sc: v})} />
                      <div className="col-span-2">
                        <InputField label="Voltage (Volt)" value={formData.q1_voltage} onChange={(v: string) => setFormData({...formData, q1_voltage: v})} />
                      </div>
                    </div>
                 </div>
              </Section>

              <Section title="2. Control panels, safety controls and sensors">
                 <RadioGroup options={['Good', 'No Good']} value={formData.q2_status} onChange={v => setFormData({...formData, q2_status: v})} />
                 <InputField label="Comment" value={formData.q2_comment} onChange={(v: string) => setFormData({...formData, q2_comment: v})} />
              </Section>
              
              <Section title="3. Stater Panel conditions, wiring tightness">
                 <RadioGroup options={['Good', 'No Good']} value={formData.q3_status} onChange={v => setFormData({...formData, q3_status: v})} />
                 <InputField label="Comment" value={formData.q3_comment} onChange={(v: string) => setFormData({...formData, q3_comment: v})} />
              </Section>

              <Section title="4. Leak, bolts and nuts tightness">
                 <RadioGroup options={['Good', 'No Good']} value={formData.q4_status} onChange={v => setFormData({...formData, q4_status: v})} />
                 <InputField label="Comment" value={formData.q4_comment} onChange={(v: string) => setFormData({...formData, q4_comment: v})} />
              </Section>

              <Section title="5. Condenser water pressure drop & flow switch">
                 <RadioGroup options={['Good', 'No Good']} value={formData.q5_status} onChange={v => setFormData({...formData, q5_status: v})} />
                 <InputField label="Comment" value={formData.q5_comment} onChange={(v: string) => setFormData({...formData, q5_comment: v})} />
              </Section>

              <button onClick={() => setStep(2)} className="w-full py-4 bg-[#0073ea] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-xs">
                Continue to Q6-Q11
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <Section title="6. Chilled water pressure drop & flow switch">
                 <RadioGroup options={['Good', 'No Good']} value={formData.q6_status} onChange={v => setFormData({...formData, q6_status: v})} />
                 <InputField label="Comment" value={formData.q6_comment} onChange={(v: string) => setFormData({...formData, q6_comment: v})} />
              </Section>

              <Section title="7. Start chiller and completing log sheet">
                 <RadioGroup options={['Good', 'No Good']} value={formData.q7_status} onChange={v => setFormData({...formData, q7_status: v})} />
                 <InputField label="Comment" value={formData.q7_comment} onChange={(v: string) => setFormData({...formData, q7_comment: v})} />
              </Section>

              <Section title="8. Check for proper refrigerant charge">
                 <RadioGroup options={['Good', 'No Good']} value={formData.q8_status} onChange={v => setFormData({...formData, q8_status: v})} />
                 <InputField label="Comment" value={formData.q8_comment} onChange={(v: string) => setFormData({...formData, q8_comment: v})} />
              </Section>

              <Section title="9. Check Oil Pump & Oil Level (Centrifugal)">
                 <RadioGroup options={['Good', 'No Good']} value={formData.q9_status} onChange={v => setFormData({...formData, q9_status: v})} />
                 <InputField label="Comment" value={formData.q9_comment} onChange={(v: string) => setFormData({...formData, q9_comment: v})} />
              </Section>

              <Section title="10. Heat exchanger tube fouling (Delta T)">
                 <div className="space-y-4">
                   <p className="text-[10px] text-slate-500 font-medium">Δ T sat. condenser temp. - Condenser liquid leaving temp. :</p>
                   <div className="relative">
                     <InputField label="Delta T Value" value={formData.q10_delta_t} onChange={(v: string) => setFormData({...formData, q10_delta_t: v})} />
                     <span className="absolute right-4 top-1/2 text-xs font-bold text-slate-400">°F</span>
                   </div>
                   <InputField label="Comment" value={formData.q10_comment} onChange={(v: string) => setFormData({...formData, q10_comment: v})} />
                 </div>
              </Section>

              <Section title="11. Review log sheet & written report">
                 <RadioGroup options={['Optimal', 'Not optimal']} value={formData.q11_status} onChange={v => setFormData({...formData, q11_status: v})} />
                 <InputField label="Mechanic's Remarks" value={formData.q11_mechanic_remarks} onChange={(v: string) => setFormData({...formData, q11_mechanic_remarks: v})} />
                 <InputField label="Comment" value={formData.q11_comment} onChange={(v: string) => setFormData({...formData, q11_comment: v})} />
              </Section>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-[0.2em] shadow-sm hover:bg-slate-300 transition-all text-xs">Back</button>
                <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-[#0073ea] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-xs">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              
              {/* PHOTOS SECTION */}
              <Section title="Documentation (Photos)">
                <div className="space-y-4">
                  {mediaItems.map((media, idx) => (
                    <div key={idx} className="flex gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 items-start">
                      <div className="w-20 h-20 bg-slate-200 rounded-xl overflow-hidden shrink-0 relative">
                        <img src={media.preview} className="w-full h-full object-cover" alt="Doc" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <textarea
                          placeholder="Photo description..."
                          value={media.description}
                          onChange={e => updateMediaDesc(idx, e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                          rows={2}
                        />
                        <button onClick={() => removeMedia(idx)} className="text-xs text-rose-500 font-bold flex items-center gap-1"><X size={12}/> Remove</button>
                      </div>
                    </div>
                  ))}
                  
                  <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                    <Camera size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
                  </button>
                </div>
              </Section>

              <Section title="Engineer Information">
                 <InputField label="Engineer Name" value={formData.inspector_name} onChange={(v: string) => setFormData({...formData, inspector_name: v})} />
              </Section>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-[0.2em] shadow-sm hover:bg-slate-300 transition-all text-xs">Back</button>
                <button onClick={handleSubmitInit} disabled={loading || isPending} className="flex-[2] py-4 bg-[#00c875] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-xs flex justify-center items-center gap-2">
                  {loading || isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 size={16}/> Submit MCI</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DRAFT BUTTON FLOATING */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={handleSaveDraft}
          className="w-14 h-14 bg-amber-400 text-amber-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-white"
        >
          {draftStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
        </button>
      </div>

      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={(sig, name) => {
          setShowSignatureModal(false);
          executeSubmit(sig, name);
        }}
        title="Engineer & Customer Signature"
        defaultName={formData.inspector_name || ''}
        lang={lang}
      />
    </div>
  );
}

// Subcomponents
function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-[#e6e9ef] shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 bg-[#003366] text-white">
        <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-1 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-300"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );
}

function RadioGroup({ options, value, onChange }: { options: string[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => (
        <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${value === opt ? 'bg-blue-50 border-blue-200 text-[#0073ea]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${value === opt ? 'border-[#0073ea]' : 'border-slate-300'}`}>
             {value === opt && <div className="w-2.5 h-2.5 bg-[#0073ea] rounded-full" />}
          </div>
          <span className="text-sm font-bold">{opt}</span>
        </label>
      ))}
    </div>
  );
}
