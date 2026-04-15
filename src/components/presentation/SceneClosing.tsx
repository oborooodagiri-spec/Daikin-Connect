"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, Layers, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface SceneProps {
  isVisible: boolean;
}

export function SceneClosing({ isVisible }: SceneProps) {
  const router = useRouter();

  const textVariant = {
    hidden: { opacity: 0, scale: 0.8, filter: "blur(20px)" },
    visible: { 
      opacity: 1, 
      scale: 1, 
      filter: "blur(0px)",
      transition: { duration: 1.5, ease: "easeOut" as const, staggerChildren: 0.3, delay: 0.2 } 
    },
    exit: { opacity: 0, scale: 1.2, filter: "blur(20px)", transition: { duration: 0.5 } }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-12">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div 
             key="closing-content"
             initial="hidden"
             animate="visible"
             exit="exit"
             variants={textVariant}
             className="text-center space-y-16"
          >
            <div className="relative flex justify-center">
               <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center opacity-10"
               >
                  <Globe size={400} />
               </motion.div>
               
               <div className="relative z-10 space-y-8">
                  <motion.div variants={textVariant} className="flex flex-col items-center gap-8">
                     <div className="flex items-center gap-8">
                        <img src="/daikin_logo.png" className="h-10 brightness-0 invert" alt="Daikin" />
                        <div className="w-[1px] h-10 bg-white/20"></div>
                        <img src="/logo_epl_connect_1.png" className="h-14 brightness-0 invert" alt="EPL" />
                     </div>
                     <h2 className="text-[120px] font-black italic tracking-tighter leading-none text-blue-500 shadow-glow-blue uppercase">
                       CONNECT
                     </h2>
                  </motion.div>
                  
                  <motion.p 
                    variants={textVariant}
                    className="text-slate-500 font-black uppercase tracking-[2em] text-[12px]"
                  >
                    The Future is Connected.
                  </motion.p>
               </div>
            </div>

            <motion.button 
              variants={textVariant}
              onClick={() => router.push('/dashboard')}
              className="group relative px-20 py-8 bg-blue-600 text-white rounded-full font-black uppercase tracking-[0.3em] text-[12px] shadow-[0_30px_100px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all overflow-hidden"
            >
               <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
               <span className="relative z-10 flex items-center justify-center gap-4">
                  Enter Command Center <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
               </span>
            </motion.button>

            <div className="pt-20 opacity-20 flex justify-center gap-12">
               {[Layers, Globe, Shield].map((Icon, i) => (
                  <Icon key={i} size={24} />
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
