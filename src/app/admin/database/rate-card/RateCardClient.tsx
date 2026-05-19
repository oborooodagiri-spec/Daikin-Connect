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
import { useRouter } from "next/navigation";
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
import { getAllProjects } from "@/app/actions/projects";
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
  const router = useRouter();
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
  const [projects, setProjects] = useState<any[]>([]);
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



  const getVendorPrice = (itemId: string): number | null => {
    if (!settings.selected_vendor) return null;
    return settings.vendor_prices?.[settings.selected_vendor]?.[itemId] ?? null;
  };



  const fetchData = async () => {
    setLoading(true);
    const [res, sess, users, settingsRes, projectsRes] = await Promise.all([
      getShoppingList(),
      getSession(),
      getAllUsers(),
      getRateCardSettings(),
      getAllProjects()
    ]);
    
    if (res.success) setItems(res.data);
    if (sess) setSession(sess);
    if (users?.success) setAllUsers(users.data);
    if (settingsRes.success) setSettings(settingsRes.data);
    if (projectsRes?.success) setProjects(projectsRes.data);
    
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
                <Link 
                  href="/admin/database/rate-card/print"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-[#323338] hover:text-[#0073ea] hover:border-[#0073ea] rounded-2xl transition-all shadow-sm group font-black text-[10px] uppercase tracking-widest"
                  title="Cetak & Kustomisasi Kontrak Payung"
                >
                  <Printer size={16} /> Print
                </Link>
                <Link 
                  href="/admin/database/rate-card/work-order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-4 bg-[#323338] text-white hover:bg-black rounded-2xl transition-all shadow-sm group font-black text-[10px] uppercase tracking-widest"
                  title="Buat & Kustomisasi Surat Perintah Kerja (Work Order)"
                >
                  <ClipboardList size={16} /> WO
                </Link>
                <Link 
                  href="/admin/database/rate-card/quotation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-all shadow-sm group font-black text-[10px] uppercase tracking-widest"
                  title="Buat & Kustomisasi Surat Penawaran Harga (Quotation) untuk Customer"
                >
                  <FileText size={16} /> Penawaran
                </Link>
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
                        <tr key={item.id.toString()} className="group transition-colors hover:bg-blue-50/30">
    
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
                               <div className="flex items-center justify-end gap-2">
                                 <button
                                   onClick={() => handleOpenEdit(item)}
                                   className="p-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#0073ea] hover:border-[#0073ea] hover:bg-[#0073ea]/5 rounded-xl transition-all"
                                   title="Edit Item"
                                 >
                                   <Edit3 size={14} />
                                 </button>
                                 <button
                                   onClick={() => handleDelete(item.id.toString())}
                                   className="p-2 bg-slate-50 border border-slate-200 text-slate-450 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-xl transition-all"
                                   title="Hapus Item"
                                 >
                                   <Trash2 size={14} />
                                 </button>
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
