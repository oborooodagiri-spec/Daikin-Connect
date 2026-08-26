import React, { useState } from "react";
import { X } from "lucide-react";
import { DealData } from "@/app/actions/pipeline";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deal: DealData | null;
  formatRp: (val: number) => string;
  onFullClose: (deal: DealData) => Promise<void>;
  onPartialClose: (deal: DealData, amount: number) => Promise<void>;
}

export default function PartialCloseModal({ isOpen, onClose, deal, formatRp, onFullClose, onPartialClose }: Props) {
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !deal) return null;

  const totalQuotation = Number(deal.quotation || 0);
  const numAmount = Number(partialAmount.replace(/\D/g, ""));
  
  const pct = totalQuotation > 0 ? ((numAmount / totalQuotation) * 100).toFixed(2) : 0;
  
  const isValidPartial = numAmount > 0 && numAmount < totalQuotation;

  const handleFullClose = async () => {
    setIsSubmitting(true);
    await onFullClose(deal);
    setIsSubmitting(false);
    onClose();
  };

  const handlePartialClose = async () => {
    if (!isValidPartial) return;
    setIsSubmitting(true);
    await onPartialClose(deal, numAmount);
    setIsSubmitting(false);
    setPartialAmount("");
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleOverlayClick}>
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md overflow-hidden" style={{ animation: "slideUp 0.3s ease-out" }}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Close Project</h2>
            <p className="text-sm text-gray-500 font-medium truncate max-w-[300px] mt-1">{deal.project_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Quotation</p>
            <p className="text-xl font-black text-slate-800">{formatRp(totalQuotation)}</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700">Metode closing</p>
            
            <button 
              onClick={handleFullClose}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-200 transition-all text-left group disabled:opacity-50"
            >
              <div>
                <p className="font-bold text-emerald-800">Full Close</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-emerald-700 font-black text-xs">✓</span>
              </div>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400 font-bold uppercase tracking-widest">Atau</span>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl border-2 border-amber-100 bg-amber-50/50">
              <div>
                <p className="font-bold text-amber-800">Partial Close</p>
              </div>
              
              <div className="pt-2 relative">
                <span className="absolute left-3 top-[18px] text-gray-500 font-bold">Rp</span>
                <input 
                  type="text" 
                  value={partialAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setPartialAmount(raw ? Number(raw).toLocaleString("id-ID") : "");
                  }}
                  placeholder="Masukkan nominal..."
                  className="w-full pl-9 pr-16 py-2.5 rounded-lg border-amber-200 bg-white font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                />
                <span className="absolute right-3 top-[19px] text-xs font-black text-amber-500 bg-amber-100 px-1.5 py-0.5 rounded">
                  {numAmount > 0 ? `${pct}%` : "0%"}
                </span>
              </div>

              <button 
                onClick={handlePartialClose}
                disabled={!isValidPartial || isSubmitting}
                className="w-full py-2.5 rounded-lg font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 disabled:text-amber-50 transition-colors shadow-sm"
              >
                {isSubmitting ? "Memproses..." : "Konfirmasi Partial Close"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
