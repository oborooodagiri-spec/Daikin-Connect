"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Printer, 
  ChevronLeft, 
  Loader2, 
  Filter,
  DollarSign,
  Briefcase,
  Layers,
  ChevronRight,
  Info,
  X as CloseIcon,
  CheckCircle2,
  AlertCircle,
  Shield,
  Globe,
  FileText,
  Calendar,
  Building2,
  Lock,
  Eye,
  ClipboardList,
  Hash,
  MapPin,
  Send,
  CheckSquare,
  Square,
  FileDown,
  Minus
} from "lucide-react";
import Link from "next/link";
import { 
  getShoppingList, 
  createShoppingItem, 
  updateShoppingItem, 
  deleteShoppingItem 
} from "@/app/actions/rate_card";
import { 
  getRateCardSettings, 
  updateRateCardSetting 
} from "@/app/actions/rate_card_settings";
import { getAllUsers } from "@/app/actions/users";
import { getSession } from "@/app/actions/auth";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Extend jsPDF with autotable types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}


export default function RateCardClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [session, setSession] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const [formData, setFormData] = useState({
    category: "Chiller",
    work_type: "Preventive Maintenance",
    item_name: "",
    capacity_unit: "Unit",
    capacity_range: "",
    price: "",
    description: "",
    visibility: "Internal",
    allowed_users: ""
  });

  // Settings States
  const [settings, setSettings] = useState({
    vendors: [] as string[],
    period_year: new Date().getFullYear().toString(),
    selected_vendor: "",
    vendor_prices: {} as Record<string, Record<string, number>>,
    allowed_users: [] as any[],
    categories: ["Chiller", "VRV", "Split Duct", "AHU", "FCU", "Cooling Tower", "Pump", "Accessories", "Material Tambahan"] as string[],
    work_types: ["Preventive Maintenance", "Corrective Maintenance", "Overhaul", "Installation", "Freon Charging", "Chemical Cleaning", "Others"] as string[],
    capacity_units: ["Unit", "Visit", "Lot", "Meter", "Kg", "Liter", "TR", "PK", "Cell", "HP", "kW"] as string[]
  });
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState("");

  // Dynamic Option Editing States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingWorkType, setIsAddingWorkType] = useState(false);
  const [newWorkTypeName, setNewWorkTypeName] = useState("");
  const [isAddingCapacityUnit, setIsAddingCapacityUnit] = useState(false);
  const [newCapacityUnitName, setNewCapacityUnitName] = useState("");


  // Work Order States
  const [selectedItems, setSelectedItems] = useState<Record<string, { qty: number; notes: string }>>({}); 
  const [isWOModalOpen, setIsWOModalOpen] = useState(false);
  const [woForm, setWoForm] = useState({
    wo_number: `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    project_name: "",
    location: "",
    pic_name: "",
    notes: ""
  });

  const toggleSelectItem = (item: any) => {
    const id = item.id.toString();
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = { qty: 1, notes: "" };
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (Object.keys(selectedItems).length === filteredItems.length) {
      setSelectedItems({});
    } else {
      const all: Record<string, { qty: number; notes: string }> = {};
      filteredItems.forEach(item => { all[item.id.toString()] = { qty: 1, notes: "" }; });
      setSelectedItems(all);
    }
  };

  const updateSelectedQty = (id: string, qty: number) => {
    setSelectedItems(prev => ({ ...prev, [id]: { ...prev[id], qty: Math.max(1, qty) } }));
  };

  const updateSelectedPK = (id: string, pk: number) => {
    setSelectedItems(prev => ({ ...prev, [id]: { ...prev[id], capacity_pk: Math.max(0, pk) } }));
  };

  const updateSelectedNotes = (id: string, notes: string) => {
    setSelectedItems(prev => ({ ...prev, [id]: { ...prev[id], notes } }));
  };

  const selectedCount = Object.keys(selectedItems).length;
  const getVendorPrice = (itemId: string): number | null => {
    if (!settings.selected_vendor) return null;
    return settings.vendor_prices?.[settings.selected_vendor]?.[itemId] ?? null;
  };

  const selectedTotalValue = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, data]) => {
      const item = items.find(i => i.id.toString() === id);
      const price = getVendorPrice(id);
      const multiplier = (item?.capacity_unit === "PK" || item?.capacity_unit === "Cell") ? (data.capacity_pk || 1) : 1;
      return sum + (price ? price * multiplier * data.qty : 0);
    }, 0);
  }, [selectedItems, items, settings.vendor_prices, settings.selected_vendor]);

  const fetchData = async () => {
    setLoading(true);
    const [res, sess, users, settingsRes] = await Promise.all([
      getShoppingList(),
      getSession(),
      getAllUsers(),
      getRateCardSettings()
    ]);
    
    if (res.success) setItems(res.data);
    if (sess) setSession(sess);
    if (users?.success) setAllUsers(users.data);
    if (settingsRes.success) setSettings(settingsRes.data);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isAdmin = session?.roles?.some((role: string) => 
    ["admin", "super", "administrator"].some(keyword => role.toLowerCase().includes(keyword))
  );

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  // Comparison Logic - compare price of current vendor against all other vendors
  const getPriceAnalysis = (itemId: string) => {
    if (!settings.selected_vendor) return null;
    const currentPrice = getVendorPrice(itemId);
    if (!currentPrice) return null;

    const allVendorPrices = Object.entries(settings.vendor_prices)
      .filter(([vendor]) => vendor !== settings.selected_vendor)
      .map(([, prices]) => prices[itemId])
      .filter(p => p && p > 0);

    if (allVendorPrices.length === 0) return null;

    const allPrices = [currentPrice, ...allVendorPrices];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    if (currentPrice === minPrice && minPrice !== maxPrice) return { type: 'cheapest', label: 'Termurah' };
    if (currentPrice === maxPrice && minPrice !== maxPrice) return { type: 'expensive', label: 'Termahal' };
    
    return null;
  };

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenEdit = (item: any) => {
    setEditId(item.id.toString());
    setFormData({
      category: item.category,
      work_type: item.work_type,
      item_name: item.item_name,
      capacity_unit: item.capacity_unit,
      capacity_range: item.capacity_range,
      price: item.price.toString(),
      description: item.description || "",
      visibility: item.visibility || "Internal",
      allowed_users: item.allowed_users || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      price: 0,
      vendor_name: null
    };

    let res;
    if (editId) {
      res = await updateShoppingItem(editId, payload);
    } else {
      res = await createShoppingItem(payload);
    }

    if (res.success) {
      notify('success', editId ? 'Rate Card updated successfully' : 'New Rate Card entry added');
      setIsModalOpen(false);
      setEditId(null);
      setFormData({
        category: "Chiller",
        work_type: "Preventive Maintenance",
        item_name: "",
        capacity_unit: "Unit",
        capacity_range: "",
        price: "",
        description: "",
        visibility: "Internal",
        allowed_users: ""
      });
      fetchData();
    } else {
      notify('error', res.error || 'Operation failed');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this Rate Card entry?")) return;
    const res = await deleteShoppingItem(id);
    if (res.success) {
      notify('success', 'Entry deleted');
      fetchData();
    } else {
      notify('error', res.error || 'Delete failed');
    }
  };

  const handleAddCategory = async (newCat: string) => {
    if (!newCat.trim()) return;
    const catName = newCat.trim();
    if (settings.categories.includes(catName)) {
      notify('error', 'Kategori sudah ada!');
      return;
    }
    const updated = [...settings.categories, catName];
    const res = await updateRateCardSetting('categories', updated);
    if (res.success) {
      setSettings(prev => ({ ...prev, categories: updated }));
      setFormData(prev => ({ ...prev, category: catName }));
      notify('success', `Kategori "${catName}" berhasil ditambahkan!`);
    } else {
      notify('error', 'Gagal menambahkan kategori');
    }
  };

  const handleRemoveCategory = async (catToRemove: string) => {
    if (settings.categories.length <= 1) {
      notify('error', 'Harus ada minimal satu kategori!');
      return;
    }
    const updated = settings.categories.filter(c => c !== catToRemove);
    const res = await updateRateCardSetting('categories', updated);
    if (res.success) {
      setSettings(prev => ({ ...prev, categories: updated }));
      setFormData(prev => ({ ...prev, category: updated[0] }));
      notify('success', `Kategori "${catToRemove}" berhasil dihapus!`);
    } else {
      notify('error', 'Gagal menghapus kategori');
    }
  };

  const handleAddWorkType = async (newType: string) => {
    if (!newType.trim()) return;
    const typeName = newType.trim();
    if (settings.work_types.includes(typeName)) {
      notify('error', 'Jenis pekerjaan sudah ada!');
      return;
    }
    const updated = [...settings.work_types, typeName];
    const res = await updateRateCardSetting('work_types', updated);
    if (res.success) {
      setSettings(prev => ({ ...prev, work_types: updated }));
      setFormData(prev => ({ ...prev, work_type: typeName }));
      notify('success', `Jenis pekerjaan "${typeName}" berhasil ditambahkan!`);
    } else {
      notify('error', 'Gagal menambahkan jenis pekerjaan');
    }
  };

  const handleRemoveWorkType = async (typeToRemove: string) => {
    if (settings.work_types.length <= 1) {
      notify('error', 'Harus ada minimal satu jenis pekerjaan!');
      return;
    }
    const updated = settings.work_types.filter(t => t !== typeToRemove);
    const res = await updateRateCardSetting('work_types', updated);
    if (res.success) {
      setSettings(prev => ({ ...prev, work_types: updated }));
      setFormData(prev => ({ ...prev, work_type: updated[0] }));
      notify('success', `Jenis pekerjaan "${typeToRemove}" berhasil dihapus!`);
    } else {
      notify('error', 'Gagal menghapus jenis pekerjaan');
    }
  };

  const handleAddCapacityUnit = async (newUnit: string) => {
    if (!newUnit.trim()) return;
    const unitName = newUnit.trim();
    if (settings.capacity_units.includes(unitName)) {
      notify('error', 'Satuan sudah ada!');
      return;
    }
    const updated = [...settings.capacity_units, unitName];
    const res = await updateRateCardSetting('capacity_units', updated);
    if (res.success) {
      setSettings(prev => ({ ...prev, capacity_units: updated }));
      setFormData(prev => ({ ...prev, capacity_unit: unitName }));
      notify('success', `Satuan "${unitName}" berhasil ditambahkan!`);
    } else {
      notify('error', 'Gagal menambahkan satuan');
    }
  };

  const handleRemoveCapacityUnit = async (unitToRemove: string) => {
    if (settings.capacity_units.length <= 1) {
      notify('error', 'Harus ada minimal satu satuan!');
      return;
    }
    const updated = settings.capacity_units.filter(u => u !== unitToRemove);
    const res = await updateRateCardSetting('capacity_units', updated);
    if (res.success) {
      setSettings(prev => ({ ...prev, capacity_units: updated }));
      setFormData(prev => ({ ...prev, capacity_unit: updated[0] }));
      notify('success', `Satuan "${unitToRemove}" berhasil dihapus!`);
    } else {
      notify('error', 'Gagal menghapus satuan');
    }
  };


  const handleAddVendor = async () => {
    if (!newVendor.trim()) return;
    const updatedVendors = [...settings.vendors, newVendor.trim()];
    const res = await updateRateCardSetting('vendors', updatedVendors);
    if (res.success) {
      setSettings({...settings, vendors: updatedVendors});
      setNewVendor("");
      notify('success', 'Vendor added successfully');
    }
  };

  const handleRemoveVendor = async (vendor: string) => {
    const updatedVendors = settings.vendors.filter(v => v !== vendor);
    const res = await updateRateCardSetting('vendors', updatedVendors);
    if (res.success) {
      setSettings({...settings, vendors: updatedVendors});
      notify('success', 'Vendor removed');
    }
  };

  const handleUpdatePeriodYear = async (year: string) => {
    setSettings({...settings, period_year: year});
    await updateRateCardSetting('period_year', year);
  };

  const handleSelectVendor = async (vendor: string) => {
    setSettings({...settings, selected_vendor: vendor});
    await updateRateCardSetting('selected_vendor', vendor);
    setIsVendorModalOpen(false);
  };

  const handleDeselectVendor = async () => {
    setSettings({...settings, selected_vendor: ""});
    await updateRateCardSetting('selected_vendor', "");
    setIsVendorModalOpen(false);
  };

  const handleSaveVendorPrice = async (itemId: string, price: number) => {
    if (!settings.selected_vendor) return;
    const updatedPrices = { ...settings.vendor_prices };
    if (!updatedPrices[settings.selected_vendor]) updatedPrices[settings.selected_vendor] = {};
    updatedPrices[settings.selected_vendor][itemId] = price;
    setSettings({...settings, vendor_prices: updatedPrices});
    await updateRateCardSetting('vendor_prices', updatedPrices);
    setEditingPriceId(null);
    setEditingPriceValue("");
  };

  const handleAddUserAccess = async (user: any) => {
    if (settings.allowed_users.find(u => u.id === user.id)) return;
    const updatedUsers = [...settings.allowed_users, {id: user.id, name: user.name, email: user.email}];
    const res = await updateRateCardSetting('allowed_users', updatedUsers);
    if (res.success) {
      setSettings({...settings, allowed_users: updatedUsers});
      setUserSearch("");
      notify('success', `Access granted to ${user.name}`);
    }
  };

  const handleRemoveUserAccess = async (userId: any) => {
    const updatedUsers = settings.allowed_users.filter(u => u.id !== userId);
    const res = await updateRateCardSetting('allowed_users', updatedUsers);
    if (res.success) {
      setSettings({...settings, allowed_users: updatedUsers});
      notify('success', 'Access removed');
    }
  };

  const [clauses, setClauses] = useState([
    "1. Cakupan Harga: Termasuk jasa teknisi, alat kerja standar, dan transportasi (Area Kerja).",
    "2. Pengecualian: Tidak termasuk penggantian sparepart berat, kompresor, atau overhaul.",
    "3. Laporan: Pekerjaan dianggap selesai setelah penyerahan Checklist PM yang ditandatangani.",
    "4. Overtime: Pekerjaan di luar jam operasional akan dikenakan biaya tambahan sesuai kesepakatan."
  ]);
  const [isEditingClauses, setIsEditingClauses] = useState(false);

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Kategori", "Pekerjaan", "Deskripsi", "Satuan", "Harga Satuan (IDR)"];
    const tableRows: any[] = [];

    filteredItems.forEach(item => {
      const vendorPrice = getVendorPrice(item.id.toString());
      const itemData = [
        item.category,
        item.work_type,
        item.item_name,
        `${item.capacity_range} ${item.capacity_unit}`,
        vendorPrice ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(vendorPrice) : '-'
      ];
      tableRows.push(itemData);
    });

    // Kop Surat & Header
    doc.setFontSize(22);
    doc.setTextColor(0, 115, 234);
    doc.text("DAIKIN CONNECT", 14, 22);
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text("RATE CARD PEMELIHARAAN (UNIT PRICE CONTRACT)", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Vendor: ${settings.selected_vendor || 'N/A'}`, 14, 38);
    doc.text(`Periode: ${settings.period_year}`, 14, 43);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 48);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillStyle: '#0073ea', textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillStyle: '#f9fafb' },
      styles: { fontSize: 9 }
    });

    // Klausul / S&K
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text("Syarat & Ketentuan (Klausul):", 14, finalY + 15);
    doc.setFontSize(9);
    doc.setTextColor(100);
    const clauses = [
      "1. Cakupan Harga: Termasuk jasa teknisi, alat kerja standar, dan transportasi (Area Kerja).",
      "2. Pengecualian: Tidak termasuk penggantian sparepart berat, kompresor, atau overhaul.",
      "3. Laporan: Pekerjaan dianggap selesai setelah penyerahan Checklist PM yang ditandatangani.",
      "4. Overtime: Pekerjaan di luar jam operasional akan dikenakan biaya tambahan sesuai kesepakatan."
    ];
    clauses.forEach((line, i) => {
      doc.text(line, 14, finalY + 22 + (i * 5));
    });

    doc.save(`Rate_Card_${new Date().getTime()}.pdf`);
  };

  const generateWorkOrderPDF = () => {
    const doc = new jsPDF();
    const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n);
    const pageWidth = doc.internal.pageSize.getWidth();

    // === HEADER / KOP SURAT ===
    doc.setFillColor(0, 115, 234);
    doc.rect(0, 0, pageWidth, 3, 'F');
    
    doc.setFontSize(20);
    doc.setTextColor(0, 115, 234);
    doc.text("DAIKIN CONNECT", 14, 18);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("HVAC Maintenance & Engineering Services", 14, 24);
    
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text("WORK ORDER", pageWidth - 14, 18, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setTextColor(0, 115, 234);
    doc.text(woForm.wo_number, pageWidth - 14, 24, { align: 'right' });

    // Separator
    doc.setDrawColor(220);
    doc.line(14, 28, pageWidth - 14, 28);

    // === PROJECT INFO ===
    let y = 36;
    doc.setFontSize(8);
    doc.setTextColor(130);
    
    const infoLeft = [
      ["Tanggal", new Date(woForm.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })],
      ["Vendor", settings.selected_vendor || 'N/A'],
      ["Proyek", woForm.project_name || "-"],
    ];
    const infoRight = [
      ["Lokasi", woForm.location || "-"],
      ["PIC / Pengaju", woForm.pic_name || "-"],
      ["Periode Kontrak", settings.period_year],
    ];

    infoLeft.forEach(([label, val], i) => {
      doc.setTextColor(130);
      doc.text(`${label}:`, 14, y + (i * 6));
      doc.setTextColor(50);
      doc.text(val, 50, y + (i * 6));
    });
    infoRight.forEach(([label, val], i) => {
      doc.setTextColor(130);
      doc.text(`${label}:`, pageWidth / 2 + 10, y + (i * 6));
      doc.setTextColor(50);
      doc.text(val, pageWidth / 2 + 50, y + (i * 6));
    });

    y += 24;

    // === ITEM TABLE ===
    const tableHead = [["No", "Uraian Pekerjaan", "Kategori", "Kapasitas", "Unit Qty", "Harga Satuan (Rp)", "Subtotal (Rp)"]];
    const tableBody: any[] = [];
    let grandTotal = 0;

    Object.entries(selectedItems).forEach(([id, data], idx) => {
      const item = items.find(i => i.id.toString() === id);
      if (!item) return;
      const vendorPrice = getVendorPrice(id) || 0;
      const capacityMultiplier = (item.capacity_unit === "PK") ? (data.capacity_pk || 1) : 1;
      const subtotal = vendorPrice * capacityMultiplier * data.qty;
      grandTotal += subtotal;
      
      const capacityDisplay = (item.capacity_unit === "PK" || item.capacity_unit === "Cell")
        ? `${data.capacity_pk || 0} ${item.capacity_unit}` 
        : `${item.capacity_range} ${item.capacity_unit}`;

      tableBody.push([
        idx + 1,
        `${item.item_name}${data.notes ? `\n(${data.notes})` : ''}`,
        item.category,
        capacityDisplay,
        data.qty,
        fmt(vendorPrice),
        fmt(subtotal)
      ]);
    });

    doc.autoTable({
      head: tableHead,
      body: tableBody,
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: [0, 115, 234], textColor: 255, fontStyle: 'bold', fontSize: 8, cellPadding: 4 },
      bodyStyles: { fontSize: 8, cellPadding: 3, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { halign: 'center', cellWidth: 12 },
        5: { halign: 'right', cellWidth: 30 },
        6: { halign: 'right', cellWidth: 30 },
      },
    });

    // Grand Total Row
    let afterTableY = (doc as any).lastAutoTable.finalY;
    doc.setFillColor(50, 51, 56);
    doc.rect(14, afterTableY, pageWidth - 28, 10, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255);
    doc.text("GRAND TOTAL", pageWidth - 50, afterTableY + 7, { align: 'right' });
    doc.setFontSize(11);
    doc.text(`Rp ${fmt(grandTotal)}`, pageWidth - 14, afterTableY + 7, { align: 'right' });

    afterTableY += 18;

    // === NOTES ===
    if (woForm.notes) {
      doc.setFontSize(8);
      doc.setTextColor(130);
      doc.text("Catatan:", 14, afterTableY);
      doc.setTextColor(50);
      doc.text(woForm.notes, 14, afterTableY + 5);
      afterTableY += 14;
    }

    // === TERMS & CONDITIONS ===
    doc.setFontSize(8);
    doc.setTextColor(0, 115, 234);
    doc.text("Syarat & Ketentuan:", 14, afterTableY);
    doc.setTextColor(100);
    const terms = [
      "1. Harga sudah termasuk jasa teknisi, alat kerja standar, dan transportasi.",
      "2. Tidak termasuk penggantian sparepart, material tambahan, dan pekerjaan diluar scope.",
      "3. Pekerjaan dianggap selesai setelah penyerahan laporan yang ditandatangani kedua belah pihak.",
      "4. Berlaku sesuai periode kontrak yang tertera pada dokumen ini."
    ];
    terms.forEach((t, i) => {
      doc.text(t, 14, afterTableY + 5 + (i * 4));
    });

    afterTableY += 28;

    // Check if we need a new page for signatures
    if (afterTableY > 250) {
      doc.addPage();
      afterTableY = 20;
    }

    // === SIGNATURE BLOCKS ===
    doc.setDrawColor(200);
    doc.setFontSize(8);
    doc.setTextColor(100);

    // Left: Pengaju
    doc.text("Diajukan oleh,", 14, afterTableY);
    doc.line(14, afterTableY + 28, 80, afterTableY + 28);
    doc.setTextColor(50);
    doc.text(woForm.pic_name || "(Nama Pengaju)", 14, afterTableY + 33);
    doc.setTextColor(130);
    doc.text("PIC / Project Manager", 14, afterTableY + 38);

    // Right: Vendor
    doc.setTextColor(100);
    doc.text("Disetujui oleh,", pageWidth - 80, afterTableY);
    doc.line(pageWidth - 80, afterTableY + 28, pageWidth - 14, afterTableY + 28);
    doc.setTextColor(50);
    doc.text(settings.selected_vendor || "(Nama Vendor)", pageWidth - 80, afterTableY + 33);
    doc.setTextColor(130);
    doc.text("Vendor / Kontraktor", pageWidth - 80, afterTableY + 38);

    // Footer line
    doc.setFillColor(0, 115, 234);
    doc.rect(0, doc.internal.pageSize.getHeight() - 3, pageWidth, 3, 'F');

    doc.save(`Work_Order_${woForm.wo_number}_${new Date().getTime()}.pdf`);
    notify('success', `Work Order ${woForm.wo_number} berhasil di-generate!`);
    setIsWOModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-12 font-sans text-[#323338] selection:bg-blue-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <Link 
              href="/admin/database" 
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#0073ea] hover:border-[#0073ea] transition-all shadow-sm group"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-[#0073ea] uppercase tracking-[0.2em] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Official Rate Card</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">&bull; FY 2026</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#323338] uppercase flex items-center gap-3">
                Rate Card <span className="text-slate-300">Manager</span>
                {isAdmin && <Shield size={20} className="text-indigo-500" />}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {isAdmin && (
                <button 
                  onClick={() => { setEditId(null); setIsModalOpen(true); }}
                  className="flex items-center gap-2 px-8 py-4 bg-[#323338] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                >
                  <Plus size={18} /> Buat Item Baru
                </button>
             )}
             <div className="flex gap-2">
                <button 
                  onClick={exportPDF}
                  className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group"
                  title="Unduh Buku Tarif (PDF)"
                >
                  <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
                <button 
                  onClick={() => window.print()}
                  className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group"
                  title="Cetak Cepat"
                >
                  <Printer size={20} />
                </button>
             </div>
          </div>
        </div>

        {/* Contract Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <button 
             onClick={() => isAdmin && setIsVendorModalOpen(true)}
             className={`bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5 text-left transition-all ${isAdmin ? 'hover:border-blue-200 hover:shadow-md cursor-pointer group' : ''}`}
           >
              <div className="p-4 bg-blue-50 text-[#0073ea] rounded-2xl group-hover:bg-[#0073ea] group-hover:text-white transition-colors">
                 <Building2 size={24} />
              </div>
               <div className="flex-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vendor Terpilih</p>
                 <p className={`text-sm font-bold truncate ${settings.selected_vendor ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                    {settings.selected_vendor || "Belum ada vendor yang dipilih"}
                 </p>
              </div>
              {isAdmin && <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />}
           </button>

           <button 
             onClick={() => isAdmin && setIsPeriodModalOpen(true)}
             className={`bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5 text-left transition-all ${isAdmin ? 'hover:border-indigo-200 hover:shadow-md cursor-pointer group' : ''}`}
           >
              <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                 <Calendar size={24} />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Periode Berlaku</p>
                 <p className="text-sm font-bold text-slate-700">Tahun {settings.period_year}</p>
              </div>
              {isAdmin && <Calendar size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
           </button>

           <button 
             onClick={() => isAdmin && setIsAccessModalOpen(true)}
             className={`bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5 text-left transition-all ${isAdmin ? 'hover:border-emerald-200 hover:shadow-md cursor-pointer group' : ''}`}
           >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                 <Lock size={24} />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Access</p>
                 <p className="text-sm font-bold text-slate-700 truncate">
                    {isAdmin ? "Admin Full Access" : "Authorized View Only"}
                    {settings.allowed_users.length > 0 && ` (+${settings.allowed_users.length} Users)`}
                 </p>
              </div>
              {isAdmin && <Shield size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
           </button>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-8 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#0073ea] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari item pekerjaan (ex: PM AHU, Freon, Cuci)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[1.5rem] py-5 px-16 text-lg font-bold outline-none focus:border-[#0073ea] focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            />
          </div>

          <div className="lg:col-span-4 relative">
             <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
             <select 
               value={selectedCategory}
               onChange={(e) => setSelectedCategory(e.target.value)}
               className="w-full h-full bg-white border border-slate-200 rounded-[1.5rem] py-5 px-16 text-xs font-black uppercase tracking-widest outline-none focus:border-[#0073ea] transition-all cursor-pointer appearance-none shadow-sm"
             >
               {["All", ...settings.categories].map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6 px-4">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rate Card Entries</span>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-sm font-bold text-[#0073ea]">{loading ? "Synchronizing Permissions..." : `${filteredItems.length} Authorized Items`}</span>
           </div>
        </div>

        {/* Rate Card Table */}
        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl overflow-hidden mb-12">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                       {isAdmin && (
                         <th className="px-4 py-6 w-12">
                           <button onClick={toggleSelectAll} className="p-1 hover:bg-blue-50 rounded-lg transition-colors">
                             {selectedCount === filteredItems.length && filteredItems.length > 0 
                               ? <CheckSquare size={18} className="text-[#0073ea]" /> 
                               : <Square size={18} className="text-slate-300" />}
                           </button>
                         </th>
                       )}
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pekerjaan</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan (Inclusions)</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Satuan</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Harga Satuan (Rp)</th>
                       {isAdmin && <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse"><td colSpan={6} className="px-8 py-10"><div className="h-4 bg-slate-100 rounded-full w-3/4"></div></td></tr>
                      ))
                    ) : filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <tr key={item.id.toString()} className={`group transition-colors ${selectedItems[item.id.toString()] ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'}`}>
                           {isAdmin && (
                             <td className="px-4 py-6 w-12">
                               <button onClick={() => toggleSelectItem(item)} className="p-1 hover:bg-blue-100 rounded-lg transition-colors">
                                 {selectedItems[item.id.toString()] 
                                   ? <CheckSquare size={18} className="text-[#0073ea]" /> 
                                   : <Square size={18} className="text-slate-300" />}
                               </button>
                             </td>
                           )}
                           <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[9px] font-black rounded-lg border border-slate-100 uppercase tracking-widest">
                                {item.category}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-[#323338] uppercase leading-tight">{item.item_name}</span>
                                 <span className="text-[10px] text-[#0073ea] font-bold mt-1">{item.work_type}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 max-w-xs">
                              <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">{item.description || "-"}</p>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <Layers size={14} className="text-slate-300" />
                                 <span className="text-xs font-black text-slate-700">{item.capacity_range} <span className="text-slate-400">{item.capacity_unit}</span></span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              {(() => {
                                const itemId = item.id.toString();
                                const vendorPrice = getVendorPrice(itemId);
                                const analysis = getPriceAnalysis(itemId);
                                
                                if (!settings.selected_vendor) {
                                  return <span className="text-xs text-slate-300 italic font-bold">Pilih vendor</span>;
                                }

                                if (editingPriceId === itemId && isAdmin) {
                                  return (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-emerald-600 font-black">Rp</span>
                                      <input 
                                        autoFocus
                                        type="number" 
                                        value={editingPriceValue}
                                        onChange={e => setEditingPriceValue(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveVendorPrice(itemId, parseFloat(editingPriceValue) || 0); if (e.key === 'Escape') setEditingPriceId(null); }}
                                        onBlur={() => handleSaveVendorPrice(itemId, parseFloat(editingPriceValue) || 0)}
                                        className="w-28 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                      />
                                    </div>
                                  );
                                }

                                return (
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => { if (isAdmin) { setEditingPriceId(itemId); setEditingPriceValue(vendorPrice?.toString() || "0"); } }}
                                        className={`flex items-center gap-1.5 font-black text-sm ${vendorPrice ? 'text-emerald-600' : 'text-slate-300'} ${isAdmin ? 'hover:bg-emerald-50 px-2 py-1 -mx-2 -my-1 rounded-lg transition-colors cursor-text' : ''}`}
                                      >
                                        <span className="text-[10px] opacity-60">Rp</span>
                                        {vendorPrice ? new Intl.NumberFormat('id-ID').format(vendorPrice) : '0'}
                                      </button>
                                      {analysis && (
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                          analysis.type === 'cheapest' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                          {analysis.label}
                                        </span>
                                      )}
                                    </div>
                                    {vendorPrice ? (
                                      <span className="text-[10px] text-slate-400 font-bold mt-1">Unit Price</span>
                                    ) : (
                                      <span className="text-[10px] text-amber-500 font-bold mt-1">{isAdmin ? 'Klik untuk isi harga' : 'Belum diisi'}</span>
                                    )}
                                  </div>
                                );
                              })()}
                           </td>
                           {isAdmin && (
                              <td className="px-8 py-6 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm"><Edit3 size={16} /></button>
                                    <button onClick={() => handleDelete(item.id.toString())} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                                 </div>
                              </td>
                           )}
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={6} className="px-8 py-24 text-center text-slate-300 font-bold text-sm italic">Belum ada data tarif yang sesuai.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Professional Klausul Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
           <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-blue-50 transition-colors"><FileText size={80} strokeWidth={1} /></div>
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-[#0073ea] uppercase tracking-[0.2em]">Syarat & Ketentuan (Klausul)</h4>
                    {isAdmin && (
                       <button 
                          onClick={() => setIsEditingClauses(!isEditingClauses)}
                          className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-[#0073ea] transition-all"
                       >
                          <Edit3 size={14} />
                       </button>
                    )}
                 </div>
                 
                 {isEditingClauses ? (
                    <div className="space-y-3">
                       {clauses.map((clause, i) => (
                          <input 
                             key={i} value={clause} 
                             onChange={(e) => {
                                const next = [...clauses];
                                next[i] = e.target.value;
                                setClauses(next);
                             }}
                             className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 outline-none"
                          />
                       ))}
                       <button onClick={() => setIsEditingClauses(false)} className="mt-2 w-full py-2 bg-[#0073ea] text-white text-[10px] font-black uppercase rounded-xl">Simpan Klausul</button>
                    </div>
                 ) : (
                    <ul className="space-y-4">
                       {clauses.map((text, i) => (
                         <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                           <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                           {text}
                         </li>
                       ))}
                    </ul>
                 )}
              </div>
           </div>

           <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-rose-50 transition-colors"><Shield size={80} strokeWidth={1} /></div>
              <div className="relative z-10">
                 <h4 className="text-xs font-black text-rose-500 uppercase tracking-[0.2em] mb-4">Pengecualian (Exclusions)</h4>
                 <ul className="space-y-4">
                    {[
                      "Perbaikan berat (Corrective) & Penggantian Sparepart.",
                      "Pekerjaan pengelasan pipa atau bocor freon mayor.",
                      "Pekerjaan di hari libur nasional atau di luar jam kerja.",
                      "Penambahan material di luar daftar Rate Card resmi."
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                        <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
                        {text}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>

        {/* Modal Overlay */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#323338]/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 custom-scrollbar"
              >
                 <div className="flex justify-between items-start mb-8">
                   <div>
                     <h2 className="text-3xl font-black text-[#323338] tracking-tight uppercase leading-none">{editId ? "Update Rate" : "Add Rate Card"}</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Kontrak Harga Satuan</p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"><CloseIcon size={20}/></button>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-6">
                     {/* Data Fields */}
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center ml-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Unit</label>
                              <div className="flex gap-2">
                                 <button type="button" onClick={() => setIsAddingCategory(true)} className="text-[9px] font-bold text-[#0073ea] hover:underline uppercase tracking-wider flex items-center gap-1"><Plus size={10} /> Tambah</button>
                                 <button type="button" onClick={() => handleRemoveCategory(formData.category)} className="text-[9px] font-bold text-rose-500 hover:underline uppercase tracking-wider flex items-center gap-1"><Trash2 size={10} /> Hapus</button>
                              </div>
                           </div>
                           {isAddingCategory ? (
                              <div className="flex gap-2 w-full">
                                 <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Nama kategori..." 
                                    value={newCategoryName} 
                                    onChange={e => setNewCategoryName(e.target.value)} 
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-[#0073ea]"
                                    onKeyDown={async e => {
                                       if (e.key === 'Enter') {
                                          e.preventDefault();
                                          if (newCategoryName.trim()) {
                                             await handleAddCategory(newCategoryName.trim());
                                             setNewCategoryName("");
                                             setIsAddingCategory(false);
                                          }
                                       }
                                       if (e.key === 'Escape') setIsAddingCategory(false);
                                    }}
                                 />
                                 <button 
                                    type="button" 
                                    onClick={async () => {
                                       if (newCategoryName.trim()) {
                                          await handleAddCategory(newCategoryName.trim());
                                          setNewCategoryName("");
                                          setIsAddingCategory(false);
                                       }
                                    }}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase hover:bg-emerald-100"
                                 >
                                    Save
                                 </button>
                                 <button type="button" onClick={() => setIsAddingCategory(false)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase hover:bg-slate-200">Cancel</button>
                              </div>
                           ) : (
                              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all">
                                 {settings.categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                           )}
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between items-center ml-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Pekerjaan</label>
                              <div className="flex gap-2">
                                 <button type="button" onClick={() => setIsAddingWorkType(true)} className="text-[9px] font-bold text-[#0073ea] hover:underline uppercase tracking-wider flex items-center gap-1"><Plus size={10} /> Tambah</button>
                                 <button type="button" onClick={() => handleRemoveWorkType(formData.work_type)} className="text-[9px] font-bold text-rose-500 hover:underline uppercase tracking-wider flex items-center gap-1"><Trash2 size={10} /> Hapus</button>
                              </div>
                           </div>
                           {isAddingWorkType ? (
                              <div className="flex gap-2 w-full">
                                 <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Nama pekerjaan..." 
                                    value={newWorkTypeName} 
                                    onChange={e => setNewWorkTypeName(e.target.value)} 
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-[#0073ea]"
                                    onKeyDown={async e => {
                                       if (e.key === 'Enter') {
                                          e.preventDefault();
                                          if (newWorkTypeName.trim()) {
                                             await handleAddWorkType(newWorkTypeName.trim());
                                             setNewWorkTypeName("");
                                             setIsAddingWorkType(false);
                                          }
                                       }
                                       if (e.key === 'Escape') setIsAddingWorkType(false);
                                    }}
                                 />
                                 <button 
                                    type="button" 
                                    onClick={async () => {
                                       if (newWorkTypeName.trim()) {
                                          await handleAddWorkType(newWorkTypeName.trim());
                                          setNewWorkTypeName("");
                                          setIsAddingWorkType(false);
                                       }
                                    }}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase hover:bg-emerald-100"
                                 >
                                    Save
                                 </button>
                                 <button type="button" onClick={() => setIsAddingWorkType(false)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase hover:bg-slate-200">Cancel</button>
                              </div>
                           ) : (
                              <select value={formData.work_type} onChange={e => setFormData({...formData, work_type: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all">
                                 {settings.work_types.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                           )}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Pekerjaan / Nama Item</label>
                        <input required type="text" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} placeholder="Contoh: PM AC Split Wall (0.5 - 2 PK)" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all" />
                     </div>

                     <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rentang Kapasitas / Detail</label>
                           <input type="text" value={formData.capacity_range} onChange={e => setFormData({...formData, capacity_range: e.target.value})} placeholder="e.g. 0.5 - 2" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all" />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center ml-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satuan</label>
                              <div className="flex gap-2">
                                 <button type="button" onClick={() => setIsAddingCapacityUnit(true)} className="text-[9px] font-bold text-[#0073ea] hover:underline uppercase tracking-wider flex items-center gap-1"><Plus size={10} /> Tambah</button>
                                 <button type="button" onClick={() => handleRemoveCapacityUnit(formData.capacity_unit)} className="text-[9px] font-bold text-rose-500 hover:underline uppercase tracking-wider flex items-center gap-1"><Trash2 size={10} /> Hapus</button>
                              </div>
                           </div>
                           {isAddingCapacityUnit ? (
                              <div className="flex gap-2 w-full">
                                 <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Nama satuan..." 
                                    value={newCapacityUnitName} 
                                    onChange={e => setNewCapacityUnitName(e.target.value)} 
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-[#0073ea]"
                                    onKeyDown={async e => {
                                       if (e.key === 'Enter') {
                                          e.preventDefault();
                                          if (newCapacityUnitName.trim()) {
                                             await handleAddCapacityUnit(newCapacityUnitName.trim());
                                             setNewCapacityUnitName("");
                                             setIsAddingCapacityUnit(false);
                                          }
                                       }
                                       if (e.key === 'Escape') setIsAddingCapacityUnit(false);
                                    }}
                                 />
                                 <button 
                                    type="button" 
                                    onClick={async () => {
                                       if (newCapacityUnitName.trim()) {
                                          await handleAddCapacityUnit(newCapacityUnitName.trim());
                                          setNewCapacityUnitName("");
                                          setIsAddingCapacityUnit(false);
                                       }
                                    }}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase hover:bg-emerald-100"
                                 >
                                    Save
                                 </button>
                                 <button type="button" onClick={() => setIsAddingCapacityUnit(false)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase hover:bg-slate-200">Cancel</button>
                              </div>
                           ) : (
                              <select value={formData.capacity_unit} onChange={e => setFormData({...formData, capacity_unit: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all">
                                 {settings.capacity_units.map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                           )}
                        </div>
                     </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                       <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                         <Info size={14} /> Harga diatur per vendor
                       </p>
                       <p className="text-[10px] text-amber-600 font-medium mt-1">
                         Harga satuan diisi langsung di tabel setelah memilih vendor. Klik kolom harga pada tabel untuk mengisi.
                       </p>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan (Apa yang termasuk?)</label>
                       <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detail cakupan pekerjaan..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all resize-none" />
                    </div>

                    <div className="pt-6 flex gap-4">
                       <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Batal</button>
                       <button type="submit" disabled={isSubmitting} className="flex-[2] bg-[#0073ea] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0060c5] shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                         {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                         {editId ? "Update Rate Card" : "Simpan ke Rate Card"}
                       </button>
                    </div>
                 </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className={`fixed bottom-10 right-10 z-[200] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 ${notification.type === 'success' ? 'bg-[#323338] text-white' : 'bg-rose-600 text-white'}`}>
               {notification.type === 'success' ? <CheckCircle2 className="text-[#0073ea]" size={24} /> : <AlertCircle size={24} />}
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Security Alert</p>
                  <p className="text-sm font-bold">{notification.message}</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vendor Management Modal */}
        <AnimatePresence>
          {isVendorModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVendorModalOpen(false)} className="absolute inset-0 bg-[#323338]/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-[#0073ea] rounded-xl"><Building2 size={24} /></div>
                        <div>
                          <h3 className="text-xl font-black text-[#323338] uppercase tracking-tight">Manajemen Vendor</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daftar Partner Tersertifikasi</p>
                        </div>
                    </div>
                    <button onClick={() => setIsVendorModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><CloseIcon size={20} /></button>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Vendor Aktif</label>
                        <div className="grid grid-cols-1 gap-2">
                           <button 
                             onClick={handleDeselectVendor}
                             className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                               !settings.selected_vendor 
                               ? 'bg-slate-50 border-slate-200 ring-2 ring-slate-300/20' 
                               : 'bg-white border-slate-100 hover:border-slate-200'
                             }`}
                           >
                              <span className={`text-sm font-bold ${!settings.selected_vendor ? 'text-slate-500' : 'text-slate-400'}`}>Tanpa Vendor (Lihat List Saja)</span>
                              {!settings.selected_vendor && <CheckCircle2 size={18} className="text-slate-400" />}
                           </button>
                           {settings.vendors.map((vendor, idx) => (
                             <button 
                               key={idx} 
                               onClick={() => handleSelectVendor(vendor)}
                               className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                                 settings.selected_vendor === vendor 
                                 ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10' 
                                 : 'bg-white border-slate-100 hover:border-blue-100'
                               }`}
                             >
                                <span className={`text-sm font-bold ${settings.selected_vendor === vendor ? 'text-[#0073ea]' : 'text-slate-700'}`}>{vendor}</span>
                                {settings.selected_vendor === vendor && <CheckCircle2 size={18} className="text-[#0073ea]" />}
                             </button>
                           ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3">Kelola Daftar Vendor</label>
                        <div className="flex gap-2 mb-4">
                            <input 
                              type="text" 
                              placeholder="Tambah vendor baru..." 
                              value={newVendor}
                              onChange={(e) => setNewVendor(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddVendor()}
                              className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs focus:outline-none focus:border-[#0073ea] transition-all" 
                            />
                            <button onClick={handleAddVendor} className="px-5 py-3 bg-[#323338] text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all">Tambah</button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                            {settings.vendors.map((vendor, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-xl group">
                                  <span className="text-[11px] font-bold text-slate-500">{vendor}</span>
                                  <button onClick={() => handleRemoveVendor(vendor)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                              </div>
                            ))}
                        </div>
                    </div>
                  </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Period Management Modal */}
        <AnimatePresence>
          {isPeriodModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPeriodModalOpen(false)} className="absolute inset-0 bg-[#323338]/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><Calendar size={24} /></div>
                        <div>
                          <h3 className="text-xl font-black text-[#323338] uppercase tracking-tight">Periode Berlaku</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Masa Berlaku Tarif</p>
                        </div>
                    </div>
                    <button onClick={() => setIsPeriodModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><CloseIcon size={20} /></button>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun Berlaku</label>
                        <select 
                          value={settings.period_year}
                          onChange={(e) => handleUpdatePeriodYear(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        >
                          {Array.from({length: 10}, (_, i) => (new Date().getFullYear() - 2 + i).toString()).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                    </div>
                    <button onClick={() => setIsPeriodModalOpen(false)} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100">Simpan Periode</button>
                  </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Access Management Modal */}
        <AnimatePresence>
          {isAccessModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAccessModalOpen(false)} className="absolute inset-0 bg-[#323338]/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Lock size={24} /></div>
                        <div>
                          <h3 className="text-xl font-black text-[#323338] uppercase tracking-tight">Security Access</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manajemen Izin Akses Akun</p>
                        </div>
                    </div>
                    <button onClick={() => setIsAccessModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><CloseIcon size={20} /></button>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="text" 
                          placeholder="Cari nama atau email akun..." 
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-emerald-500 transition-all" 
                        />
                        {userSearch && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 max-h-48 overflow-y-auto custom-scrollbar">
                              {allUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                                      .map(user => (
                                <button 
                                  key={user.id} 
                                  onClick={() => handleAddUserAccess(user)}
                                  className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                                >
                                  <div>
                                    <p className="text-xs font-bold text-slate-700">{user.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                                  </div>
                                  <Plus size={14} className="text-slate-300" />
                                </button>
                              ))}
                          </div>
                        )}
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Akun Terotorisasi</p>
                        </div>
                        {settings.allowed_users.map((user, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-2xl group hover:border-emerald-100 transition-all">
                              <div>
                                <p className="text-sm font-bold text-slate-700">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                              </div>
                              <button onClick={() => handleRemoveUserAccess(user.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                          </div>
                        ))}
                        {settings.allowed_users.length === 0 && (
                          <p className="text-[10px] text-slate-300 text-center py-4 italic">Belum ada akun tambahan yang ditambahkan secara manual</p>
                        )}
                    </div>
                  </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Selection Bar */}
        <AnimatePresence>
          {selectedCount > 0 && isAdmin && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#323338] text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-6 border border-slate-600"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0073ea] rounded-xl"><ClipboardList size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Item Terpilih</p>
                  <p className="text-sm font-black">{selectedCount} Item &bull; {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(selectedTotalValue)}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-600" />
              <button 
                onClick={() => {
                  setWoForm(prev => ({...prev, wo_number: `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`}));
                  setIsWOModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#0073ea] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0060c5] transition-all shadow-lg"
              >
                <FileDown size={16} /> Buat Work Order
              </button>
              <button 
                onClick={() => setSelectedItems({})}
                className="p-2.5 bg-slate-700 rounded-xl hover:bg-rose-600 transition-colors"
              >
                <CloseIcon size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Work Order Builder Modal */}
        <AnimatePresence>
          {isWOModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#323338]/60 backdrop-blur-md" onClick={() => setIsWOModalOpen(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                {/* WO Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-10 pt-10 pb-6 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-[#0073ea] to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                        <ClipboardList size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-[#323338] tracking-tight uppercase">Work Order</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dokumen Pengajuan Pekerjaan</p>
                      </div>
                    </div>
                    <button onClick={() => setIsWOModalOpen(false)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"><CloseIcon size={20}/></button>
                  </div>
                </div>

                <div className="px-10 py-8 space-y-8">
                  {/* WO Form Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Hash size={12} /> No. Work Order</label>
                      <input type="text" value={woForm.wo_number} onChange={e => setWoForm({...woForm, wo_number: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Calendar size={12} /> Tanggal</label>
                      <input type="date" value={woForm.date} onChange={e => setWoForm({...woForm, date: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Briefcase size={12} /> PIC / Pengaju</label>
                      <input type="text" placeholder="Nama pengaju..." value={woForm.pic_name} onChange={e => setWoForm({...woForm, pic_name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Building2 size={12} /> Nama Proyek</label>
                      <input type="text" placeholder="Nama proyek..." value={woForm.project_name} onChange={e => setWoForm({...woForm, project_name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><MapPin size={12} /> Lokasi</label>
                      <input type="text" placeholder="Alamat lokasi..." value={woForm.location} onChange={e => setWoForm({...woForm, location: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all" />
                    </div>
                  </div>

                  {/* Selected Items Table */}
                  <div>
                    <h3 className="text-xs font-black text-[#0073ea] uppercase tracking-[0.2em] mb-4">Rincian Pekerjaan ({selectedCount} Item)</h3>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">No</th>
                            <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Pekerjaan</th>
                            <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kapasitas (PK/Cell)</th>
                            <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Unit Qty</th>
                            <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Harga Satuan</th>
                            <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Object.entries(selectedItems).map(([id, data], idx) => {
                            const item = items.find(i => i.id.toString() === id);
                            if (!item) return null;
                            const vendorPrice = getVendorPrice(id) || 0;
                            const subtotal = vendorPrice * data.qty;
                            return (
                              <tr key={id} className="bg-white hover:bg-blue-50/30 transition-colors">
                                <td className="px-5 py-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                                <td className="px-5 py-4">
                                  <p className="text-xs font-black text-[#323338] uppercase">{item.item_name}</p>
                                  <p className="text-[10px] text-[#0073ea] font-bold">{item.category} &bull; {item.work_type}</p>
                                  <input type="text" placeholder="Catatan tambahan..." value={data.notes} onChange={e => updateSelectedNotes(id, e.target.value)} className="mt-2 w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-medium focus:outline-none focus:border-blue-300" />
                                </td>
                                <td className="px-5 py-4">
                                  {(item.capacity_unit === "PK" || item.capacity_unit === "Cell") ? (
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        step="0.1" 
                                        placeholder={item.capacity_unit === "PK" ? "PK..." : "Cell..."} 
                                        value={data.capacity_pk || ""} 
                                        onChange={e => updateSelectedPK(id, parseFloat(e.target.value) || 0)} 
                                        className="w-20 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black focus:outline-none focus:border-blue-300" 
                                      />
                                      <span className="text-[9px] font-black text-slate-400 uppercase">{item.capacity_unit}</span>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] font-bold text-slate-500">{item.capacity_range} {item.capacity_unit}</p>
                                  )}
                                </td>
                                <td className="px-5 py-4 w-24">
                                  <div className="flex items-center gap-1">
                                    <button type="button" onClick={() => updateSelectedQty(id, data.qty - 1)} className="p-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors"><Minus size={12} /></button>
                                    <input type="number" min={1} value={data.qty} onChange={e => updateSelectedQty(id, parseInt(e.target.value) || 1)} className="w-12 text-center px-1 py-1 bg-white border border-slate-100 rounded text-xs font-black focus:outline-none focus:border-blue-300" />
                                    <button type="button" onClick={() => updateSelectedQty(id, data.qty + 1)} className="p-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors"><Plus size={12} /></button>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-xs font-bold text-slate-600 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(vendorPrice)}</td>
                                <td className="px-5 py-4 text-xs font-black text-emerald-600 text-right">
                                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(vendorPrice * (["PK", "Cell"].includes(item.capacity_unit) ? (data.capacity_pk || 1) : 1) * data.qty)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[#323338]">
                            <td colSpan={5} className="px-5 py-5 text-right text-[10px] font-black text-white uppercase tracking-widest">Grand Total</td>
                            <td className="px-5 py-5 text-right text-lg font-black text-white">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(selectedTotalValue)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* General Notes */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Umum</label>
                    <textarea rows={2} placeholder="Catatan tambahan untuk Work Order ini..." value={woForm.notes} onChange={e => setWoForm({...woForm, notes: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all resize-none" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsWOModalOpen(false)} className="flex-1 px-8 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Batal</button>
                    <button 
                      type="button" 
                      onClick={generateWorkOrderPDF}
                      className="flex-[2] bg-gradient-to-r from-[#0073ea] to-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                      <FileDown size={16} /> Generate & Download PDF
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>

      <style jsx global>{`
        @media print {
          .no-print, button, nav, select, input, .action-bar { display: none !important; }
          .min-h-screen { background: white !important; padding: 0 !important; }
          .max-w-7xl { max-width: 100% !important; }
          table { font-size: 10pt !important; }
          .rounded-[2rem] { border-radius: 0 !important; border: 1px solid #eee !important; box-shadow: none !important; }
          .bg-white { background: white !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
