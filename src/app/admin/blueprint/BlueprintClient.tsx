"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { LineNavigator } from "@/components/presentation/LineNavigator";
import { SceneHero } from "@/components/presentation/SceneHero";
import { SceneDataChaos } from "@/components/presentation/SceneDataChaos";
import { SceneUnifiedHub } from "@/components/presentation/SceneUnifiedHub";
import { SceneImpact } from "@/components/presentation/SceneImpact";
import { SceneClosing } from "@/components/presentation/SceneClosing";

/**
 * Coordinate Map for the Journey (Normalized to increments of 100)
 * Logic: 
 * 0: Hero (0,0)
 * 1: Chaos (100, 0) - Right
 * 2: Hub (100, 100) - Down
 * 3: Intel (0, 100) - Left
 * 4: Impact (0, 200) - Down
 * 5: Closing (100, 200) - Right
 */
const SCENE_COORDS = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
  { x: 0, y: 200 },
  { x: 100, y: 200 }
];

export default function BlueprintClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [prevCoords, setPrevCoords] = useState(SCENE_COORDS[0]);

  useEffect(() => { setIsMounted(true); }, []);

  // Simple Scroll Handler for Snap Logic
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (isMoving) return;

      if (e.deltaY > 50 && sceneIndex < SCENE_COORDS.length - 1) {
        triggerTransition(sceneIndex + 1);
      } else if (e.deltaY < -50 && sceneIndex > 0) {
        triggerTransition(sceneIndex - 1);
      }
    };

    window.addEventListener("wheel", handleScroll);
    return () => window.removeEventListener("wheel", handleScroll);
  }, [sceneIndex, isMoving]);

  const triggerTransition = (nextIndex: number) => {
    setPrevCoords(SCENE_COORDS[sceneIndex]);
    setIsMoving(true);
    
    // Duration should match the line and camera animation
    setTimeout(() => {
      setSceneIndex(nextIndex);
      setIsMoving(false);
    }, 800);
  };

  if (!isMounted) return <div className="min-h-screen bg-[#040814]" />;

  const currentCoords = SCENE_COORDS[sceneIndex];

  return (
    <div className="fixed inset-0 bg-[#040814] overflow-hidden">
      {/* Background (Always Fixed) */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10" />
      </div>

      {/* The Camera Container */}
      <motion.div 
        animate={{ 
          x: `-${currentCoords.x}vw`, 
          y: `-${currentCoords.y}vh` 
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="w-full h-full"
      >
        {/* Render all scenes at their grid positions */}
        <div style={{ position: "absolute", left: "0vw", top: "0vh", width: "100%", height: "100%" }}>
           <SceneHero isVisible={sceneIndex === 0 && !isMoving} />
        </div>
        
        <div style={{ position: "absolute", left: "100vw", top: "0vh", width: "100%", height: "100%" }}>
           <SceneDataChaos isVisible={sceneIndex === 1 && !isMoving} />
        </div>

        <div style={{ position: "absolute", left: "100vw", top: "100vh", width: "100%", height: "100%" }}>
           <SceneUnifiedHub mode="intelligence" isVisible={sceneIndex === 2 && !isMoving} />
        </div>

        <div style={{ position: "absolute", left: "0vw", top: "100vh", width: "100%", height: "100%" }}>
           <SceneUnifiedHub mode="reveal" isVisible={sceneIndex === 3 && !isMoving} />
        </div>

        <div style={{ position: "absolute", left: "0vw", top: "200vh", width: "100%", height: "100%" }}>
           <SceneImpact isVisible={sceneIndex === 4 && !isMoving} />
        </div>

        <div style={{ position: "absolute", left: "100vw", top: "200vh", width: "100%", height: "100%" }}>
           <SceneClosing isVisible={sceneIndex === 5 && !isMoving} />
        </div>
      </motion.div>

      {/* Stretching Line overlay */}
      <LineNavigator 
        isMoving={isMoving} 
        from={{ x: 50, y: 50 }} 
        to={{ 
            x: 50 + (SCENE_COORDS[sceneIndex].x - prevCoords.x), 
            y: 50 + (SCENE_COORDS[sceneIndex].y - prevCoords.y) 
        }} 
      />

      {/* Navigation Indicators */}
      <div className="fixed top-8 right-8 z-[100] flex gap-2">
         {SCENE_COORDS.map((_, i) => (
           <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === sceneIndex ? "w-8 bg-blue-500" : "w-4 bg-white/10"}`} />
         ))}
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 opacity-20 text-[8px] font-black uppercase tracking-[0.5em]">
        Scroll to Step Into the Blueprint
      </div>
    </div>
  );
}
