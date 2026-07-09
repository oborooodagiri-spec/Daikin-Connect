"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, BookOpen, Video, Lock, Globe, Plus, X, Play, Trash2, Clock, Search, Edit3, Tag as TagIcon, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createKnowledgeResource, deleteKnowledgeResource, getKnowledgeResources, updateKnowledgeResource } from "@/app/actions/knowledge";

interface Props {
  isInternal: boolean;
  isAdmin: boolean;
  initialVideos: any[];
}

function extractYoutubeId(url: string): string | null {
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
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}

export default function KnowledgeClient({ isInternal, isAdmin, initialVideos }: Props) {
  const router = useRouter();
  const [activeVisibility, setActiveVisibility] = useState<"all" | "Public" | "Internal">("all");
  const [videos, setVideos] = useState<any[]>(initialVideos);
  const [playingVideo, setPlayingVideo] = useState<any | null>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ title: "", youtubeUrl: "", tags: "", visibility: "Internal" });
  const [isSaving, setIsSaving] = useState(false);

  // New Features State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<"all" | string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "a-z">("newest");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const reloadVideos = useCallback(async () => {
    const data = await getKnowledgeResources();
    setVideos(data);
  }, []);

  // Compute all unique tags available from the videos
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    videos.forEach(v => {
      if (v.type === "VIDEO" && v.tags) {
        v.tags.split(',').forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [videos]);

  // Filter and Sort Videos
  const filteredAndSortedVideos = useMemo(() => {
    let result = videos.filter(v => v.type === "VIDEO");

    // 1. Filter by Visibility
    if (!isInternal) {
      result = result.filter(v => v.visibility !== "Internal");
    }
    if (activeVisibility !== "all") {
      result = result.filter(v => v.visibility === activeVisibility);
    }

    // 2. Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.title.toLowerCase().includes(q) || 
        (v.tags && v.tags.toLowerCase().includes(q))
      );
    }

    // 3. Filter by Tag
    if (activeTag !== "all") {
      result = result.filter(v => {
        if (!v.tags) return false;
        const vTags = v.tags.split(',').map((t: string) => t.trim().toLowerCase());
        return vTags.includes(activeTag.toLowerCase());
      });
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "a-z") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [videos, isInternal, activeVisibility, searchQuery, activeTag, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedVideos.length / itemsPerPage);
  const currentVideos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedVideos.slice(start, start + itemsPerPage);
  }, [filteredAndSortedVideos, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTag, activeVisibility, sortBy]);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditId(null);
    setForm({ title: "", youtubeUrl: "", tags: "", visibility: "Internal" });
    setShowModal(true);
  };

  const openEditModal = (video: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setEditId(video.id);
    setForm({ 
      title: video.title, 
      youtubeUrl: video.href || "", 
      tags: video.tags || "", 
      visibility: video.visibility 
    });
    setShowModal(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYoutubeId(form.youtubeUrl);
    if (!ytId) {
      alert("URL YouTube tidak valid. Gunakan format seperti: https://youtu.be/xxxxx atau https://youtube.com/watch?v=xxxxx");
      return;
    }
    
    setIsSaving(true);
    
    // Clean up tags
    const cleanTags = form.tags.split(',').map(t => t.trim()).filter(t => t).join(', ');

    let res;
    if (isEditMode && editId) {
      res = await updateKnowledgeResource(editId, {
        title: form.title,
        category: "Video Tutorial",
        type: "VIDEO",
        href: form.youtubeUrl,
        thumbnail: getYoutubeThumbnail(ytId),
        tags: cleanTags,
        visibility: form.visibility,
      });
    } else {
      res = await createKnowledgeResource({
        title: form.title,
        category: "Video Tutorial",
        type: "VIDEO",
        href: form.youtubeUrl,
        thumbnail: getYoutubeThumbnail(ytId),
        tags: cleanTags,
        visibility: form.visibility,
      });
    }
    
    setIsSaving(false);
    
    if (res.success) {
      setShowModal(false);
      reloadVideos();
    } else {
      alert(res.error || "Gagal menyimpan video.");
    }
  };

  const handleDeleteVideo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#0073ea] text-white rounded-lg text-sm font-bold hover:bg-[#005fbd] transition-all shadow-sm shadow-[#0073ea]/20"
            >
              <Plus size={16} /> Tambah Video
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* Controls Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari video tutorial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0073ea]/20 focus:border-[#0073ea] outline-none transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm shrink-0">
              <SlidersHorizontal size={14} className="text-slate-400 mr-2" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="a-z">A - Z</option>
              </select>
            </div>

            <div className="w-px h-6 bg-slate-200 shrink-0 hidden md:block"></div>

            {/* Visibility Filters */}
            <button 
              onClick={() => setActiveVisibility("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm ${
                activeVisibility === "all" ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Semua
            </button>
            <button 
              onClick={() => setActiveVisibility("Public")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm ${
                activeVisibility === "Public" ? "bg-[#00c875] text-white border-transparent" : "bg-white text-slate-500 border border-slate-200 hover:bg-[#00c875]/5"
              }`}
            >
              <Globe size={14} /> Publik
            </button>
            {isInternal && (
              <button 
                onClick={() => setActiveVisibility("Internal")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm ${
                  activeVisibility === "Internal" ? "bg-[#0073ea] text-white border-transparent" : "bg-white text-slate-500 border border-slate-200 hover:bg-[#0073ea]/5"
                }`}
              >
                <Lock size={14} /> Internal
              </button>
            )}
          </div>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <TagIcon size={12} /> Tags:
            </span>
            <button 
              onClick={() => setActiveTag("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                activeTag === "all" ? "bg-slate-200 text-slate-800" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Semua Tag
            </button>
            {allTags.map(tag => (
              <button 
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  activeTag === tag ? "bg-[#0073ea]/10 text-[#0073ea] border border-[#0073ea]/20" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Video Grid */}
        {filteredAndSortedVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
              <Video size={28} />
            </div>
            <h2 className="text-lg font-black text-slate-700 mb-1">Pencarian Tidak Ditemukan</h2>
            <p className="text-slate-400 text-sm max-w-sm">
              Tidak ada video yang cocok dengan filter atau kata kunci pencarian Anda. Silakan ubah filter untuk melihat video lainnya.
            </p>
            {(searchQuery || activeTag !== "all" || activeVisibility !== "all") && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setActiveTag("all");
                  setActiveVisibility("all");
                  setSortBy("newest");
                }}
                className="mt-6 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {currentVideos.map((video) => {
                  const ytId = extractYoutubeId(video.href || "") || "";
                  const thumb = video.thumbnail && video.thumbnail.includes("mqdefault") 
                    ? getYoutubeThumbnail(ytId) 
                    : (video.thumbnail || getYoutubeThumbnail(ytId));

                  return (
                    <motion.div 
                      key={video.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 group cursor-pointer flex flex-col"
                      onClick={() => setPlayingVideo(video)}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full aspect-video bg-slate-900 overflow-hidden">
                        <img 
                          src={thumb}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                            <Play size={20} className="text-[#0073ea] ml-1" fill="currentColor" />
                          </div>
                        </div>
                        {/* Badge */}
                        <div className="absolute top-3 left-3">
                          {video.visibility === "Internal" ? (
                            <span className="px-2.5 py-1 bg-[#0073ea]/95 backdrop-blur-md text-white rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Lock size={10} /> Internal
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-[#00c875]/95 backdrop-blur-md text-white rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Globe size={10} /> Publik
                            </span>
                          )}
                        </div>
                        {/* Admin controls */}
                        {isAdmin && (
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => openEditModal(video, e)}
                              className="w-7 h-7 bg-white/95 backdrop-blur-md text-slate-700 rounded-md flex items-center justify-center hover:bg-white hover:text-[#0073ea] shadow-sm transition-colors"
                              title="Edit Video"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteVideo(video.id, e)}
                              className="w-7 h-7 bg-red-500/95 backdrop-blur-md text-white rounded-md flex items-center justify-center hover:bg-red-600 shadow-sm transition-colors"
                              title="Hapus Video"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-[#0073ea] transition-colors">{video.title}</h3>
                        
                        {/* Tags rendering */}
                        {video.tags && (
                          <div className="flex flex-wrap gap-1.5 mb-3 mt-auto">
                            {video.tags.split(',').map((t: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wide">
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {!video.tags && <div className="mt-auto"></div>}
                        
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {new Date(video.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1.5 px-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isActive 
                            ? "bg-[#0073ea] text-white border-transparent" 
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10"
            onClick={() => setPlayingVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-5xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 bg-black/50 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <div>
                  <h3 className="text-white font-bold text-lg truncate pr-4">{playingVideo.title}</h3>
                  {playingVideo.tags && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {playingVideo.tags.split(',').map((t: string, i: number) => (
                        <span key={i} className="text-[10px] font-bold text-white/60 uppercase tracking-widest">#{t.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setPlayingVideo(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors shrink-0">
                  <X size={20} />
                </button>
              </div>
              <div className="relative w-full pt-[56.25%] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${extractYoutubeId(playingVideo.href || "")}?autoplay=1&rel=0`}
                  title={playingVideo.title}
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Video Modal (Admin Only) */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  {isEditMode ? <Edit3 size={18} className="text-[#0073ea]" /> : <Plus size={18} className="text-[#0073ea]" />}
                  {isEditMode ? "Edit Video" : "Tambah Video Baru"}
                </h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto no-scrollbar">
                <form id="videoForm" onSubmit={handleSaveVideo} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Judul Video *</label>
                    <input 
                      required
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Masukkan judul video..."
                      className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:ring-4 focus:ring-[#0073ea]/10 focus:border-[#0073ea] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Link YouTube *</label>
                    <input 
                      required
                      type="url"
                      value={form.youtubeUrl}
                      onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                      placeholder="https://youtu.be/xxxxx"
                      className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:ring-4 focus:ring-[#0073ea]/10 focus:border-[#0073ea] outline-none transition-all"
                    />
                    {form.youtubeUrl && extractYoutubeId(form.youtubeUrl) && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 shadow-sm relative group">
                        <img 
                          src={getYoutubeThumbnail(extractYoutubeId(form.youtubeUrl)!)}
                          alt="Preview"
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={32} className="text-white" fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex justify-between">
                      <span>Tags Kategori</span>
                      <span className="text-slate-400 font-medium normal-case tracking-normal">Opsional</span>
                    </label>
                    <input 
                      type="text"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="Pisahkan dengan koma (contoh: Instalasi, AC VRV, Tips)"
                      className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:ring-4 focus:ring-[#0073ea]/10 focus:border-[#0073ea] outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5">Gunakan tag untuk mengelompokkan video. Pisahkan dengan tanda koma.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Visibilitas Akses</label>
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, visibility: "Internal" })}
                        className={`flex-1 p-3.5 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                          form.visibility === "Internal" ? "border-[#0073ea] bg-[#0073ea]/5 text-[#0073ea]" : "border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <Lock size={16} /> Internal
                      </button>
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, visibility: "Public" })}
                        className={`flex-1 p-3.5 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                          form.visibility === "Public" ? "border-[#00c875] bg-[#00c875]/5 text-[#00c875]" : "border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <Globe size={16} /> Publik
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 mt-auto">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  form="videoForm"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#0073ea] hover:bg-[#005fbd] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#0073ea]/20 disabled:opacity-60 flex items-center gap-2"
                >
                  {isSaving ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> Menyimpan...</>
                  ) : (
                    <>{isEditMode ? <><Edit3 size={16} /> Simpan Perubahan</> : <><Plus size={16} /> Tambah Video</>}</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
