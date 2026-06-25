"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, Save, X } from "lucide-react";
import { 
  getPricelistItems, 
  addPricelistItem, 
  updatePricelistItem, 
  deletePricelistItem 
} from "../../actions/pricelist";

export default function PricelistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    specification: "",
    unit: "",
    price: 0,
  });

  const loadItems = async () => {
    setLoading(true);
    const data = await getPricelistItems(page, 50, search);
    setItems(data.items);
    setTotalPages(data.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadItems();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPricelistItem(formData);
    setIsAddOpen(false);
    setFormData({ category: "", name: "", specification: "", unit: "", price: 0 });
    loadItems();
  };

  const handleUpdate = async (id: string, currentData: any) => {
    if (editId === id) {
      await updatePricelistItem(id, formData);
      setEditId(null);
      loadItems();
    } else {
      setEditId(id);
      setFormData({
        category: currentData.category,
        name: currentData.name,
        specification: currentData.specification || "",
        unit: currentData.unit,
        price: Number(currentData.price),
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deletePricelistItem(id);
      loadItems();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Pricelist</h1>
          <p className="text-gray-500 mt-1">Kelola data material dan harga satuan untuk BoQ Builder</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Item Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama barang atau kategori..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold whitespace-nowrap">Kategori</th>
                <th className="p-4 font-semibold">Nama Barang</th>
                <th className="p-4 font-semibold">Spesifikasi</th>
                <th className="p-4 font-semibold whitespace-nowrap">Satuan</th>
                <th className="p-4 font-semibold text-right">Harga (Rp)</th>
                <th className="p-4 font-semibold text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Tidak ada item ditemukan.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    {editId === item.id ? (
                      <>
                        <td className="p-3"><input type="text" className="w-full border p-1 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></td>
                        <td className="p-3"><input type="text" className="w-full border p-1 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></td>
                        <td className="p-3"><input type="text" className="w-full border p-1 rounded" value={formData.specification} onChange={e => setFormData({...formData, specification: e.target.value})} /></td>
                        <td className="p-3"><input type="text" className="w-full border p-1 rounded w-16" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} /></td>
                        <td className="p-3"><input type="number" className="w-full border p-1 rounded text-right" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></td>
                        <td className="p-3 flex justify-center gap-2">
                          <button onClick={() => handleUpdate(item.id, item)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save className="w-4 h-4"/></button>
                          <button onClick={() => setEditId(null)} className="text-gray-500 hover:bg-gray-100 p-1 rounded"><X className="w-4 h-4"/></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 text-sm font-medium text-gray-700">{item.category}</td>
                        <td className="p-4 text-sm text-gray-900">{item.name}</td>
                        <td className="p-4 text-sm text-gray-500">{item.specification || "-"}</td>
                        <td className="p-4 text-sm text-gray-600">{item.unit}</td>
                        <td className="p-4 text-sm font-semibold text-gray-900 text-right">
                          {Number(item.price).toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleUpdate(item.id, item)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 text-sm font-medium"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-gray-600">Halaman {page} dari {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 text-sm font-medium"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Tambah Item Pricelist</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input required type="text" className="w-full border p-2 rounded-lg" placeholder="Contoh: Pipa Tembaga" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                <input required type="text" className="w-full border p-2 rounded-lg" placeholder="Contoh: Pipa Tembaga 1/2 inch" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spesifikasi (Opsional)</label>
                <input type="text" className="w-full border p-2 rounded-lg" placeholder="Contoh: Tebal 0.8mm" value={formData.specification} onChange={e => setFormData({...formData, specification: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                  <input required type="text" className="w-full border p-2 rounded-lg" placeholder="m, lot, set" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                </div>
                <div className="w-2/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Satuan (Rp)</label>
                  <input required type="number" min="0" className="w-full border p-2 rounded-lg" value={formData.price || ""} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Simpan Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
