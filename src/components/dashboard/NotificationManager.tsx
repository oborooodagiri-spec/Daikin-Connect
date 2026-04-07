"use client";

import { useEffect, useState } from "react";
import { registerPushToken } from "@/app/actions/notifications";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CLIENT-SIDE NOTIFICATION MANAGER
 * 1. Requests permission from the user.
 * 2. Obtains the FCM/WebPush token.
 * 3. Registers it in the database.
 */

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
      
      // If we haven't asked yet, show a gentle prompt after 5 seconds
      if (Notification.permission === "default") {
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      } else if (Notification.permission === "granted") {
        // Automatically ensure token is updated
        syncToken();
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    setStatus("loading");
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        // Run syncToken with a race against a 10s timeout
        await Promise.race([
          syncToken(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
        ]).catch(err => console.warn("Sync secondary error:", err));

        setStatus("success");
        setTimeout(() => setShowPrompt(false), 2000);
      } else {
        setShowPrompt(false);
        setStatus("idle");
      }
    } catch (err) {
      console.error("Permission request failed:", err);
      setShowPrompt(false);
      setStatus("idle");
    }
  };

  const syncToken = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      // Use a shorter wait for service worker ready
      const registration = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = "BP8_O4k7Y-P7N5J0u7W7X8..."; // PLACEHOLDER
      
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
      }

      const token = JSON.stringify(subscription);
      await registerPushToken(token, "web-android");
      
    } catch (err) {
      console.warn("FCM Token Syncing failed:", err);
      throw err; // Rethrow to let handleRequestPermission handle completion
    }
  };

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[999999]"
          >
            <div className="bg-[#003366] text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 flex items-start gap-4">
               <div className="p-3 bg-[#00a1e4] rounded-2xl shrink-0">
                  <Bell className="animate-bounce" size={24}/>
               </div>
               <div className="flex-1">
                  <h4 className="text-sm font-black uppercase tracking-tight">Stay Connected</h4>
                  <p className="text-[10px] font-medium text-blue-100 mt-1 leading-relaxed">
                     Enable push notifications to receive real-time chat updates and critical unit alerts on your phone.
                  </p>
                  <div className="flex gap-3 mt-4">
                     <button 
                       onClick={handleRequestPermission}
                       disabled={status === 'loading'}
                       className="px-4 py-2 bg-white text-[#003366] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2"
                     >
                        {status === 'loading' ? 'Syncing...' : status === 'success' ? <><CheckCircle2 size={14}/> Ready</> : 'Allow Access'}
                     </button>
                     <button onClick={() => setShowPrompt(false)} className="text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white pb-1">
                        Later
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Status Indicator in Header area if needed */}
    </>
  );
}
