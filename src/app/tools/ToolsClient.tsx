"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Thermometer,
  Wind,
  Gauge,
  PipetteIcon,
  Wrench,
  Zap,
  Snowflake,
  Ruler,
  X,
  Info,
} from "lucide-react";
import StaticLogo from "@/components/ui/StaticLogo";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  href: string;
  active: boolean;
}

const TOOLS: Tool[] = [
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "CMH↔CFM, Velocity, Pressure, Pipe Size, dan lainnya",
    icon: <ArrowLeftRight size={24} />,
    gradient: "linear-gradient(135deg, #0073ea 0%, #00a1e4 100%)",
    href: "/tools/unit-converter",
    active: true,
  },
  {
    id: "psychrometric",
    name: "Psychrometric",
    description: "Kalkulator properti udara lembab dengan grafik interaktif",
    icon: <Thermometer size={24} />,
    gradient: "linear-gradient(135deg, #e44258 0%, #ff6b81 100%)",
    href: "/tools/psychrometric",
    active: true,
  },
  {
    id: "air-mixing",
    name: "Air Mixing",
    description: "Hitung kondisi udara campuran dari 2 aliran udara",
    icon: <Wind size={24} />,
    gradient: "linear-gradient(135deg, #00c875 0%, #00e68a 100%)",
    href: "/tools/air-mixing",
    active: true,
  },
  {
    id: "duct-sizer",
    name: "Duct Sizer",
    description: "Kalkulasi dimensi dan velocity duct berdasarkan air flow",
    icon: <Ruler size={24} />,
    gradient: "linear-gradient(135deg, #fdab3d 0%, #ffc107 100%)",
    href: "/tools/duct-sizer",
    active: true,
  },
  {
    id: "refrigerant-pt",
    name: "Refrigerant P-T",
    description: "Tabel Pressure-Temperature untuk R-32, R-410A, R-134a",
    icon: <Snowflake size={24} />,
    gradient: "linear-gradient(135deg, #579bfc 0%, #a25ddc 100%)",
    href: "/tools/refrigerant-pt",
    active: true,
  },
  {
    id: "chilled-water",
    name: "Piping",
    description: "Sizing pipa dan flow rate untuk sistem piping",
    icon: <PipetteIcon size={24} />,
    gradient: "linear-gradient(135deg, #00c2ff 0%, #0073ea 100%)",
    href: "/tools/chilled-water",
    active: true,
  },
  {
    id: "heat-load",
    name: "Heat Load",
    description: "Estimasi cepat beban pendinginan ruangan",
    icon: <Zap size={24} />,
    gradient: "linear-gradient(135deg, #ff642e 0%, #fdab3d 100%)",
    href: "/tools/heat-load",
    active: true,
  },
  {
    id: "electrical-calc",
    name: "Electrical",
    description: "Konversi daya, arus, tegangan, dan power factor",
    icon: <Gauge size={24} />,
    gradient: "linear-gradient(135deg, #a25ddc 0%, #c084fc 100%)",
    href: "/tools/electrical",
    active: true,
  },
];

export default function ToolsClient() {
  const router = useRouter();

  const handleToolClick = (tool: Tool) => {
    router.push(tool.href);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <StaticLogo size={28} />
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0073ea] to-[#00a1e4] flex items-center justify-center text-white">
                <Wrench size={16} />
              </div>
              <div>
                <h1 className="text-sm font-black text-[#323338] uppercase tracking-wide leading-none">HVAC Tools</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Engineering Suite</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.close()}
            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 md:mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-black text-[#323338] tracking-tight leading-tight uppercase">
            Engineering<br />
            <span className="text-slate-300">Toolkit</span>
          </h2>
        </motion.div>

        {/* Engineering Tools Grid Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="px-3 py-1.5 bg-[#0073ea] text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
            Engineering Tools
          </div>
          <div className="h-px flex-1 bg-slate-100" />
        </motion.div>

        {/* Tools Grid - All Active */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              onClick={() => handleToolClick(tool)}
              className="group relative bg-white border border-[#e6e9ef] rounded-[1.5rem] p-4 md:p-6 cursor-pointer transition-all duration-300 hover:border-[#0073ea]/30 hover:shadow-xl hover:shadow-blue-100/40 hover:-translate-y-1 active:scale-[0.97]"
            >
              {/* Icon */}
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-3 md:mb-4 shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: tool.gradient,
                  boxShadow: `0 8px 20px ${
                    tool.gradient.includes("#0073ea")
                      ? "rgba(0,115,234,0.25)"
                      : tool.gradient.includes("#e44258")
                      ? "rgba(228,66,88,0.25)"
                      : tool.gradient.includes("#00c875")
                      ? "rgba(0,200,117,0.25)"
                      : tool.gradient.includes("#fdab3d")
                      ? "rgba(253,171,61,0.25)"
                      : tool.gradient.includes("#579bfc")
                      ? "rgba(87,155,252,0.25)"
                      : tool.gradient.includes("#00c2ff")
                      ? "rgba(0,194,255,0.25)"
                      : tool.gradient.includes("#ff642e")
                      ? "rgba(255,100,46,0.25)"
                      : "rgba(162,93,220,0.25)"
                  }`,
                }}
              >
                {tool.icon}
              </div>

              {/* Name */}
              <h3 className="text-xs md:text-sm font-black text-[#323338] uppercase tracking-tight leading-tight mb-0">
                {tool.name}
              </h3>

              {/* Active indicator dot */}
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#00c875] shadow-sm shadow-emerald-200" />
            </motion.div>
          ))}
        </div>

        {/* References / Acuan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 mb-8 bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6"
        >
          <div className="flex items-center gap-2 mb-3 text-[#0073ea]">
            <Info size={14} className="shrink-0" />
            <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">Sumber Data & Acuan</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Psychrometrics & Air Mixing</h5>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                Formulasi berdasarkan <strong>ASHRAE Handbook of Fundamentals</strong>. Perhitungan saturasi tekanan uap air menggunakan persamaan <strong>August-Roche-Magnus</strong> dengan asumsi tekanan atmosfer standar (101.325 kPa).
              </p>
            </div>
            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duct Sizer & Piping</h5>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                Kalkulasi diameter ekuivalen duct menggunakan formula <strong>Huebscher</strong>. Sizing piping didasarkan pada diagram friksi <strong>Hazen-Williams</strong> dan kecepatan aliran rekomendasi ASHRAE.
              </p>
            </div>
            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Heat Load Estimator</h5>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                Metode kalkulasi cepat beban panas berdasarkan CLTD (Cooling Load Temperature Difference) yang disederhanakan untuk selubung bangunan, solar gain, beban peralatan, beban hunian manusia (sensible/latent), serta ventilation airflow.
              </p>
            </div>
            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Electrical & Cable Sizer</h5>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                Perhitungan arus nominal beban 1-Phase / 3-Phase berdasar cos φ beban induktif motor. Rekomendasi minimum luas penampang kabel mengacu pada standar <strong>PUIL / IEC 60364</strong> dengan continuous load safety factor 125%.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            EPL Link · HVAC Engineering Suite
          </p>
          <p className="text-[10px] font-bold text-slate-300">© 2026</p>
        </div>
      </footer>
    </div>
  );
}
