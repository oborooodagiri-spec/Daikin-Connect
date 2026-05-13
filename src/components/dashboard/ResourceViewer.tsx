"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, FileText, Download, Share2, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ResourceViewer({ 
  resource, 
  isOpen, 
  onClose 
}: { 
  resource: any, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  if (!resource) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        >
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={onClose} />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                     <BookOpen size={24} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{resource.title}</h2>
                     <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">{resource.category} • DOCUMENT VIEWER</p>
                  </div>
               </div>
               
               <button 
                 onClick={onClose}
                 className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all"
               >
                 <X size={24} />
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                {resource.content ? (
                  <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {resource.content}
                     </ReactMarkdown>
                  </div>
                ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                       <FileText size={48} />
                    </div>
                    <h3 className="text-xl font-black text-slate-400 mb-2">Tidak ada konten teks</h3>
                    <p className="text-slate-300 font-bold mb-8">Dokumen ini mungkin berupa file eksternal atau aplikasi interaktif.</p>
                    
                    {resource.href && (
                      <a 
                        href={resource.href} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-2"
                      >
                         Buka Link Eksternal <Sparkles size={18} />
                      </a>
                    )}
                 </div>
               )}
            </div>

            {/* Footer / Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
               <div className="flex gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                     <Download size={16} /> DOWNLOAD PDF
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                     <Share2 size={16} /> BAGIKAN
                  </button>
               </div>
               
               <div className="hidden md:block">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© 2024 VALUE ENGINEERING SERVICES • VES CORE BLUEPRINT</p>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
