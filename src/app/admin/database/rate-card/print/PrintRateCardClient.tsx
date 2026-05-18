"use client";

import React, { useState, useMemo } from "react";
import { 
  Printer, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  FileText, 
  User, 
  Building2, 
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Eye,
  Info
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PrintRateCardClientProps {
  initialItems: any[];
  initialSettings: {
    vendors: string[];
    period_year: string;
    selected_vendor: string;
    vendor_prices: Record<string, Record<string, number>>;
    allowed_users: any[];
    categories: string[];
    work_types: string[];
    capacity_units: string[];
  };
}

export default function PrintRateCardClient({ initialItems, initialSettings }: PrintRateCardClientProps) {
  const router = useRouter();
  
  // State for Document Customization
  const [selectedVendor, setSelectedVendor] = useState(initialSettings.selected_vendor || initialSettings.vendors[0] || "");
  const [docNumber, setDocNumber] = useState(`DC-KP/FY26/${(selectedVendor || "VENDOR").toUpperCase().replace(/\s+/g, "-")}/${new Date().getFullYear()}`);
  const [docDate, setDocDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [pihak1Pic, setPihak1Pic] = useState("Odo Odagiri");
  const [pihak1Title, setPihak1Title] = useState("Direktur Utama");
  const [pihak1Company, setPihak1Company] = useState("PT Daikin Connect Indonesia");
  
  const [pihak2Pic, setPihak2Pic] = useState("Ahmad Fauzi");
  const [pihak2Title, setPihak2Title] = useState("Direktur Utama");
  const [pihak2Company, setPihak2Company] = useState(selectedVendor || "Vendor Rekanan");

  // Dynamic Clauses State
  const [clauses, setClauses] = useState<string[]>([
    "Tarif Harga Satuan yang disepakati adalah tarif resmi yang mengikat kedua belah pihak untuk periode tahun berjalan sesuai Lampiran Lampiran.",
    "Harga yang tercantum sudah termasuk jasa teknisi ahli, penyediaan peralatan kerja standar, alat keselamatan kerja (K3), serta biaya mobilisasi operasional ke lokasi proyek.",
    "Pengecualian biaya pemeliharaan di luar kontrak payung ini mencakup pengadaan sparepart mayor, penggantian kompresor unit, atau pekerjaan overhaul total, yang mana wajib dituangkan dalam Work Order (WO) terpisah.",
    "Pekerjaan dianggap selesai secara sah dan dapat ditagihkan apabila Pihak Kedua menyerahkan laporan hasil pekerjaan (Checklist PM/CM) yang ditandatangani oleh PIC Pihak Pertama di lapangan."
  ]);
  const [newClause, setNewClause] = useState("");

  // Exclusion States
  const [excludedItems, setExcludedItems] = useState<Record<string, boolean>>({});
  const [excludedCategories, setExcludedCategories] = useState<Record<string, boolean>>({});
  
  // Collapse States for Sidebar Category Lists
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // When vendor changes, update related doc fields
  const handleVendorChange = (vendor: string) => {
    setSelectedVendor(vendor);
    setDocNumber(`DC-KP/FY26/${vendor.toUpperCase().replace(/\s+/g, "-")}/${new Date().getFullYear()}`);
    setPihak2Company(vendor);
  };

  const handleAddClause = () => {
    if (newClause.trim()) {
      setClauses([...clauses, newClause.trim()]);
      setNewClause("");
    }
  };

  const handleRemoveClause = (index: number) => {
    setClauses(clauses.filter((_, i) => i !== index));
  };

  // Toggle dynamic lists
  const toggleItemExclusion = (itemId: string) => {
    setExcludedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const toggleCategoryExclusion = (categoryName: string, itemsInCategory: any[]) => {
    const nextVal = !excludedCategories[categoryName];
    setExcludedCategories(prev => ({
      ...prev,
      [categoryName]: nextVal
    }));
    
    // Also toggle all items within this category to match
    const updatedItems = { ...excludedItems };
    itemsInCategory.forEach(item => {
      updatedItems[item.id.toString()] = nextVal;
    });
    setExcludedItems(updatedItems);
  };

  const toggleCategoryExpand = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Filter and group items
  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    // Initialize groups from settings categories to ensure consistent ordering
    const cats = initialSettings.categories.length > 0 
      ? initialSettings.categories 
      : Array.from(new Set(initialItems.map(i => i.category)));
      
    cats.forEach(c => {
      groups[c] = [];
    });
    
    // Place items
    initialItems.forEach(item => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      } else {
        groups[item.category] = [item];
      }
    });

    // Remove empty categories
    return Object.entries(groups).reduce((acc, [cat, list]) => {
      if (list.length > 0) {
        acc[cat] = list;
      }
      return acc;
    }, {} as Record<string, any[]>);
  }, [initialItems, initialSettings.categories]);

  // Check if any items are active
  const hasActiveItems = useMemo(() => {
    return Object.entries(groupedItems).some(([cat, list]) => {
      if (excludedCategories[cat]) return false;
      return list.some(item => !excludedItems[item.id.toString()]);
    });
  }, [groupedItems, excludedItems, excludedCategories]);

  // Format date helper in Indonesian
  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    
    return {
      dayName,
      fullDateStr: `${dayNum} ${monthName} ${year}`,
      year
    };
  };

  const indonesianDate = useMemo(() => formatIndonesianDate(docDate), [docDate]);

  // 1. Gather all active categories and their items
  const activeCategoriesList = useMemo(() => {
    const list: { category: string; items: any[] }[] = [];
    Object.entries(groupedItems).forEach(([cat, items]) => {
      const isCatExcluded = excludedCategories[cat];
      const activeItems = items.filter(item => !excludedItems[item.id.toString()]);
      if (!isCatExcluded && activeItems.length > 0) {
        list.push({ category: cat, items: activeItems });
      }
    });
    return list;
  }, [groupedItems, excludedCategories, excludedItems]);

  // 2. Partition active categories into pages (buckets)
  const tablePages = useMemo(() => {
    const pages: { category: string; items: any[] }[][] = [];
    let currentBucket: { category: string; items: any[] }[] = [];
    let currentRowsCount = 0;
    const MAX_ROWS_PER_PAGE = 8; // Precise row count to guarantee fitting in A4 area with margins

    activeCategoriesList.forEach(catGroup => {
      if (currentRowsCount + catGroup.items.length > MAX_ROWS_PER_PAGE && currentBucket.length > 0) {
        pages.push(currentBucket);
        currentBucket = [catGroup];
        currentRowsCount = catGroup.items.length;
      } else {
        currentBucket.push(catGroup);
        currentRowsCount += catGroup.items.length;
      }
    });

    if (currentBucket.length > 0) {
      pages.push(currentBucket);
    }

    return pages;
  }, [activeCategoriesList]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return 1 + (tablePages.length > 0 ? tablePages.length : 1) + 1;
  }, [tablePages]);

  // Component-specific Page Footer to keep code DRY and consistent
  const PageFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="pt-4 border-t-2 border-[#003366] bg-white w-full shrink-0">
      <div className="flex items-center gap-4 mb-2 text-left">
        <div className="w-[18mm] shrink-0">
          <img src="/TUVnord-.png" alt="TUV Nord" className="w-full h-auto object-contain" />
        </div>
        <div className="flex-1 text-[5.5px] leading-relaxed text-[#333]">
          <p className="margin-0 font-extrabold text-slate-800">Head Office : <span className="font-semibold text-slate-500">Surabaya. Jl. Opak No. 33 Darmo Wonokromo Kota Surabaya Jawa Timur 60241. P. +62-31-9953 9777 F. +62 31 9953 9222</span></p>
          <p className="margin-0 font-extrabold text-slate-800 mt-0.5">Branch Office : <span className="font-semibold text-slate-500">Jakarta. L'Avenue Office Building 25th Floor Jl. Raya Pasar Minggu Kav.16 Pancoran, Jakarta Selatan 12780. P. +62-21 - 8066-7118</span></p>
        </div>
        <div className="flex-1.2 text-[5.5px] leading-relaxed text-[#333]">
          <p className="margin-0 font-extrabold text-slate-800">Medan. <span className="font-semibold text-slate-500">Komplek Karya Makkur, Jl. Karya No. A4 Kelurahan Sei Agul Kecamatan Medan Barat, Medan.</span></p>
          <p className="margin-0 font-extrabold text-slate-800 mt-0.5">Semarang. <span className="font-semibold text-slate-500">Jl. Jendral Sudirman 75A, Krobokan, Semarang Barat.</span></p>
          <p className="margin-0 font-extrabold text-slate-800 mt-0.5">Timika. <span className="font-semibold text-slate-500">Jl. Cendrawasih SP 2 Ruko Segitiga Emas No.9, Timika Papua 99910.</span></p>
        </div>
        <div className="w-[24mm] shrink-0">
          <img src="/green-building-council-1.png" alt="GBCI" className="w-full h-auto object-contain" />
        </div>
      </div>
      <div 
        className="h-8 w-full flex items-center justify-between px-6 box-border rounded-b-md text-white"
        style={{ background: "linear-gradient(to right, #009ce1 0%, #003366 100%)" }}
      >
        <span className="text-[7pt] font-black text-white/95">
          Halaman {pageNum} dari {totalPages}
        </span>
        <span className="text-[9px] font-extrabold italic text-white">
          www.daikin-connect.com
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f3f7] font-sans flex text-[#323338] no-print">
      
      {/* 1. LEFT CONTROL PANEL (SIDEBAR) */}
      <div className="w-[450px] bg-white border-r border-slate-200 h-screen overflow-y-auto p-8 flex flex-col justify-between shrink-0 custom-scrollbar no-print">
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/database/rate-card"
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-[#0073ea] hover:border-[#0073ea] transition-all"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight text-slate-800">Kontrak Payung</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Generator</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Form Fields */}
          <div className="space-y-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Detail Dokumen</h3>
            
            {/* Vendor Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building2 size={12}/> Vendor Rekanan</label>
              <select 
                value={selectedVendor} 
                onChange={(e) => handleVendorChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all"
              >
                {initialSettings.vendors.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Doc Number & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FileText size={12}/> No. Dokumen</label>
                <input 
                  type="text" 
                  value={docNumber} 
                  onChange={(e) => setDocNumber(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Tanggal Perjanjian</label>
                <input 
                  type="date" 
                  value={docDate} 
                  onChange={(e) => setDocDate(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Penandatangan Perjanjian</h3>

            {/* Pihak I (Daikin Connect) */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 space-y-4">
              <span className="text-[9px] font-black text-[#0073ea] uppercase tracking-widest">Pihak I (Daikin Connect)</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nama PIC</label>
                  <input 
                    type="text" 
                    value={pihak1Pic} 
                    onChange={(e) => setPihak1Pic(e.target.value)} 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#0073ea]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Jabatan</label>
                  <input 
                    type="text" 
                    value={pihak1Title} 
                    onChange={(e) => setPihak1Title(e.target.value)} 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#0073ea]"
                  />
                </div>
              </div>
            </div>

            {/* Pihak II (Vendor) */}
            <div className="bg-amber-50/20 border border-amber-100 rounded-2xl p-4 space-y-4">
              <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Pihak II (Vendor Rekanan)</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nama PIC</label>
                  <input 
                    type="text" 
                    value={pihak2Pic} 
                    onChange={(e) => setPihak2Pic(e.target.value)} 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#0073ea]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Jabatan</label>
                  <input 
                    type="text" 
                    value={pihak2Title} 
                    onChange={(e) => setPihak2Title(e.target.value)} 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#0073ea]"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Clauses */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Klausul Kontrak (Pasal 1)</h3>
                <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md">{clauses.length} Klausul</span>
              </div>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {clauses.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 bg-slate-50 border border-slate-150 p-3 rounded-xl group hover:border-rose-200 transition-colors">
                    <span className="text-xs font-black text-slate-400 shrink-0 mt-0.5">{i+1}.</span>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed flex-1">{c}</p>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveClause(i)} 
                      className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                      title="Hapus Klausul"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Tambahkan klausul baru..." 
                  value={newClause} 
                  onChange={(e) => setNewClause(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0073ea]"
                  onKeyDown={e => e.key === 'Enter' && handleAddClause()}
                />
                <button 
                  type="button" 
                  onClick={handleAddClause} 
                  className="p-3 bg-[#0073ea] text-white rounded-xl hover:bg-[#0060c5] transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Dynamic Exclusions */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Layers size={14}/> Saring Opsi Daftar Tarif</h3>
              <div className="space-y-2.5">
                {Object.entries(groupedItems).map(([cat, list]) => {
                  const isCatExcluded = excludedCategories[cat];
                  const isExpanded = expandedCategories[cat];
                  
                  // Count active items
                  const activeCount = list.filter(item => !excludedItems[item.id.toString()]).length;

                  return (
                    <div key={cat} className="bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden transition-all hover:border-slate-200">
                      
                      {/* Category Header */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 border-b border-slate-100">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none flex-1">
                          <input 
                            type="checkbox" 
                            checked={!isCatExcluded}
                            onChange={() => toggleCategoryExclusion(cat, list)}
                            className="w-4 h-4 rounded text-[#0073ea] border-slate-300 focus:ring-[#0073ea] transition-all"
                          />
                          <div>
                            <span className="text-xs font-black text-slate-700 tracking-wide">{cat}</span>
                            <span className="text-[9px] text-slate-400 font-bold block">{activeCount} / {list.length} Item Aktif</span>
                          </div>
                        </label>
                        <button 
                          type="button" 
                          onClick={() => toggleCategoryExpand(cat)}
                          className="p-1 text-slate-400 hover:text-[#0073ea] transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {/* Items List */}
                      {isExpanded && !isCatExcluded && (
                        <div className="p-3.5 bg-white border-t border-slate-50 space-y-2.5 max-h-40 overflow-y-auto">
                          {list.map(item => {
                            const isItemExcluded = excludedItems[item.id.toString()];
                            return (
                              <label key={item.id} className="flex items-start gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={!isItemExcluded}
                                  onChange={() => toggleItemExclusion(item.id.toString())}
                                  className="w-3.5 h-3.5 rounded text-[#0073ea] border-slate-300 focus:ring-[#0073ea] mt-0.5"
                                />
                                <span className="flex-1 leading-relaxed">
                                  {item.item_name} {item.capacity_range ? `(${item.capacity_range})` : ""}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer print action buttons */}
        <div className="pt-6 border-t border-slate-100 space-y-3 bg-white no-print">
          <button 
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#0073ea] hover:bg-[#0060c5] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100 hover:shadow-xl transition-all"
            title="Download PDF atau Cetak dengan format A4"
          >
            <Printer size={16} /> Cetak & Unduh PDF
          </button>
          <p className="text-[9px] text-center text-slate-400 font-bold leading-normal">
            Gunakan pilihan "Save as PDF" di dialog cetak browser untuk mengunduh dokumen A4 berkualitas cetak resmi.
          </p>
        </div>

      </div>

      {/* 2. RIGHT PREVIEW WINDOW (WYSIWYG STACKED DISCRETE A4 PAGES) */}
      <div className="flex-1 overflow-y-auto h-screen p-12 flex flex-col items-center custom-scrollbar bg-slate-200 no-print">
        
        {/* PAGE 1: PREAMBLE & GENERAL CLAUSES (PASAL 1) */}
        <div className="a4-sheet bg-white p-[2cm] shadow-2xl relative border border-slate-300 flex flex-col justify-between shrink-0 text-left font-sans text-slate-800 mb-8">
          
          {/* Header & Body Section */}
          <div>
            {/* Kop Surat / Letterhead */}
            <div className="flex justify-between items-center border-b-[3px] border-[#003366] pb-5 mb-8">
              <div className="flex items-center gap-4">
                <img src="/daikin_logo.png" alt="Daikin" className="h-10 object-contain" />
                <div className="h-8 w-px bg-[#003366]"></div>
                <div className="text-[9px] font-black text-[#003366] uppercase leading-tight max-w-[170px] text-left">
                  PT DAIKIN APPLIED SOLUTIONS INDONESIA
                </div>
              </div>
              <div className="text-right">
                <img src="/logo_epl_connect_1.png" alt="EPL Connect" className="h-12 object-contain" />
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-lg font-bold tracking-normal uppercase underline text-slate-900">SURAT KESEPAKATAN BERSAMA (KONTRAK PAYUNG)</h3>
              <p className="text-xs font-extrabold text-slate-700 tracking-wide">Nomor: {docNumber || "..........................."}</p>
            </div>

            {/* Paragraph 1 - Parties */}
            <div className="text-xs text-slate-800 leading-relaxed text-justify space-y-4 mb-6">
              <p>
                Pada hari ini, <strong className="capitalize">{indonesianDate.dayName}</strong>, tanggal <strong>{indonesianDate.fullDateStr}</strong>, bertempat di Jakarta, kami yang bertanda tangan di bawah ini sepakat untuk mengadakan Perjanjian Kerja Sama Kontrak Payung Tarif Harga Satuan Pemeliharaan Unit HVAC antara:
              </p>
              
              <div className="pl-6 space-y-3">
                <div className="flex">
                  <span className="w-24 shrink-0 font-bold">Pihak Pertama:</span>
                  <div className="flex-1">
                    <strong>{pihak1Company}</strong>, dalam hal ini diwakili oleh <strong>{pihak1Pic || "..........................."}</strong> selaku <strong>{pihak1Title || "..........................."}</strong>, yang bertindak untuk dan atas nama PT Daikin Applied Solutions Indonesia.
                  </div>
                </div>
                <div className="flex">
                  <span className="w-24 shrink-0 font-bold">Pihak Kedua:</span>
                  <div className="flex-1">
                    <strong>{pihak2Company}</strong>, dalam hal ini diwakili oleh <strong>{pihak2Pic || "..........................."}</strong> selaku <strong>{pihak2Title || "..........................."}</strong>, yang bertindak untuk dan atas nama {selectedVendor || "Vendor Rekanan"}.
                  </div>
                </div>
              </div>

              <p className="mt-4">
                Kedua belah pihak dengan ini sepakat dan saling mengikatkan diri untuk mematuhi seluruh syarat, ketentuan, serta daftar tarif pemeliharaan terlampir yang disepakati bersama.
              </p>
            </div>

            {/* Pasal 1 - General Terms */}
            <div className="mb-6 space-y-2 mt-6">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-center">PASAL 1 - KETENTUAN UMUM</h4>
              <div className="text-xs text-slate-800 leading-relaxed space-y-2 pl-4">
                {clauses.length === 0 ? (
                  <p className="italic text-slate-400">Belum ada ketentuan umum yang ditambahkan.</p>
                ) : (
                  clauses.map((clause, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-bold w-4 shrink-0">{idx+1}.</span>
                      <p className="text-justify flex-1">{clause}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer Component */}
          <PageFooter pageNum={1} />
        </div>

        {/* PAGES 2 to (N-1): TARIFF CARD TABLES GROUPED DYNAMICALLY */}
        {tablePages.length === 0 ? (
          /* Fallback Page 2 if no categories are active */
          <div className="a4-sheet bg-white p-[2cm] shadow-2xl relative border border-slate-300 flex flex-col justify-between shrink-0 text-left font-sans text-slate-800 mb-8">
            <div>
              <div className="w-full flex justify-between items-center text-[8px] font-bold text-slate-400 border-b border-slate-200 pb-2 mb-6 uppercase">
                <div className="flex items-center gap-2">
                  <img src="/daikin_logo.png" alt="Daikin" className="h-3.5 object-contain" />
                  <span className="text-[#003366] font-black">PT DAIKIN APPLIED SOLUTIONS INDONESIA</span>
                </div>
                <span>No: {docNumber || "..........................."}</span>
              </div>
              <div className="text-center space-y-2 mb-6">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">PASAL 2 - DAFTAR TARIF HARGA SATUAN</h4>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 mt-12">
                <Info size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">Tidak ada item tarif yang aktif/terpilih.</p>
                <p className="text-[10px] text-slate-400 mt-1">Centang kategori atau opsi pekerjaan di panel kontrol sebelah kiri untuk menampilkan daftar harga satuan.</p>
              </div>
            </div>
            <PageFooter pageNum={2} />
          </div>
        ) : (
          tablePages.map((catGroups, pageIdx) => {
            const pageNum = 2 + pageIdx;
            return (
              <div key={pageIdx} className="a4-sheet bg-white p-[2cm] shadow-2xl relative border border-slate-300 flex flex-col justify-between shrink-0 text-left font-sans text-slate-800 mb-8">
                
                {/* Content Wrapper */}
                <div>
                  <div className="w-full flex justify-between items-center text-[8px] font-bold text-slate-400 border-b border-slate-200 pb-2 mb-6 uppercase">
                    <div className="flex items-center gap-2">
                      <img src="/daikin_logo.png" alt="Daikin" className="h-3.5 object-contain" />
                      <span className="text-[#003366] font-black">PT DAIKIN APPLIED SOLUTIONS INDONESIA</span>
                    </div>
                    <span>No: {docNumber || "..........................."}</span>
                  </div>

                  {pageIdx === 0 && (
                    <div className="text-center space-y-2 mb-6">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">PASAL 2 - DAFTAR TARIF HARGA SATUAN</h4>
                    </div>
                  )}

                  <div className="space-y-6">
                    {catGroups.map(({ category, items }) => (
                      <div key={category} className="space-y-2">
                        <span className="text-[10px] font-black text-[#003366] uppercase tracking-wider pl-1">{category}</span>
                        <table className="w-full text-left border border-slate-200 text-[10px] font-sans rate-table">
                          <thead>
                            <tr className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                              <th className="px-3 py-2 w-8 text-center border-r border-slate-200">No</th>
                              <th className="px-4 py-2 border-r border-slate-200">Deskripsi Pekerjaan</th>
                              <th className="px-4 py-2 border-r border-slate-200">Rentang Kapasitas / Detail</th>
                              <th className="px-3 py-2 w-16 text-center border-r border-slate-200">Satuan</th>
                              <th className="px-4 py-2 text-right w-36">Harga Satuan (IDR)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => {
                              const vendorPrice = initialSettings.vendor_prices?.[selectedVendor]?.[item.id.toString()] ?? 0;
                              return (
                                <tr key={item.id} className="border-b border-slate-200 text-slate-800 hover:bg-slate-50/50">
                                  <td className="px-3 py-2 text-center border-r border-slate-200">{idx+1}</td>
                                  <td className="px-4 py-2 font-bold border-r border-slate-200">{item.item_name}</td>
                                  <td className="px-4 py-2 border-r border-slate-200">{item.capacity_range || "-"}</td>
                                  <td className="px-3 py-2 text-center border-r border-slate-200 font-bold uppercase">{item.capacity_unit}</td>
                                  <td className="px-4 py-2 text-right font-black text-[#003366]">
                                    {vendorPrice > 0 
                                      ? `Rp ${new Intl.NumberFormat("id-ID").format(vendorPrice)}`
                                      : "Belum Diatur"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>

                <PageFooter pageNum={pageNum} />
              </div>
            );
          })
        )}

        {/* LAST PAGE: CLOSING & BINDING SIGNATURES */}
        <div className="a4-sheet bg-white p-[2cm] shadow-2xl relative border border-slate-300 flex flex-col justify-between shrink-0 text-left font-sans text-slate-800 mb-8">
          
          {/* Header & Body wrapper */}
          <div>
            <div className="w-full flex justify-between items-center text-[8px] font-bold text-slate-400 border-b border-slate-200 pb-2 mb-6 uppercase">
              <div className="flex items-center gap-2">
                <img src="/daikin_logo.png" alt="Daikin" className="h-3.5 object-contain" />
                <span className="text-[#003366] font-black">PT DAIKIN APPLIED SOLUTIONS INDONESIA</span>
              </div>
              <span>No: {docNumber || "..........................."}</span>
            </div>

            {/* Pasal 3 - Penutup */}
            <div className="mb-12 space-y-4 mt-6">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-center">PASAL 3 - MASA BERLAKU & PENUTUP</h4>
              <p className="text-xs text-slate-800 leading-relaxed text-justify">
                Demikian Surat Kesepakatan Bersama Kontrak Payung ini dibuat dalam rangkap 2 (dua) bermaterai cukup dan masing-masing mempunyai kekuatan hukum yang sama setelah ditandatangani oleh kedua belah pihak. Kesepakatan ini berlaku sejak ditandatangani dan mengikat tarif pemeliharaan untuk tahun anggaran <strong>{indonesianDate.year}</strong>.
              </p>
            </div>

            {/* Signature Blocks */}
            <div className="mt-16">
              <div className="grid grid-cols-2 text-center text-xs">
                
                {/* Pihak Pertama Signature */}
                <div className="space-y-20">
                  <div className="space-y-1">
                    <p className="font-bold uppercase text-slate-900">PIHAK PERTAMA</p>
                    <p className="font-black text-[#003366] uppercase tracking-widest text-[9px]">{pihak1Company}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-extrabold underline text-slate-900">({pihak1Pic || "..........................."})</p>
                    <p className="text-slate-450 font-bold uppercase text-[9px]">{pihak1Title || "..........................."}</p>
                  </div>
                </div>

                {/* Pihak Kedua Signature */}
                <div className="space-y-20">
                  <div className="space-y-1">
                    <p className="font-bold uppercase text-slate-900">PIHAK KEDUA</p>
                    <p className="font-black text-amber-800 uppercase tracking-widest text-[9px]">{pihak2Company}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-extrabold underline text-slate-900">({pihak2Pic || "..........................."})</p>
                    <p className="text-slate-450 font-bold uppercase text-[9px]">{pihak2Title || "..........................."}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <PageFooter pageNum={totalPages} />
        </div>

      </div>

      {/* Global CSS Style tag for A4 print and layout specifications */}
      <style jsx global>{`
        /* WYSIWYG A4 Container styling inside editor preview */
        .a4-sheet {
          width: 21cm;
          height: 29.7cm;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        /* custom thin scrollbar for control sidebar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 6px;
        }

        /* 3. PRINT ONLY MEDIA LAYOUT CSS STYLINGS */
        @media print {
          /* Hide all non-printable components */
          body, html, .no-print, nav, header, button, .sidebar, select, input {
            display: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Full A4 document container setting */
          .a4-sheet {
            width: 21cm !important;
            height: 29.7cm !important;
            box-shadow: none !important;
            border: none !important;
            padding: 2cm !important;
            margin: 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-after: always !important;
            break-after: always !important;
            box-sizing: border-box !important;
          }
          
          /* Enforce clean page breaks and prevent orphans */
          .rate-table {
            page-break-inside: avoid !important;
          }
          .rate-table tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          
          /* Adjust layout styling for printing */
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          
          /* Avoid printing empty backgrounds */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Define exact paged margins */
          @page {
            size: A4;
            margin: 0 !important;
          }
        }
      `}</style>

    </div>
  );
}
