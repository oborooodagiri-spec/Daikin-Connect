"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Building2, Star } from "lucide-react";

const offices = [
  { id: "surabaya", city: "Surabaya", type: "HEAD OFFICE", address: "Jl. Opak No.33, Darmo, Wonokromo 60241", phone: "+62-31-995 39 777", x: 62, y: 72 },
  { id: "jakarta", city: "Jakarta", type: "Branch", address: "L'Avenue Office Building Lt.25, Jl. Raya Pasar Minggu Kav.16, Pancoran 12780", phone: "+62-21-8066-7118", x: 48, y: 65 },
  { id: "semarang", city: "Semarang", type: "Branch", address: "Jl. Jendral Sudirman 75A, Jawa Tengah 50145", phone: "+62-61-8002 5528", x: 56, y: 68 },
  { id: "bali", city: "Bali", type: "Branch", address: "Pertokoan Gunung Soputan, Jl. Gunung Soputan No. 11B, Denpasar 80117", phone: "0361-485854", x: 68, y: 76 },
  { id: "medan", city: "Medan", type: "Branch", address: "Jl. Pinang Baris No.28, Komp. Imperium, Kel. Sunggal 20128", phone: "+62-61-8002 5528", x: 30, y: 30 },
  { id: "timika", city: "Timika", type: "Branch", address: "Jl. Cendrawasih Jalur SP 2, Papua 99910", phone: "+62-901-323 817", x: 90, y: 58 },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.5 } },
};

const pinVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

export default function IndonesiaMap() {
  const [activeOffice, setActiveOffice] = useState<string | null>(null);
  const active = offices.find((o) => o.id === activeOffice);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Desktop Map */}
      <motion.div
        className="hidden lg:block relative"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <svg viewBox="0 0 120 100" className="w-full h-auto" style={{ maxHeight: "500px" }}>
          {/* Simplified Indonesia outline */}
          <motion.path
            d="M15,35 Q20,30 28,32 L35,28 Q40,25 45,30 L50,35 Q52,38 48,42 L45,48 Q42,55 38,58 L35,60 Q30,62 25,58 L20,52 Q16,45 15,40 Z"
            fill="none" stroke="rgba(56,189,248,0.3)" strokeWidth="0.5"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {/* Sumatra */}
          <motion.path
            d="M20,25 Q25,20 30,22 L35,25 Q38,28 36,32 L33,38 Q30,42 27,45 L24,48 Q20,50 18,46 L16,40 Q14,35 16,30 Z"
            fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.25)" strokeWidth="0.4"
            initial={{ pathLength: 0, fillOpacity: 0 }} whileInView={{ pathLength: 1, fillOpacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          />
          {/* Java */}
          <motion.path
            d="M40,62 Q45,58 50,60 L58,62 Q62,63 66,65 L72,68 Q75,70 72,72 L65,73 Q58,73 50,72 L45,70 Q41,68 40,65 Z"
            fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.25)" strokeWidth="0.4"
            initial={{ pathLength: 0, fillOpacity: 0 }} whileInView={{ pathLength: 1, fillOpacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.3 }}
          />
          {/* Kalimantan */}
          <motion.path
            d="M50,30 Q55,25 62,28 L68,32 Q72,36 70,42 L67,48 Q64,52 58,50 L52,46 Q48,42 48,36 Z"
            fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.25)" strokeWidth="0.4"
            initial={{ pathLength: 0, fillOpacity: 0 }} whileInView={{ pathLength: 1, fillOpacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          {/* Sulawesi */}
          <motion.path
            d="M72,30 Q75,28 78,32 L80,38 Q81,42 78,45 L76,48 Q74,50 72,46 L71,40 Q70,35 72,32 Z"
            fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.25)" strokeWidth="0.4"
            initial={{ pathLength: 0, fillOpacity: 0 }} whileInView={{ pathLength: 1, fillOpacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.7 }}
          />
          {/* Papua */}
          <motion.path
            d="M85,35 Q90,30 95,35 L98,42 Q100,48 97,55 L93,60 Q88,63 85,58 L83,50 Q82,42 83,38 Z"
            fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.25)" strokeWidth="0.4"
            initial={{ pathLength: 0, fillOpacity: 0 }} whileInView={{ pathLength: 1, fillOpacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.9 }}
          />
          {/* Bali & NTB small */}
          <motion.path
            d="M68,72 Q70,70 73,72 L76,74 Q78,76 75,77 L71,76 Q68,75 68,73 Z"
            fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.25)" strokeWidth="0.3"
            initial={{ pathLength: 0, fillOpacity: 0 }} whileInView={{ pathLength: 1, fillOpacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 1, delay: 1.1 }}
          />

          {/* Office Pins */}
          {offices.map((office) => (
            <motion.g
              key={office.id}
              variants={pinVariants}
              onMouseEnter={() => setActiveOffice(office.id)}
              onMouseLeave={() => setActiveOffice(null)}
              className="cursor-pointer"
            >
              {/* Pulse ring */}
              <motion.circle
                cx={office.x} cy={office.y}
                r={office.type === "HEAD OFFICE" ? 3 : 2}
                fill="none"
                stroke={office.type === "HEAD OFFICE" ? "#f59e0b" : "#0073ea"}
                strokeWidth="0.3"
                animate={{ r: [office.type === "HEAD OFFICE" ? 3 : 2, office.type === "HEAD OFFICE" ? 5 : 4], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              {/* Pin dot */}
              <circle
                cx={office.x} cy={office.y}
                r={office.type === "HEAD OFFICE" ? 2 : 1.2}
                fill={office.type === "HEAD OFFICE" ? "#f59e0b" : "#0073ea"}
              />
              {/* Label */}
              <text
                x={office.x} y={office.y - (office.type === "HEAD OFFICE" ? 4 : 3)}
                textAnchor="middle"
                className="fill-white text-[3px] font-bold"
              >
                {office.city}
              </text>
            </motion.g>
          ))}
        </svg>

        {/* Tooltip */}
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-5 min-w-[300px] border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-2">
              {active.type === "HEAD OFFICE" ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Building2 className="w-4 h-4 text-[#0073ea]" />}
              <span className="text-sm font-black text-slate-800">{active.city}</span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{active.type}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{active.address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Phone className="w-3 h-3 shrink-0" />
              <span>{active.phone}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Mobile: List */}
      <motion.div
        className="lg:hidden space-y-3"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={containerVariants}
      >
        {offices.map((office) => (
          <motion.div
            key={office.id}
            variants={pinVariants}
            className={`rounded-xl p-4 border ${office.type === "HEAD OFFICE" ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {office.type === "HEAD OFFICE" ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <MapPin className="w-4 h-4 text-[#0073ea]" />}
              <span className="text-sm font-black text-slate-800">{office.city}</span>
              <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{office.type}</span>
            </div>
            <div className="text-[11px] text-slate-500 ml-6">{office.address}</div>
            <div className="text-[11px] text-slate-500 ml-6 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" /> {office.phone}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
