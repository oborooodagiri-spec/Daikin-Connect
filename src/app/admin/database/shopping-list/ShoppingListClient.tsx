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
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { 
  getShoppingList, 
  createShoppingItem, 
  updateShoppingItem, 
  deleteShoppingItem 
} from "@/app/actions/shopping_list";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Extend jsPDF with autotable types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const CATEGORIES = ["All", "Chiller", "VRV", "Split Duct", "AHU", "FCU", "Cooling Tower", "Pump", "Accessories"];
const WORK_TYPES = ["Preventive Maintenance", "Corrective Maintenance", "Overhaul", "Installation", "Freon Charging", "Others"];
const CAPACITY_UNITS = ["TR", "PK", "HP", "kW", "Unit", "Lot", "Meter"];

export default function ShoppingListClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [formData, setFormData] = useState({
    category: "Chiller",
    work_type: "Preventive Maintenance",
    item_name: "",
    capacity_unit: "TR",
    capacity_range: "",
    price: "",
    description: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await getShoppingList();
    if (res.success) {
      setItems(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      description: item.description || ""
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
      notify('success', editId ? 'Item updated successfully' : 'Item added successfully');
      setIsModalOpen(false);
      setEditId(null);
      setFormData({
        category: "Chiller",
        work_type: "Preventive Maintenance",
        item_name: "",
        capacity_unit: "TR",
        capacity_range: "",
        price: "",
        description: ""
      });
      fetchData();
    } else {
      notify('error', res.error || 'Operation failed');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const res = await deleteShoppingItem(id);
    if (res.success) {
      notify('success', 'Item deleted');
      fetchData();
    } else {
      notify('error', res.error || 'Delete failed');
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Category", "Work Type", "Item Name", "Capacity", "Price (IDR)"];
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

    doc.setFontSize(18);
    doc.text("Daikin Connect - Maintenance Shopping List", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillStyle: '#0073ea', textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillStyle: '#f9fafb' }
    });

    doc.save(`Shopping_List_${new Date().getTime()}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-12 font-sans text-[#323338]">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/admin/database" 
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#0073ea] hover:border-[#0073ea] transition-all shadow-sm group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#0073ea] uppercase tracking-[0.2em] mb-1">Database Manager</span>
            <h1 className="text-2xl font-black tracking-tight text-[#323338] uppercase">Shopping List <span className="text-slate-400">Hub</span></h1>
          </div>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-6 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#0073ea] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari item pekerjaan atau deskripsi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-5 px-16 text-lg font-bold outline-none focus:border-[#0073ea] focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            />
          </div>

          <div className="lg:col-span-3">
             <div className="relative h-full">
                <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-full bg-white border border-slate-200 rounded-2xl py-5 px-16 text-xs font-black uppercase tracking-widest outline-none focus:border-[#0073ea] transition-all cursor-pointer appearance-none shadow-sm"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
             </div>
          </div>

          <div className="lg:col-span-3 flex gap-3">
             <button 
               onClick={() => { setEditId(null); setIsModalOpen(true); }}
               className="flex-1 bg-[#323338] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
             >
               <Plus size={18} /> Add New Item
             </button>
             <button 
               onClick={exportPDF}
               className="p-5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group"
               title="Export PDF"
             >
               <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
             </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-4">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Maintenance Inventory</span>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-sm font-bold text-[#0073ea]">{loading ? "Synchronizing..." : `${filteredItems.length} Service Items Listed`}</span>
           </div>
           <div className="hidden md:flex items-center gap-3">
              <button onClick={handlePrint} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-[#0073ea] transition-colors uppercase tracking-widest">
                <Printer size={14} /> Quick Print
              </button>
           </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden mb-12">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Category</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type of Work</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Description</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Price</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-8 py-10">
                            <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <tr key={item.id.toString()} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-blue-50 text-[#0073ea] text-[10px] font-black rounded-lg border border-blue-100 uppercase tracking-widest">
                                {item.category}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <Layers size={14} className="text-slate-300" />
                                 <span className="text-xs font-bold text-slate-600">{item.work_type}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-[#323338] uppercase leading-tight">{item.item_name}</span>
                                 {item.description && <span className="text-[10px] text-slate-400 line-clamp-1 mt-1">{item.description}</span>}
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <Briefcase size={14} className="text-slate-300" />
                                 <span className="text-xs font-black text-slate-700">{item.capacity_range} <span className="text-[#0073ea]">{item.capacity_unit}</span></span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-1.5 font-black text-emerald-600 text-sm">
                                 <DollarSign size={14} />
                                 {new Intl.NumberFormat('id-ID').format(item.price)}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => handleOpenEdit(item)}
                                   className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                 >
                                   <Edit3 size={16} />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(item.id.toString())}
                                   className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-8 py-24 text-center">
                           <div className="flex flex-col items-center gap-4 text-slate-300">
                              <Tag size={48} strokeWidth={1} />
                              <p className="font-bold text-sm">No items found matching your criteria</p>
                              <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }} className="text-[10px] font-black text-[#0073ea] uppercase tracking-widest hover:underline">Clear all filters</button>
                           </div>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-8 flex items-start gap-6">
           <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-500 shrink-0">
              <Info size={24} />
           </div>
           <div className="space-y-2">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Indonesian Market Service Pricing Guide</h4>
              <p className="text-sm text-indigo-700/80 leading-relaxed font-medium">
                Sistem ini mendukung perhitungan harga manual berdasarkan kapasitas unit (TR untuk Chiller/CT, PK untuk Split/VRV). 
                Pastikan harga yang diinput sudah termasuk estimasi biaya jasa dan alat sesuai standar teknis lapangan.
              </p>
              <div className="flex gap-4 pt-2">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">&bull; TR: Tons of Refrigeration</span>
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">&bull; PK: Paardekracht / HP</span>
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">&bull; KW: Motor Power Rating</span>
              </div>
           </div>
        </div>

        {/* Modal Overlay */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#323338]/60 backdrop-blur-md"
                onClick={() => setIsModalOpen(false)}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-xl p-10 overflow-hidden"
              >
                 <div className="flex justify-between items-start mb-10">
                   <div>
                     <h2 className="text-3xl font-black text-[#323338] tracking-tight uppercase leading-none">
                       {editId ? "Modify Item" : "New Service Item"}
                     </h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Price Database Entry</p>
                   </div>
                   <button 
                     onClick={() => setIsModalOpen(false)} 
                     className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"
                   >
                     <CloseIcon size={20}/>
                   </button>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                          <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all"
                          >
                             {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Type</label>
                          <select 
                            value={formData.work_type}
                            onChange={(e) => setFormData({...formData, work_type: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all"
                          >
                             {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name / Service Title</label>
                       <input 
                         required
                         type="text" 
                         value={formData.item_name}
                         onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                         placeholder="Contoh: Cuci Chiller Air Cooled"
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all"
                       />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                       <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity Range</label>
                          <input 
                            type="text" 
                            value={formData.capacity_range}
                            onChange={(e) => setFormData({...formData, capacity_range: e.target.value})}
                            placeholder="e.g. 100 - 300"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                          <select 
                            value={formData.capacity_unit}
                            onChange={(e) => setFormData({...formData, capacity_unit: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all"
                          >
                             {CAPACITY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-emerald-600">Manual Price (IDR)</label>
                       <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-emerald-600 text-sm">Rp</div>
                          <input 
                            required
                            type="number" 
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            placeholder="0"
                            className="w-full pl-14 pr-6 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl font-black text-emerald-700 text-lg focus:outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-200"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Notes</label>
                       <textarea 
                         rows={3}
                         value={formData.description}
                         onChange={(e) => setFormData({...formData, description: e.target.value})}
                         placeholder="Detail cakupan pekerjaan..."
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#0073ea] transition-all resize-none"
                       />
                    </div>

                    <div className="pt-6 flex gap-4">
                       <button 
                         type="button" 
                         onClick={() => setIsModalOpen(false)}
                         className="flex-1 px-8 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                       >
                         Cancel
                       </button>
                       <button 
                         type="submit" 
                         disabled={isSubmitting}
                         className="flex-[2] bg-[#0073ea] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0060c5] shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                       >
                         {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                         {editId ? "Update Item" : "Add to List"}
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
            <motion.div 
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className={`fixed bottom-10 right-10 z-[200] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 ${notification.type === 'success' ? 'bg-[#323338] text-white' : 'bg-rose-600 text-white'}`}
            >
               {notification.type === 'success' ? <CheckCircle2 className="text-[#0073ea]" size={24} /> : <AlertCircle size={24} />}
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">System Message</p>
                  <p className="text-sm font-bold">{notification.message}</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style jsx global>{`
        @media print {
          .no-print, button, nav, .action-bar { display: none !important; }
          .min-h-screen { background: white !important; padding: 0 !important; }
          .max-w-7xl { max-width: 100% !important; }
          table { font-size: 10pt !important; }
          .rounded-[2.5rem] { border-radius: 0 !important; border: 1px solid #eee !important; box-shadow: none !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
