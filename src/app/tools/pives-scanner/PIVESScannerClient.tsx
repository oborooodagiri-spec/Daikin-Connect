
"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, QrCode, ScanLine, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import jsQR from "jsqr";

export default function PIVESScannerClient() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (canvas) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            handleScanSuccess(code.data);
            return; // Stop ticking if found
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  };

  const handleScanSuccess = (data: string) => {
    stopCamera();
    setScannedResult(data);
    
    // Parse the Daikin Connect URL
    try {
      const url = new URL(data);
      // If it contains passport, redirect to internal passport route
      if (url.pathname.includes("/passport/")) {
        // e.g. /passport/12345
        router.push(url.pathname);
      } else {
        // fallback to internal redirect keeping path
        router.push(url.pathname + url.search);
      }
    } catch (e) {
      // Not a valid URL, maybe just text
      alert("Format Barcode tidak dikenali: " + data);
      setIsScanning(false);
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    setScannedResult(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Play video explicitly (required for some mobile browsers)
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          requestRef.current = requestAnimationFrame(tick);
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
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
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
        {!isScanning && !scannedResult ? (
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
        ) : isScanning ? (
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
            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
              <ScanLine size={32} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Memproses Data...</h3>
            <p className="text-xs font-medium text-slate-400 break-all">{scannedResult}</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
