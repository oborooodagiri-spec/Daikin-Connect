"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, BookOpen, Filter, ArrowLeft, 
  Sparkles, Grid, List as ListIcon 
} from "lucide-react";
import { useRouter } from "next/navigation";
import ResourceCard from "@/components/dashboard/ResourceCard";
import ResourceViewer from "@/components/dashboard/ResourceViewer";

export default function KnowledgeClient({ 
  resources: initialResources,
  isAdmin = false
}: { 
  resources: any[], 
  isAdmin?: boolean 
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("SEMUA");
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const categories = ["SEMUA", "JUKLAK", "JUKNIS", "STRATEGY", "MARKETING"];

  const filtered = initialResources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          (r.tags && r.tags.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === "SEMUA" || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLaunch = (resource: any) => {
    if (resource.type === "INTERACTIVE" && resource.href) {
      router.push(resource.href);
    } else {
      setSelectedResource(resource);
      setIsViewerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => router.push("/home")}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                 <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1 flex items-center gap-2">
                    <BookOpen className="text-blue-600" size={24} /> Knowledge Hub
                 </h1>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Blueprint & Service Guidelines</p>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   placeholder="Cari pedoman teknis..."
                   className="w-80 h-12 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold outline-none focus:border-blue-200 transition-all"
                 />
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Intro */}
        <div className="mb-12">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
           >
              <Sparkles size={14} /> VES Operational Intelligence
           </motion.div>
           <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-[0.9] mb-4">
              Pusat Pengetahuan<br />Value Engineering Services
           </h2>
           <p className="text-slate-400 font-bold max-w-2xl leading-relaxed">
              Akses cepat ke seluruh standar operasional (Juklak) dan standar teknis (Juknis) nasional untuk memastikan integrasi kualitas layanan di setiap Tier.
           </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
           <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
           
           <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button className="p-2.5 bg-white shadow-sm rounded-xl text-blue-600"><Grid size={18} /></button>
              <button className="p-2.5 text-slate-400"><ListIcon size={18} /></button>
           </div>
        </div>

        {/* Resource Grid */}
        {filtered.length === 0 ? (
          <div className="py-32 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Search size={40} />
             </div>
             <h3 className="text-xl font-black text-slate-400">Tidak menemukan hasil</h3>
             <p className="text-slate-300 font-bold">Coba cari dengan kata kunci lain atau kategori berbeda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filtered.map(resource => (
               <ResourceCard 
                 key={resource.id} 
                 resource={resource} 
                 onLaunch={handleLaunch}
                 isAdmin={isAdmin}
               />
             ))}
          </div>
        )}
      </div>

      <ResourceViewer 
        resource={selectedResource}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
}
