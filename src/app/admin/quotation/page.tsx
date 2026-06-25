"use client";

import { motion } from "framer-motion";
import { BookOpen, Briefcase, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuotationDashboard() {
  const router = useRouter();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen pb-24">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#323338] tracking-tight uppercase">Quotation & Rates</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage BoQ and Official Rate Cards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* BoQ Builder Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white border border-[#e6e9ef] rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-[#0073ea]/30 transition-all cursor-pointer group"
          onClick={() => router.push("/admin/quotation/boq-builder")}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5a189a] to-[#7b2cbf] flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <BookOpen size={28} strokeWidth={2.5} />
            </div>
            <div className="p-2 bg-slate-50 text-slate-400 rounded-full group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
              <ChevronRight size={20} />
            </div>
          </div>
          <h2 className="text-xl font-black text-[#323338] uppercase tracking-tight mb-2 group-hover:text-purple-700 transition-colors">
            EPL BoQ Builder
          </h2>
          <p className="text-sm font-bold text-slate-500 leading-relaxed">
            Buat dan kelola Bill of Quantity (BoQ) proyek dengan sistem penawaran harga dinamis berbasis master pricelist.
          </p>
        </motion.div>

        {/* Rate Card Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white border border-[#e6e9ef] rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-[#0073ea]/30 transition-all cursor-pointer group"
          onClick={() => router.push("/admin/quotation/rate-card")}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0073ea] to-[#00a1e4] flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Briefcase size={28} strokeWidth={2.5} />
            </div>
            <div className="p-2 bg-slate-50 text-slate-400 rounded-full group-hover:bg-blue-50 group-hover:text-[#0073ea] transition-colors">
              <ChevronRight size={20} />
            </div>
          </div>
          <h2 className="text-xl font-black text-[#323338] uppercase tracking-tight mb-2 group-hover:text-[#0073ea] transition-colors">
            Rate Card Maintenance
          </h2>
          <p className="text-sm font-bold text-slate-500 leading-relaxed">
            Akses dan kelola Buku Tarif Satuan (Rate Card) resmi untuk pemeliharaan rutin, kontrak unit price, dan layanan SLA VES.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
