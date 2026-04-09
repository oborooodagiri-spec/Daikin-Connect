"use client";

import { useEffect, useState, useTransition } from "react";
import { getAllPendingSubmissions, deletePendingSubmission, getPendingSubmissionCount } from "@/lib/offline-db";
import { createAuditActivity } from "@/app/actions/audit";
import { createPreventiveActivity } from "@/app/actions/preventive";
import { createCorrectiveActivity } from "@/app/actions/corrective";
import { Wifi, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const checkPending = async () => {
    try {
      const count = await getPendingSubmissionCount();
      setPendingCount(count);
    } catch (err) {
      console.warn("SyncManager background check skipped (DB connection issue):", err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    setIsOnline(navigator.onLine);
    checkPending();
    
    const interval = setInterval(checkPending, 30000); // Check every 30s
    
    const handleOnline = () => {
      console.log("Back online! Triggering sync...");
      setIsOnline(true);
      performSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const uploadPhotos = async (photos: Blob[], folder: string) => {
    const uploadedUrls: { photo_url: string, description: string }[] = [];
    for (const blob of photos) {
      const formData = new FormData();
      formData.append("file", blob, `offline_photo_${Date.now()}.jpg`);
      formData.append("folder", folder);
      
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        uploadedUrls.push({ photo_url: data.url, description: "Offline Sync Backup" });
      }
    }
    return uploadedUrls;
  };

  const performSync = async () => {
    const pending = await getAllPendingSubmissions();
    if (pending.length === 0) return;

    setIsSyncing(true);
    setSyncStatus("syncing");

    for (const item of pending) {
      try {
        // 1. Upload photos first (using correct folder)
        const photoUrls = await uploadPhotos(item.photos, item.type.toLowerCase());
        
        let res: any;
        const payload = { ...item.data, photos: photoUrls };

        // 2. Call appropriate action
        if (item.type === 'AUDIT') res = await createAuditActivity(payload);
        if (item.type === 'PREVENTIVE') res = await createPreventiveActivity(payload);
        if (item.type === 'CORRECTIVE') res = await createCorrectiveActivity(payload);

        if (res?.success) {
          await deletePendingSubmission(item.id!);
          console.log(`Successfully synced ${item.type} #${item.id}`);
        } else {
          const detail = res?.error || "Unknown server error (Check payload limit)";
          console.error(`Failed to sync ${item.type}:`, detail);
          // Set error state so user can see something went wrong
          setSyncStatus("error");
        }
      } catch (err: any) {
        console.error("Sync error:", err);
        setSyncStatus("error");
      }
    }

    await checkPending();
    setSyncStatus("success");
    setTimeout(() => {
      setSyncStatus("idle");
      setIsSyncing(false);
    }, 3000);
  };

  if (!isMounted || (pendingCount === 0 && syncStatus === "idle")) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md"
      >
        <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              syncStatus === 'syncing' ? 'bg-blue-100 text-blue-600' : 
              syncStatus === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {syncStatus === 'syncing' ? <RefreshCw className="animate-spin" size={20} /> : 
               syncStatus === 'success' ? <CheckCircle2 size={20} /> : <Wifi size={20} />}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Offline Sync Manager</p>
              <p className="text-sm font-bold text-slate-800">
                {syncStatus === 'syncing' ? `Menyinkronkan ${pendingCount} data...` :
                 syncStatus === 'success' ? "Semua data tersinkron!" : `${pendingCount} data tertunda (Offline)`}
              </p>
            </div>
          </div>
          
          {isOnline && !isSyncing && pendingCount > 0 && (
            <button 
              onClick={performSync}
              className="px-4 py-2 bg-[#00a1e4] text-white text-xs font-black rounded-xl uppercase tracking-wider hover:bg-[#0081b8] transition-colors shadow-lg shadow-blue-200"
            >
              Sync Now
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
