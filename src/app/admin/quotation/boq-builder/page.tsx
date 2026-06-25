"use client";

import { PricelistTab } from "./PricelistTab";
import Link from "next/link";
import { FolderOpen, Plus, Printer } from "lucide-react";

export default function BoqBuilderPage() {
  const handlePrintPricelist = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Pricelist BoQ</h1>
          <p className="text-gray-500 mt-1">Kelola database material dan harga untuk pembuatan Bill of Quantity</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePrintPricelist}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-medium flex items-center shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Pricelist
          </button>
          
          <Link
            href="/admin/quotation/boq-builder/projects"
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium flex items-center shadow-sm transition-colors"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Daftar BoQ / Buat Baru
          </Link>
        </div>
      </div>

      <div className="print:hidden">
        <PricelistTab />
      </div>

      <div className="hidden print:block">
        <h2 className="text-xl font-bold mb-4">Master Pricelist DASI</h2>
        <p className="mb-4">Dicetak pada: {new Date().toLocaleDateString("id-ID")}</p>
        <PricelistTab />
      </div>
    </div>
  );
}
