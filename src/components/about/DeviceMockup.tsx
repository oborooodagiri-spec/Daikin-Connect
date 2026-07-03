"use client";
import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface DeviceMockupProps {
  children: React.ReactNode;
  className?: string;
}

export default function DeviceMockup({ children, className = "" }: DeviceMockupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [5, -5]);
  const rotateY = useTransform(mouseX, [0, 1], [-5, 5]);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={`${className}`}
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="hidden lg:block"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Screen */}
        <div className="bg-slate-900 rounded-t-xl border-2 border-slate-700 p-2 shadow-2xl">
          <div className="bg-slate-800 rounded-lg overflow-hidden aspect-video relative">
            {children}
            {/* Reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </div>
        </div>
        {/* Base */}
        <div className="mx-auto w-[60%] h-3 bg-gradient-to-b from-slate-600 to-slate-700 rounded-b-lg" />
        <div className="mx-auto w-[80%] h-1 bg-slate-700 rounded-b-xl" />
      </motion.div>

      {/* Mobile: no 3D tilt */}
      <div className="lg:hidden">
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-1.5 shadow-lg">
          <div className="bg-slate-800 rounded-lg overflow-hidden aspect-video relative">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
