"use client";

import LoadingLogo from "@/components/ui/LoadingLogo";

export default function LoadingDemo() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-12">
        <LoadingLogo size={150} />
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#323338]">EPL Connect</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Morphing Logo Concept</p>
        </div>
      </div>
    </div>
  );
}
