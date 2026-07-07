"use client";

import { PricelistTab } from "./PricelistTab";
import Link from "next/link";
import { FolderOpen, Plus, Printer } from "lucide-react";

export default function BoqBuilderPage() {
  const handlePrintPricelist = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32 print-safe print:p-0 print:m-0 print:absolute print:top-0 print:left-0 print:w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-6 print:hidden">
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

      <div className="hidden print:block mb-4">
        <h2 className="text-2xl font-bold mb-2">Master Pricelist DASI</h2>
        <p className="text-gray-600">Dicetak pada: {new Date().toLocaleDateString("id-ID")}</p>
      </div>

      <PricelistTab />
    </div>
  );
}
