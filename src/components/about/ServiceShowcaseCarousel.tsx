"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BarChart3, Zap, HeartHandshake, Package, Hammer, Settings, Wind, ChevronRight, ChevronLeft } from "lucide-react";

const services = [
  { 
    id: "preventive",
    icon: Shield, 
    title: "Preventive Maintenance", 
    desc: "Perawatan berkala terjadwal untuk menjaga performa optimal unit chiller Anda.",
    image: "/services/preventive.jpg"
  },
  { 
    id: "predictive",
    icon: BarChart3, 
    title: "Predictive Maintenance", 
    desc: "Analisis data prediktif untuk mengantisipasi kerusakan sebelum terjadi.",
    image: "/services/predictive.jpg"
  },
  { 
    id: "corrective",
    icon: Zap, 
    title: "Corrective Maintenance", 
    desc: "Perbaikan cepat dan tepat untuk mengatasi gangguan operasional unit.",
    image: "/services/corrective.jpg"
  },
  { 
    id: "aftersales",
    icon: HeartHandshake, 
    title: "After Sales Services", 
    desc: "Layanan purna jual komprehensif untuk kepuasan pelanggan jangka panjang.",
    image: "/services/aftersales.jpg"
  },
  { 
    id: "spareparts",
    icon: Package, 
    title: "Spare Parts", 
    desc: "Penyediaan suku cadang original Daikin dengan jaminan kualitas terbaik.",
    image: "/services/spareparts.jpg"
  },
  { 
    id: "improvement",
    icon: Hammer, 
    title: "Chiller Improvement", 
    desc: "Peningkatan dan modernisasi sistem chiller plant Anda.",
    image: "/services/improvement.jpg"
  },
  { 
    id: "optimization",
    icon: Settings, 
    title: "Plant Optimization", 
    desc: "Optimasi kontrol untuk efisiensi energi dan penghematan biaya operasional.",
    image: "/services/optimization.jpg"
  },
  { 
    id: "iaq",
    icon: Wind, 
    title: "Indoor Air Quality", 
    desc: "Layanan kualitas udara dalam ruangan untuk lingkungan kerja yang sehat.",
    image: "/services/iaq.jpg"
  },
];

export default function ServiceShowcaseCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % services.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeService = services[activeIndex];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 mt-10">
      <div 
        className="relative w-full rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl flex flex-col lg:flex-row h-[700px] lg:h-[600px]"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Left Side: Navigation / List */}
        <div className="w-full lg:w-[400px] bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col h-[140px] lg:h-full z-20">
          <div className="p-6 border-b border-white/10 hidden lg:block">
            <h3 className="text-xl font-black text-white">Our Services</h3>
            <p className="text-xs text-slate-400 mt-1">Select a category to explore</p>
          </div>
          
          <div className="flex-1 overflow-x-auto lg:overflow-y-auto custom-scrollbar flex lg:flex-col p-4 gap-2 items-center lg:items-stretch">
            {services.map((service, idx) => {
              const Icon = service.icon;
              const isActive = idx === activeIndex;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-4 p-3 lg:p-4 rounded-xl transition-all duration-300 text-left
                    ${isActive 
                      ? "bg-gradient-to-r from-[#0073ea]/80 to-blue-600/80 shadow-lg border border-white/20" 
                      : "hover:bg-white/10 border border-transparent"}
                  `}
                >
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors
                    ${isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}
                  `}>
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div className="hidden lg:block">
                    <h4 className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-300"}`}>{service.title}</h4>
                  </div>
                  {/* Mobile title for active item only */}
                  <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isActive ? "w-auto opacity-100 ml-2" : "w-0 opacity-0"}`}>
                    <h4 className="text-xs font-bold text-white whitespace-nowrap pr-2">{service.title}</h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Image and Content Area */}
        <div className="flex-1 relative h-full overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={activeService.image} 
                alt={activeService.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent lg:bg-gradient-to-r lg:from-black/80 lg:via-black/20 lg:to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Text Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-16 z-20 pointer-events-none pb-24 lg:pb-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${activeService.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest mb-4 shadow-xl">
                  <activeService.icon className="w-3 h-3" />
                  Service Category
                </div>
                <h2 className="text-3xl lg:text-6xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                  {activeService.title}
                </h2>
                <p className="text-sm lg:text-lg text-slate-200 leading-relaxed drop-shadow-md">
                  {activeService.desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls Overlay */}
          <div className="absolute bottom-6 right-6 lg:bottom-12 lg:right-12 z-30 flex gap-3">
            <button 
              onClick={() => setActiveIndex((prev) => (prev - 1 + services.length) % services.length)}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#0073ea] hover:border-[#0073ea] transition-all"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
            <button 
              onClick={() => setActiveIndex((prev) => (prev + 1) % services.length)}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#0073ea] hover:border-[#0073ea] transition-all"
            >
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}
