"use client";

import React, { useState } from "react";
import { ArrowLeft, BookOpen, Video, Lock, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  category: "internal" | "public";
  description: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: "1",
    title: "Daikin Connect - Video Panduan Internal",
    youtubeId: "CD1W_WJ_Lgw",
    category: "internal",
    description: "Video ini berisi panduan internal mengenai sistem Daikin Connect. Hanya dapat diakses oleh tim internal."
  }
];

export default function KnowledgeClient({ isInternal }: { isInternal: boolean }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<"all" | "public" | "internal">("all");

  const visibleVideos = VIDEOS.filter(video => {
    // If user is not internal, hide internal videos completely
    if (!isInternal && video.category === "internal") return false;
    
    // Filter by active tab
    if (activeCategory === "all") return true;
    return video.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-[#fcfdff] pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-6">
          <button 
            onClick={() => router.push("/home")}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#0073ea] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1 flex items-center gap-2">
              <BookOpen className="text-[#0073ea]" size={24} /> Pusat Ilmu
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pusat Pembelajaran & Video Tutorial</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Category Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeCategory === "all" ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Semua Video
          </button>
          <button 
            onClick={() => setActiveCategory("public")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeCategory === "public" ? "bg-[#00c875] text-white shadow-md shadow-[#00c875]/20" : "bg-white text-slate-500 border border-slate-200 hover:bg-[#00c875]/5"
            }`}
          >
            <Globe size={16} className={activeCategory === "public" ? "text-white" : "text-[#00c875]"} />
            Publik
          </button>
          
          {isInternal && (
            <button 
              onClick={() => setActiveCategory("internal")}
              className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeCategory === "internal" ? "bg-[#0073ea] text-white shadow-md shadow-[#0073ea]/20" : "bg-white text-slate-500 border border-slate-200 hover:bg-[#0073ea]/5"
              }`}
            >
              <Lock size={16} className={activeCategory === "internal" ? "text-white" : "text-[#0073ea]"} />
              Internal
            </button>
          )}
        </div>

        {/* Video Grid */}
        {visibleVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6">
              <Video size={40} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">Belum Ada Video</h2>
            <p className="text-slate-500 max-w-sm text-sm">
              Kategori ini belum memiliki video tutorial saat ini. Nantikan pembaruan berikutnya!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatePresence>
              {visibleVideos.map((video) => (
                <motion.div 
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow flex flex-col"
                >
                  <div className="relative w-full pt-[56.25%] bg-black">
                    <iframe 
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.youtubeId}`} 
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {video.category === "internal" ? (
                        <span className="px-3 py-1 bg-[#0073ea]/10 text-[#0073ea] rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
                          <Lock size={12} /> Internal
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-[#00c875]/10 text-[#00c875] rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
                          <Globe size={12} /> Publik
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight">{video.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{video.description}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
