"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Edit3, Trash2, X, Check, ChevronLeft,
  ExternalLink, Loader2, Search, Database, FileText,
  AlertTriangle, RefreshCw, Link2
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
  created_at: string;
  unit_count: number;
}

export default function UnitDatabaseClient() {
  const router = useRouter();
  const [categories, setCategories] = useState<UnitCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<UnitCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState("#0073ea");
  const [formCatalogUrl, setFormCatalogUrl] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await getUnitTypeCategories();
    if (res && "success" in res && res.success) {
      setCategories(res.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnits = categories.reduce((sum, c) => sum + c.unit_count, 0);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingCategory(null);
    setFormName("");
    setFormDescription("");
    setFormColor("#0073ea");
    setFormCatalogUrl("");
    setModalOpen(true);
  };

  const openEditModal = (cat: UnitCategory) => {
    setModalMode("edit");
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description);
    setFormColor(cat.icon_color);
    setFormCatalogUrl(cat.catalog_url);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let res;
    if (modalMode === "create") {
      res = await createUnitTypeCategory({
        name: formName,
        description: formDescription,
        icon_color: formColor,
        catalog_url: formCatalogUrl,
      });
    } else if (editingCategory) {
      res = await updateUnitTypeCategory(editingCategory.id, {
        name: formName,
        description: formDescription,
        icon_color: formColor,
        catalog_url: formCatalogUrl,
      });
    }

    setSaving(false);
    if (res && "success" in res && res.success) {
      setModalOpen(false);
      fetchCategories();
    } else {
      alert((res as any)?.error || "Gagal menyimpan.");
    }
  };

  const handleDelete = async (cat: UnitCategory) => {
    if (cat.unit_count > 0) {
      alert(
        `Tidak dapat menghapus tipe "${cat.name}" karena masih digunakan oleh ${cat.unit_count} unit.`
      );
      return;
    }
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    setDeleting(cat.id);
    const res = await deleteUnitTypeCategory(cat.id);
    setDeleting(null);
    if (res && "success" in res && res.success) {
      fetchCategories();
    } else {
      alert((res as any)?.error || "Gagal menghapus.");
    }
  };

  const handleSeed = async () => {
    if (!confirm("Ini akan menambahkan kategori tipe unit default (Chiller, AHU, FCU, dll). Lanjutkan?")) return;
    setSeeding(true);
    const res = await seedDefaultUnitTypes();
    setSeeding(false);
    if (res && "success" in res && res.success) {
      alert((res as any).message || "Berhasil!");
      fetchCategories();
    } else {
      alert((res as any)?.error || "Gagal seed data.");
    }
  };

  const PRESET_COLORS = [
    "#0073ea", "#00c875", "#e44258", "#fdab3d", "#579bfc",
    "#a25ddc", "#037f4c", "#66ccff", "#ff5ac4", "#ff642e",
    "#323338", "#676879",
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa]" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100" style={{ padding: "16px 24px" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/home")}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#323338] flex items-center gap-2">
                <Database size={22} className="text-[#0073ea]" /> Unit Database
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Master Data Kategori Tipe Unit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {categories.length === 0 && !loading && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                {seeding ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Seed Default
              </button>
            )}
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-[#0073ea] text-white rounded-xl text-xs font-bold shadow-lg hover:bg-[#005bb5] transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Tambah Tipe
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Kategori</p>
            <p className="text-3xl font-black text-[#323338] mt-1">{categories.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Unit Terdaftar</p>
            <p className="text-3xl font-black text-[#323338] mt-1">{totalUnits.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dengan Katalog</p>
            <p className="text-3xl font-black text-[#323338] mt-1">
              {categories.filter((c) => c.catalog_url).length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tipe unit..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0073ea] transition-all"
          />
        </div>

        {/* Category Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-[#0073ea] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Package size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">
              {search ? "Tidak ditemukan." : "Belum ada kategori tipe unit."}
            </p>
            {!search && (
              <button onClick={handleSeed} className="mt-4 text-xs text-[#0073ea] font-bold underline">
                Klik untuk menambahkan tipe default
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-[#0073ea] hover:shadow-lg transition-all group"
              >
                {/* Color bar */}
                <div style={{ height: 4, background: cat.icon_color }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                        style={{ background: cat.icon_color }}
                      >
                        {cat.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#323338]">{cat.name}</h3>
                        <p className="text-[11px] text-slate-400">{cat.description || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-slate-400 hover:text-[#0073ea] hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deleting === cat.id}
                        className="p-1.5 text-slate-400 hover:text-[#e44258] hover:bg-red-50 rounded-lg transition-all"
                      >
                        {deleting === cat.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                    <span className="text-[11px] font-bold text-slate-400">
                      {cat.unit_count} unit terdaftar
                    </span>
                    {cat.catalog_url ? (
                      <a
                        href={cat.catalog_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-[#0073ea] flex items-center gap-1 hover:underline"
                      >
                        <FileText size={12} /> Lihat Katalog
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-bold">Belum ada katalog</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#323338]/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-lg p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-[#323338]">
                    {modalMode === "create" ? "Tambah Tipe Unit" : "Edit Tipe Unit"}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Unit Database
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                    Nama Tipe Unit
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. Chiller, AHU, FCU..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0073ea] transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                    Deskripsi
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Air Handling Unit"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0073ea] transition-all"
                  />
                </div>

                {/* Catalog URL */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                    <Link2 size={10} className="inline mr-1" />
                    Link Katalog (Google Drive / OneDrive)
                  </label>
                  <input
                    type="url"
                    value={formCatalogUrl}
                    onChange={(e) => setFormCatalogUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0073ea] transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">
                    Tempel link PDF katalog dari Google Drive atau OneDrive
                  </p>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">
                    Warna Label
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
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

                {/* Preview */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                      style={{ background: formColor }}
                    >
                      {(formName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#323338]">{formName || "Nama Tipe"}</p>
                      <p className="text-[11px] text-slate-400">{formDescription || "Deskripsi tipe unit"}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-3 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-2xl bg-[#323338] text-white font-black text-[10px] uppercase tracking-widest hover:bg-black shadow-xl transition-all flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    {modalMode === "create" ? "Simpan" : "Update"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
