"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Edit3, Trash2, X, Check, ChevronLeft,
  Search, Database, FileText, RefreshCw, Link2, ChevronRight,
  ChevronDown, Image as ImageIcon, Box
} from "lucide-react";
import {
  getUnitTypeCategories,
  createUnitTypeCategory,
  updateUnitTypeCategory,
  deleteUnitTypeCategory,
  seedDefaultUnitTypes,
} from "@/app/actions/unit_database";

interface UnitCategory {
  id: number;
  name: string;
  description: string;
  icon_color: string;
  catalog_url: string;
  image_url: string;
  parent_id: number | null;
  sort_order: number;
  created_at: string;
  unit_count: number;
}

export default function UnitDatabaseClient() {
  const router = useRouter();
  const [categories, setCategories] = useState<UnitCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // UI States
  const [activeParentId, setActiveParentId] = useState<number | null>(null);
  const [expandedParents, setExpandedParents] = useState<number[]>([]);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<UnitCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Detail Modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<UnitCategory | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState("#0073ea");
  const [formCatalogUrl, setFormCatalogUrl] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formParentId, setFormParentId] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await getUnitTypeCategories();
    if (res && "success" in res && res.success) {
      setCategories(res.data || []);
      // Set initial active parent if none selected
      if (!activeParentId && res.data && res.data.length > 0) {
        const parents = res.data.filter((c: UnitCategory) => c.parent_id === null);
        if (parents.length > 0) {
          setActiveParentId(parents[0].id);
          setExpandedParents([parents[0].id]);
        }
      }
    }
    setLoading(false);
  }, [activeParentId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Derived data
  const mainCategories = categories.filter(c => c.parent_id === null);
  const activeChildren = categories.filter(c => c.parent_id === activeParentId);
  
  const filteredChildren = activeChildren.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggleParent = (id: number) => {
    if (expandedParents.includes(id)) {
      setExpandedParents(expandedParents.filter(p => p !== id));
    } else {
      setExpandedParents([...expandedParents, id]);
    }
    setActiveParentId(id);
  };

  const openCreateModal = (isSubCategory = false) => {
    setModalMode("create");
    setEditingCategory(null);
    setFormName("");
    setFormDescription("");
    setFormColor("#0073ea");
    setFormCatalogUrl("");
    setFormImageUrl("");
    setFormParentId(isSubCategory ? activeParentId : null);
    setModalOpen(true);
  };

  const openEditModal = (cat: UnitCategory) => {
    setModalMode("edit");
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description);
    setFormColor(cat.icon_color);
    setFormCatalogUrl(cat.catalog_url);
    setFormImageUrl(cat.image_url);
    setFormParentId(cat.parent_id);
    setModalOpen(true);
  };

  const openDetail = (cat: UnitCategory) => {
    setSelectedProduct(cat);
    setDetailOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formName,
      description: formDescription,
      icon_color: formColor,
      catalog_url: formCatalogUrl,
      image_url: formImageUrl,
      parent_id: formParentId,
    };

    let res;
    if (modalMode === "create") {
      res = await createUnitTypeCategory(payload);
    } else if (editingCategory) {
      res = await updateUnitTypeCategory(editingCategory.id, payload);
    }

    setSaving(false);
    if (res && "success" in res && res.success) {
      setModalOpen(false);
      fetchCategories();
      // Auto expand if we created a sub-category
      if (modalMode === "create" && formParentId && !expandedParents.includes(formParentId)) {
        setExpandedParents([...expandedParents, formParentId]);
      }
    } else {
      alert((res as any)?.error || "Gagal menyimpan.");
    }
  };

  const handleDelete = async (cat: UnitCategory) => {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    setDeleting(cat.id);
    const res = await deleteUnitTypeCategory(cat.id);
    setDeleting(null);
    if (res && "success" in res && res.success) {
      if (detailOpen && selectedProduct?.id === cat.id) {
        setDetailOpen(false);
      }
      fetchCategories();
    } else {
      alert((res as any)?.error || "Gagal menghapus.");
    }
  };

  const handleSeed = async () => {
    if (!confirm("Ini akan menambahkan kategori utama default (Chiller, Air Side, DX, dll). Lanjutkan?")) return;
    setSeeding(true);
    const res = await seedDefaultUnitTypes();
    setSeeding(false);
    if (res && "success" in res && res.success) {
      fetchCategories();
    } else {
      alert((res as any)?.error || "Gagal seed data.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/home")}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#323338] flex items-center gap-2">
                <Database size={22} className="text-[#0073ea]" /> Product Library
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Master Data Unit Database
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {categories.length === 0 && !loading && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                {seeding ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <RefreshCw size={14} />}
                Seed Default
              </button>
            )}
            <button
              onClick={() => openCreateModal(false)}
              className="px-5 py-2.5 bg-white border border-slate-200 text-[#323338] rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Kategori Utama
            </button>
            <button
              onClick={() => openCreateModal(true)}
              disabled={!activeParentId}
              className="px-5 py-2.5 bg-[#0073ea] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-[#005bb5] hover:shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Tambah Produk
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden sticky top-[100px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Kategori</h2>
              </div>
              <div className="p-2 custom-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                {mainCategories.length === 0 && !loading ? (
                  <div className="p-4 text-center text-sm text-slate-400 font-medium">
                    Belum ada kategori
                  </div>
                ) : (
                  mainCategories.map((cat) => {
                    const isExpanded = expandedParents.includes(cat.id);
                    const isActive = activeParentId === cat.id;
                    const children = categories.filter(c => c.parent_id === cat.id);

                    return (
                      <div key={cat.id} className="mb-1">
                        <div 
                          onClick={() => toggleParent(cat.id)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                            isActive ? "bg-blue-50/50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.icon_color }} />
                            <span className={`text-sm font-bold ${isActive ? "text-[#0073ea]" : "text-[#323338]"}`}>
                              {cat.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
                              className="p-1 hover:bg-slate-200 rounded text-slate-400 opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <Edit3 size={12} />
                            </button>
                            {children.length > 0 ? (
                              isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />
                            ) : null}
                          </div>
                        </div>

                        {/* Children List in Sidebar */}
                        <AnimatePresence>
                          {isExpanded && children.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden ml-4 pl-3 border-l-2 border-slate-100 my-1 space-y-1"
                            >
                              {children.map(child => (
                                <div 
                                  key={child.id}
                                  onClick={() => openDetail(child)}
                                  className="text-[13px] py-1.5 px-3 text-slate-500 hover:text-[#0073ea] hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                >
                                  {child.name}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 flex items-center gap-3">
              <Search size={18} className="text-slate-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk (e.g. Screw, VRV, UAAW...)"
                className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold text-[#323338] placeholder-slate-300"
              />
            </div>

            {/* Title */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Box size={24} className="text-slate-400" />
                <h2 className="text-xl font-black text-[#323338]">
                  {activeParentId ? mainCategories.find(c => c.id === activeParentId)?.name : "Semua Produk"}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100">
                Total {filteredChildren.length} Produk
              </span>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-100 border-t-[#0073ea] rounded-full animate-spin" />
              </div>
            ) : !activeParentId ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
                <Package size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400">Pilih kategori di sidebar untuk melihat produk.</p>
              </div>
            ) : filteredChildren.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
                <Package size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 mb-4">Belum ada produk di kategori ini.</p>
                <button
                  onClick={() => openCreateModal(true)}
                  className="text-xs font-bold text-[#0073ea] underline"
                >
                  Tambah Produk Baru
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredChildren.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }}
                    onClick={() => openDetail(product)}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer transition-all group flex flex-col h-full"
                  >
                    {/* Image Placeholder or Actual Image */}
                    <div className="aspect-[4/3] bg-slate-50 relative flex items-center justify-center border-b border-slate-100 p-4">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-black text-[#323338] mb-1 group-hover:text-[#0073ea] transition-colors line-clamp-1">{product.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed flex-1">{product.description || "Tidak ada deskripsi"}</p>
                      
                      {product.catalog_url && (
                        <div className="mt-3 pt-3 border-t border-slate-50">
                          <span className="text-[10px] font-bold text-[#0073ea] bg-blue-50 px-2 py-1 rounded-md">
                            Katalog Tersedia
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-[#323338]/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-lg p-8 custom-scrollbar max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-[#323338]">
                    {modalMode === "create" ? (formParentId ? "Tambah Produk" : "Tambah Kategori") : "Edit Data"}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {formParentId ? "Product Item" : "Main Category"}
                  </p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Parent Category Select (Only if creating a product) */}
                {(formParentId || (!formParentId && mainCategories.length > 0 && modalMode === "create")) && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">Level</label>
                    <select
                      value={formParentId || ""}
                      onChange={(e) => setFormParentId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0073ea] transition-all"
                    >
                      <option value="">Kategori Utama (Level 1)</option>
                      {mainCategories.map(c => (
                        <option key={c.id} value={c.id}>Sub-kategori di bawah "{c.name}"</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">Nama</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder={formParentId ? "e.g. UAAW-ST3-FAA" : "e.g. Air Cooled Chiller"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0073ea] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">Deskripsi Singkat</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Penjelasan singkat produk atau kategori..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0073ea] transition-all resize-none"
                  />
                </div>

                {/* Only show image & catalog for sub-items/products */}
                {formParentId && (
                  <>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                        <ImageIcon size={10} className="inline mr-1" /> Link Gambar Produk
                      </label>
                      <input
                        type="url"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0073ea] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                        <Link2 size={10} className="inline mr-1" /> Link Katalog PDF
                      </label>
                      <input
                        type="url"
                        value={formCatalogUrl}
                        onChange={(e) => setFormCatalogUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0073ea] transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Color for main categories */}
                {!formParentId && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Warna Identitas</label>
                    <div className="flex flex-wrap gap-2">
                      {["#0073ea", "#00c875", "#e44258", "#fdab3d", "#579bfc", "#a25ddc", "#037f4c", "#66ccff", "#323338"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormColor(color)}
                          className="w-8 h-8 rounded-xl transition-all border-2"
                          style={{
                            background: color,
                            borderColor: formColor === color ? "#323338" : "transparent",
                            transform: formColor === color ? "scale(1.15)" : "scale(1)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-3 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Batal</button>
                  <button type="submit" disabled={saving} className="px-6 py-3 rounded-2xl bg-[#323338] text-white font-black text-[10px] uppercase tracking-widest hover:bg-black shadow-xl transition-all flex items-center gap-2">
                    {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
                    {modalMode === "create" ? "Simpan" : "Update"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {detailOpen && selectedProduct && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailOpen(false)} className="absolute inset-0 bg-[#323338]/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="w-full max-w-md bg-white h-full relative z-10 shadow-2xl flex flex-col">
              
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-xl font-black text-[#323338]">Parts Details</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {mainCategories.find(c => c.id === selectedProduct.parent_id)?.name || "Product"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setDetailOpen(false); openEditModal(selectedProduct); }} className="p-2 bg-blue-50 text-[#0073ea] rounded-xl hover:bg-blue-100 transition-colors">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(selectedProduct)} disabled={deleting === selectedProduct.id} className="p-2 bg-red-50 text-[#e44258] rounded-xl hover:bg-red-100 transition-colors">
                    {deleting === selectedProduct.id ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <Trash2 size={18} />}
                  </button>
                  <button onClick={() => setDetailOpen(false)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-colors ml-2">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center mb-8 relative">
                  <div className="absolute top-4 left-4">
                    <img src="/daikin-logo-blue.png" alt="Daikin" className="h-4 opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
                  </div>
                  {selectedProduct.image_url ? (
                    <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full max-w-[280px] h-auto object-contain mix-blend-multiply my-8" />
                  ) : (
                    <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center text-slate-200 my-8 shadow-sm">
                      <ImageIcon size={64} />
                    </div>
                  )}
                  <h3 className="text-2xl font-black text-[#323338] text-center w-full">{selectedProduct.name}</h3>
                </div>

                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Deskripsi Produk</h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-white rounded-2xl border border-slate-100 p-4">
                    {selectedProduct.description || "Tidak ada deskripsi tersedia."}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Download</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-white/50 flex items-center gap-2">
                      <FileText size={14} className="text-[#0073ea]" />
                      <span className="text-xs font-bold text-[#0073ea]">Catalogue</span>
                    </div>
                    <div className="p-4">
                      {selectedProduct.catalog_url ? (
                        <a 
                          href={selectedProduct.catalog_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-[#0073ea] hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 text-[#e44258]">
                              <FileText size={20} />
                            </div>
                            <div className="truncate">
                              <p className="text-sm font-bold text-[#323338] truncate group-hover:text-[#0073ea] transition-colors">{selectedProduct.name} - Catalog.pdf</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Link2 size={10} /> Link Eksternal
                              </p>
                            </div>
                          </div>
                          <ExternalLink size={16} className="text-slate-300 group-hover:text-[#0073ea]" />
                        </a>
                      ) : (
                        <div className="text-center py-6 text-slate-400">
                          <p className="text-xs font-bold">Katalog belum tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
