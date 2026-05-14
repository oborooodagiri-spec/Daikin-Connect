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
  Eye
} from "lucide-react";
import Link from "next/link";
import { 
  getShoppingList, 
  createShoppingItem, 
  updateShoppingItem, 
  deleteShoppingItem 
} from "@/app/actions/rate_card";
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

const CATEGORIES = ["All", "Chiller", "VRV", "Split Duct", "AHU", "FCU", "Cooling Tower", "Pump", "Accessories", "Material Tambahan"];
const WORK_TYPES = ["Preventive Maintenance", "Corrective Maintenance", "Overhaul", "Installation", "Freon Charging", "Chemical Cleaning", "Others"];
const CAPACITY_UNITS = ["Unit", "Visit", "Lot", "Meter", "Kg", "Liter", "TR", "PK", "HP", "kW"];

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

  const fetchData = async () => {
    setLoading(true);
    const [res, sess, users] = await Promise.all([
      getShoppingList(),
      getSession(),
      getAllUsers()
    ]);
    
    if (res.success) setItems(res.data);
    if (sess) setSession(sess);
    if (users?.success) setAllUsers(users.data);
    
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
      price: parseFloat(formData.price) || 0
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

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Kategori", "Pekerjaan", "Deskripsi", "Satuan", "Harga Satuan (IDR)"];
    const tableRows: any[] = [];

    filteredItems.forEach(item => {
      const itemData = [
        item.category,
        item.work_type,
        item.item_name,
        `${item.capacity_range} ${item.capacity_unit}`,
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)
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
    doc.text(`Periode: 1 Januari 2026 - 31 Desember 2026`, 14, 38);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 43);
    
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
           <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
              <div className="p-4 bg-blue-50 text-[#0073ea] rounded-2xl">
                 <Building2 size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Vendor</p>
                 <p className="text-sm font-bold text-slate-700">Daikin Certified Partner</p>
              </div>
           </div>
           <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
              <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl">
                 <Calendar size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Periode Berlaku</p>
                 <p className="text-sm font-bold text-slate-700">Jan 2026 - Des 2026</p>
              </div>
           </div>
           <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                 <Lock size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Scope</p>
                 <p className="text-sm font-bold text-slate-700">{isAdmin ? "Admin Full Access" : "Authorized View Only"}</p>
              </div>
           </div>
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
               {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                        <tr key={item.id.toString()} className="group hover:bg-blue-50/30 transition-colors">
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
                              <div className="flex items-center gap-1.5 font-black text-emerald-600 text-sm">
                                 <span className="text-[10px] opacity-60">Rp</span>
                                 {new Intl.NumberFormat('id-ID').format(item.price)}
                              </div>
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
                 <h4 className="text-xs font-black text-[#0073ea] uppercase tracking-[0.2em] mb-4">Cakupan Harga (Inclusions)</h4>
                 <ul className="space-y-4">
                    {[
                      "Biaya jasa teknisi (Manpower) tersertifikasi.",
                      "Peralatan kerja standar (Jet Cleaner, Manifold, Tools).",
                      "Bahan habis pakai standar (Kain majun, pembersih drain).",
                      "Transportasi teknisi dalam area jangkauan operasional."
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        {text}
                      </li>
                    ))}
                 </ul>
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
                    {/* Permissions Section */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-6 mb-8">
                       <div className="flex items-center gap-3 mb-6">
                          <Shield className="text-indigo-500" size={18} />
                          <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Hak Akses & Visibilitas</h4>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">Scope</label>
                             <select 
                                value={formData.visibility} 
                                onChange={e => setFormData({...formData, visibility: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-indigo-100 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all"
                             >
                                <option value="Internal">Internal (Admin Only)</option>
                                <option value="Public">Public (Authorized Users)</option>
                             </select>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">Grant Specific Access</label>
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-300" />
                                <input 
                                   type="text" 
                                   placeholder="Cari akun..." 
                                   value={userSearch}
                                   onChange={e => setUserSearch(e.target.value)}
                                   className="w-full pl-9 pr-4 py-3 bg-white border border-indigo-100 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all"
                                />
                             </div>
                          </div>
                       </div>

                       {userSearch && (
                          <div className="mb-4 bg-white border border-indigo-100 rounded-xl shadow-lg max-h-40 overflow-y-auto p-2 relative z-50">
                             {allUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                                <button 
                                   key={u.id} type="button"
                                   onClick={() => {
                                      const current = formData.allowed_users ? formData.allowed_users.split(",") : [];
                                      if (!current.includes(u.id.toString())) {
                                         setFormData({...formData, allowed_users: [...current, u.id.toString()].filter(Boolean).join(",")});
                                      }
                                      setUserSearch("");
                                   }}
                                   className="w-full text-left p-2.5 hover:bg-indigo-50 rounded-lg flex items-center justify-between group transition-colors"
                                >
                                   <span className="text-xs font-bold text-slate-700">{u.name}</span>
                                   <Plus size={12} className="text-indigo-300 group-hover:text-indigo-500" />
                                </button>
                             ))}
                          </div>
                       )}

                       <div className="flex flex-wrap gap-2">
                          {formData.allowed_users?.split(",").filter(Boolean).map(uid => {
                             const u = allUsers.find(user => user.id.toString() === uid);
                             return (
                                <span key={uid} className="px-3 py-1.5 bg-white text-indigo-600 rounded-full text-[9px] font-black flex items-center gap-2 border border-indigo-100">
                                   {u?.name || uid}
                                   <button type="button" onClick={() => setFormData({...formData, allowed_users: formData.allowed_users.split(",").filter(id => id !== uid).join(",")})} className="hover:text-rose-500"><CloseIcon size={10}/></button>
                                </span>
                             )
                          })}
                          {!formData.allowed_users && <p className="text-[9px] text-indigo-300 font-bold italic">Belum ada akun khusus yang diberikan akses.</p>}
                       </div>
                    </div>

                    {/* Data Fields */}
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Unit</label>
                          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all">
                             {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Pekerjaan</label>
                          <select value={formData.work_type} onChange={e => setFormData({...formData, work_type: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all">
                             {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
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
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Satuan</label>
                          <select value={formData.capacity_unit} onChange={e => setFormData({...formData, capacity_unit: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all">
                             {CAPACITY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-emerald-600">Harga Satuan (IDR)</label>
                       <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-emerald-600 text-sm">Rp</div>
                          <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl font-black text-emerald-700 text-lg focus:outline-none focus:border-emerald-500 transition-all" />
                       </div>
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
