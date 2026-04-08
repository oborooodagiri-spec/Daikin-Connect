"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileVideo, ImageIcon, User, Calendar, 
  ExternalLink, Maximize2, Play, X 
} from "lucide-react";

interface MediaItem {
  id: number;
  url: string;
  type: "image" | "video";
  description: string;
  inspector: string;
  reportType: string;
  reportId: number;
}

interface MediaGroup {
  date: string;
  items: MediaItem[];
}

export default function MediaGallery({ groups }: { groups: MediaGroup[] }) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  if (!groups || groups.length === 0) {
    return (
      <div className="py-20 text-center opacity-40 grayscale flex flex-col items-center gap-4 border-2 border-dashed border-slate-200 rounded-[2rem]">
        <ImageIcon size={48} className="text-slate-300" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">No Media Documentation Found</p>
      </div>
    );
  }

  const formatDisplayDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <div key={group.date} className="space-y-6">
          {/* Group Header */}
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 bg-[#003366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/10">
              {formatDisplayDate(group.date)}
            </div>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.items.length} items</span>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {group.items.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -5 }}
                className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {/* Media Preview */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {item.type === "video" ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <video 
                        src={item.url} 
                        className="w-full h-full object-cover opacity-60"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play size={24} className="text-white fill-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-[8px] font-black uppercase rounded-md flex items-center gap-1">
                        <FileVideo size={10} /> VIDEO
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.description}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                  
                  {/* Overlay Action */}
                  <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 size={24} className="text-white" />
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 line-clamp-1 italic">
                    "{item.description || "No description"}"
                  </p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       <User size={10} /> {item.inspector}
                    </div>
                    <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#00a1e4] uppercase tracking-widest mt-1">
                       via {item.reportType} #{item.reportId}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" 
              onClick={() => setSelectedMedia(null)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="relative z-10 w-full max-w-6xl max-h-full flex flex-col items-center gap-6"
            >
              {/* Media Container */}
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center border border-white/5">
                {selectedMedia.type === "video" ? (
                  <video 
                    src={selectedMedia.url} 
                    className="max-w-full max-h-[70vh] rounded-lg"
                    controls 
                    autoPlay
                  />
                ) : (
                  <img 
                    src={selectedMedia.url} 
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    alt="Documentation" 
                  />
                )}
              </div>

              {/* Metadata Panel */}
              <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 text-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                       <span className={`px-3 py-1 ${selectedMedia.type === 'video' ? 'bg-amber-500' : 'bg-[#00a1e4]'} text-white text-[10px] font-black uppercase rounded-lg shadow-lg`}>
                         {selectedMedia.type}
                       </span>
                       <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                         Report #{selectedMedia.reportId} · {selectedMedia.reportType}
                       </span>
                     </div>
                     <h4 className="text-xl font-bold tracking-tight text-white/90">
                       {selectedMedia.description || "Media Documentation"}
                     </h4>
                     <div className="flex items-center gap-6 mt-4">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Technician</p>
                           <p className="text-sm font-bold text-white/80">{selectedMedia.inspector}</p>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={() => setSelectedMedia(null)}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                  >
                    <X size={24} className="text-white/60" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
