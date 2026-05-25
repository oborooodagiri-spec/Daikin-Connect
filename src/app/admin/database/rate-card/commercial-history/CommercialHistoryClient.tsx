"use client";

import React, { useState } from "react";
import { Building2, FileText, Printer, ChevronRight, Clock, ShieldCheck, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CommercialHistoryClient({ projects }: { projects: any[] }) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Helper function to format currency
  const fmtCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const fmtDate = (dStr: string) => {
    if (!dStr) return "-";
    return new Date(dStr).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // If a project is selected, show its documents
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <button 
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#0073ea] transition-colors"
          >
            <ChevronLeft size={16} /> Kembali ke Daftar Proyek
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-[#0073ea] rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">{selectedProject.name}</h1>
                <p className="text-sm font-medium text-slate-500">{selectedProject.customers?.name || "No Customer Linked"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Riwayat Work Order & Quotation</h2>
            </div>
            
            <div className="p-0">
              {(!selectedProject.work_orders || selectedProject.work_orders.length === 0) ? (
                <div className="p-12 text-center text-slate-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Belum ada dokumen komersial untuk proyek ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {selectedProject.work_orders.map((wo: any) => (
                    <div key={wo.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              WO
                            </span>
                            <span className="font-bold text-slate-700">{wo.wo_number}</span>
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <Clock size={12} /> {fmtDate(wo.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">PIC: <span className="font-semibold">{wo.pic_name || "-"}</span></p>
                        </div>
                      </div>

                      {/* Quotations under this WO */}
                      {wo.quotations && wo.quotations.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-emerald-100 space-y-3">
                          {wo.quotations.map((quo: any) => (
                            <div key={quo.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded uppercase tracking-widest">
                                    Quotation
                                  </span>
                                  <span className="font-bold text-slate-800 text-sm">{quo.quo_number}</span>
                                </div>
                                <div className="text-lg font-black text-emerald-600">
                                  {fmtCurrency(parseFloat(quo.grand_total))}
                                </div>
                              </div>
                              
                              <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                                {/* Print Quotation Action (Visual Only For Now) */}
                                <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors">
                                  <Printer size={14} /> Cetak Ulang Quotation
                                </button>
                                
                                {quo.sla ? (
                                  <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 transition-all">
                                    <ShieldCheck size={14} /> Cetak Ulang SLA
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 bg-slate-50 rounded-lg">
                                    Tidak Ada SLA
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------
  // Project List View
  // -------------------------
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Riwayat Dokumen Komersial</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Pilih proyek untuk melihat riwayat Work Order, Quotation, dan SLA.</p>
          </div>
          <Link 
            href="/admin/database/rate-card/quotation"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0073ea] hover:bg-[#0060c5] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
          >
            <FileText size={16} /> Buat Penawaran Baru
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const woCount = project.work_orders?.length || 0;
            const hasActivity = woCount > 0;

            return (
              <div 
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`group bg-white border ${hasActivity ? 'border-slate-200 hover:border-[#0073ea] cursor-pointer' : 'border-slate-100 opacity-60'} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasActivity ? 'bg-blue-50 text-[#0073ea]' : 'bg-slate-100 text-slate-400'}`}>
                    <Building2 size={20} />
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-300 group-hover:text-[#0073ea] group-hover:bg-blue-50 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
                
                <h3 className="text-base font-black text-slate-800 line-clamp-1">{project.name}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">{project.customers?.name || "Umum"}</p>
                
                <div className="mt-auto pt-4 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <FileText size={14} className={hasActivity ? "text-emerald-500" : ""} />
                    {woCount} Work Orders
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
