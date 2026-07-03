"use client";
import { motion } from "framer-motion";
import { Shield, BarChart3, Zap, HeartHandshake, Package, Hammer, Settings, Wind } from "lucide-react";

const services = [
  { icon: Shield, title: "Preventive Maintenance", desc: "Perawatan berkala terjadwal untuk menjaga performa optimal unit chiller Anda." },
  { icon: BarChart3, title: "Predictive Maintenance", desc: "Analisis data prediktif untuk mengantisipasi kerusakan sebelum terjadi." },
  { icon: Zap, title: "Corrective Maintenance", desc: "Perbaikan cepat dan tepat untuk mengatasi gangguan operasional unit." },
  { icon: HeartHandshake, title: "After Sales Services", desc: "Layanan purna jual komprehensif untuk kepuasan pelanggan jangka panjang." },
  { icon: Package, title: "Spare Parts", desc: "Penyediaan suku cadang original Daikin dengan jaminan kualitas terbaik." },
  { icon: Hammer, title: "Chiller Improvement", desc: "Peningkatan dan modernisasi sistem chiller plant Anda." },
  { icon: Settings, title: "Plant Optimization", desc: "Optimasi kontrol untuk efisiensi energi dan penghematan biaya operasional." },
  { icon: Wind, title: "Indoor Air Quality", desc: "Layanan kualitas udara dalam ruangan untuk lingkungan kerja yang sehat." },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ServiceGrid() {
  return (
    <motion.div
      className="w-full max-w-6xl mx-auto px-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group relative bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 lg:p-6 cursor-default
                hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:border-[#0073ea]/30 hover:shadow-xl
                transition-colors duration-300"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-[#0073ea]/10 to-cyan-500/10 flex items-center justify-center mb-3 lg:mb-4
                group-hover:from-[#0073ea] group-hover:to-cyan-500 transition-all duration-300">
                <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-[#0073ea] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xs lg:text-sm font-black text-slate-800 mb-1 lg:mb-2">{service.title}</h3>
              <p className="text-[10px] lg:text-xs text-slate-500 leading-relaxed">{service.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
