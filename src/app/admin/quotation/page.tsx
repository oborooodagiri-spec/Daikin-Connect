"use client";

import { BookOpen, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function QuotationDashboard() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] font-['Inter'] selection:bg-blue-100 selection:text-blue-600">
      
      {/* Minimal Header */}
      <div className="bg-white border-b border-[#e6e9ef] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link 
            href="/home"
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-black text-[#1c1d22] tracking-tight">Pricing Hub</h1>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6"
        >
          
          {/* BoQ Builder */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white rounded-3xl border border-[#e6e9ef] p-6 lg:p-8 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(90,24,154,0.08)] hover:border-purple-200 transition-all duration-300 overflow-hidden flex items-center"
            onClick={() => router.push("/admin/quotation/boq-builder")}
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="w-14 h-14 bg-purple-50 text-[#7b2cbf] rounded-2xl flex items-center justify-center group-hover:bg-[#7b2cbf] group-hover:text-white transition-colors duration-300 flex-shrink-0 relative z-10">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            
            <div className="ml-5 flex-1 relative z-10">
              <h2 className="text-xl lg:text-2xl font-black text-[#1c1d22] tracking-tight group-hover:text-[#7b2cbf] transition-colors">
                BoQ Builder
              </h2>
            </div>
            
            <div className="text-slate-300 group-hover:text-[#7b2cbf] transition-colors relative z-10">
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Rate Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white rounded-3xl border border-[#e6e9ef] p-6 lg:p-8 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,115,234,0.08)] hover:border-blue-200 transition-all duration-300 overflow-hidden flex items-center"
            onClick={() => router.push("/admin/quotation/rate-card")}
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="w-14 h-14 bg-blue-50 text-[#0073ea] rounded-2xl flex items-center justify-center group-hover:bg-[#0073ea] group-hover:text-white transition-colors duration-300 flex-shrink-0 relative z-10">
              <Briefcase size={24} strokeWidth={2.5} />
            </div>
            
            <div className="ml-5 flex-1 relative z-10">
              <h2 className="text-xl lg:text-2xl font-black text-[#1c1d22] tracking-tight group-hover:text-[#0073ea] transition-colors">
                Rate Card
              </h2>
            </div>
            
            <div className="text-slate-300 group-hover:text-[#0073ea] transition-colors relative z-10">
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
