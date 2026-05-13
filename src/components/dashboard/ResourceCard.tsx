"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  FileText, ExternalLink, Sparkles, 
  Settings, Trash2, Clock, Layers
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Resource {
  id: string;
  title: string;
  category: string;
  type: string;
  tags: string | null;
  created_at: Date;
  visibility: string;
  thumbnail?: string | null;
  href?: string | null;
}

export default function ResourceCard({ 
  resource, 
  onLaunch, 
  onEdit, 
  onDelete,
  isAdmin = false
}: { 
  resource: any, 
  onLaunch: (r: any) => void,
  onEdit?: (r: any) => void,
  onDelete?: (r: any) => void,
  isAdmin?: boolean
}) {
  const tags = resource.tags ? resource.tags.split(",").map((t: string) => t.trim()) : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-[2.5rem] border border-slate-100 p-6 flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group overflow-hidden relative"
    >
      {/* Category & Actions */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex gap-2">
           <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
             {resource.category}
           </span>
           <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 flex items-center gap-1.5">
             <ShieldCheck size={12} /> {resource.visibility}
           </span>
        </div>
        
        {isAdmin && (
          <div className="flex gap-1">
             <button onClick={() => onEdit?.(resource)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <Settings size={18} />
             </button>
             <button onClick={() => onDelete?.(resource)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                <Trash2 size={18} />
             </button>
          </div>
        )}
      </div>

      {/* Thumbnail / Icon Placeholder */}
      <div className="aspect-video bg-slate-50 rounded-3xl mb-6 flex items-center justify-center group-hover:bg-blue-50/30 transition-colors relative overflow-hidden">
         {resource.thumbnail ? (
           <img src={resource.thumbnail} className="w-full h-full object-cover" alt="" />
         ) : (
           <FileText className="text-slate-200 group-hover:text-blue-200 transition-colors" size={64} />
         )}
         
         <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="flex-1 px-2">
        <div className="flex items-center gap-2 mb-2">
           <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[8px] font-black uppercase tracking-tighter">UMUM</span>
        </div>
        <h3 className="text-xl font-black text-slate-800 leading-tight mb-3 line-clamp-2 min-h-[3rem]">
          {resource.title}
        </h3>
        
        <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">
           <span className="flex items-center gap-1.5"><Clock size={12} /> {format(new Date(resource.created_at), "yyyy-MM-dd")}</span>
           <span className="flex items-center gap-1.5"><Layers size={12} /> {resource.type}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
           {tags.map((tag: string) => (
             <span key={tag} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">#{tag}</span>
           ))}
        </div>
      </div>

      {/* Launch Button */}
      <button 
        onClick={() => onLaunch(resource)}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
      >
        <Sparkles size={18} />
        LUNCURKAN
      </button>

      {/* Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

function ShieldCheck({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
