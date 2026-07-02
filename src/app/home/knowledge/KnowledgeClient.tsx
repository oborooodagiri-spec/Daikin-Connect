"use client";

import React from "react";
import { ArrowLeft, BookOpen, Video } from "lucide-react";
import { useRouter } from "next/navigation";

export default function KnowledgeClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fcfdff] pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-6">
          <button 
            onClick={() => router.push("/home")}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1 flex items-center gap-2">
              <BookOpen className="text-blue-600" size={24} /> Pusat Ilmu
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pusat Pembelajaran & Video Tutorial</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <Video size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Video Tutorial Segera Hadir</h2>
          <p className="text-slate-500 max-w-md">
            Kami sedang mempersiapkan kumpulan video tutorial yang menarik untuk Anda. Nantikan pembaruan berikutnya!
          </p>
        </div>
      </div>
    </div>
  );
}
