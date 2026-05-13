"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Sparkles, AlertCircle } from "lucide-react";
import { createKnowledgeResource } from "@/app/actions/knowledge";

export default function ResourceEditorModal({
  isOpen,
  onClose,
  onSuccess,
  resource = null
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resource?: any;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "JUKLAK",
    type: "GUIDELINE",
    content: "",
    tags: "",
    href: "",
    thumbnail: "",
    visibility: "Internal"
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || "",
        category: resource.category || "JUKLAK",
        type: resource.type || "GUIDELINE",
        content: resource.content || "",
        tags: resource.tags || "",
        href: resource.href || "",
        thumbnail: resource.thumbnail || "",
        visibility: resource.visibility || "Internal"
      });
    } else {
      setFormData({
        title: "",
        category: "JUKLAK",
        type: "GUIDELINE",
        content: "",
        tags: "",
        href: "",
        thumbnail: "",
        visibility: "Internal"
      });
    }
  }, [resource, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (resource) {
        const { updateKnowledgeResource } = await import("@/app/actions/knowledge");
        const res = await updateKnowledgeResource(resource.id, formData as any);
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Gagal memperbarui data");
        }
      } else {
        const res = await createKnowledgeResource(formData as any);
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Gagal menyimpan data");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                   <Sparkles size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {resource ? "Edit Resource" : "Tambah Resource Baru"}
                </h2>
             </div>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
             </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
             {error && (
               <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                  <AlertCircle size={18} /> {error}
               </div>
             )}

             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Judul Dokumen</label>
                   <input 
                     required
                     value={formData.title}
                     onChange={e => setFormData({...formData, title: e.target.value})}
                     className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-200"
                     placeholder="Contoh: Juklak Tier 3 Chiller Plant"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Kategori</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-200"
                      >
                         <option value="JUKLAK">JUKLAK</option>
                         <option value="JUKNIS">JUKNIS</option>
                         <option value="STRATEGY">STRATEGY</option>
                         <option value="MARKETING">MARKETING</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tipe Konten</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-200"
                      >
                         <option value="GUIDELINE">GUIDELINE (Text/Markdown)</option>
                         <option value="INTERACTIVE">INTERACTIVE (Internal Link)</option>
                         <option value="EXTERNAL">EXTERNAL (External URL)</option>
                      </select>
                   </div>
                </div>

                {formData.type === 'GUIDELINE' ? (
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Konten (Markdown Support)</label>
                     <textarea 
                       rows={10}
                       value={formData.content}
                       onChange={e => setFormData({...formData, content: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-200 font-mono"
                       placeholder="# Heading 1\n## Heading 2\n- List item"
                     />
                  </div>
                ) : (
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Link / URL</label>
                     <input 
                       value={formData.href}
                       onChange={e => setFormData({...formData, href: e.target.value})}
                       className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-200"
                       placeholder="/admin/page atau https://..."
                     />
                  </div>
                )}

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tags (Pisahkan dengan koma)</label>
                   <input 
                     value={formData.tags}
                     onChange={e => setFormData({...formData, tags: e.target.value})}
                     className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-200"
                     placeholder="VES, Chiller, Tier 3"
                   />
                </div>
             </div>

             <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-14 bg-slate-50 text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
                >
                  BATAL
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] h-14 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "MENYIMPAN..." : (
                    <><Save size={18} /> SIMPAN DATA</>
                  )}
                </button>
             </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
