"use client";
import { motion } from "framer-motion";
import { Shield, BarChart3, Zap, HeartHandshake, Package, Hammer, Settings, Wind } from "lucide-react";

const services = [
  { 
    id: "preventive",
    icon: Shield, 
    title: "Preventive Maintenance", 
    desc: "Perawatan berkala terjadwal untuk menjaga performa optimal unit chiller Anda."
  },
  { 
    id: "predictive",
    icon: BarChart3, 
    title: "Predictive Maintenance", 
    desc: "Analisis data prediktif untuk mengantisipasi kerusakan sebelum terjadi."
  },
  { 
    id: "corrective",
    icon: Zap, 
    title: "Corrective Maintenance", 
    desc: "Perbaikan cepat dan tepat untuk mengatasi gangguan operasional unit."
  },
  { 
    id: "aftersales",
    icon: HeartHandshake, 
    title: "After Sales Services", 
    desc: "Layanan purna jual komprehensif untuk kepuasan pelanggan jangka panjang."
  },
  { 
    id: "spareparts",
    icon: Package, 
    title: "Spare Parts", 
    desc: "Penyediaan suku cadang original Daikin dengan jaminan kualitas terbaik."
  },
  { 
    id: "improvement",
    icon: Hammer, 
    title: "Chiller Improvement", 
    desc: "Peningkatan dan modernisasi sistem chiller plant Anda."
  },
  { 
    id: "optimization",
    icon: Settings, 
    title: "Plant Optimization", 
    desc: "Optimasi kontrol untuk efisiensi energi dan penghematan biaya operasional."
  },
  { 
    id: "iaq",
    icon: Wind, 
    title: "Indoor Air Quality", 
    desc: "Layanan kualitas udara dalam ruangan untuk lingkungan kerja yang sehat."
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ServiceShowcaseCarousel() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 lg:mt-12">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="group relative bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Subtle background glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0073ea]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#0073ea]/10 rounded-full blur-3xl group-hover:bg-[#0073ea]/20 transition-colors duration-500" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0073ea] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0073ea] group-hover:text-white transition-all duration-300 shadow-sm">
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-3 group-hover:text-[#0073ea] transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                  {service.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
