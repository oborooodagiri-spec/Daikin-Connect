"use client";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const companies = [
  { abbr: "DASI", name: "Daikin Applied Solutions Indonesia", year: 1993, desc: "Sales & Marketing of Large to Medium Sized HVAC", highlight: true },
  { abbr: "DID", name: "Daikin Airconditioning Indonesia", year: 2012, desc: "Sales & Marketing of AC to Medium Sized HVAC", highlight: false },
  { abbr: "DMID", name: "Daikin Manufacturing Indonesia", year: 1992, desc: "Manufacture Medium Sized HVAC", highlight: false },
  { abbr: "DIID", name: "Daikin Industries Indonesia", year: 2022, desc: "Manufacture AC to Medium Sized HVAC", highlight: false },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } },
};

export default function OrgChart() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="w-full max-w-6xl mx-auto px-4"
    >
      {/* Stats */}
      <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 lg:gap-12 mb-10 lg:mb-16">
        {[
          { value: 5, suffix: " T+", prefix: "IDR ", label: "Turnover" },
          { value: 2500, suffix: "+", label: "Karyawan" },
          { value: 50, suffix: "+", label: "Tahun di Indonesia" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl lg:text-4xl font-black text-[#0073ea]">
              <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
            </div>
            <div className="text-xs lg:text-sm font-bold text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Parent Node */}
      <motion.div variants={itemVariants} className="flex justify-center mb-6 lg:mb-8">
        <div className="bg-slate-900 text-white rounded-2xl px-6 py-4 lg:px-10 lg:py-6 text-center shadow-xl">
          <div className="text-lg lg:text-2xl font-black">Daikin Holdings Limited</div>
          <div className="text-xs lg:text-sm text-slate-300 mt-1">Osaka, Japan · Est. 1924</div>
        </div>
      </motion.div>

      {/* Connecting Line */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center mb-6 lg:mb-8"
      >
        <div className="w-px h-8 lg:h-12 bg-gradient-to-b from-slate-900 to-[#0073ea]" />
      </motion.div>

      {/* Desktop: Horizontal grid */}
      <div className="hidden lg:block">
        {/* Horizontal line */}
        <motion.div variants={itemVariants} className="relative h-px bg-[#0073ea] mx-auto" style={{ width: "75%" }}>
          {/* Vertical taps */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="absolute top-0 w-px h-6 bg-[#0073ea]" style={{ left: `${(i * 100) / 3}%` }} />
          ))}
        </motion.div>
        <div className="h-6" />
        <div className="grid grid-cols-4 gap-4" style={{ width: "75%", margin: "0 auto" }}>
          {companies.map((c) => (
            <motion.div
              key={c.abbr}
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,115,234,0.15)" }}
              className={`rounded-2xl p-5 text-center transition-all cursor-default ${
                c.highlight
                  ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-[#0073ea] shadow-lg ring-2 ring-blue-100"
                  : "bg-white border border-slate-200 shadow-md hover:border-blue-200"
              }`}
            >
              <div className={`text-2xl font-black ${c.highlight ? "text-[#0073ea]" : "text-slate-700"}`}>{c.abbr}</div>
              <div className="text-xs font-bold text-slate-500 mt-2 leading-snug">{c.name}</div>
              <div className={`text-[10px] font-black mt-2 px-3 py-1 rounded-full inline-block ${c.highlight ? "bg-[#0073ea] text-white" : "bg-slate-100 text-slate-600"}`}>Est. {c.year}</div>
              <div className="text-[10px] text-slate-400 mt-2 leading-relaxed">{c.desc}</div>
              {c.highlight && <div className="text-[9px] font-black text-[#0073ea] mt-2 uppercase tracking-widest">Parent of DSSI ★</div>}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical timeline */}
      <div className="lg:hidden space-y-4">
        {companies.map((c, i) => (
          <motion.div
            key={c.abbr}
            variants={itemVariants}
            className={`flex items-start gap-4 ${i < companies.length - 1 ? "pb-4" : ""}`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full ${c.highlight ? "bg-[#0073ea] ring-4 ring-blue-100" : "bg-slate-300"}`} />
              {i < companies.length - 1 && <div className="w-px h-full min-h-[60px] bg-slate-200" />}
            </div>
            <div className={`flex-1 rounded-xl p-4 ${c.highlight ? "bg-blue-50 border border-[#0073ea]" : "bg-slate-50 border border-slate-200"}`}>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-black ${c.highlight ? "text-[#0073ea]" : "text-slate-700"}`}>{c.abbr}</span>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Est. {c.year}</span>
              </div>
              <div className="text-xs font-bold text-slate-500 mt-1">{c.name}</div>
              <div className="text-[10px] text-slate-400 mt-1">{c.desc}</div>
              {c.highlight && <div className="text-[9px] font-black text-[#0073ea] mt-1 uppercase tracking-widest">Parent of DSSI ★</div>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
