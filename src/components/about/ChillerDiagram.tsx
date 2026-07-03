"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const components = [
  { id: "compressor", label: "Twin-Screw Compressor", desc: "Memampatkan refrigeran bertekanan rendah menjadi gas bertekanan tinggi dan bersuhu tinggi menggunakan sepasang ulir putar presisi.", x: 250, y: 30, w: 160, h: 90 },
  { id: "condenser", label: "Shell & Tube Condenser", desc: "Mengubah refrigeran gas menjadi cairan dengan membuang panas ke sirkuit air pendingin (cooling tower).", x: 280, y: 160, w: 200, h: 100 },
  { id: "expansion", label: "Electronic Expansion Valve", desc: "Menurunkan tekanan dan suhu refrigeran cair secara presisi sebelum memasuki evaporator (efek throttling).", x: 330, y: 280, w: 80, h: 50 },
  { id: "evaporator", label: "Flooded Evaporator", desc: "Menyerap panas dari air sirkuit gedung (chilled water) sehingga refrigeran menguap dan mendinginkan air.", x: 20, y: 160, w: 200, h: 100 },
];

export default function ChillerDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);
  const activeComp = components.find((c) => c.id === hovered);

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative bg-[#0b1120] rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-2xl border border-slate-800 overflow-hidden">
        
        {/* Glow Effects in Background */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <h4 className="text-center text-xs lg:text-sm font-black text-white uppercase tracking-[0.2em] mb-6 relative z-10 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-slate-700"></span>
          Water-Cooled Screw Chiller
          <span className="w-8 h-px bg-slate-700"></span>
        </h4>
        
        <svg viewBox="0 0 500 360" className="w-full h-auto drop-shadow-2xl">
          <defs>
            <linearGradient id="comp-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="evap-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="cond-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.6" />
            </linearGradient>
            
            {/* Particle Path definitions for animation */}
            <path id="path-evap-comp" d="M 120 160 L 120 75 L 250 75" fill="none" />
            <path id="path-comp-cond" d="M 410 75 L 450 75 L 450 160" fill="none" />
            <path id="path-cond-exp" d="M 380 260 L 380 305 L 370 305" fill="none" />
            <path id="path-exp-evap" d="M 330 305 L 120 305 L 120 260" fill="none" />
          </defs>

          {/* === PIPING === */}
          {/* Suction Line (Evap to Comp) - Cyan / Low Pressure Gas */}
          <path d="M 120 160 L 120 75 L 250 75" fill="none" stroke="#22d3ee" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className="opacity-80" />
          <path d="M 120 160 L 120 75 L 250 75" fill="none" stroke="#0891b2" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="16 8" className="opacity-40">
            <animate attributeName="stroke-dashoffset" from="48" to="0" dur="1s" repeatCount="indefinite" />
          </path>

          {/* Discharge Line (Comp to Cond) - Red / High Pressure Gas */}
          <path d="M 410 75 L 450 75 L 450 160" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" className="opacity-80" />
          <path d="M 410 75 L 450 75 L 450 160" fill="none" stroke="#b91c1c" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="16 8" className="opacity-40">
            <animate attributeName="stroke-dashoffset" from="48" to="0" dur="0.8s" repeatCount="indefinite" />
          </path>

          {/* Liquid Line (Cond to Exp) - Orange / High Pressure Liquid */}
          <path d="M 380 260 L 380 305 L 370 305" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="opacity-90" />
          <path d="M 380 260 L 380 305 L 370 305" fill="none" stroke="#d97706" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 6" className="opacity-40">
             <animate attributeName="stroke-dashoffset" from="36" to="0" dur="1.5s" repeatCount="indefinite" />
          </path>

          {/* Mix Line (Exp to Evap) - Blue / Low Pressure Liquid/Gas Mix */}
          <path d="M 330 305 L 120 305 L 120 260" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="opacity-80" />
          {/* Spray effect from expansion valve */}
          {[...Array(5)].map((_, i) => (
             <circle key={i} r="2" fill="#93c5fd" className="opacity-70">
               <animateMotion dur={`${1 + Math.random()}s`} repeatCount="indefinite" begin={`${Math.random()}s`}>
                 <mpath href="#path-exp-evap" />
               </animateMotion>
             </circle>
          ))}

          {/* Animated Particles flowing through pipes */}
          {[...Array(3)].map((_, i) => (
             <circle key={`evap-comp-${i}`} r="3" fill="#cffafe" className="opacity-80">
               <animateMotion dur="2s" repeatCount="indefinite" begin={`${i * 0.6}s`}><mpath href="#path-evap-comp" /></animateMotion>
             </circle>
          ))}
          {[...Array(3)].map((_, i) => (
             <circle key={`comp-cond-${i}`} r="2" fill="#fee2e2" className="opacity-80">
               <animateMotion dur="1.5s" repeatCount="indefinite" begin={`${i * 0.5}s`}><mpath href="#path-comp-cond" /></animateMotion>
             </circle>
          ))}

          {/* === EXTERNAL WATER FLOWS === */}
          {/* Chilled Water Flow */}
          <path d="M -10 200 L 120 200" fill="none" stroke="#60a5fa" strokeWidth="6" strokeDasharray="10 5" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M 120 220 L -10 220" fill="none" stroke="#2563eb" strokeWidth="6" strokeDasharray="10 5" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="0" to="30" dur="1.5s" repeatCount="indefinite" />
          </path>
          <text x="5" y="193" className="fill-blue-300 text-[8px] font-bold">CHW IN (12°C)</text>
          <text x="5" y="235" className="fill-blue-500 text-[8px] font-bold">CHW OUT (7°C)</text>

          {/* Cooling Water Flow */}
          <path d="M 510 200 L 380 200" fill="none" stroke="#fca5a5" strokeWidth="6" strokeDasharray="10 5" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="0" to="30" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M 380 220 L 510 220" fill="none" stroke="#dc2626" strokeWidth="6" strokeDasharray="10 5" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <text x="420" y="193" className="fill-red-300 text-[8px] font-bold">CW IN (30°C)</text>
          <text x="420" y="235" className="fill-red-500 text-[8px] font-bold">CW OUT (35°C)</text>

          {/* === MAIN COMPONENTS === */}
          
          {/* Evaporator (Shell and Tube) */}
          <g onMouseEnter={() => setHovered("evaporator")} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
            <rect x="20" y="160" width="200" height="100" rx="20" fill="url(#evap-grad)" stroke={hovered === "evaporator" ? "#38bdf8" : "#0284c7"} strokeWidth="2" />
            <rect x="18" y="150" width="204" height="120" rx="22" fill="none" stroke="#38bdf8" strokeWidth="1" opacity={hovered === "evaporator" ? 1 : 0} className="transition-opacity duration-300" />
            
            {/* Heat exchange tubes animation */}
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="40" y1={180 + i*15} x2="200" y2={180 + i*15} stroke="#38bdf8" strokeWidth="2" opacity="0.3">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2 + i*0.2}s`} repeatCount="indefinite" />
              </line>
            ))}
            <text x="120" y="210" textAnchor="middle" className="fill-white text-[12px] font-black pointer-events-none drop-shadow-md tracking-wider">EVAPORATOR</text>
            
            {/* Boiling effect */}
            {[...Array(15)].map((_, i) => (
               <circle key={`boil-${i}`} cx={40 + Math.random()*160} cy={250} r={1 + Math.random()*2} fill="#bae6fd" opacity="0.6">
                 <animate attributeName="cy" from={250} to={170} dur={`${1 + Math.random()*2}s`} repeatCount="indefinite" />
                 <animate attributeName="opacity" values="0;0.8;0" dur={`${1 + Math.random()*2}s`} repeatCount="indefinite" />
               </circle>
            ))}
          </g>

          {/* Condenser (Shell and Tube) */}
          <g onMouseEnter={() => setHovered("condenser")} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
            <rect x="280" y="160" width="200" height="100" rx="20" fill="url(#cond-grad)" stroke={hovered === "condenser" ? "#f87171" : "#dc2626"} strokeWidth="2" />
            <rect x="278" y="150" width="204" height="120" rx="22" fill="none" stroke="#f87171" strokeWidth="1" opacity={hovered === "condenser" ? 1 : 0} className="transition-opacity duration-300" />
            
            {/* Heat exchange tubes */}
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="280" y1={180 + i*15} x2="460" y2={180 + i*15} stroke="#fca5a5" strokeWidth="2" opacity="0.3">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2 + i*0.2}s`} repeatCount="indefinite" />
              </line>
            ))}
            <text x="380" y="210" textAnchor="middle" className="fill-white text-[12px] font-black pointer-events-none drop-shadow-md tracking-wider">CONDENSER</text>
            
            {/* Condensing effect (droplets falling) */}
            {[...Array(15)].map((_, i) => (
               <circle key={`drop-${i}`} cx={300 + Math.random()*160} cy={170} r={1 + Math.random()*1.5} fill="#fca5a5" opacity="0.6">
                 <animate attributeName="cy" from={170} to={250} dur={`${0.5 + Math.random()}s`} repeatCount="indefinite" />
                 <animate attributeName="opacity" values="0;0.8;0" dur={`${0.5 + Math.random()}s`} repeatCount="indefinite" />
               </circle>
            ))}
          </g>

          {/* Expansion Valve */}
          <g onMouseEnter={() => setHovered("expansion")} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
            <polygon points="350,280 370,290 350,300 350,280" fill="#475569" stroke={hovered === "expansion" ? "#94a3b8" : "#334155"} strokeWidth="2" />
            <polygon points="330,280 350,290 330,300 330,280" fill="#334155" stroke={hovered === "expansion" ? "#94a3b8" : "#1e293b"} strokeWidth="2" />
            <circle cx="350" cy="290" r="4" fill="#94a3b8" />
            <circle cx="350" cy="290" r="6" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.5">
               <animate attributeName="r" values="4;10;4" dur="1s" repeatCount="indefinite" />
               <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite" />
            </circle>
            <text x="350" y="318" textAnchor="middle" className="fill-slate-400 text-[8px] font-bold uppercase pointer-events-none">EXV</text>
          </g>

          {/* Twin-Screw Compressor */}
          <g onMouseEnter={() => setHovered("compressor")} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
            <path d="M 270 50 Q 330 30 390 50 L 400 90 Q 330 110 260 90 Z" fill="url(#comp-grad)" stroke={hovered === "compressor" ? "#94a3b8" : "#475569"} strokeWidth="2" />
            <rect x="250" y="60" width="20" height="30" rx="4" fill="#1e293b" stroke="#334155" />
            <rect x="390" y="60" width="20" height="30" rx="4" fill="#1e293b" stroke="#334155" />
            
            {/* Spinning twin rotors */}
            <g transform="translate(310, 70)">
              <circle cx="0" cy="0" r="16" fill="#334155" stroke="#475569" strokeWidth="2" />
              <path d="M -12 0 Q 0 -10 12 0 Q 0 10 -12 0" fill="#94a3b8">
                 <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.2s" repeatCount="indefinite" />
              </path>
            </g>
            <g transform="translate(340, 70)">
              <circle cx="0" cy="0" r="16" fill="#334155" stroke="#475569" strokeWidth="2" />
              <path d="M -12 0 Q 0 -10 12 0 Q 0 10 -12 0" fill="#94a3b8">
                 <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="0.2s" repeatCount="indefinite" />
              </path>
            </g>

            <text x="330" y="105" textAnchor="middle" className="fill-slate-300 text-[10px] font-black pointer-events-none tracking-widest">COMPRESSOR</text>
            
            {/* Heat/Energy Glow */}
            {hovered === "compressor" && (
              <circle cx="330" cy="70" r="40" fill="url(#cond-grad)" className="mix-blend-screen opacity-30 blur-md pointer-events-none" />
            )}
          </g>

        </svg>

        {/* Dynamic Interactive Tooltip */}
        <div className="h-24 lg:h-20 mt-4 relative">
          {activeComp ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-xl flex flex-col justify-center"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${
                  activeComp.id === 'evaporator' ? 'bg-cyan-400' :
                  activeComp.id === 'condenser' ? 'bg-red-400' :
                  activeComp.id === 'compressor' ? 'bg-amber-400' : 'bg-slate-400'
                } animate-pulse`} />
                <h5 className="text-xs lg:text-sm font-black text-white">{activeComp.label}</h5>
              </div>
              <p className="text-[10px] lg:text-xs text-slate-300 leading-relaxed">{activeComp.desc}</p>
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center border border-slate-800/50 rounded-xl bg-slate-900/30">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                <span className="w-4 h-px bg-slate-600" />
                Hover on components to inspect
                <span className="w-4 h-px bg-slate-600" />
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
