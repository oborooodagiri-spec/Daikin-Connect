"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, BookOpen, Video, Lock, Globe, Plus, X, Play, Trash2, Clock, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createKnowledgeResource, deleteKnowledgeResource, getKnowledgeResources } from "@/app/actions/knowledge";

interface Props {
  isInternal: boolean;
  isAdmin: boolean;
  initialVideos: any[];
}

function extractYoutubeId(url: string): string | null {
  // Support: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getYoutubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

export default function KnowledgeClient({ isInternal, isAdmin, initialVideos }: Props) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<"all" | "Public" | "Internal">("all");
  const [videos, setVideos] = useState<any[]>(initialVideos);
  const [playingVideo, setPlayingVideo] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", youtubeUrl: "", description: "", visibility: "Internal" });
  const [isAdding, setIsAdding] = useState(false);

  const reloadVideos = useCallback(async () => {
    const data = await getKnowledgeResources();
    setVideos(data);
  }, []);

  // Filter videos: only type=VIDEO, and filter by visibility + active tab
  const filteredVideos = videos
    .filter(v => v.type === "VIDEO")
    .filter(v => {
      if (!isInternal && v.visibility === "Internal") return false;
      if (activeCategory === "all") return true;
      return v.visibility === activeCategory;
    });

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYoutubeId(addForm.youtubeUrl);
    if (!ytId) {
      alert("URL YouTube tidak valid. Gunakan format seperti: https://youtu.be/xxxxx atau https://youtube.com/watch?v=xxxxx");
      return;
    }
    setIsAdding(true);
    const res = await createKnowledgeResource({
      title: addForm.title,
      category: "Video Tutorial",
      type: "VIDEO",
      href: addForm.youtubeUrl,
      thumbnail: getYoutubeThumbnail(ytId),
      tags: ytId,  // store youtubeId in tags field for easy access
      visibility: addForm.visibility,
    });
    setIsAdding(false);
    if (res.success) {
      setShowAddModal(false);
      setAddForm({ title: "", youtubeUrl: "", description: "", visibility: "Internal" });
      reloadVideos();
    } else {
      alert("Gagal menambahkan video.");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Yakin ingin menghapus video ini?")) return;
    const res = await deleteKnowledgeResource(id);
    if (res.success) reloadVideos();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/home")}
              className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#0073ea] hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none flex items-center gap-2">
                <BookOpen className="text-[#0073ea]" size={20} /> Pusat Ilmu
              </h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mt-0.5">Video Tutorial & Pembelajaran</p>
            </div>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0073ea] text-white rounded-lg text-sm font-bold hover:bg-[#005fbd] transition-all shadow-sm shadow-[#0073ea]/20"
            >
              <Plus size={16} /> Tambah Video
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeCategory === "all" ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Semua
          </button>
          <button 
            onClick={() => setActiveCategory("Public")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeCategory === "Public" ? "bg-[#00c875] text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-[#00c875]/5"
            }`}
          >
            <Globe size={14} /> Publik
          </button>
          {isInternal && (
            <button 
              onClick={() => setActiveCategory("Internal")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeCategory === "Internal" ? "bg-[#0073ea] text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-[#0073ea]/5"
              }`}
            >
              <Lock size={14} /> Internal
            </button>
          )}
        </div>

        {/* Video Grid */}
        {filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-5">
              <Video size={32} />
            </div>
            <h2 className="text-lg font-black text-slate-700 mb-1">Belum Ada Video</h2>
            <p className="text-slate-400 text-sm max-w-xs">
              {isAdmin ? "Klik tombol \"Tambah Video\" untuk menambahkan video tutorial pertama." : "Kategori ini belum memiliki video. Nantikan pembaruan!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredVideos.map((video) => {
                const ytId = video.tags || extractYoutubeId(video.href || "") || "";
                return (
                  <motion.div 
                    key={video.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all group cursor-pointer flex flex-col"
                    onClick={() => setPlayingVideo(video)}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video bg-slate-900 overflow-hidden">
                      <img 
                        src={video.thumbnail || getYoutubeThumbnail(ytId)}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-lg">
                          <Play size={20} className="text-slate-800 ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                      {/* Badge */}
                      <div className="absolute top-2 left-2">
                        {video.visibility === "Internal" ? (
                          <span className="px-2 py-0.5 bg-[#0073ea]/90 backdrop-blur-sm text-white rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                            <Lock size={9} /> Internal
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#00c875]/90 backdrop-blur-sm text-white rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                            <Globe size={9} /> Publik
                          </span>
                        )}
                      </div>
                      {/* Admin delete */}
                      {isAdmin && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video.id); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 backdrop-blur-sm text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3.5 flex-1 flex flex-col">
                      <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 mb-1.5">{video.title}</h3>
                      <div className="flex items-center gap-3 mt-auto pt-2 text-[10px] font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(video.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setPlayingVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-sm truncate pr-4">{playingVideo.title}</h3>
                <button onClick={() => setPlayingVideo(null)} className="text-white/70 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${playingVideo.tags || extractYoutubeId(playingVideo.href || "")}?autoplay=1&rel=0`}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Video Modal (Admin Only) */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-800">Tambah Video Baru</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddVideo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Judul Video *</label>
                  <input 
                    required
                    type="text"
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    placeholder="Masukkan judul video"
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#0073ea] outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Link YouTube *</label>
                  <input 
                    required
                    type="url"
                    value={addForm.youtubeUrl}
                    onChange={(e) => setAddForm({ ...addForm, youtubeUrl: e.target.value })}
                    placeholder="https://youtu.be/xxxxx"
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#0073ea] outline-none transition-shadow"
                  />
                  {addForm.youtubeUrl && extractYoutubeId(addForm.youtubeUrl) && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-100">
                      <img 
                        src={getYoutubeThumbnail(extractYoutubeId(addForm.youtubeUrl)!)}
                        alt="Preview"
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Visibilitas</label>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setAddForm({ ...addForm, visibility: "Internal" })}
                      className={`flex-1 p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        addForm.visibility === "Internal" ? "border-[#0073ea] bg-[#0073ea]/5 text-[#0073ea]" : "border-slate-200 text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      <Lock size={14} /> Internal
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAddForm({ ...addForm, visibility: "Public" })}
                      className={`flex-1 p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        addForm.visibility === "Public" ? "border-[#00c875] bg-[#00c875]/5 text-[#00c875]" : "border-slate-200 text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      <Globe size={14} /> Publik
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-bold"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isAdding}
                    className="px-5 py-2 bg-[#0073ea] hover:bg-[#005fbd] text-white rounded-lg text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2"
                  >
                    {isAdding ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> Menyimpan...</>
                    ) : (
                      <><Plus size={16} /> Simpan Video</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
