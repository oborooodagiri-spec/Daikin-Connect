"use client";

import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { APP_VERSION } from "@/lib/version";

export default function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [serverVersion, setServerVersion] = useState(APP_VERSION);

  useEffect(() => {
    // 1. Initial check after 5 seconds, then every 10 minutes
    const checkVersion = async () => {
      try {
        const res = await fetch("/version.json", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.version && data.version !== APP_VERSION) {
          setServerVersion(data.version);
          setShowPrompt(true);
        }
      } catch (err) {
        console.warn("Version check failed:", err);
      }
    };

    const timer = setTimeout(checkVersion, 5000);
    const interval = setInterval(checkVersion, 10 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleUpdate = () => {
    // Refresh and bypass cache
    window.location.reload();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#00a1e4] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/20 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
             <RefreshCw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <p className="text-[14px] font-bold">Update Available!</p>
            <p className="text-[10px] opacity-80 uppercase tracking-wider font-medium">
              New Version {serverVersion} is ready.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleUpdate}
            className="bg-white text-[#00a1e4] px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-slate-100 transition-colors shadow-lg active:scale-95"
          >
            Update Now
          </button>
          <button 
            onClick={() => setShowPrompt(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
