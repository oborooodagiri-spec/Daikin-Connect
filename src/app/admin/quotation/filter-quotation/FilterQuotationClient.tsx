"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Search, Edit2, Trash2, X, Wind, Send, Copy, Check,
  FileText, Download, Printer, ChevronRight, Package, MessageSquare,
  DollarSign, Truck, Clock, CalendarDays, Save, Eye, Filter as FilterIcon
} from "lucide-react";
import {
  getFilterProducts, createFilterProduct, updateFilterProduct, deleteFilterProduct,
  getFilterQuotations, generateQuoNumber, saveFilterQuotation, deleteFilterQuotation
} from "./actions";

// ============================================
// TYPES
// ============================================
type FilterProduct = {
  id: string;
  filter_type: string;
  efficiency: string;
  dimensions: string;
  frame_material: string | null;
  vendor_name: string | null;
  vendor_phone: string | null;
  buy_price: number;
  notes: string | null;
  created_at: Date;
};

type QuotationItem = {
  product_id: string;
  description: string;
  dimensions: string;
  qty: number;
  buy_price: number;
  sell_price: number;
};

type FilterQuotation = {
  id: string;
  quo_number: string;
  customer_name: string;
  project_name: string | null;
  items: QuotationItem[];
  margin_pct: number;
  subtotal: number;
  ppn: number;
  shipping_cost: number;
  grand_total: number;
  delivery_terms: string;
  lead_time_days: number;
  valid_days: number;
  notes: string | null;
  status: string;
  created_at: Date;
};

// ============================================
// CONSTANTS
// ============================================
const FILTER_TYPES = ["Panel", "Pocket/Bag", "HEPA", "Carbon", "Medium"];
const EFFICIENCY_MAP: Record<string, string[]> = {
  Panel: ["G2", "G3", "G4"],
  "Pocket/Bag": ["M5", "M6", "F7", "F8", "F9"],
  HEPA: ["H10", "H11", "H12", "H13", "H14"],
  Carbon: ["Activated Carbon"],
  Medium: ["M5", "M6", "F7", "F8", "F9"],
};
const FRAME_MATERIALS = ["Galvanized Steel", "Aluminum", "Cardboard", "ABS Plastic"];
const STANDARD_SIZES = [
  "287x592x535", "490x592x535", "592x592x535", "592x490x535",
  "610x610x50", "610x610x96", "610x610x292", "610x305x292",
  "490x490x50", "490x490x96", "305x610x50", "495x495x50",
];

const formatRp = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

// ============================================
// MAIN COMPONENT
// ============================================
export default function FilterQuotationClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"catalog" | "quotation" | "history">("catalog");
  const [products, setProducts] = useState<FilterProduct[]>([]);
  const [quotations, setQuotations] = useState<FilterQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FilterProduct | null>(null);

  // Vendor Request Modal
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedForVendor, setSelectedForVendor] = useState<string[]>([]);
  const [vendorCopied, setVendorCopied] = useState(false);

  // Quotation Builder
  const [showQuoBuilder, setShowQuoBuilder] = useState(false);
  const [quoItems, setQuoItems] = useState<QuotationItem[]>([]);
  const [quoForm, setQuoForm] = useState({
    customer_name: "",
    project_name: "",
    quo_number: "",
    margin_pct: 25,
    ppn_enabled: true,
    delivery_terms: "Ex-Works" as "Ex-Works" | "Franco Proyek",
    shipping_cost: 0,
    lead_time_days: 14,
    valid_days: 30,
    notes: "",
  });
  const [editingQuo, setEditingQuo] = useState<FilterQuotation | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, q] = await Promise.all([getFilterProducts(), getFilterQuotations()]);
      setProducts(p);
      setQuotations(q);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (typeFilter !== "All" && p.filter_type !== typeFilter) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          p.filter_type.toLowerCase().includes(s) ||
          p.efficiency.toLowerCase().includes(s) ||
          p.dimensions.includes(s) ||
          (p.vendor_name || "").toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [products, searchTerm, typeFilter]);

  // Quotation calculations
  const quoCalc = useMemo(() => {
    const hpp = quoItems.reduce((sum, item) => sum + item.buy_price * item.qty, 0);
    const marginAmount = hpp * (quoForm.margin_pct / 100);
    const subtotal = hpp + marginAmount;
    const ppn = quoForm.ppn_enabled ? subtotal * 0.11 : 0;
    const shipping = quoForm.delivery_terms === "Franco Proyek" ? quoForm.shipping_cost : 0;
    const grand = subtotal + ppn + shipping;

    // Calculate sell prices per item
    const itemsWithSell = quoItems.map((item) => ({
      ...item,
      sell_price: Math.round(item.buy_price * (1 + quoForm.margin_pct / 100)),
    }));

    return { hpp, marginAmount, subtotal, ppn, shipping, grand, itemsWithSell };
  }, [quoItems, quoForm]);

  // ============================================
  // PRODUCT MODAL HANDLERS
  // ============================================
  const [formProduct, setFormProduct] = useState({
    filter_type: "Panel",
    efficiency: "G4",
    dimensions: "610x610x50",
    frame_material: "Galvanized Steel",
    vendor_name: "",
    vendor_phone: "",
    buy_price: 0,
    notes: "",
  });

  const openProductModal = (product?: FilterProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormProduct({
        filter_type: product.filter_type,
        efficiency: product.efficiency,
        dimensions: product.dimensions,
        frame_material: product.frame_material || "Galvanized Steel",
        vendor_name: product.vendor_name || "",
        vendor_phone: product.vendor_phone || "",
        buy_price: product.buy_price,
        notes: product.notes || "",
      });
    } else {
      setEditingProduct(null);
      setFormProduct({
        filter_type: "Panel",
        efficiency: "G4",
        dimensions: "610x610x50",
        frame_material: "Galvanized Steel",
        vendor_name: "",
        vendor_phone: "",
        buy_price: 0,
        notes: "",
      });
    }
    setShowProductModal(true);
  };

  const saveProduct = async () => {
    if (editingProduct) {
      await updateFilterProduct(editingProduct.id, formProduct);
    } else {
      await createFilterProduct(formProduct);
    }
    setShowProductModal(false);
    loadData();
  };

  const removeProduct = async (id: string) => {
    if (confirm("Hapus produk filter ini?")) {
      await deleteFilterProduct(id);
      loadData();
    }
  };

  // ============================================
  // VENDOR REQUEST
  // ============================================
  const generateVendorMessage = () => {
    const selected = products.filter((p) => selectedForVendor.includes(p.id));
    const lines = selected.map(
      (p, i) => `${i + 1}. ${p.filter_type} Filter ${p.efficiency}, ${p.dimensions}mm, Frame ${p.frame_material || "-"}`
    );
    return `Kepada Yth. Bapak/Ibu,

Dengan hormat, kami dari PT Value Engineering Services of EPL bermaksud meminta penawaran harga untuk filter berikut:

${lines.join("\n")}

Mohon dapat diinformasikan:
- Harga satuan per unit
- Minimum order quantity
- Estimasi waktu pengiriman

Terima kasih atas perhatiannya.

Hormat kami,
PT Value Engineering Services of EPL`;
  };

  const copyVendorMessage = () => {
    navigator.clipboard.writeText(generateVendorMessage());
    setVendorCopied(true);
    setTimeout(() => setVendorCopied(false), 2000);
  };

  const sendViaWhatsApp = () => {
    const msg = encodeURIComponent(generateVendorMessage());
    const vendorProduct = products.find((p) => selectedForVendor.includes(p.id) && p.vendor_phone);
    const phone = vendorProduct?.vendor_phone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  // ============================================
  // QUOTATION BUILDER
  // ============================================
  const openQuoBuilder = async (quo?: FilterQuotation) => {
    if (quo) {
      setEditingQuo(quo);
      setQuoItems(quo.items);
      setQuoForm({
        customer_name: quo.customer_name,
        project_name: quo.project_name || "",
        quo_number: quo.quo_number,
        margin_pct: quo.margin_pct,
        ppn_enabled: quo.ppn > 0,
        delivery_terms: quo.delivery_terms as any,
        shipping_cost: quo.shipping_cost,
        lead_time_days: quo.lead_time_days,
        valid_days: quo.valid_days,
        notes: quo.notes || "",
      });
    } else {
      setEditingQuo(null);
      setQuoItems([]);
      const num = await generateQuoNumber();
      setQuoForm({
        customer_name: "",
        project_name: "",
        quo_number: num,
        margin_pct: 25,
        ppn_enabled: true,
        delivery_terms: "Ex-Works",
        shipping_cost: 0,
        lead_time_days: 14,
        valid_days: 30,
        notes: "",
      });
    }
    setShowQuoBuilder(true);
  };

  const addItemToQuo = (product: FilterProduct) => {
    if (quoItems.find((i) => i.product_id === product.id)) return;
    setQuoItems([
      ...quoItems,
      {
        product_id: product.id,
        description: `${product.filter_type} Filter ${product.efficiency}`,
        dimensions: product.dimensions,
        qty: 1,
        buy_price: product.buy_price,
        sell_price: Math.round(product.buy_price * (1 + quoForm.margin_pct / 100)),
      },
    ]);
  };

  const removeItemFromQuo = (productId: string) => {
    setQuoItems(quoItems.filter((i) => i.product_id !== productId));
  };

  const updateItemQty = (productId: string, qty: number) => {
    setQuoItems(quoItems.map((i) => (i.product_id === productId ? { ...i, qty: Math.max(1, qty) } : i)));
  };

  const saveQuotation = async (status = "Draft") => {
    if (!quoForm.customer_name) return alert("Nama customer wajib diisi");
    if (quoItems.length === 0) return alert("Tambahkan minimal 1 item");

    await saveFilterQuotation({
      id: editingQuo?.id,
      quo_number: quoForm.quo_number,
      customer_name: quoForm.customer_name,
      project_name: quoForm.project_name,
      items: quoCalc.itemsWithSell,
      margin_pct: quoForm.margin_pct,
      subtotal: quoCalc.subtotal,
      ppn: quoCalc.ppn,
      shipping_cost: quoCalc.shipping,
      grand_total: quoCalc.grand,
      delivery_terms: quoForm.delivery_terms,
      lead_time_days: quoForm.lead_time_days,
      valid_days: quoForm.valid_days,
      notes: quoForm.notes,
      status,
    });
    setShowQuoBuilder(false);
    loadData();
    setActiveTab("history");
  };

  // ============================================
  // PDF GENERATION
  // ============================================
  const downloadPDF = async (quo?: FilterQuotation) => {
    const data = quo || {
      quo_number: quoForm.quo_number,
      customer_name: quoForm.customer_name,
      project_name: quoForm.project_name,
      items: quoCalc.itemsWithSell,
      margin_pct: quoForm.margin_pct,
      subtotal: quoCalc.subtotal,
      ppn: quoCalc.ppn,
      shipping_cost: quoCalc.shipping,
      grand_total: quoCalc.grand,
      delivery_terms: quoForm.delivery_terms,
      lead_time_days: quoForm.lead_time_days,
      valid_days: quoForm.valid_days,
      notes: quoForm.notes,
      created_at: new Date(),
    };

    const { default: jsPDF } = await import("jspdf");
    await import("jspdf-autotable");
    const doc = new jsPDF("p", "mm", "a4");

    // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PT VALUE ENGINEERING SERVICES OF EPL", 105, 20, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Air Conditioning & Mechanical Engineering Contractor", 105, 26, { align: "center" });

    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.8);
    doc.line(15, 30, 195, 30);

    // Title
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("SURAT PENAWARAN HARGA - FILTER", 105, 40, { align: "center" });

    // Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date(data.created_at).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
    doc.text(`No: ${data.quo_number}`, 15, 50);
    doc.text(`Tanggal: ${dateStr}`, 195, 50, { align: "right" });
    doc.text(`Kepada: ${data.customer_name}`, 15, 58);
    if (data.project_name) doc.text(`Proyek: ${data.project_name}`, 15, 64);

    // Table
    const startY = data.project_name ? 72 : 66;
    const items = Array.isArray(data.items) ? data.items : JSON.parse(data.items as any);
    const tableRows = items.map((item: any, i: number) => [
      i + 1,
      `${item.description}\n${item.dimensions}mm`,
      item.qty,
      "pcs",
      formatRp(item.sell_price),
      formatRp(item.sell_price * item.qty),
    ]);

    (doc as any).autoTable({
      startY,
      head: [["No", "Deskripsi", "Qty", "Satuan", "Harga Satuan", "Total"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "right", cellWidth: 35 },
        5: { halign: "right", cellWidth: 38 },
      },
    });

    let finalY = (doc as any).lastAutoTable.finalY + 8;

    // Summary
    doc.setFontSize(10);
    const summaryX = 130;
    doc.text("Subtotal:", summaryX, finalY);
    doc.text(formatRp(data.subtotal), 195, finalY, { align: "right" });
    finalY += 6;

    if (data.ppn > 0) {
      doc.text("PPN 11%:", summaryX, finalY);
      doc.text(formatRp(data.ppn), 195, finalY, { align: "right" });
      finalY += 6;
    }

    if (data.shipping_cost > 0) {
      doc.text("Ongkos Kirim:", summaryX, finalY);
      doc.text(formatRp(data.shipping_cost), 195, finalY, { align: "right" });
      finalY += 6;
    }

    doc.setLineWidth(0.5);
    doc.line(summaryX, finalY - 2, 195, finalY - 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("GRAND TOTAL:", summaryX, finalY + 4);
    doc.text(formatRp(data.grand_total), 195, finalY + 4, { align: "right" });

    // Terms
    finalY += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Delivery Terms: ${data.delivery_terms}`, 15, finalY);
    finalY += 5;
    doc.text(`Lead Time: ${data.lead_time_days} hari kerja setelah PO diterima`, 15, finalY);
    finalY += 5;
    const validDate = new Date(data.created_at);
    validDate.setDate(validDate.getDate() + data.valid_days);
    doc.text(`Berlaku sampai: ${validDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 15, finalY);

    if (data.notes) {
      finalY += 8;
      doc.text(`Catatan: ${data.notes}`, 15, finalY);
    }

    // Signature
    finalY += 18;
    doc.text("Hormat kami,", 150, finalY, { align: "center" });
    finalY += 20;
    doc.setFont("helvetica", "bold");
    doc.text("PT Value Engineering Services of EPL", 150, finalY, { align: "center" });

    doc.save(`${data.quo_number}.pdf`);
  };

  // ============================================
  // RENDER
  // ============================================
  const cardStyle = {
    background: "white",
    borderRadius: 16,
    border: "1px solid #e6e9ef",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] font-['Inter']">
      {/* Header */}
      <div className="bg-white border-b border-[#e6e9ef] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin/quotation")} className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
              <ArrowLeft size={16} />
            </button>
            <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <Wind size={18} />
            </div>
            <h1 className="text-lg font-black text-[#1c1d22] tracking-tight">Filter Quotation</h1>
          </div>
          <button
            onClick={() => openQuoBuilder()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm"
          >
            <Plus size={16} /> Buat Penawaran
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#e6e9ef]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex gap-0">
          {(
            [
              { id: "catalog", label: "Katalog Filter", icon: Package },
              { id: "quotation", label: "Buat Quotation", icon: FileText },
              { id: "history", label: "Riwayat", icon: CalendarDays },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "quotation") openQuoBuilder();
              }}
              className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {activeTab === "catalog" && (
          <div className="space-y-5">
            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center flex-1">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Cari filter..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-teal-400"
                >
                  <option value="All">Semua Tipe</option>
                  {FILTER_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedForVendor(products.filter((p) => p.buy_price === 0).map((p) => p.id));
                    setShowVendorModal(true);
                  }}
                  className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-amber-200 transition"
                >
                  <MessageSquare size={15} /> Minta Harga Vendor
                </button>
                <button
                  onClick={() => openProductModal()}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition"
                >
                  <Plus size={15} /> Tambah Produk
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div style={cardStyle} className="overflow-x-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Wind size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold">Belum ada produk filter</p>
                  <p className="text-sm mt-1">Klik "Tambah Produk" untuk mulai</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipe</th>
                      <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Efisiensi</th>
                      <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Dimensi (mm)</th>
                      <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Frame</th>
                      <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor</th>
                      <th className="text-right py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Harga Beli (HPP)</th>
                      <th className="text-center py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-teal-50/30 transition">
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold">
                            <Wind size={12} />
                            {p.filter_type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-800">{p.efficiency}</td>
                        <td className="py-3 px-3 text-gray-600 font-mono text-xs">{p.dimensions}</td>
                        <td className="py-3 px-3 text-gray-500">{p.frame_material || "-"}</td>
                        <td className="py-3 px-3 text-gray-600">{p.vendor_name || <span className="text-gray-300 italic">Belum diisi</span>}</td>
                        <td className="py-3 px-3 text-right">
                          {p.buy_price > 0 ? (
                            <span className="font-bold text-green-600">{formatRp(p.buy_price)}</span>
                          ) : (
                            <span className="text-amber-500 font-semibold text-xs bg-amber-50 px-2 py-1 rounded-lg">Belum ada harga</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openProductModal(p)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-teal-600 transition" title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => removeProduct(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition" title="Hapus">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            {quotations.length === 0 ? (
              <div style={cardStyle} className="text-center py-16 text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold">Belum ada riwayat quotation</p>
              </div>
            ) : (
              quotations.map((q) => (
                <div key={q.id} style={cardStyle} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-teal-200 transition cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-black text-gray-800">{q.quo_number}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        q.status === "Draft" ? "bg-gray-100 text-gray-500" :
                        q.status === "Sent" ? "bg-blue-50 text-blue-600" :
                        q.status === "Accepted" ? "bg-green-50 text-green-600" :
                        "bg-red-50 text-red-500"
                      }`}>{q.status}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {q.customer_name} {q.project_name ? `- ${q.project_name}` : ""} | {q.items.length} items
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(q.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      {" | "}{q.delivery_terms} | Lead time: {q.lead_time_days} hari
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Grand Total</p>
                      <p className="text-lg font-black text-teal-600">{formatRp(q.grand_total)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openQuoBuilder(q)} className="p-2 rounded-lg text-gray-400 hover:bg-teal-50 hover:text-teal-600 transition" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => downloadPDF(q)} className="p-2 rounded-lg text-gray-400 hover:bg-teal-50 hover:text-teal-600 transition" title="Download PDF">
                        <Download size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Hapus quotation ini?")) {
                            deleteFilterQuotation(q.id);
                            loadData();
                          }
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                        title="Hapus"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* PRODUCT MODAL */}
      {/* ============================================ */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-black">{editingProduct ? "Edit Produk" : "Tambah Produk Filter"}</h3>
                <button onClick={() => setShowProductModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Tipe Filter</label>
                    <select value={formProduct.filter_type} onChange={(e) => {
                      const t = e.target.value;
                      setFormProduct({ ...formProduct, filter_type: t, efficiency: EFFICIENCY_MAP[t]?.[0] || "" });
                    }} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400">
                      {FILTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Kelas Efisiensi</label>
                    <select value={formProduct.efficiency} onChange={(e) => setFormProduct({ ...formProduct, efficiency: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400">
                      {(EFFICIENCY_MAP[formProduct.filter_type] || []).map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Dimensi (PxLxT mm)</label>
                    <select value={formProduct.dimensions} onChange={(e) => setFormProduct({ ...formProduct, dimensions: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400">
                      {STANDARD_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      <option value="custom">Custom...</option>
                    </select>
                    {formProduct.dimensions === "custom" && (
                      <input type="text" placeholder="contoh: 500x500x100" onChange={(e) => setFormProduct({ ...formProduct, dimensions: e.target.value })} className="w-full mt-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Frame Material</label>
                    <select value={formProduct.frame_material} onChange={(e) => setFormProduct({ ...formProduct, frame_material: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400">
                      {FRAME_MATERIALS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Nama Vendor</label>
                    <input type="text" value={formProduct.vendor_name} onChange={(e) => setFormProduct({ ...formProduct, vendor_name: e.target.value })} placeholder="PT ABC Filter" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Telepon Vendor</label>
                    <input type="text" value={formProduct.vendor_phone} onChange={(e) => setFormProduct({ ...formProduct, vendor_phone: e.target.value })} placeholder="08xx" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Harga Beli / HPP (Rp)</label>
                  <input type="number" value={formProduct.buy_price || ""} onChange={(e) => setFormProduct({ ...formProduct, buy_price: Number(e.target.value) })} placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Catatan</label>
                  <textarea value={formProduct.notes} onChange={(e) => setFormProduct({ ...formProduct, notes: e.target.value })} rows={2} placeholder="MOQ, waktu kirim, dll" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 resize-none" />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setShowProductModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition">Batal</button>
                <button onClick={saveProduct} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 transition">
                  {editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* VENDOR REQUEST MODAL */}
      {/* ============================================ */}
      <AnimatePresence>
        {showVendorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVendorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-black flex items-center gap-2"><MessageSquare size={20} className="text-amber-500" /> Minta Harga ke Vendor</h3>
                <p className="text-sm text-gray-400 mt-1">Pilih produk yang ingin ditanyakan harganya, lalu kirim via WhatsApp atau copy pesan</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedForVendor.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedForVendor([...selectedForVendor, p.id]);
                          else setSelectedForVendor(selectedForVendor.filter((id) => id !== p.id));
                        }}
                        className="w-4 h-4 rounded accent-teal-600"
                      />
                      <span className="text-sm font-semibold text-gray-700 flex-1">
                        {p.filter_type} {p.efficiency} — {p.dimensions}mm — Frame {p.frame_material || "-"}
                      </span>
                      {p.buy_price > 0 ? (
                        <span className="text-xs text-green-600 font-bold">{formatRp(p.buy_price)}</span>
                      ) : (
                        <span className="text-xs text-amber-500 font-bold">Belum ada harga</span>
                      )}
                    </label>
                  ))}
                </div>

                {selectedForVendor.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 mb-2">Preview Pesan:</p>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{generateVendorMessage()}</pre>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-between">
                <span className="text-sm text-gray-400">{selectedForVendor.length} produk dipilih</span>
                <div className="flex gap-2">
                  <button onClick={copyVendorMessage} disabled={selectedForVendor.length === 0} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-40">
                    {vendorCopied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                    {vendorCopied ? "Tersalin!" : "Copy Pesan"}
                  </button>
                  <button onClick={sendViaWhatsApp} disabled={selectedForVendor.length === 0} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-40">
                    <Send size={15} /> Kirim via WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* QUOTATION BUILDER MODAL (FULL SCREEN) */}
      {/* ============================================ */}
      <AnimatePresence>
        {showQuoBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#fafbfc] z-50 overflow-y-auto"
          >
            {/* Quo Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowQuoBuilder(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
                  <h2 className="text-sm font-black text-gray-800">{editingQuo ? "Edit Penawaran" : "Buat Penawaran Baru"}</h2>
                  <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">{quoForm.quo_number}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveQuotation("Draft")} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center gap-1.5">
                    <Save size={14} /> Simpan Draft
                  </button>
                  <button onClick={() => downloadPDF()} className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition flex items-center gap-1.5">
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Product picker & Items */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Customer Info */}
                  <div style={cardStyle}>
                    <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"><FileText size={16} className="text-teal-600" /> Informasi Penawaran</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Nama Customer *</label>
                        <input type="text" value={quoForm.customer_name} onChange={(e) => setQuoForm({ ...quoForm, customer_name: e.target.value })} placeholder="PT ABC" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Nama Proyek</label>
                        <input type="text" value={quoForm.project_name} onChange={(e) => setQuoForm({ ...quoForm, project_name: e.target.value })} placeholder="Gedung XYZ" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400" />
                      </div>
                    </div>
                  </div>

                  {/* Add Items from Catalog */}
                  <div style={cardStyle}>
                    <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"><Package size={16} className="text-teal-600" /> Pilih Produk dari Katalog</h3>
                    {products.filter((p) => p.buy_price > 0).length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">Belum ada produk dengan harga. Silakan input harga di Katalog Filter terlebih dahulu.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {products.filter((p) => p.buy_price > 0).map((p) => {
                          const added = quoItems.find((i) => i.product_id === p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => !added && addItemToQuo(p)}
                              disabled={!!added}
                              className={`text-left p-3 rounded-xl border transition text-sm ${
                                added ? "border-teal-200 bg-teal-50 opacity-60" : "border-gray-100 hover:border-teal-300 hover:bg-teal-50/50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-700">{p.filter_type} {p.efficiency}</span>
                                <span className="text-xs text-green-600 font-bold">{formatRp(p.buy_price)}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 font-mono">{p.dimensions}mm</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Line Items Table */}
                  {quoItems.length > 0 && (
                    <div style={cardStyle}>
                      <h3 className="text-sm font-black text-gray-800 mb-4">Item Penawaran ({quoItems.length})</h3>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-2 px-2 text-xs font-bold text-gray-400">Deskripsi</th>
                            <th className="text-center py-2 px-2 text-xs font-bold text-gray-400 w-20">Qty</th>
                            <th className="text-right py-2 px-2 text-xs font-bold text-gray-400">HPP</th>
                            <th className="text-right py-2 px-2 text-xs font-bold text-gray-400">Harga Jual</th>
                            <th className="text-right py-2 px-2 text-xs font-bold text-gray-400">Total</th>
                            <th className="w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {quoCalc.itemsWithSell.map((item) => (
                            <tr key={item.product_id} className="border-b border-gray-50">
                              <td className="py-2.5 px-2">
                                <p className="font-semibold text-gray-700">{item.description}</p>
                                <p className="text-xs text-gray-400 font-mono">{item.dimensions}mm</p>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <input
                                  type="number"
                                  value={item.qty}
                                  onChange={(e) => updateItemQty(item.product_id, Number(e.target.value))}
                                  min={1}
                                  className="w-16 text-center px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-400"
                                />
                              </td>
                              <td className="py-2.5 px-2 text-right text-gray-400 text-xs">{formatRp(item.buy_price)}</td>
                              <td className="py-2.5 px-2 text-right font-semibold text-gray-700">{formatRp(item.sell_price)}</td>
                              <td className="py-2.5 px-2 text-right font-bold text-teal-600">{formatRp(item.sell_price * item.qty)}</td>
                              <td className="py-2.5 px-1">
                                <button onClick={() => removeItemFromQuo(item.product_id)} className="p-1 rounded text-gray-300 hover:text-red-500 transition">
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* RIGHT: Configuration & Summary */}
                <div className="space-y-5">
                  {/* Pricing Config */}
                  <div style={cardStyle}>
                    <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"><DollarSign size={16} className="text-teal-600" /> Konfigurasi Harga</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1.5">
                          <span>Margin (%)</span>
                          <span className="text-teal-600">{quoForm.margin_pct}%</span>
                        </label>
                        <input type="range" min={5} max={60} value={quoForm.margin_pct} onChange={(e) => setQuoForm({ ...quoForm, margin_pct: Number(e.target.value) })} className="w-full accent-teal-600" />
                        <div className="flex justify-between text-[10px] text-gray-300 mt-1"><span>5%</span><span>60%</span></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500">PPN 11%</label>
                        <button
                          onClick={() => setQuoForm({ ...quoForm, ppn_enabled: !quoForm.ppn_enabled })}
                          className={`w-11 h-6 rounded-full transition-colors ${quoForm.ppn_enabled ? "bg-teal-600" : "bg-gray-200"} relative`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${quoForm.ppn_enabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Config */}
                  <div style={cardStyle}>
                    <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"><Truck size={16} className="text-teal-600" /> Delivery</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {(["Ex-Works", "Franco Proyek"] as const).map((term) => (
                          <button
                            key={term}
                            onClick={() => setQuoForm({ ...quoForm, delivery_terms: term })}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                              quoForm.delivery_terms === term ? "border-teal-600 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-400 hover:border-gray-300"
                            }`}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                      {quoForm.delivery_terms === "Franco Proyek" && (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1.5">Ongkos Kirim (Rp)</label>
                          <input type="number" value={quoForm.shipping_cost || ""} onChange={(e) => setQuoForm({ ...quoForm, shipping_cost: Number(e.target.value) })} placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400" />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1.5">Lead Time (hari)</label>
                          <input type="number" value={quoForm.lead_time_days} onChange={(e) => setQuoForm({ ...quoForm, lead_time_days: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1.5">Validitas (hari)</label>
                          <select value={quoForm.valid_days} onChange={(e) => setQuoForm({ ...quoForm, valid_days: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 bg-white">
                            <option value={14}>14 hari</option>
                            <option value={30}>30 hari</option>
                            <option value={60}>60 hari</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Catatan</label>
                        <textarea value={quoForm.notes} onChange={(e) => setQuoForm({ ...quoForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 resize-none" placeholder="Catatan tambahan..." />
                      </div>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div style={{ ...cardStyle, background: "linear-gradient(135deg, #f0fdfa, #ccfbf1)", border: "1px solid #99f6e4" }}>
                    <h3 className="text-sm font-black text-teal-800 mb-4">Ringkasan Harga</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>HPP Total</span>
                        <span className="font-mono">{formatRp(quoCalc.hpp)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>+ Margin {quoForm.margin_pct}%</span>
                        <span className="font-mono">{formatRp(quoCalc.marginAmount)}</span>
                      </div>
                      <div className="border-t border-teal-200 pt-2 flex justify-between font-semibold text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatRp(quoCalc.subtotal)}</span>
                      </div>
                      {quoForm.ppn_enabled && (
                        <div className="flex justify-between text-gray-600">
                          <span>+ PPN 11%</span>
                          <span className="font-mono">{formatRp(quoCalc.ppn)}</span>
                        </div>
                      )}
                      {quoCalc.shipping > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>+ Ongkir</span>
                          <span className="font-mono">{formatRp(quoCalc.shipping)}</span>
                        </div>
                      )}
                      <div className="border-t-2 border-teal-300 pt-3 flex justify-between">
                        <span className="font-black text-teal-800">GRAND TOTAL</span>
                        <span className="font-black text-teal-700 text-lg">{formatRp(quoCalc.grand)}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-teal-200 flex items-center gap-2 text-xs text-teal-600">
                      <Clock size={13} />
                      <span>Lead Time: {quoForm.lead_time_days} hari kerja | {quoForm.delivery_terms}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
