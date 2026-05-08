"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineNavigator } from "@/components/presentation/LineNavigator";
import { 
  PhaseInisiasi, 
  PhaseSurvei, 
  PhaseQuotation, 
  PhasePO, 
  PhaseEksekusi, 
  PhaseReporting, 
  PhaseManagement,
  PhaseEvaluasi 
} from "@/components/presentation/ves/VesPhases";
import { ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";
import { EplLogo } from "@/components/presentation/EplLogo";

/**
 * Modern Horizontal Camera Map for the VES Journey
 */
const SCENE_COORDS = [
  { x: 0, y: 0 },   // 1: Inisiasi
  { x: 100, y: 0 }, // 2: Survei
  { x: 200, y: 0 }, // 3: Quotation
  { x: 300, y: 0 }, // 4: PO
  { x: 400, y: 0 }, // 5: Eksekusi
  { x: 500, y: 0 }, // 6: Reporting
  { x: 600, y: 0 }, // 7: Management
  { x: 700, y: 0 }  // 8: Evaluasi
];

export default function VesFlowClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [prevCoords, setPrevCoords] = useState(SCENE_COORDS[0]);

  useEffect(() => { setIsMounted(true); }, []);

  // Re-enabled Scroll navigation for horizontal pan
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (isMoving) return;

      // Vertical scroll translates to horizontal move
      if (e.deltaY > 30 && sceneIndex < SCENE_COORDS.length - 1) {
        triggerTransition(sceneIndex + 1);
      } else if (e.deltaY < -30 && sceneIndex > 0) {
        triggerTransition(sceneIndex - 1);
      }
    };

    window.addEventListener("wheel", handleScroll);
    return () => window.removeEventListener("wheel", handleScroll);
  }, [sceneIndex, isMoving]);

  const triggerTransition = (nextIndex: number) => {
    setPrevCoords(SCENE_COORDS[sceneIndex]);
    setIsMoving(true);
    
    // Smooth transition with delay for reveal
    setTimeout(() => {
      setSceneIndex(nextIndex);
      setIsMoving(false);
    }, 1200);
  };

  if (!isMounted) return <div className="min-h-screen bg-[#020617]" />;

  const currentCoords = SCENE_COORDS[sceneIndex];

  return (
    <div className="fixed inset-0 bg-white overflow-hidden text-slate-900">
      {/* Dynamic Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Moving Gradient Orbs */}
         <motion.div 
            animate={{ 
               x: [-100, 100, -100], 
               y: [-50, 50, -50],
               rotate: 360
            }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,#00a1e405_0%,transparent_70%)]"
         />
         
         {/* Strategic Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] [background-size:100px_100px]" />
         
         {/* Vignette */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]" />
      </div>

      {/* The Camera Container */}
      <motion.div 
        animate={{ 
          x: `-${currentCoords.x}vw`, 
          y: `-${currentCoords.y}vh`,
          scale: isMoving ? 0.98 : 1,
          filter: isMoving ? "blur(4px)" : "blur(0px)"
        }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full flex"
        style={{ width: `${SCENE_COORDS.length * 100}vw` }}
      >
        {/* Phase Scenes positioned horizontally */}
        {SCENE_COORDS.map((_, i) => (
           <div key={i} className="w-[100vw] h-full shrink-0 relative">
              {i === 0 && <PhaseInisiasi isVisible={sceneIndex === 0 && !isMoving} />}
              {i === 1 && <PhaseSurvei isVisible={sceneIndex === 1 && !isMoving} />}
              {i === 2 && <PhaseQuotation isVisible={sceneIndex === 2 && !isMoving} />}
              {i === 3 && <PhasePO isVisible={sceneIndex === 3 && !isMoving} />}
              {i === 4 && <PhaseEksekusi isVisible={sceneIndex === 4 && !isMoving} />}
              {i === 5 && <PhaseReporting isVisible={sceneIndex === 5 && !isMoving} />}
              {i === 6 && <PhaseManagement isVisible={sceneIndex === 6 && !isMoving} />}
              {i === 7 && <PhaseEvaluasi isVisible={sceneIndex === 7 && !isMoving} />}
           </div>
        ))}
      </motion.div>

      {/* Modern LineNavigator Integration */}
      <LineNavigator 
        isMoving={isMoving} 
        from={{ x: 50, y: 50 }} 
        to={{ 
            x: 50 + (SCENE_COORDS[sceneIndex].x - prevCoords.x), 
            y: 50 + (SCENE_COORDS[sceneIndex].y - prevCoords.y) 
        }} 
      />

      {/* Sophisticated UI Overlays */}
      
      {/* Top Navigation Bar */}
       <div className="fixed top-0 left-0 right-0 h-24 z-[100] px-12 flex justify-between items-center bg-gradient-to-b from-white to-transparent pointer-events-none">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-blue-600 tracking-[0.4em] uppercase mb-1 drop-shadow-sm">Strategic Operational Roadmap</span>
             <div className="flex items-center gap-4">
                <h2 className="text-slate-900 font-bold text-2xl tracking-tighter drop-shadow-sm">VES Project Lifecycle</h2>
                <div className="h-4 w-px bg-slate-200 mx-2" />
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                   <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Managerial Analysis Mode</span>
                </div>
             </div>
          </div>
         
         {/* Phase Counter */}
          <div className="flex items-center gap-8 pointer-events-auto">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Phase Progression</span>
                <div className="flex items-center gap-1 mt-1">
                   <span className="text-2xl font-black text-slate-900">0{sceneIndex + 1}</span>
                   <span className="text-sm font-bold text-slate-300">/ 08</span>
                </div>
             </div>
          </div>
      </div>

      {/* Progress Bottom Bar */}
      <div className="fixed bottom-12 left-12 right-12 z-[100] flex items-center justify-between pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
             {SCENE_COORDS.map((_, i) => (
               <button 
                 key={i} 
                 onClick={() => triggerTransition(i)}
                 className={`h-1 rounded-full transition-all duration-700 ${i === sceneIndex ? "w-16 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)]" : i < sceneIndex ? "w-8 bg-blue-600/20" : "w-8 bg-slate-200 hover:bg-slate-300"}`} 
               />
             ))}
          </div>
          
          <div className="flex items-center gap-4 opacity-40">
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-900">Use Scroll to Pan</span>
             <div className="w-8 h-px bg-slate-900/20" />
             <ChevronDown className="w-4 h-4 text-slate-900 animate-bounce" />
          </div>
      </div>

      {/* Screen Slide Overlay Effect */}
      <AnimatePresence>
        {isMoving && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-blue-50/90 backdrop-blur-xl flex items-center justify-center pointer-events-none"
          >
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 1.1, opacity: 0 }}
               className="flex flex-col items-center gap-8"
             >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    filter: ["drop-shadow(0 0 0px rgba(37,99,235,0))", "drop-shadow(0 20px 30px rgba(37,99,235,0.2))", "drop-shadow(0 0 0px rgba(37,99,235,0))"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <EplLogo size={140} />
                </motion.div>
                
                <div className="flex flex-col items-center gap-2">
                  <motion.span 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-blue-600 text-[10px] font-black uppercase tracking-[0.8em] ml-[0.8em]"
                  >
                    Synchronizing Scene
                  </motion.span>
                  <div className="w-12 h-0.5 bg-blue-600/20 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: [-48, 48] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full bg-blue-600"
                    />
                  </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
