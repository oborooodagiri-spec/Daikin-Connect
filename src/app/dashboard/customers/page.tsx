"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { 
  getAllCustomers, createCustomer, updateCustomer, toggleCustomerStatus 
} from "@/app/actions/customers";
import { 
  Building2, Search, Filter, Phone, User as UserIcon, Bookmark, 
  Shield, MapPin, Briefcase, Plus, Edit2, Activity, CheckCircle2, 
  Power, PowerOff, X, Save, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    pic_name: "",
    pic_phone: "",
    bidang_usaha: "",
    customer_type: "Corporate" as "Corporate" | "Individual"
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await getAllCustomers();
    if (res.error) {
      setError(res.error);
    } else {
      setCustomers(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = (id: string, currentState: boolean) => {
    if (!confirm(currentState ? "Suspend this customer contract?" : "Reactivate this customer contract?")) return;
    startTransition(async () => {
      const res = await toggleCustomerStatus(id, currentState);
      if ("success" in res && res.success) fetchData();
    });
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditId(null);
    setFormData({ name: "", pic_name: "", pic_phone: "", bidang_usaha: "", customer_type: "Corporate" });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: any) => {
    setModalMode("edit");
    setEditId(customer.id);
    setFormData({
      name: customer.name,
      pic_name: customer.pic_name,
      pic_phone: customer.pic_phone,
      bidang_usaha: customer.bidang_usaha,
      customer_type: customer.customer_type
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    startTransition(async () => {
      let res;
      if (modalMode === "create") {
        res = await createCustomer(formData);
      } else if (modalMode === "edit" && editId) {
        res = await updateCustomer(editId, formData);
      }
      
      if (res && "success" in res && res.success) {
        closeModal();
        fetchData();
      } else {
        alert((res as any)?.error || "An error occurred");
      }
    });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.pic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.bidang_usaha.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Shield size={40} />
        </motion.div>
        <h2 className="text-3xl font-black text-[#003366] tracking-tight mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12 relative isolate">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-blue-600">
            <Building2 className="w-3.5 h-3.5" />
            <span>Internal Access</span>
          </div>
          <h1 className="text-4xl font-black text-[#003366] tracking-tight">
            Client <span className="text-[#00a1e4]">Directory</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-3 mt-4">
            Managing {customers.length} Registered Portfolios
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-72 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-600" />
            <input 
              type="text"
              placeholder="Search companies..."
              className="w-full pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={openCreateModal}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#00a1e4] hover:bg-[#008cc6] text-white rounded-2xl text-sm font-bold shadow-[0_8px_16px_-6px_rgba(0,161,228,0.4)] transition-all flex justify-center items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Portfolio</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse isolate min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Corporate Entity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Point of Contact</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Industry / Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Linked Assets</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
                        <div className="relative w-10 h-10">
                          <div className="absolute inset-0 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Portfolios...</p>
                      </motion.div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <p className="text-sm font-bold text-slate-400 mb-2">No matching companies found.</p>
                      <p className="text-xs text-slate-400 font-medium">Try adjusting your search query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, index) => (
                    <motion.tr 
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`transition-colors group ${!customer.is_active ? 'bg-slate-50/50' : 'hover:bg-amber-50/30'}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border shrink-0 transition-colors
                            ${customer.is_active ? 'bg-gradient-to-br from-amber-100 to-orange-50 text-amber-900 border-amber-200/50' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {customer.name?.charAt(0).toUpperCase() || "C"}
                          </div>
                          <div>
                            <p className={`text-sm font-bold tracking-tight mb-0.5 ${customer.is_active ? 'text-slate-800' : 'text-slate-400'}`}>
                              {customer.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <MapPin className="w-3 h-3" />
                              <p className="text-[10px] font-black uppercase tracking-widest">{customer.customer_type}</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                            <p className={`text-xs font-bold ${customer.is_active ? 'text-slate-700' : 'text-slate-400'}`}>{customer.pic_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <p className="text-xs font-medium text-slate-500">{customer.pic_phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2 w-max">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${customer.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {customer.is_active ? <CheckCircle2 size={12} /> : <Activity size={12} />}
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {customer.is_active ? "Active" : "Suspended"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                            {customer.bidang_usaha}
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-right w-40">
                        <Link href={`/dashboard/customers/${customer.id}/projects`} className={`inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:ring-2 hover:ring-blue-100
                          ${customer.is_active ? 'bg-white text-[#003366] hover:border-blue-300 cursor-pointer' : 'bg-slate-50 text-slate-400 cursor-not-allowed pointer-events-none'}`}>
                          <Bookmark size={14} className="opacity-50" />
                          <span className="text-sm font-black">{customer.projects_count}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-70 mt-0.5">Projects</span>
                        </Link>
                      </td>

                      <td className="px-8 py-5 text-right w-32">
                        <div className="flex flex-col items-end gap-2 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                          
                          <button 
                            onClick={() => openEditModal(customer)}
                            disabled={isPending}
                            className="bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-500 p-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
                            title="Edit Record"
                          >
                            <span className="text-[9px] font-black uppercase tracking-wider hidden sm:block pl-1">Edit</span>
                            <Edit2 size={14} />
                          </button>

                          <button 
                            onClick={() => handleToggleStatus(customer.id, customer.is_active)}
                            disabled={isPending}
                            className={`p-2 rounded-xl transition-all border shadow-sm flex items-center gap-2 ${
                              customer.is_active 
                                ? "bg-white border-slate-200 hover:border-rose-300 hover:text-rose-600 text-slate-400" 
                                : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                            }`}
                            title={customer.is_active ? "Suspend Contract" : "Reactivate Contract"}
                          >
                            <span className="text-[9px] font-black uppercase tracking-wider hidden sm:block pl-1">
                              {customer.is_active ? "Suspend" : "Activate"}
                            </span>
                            {customer.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                          </button>

                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CRUD Form Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-3xl shadow-2xl relative z-10 w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-200">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#003366] tracking-tight">
                      {modalMode === 'create' ? 'New Customer' : 'Edit Customer'}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Portfolio Details</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh] bg-white">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-sm"
                      placeholder="e.g. PT Maju Bersama"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PIC Name</label>
                      <input 
                        type="text"
                        value={formData.pic_name} onChange={e => setFormData({...formData, pic_name: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PIC Phone</label>
                      <input 
                        type="text"
                        value={formData.pic_phone} onChange={e => setFormData({...formData, pic_phone: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry / Business Type</label>
                    <input 
                      type="text"
                      value={formData.bidang_usaha} onChange={e => setFormData({...formData, bidang_usaha: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-sm"
                      placeholder="e.g. Manufacturing, Hospital"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Type</label>
                    <select 
                      value={formData.customer_type} onChange={e => setFormData({...formData, customer_type: e.target.value as any})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-sm appearance-none"
                    >
                      <option value="Corporate">Corporate</option>
                      <option value="Individual">Individual</option>
                    </select>
                  </div>

                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button 
                    type="button" onClick={closeModal}
                    className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {isPending ? "Processing..." : "Save Record"}
                    {!isPending && <Save size={14} />}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
