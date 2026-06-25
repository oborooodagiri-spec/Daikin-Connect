"use client";

import { BookOpen, Briefcase, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function QuotationDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fafbfc] font-['Inter'] pb-24">
      {/* Premium Header */}
      <div className="bg-white border-b border-[#e6e9ef] pt-12 pb-10 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-md text-xs font-black tracking-widest uppercase shadow-md shadow-slate-200">
              Quotation & Rates
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#1c1d22] tracking-tight mb-2">
            Pricing Hub
          </h1>
          <p className="text-[#676879] text-base font-medium max-w-2xl">
            Kelola Bill of Quantity (BoQ), Master Pricelist, dan Official Rate Cards untuk kemudahan proses penawaran harga Anda secara tersentralisasi.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* BoQ Builder & Pricelist */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group bg-white rounded-[24px] border border-[#e6e9ef] overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(90,24,154,0.1)] hover:border-purple-200"
            onClick={() => router.push("/admin/quotation/boq-builder")}
          >
            <div className="h-32 bg-gradient-to-br from-[#5a189a] via-[#7b2cbf] to-[#9d4edd] relative overflow-hidden">
              <div className="absolute -right-6 -top-10 opacity-20">
                <BookOpen size={180} />
              </div>
              <div className="absolute inset-0 bg-black/10" />
            </div>
            
            <div className="p-8 relative">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100 absolute -top-8 border border-purple-50 text-[#7b2cbf]">
                <BookOpen size={28} strokeWidth={2.5} />
              </div>
              
              <div className="mt-8 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-[#1c1d22] tracking-tight mb-3 group-hover:text-[#7b2cbf] transition-colors">
                    EPL BoQ Builder & Pricelist
                  </h2>
                  <p className="text-[#676879] font-medium leading-relaxed text-sm">
                    Buat dan kelola Bill of Quantity (BoQ) untuk banyak project secara dinamis. Sudah terintegrasi langsung dengan database Master Pricelist material dan komponen.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-50 group-hover:text-[#7b2cbf] transition-all flex-shrink-0 ml-4">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rate Card Maintenance */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group bg-white rounded-[24px] border border-[#e6e9ef] overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,115,234,0.1)] hover:border-blue-200"
            onClick={() => router.push("/admin/quotation/rate-card")}
          >
            <div className="h-32 bg-gradient-to-br from-[#005bb5] via-[#0073ea] to-[#4db8ff] relative overflow-hidden">
              <div className="absolute -right-6 -top-10 opacity-20">
                <Briefcase size={180} />
              </div>
              <div className="absolute inset-0 bg-black/10" />
            </div>
            
            <div className="p-8 relative">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 absolute -top-8 border border-blue-50 text-[#0073ea]">
                <Briefcase size={28} strokeWidth={2.5} />
              </div>
              
              <div className="mt-8 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-[#1c1d22] tracking-tight mb-3 group-hover:text-[#0073ea] transition-colors">
                    Rate Card Maintenance
                  </h2>
                  <p className="text-[#676879] font-medium leading-relaxed text-sm">
                    Akses dan kelola Buku Tarif Satuan (Rate Card) resmi untuk penawaran layanan pemeliharaan rutin, kontrak unit price, dan SLA VES.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#0073ea] transition-all flex-shrink-0 ml-4">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
