
"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, QrCode, ScanLine, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function PIVESScannerClient() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        alert("Camera not supported on this device.");
        setIsScanning(false);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera permissions to use the scanner.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4 text-white">
          <button onClick={() => router.push("/tools")} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-100">PIVES Scanner</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plaza Indonesia VES</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {!isScanning ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-sm text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 mb-8">
              <QrCode size={40} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Unit Identity Scanner</h2>
            <p className="text-sm font-medium text-slate-400 leading-relaxed mb-10">
              Scan barcode unit menggunakan sistem internal Daikin Connect. Sistem ini akan otomatis menerjemahkan barcode lawas ke domain yang baru.
            </p>
            <button 
              onClick={startScanner}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-black text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-slate-200 transition-colors shadow-xl shadow-white/10"
            >
              <ScanLine size={18} />
              Start Scanner
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md relative bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800"
          >
            {/* Scanner Viewfinder overlay */}
            <div className="absolute inset-0 z-10 flex flex-col">
              <div className="p-6 flex justify-between items-start">
                <div className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Scanning
                  </p>
                </div>
                <button onClick={stopCamera} className="p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full aspect-square border-2 border-dashed border-white/40 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl" />
                  
                  {/* Scanning line animation */}
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]"
                  />
                </div>
              </div>
              <div className="p-6 text-center bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-xs font-medium text-white/70">Arahkan kamera ke barcode mesin.</p>
              </div>
            </div>

            <video 
              ref={videoRef}
              autoPlay playsInline muted
              className="w-full h-[600px] object-cover"
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}

