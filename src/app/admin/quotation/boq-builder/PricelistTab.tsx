"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, Save, X } from "lucide-react";
import { 
  getPricelistItems, 
  addPricelistItem, 
  updatePricelistItem, 
  deletePricelistItem 
} from "@/app/actions/pricelist";

export function PricelistTab() {
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
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama barang atau kategori..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Item Baru
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold whitespace-nowrap">Kategori</th>
                <th className="p-4 font-semibold">Nama Barang</th>
                <th className="p-4 font-semibold hidden md:table-cell">Spesifikasi</th>
                <th className="p-4 font-semibold whitespace-nowrap">Satuan</th>
                <th className="p-4 font-semibold text-right whitespace-nowrap">Harga (Rp)</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Tidak ada item ditemukan.</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4">
                      {editId === item.id ? (
                        <input type="text" className="w-full border p-1.5 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {item.category}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {editId === item.id ? (
                        <input type="text" className="w-full border p-1.5 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      ) : item.name}
                    </td>
                    <td className="p-4 text-gray-500 hidden md:table-cell">
                      {editId === item.id ? (
                        <input type="text" className="w-full border p-1.5 rounded" value={formData.specification} onChange={e => setFormData({...formData, specification: e.target.value})} />
                      ) : (item.specification || "-")}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {editId === item.id ? (
                        <input type="text" className="w-20 border p-1.5 rounded" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                      ) : item.unit}
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900 whitespace-nowrap">
                      {editId === item.id ? (
                        <input type="number" className="w-24 border p-1.5 rounded text-right" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                      ) : new Intl.NumberFormat('id-ID').format(item.price)}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {editId === item.id ? (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleUpdate(item.id, item)} className="p-1.5 text-green-600 bg-green-50 rounded hover:bg-green-100"><Save className="w-4 h-4"/></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 text-gray-500 bg-gray-100 rounded hover:bg-gray-200"><X className="w-4 h-4"/></button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleUpdate(item.id, item)} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
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
                <input required type="text" className="w-full border p-2 rounded-lg" placeholder="Contoh: Pipa ASTM B88 1/4" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spesifikasi (Opsional)</label>
                <input type="text" className="w-full border p-2 rounded-lg" placeholder="Contoh: ex. Inaba Denko" value={formData.specification} onChange={e => setFormData({...formData, specification: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                  <input required type="text" className="w-full border p-2 rounded-lg" placeholder="Contoh: Meter" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input required type="number" className="w-full border p-2 rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium mt-2">Simpan Item</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
