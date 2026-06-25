"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  ChevronLeft, 
  Printer, 
  Trash2, 
  Plus, 
  Calendar, 
  Briefcase, 
  Building2, 
  MapPin, 
  Hash, 
  Sliders, 
  Search, 
  Sparkles, 
  Minus, 
  FileText,
  Building,
  RefreshCw,
  X
} from "lucide-react";
import Link from "next/link";
import StaticLogo from "@/components/ui/StaticLogo";

interface WorkOrderClientProps {
  initialItems: any[];
  initialSettings: any;
  projects: any[];
  users: any[];
}

export default function WorkOrderClient({ 
  initialItems, 
  initialSettings, 
  projects, 
  users 
}: WorkOrderClientProps) {
  
  // 1. Metadata Form States
  const [woForm, setWoForm] = useState({
    wo_number: `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    project_name: "",
    location: "",
    pic_name: "",
    notes: ""
  });

  // 2. Search & Add Items States
  const [activeItems, setActiveItems] = useState<any[]>([]);
  const [searchItemQuery, setSearchItemQuery] = useState("");
  const [selectedCatalogItem, setSelectedCatalogItem] = useState("");

  // 3. Negotiation State
  const [negotiationDiscount, setNegotiationDiscount] = useState<number>(0);

  // 4. Project Asset Synchronization States
  const [syncPromptOpen, setSyncPromptOpen] = useState(false);
  const [pendingProject, setPendingProject] = useState<any>(null);

  // 5. Memoized Dropdown Options for PIC
  const picOptions = useMemo(() => {
    return users.filter(user => {
      const roles = Array.isArray(user.roles) 
        ? user.roles.map((r: string) => r.toLowerCase()) 
        : [String(user.primaryRole || "").toLowerCase()];
      return roles.some((role: string) => 
        role.includes("sales engineer") || role.includes("management")
      );
    });
  }, [users]);

  // 6. Get price of item in selected vendor pricing
  const getVendorPrice = (itemId: string): number => {
    if (!initialSettings.selected_vendor) return 0;
    return initialSettings.vendor_prices?.[initialSettings.selected_vendor]?.[itemId] ?? 0;
  };

  // 7. Handle Project Selection and Auto-fill Location Address & Sync Units Prompt
  const handleProjectChange = (projectIdStr: string) => {
    const selectedProj = projects.find(p => p.id.toString() === projectIdStr);
    if (selectedProj) {
      const address = selectedProj.customers?.address?.trim() || "";
      const locationText = address !== "" ? address : "Belum ada alamat terdaftar";
      
      setWoForm(prev => ({
        ...prev,
        project_name: selectedProj.name,
        location: locationText
      }));

      // Check if project has associated units to sync
      if (selectedProj.units && selectedProj.units.length > 0) {
        setPendingProject(selectedProj);
        setSyncPromptOpen(true);
      }
    } else {
      setWoForm(prev => ({
        ...prev,
        project_name: "",
        location: ""
      }));
      setPendingProject(null);
    }
  };

  // 8. Confirm Synchronization of Project Units to Work Order List
  const handleConfirmSyncUnits = () => {
    if (!pendingProject?.units) return;

    const newItems: any[] = [];
    pendingProject.units.forEach((unit: any) => {
      // Find matching catalog item in initialItems (case insensitive category match or item name include)
      const matchedItem = initialItems.find(item => 
        item.category.toLowerCase() === unit.unit_type?.toLowerCase() ||
        item.item_name.toLowerCase().includes(unit.unit_type?.toLowerCase() || "")
      );

      if (matchedItem) {
        const price = getVendorPrice(matchedItem.id.toString());
        
        // Parse unit capacity (e.g., "2 PK" or "2.5 PK" or "3 Cell")
        let capacityVal = 1;
        if (unit.capacity) {
          const parsed = parseFloat(unit.capacity.replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed) && parsed > 0) {
            capacityVal = parsed;
          }
        }

        newItems.push({
          id: `local-${Date.now()}-${Math.random()}`,
          item_ref_id: matchedItem.id.toString(),
          item_name: matchedItem.item_name,
          category: matchedItem.category,
          work_type: matchedItem.work_type,
          capacity_unit: matchedItem.capacity_unit,
          capacity_range: matchedItem.capacity_range,
          capacity_pk: (matchedItem.capacity_unit === "PK" || matchedItem.capacity_unit === "Cell") ? capacityVal : 0,
          qty: 1,
          notes: `Unit: ${unit.tag_number || "-"} (Model: ${unit.model || "-"})`,
          original_price: price
        });
      }
    });

    if (newItems.length > 0) {
      setActiveItems(prev => [...prev, ...newItems]);
    }

    setSyncPromptOpen(false);
    setPendingProject(null);
  };

  const handleCancelSyncUnits = () => {
    setSyncPromptOpen(false);
    setPendingProject(null);
  };

  // 9. Add Catalog Item to Active Items List
  const handleAddCatalogItem = (itemIdStr: string) => {
    if (!itemIdStr) return;
    const item = initialItems.find(i => i.id.toString() === itemIdStr);
    if (!item) return;

    const existingIdx = activeItems.findIndex(ai => ai.item_ref_id === item.id.toString());
    if (existingIdx > -1) {
      const updated = [...activeItems];
      updated[existingIdx].qty += 1;
      setActiveItems(updated);
    } else {
      const price = getVendorPrice(item.id.toString());
      const newActive = {
        id: `local-${Date.now()}-${Math.random()}`,
        item_ref_id: item.id.toString(),
        item_name: item.item_name,
        category: item.category,
        work_type: item.work_type,
        capacity_unit: item.capacity_unit,
        capacity_range: item.capacity_range,
        capacity_pk: (item.capacity_unit === "PK" || item.capacity_unit === "Cell") ? 1 : 0,
        qty: 1,
        notes: "",
        original_price: price
      };
      setActiveItems([...activeItems, newActive]);
    }
    setSelectedCatalogItem("");
    setSearchItemQuery("");
  };

  // 10. Filtered Catalog Items based on Search query
  const filteredCatalogItems = useMemo(() => {
    if (!searchItemQuery.trim()) return initialItems;
    return initialItems.filter(item => 
      item.item_name.toLowerCase().includes(searchItemQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchItemQuery.toLowerCase())
    );
  }, [initialItems, searchItemQuery]);

  // 11. Update Active Item Parameters
  const updateActiveItemQty = (id: string, qty: number) => {
    setActiveItems(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, qty) } : item
    ));
  };

  const updateActiveItemPK = (id: string, pk: number) => {
    setActiveItems(prev => prev.map(item => 
      item.id === id ? { ...item, capacity_pk: Math.max(0, pk) } : item
    ));
  };

  const updateActiveItemNotes = (id: string, notes: string) => {
    setActiveItems(prev => prev.map(item => 
      item.id === id ? { ...item, notes } : item
    ));
  };

  const deleteActiveItem = (id: string) => {
    setActiveItems(prev => prev.filter(item => item.id !== id));
  };

  // 12. Financial Calculations & Summary
  const financialRecap = useMemo(() => {
    let subtotalSebelumNegosiasi = 0;
    let subtotalSetelahNegosiasi = 0;

    activeItems.forEach(item => {
      const multiplier = (item.capacity_unit === "PK" || item.capacity_unit === "Cell") 
        ? (item.capacity_pk || 1) 
        : 1;
      const originalItemCost = item.original_price * multiplier * item.qty;
      subtotalSebelumNegosiasi += originalItemCost;

      const negotiatedUnitPrice = item.original_price * (1 - negotiationDiscount / 100);
      const negotiatedItemCost = negotiatedUnitPrice * multiplier * item.qty;
      subtotalSetelahNegosiasi += negotiatedItemCost;
    });

    const discountAmount = subtotalSebelumNegosiasi - subtotalSetelahNegosiasi;
    const ppn = subtotalSetelahNegosiasi * 0.11;
    const grandTotal = subtotalSetelahNegosiasi + ppn;

    return {
      subtotalSebelumNegosiasi,
      discountAmount,
      subtotalSetelahNegosiasi,
      ppn,
      grandTotal
    };
  }, [activeItems, negotiationDiscount]);

  // 13. Pagination / Partitioning of Active Items for A4 sheet rendering
  const partitionedPages = useMemo(() => {
    if (activeItems.length === 0) return [[]];
    
    const pages: any[][] = [];
    const REGULAR_SIZE = 8;
    const LAST_PAGE_MAX = 4;
    
    let temp = [...activeItems];
    
    while (temp.length > 0) {
      // If the remaining items fit within the last page capacity:
      if (temp.length <= LAST_PAGE_MAX) {
        pages.push(temp);
        break;
      }
      
      // If we have more than the last page capacity, but taking a REGULAR_SIZE
      // would leave too many or too few items:
      if (temp.length <= REGULAR_SIZE) {
        const firstPageCount = Math.max(1, Math.min(temp.length - 2, REGULAR_SIZE - 2));
        pages.push(temp.slice(0, firstPageCount));
        temp = temp.slice(firstPageCount);
      } else {
        pages.push(temp.slice(0, REGULAR_SIZE));
        temp = temp.slice(REGULAR_SIZE);
      }
    }
    return pages;
  }, [activeItems]);

  const fmtCurrency = (n: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(n);
  };

  const fmtDate = (dStr: string) => {
    if (!dStr) return "-";
    return new Date(dStr).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const vendorName = initialSettings.selected_vendor?.trim() || "Vendor";
    const projectName = woForm.project_name?.trim() || "Project";
    const woDate = woForm.date || new Date().toISOString().split('T')[0];
    
    // Format: "Work Order_Nama Vendor_Nama Proyek_Tanggal"
    const rawFilename = `Work Order_${vendorName}_${projectName}_${woDate}`;
    const cleanFilename = rawFilename.replace(/[\/\\:\*\?"<>\|]/g, '-');

    document.title = cleanFilename;
    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-700 flex flex-col lg:flex-row print:bg-white print:text-black print-safe">
      
      {/* LEFT SIDEBAR CONTROLS (LIGHT MODE COHESIVE SYSTEM) */}
      <div className="w-full lg:w-[450px] lg:border-r border-slate-200 bg-white p-6 md:p-8 flex flex-col gap-8 flex-shrink-0 lg:max-h-screen lg:overflow-y-auto custom-scrollbar no-print shadow-sm">
        
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/admin/quotation/rate-card" 
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0073ea] transition-all"
          >
            <ChevronLeft size={16} /> Kembali ke Rate Card
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg">
            <Sparkles size={12} className="text-blue-500 animate-pulse" />
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">WO Builder v2</span>
          </div>
        </div>

        {/* Section: WO Information */}
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText size={20} className="text-[#0073ea]" /> Informasi WO
            </h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Konfigurasi Lembar Kerja Surat Perintah Kerja</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Hash size={12} /> No. Work Order</label>
              <input 
                type="text" 
                value={woForm.wo_number} 
                onChange={e => setWoForm({...woForm, wo_number: e.target.value})} 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-250 rounded-2xl font-bold text-sm text-slate-800 focus:outline-none focus:border-[#0073ea] focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Calendar size={12} /> Tanggal</label>
              <input 
                type="date" 
                value={woForm.date} 
                onChange={e => setWoForm({...woForm, date: e.target.value})} 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-250 rounded-2xl font-bold text-sm text-slate-800 focus:outline-none focus:border-[#0073ea] focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Briefcase size={12} /> PIC / Pengaju</label>
              <select 
                value={woForm.pic_name} 
                onChange={e => setWoForm({...woForm, pic_name: e.target.value})} 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-250 rounded-2xl font-bold text-sm text-slate-800 focus:outline-none focus:border-[#0073ea] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
              >
                <option value="">Pilih pengaju...</option>
                {picOptions.map(user => (
                  <option key={user.id} value={user.name}>
                    {user.name} ({user.roles?.join(", ") || user.primaryRole})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Building2 size={12} /> Proyek Target</label>
              <select 
                value={projects.find(p => p.name === woForm.project_name)?.id?.toString() || ""}
                onChange={e => handleProjectChange(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-250 rounded-2xl font-bold text-sm text-slate-800 focus:outline-none focus:border-[#0073ea] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
              >
                <option value="">Pilih proyek...</option>
                {projects.map(proj => (
                  <option key={proj.id.toString()} value={proj.id.toString()}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><MapPin size={12} /> Lokasi Proyek</label>
              <textarea 
                rows={2} 
                value={woForm.location} 
                onChange={e => setWoForm({...woForm, location: e.target.value})}
                placeholder="Alamat lokasi lengkap..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-250 rounded-2xl font-bold text-sm text-slate-800 focus:outline-none focus:border-[#0073ea] focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Section: Catalog Ingestion */}
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Plus size={20} className="text-emerald-600" /> Tambah Item Kerja
            </h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Tambahkan item dari database katalog rate card</p>
          </div>

          <div className="space-y-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
              <input 
                type="text" 
                placeholder="Cari item dalam katalog..." 
                value={searchItemQuery}
                onChange={e => setSearchItemQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-250 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <select 
                value={selectedCatalogItem}
                onChange={e => handleAddCatalogItem(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-250 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Pilih & masukkan item ({filteredCatalogItems.length} opsi)...</option>
                {filteredCatalogItems.map(item => {
                  const p = getVendorPrice(item.id.toString());
                  return (
                    <option key={item.id.toString()} value={item.id.toString()}>
                      [{item.category}] {item.item_name} - {fmtCurrency(p)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Section: Negotiation Simulation */}
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={20} className="text-indigo-600" /> Simulasi Negosiasi
            </h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Sesuaikan persentase diskon penawaran</p>
          </div>

          <div className="space-y-4 p-5 bg-[#f8f9fc] border border-slate-200 rounded-3xl">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Diskon Penawaran</span>
              <div className="flex items-center gap-1.5">
                <input 
                  type="number" 
                  min={0} 
                  max={50} 
                  value={negotiationDiscount} 
                  onChange={e => setNegotiationDiscount(Math.min(50, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-16 px-2 py-1 text-center bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-400"
                />
                <span className="text-xs font-black text-indigo-600">%</span>
              </div>
            </div>
            
            <input 
              type="range" 
              min={0} 
              max={50} 
              step={1}
              value={negotiationDiscount}
              onChange={e => setNegotiationDiscount(parseInt(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <p className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Sebelum</p>
                <p className="text-xs font-black text-slate-650">{fmtCurrency(financialRecap.subtotalSebelumNegosiasi)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Setelah</p>
                <p className="text-xs font-black text-indigo-600">{fmtCurrency(financialRecap.subtotalSetelahNegosiasi)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Action Controls */}
        <div className="flex flex-col gap-3 pt-2">
          <button 
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#0073ea] hover:bg-[#0060c5] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/10 group"
          >
            <Printer size={16} className="group-hover:scale-110 transition-transform" /> Cetak / Download PDF
          </button>
        </div>

      </div>

      {/* RIGHT PREVIEW WORKSPACE (LIGHT PREMIUM GREY CONTAINER) */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen bg-slate-100 flex flex-col items-center custom-scrollbar print:bg-white print:p-0 print:overflow-visible print:max-h-none">
        
        {/* A4 sheet preview loop */}
        {partitionedPages.map((pageItems, pageIdx) => {
          const isFirstPage = pageIdx === 0;
          const isLastPage = pageIdx === partitionedPages.length - 1;

          return (
            <div 
              key={pageIdx} 
              className="a4-sheet relative bg-white text-black shadow-[0_10px_40px_rgba(0,0,0,0.06)] mb-8 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:page-break-after-always"
            >
              
              {/* FULL BLEED HEADER (ON ALL PAGES) */}
              <div className="w-full flex-shrink-0 relative">
                {/* Daikin Top Blue Banner Line */}
                <div className="h-[4mm] bg-gradient-to-r from-[#009ce1] to-[#003366] w-full" />
                
                <div className="px-[15mm] pt-[8mm] pb-[4mm] flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <img 
                      src="/logo_epllink.png" 
                      alt="EPL Link" 
                      className="h-[10mm] w-auto object-contain self-start" 
                    />
                    <p className="text-[7px] font-black text-[#003366] uppercase tracking-[0.05em] leading-none mt-1">PT. Daikin Applied Solutions Indonesia</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-[12px] font-black text-[#1e2229] uppercase tracking-wider">Surat Perintah Kerja (WO)</h2>
                    <p className="text-[8px] font-black text-[#0073ea] uppercase tracking-widest mt-1">{woForm.wo_number || "WO-.................."}</p>
                  </div>
                </div>
                
                {/* Thin dividing line under header */}
                <div className="mx-[15mm] h-[0.5px] bg-slate-200" />
              </div>
 
              {/* MAIN CONTENT BLOCK */}
              <div className="flex-1 px-[15mm] py-[6mm] flex flex-col justify-start">
                
                {/* Project Details Panel (First Page Only) */}
                {isFirstPage && (
                  <div className="mb-[6mm] p-[4.5mm] bg-slate-50 border border-slate-150 rounded-2xl grid grid-cols-3 gap-[4.5mm]">
                    {/* Column 1: Pihak I & II (Contracting Parties) */}
                    <div className="flex flex-col gap-1.5 border-r border-slate-200 pr-[4.5mm]">
                      <div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Pemberi Tugas (Pihak I)</span>
                        <span className="text-[9.5px] font-black text-[#003366] uppercase leading-none block mt-0.5">PT. DAIKIN APPLIED SOLUTIONS INDONESIA</span>
                        {woForm.pic_name && (
                          <span className="text-[8px] font-bold text-slate-500 mt-1 block">PIC: {woForm.pic_name}</span>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Penerima Tugas (Pihak II)</span>
                        <span className="text-[9.5px] font-black text-slate-800 uppercase leading-none block mt-0.5 truncate" title={initialSettings.selected_vendor || "Vendor Kontraktor"}>
                          {initialSettings.selected_vendor || "Belum ada vendor terpilih"}
                        </span>
                      </div>
                    </div>

                    {/* Column 2: Project & Execution Location */}
                    <div className="flex flex-col gap-1.5 border-r border-slate-200 pr-[4.5mm]">
                      <div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Nama Proyek / Instalasi</span>
                        <span className="text-[9.5px] font-bold text-slate-800 leading-tight block mt-0.5 truncate" title={woForm.project_name || "N/A"}>
                          {woForm.project_name || "-"}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Lokasi / Alamat Pekerjaan</span>
                        <span className="text-[9.5px] font-bold text-slate-800 leading-snug block mt-0.5 line-clamp-2" title={woForm.location || "N/A"}>
                          {woForm.location || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Column 3: Document Tracking */}
                    <div className="flex flex-col gap-1.5 pl-0.5">
                      <div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">No. Work Order (SPK)</span>
                        <span className="text-[9.5px] font-black text-[#0073ea] uppercase block mt-0.5 tracking-wider">{woForm.wo_number || "-"}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Diterbitkan</span>
                        <span className="text-[9.5px] font-bold text-slate-800 block mt-0.5">{fmtDate(woForm.date)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table of Line-Items */}
                <div className="flex-1">
                  <table className="w-full text-left text-[9px] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-800/80 bg-slate-100/50">
                        <th className="py-2.5 px-2 text-[7.5px] font-black text-slate-500 uppercase tracking-widest text-center w-8">No</th>
                        <th className="py-2.5 px-3 text-[7.5px] font-black text-slate-500 uppercase tracking-widest">Uraian Pekerjaan</th>
                        <th className="py-2.5 px-3 text-[7.5px] font-black text-slate-500 uppercase tracking-widest text-center w-24">Satuan / Kapasitas</th>
                        <th className="py-2.5 px-2 text-[7.5px] font-black text-slate-500 uppercase tracking-widest text-center w-12">Qty</th>
                        <th className="py-2.5 px-3 text-[7.5px] font-black text-slate-500 uppercase tracking-widest text-right w-28">Harga Satuan (Rp)</th>
                        <th className="py-2.5 px-3 text-[7.5px] font-black text-slate-500 uppercase tracking-widest text-right w-32">Subtotal (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {pageItems.length > 0 ? (
                        pageItems.map((item, idx) => {
                          const itemIndex = pageIdx * 7 + idx + 1;
                          const multiplier = (item.capacity_unit === "PK" || item.capacity_unit === "Cell") 
                            ? (item.capacity_pk || 1) 
                            : 1;

                          const negotiatedUnitPrice = item.original_price * (1 - negotiationDiscount / 100);
                          const totalItemCost = negotiatedUnitPrice * multiplier * item.qty;

                          const capacityDisplay = (item.capacity_unit === "PK" || item.capacity_unit === "Cell")
                            ? `${item.capacity_pk || 0} ${item.capacity_unit}`
                            : `${item.capacity_range} ${item.capacity_unit}`;

                          return (
                            <tr key={item.id} className="align-top hover:bg-slate-50/50">
                              <td className="py-3 px-2 font-bold text-slate-400 text-center">{itemIndex}</td>
                              <td className="py-3 px-3">
                                <div className="flex flex-col">
                                  <span className="font-black text-slate-800 uppercase tracking-wide leading-tight">{item.item_name}</span>
                                  <span className="text-[7.5px] text-[#0073ea] font-black uppercase tracking-wider mt-0.5">{item.category} &bull; {item.work_type}</span>
                                  
                                  {/* Note edit field on-screen, renders as static subtext on print */}
                                  <div className="no-print mt-1.5">
                                    <input 
                                      type="text" 
                                      placeholder="Catatan pengerjaan..." 
                                      value={item.notes} 
                                      onChange={e => updateActiveItemNotes(item.id, e.target.value)} 
                                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[8px] font-bold text-slate-700 focus:outline-none focus:border-blue-355"
                                    />
                                  </div>
                                  {item.notes && (
                                    <span className="hidden print:inline text-[7.5px] text-slate-400 italic mt-0.5 leading-tight">Note: {item.notes}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                {(item.capacity_unit === "PK" || item.capacity_unit === "Cell") ? (
                                  <div className="flex flex-col items-center gap-1">
                                    {/* Capacity Input on-screen */}
                                    <div className="no-print flex items-center gap-1">
                                      <input 
                                        type="number" 
                                        step="0.1" 
                                        value={item.capacity_pk || ""} 
                                        onChange={e => updateActiveItemPK(item.id, parseFloat(e.target.value) || 0)} 
                                        className="w-10 text-center px-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-black text-slate-850 focus:outline-none focus:border-blue-300" 
                                      />
                                      <span className="text-[7px] font-black text-slate-450">{item.capacity_unit}</span>
                                    </div>
                                    <span className="hidden print:inline font-bold text-slate-700">{capacityDisplay}</span>
                                  </div>
                                ) : (
                                  <span className="font-bold text-slate-500">{capacityDisplay}</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  {/* Qty edit controls on-screen */}
                                  <div className="no-print flex items-center gap-0.5">
                                    <button onClick={() => updateActiveItemQty(item.id, item.qty - 1)} className="p-0.5 bg-slate-100 rounded hover:bg-slate-200"><Minus size={8} /></button>
                                    <span className="w-5 text-center font-bold text-[9px] text-slate-800">{item.qty}</span>
                                    <button onClick={() => updateActiveItemQty(item.id, item.qty + 1)} className="p-0.5 bg-slate-100 rounded hover:bg-slate-200"><Plus size={8} /></button>
                                  </div>
                                  <span className="hidden print:inline font-bold text-slate-700">{item.qty}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-slate-600">
                                {negotiationDiscount > 0 && (
                                  <p className="text-[7px] text-slate-400 line-through leading-none mb-0.5">{fmtCurrency(item.original_price)}</p>
                                )}
                                <p className="leading-none">{fmtCurrency(negotiatedUnitPrice)}</p>
                              </td>
                              <td className="py-3 px-3 text-right font-black text-slate-800">
                                {fmtCurrency(totalItemCost)}
                                
                                {/* Trash button on screen */}
                                <div className="no-print mt-2 flex justify-end">
                                  <button 
                                    onClick={() => deleteActiveItem(item.id)}
                                    className="p-1 bg-slate-50 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-md transition-all shadow-sm"
                                    title="Hapus baris"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-350 italic text-[10px]">
                            Belum ada pekerjaan terpilih. Silakan cari & tambahkan item di panel kiri.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Terms and Financial Recaps (Last Page Only) */}
                {isLastPage && (
                  <div className="mt-[5mm] pt-[4mm] border-t border-slate-200 grid grid-cols-12 gap-[5mm] items-start">
                    
                    {/* Notes & Terms on left */}
                    {(() => {
                      const totalQty = activeItems.reduce((sum, item) => sum + item.qty, 0);
                      const totalPK = activeItems.reduce((sum, item) => sum + ((item.capacity_pk || 0) * item.qty), 0);
                      const scopes = Array.from(new Set(activeItems.map(item => item.category || "Jasa Service"))).join(", ");

                      return (
                        <div className="col-span-7 space-y-3">
                          {/* Scope of Work Summary Box */}
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-x-4 gap-y-2 text-[7.5px] leading-tight">
                            <div className="col-span-2 pb-1 border-b border-slate-200/60 flex items-center justify-between">
                              <span className="font-black text-[#003366] uppercase tracking-widest text-[8px]">Ringkasan Pekerjaan (Summary)</span>
                              <span className="text-[7px] font-bold text-slate-400 uppercase">EPL B2B Portal</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-450 block uppercase tracking-widest text-[6px]">Total Volume Kerja:</span>
                              <span className="font-black text-[#0073ea] text-[11px] mt-0.5 block">
                                {totalQty} Item / Unit
                              </span>
                            </div>
                            {totalPK > 0 && (
                              <div>
                                <span className="font-bold text-slate-450 block uppercase tracking-widest text-[6px]">Total Kapasitas Ter-cover:</span>
                                <span className="font-black text-slate-800 text-[11px] mt-0.5 block">
                                  {totalPK.toFixed(1).replace('.0', '')} PK
                                </span>
                              </div>
                            )}
                            <div className="col-span-2 border-t border-slate-200/40 pt-1.5 mt-0.5">
                              <span className="font-bold text-slate-450 block uppercase tracking-widest text-[6px]">Lingkup Pekerjaan:</span>
                              <span className="font-black text-slate-700 mt-0.5 block capitalize text-[7.5px] leading-snug">
                                {scopes.toLowerCase()}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[8px] font-black text-[#0073ea] uppercase tracking-widest">Catatan Umum:</h4>
                            <p className="text-[7.5px] font-bold text-slate-500 mt-1 leading-relaxed">
                              {woForm.notes || "1. Seluruh pekerjaan mengikuti kesepakatan B2B.\n2. Laporan diserahkan setelah PM disetujui."}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Syarat & Ketentuan SPK:</h4>
                            <ul className="list-decimal pl-3 text-[7px] font-medium text-slate-400 space-y-0.5 mt-1 leading-relaxed">
                              <li>Harga sudah termasuk jasa teknisi, alat kerja standar, dan transportasi.</li>
                              <li>Tidak termasuk penggantian suku cadang berat atau perbaikan komponen berat.</li>
                              <li>Sistem dokumentasi dan pelaporan harus melalui portal EPL CONNECT.</li>
                              <li>Pekerjaan dinyatakan selesai setelah Check-Sheet ditandatangani kedua pihak.</li>
                            </ul>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Totals panel on right */}
                    <div className="col-span-5 bg-slate-50 border border-slate-100 p-[3mm] rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-[7.5px]">
                        <span className="font-bold text-slate-500">Subtotal Sebelum Negosiasi</span>
                        <span className="font-bold text-slate-700">{fmtCurrency(financialRecap.subtotalSebelumNegosiasi)}</span>
                      </div>
                      {negotiationDiscount > 0 && (
                        <div className="flex justify-between items-center text-[7.5px] text-indigo-655 font-bold">
                          <span>Diskon Negosiasi (-{negotiationDiscount}%)</span>
                          <span>-{fmtCurrency(financialRecap.discountAmount)}</span>
                        </div>
                      )}
                      <div className="h-[0.5px] bg-slate-200" />
                      <div className="flex justify-between items-center text-[7.5px]">
                        <span className="font-bold text-slate-500">Subtotal Setelah Negosiasi</span>
                        <span className="font-bold text-slate-800">{fmtCurrency(financialRecap.subtotalSetelahNegosiasi)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[7.5px]">
                        <span className="font-bold text-slate-500">PPN (11%)</span>
                        <span className="font-bold text-slate-700">{fmtCurrency(financialRecap.ppn)}</span>
                      </div>
                      <div className="h-[0.5px] bg-slate-300" />
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase text-slate-600">Grand Total</span>
                        <span className="text-[12px] font-black text-[#005aab]">{fmtCurrency(financialRecap.grandTotal)}</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* Signature Blocks (Last Page Only) */}
                {isLastPage && (
                  <div className="mt-[8mm] grid grid-cols-2 gap-[15mm]">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-12">Diajukan oleh (Pihak I),</p>
                      <div className="w-[40mm] h-[0.5px] bg-slate-800" />
                      <p className="text-[9px] font-black text-slate-800 mt-1 uppercase leading-none">{woForm.pic_name || "..................................................."}</p>
                      <p className="text-[7.5px] font-bold text-slate-450 uppercase mt-0.5 leading-none">PIC / Project Manager</p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-12">Disetujui oleh (Pihak II),</p>
                      <div className="w-[40mm] h-[0.5px] bg-slate-800" />
                      <p className="text-[9px] font-black text-slate-800 mt-1 uppercase leading-none">{initialSettings.selected_vendor || "..................................................."}</p>
                      <p className="text-[7.5px] font-bold text-slate-450 uppercase mt-0.5 leading-none">Vendor / Kontraktor</p>
                    </div>
                  </div>
                )}

              </div>

              {/* FULL BLEED FOOTER (ON ALL PAGES) */}
              <div className="w-full flex-shrink-0">
                <div className="px-[15mm] py-[3mm] border-t border-slate-100 flex justify-between items-center text-[7px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Building size={10} className="text-slate-350" />
                    <span>EPL CONNECT Portal</span>
                  </div>
                  <div className="font-bold text-slate-500 uppercase tracking-widest">
                    Halaman {pageIdx + 1} dari {partitionedPages.length}
                  </div>
                </div>
                
                {/* Bottom Blue Accent Line */}
                <div className="h-[2mm] bg-gradient-to-r from-[#003366] to-[#009ce1] w-full" />
              </div>

            </div>
          );
        })}

      </div>

      {/* SYNC ASSET DIALOG MODAL (PREMIUM & Wow UI) */}
      {syncPromptOpen && pendingProject && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#323338]/30 backdrop-blur-md no-print">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full border border-slate-150 animate-in fade-in zoom-in duration-200 text-center">
            
            <div className="w-16 h-16 bg-blue-50 text-[#0073ea] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <RefreshCw size={32} className="animate-spin duration-3000" />
            </div>

            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Sinkronisasi Unit Proyek?</h3>
            <p className="text-xs font-semibold text-slate-500 mt-2.5 leading-relaxed">
              Terdeteksi <strong className="text-[#0073ea]">{pendingProject.units.length} unit</strong> terdaftar di proyek <strong>{pendingProject.name}</strong>.
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">
              Apakah Anda ingin menyinkronkan aset ini secara otomatis ke dalam lembar kerja Work Order baru Anda?
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button 
                type="button" 
                onClick={handleCancelSyncUnits}
                className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Tidak, Lewati
              </button>
              
              <button 
                type="button" 
                onClick={handleConfirmSyncUnits}
                className="w-full py-4 bg-[#0073ea] hover:bg-[#0060c5] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
              >
                Ya, Sinkronkan
              </button>
            </div>

          </div>
        </div>
      )}

      <style jsx global>{`
        /* Dynamic A4 print sheet container layout system */
        .a4-sheet {
          width: 21cm;
          height: 29.7cm;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        @media print {
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .a4-sheet {
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            width: 21cm !important;
            height: 29.7cm !important;
            page-break-after: always !important;
            box-sizing: border-box !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

    </div>
  );
}
