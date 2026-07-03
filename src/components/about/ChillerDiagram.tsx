"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const components = [
  { id: "compressor", label: "Compressor", desc: "Memampatkan refrigeran bertekanan rendah menjadi gas bertekanan tinggi dan bersuhu tinggi.", x: 340, y: 280, w: 100, h: 60 },
  { id: "condenser", label: "Condenser", desc: "Mengubah refrigeran gas menjadi cairan dengan membuang panas ke air pendingin (cooling water).", x: 340, y: 40, w: 100, h: 60 },
  { id: "expansion", label: "Expansion Valve", desc: "Menurunkan tekanan refrigeran cair sehingga suhunya turun drastis sebelum masuk evaporator.", x: 60, y: 170, w: 100, h: 40 },
  { id: "evaporator", label: "Evaporator", desc: "Menyerap panas dari air dingin (chilled water) sehingga refrigeran menguap kembali menjadi gas.", x: 60, y: 40, w: 100, h: 60 },
];

export default function ChillerDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);
  const activeComp = components.find((c) => c.id === hovered);

  return (
    <motion.div
      className="w-full max-w-xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-2xl">
        <h4 className="text-center text-xs lg:text-sm font-black text-cyan-400 uppercase tracking-widest mb-4">Water-Cooled Chiller System</h4>
        
        <svg viewBox="0 0 500 380" className="w-full h-auto">
          {/* Refrigerant Flow Pipes */}
          {/* Evaporator -> Compressor (bottom, low pressure gas) */}
          <motion.line x1="110" y1="100" x2="110" y2="290" stroke="rgba(34,211,238,0.4)" strokeWidth="2" strokeDasharray="8 4"
            animate={{ strokeDashoffset: [0, -24] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
          <motion.line x1="110" y1="290" x2="340" y2="290" stroke="rgba(34,211,238,0.4)" strokeWidth="2" strokeDasharray="8 4"
            animate={{ strokeDashoffset: [0, -24] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
          
          {/* Compressor -> Condenser (right, high pressure gas) */}
          <motion.line x1="440" y1="280" x2="440" y2="100" stroke="rgba(239,68,68,0.4)" strokeWidth="2" strokeDasharray="8 4"
            animate={{ strokeDashoffset: [0, 24] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
          
          {/* Condenser -> Expansion Valve (top, high pressure liquid) */}
          <motion.line x1="340" y1="70" x2="160" y2="70" stroke="rgba(59,130,246,0.4)" strokeWidth="2" strokeDasharray="8 4"
            animate={{ strokeDashoffset: [0, 24] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
          <motion.line x1="110" y1="70" x2="110" y2="170" stroke="rgba(59,130,246,0.4)" strokeWidth="2" strokeDasharray="8 4"
            animate={{ strokeDashoffset: [0, 24] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />

          {/* Expansion Valve -> Evaporator */}
          <motion.line x1="110" y1="170" x2="110" y2="100" stroke="rgba(34,211,238,0.3)" strokeWidth="2" strokeDasharray="6 6"
            animate={{ strokeDashoffset: [0, 24] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />

          {/* Flow labels */}
          <text x="75" y="200" className="fill-cyan-500/50 text-[8px] font-bold" transform="rotate(-90, 75, 200)">LOW PRESSURE</text>
          <text x="465" y="200" className="fill-red-400/50 text-[8px] font-bold" transform="rotate(90, 465, 200)">HIGH PRESSURE</text>

          {/* Chilled Water Flow (through evaporator) */}
          <motion.line x1="20" y1="55" x2="60" y2="55" stroke="rgba(147,197,253,0.5)" strokeWidth="3"
            animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.line x1="160" y1="55" x2="200" y2="55" stroke="rgba(96,165,250,0.5)" strokeWidth="3"
            animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <text x="8" y="48" className="fill-blue-300/60 text-[7px]">Chilled Water In</text>
          <text x="162" y="48" className="fill-blue-400/60 text-[7px]">Chilled Water Out</text>

          {/* Cooling Water Flow (through condenser) */}
          <motion.line x1="300" y1="55" x2="340" y2="55" stroke="rgba(252,165,165,0.5)" strokeWidth="3"
            animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.line x1="440" y1="55" x2="480" y2="55" stroke="rgba(248,113,113,0.5)" strokeWidth="3"
            animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <text x="282" y="48" className="fill-red-300/60 text-[7px]">Cooling Water In</text>
          <text x="442" y="48" className="fill-red-400/60 text-[7px]">Cooling Water Out</text>

          {/* Components */}
          {components.map((comp) => (
            <g key={comp.id}
              onMouseEnter={() => setHovered(comp.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <motion.rect
                x={comp.x} y={comp.y} width={comp.w} height={comp.h}
                rx="8" fill="rgba(15,23,42,0.8)"
                stroke={hovered === comp.id ? "#22d3ee" : "rgba(56,189,248,0.3)"}
                strokeWidth={hovered === comp.id ? 2 : 1}
                animate={comp.id === "compressor" ? { filter: ["drop-shadow(0 0 4px rgba(34,211,238,0.3))", "drop-shadow(0 0 12px rgba(34,211,238,0.6))", "drop-shadow(0 0 4px rgba(34,211,238,0.3))"] } : {}}
                transition={comp.id === "compressor" ? { duration: 2, repeat: Infinity } : {}}
              />
              <text
                x={comp.x + comp.w / 2} y={comp.y + comp.h / 2 + 1}
                textAnchor="middle" dominantBaseline="middle"
                className="fill-cyan-300 text-[10px] font-bold pointer-events-none"
              >
                {comp.label}
              </text>
              {comp.id === "compressor" && (
                <motion.circle
                  cx={comp.x + comp.w / 2} cy={comp.y + comp.h / 2 + 14}
                  r="4" fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth="1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: `${comp.x + comp.w / 2}px ${comp.y + comp.h / 2 + 14}px` }}
                />
              )}
            </g>
          ))}

          {/* Direction arrows */}
          <polygon points="225,295 235,290 235,300" fill="rgba(34,211,238,0.5)" />
          <polygon points="250,65 240,60 240,70" fill="rgba(59,130,246,0.5)" />
          <polygon points="445,190 450,180 440,180" fill="rgba(239,68,68,0.4)" />
        </svg>

        {/* Tooltip */}
        {activeComp && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white text-slate-800 rounded-xl px-4 py-3 shadow-xl max-w-[280px] z-10"
          >
            <div className="text-xs font-black text-[#0073ea] mb-1">{activeComp.label}</div>
            <div className="text-[10px] text-slate-600 leading-relaxed">{activeComp.desc}</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
