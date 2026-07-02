"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Printer, 
  Trash2, 
  Plus, 
  FileText,
  Sparkles,
  MapPin,
  Building2,
  Calendar,
  User,
  Sliders,
  Search,
  FolderPlus,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { 
  getBoqProjectDetails, 
  addBoqCategory, 
  deleteBoqCategory, 
  addBoqItem, 
  deleteBoqItem, 
  updateBoqItem, 
  updateBoqProjectMarkup 
} from "@/app/actions/boq";
import { getPricelistItems } from "@/app/actions/pricelist";

export default function BoqEditorClient() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  // Project Data
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Markups
  const [markupMaterial, setMarkupMaterial] = useState<number>(0);
  const [markupLabour, setMarkupLabour] = useState<number>(0);
  const [savingMarkup, setSavingMarkup] = useState(false);

  // Add Category
  const [newCategoryName, setNewCategoryName] = useState("");

  // Add Item states
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [itemMode, setItemMode] = useState<"pricelist" | "manual">("pricelist");
  
  // Catalog search
  const [pricelist, setPricelist] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPricelistItem, setSelectedPricelistItem] = useState<any>(null);

  // Manual item form
  const [manualItem, setManualItem] = useState({
    name: "",
    specification: "",
    unit: "Unit",
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [materialPrice, setMaterialPrice] = useState<number>(0);
  const [labourPrice, setLabourPrice] = useState<number>(0);

  // Inline editing state
  const [activeInlineEdit, setActiveInlineEdit] = useState<{id: string, field: string} | null>(null);

  const loadData = async () => {
    const data = await getBoqProjectDetails(id);
    setProject(data);
    if (data) {
      setMarkupMaterial(Number(data.markup_material) || 0);
      setMarkupLabour(Number(data.markup_labour) || 0);
      if (data.categories?.length > 0 && !activeCategoryId) {
        setActiveCategoryId(data.categories[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (itemMode === "pricelist") {
        const data = await getPricelistItems(1, 20, searchQuery);
        setPricelist(data.items);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, itemMode]);

  const handleSaveMarkup = async () => {
    setSavingMarkup(true);
    await updateBoqProjectMarkup(id, markupMaterial, markupLabour);
    setSavingMarkup(false);
    loadData();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const cat = await addBoqCategory(id, newCategoryName);
    setNewCategoryName("");
    loadData();
    if (cat?.id) setActiveCategoryId(cat.id);
  };

  const handleDeleteCategory = async (catId: string) => {
    if (confirm("Are you sure you want to delete this category and ALL its items?")) {
      await deleteBoqCategory(catId, id);
      if (activeCategoryId === catId) setActiveCategoryId("");
      loadData();
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategoryId) return;
    
    if (itemMode === "pricelist" && !selectedPricelistItem) return;
    if (itemMode === "manual" && !manualItem.name) return;

    await addBoqItem({
      boq_id: id,
      category_id: activeCategoryId,
      item_id: itemMode === "pricelist" ? selectedPricelistItem.id : undefined,
      manual_name: itemMode === "manual" ? manualItem.name : undefined,
      specification: itemMode === "manual" ? manualItem.specification : undefined,
      unit: itemMode === "manual" ? manualItem.unit : undefined,
      quantity: quantity,
      material_price: materialPrice,
      labour_price: labourPrice,
    });
    
    setSelectedItemData(null);
    setManualItem({ name: "", specification: "", unit: "Unit" });
    setQuantity(1);
    setMaterialPrice(0);
    setLabourPrice(0);
    setSearchQuery("");
    loadData();
  };

  const setSelectedItemData = (item: any) => {
    setSelectedPricelistItem(item);
    if (item) {
      setMaterialPrice(Number(item.price));
      setLabourPrice(0); // Labour usually manual
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("Are you sure you want to remove this item?")) {
      await deleteBoqItem(itemId, id);
      loadData();
    }
  };

  const handleInlineUpdate = async (itemId: string, field: "quantity" | "material_price" | "labour_price", val: string) => {
    setActiveInlineEdit(null);
    const num = Number(val);
    if (isNaN(num)) return;
    
    await updateBoqItem(itemId, id, { [field]: num });
    loadData();
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanFilename = `BoQ_${project?.project_name?.replace(/[\/\\:\*\?"<>\|]/g, '-')}_${new Date().toISOString().split('T')[0]}`;
    document.title = cleanFilename;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const formatPrice = (val: number) => `Rp ${Math.round(val).toLocaleString("id-ID")}`;

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="flex flex-col items-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-4 text-[#0073ea]" />
          <p className="font-medium">Memuat Workspace BoQ...</p>
        </div>
      </div>
    );
  }

  let overallMatTotal = 0;
  let overallLabTotal = 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}} />
      
      <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-700 flex flex-col lg:flex-row print:bg-white print:text-black print:block">
        
        {/* LEFT SIDEBAR CONTROLS (LIGHT MODE COHESIVE SYSTEM) */}
        <div className="w-full lg:w-[450px] lg:border-r border-slate-200 bg-white p-6 md:p-8 flex flex-col gap-8 flex-shrink-0 lg:max-h-screen lg:overflow-y-auto custom-scrollbar no-print shadow-sm">
          
          {/* Back navigation */}
          <div className="flex items-center justify-between">
            <Link 
              href="/admin/quotation/boq-builder/projects" 
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0073ea] transition-all"
            >
              <ChevronLeft size={16} /> Kembali ke Daftar
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg">
              <Sparkles size={12} className="text-blue-500 animate-pulse" />
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">BoQ Builder v3</span>
            </div>
          </div>

          {/* Section: Project Information */}
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText size={20} className="text-[#0073ea]" /> Informasi BoQ
              </h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Data Header Bill of Quantity</p>
            </div>

            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">Nama Proyek</label>
                <div className="font-bold text-sm text-slate-800 px-1">{project.project_name}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">Customer</label>
                <div className="font-bold text-sm text-slate-800 px-1">{project.customer_name || "-"}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">Tanggal Dibuat</label>
                <div className="font-bold text-sm text-slate-800 px-1">{new Date(project.created_at).toLocaleDateString("id-ID")}</div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Section: Markup Configuration */}
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={20} className="text-indigo-600" /> Pengaturan Markup
              </h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Tentukan persentase markup material & labour</p>
            </div>

            <div className="space-y-4 p-5 bg-[#f8f9fc] border border-slate-200 rounded-3xl">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Markup Material</span>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number" min="0" step="1"
                    value={(markupMaterial * 100).toFixed(0)} 
                    onChange={e => setMarkupMaterial(Number(e.target.value) / 100)}
                    className="w-16 px-2 py-1 text-center bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-400"
                  />
                  <span className="text-xs font-black text-indigo-600">%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Markup Labour</span>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number" min="0" step="1"
                    value={(markupLabour * 100).toFixed(0)} 
                    onChange={e => setMarkupLabour(Number(e.target.value) / 100)}
                    className="w-16 px-2 py-1 text-center bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-400"
                  />
                  <span className="text-xs font-black text-indigo-600">%</span>
                </div>
              </div>
              <button 
                onClick={handleSaveMarkup}
                disabled={savingMarkup}
                className="w-full py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center"
              >
                {savingMarkup ? "Menyimpan..." : "Simpan Markup"}
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Section: Category Management */}
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FolderPlus size={20} className="text-amber-500" /> Kategori & Baris
              </h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Pilih kategori sebelum menambahkan item</p>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nama kategori baru..." 
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
              <button type="submit" className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors">
                <Plus size={16} />
              </button>
            </form>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Kategori Aktif</label>
              <select 
                value={activeCategoryId}
                onChange={e => setActiveCategoryId(e.target.value)}
                className="w-full px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">Pilih Kategori...</option>
                {project.categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Section: Add Items */}
          <div className={`space-y-5 transition-opacity ${!activeCategoryId ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" /> Tambah Item
              </h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Masukkan data ke kategori terpilih</p>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <button 
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${itemMode === "pricelist" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}
                onClick={() => setItemMode("pricelist")}
              >
                Dari Pricelist
              </button>
              <button 
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${itemMode === "manual" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}
                onClick={() => setItemMode("manual")}
              >
                Input Manual
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              {itemMode === "pricelist" ? (
                <div className="space-y-3">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500" />
                    <input 
                      type="text" 
                      placeholder="Cari Master Pricelist..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-250 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="border border-slate-200 rounded-2xl max-h-40 overflow-y-auto bg-white custom-scrollbar">
                    {pricelist.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Pencarian kosong.</div>
                    ) : (
                      pricelist.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedItemData(item)}
                          className={`p-3 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-emerald-50 transition-colors flex justify-between items-center ${selectedPricelistItem?.id === item.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800">{item.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{item.unit}</div>
                          </div>
                          <div className="text-[10px] font-black text-emerald-600">{formatPrice(Number(item.price))}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <input required type="text" placeholder="Deskripsi Item" className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl font-bold text-xs text-slate-800 focus:border-emerald-500 outline-none" value={manualItem.name} onChange={e => setManualItem({...manualItem, name: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Spesifikasi (Opsional)" className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl font-bold text-xs text-slate-800 focus:border-emerald-500 outline-none" value={manualItem.specification} onChange={e => setManualItem({...manualItem, specification: e.target.value})} />
                    <input required type="text" placeholder="Satuan (mis. Unit)" className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl font-bold text-xs text-slate-800 focus:border-emerald-500 outline-none" value={manualItem.unit} onChange={e => setManualItem({...manualItem, unit: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Volume (QTY)</label>
                  <input required type="number" step="0.1" min="0" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:border-emerald-500 outline-none" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Harga Material</label>
                  <input required type="number" min="0" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:border-emerald-500 outline-none" value={materialPrice} onChange={e => setMaterialPrice(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Harga Labour</label>
                  <input required type="number" min="0" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:border-emerald-500 outline-none" value={labourPrice} onChange={e => setLabourPrice(Number(e.target.value))} />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={itemMode === "pricelist" && !selectedPricelistItem}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20"
              >
                + Tambah ke BoQ
              </button>
            </form>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Action Controls */}
          <div className="flex flex-col gap-3 pt-2 pb-10">
            <button 
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#0073ea] hover:bg-[#0060c5] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 group"
            >
              <Printer size={16} className="group-hover:scale-110 transition-transform" /> Cetak / Download PDF
            </button>
          </div>

        </div>

        {/* RIGHT PREVIEW WORKSPACE (LIGHT PREMIUM GREY CONTAINER) */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen bg-slate-100 flex flex-col items-center custom-scrollbar print:bg-white print:p-0 print:overflow-visible print:max-h-none">
          
          <div 
            className="a4-sheet-landscape relative bg-white text-black shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden print:shadow-none print:m-0"
            style={{ width: '297mm', minHeight: '210mm' }}
          >
            {/* FULL BLEED HEADER */}
            <div className="w-full flex-shrink-0 relative">
              <div className="h-[4mm] bg-gradient-to-r from-[#009ce1] to-[#003366] w-full" />
              
              <div className="px-[15mm] pt-[8mm] pb-[4mm] flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <img 
                    src="/logo/Logo DSSI.png" 
                    alt="EPL Link" 
                    className="h-[10mm] w-auto object-contain self-start" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <p className="text-[8px] font-black text-[#003366] uppercase tracking-[0.05em] leading-none mt-1">PT. Daikin Applied Solutions Indonesia</p>
                </div>
                <div className="text-right">
                  <h2 className="text-[14px] font-black text-[#1e2229] uppercase tracking-wider">BILL OF QUANTITY</h2>
                  <p className="text-[9px] font-bold text-slate-500 mt-1">{new Date(project.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="mx-[15mm] h-[0.5px] bg-slate-200" />
            </div>

            {/* MAIN CONTENT BLOCK */}
            <div className="flex-1 px-[15mm] py-[6mm] flex flex-col justify-start">
              
              {/* Project Info Panel */}
              <div className="mb-[6mm] p-[4.5mm] bg-slate-50 border border-slate-150 rounded-lg grid grid-cols-3 gap-[4.5mm]">
                <div className="flex flex-col border-r border-slate-200 pr-[4.5mm]">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Proyek</span>
                  <span className="text-[10px] font-bold text-slate-800 leading-tight block mt-0.5">{project.project_name}</span>
                </div>
                <div className="flex flex-col border-r border-slate-200 pr-[4.5mm]">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Customer</span>
                  <span className="text-[10px] font-bold text-slate-800 leading-tight block mt-0.5">{project.customer_name || "-"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Markup Material</span>
                    <span className="text-[8px] font-bold text-indigo-600">{(markupMaterial * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Markup Labour</span>
                    <span className="text-[8px] font-bold text-indigo-600">{(markupLabour * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* BoQ Table */}
              <table className="w-full text-left border-collapse border border-slate-800 mb-6">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-1.5 border border-slate-700 text-[8px] font-bold text-center w-8" rowSpan={2}>No</th>
                    <th className="p-1.5 border border-slate-700 text-[8px] font-bold" rowSpan={2}>Deskripsi Pekerjaan / Material</th>
                    <th className="p-1.5 border border-slate-700 text-[8px] font-bold" rowSpan={2}>Spesifikasi</th>
                    <th className="p-1.5 border border-slate-700 text-[8px] font-bold text-center w-12" rowSpan={2}>QTY</th>
                    <th className="p-1.5 border border-slate-700 text-[8px] font-bold text-center w-12" rowSpan={2}>Sat</th>
                    <th className="p-1 border border-slate-700 text-[8px] font-bold text-center" colSpan={2}>Harga Satuan (Rp)</th>
                    <th className="p-1 border border-slate-700 text-[8px] font-bold text-center" colSpan={2}>Total Harga (Rp)</th>
                    <th className="p-1.5 border border-slate-700 text-[8px] font-bold text-center w-8 no-print" rowSpan={2}>Aksi</th>
                  </tr>
                  <tr className="bg-slate-700 text-slate-100">
                    <th className="p-1 border border-slate-600 text-[7px] font-bold text-right w-24">Material</th>
                    <th className="p-1 border border-slate-600 text-[7px] font-bold text-right w-24">Labour</th>
                    <th className="p-1 border border-slate-600 text-[7px] font-bold text-right w-28">Material</th>
                    <th className="p-1 border border-slate-600 text-[7px] font-bold text-right w-28">Labour</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {project.categories.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-[9px] text-slate-400 italic border border-slate-300">Belum ada kategori dan item.</td>
                    </tr>
                  ) : (
                    project.categories.map((cat: any, catIdx: number) => {
                      let catMatTotal = 0;
                      let catLabTotal = 0;

                      return (
                        <React.Fragment key={cat.id}>
                          {/* Category Header */}
                          <tr className="bg-slate-100">
                            <td className="p-1.5 border border-slate-300 text-[8px] font-black text-center text-slate-800">{String.fromCharCode(65 + catIdx)}</td>
                            <td colSpan={8} className="p-1.5 border border-slate-300 text-[8px] font-black text-slate-800 uppercase">{cat.name}</td>
                            <td className="p-1 border border-slate-300 text-center no-print">
                              <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600"><Trash2 size={10} /></button>
                            </td>
                          </tr>

                          {/* Items */}
                          {cat.items.map((item: any, idx: number) => {
                            const matTotal = Number(item.material_price) * item.quantity;
                            const labTotal = Number(item.labour_price) * item.quantity;
                            catMatTotal += matTotal;
                            catLabTotal += labTotal;
                            overallMatTotal += matTotal;
                            overallLabTotal += labTotal;

                            const itemName = item.pricelist ? item.pricelist.name : item.manual_name;
                            const itemSpec = item.pricelist ? item.pricelist.specification : item.specification;
                            const unit = item.pricelist ? item.pricelist.unit : item.unit;

                            return (
                              <tr key={item.id} className="hover:bg-blue-50/50 group">
                                <td className="p-1.5 border border-slate-300 text-[8px] text-center text-slate-600">{idx + 1}</td>
                                <td className="p-1.5 border border-slate-300 text-[8px] text-slate-800 font-medium">{itemName}</td>
                                <td className="p-1.5 border border-slate-300 text-[8px] text-slate-600">{itemSpec || "-"}</td>
                                <td className="p-1 border border-slate-300 text-center relative no-print-input">
                                  <input 
                                    type="number" step="0.1" min="0"
                                    className="w-full text-center text-[8px] p-0.5 border-none bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded"
                                    defaultValue={item.quantity}
                                    onBlur={(e) => handleInlineUpdate(item.id, "quantity", e.target.value)}
                                  />
                                </td>
                                <td className="p-1.5 border border-slate-300 text-[8px] text-center text-slate-600">{unit}</td>
                                <td className="p-1 border border-slate-300 text-right relative no-print-input">
                                  <input 
                                    type="number" min="0"
                                    className="w-full text-right text-[8px] p-0.5 border-none bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded"
                                    defaultValue={Number(item.material_price)}
                                    onBlur={(e) => handleInlineUpdate(item.id, "material_price", e.target.value)}
                                  />
                                </td>
                                <td className="p-1 border border-slate-300 text-right relative no-print-input">
                                  <input 
                                    type="number" min="0"
                                    className="w-full text-right text-[8px] p-0.5 border-none bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded"
                                    defaultValue={Number(item.labour_price)}
                                    onBlur={(e) => handleInlineUpdate(item.id, "labour_price", e.target.value)}
                                  />
                                </td>
                                <td className="p-1.5 border border-slate-300 text-[8px] text-right font-medium text-slate-700 bg-slate-50/50">{formatPrice(matTotal)}</td>
                                <td className="p-1.5 border border-slate-300 text-[8px] text-right font-medium text-slate-700 bg-slate-50/50">{formatPrice(labTotal)}</td>
                                <td className="p-1 border border-slate-300 text-center no-print">
                                  <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 size={10} /></button>
                                </td>
                              </tr>
                            );
                          })}

                          {/* Subtotal */}
                          <tr className="bg-blue-50/30">
                            <td colSpan={7} className="p-1.5 border border-slate-300 text-[8px] font-bold text-right text-slate-700">SUB TOTAL {cat.name}</td>
                            <td className="p-1.5 border border-slate-300 text-[8px] font-bold text-right text-slate-900">{formatPrice(catMatTotal)}</td>
                            <td className="p-1.5 border border-slate-300 text-[8px] font-bold text-right text-slate-900">{formatPrice(catLabTotal)}</td>
                            <td className="border border-slate-300 no-print"></td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  )}

                  {/* Grand Totals */}
                  {project.categories.length > 0 && (
                    <>
                      <tr className="bg-slate-100">
                        <td colSpan={7} className="p-2 border border-slate-300 text-[9px] font-black text-right text-slate-800">GRAND TOTAL BASE</td>
                        <td className="p-2 border border-slate-300 text-[9px] font-black text-right text-slate-900">{formatPrice(overallMatTotal)}</td>
                        <td className="p-2 border border-slate-300 text-[9px] font-black text-right text-slate-900">{formatPrice(overallLabTotal)}</td>
                        <td className="border border-slate-300 no-print"></td>
                      </tr>
                      
                      <tr className="bg-[#0073ea] text-white">
                        <td colSpan={7} className="p-2 border border-[#0060c5] text-[9px] font-black text-right">
                          GRAND TOTAL + MARKUP (Mat: {markupMaterial*100}%, Lab: {markupLabour*100}%)
                        </td>
                        <td className="p-2 border border-[#0060c5] text-[9px] font-black text-right text-blue-50">{formatPrice(overallMatTotal * (1 + markupMaterial))}</td>
                        <td className="p-2 border border-[#0060c5] text-[9px] font-black text-right text-blue-50">{formatPrice(overallLabTotal * (1 + markupLabour))}</td>
                        <td className="border border-[#0060c5] no-print"></td>
                      </tr>

                      <tr className="bg-[#003366] text-white">
                        <td colSpan={7} className="p-3 border border-[#002244] text-[10px] font-black text-right uppercase tracking-wider">TOTAL PROJECT VALUE</td>
                        <td colSpan={2} className="p-3 border border-[#002244] text-[12px] font-black text-center text-yellow-400">
                          {formatPrice((overallMatTotal * (1 + markupMaterial)) + (overallLabTotal * (1 + markupLabour)))}
                        </td>
                        <td className="border border-[#002244] no-print"></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {/* Tanda Tangan / Validation section could go here if needed in future */}
              <div className="mt-8 flex justify-end">
                <div className="w-[40mm] text-center">
                  <p className="text-[8px] mb-[15mm]">Dibuat Oleh,</p>
                  <p className="text-[8px] font-bold uppercase underline">Daikin Admin</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
