"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Printer, Loader2, Save } from "lucide-react";
import { getBoqProjectDetails, addBoqItem, deleteBoqItem, updateBoqItemQuantity } from "@/app/actions/boq";
import { getPricelistItems } from "@/app/actions/pricelist";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function BoqEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [pricelist, setPricelist] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const loadData = async () => {
    setLoading(true);
    const data = await getBoqProjectDetails(id);
    setProject(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadPricelist = async (q: string) => {
    const data = await getPricelistItems(1, 20, q);
    setPricelist(data.items);
  };

  useEffect(() => {
    if (isAddItemOpen) {
      const timer = setTimeout(() => {
        loadPricelist(search);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, isAddItemOpen]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    await addBoqItem({
      boq_id: id,
      item_id: selectedItem.id,
      quantity: quantity,
      unit_price: Number(selectedItem.price),
    });
    
    setIsAddItemOpen(false);
    setSelectedItem(null);
    setQuantity(1);
    setSearch("");
    loadData();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("Are you sure you want to remove this item?")) {
      await deleteBoqItem(itemId, id);
      loadData();
    }
  };

  const handleUpdateQty = async (itemId: string, newQty: number, unitPrice: number) => {
    if (newQty < 0.1) return;
    await updateBoqItemQuantity(itemId, id, newQty, unitPrice);
    loadData();
  };

  const exportPDF = () => {
    if (!project) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Bill of Quantity", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Proyek: ${project.project_name}`, 14, 32);
    doc.text(`Customer: ${project.customer_name || "-"}`, 14, 38);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 44);
    
    const tableData = project.items.map((item: any, index: number) => [
      index + 1,
      item.pricelist.name,
      item.pricelist.specification || "-",
      item.pricelist.unit,
      item.quantity.toString(),
      `Rp ${Number(item.unit_price).toLocaleString("id-ID")}`,
      `Rp ${Number(item.total_price).toLocaleString("id-ID")}`
    ]);
    
    const grandTotal = project.items.reduce((sum: number, item: any) => sum + Number(item.total_price), 0);
    
    tableData.push([
      { content: 'GRAND TOTAL', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: `Rp ${grandTotal.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold' } }
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['No', 'Deskripsi Material', 'Spesifikasi', 'Satuan', 'Volume', 'Harga Satuan', 'Total Harga']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 115, 234] }
    });
    
    doc.save(`BOQ_${project.project_name.replace(/\\s+/g, '_')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  const grandTotal = project.items.reduce((sum: number, item: any) => sum + Number(item.total_price), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      <div className="mb-4">
        <button onClick={() => router.push('/admin/quotation/boq-builder')} className="text-gray-500 hover:text-gray-800 flex items-center font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
          <p className="text-gray-600 mt-2 font-medium">Customer: {project.customer_name || "-"}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddItemOpen(true)}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium flex items-center shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Baris
          </button>
          <button
            onClick={exportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold w-12 text-center">No</th>
                <th className="p-4 font-semibold">Deskripsi Material</th>
                <th className="p-4 font-semibold">Spesifikasi</th>
                <th className="p-4 font-semibold text-center w-24">Satuan</th>
                <th className="p-4 font-semibold text-center w-32">Volume</th>
                <th className="p-4 font-semibold text-right w-40">Harga Satuan</th>
                <th className="p-4 font-semibold text-right w-48">Total Harga</th>
                <th className="p-4 font-semibold text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {project.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    Belum ada material di dalam BoQ ini. Silakan tekan tombol "Tambah Baris".
                  </td>
                </tr>
              ) : (
                project.items.map((item: any, idx: number) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 group">
                    <td className="p-4 text-center text-sm text-gray-500">{idx + 1}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{item.pricelist.name}</td>
                    <td className="p-4 text-sm text-gray-500">{item.pricelist.specification || "-"}</td>
                    <td className="p-4 text-center text-sm text-gray-600">{item.pricelist.unit}</td>
                    <td className="p-4 text-center">
                      <input 
                        type="number" 
                        step="0.1"
                        min="0.1"
                        className="w-20 border border-gray-300 rounded p-1 text-center text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQty(item.id, Number(e.target.value), Number(item.unit_price))}
                      />
                    </td>
                    <td className="p-4 text-right text-sm text-gray-600">
                      {Number(item.unit_price).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-right text-sm font-semibold text-gray-900">
                      {Number(item.total_price).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {project.items.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={6} className="p-4 text-right font-bold text-gray-900">
                    GRAND TOTAL
                  </td>
                  <td className="p-4 text-right font-bold text-blue-600 text-lg">
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {isAddItemOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Pilih Material dari Pricelist</h2>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <input
                type="text"
                placeholder="Cari nama material atau spesifikasi..."
                className="w-full border border-gray-300 p-2.5 rounded-lg mb-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  {pricelist.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Tidak ada material yang ditemukan.</div>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 sticky top-0 border-b">
                        <tr>
                          <th className="p-2 pl-4">Material</th>
                          <th className="p-2">Harga</th>
                          <th className="p-2 w-16">Pilih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pricelist.map(item => (
                          <tr key={item.id} className={selectedItem?.id === item.id ? "bg-blue-50" : "hover:bg-gray-50 cursor-pointer"} onClick={() => setSelectedItem(item)}>
                            <td className="p-2 pl-4">
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.category} | {item.specification}</div>
                            </td>
                            <td className="p-2 text-gray-700 font-medium">Rp {Number(item.price).toLocaleString("id-ID")} /{item.unit}</td>
                            <td className="p-2 text-center">
                              <input type="radio" checked={selectedItem?.id === item.id} readOnly />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              
              {selectedItem && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedItem.name}</h4>
                    <p className="text-sm text-gray-600">Rp {Number(selectedItem.price).toLocaleString("id-ID")} / {selectedItem.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Volume:</label>
                    <input 
                      type="number" 
                      min="0.1" 
                      step="0.1" 
                      value={quantity} 
                      onChange={e => setQuantity(Number(e.target.value))}
                      className="w-20 border border-gray-300 p-1.5 rounded-lg text-center outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t flex justify-end gap-3 bg-gray-50/50">
              <button type="button" onClick={() => setIsAddItemOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
              <button 
                type="button" 
                onClick={handleAddItem} 
                disabled={!selectedItem}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
