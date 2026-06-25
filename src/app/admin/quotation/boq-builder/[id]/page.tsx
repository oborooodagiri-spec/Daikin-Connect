"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Printer, Loader2, Save, X, FolderPlus } from "lucide-react";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function BoqEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [itemMode, setItemMode] = useState<"pricelist" | "manual">("pricelist");
  
  // Pricelist Search
  const [pricelist, setPricelist] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPricelistItem, setSelectedPricelistItem] = useState<any>(null);
  
  // Form Data for Manual Item
  const [manualItem, setManualItem] = useState({
    name: "",
    specification: "",
    unit: "Unit",
  });

  const [quantity, setQuantity] = useState<number>(1);
  const [materialPrice, setMaterialPrice] = useState<number>(0);
  const [labourPrice, setLabourPrice] = useState<number>(0);

  // Markups
  const [markupMaterial, setMarkupMaterial] = useState<number>(0);
  const [markupLabour, setMarkupLabour] = useState<number>(0);
  const [savingMarkup, setSavingMarkup] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getBoqProjectDetails(id);
    setProject(data);
    if (data) {
      setMarkupMaterial(Number(data.markup_material) || 0);
      setMarkupLabour(Number(data.markup_labour) || 0);
    }
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
    if (isAddItemOpen && itemMode === "pricelist") {
      const timer = setTimeout(() => {
        loadPricelist(search);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, isAddItemOpen, itemMode]);

  const handleSaveMarkup = async () => {
    setSavingMarkup(true);
    await updateBoqProjectMarkup(id, markupMaterial, markupLabour);
    setSavingMarkup(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addBoqCategory(id, newCategoryName);
    setIsAddCategoryOpen(false);
    setNewCategoryName("");
    loadData();
  };

  const handleDeleteCategory = async (catId: string) => {
    if (confirm("Are you sure you want to delete this category and ALL its items?")) {
      await deleteBoqCategory(catId, id);
      loadData();
    }
  };

  const handleOpenAddItem = (catId: string) => {
    setActiveCategoryId(catId);
    setIsAddItemOpen(true);
    setItemMode("pricelist");
    setSelectedItemData(null);
  };

  const setSelectedItemData = (item: any) => {
    setSelectedPricelistItem(item);
    if (item) {
      setMaterialPrice(Number(item.price));
      setLabourPrice(0);
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
    
    setIsAddItemOpen(false);
    setSelectedItemData(null);
    setManualItem({ name: "", specification: "", unit: "Unit" });
    setQuantity(1);
    setMaterialPrice(0);
    setLabourPrice(0);
    setSearch("");
    loadData();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("Are you sure you want to remove this item?")) {
      await deleteBoqItem(itemId, id);
      loadData();
    }
  };

  const handleInlineUpdate = async (itemId: string, field: "quantity" | "material_price" | "labour_price", val: string) => {
    const num = Number(val);
    if (isNaN(num)) return;
    
    await updateBoqItem(itemId, id, { [field]: num });
    loadData(); // Re-fetch to calculate accurate totals immediately
  };

  const formatPrice = (val: number) => `Rp ${Math.round(val).toLocaleString("id-ID")}`;

  const exportPDF = () => {
    if (!project) return;
    
    const doc = new jsPDF("landscape");
    
    doc.setFontSize(18);
    doc.text("BILL OF QUANTITY", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Proyek    : ${project.project_name}`, 14, 32);
    doc.text(`Customer  : ${project.customer_name || "-"}`, 14, 38);
    doc.text(`Tanggal   : ${new Date().toLocaleDateString("id-ID")}`, 14, 44);
    
    doc.text(`Markup Material: ${(markupMaterial * 100).toFixed(0)}%`, 200, 32);
    doc.text(`Markup Labour  : ${(markupLabour * 100).toFixed(0)}%`, 200, 38);

    const tableData: any[] = [];
    
    let grandMatTotal = 0;
    let grandLabTotal = 0;

    project.categories.forEach((cat: any, catIndex: number) => {
      // Category Header
      tableData.push([
        { content: String.fromCharCode(65 + catIndex), styles: { fontStyle: 'bold' } },
        { content: cat.name, colSpan: 8, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
      ]);

      let catMatTotal = 0;
      let catLabTotal = 0;

      cat.items.forEach((item: any, idx: number) => {
        const matTotal = Number(item.material_price) * item.quantity;
        const labTotal = Number(item.labour_price) * item.quantity;
        const rowTotal = matTotal + labTotal;
        
        catMatTotal += matTotal;
        catLabTotal += labTotal;

        const itemName = item.pricelist ? item.pricelist.name : item.manual_name;
        const itemSpec = item.pricelist ? item.pricelist.specification : item.specification;
        const unit = item.pricelist ? item.pricelist.unit : item.unit;

        tableData.push([
          idx + 1,
          itemName,
          itemSpec || "-",
          item.quantity.toString(),
          unit,
          formatPrice(Number(item.material_price)),
          formatPrice(Number(item.labour_price)),
          formatPrice(matTotal),
          formatPrice(labTotal),
        ]);
      });

      grandMatTotal += catMatTotal;
      grandLabTotal += catLabTotal;

      // Category Subtotal
      tableData.push([
        "",
        { content: `SUB TOTAL ${cat.name}`, colSpan: 6, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatPrice(catMatTotal), styles: { fontStyle: 'bold' } },
        { content: formatPrice(catLabTotal), styles: { fontStyle: 'bold' } }
      ]);
      
      tableData.push([{ content: "", colSpan: 9, styles: { cellPadding: 2 } }]); // Empty row for spacing
    });

    // Grand Totals Base
    tableData.push([
      { content: 'GRAND TOTAL BASE', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', fillColor: [220, 230, 245] } },
      { content: formatPrice(grandMatTotal), styles: { fontStyle: 'bold', fillColor: [220, 230, 245] } },
      { content: formatPrice(grandLabTotal), styles: { fontStyle: 'bold', fillColor: [220, 230, 245] } }
    ]);

    // Grand Totals with Markup
    const grandMatMarkup = grandMatTotal * (1 + markupMaterial);
    const grandLabMarkup = grandLabTotal * (1 + markupLabour);

    tableData.push([
      { content: 'GRAND TOTAL + MARKUP', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', fillColor: [0, 115, 234], textColor: 255 } },
      { content: formatPrice(grandMatMarkup), styles: { fontStyle: 'bold', fillColor: [0, 115, 234], textColor: 255 } },
      { content: formatPrice(grandLabMarkup), styles: { fontStyle: 'bold', fillColor: [0, 115, 234], textColor: 255 } }
    ]);
    
    const finalTotal = grandMatMarkup + grandLabMarkup;
    tableData.push([
      { content: 'TOTAL PROJECT VALUE', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', fontSize: 12 } },
      { content: formatPrice(finalTotal), colSpan: 2, styles: { fontStyle: 'bold', halign: 'center', fontSize: 12 } }
    ]);

    autoTable(doc, {
      startY: 50,
      head: [
        [
          { content: 'No', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
          { content: 'Deskripsi', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'Spesifikasi', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'QTY', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
          { content: 'Sat', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
          { content: 'Harga Satuan (Rp)', colSpan: 2, styles: { halign: 'center' } },
          { content: 'Total Harga (Rp)', colSpan: 2, styles: { halign: 'center' } }
        ],
        ['Material', 'Labour', 'Material', 'Labour']
      ],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [50, 50, 50], textColor: 255 },
      styles: { fontSize: 8 },
    });
    
    doc.save(`BOQ_${project.project_name.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  let overallMatTotal = 0;
  let overallLabTotal = 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto pb-32">
      <div className="mb-4">
        <button onClick={() => router.push('/admin/quotation/boq-builder')} className="text-gray-500 hover:text-gray-800 flex items-center font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
            <p className="text-gray-600 mt-2 font-medium">Customer: {project.customer_name || "-"}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium flex items-center shadow-sm transition-colors"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Tambah Kategori
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

        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex flex-wrap items-end gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Markup Material (%)</label>
            <div className="flex items-center">
              <input 
                type="number" 
                value={markupMaterial * 100} 
                onChange={e => setMarkupMaterial(Number(e.target.value) / 100)}
                className="w-24 border border-gray-300 rounded-l-lg p-2 text-right focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-lg text-gray-500">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Markup Labour (%)</label>
            <div className="flex items-center">
              <input 
                type="number" 
                value={markupLabour * 100} 
                onChange={e => setMarkupLabour(Number(e.target.value) / 100)}
                className="w-24 border border-gray-300 rounded-l-lg p-2 text-right focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-lg text-gray-500">%</span>
            </div>
          </div>
          <button 
            onClick={handleSaveMarkup}
            disabled={savingMarkup}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors h-[42px]"
          >
            {savingMarkup ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Markup
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-800 text-white text-xs uppercase tracking-wider">
                <th className="p-3 font-semibold w-12 text-center border-r border-gray-700" rowSpan={2}>No</th>
                <th className="p-3 font-semibold border-r border-gray-700" rowSpan={2}>Deskripsi</th>
                <th className="p-3 font-semibold border-r border-gray-700" rowSpan={2}>Spesifikasi</th>
                <th className="p-3 font-semibold text-center w-24 border-r border-gray-700" rowSpan={2}>QTY</th>
                <th className="p-3 font-semibold text-center w-20 border-r border-gray-700" rowSpan={2}>Sat</th>
                <th className="p-2 font-semibold text-center border-b border-gray-700 border-r border-gray-700" colSpan={2}>Harga Satuan (Rp)</th>
                <th className="p-2 font-semibold text-center border-b border-gray-700 border-r border-gray-700" colSpan={2}>Total Harga (Rp)</th>
                <th className="p-3 font-semibold text-center w-16" rowSpan={2}>Aksi</th>
              </tr>
              <tr className="bg-gray-700 text-gray-200 text-xs uppercase tracking-wider">
                <th className="p-2 font-semibold text-right w-32 border-r border-gray-600">Material</th>
                <th className="p-2 font-semibold text-right w-32 border-r border-gray-600">Labour</th>
                <th className="p-2 font-semibold text-right w-36 border-r border-gray-600">Material</th>
                <th className="p-2 font-semibold text-right w-36 border-r border-gray-600">Labour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {project.categories.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-gray-500">
                    Belum ada kategori. Silakan tambah kategori terlebih dahulu.
                  </td>
                </tr>
              ) : (
                project.categories.map((cat: any, catIdx: number) => {
                  let catMatTotal = 0;
                  let catLabTotal = 0;

                  return (
                    <React.Fragment key={cat.id}>
                      {/* Category Header */}
                      <tr className="bg-gray-100">
                        <td className="p-3 font-bold text-center text-gray-800 border-r border-gray-200">
                          {String.fromCharCode(65 + catIdx)}
                        </td>
                        <td colSpan={8} className="p-3 font-bold text-gray-800 border-r border-gray-200 uppercase">
                          {cat.name}
                        </td>
                        <td className="p-2 text-center">
                          <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      
                      {/* Items */}
                      {cat.items.length === 0 ? (
                        <tr>
                          <td className="border-r border-gray-200"></td>
                          <td colSpan={9} className="p-4 text-sm text-gray-500 italic bg-white">
                            Kategori kosong. Tekan tombol di bawah untuk menambah baris.
                          </td>
                        </tr>
                      ) : (
                        cat.items.map((item: any, idx: number) => {
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
                            <tr key={item.id} className="hover:bg-blue-50/30 bg-white group transition-colors">
                              <td className="p-3 text-center text-sm text-gray-500 border-r border-gray-200">{idx + 1}</td>
                              <td className="p-3 text-sm font-medium text-gray-900 border-r border-gray-200 whitespace-normal min-w-[200px]">{itemName}</td>
                              <td className="p-3 text-sm text-gray-500 border-r border-gray-200 whitespace-normal min-w-[150px]">{itemSpec || "-"}</td>
                              <td className="p-2 text-center border-r border-gray-200">
                                <input 
                                  type="number" 
                                  step="0.1" min="0"
                                  className="w-16 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 text-center text-sm outline-none transition-all"
                                  defaultValue={item.quantity}
                                  onBlur={(e) => handleInlineUpdate(item.id, "quantity", e.target.value)}
                                />
                              </td>
                              <td className="p-3 text-center text-sm text-gray-600 border-r border-gray-200">{unit}</td>
                              <td className="p-2 border-r border-gray-200">
                                <input 
                                  type="number" min="0"
                                  className="w-full border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 text-right text-sm outline-none transition-all"
                                  defaultValue={Number(item.material_price)}
                                  onBlur={(e) => handleInlineUpdate(item.id, "material_price", e.target.value)}
                                />
                              </td>
                              <td className="p-2 border-r border-gray-200">
                                <input 
                                  type="number" min="0"
                                  className="w-full border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 text-right text-sm outline-none transition-all"
                                  defaultValue={Number(item.labour_price)}
                                  onBlur={(e) => handleInlineUpdate(item.id, "labour_price", e.target.value)}
                                />
                              </td>
                              <td className="p-3 text-right text-sm text-gray-700 font-medium border-r border-gray-200 bg-gray-50/50">{formatPrice(matTotal)}</td>
                              <td className="p-3 text-right text-sm text-gray-700 font-medium border-r border-gray-200 bg-gray-50/50">{formatPrice(labTotal)}</td>
                              <td className="p-2 text-center">
                                <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-5 h-5 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                      
                      {/* Subtotal Row */}
                      <tr className="bg-blue-50/50">
                        <td colSpan={7} className="p-3 text-right text-sm font-bold text-gray-700 border-r border-gray-200">
                          SUB TOTAL {cat.name}
                        </td>
                        <td className="p-3 text-right text-sm font-bold text-gray-900 border-r border-gray-200">{formatPrice(catMatTotal)}</td>
                        <td className="p-3 text-right text-sm font-bold text-gray-900 border-r border-gray-200">{formatPrice(catLabTotal)}</td>
                        <td></td>
                      </tr>

                      {/* Add Item Button Row */}
                      <tr className="bg-white">
                        <td className="border-r border-gray-200"></td>
                        <td colSpan={9} className="p-2">
                          <button 
                            onClick={() => handleOpenAddItem(cat.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center py-1 px-2 rounded hover:bg-blue-50 transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Tambah Baris di {cat.name}
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}

              {/* Grand Totals */}
              {project.categories.length > 0 && (
                <>
                  <tr className="bg-gray-800 text-white border-t-4 border-gray-900">
                    <td colSpan={7} className="p-4 text-right font-bold text-sm tracking-wide">GRAND TOTAL BASE</td>
                    <td className="p-4 text-right font-bold text-sm">{formatPrice(overallMatTotal)}</td>
                    <td className="p-4 text-right font-bold text-sm">{formatPrice(overallLabTotal)}</td>
                    <td></td>
                  </tr>
                  
                  <tr className="bg-blue-700 text-white">
                    <td colSpan={7} className="p-4 text-right font-bold text-sm tracking-wide">
                      GRAND TOTAL + MARKUP (Mat: {markupMaterial*100}%, Lab: {markupLabour*100}%)
                    </td>
                    <td className="p-4 text-right font-bold text-sm text-blue-100">{formatPrice(overallMatTotal * (1 + markupMaterial))}</td>
                    <td className="p-4 text-right font-bold text-sm text-blue-100">{formatPrice(overallLabTotal * (1 + markupLabour))}</td>
                    <td></td>
                  </tr>

                  <tr className="bg-blue-900 text-white">
                    <td colSpan={7} className="p-5 text-right font-bold text-base tracking-wide uppercase">TOTAL PROJECT VALUE</td>
                    <td colSpan={2} className="p-5 text-center font-bold text-xl text-yellow-300 tracking-wider">
                      {formatPrice((overallMatTotal * (1 + markupMaterial)) + (overallLabTotal * (1 + markupLabour)))}
                    </td>
                    <td></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Kategori */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Kategori BoQ</h2>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                <input
                  required
                  autoFocus
                  type="text"
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Misal: I. PRELIMINARY"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAddCategoryOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Simpan Kategori</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Item */}
      {isAddItemOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Tambah Item Baru</h2>
              <button onClick={() => setIsAddItemOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button 
                className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${itemMode === "pricelist" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                onClick={() => setItemMode("pricelist")}
              >
                Pilih dari Master Pricelist
              </button>
              <button 
                className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${itemMode === "manual" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                onClick={() => setItemMode("manual")}
              >
                Input Manual (Custom)
              </button>
            </div>

            <form onSubmit={handleAddItem}>
              {itemMode === "pricelist" ? (
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Cari material dari Master Pricelist..."
                    className="w-full border p-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white shadow-inner">
                    {pricelist.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Tidak ada material yang cocok.</div>
                    ) : (
                      pricelist.map(item => (
                        <div 
                          key={item.id} 
                          className={`p-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-blue-50 transition-colors flex justify-between items-center ${selectedPricelistItem?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                          onClick={() => setSelectedItemData(item)}
                        >
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{item.specification || "Tanpa spesifikasi"} • {item.unit}</div>
                          </div>
                          <div className="font-semibold text-blue-600 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">
                            {formatPrice(Number(item.price))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Item *</label>
                    <input required type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Misal: Biaya Transportasi" value={manualItem.name} onChange={e => setManualItem({...manualItem, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Spesifikasi</label>
                      <input type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Opsional" value={manualItem.specification} onChange={e => setManualItem({...manualItem, specification: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Satuan *</label>
                      <input required type="text" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Misal: Ls, Unit, M" value={manualItem.unit} onChange={e => setManualItem({...manualItem, unit: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Volume (QTY)</label>
                    <input required type="number" step="0.1" min="0" className="w-full border p-2.5 rounded-lg" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Harga Material (Rp)</label>
                    <input required type="number" min="0" className="w-full border p-2.5 rounded-lg" value={materialPrice} onChange={e => setMaterialPrice(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Harga Labour (Rp)</label>
                    <input required type="number" min="0" className="w-full border p-2.5 rounded-lg" value={labourPrice} onChange={e => setLabourPrice(Number(e.target.value))} />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-semibold text-gray-600">Total Baris Ini:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice((materialPrice + labourPrice) * quantity)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button 
                  type="submit" 
                  disabled={itemMode === "pricelist" && !selectedPricelistItem}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-colors"
                >
                  Tambah ke BoQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
