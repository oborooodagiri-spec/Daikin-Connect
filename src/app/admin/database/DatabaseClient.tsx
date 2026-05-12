"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  FileText, 
  Presentation, 
  BookOpen, 
  Download, 
  ExternalLink, 
  Filter, 
  Folder, 
  Layers, 
  Clock, 
  File, 
  ShieldAlert,
  ChevronRight,
  Database,
  Grid,
  List as ListIcon,
  Tag,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { getResources, createResource, deleteResource, updateResource } from "@/app/actions/database";
import { getAllUsers } from "@/app/actions/users";
import { getSession } from "@/app/actions/auth";
import { getAllProjects } from "@/app/actions/projects";
import { Plus, X as CloseIcon, Shield, Globe, Trash2, Loader2, Settings as SettingsIcon } from "lucide-react";

/**
 * Mock Data for Knowledge Center
 */
const INITIAL_RESOURCES = [
  {
    id: "ves-flow-app",
    title: "VES Project Flow (Interactive Tool)",
    category: "Interactive App",
    type: "APP",
    size: "LIVE",
    date: "2026-04-27",
    tags: ["VES", "Flow", "Strategic"],
    thumbnail: "/images/ves-flow-isometric.png",
    href: "/admin/ves-flow"
  },
  {
    id: "ops-schedule",
    title: "Operational Daily Schedule",
    category: "Interactive App",
    type: "SPREADSHEET",
    size: "LIVE",
    date: "2026-04-27",
    tags: ["Operational", "Excel", "Schedule"],
    thumbnail: "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=300",
    href: "/admin/schedule"
  },
  {
    id: "1",
    title: "VES Strategic Roadmap 2026",
    category: "Presentation",
    type: "PPTX",
    size: "12.4 MB",
    date: "2026-04-15",
    tags: ["VES", "Strategy", "Roadmap"],
    thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "2",
    title: "Daikin VRV-X Series Catalog",
    category: "Catalog",
    type: "PDF",
    size: "8.2 MB",
    date: "2026-03-20",
    tags: ["VRV-X", "Product", "Catalog"],
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "3",
    title: "Maintenance Best Practices Guide",
    category: "Technical",
    type: "PDF",
    size: "4.5 MB",
    date: "2026-04-02",
    tags: ["Maintenance", "Guide", "Operations"],
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "4",
    title: "VES Flow Presentation Deck",
    category: "Presentation",
    type: "PDF",
    size: "15.1 MB",
    date: "2026-04-26",
    tags: ["VES", "Flow", "Client"],
    thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "5",
    title: "Air Handling Unit Technical Specs",
    category: "Catalog",
    type: "PDF",
    size: "6.8 MB",
    date: "2026-02-14",
    tags: ["AHU", "Technical", "Specs"],
    thumbnail: "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "6",
    title: "Sustainability Impact Report Q1",
    category: "Marketing",
    type: "PDF",
    size: "3.2 MB",
    date: "2026-04-10",
    tags: ["ESG", "Sustainability", "Report"],
    thumbnail: "https://images.unsplash.com/photo-1454165833767-12466a0bc11d?auto=format&fit=crop&q=80&w=300"
  }
];

const CATEGORIES = ["All", "Interactive App", "Presentation", "Catalog", "Technical", "Marketing"];

export default function KnowledgeCenterPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [session, setSession] = useState<any>(null);
  
  // Admin Specific
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [formData, setFormData] = useState({
    title: "", category: "Technical", type: "PDF",
    file_url: "", href: "", thumbnail: "", size: "",
    tags: "", visibility: "Internal", allowed_users: "", project_id: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const [resData, sessData, projData, usersData] = await Promise.all([
      getResources(),
      getSession(),
      getAllProjects(),
      getAllUsers()
    ]);

    if (resData.success) setResources(resData.data);
    if (sessData) setSession(sessData);
    if (projData.success) setProjects(projData.data);
    if (usersData?.success) setAllUsers(usersData.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isAdmin = session?.roles?.some((r: string) => ["Admin", "Super Admin"].includes(r));

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const tagsArray = res.tags ? res.tags.split(",").map((t: string) => t.trim()) : [];
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tagsArray.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || res.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, resources]);

  const handleOpenEdit = (res: any) => {
    setEditId(res.id);
    setFormData({
      title: res.title,
      category: res.category,
      type: res.type,
      file_url: res.file_url || "",
      href: res.href || "",
      thumbnail: res.thumbnail || "",
      size: res.size || "",
      tags: res.tags || "",
      visibility: res.visibility,
      allowed_users: res.allowed_users || "",
      project_id: res.project_id?.toString() || "General"
    });
    setIsModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      project_id: formData.project_id === "General" ? null : formData.project_id
    };

    let res;
    if (editId) {
      res = await updateResource(editId, payload);
    } else {
      res = await createResource(payload);
    }

    if (res.success) {
      setIsModalOpen(false);
      setEditId(null);
      setFormData({
        title: "", category: "Technical", type: "PDF",
        file_url: "", href: "", thumbnail: "", size: "",
        tags: "", visibility: "Internal", allowed_users: "", project_id: ""
      });
      fetchData();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    const res = await deleteResource(id);
    if (res.success) fetchData();
    else alert(res.error);
  };

  return (
    <div className="min-h-screen bg-white text-[#323338] p-6 md:p-12 selection:bg-blue-100">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase text-[#323338]">
              Internal <br/>
              <span className="text-slate-400">Database</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
             {isAdmin && (
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="flex items-center gap-2 px-6 py-3 bg-[#323338] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
               >
                 <Plus size={16} /> Add Resource
               </button>
             )}
             <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-[#0073ea] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-[#0073ea] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <ListIcon className="w-5 h-5" />
                </button>
             </div>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          <div className="lg:col-span-3 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#0073ea] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari materi, katalog, atau tag khusus..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#e6e9ef] rounded-2xl py-5 px-16 text-lg font-bold outline-none focus:border-[#0073ea] focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-hover:text-[#0073ea] transition-colors" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none bg-white border border-[#e6e9ef] rounded-2xl py-5 px-16 font-bold text-xs uppercase tracking-widest outline-none focus:border-[#0073ea] transition-all cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-2">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Displaying Results</span>
              <div className="h-4 w-px bg-slate-100" />
              <span className="text-sm font-bold text-[#0073ea]">{loading ? "Loading..." : `${filteredResources.length} Assets Found`}</span>
           </div>
        </div>

        {/* Assets Grid/List */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredResources.map((res, i) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-white border border-[#e6e9ef] rounded-[2rem] p-4 hover:border-[#0073ea]/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
                >
                  <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-6 bg-slate-50 border border-slate-100">
                    {res.thumbnail ? (
                      <img 
                        src={res.thumbnail} 
                        alt={res.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <FileText className="w-12 h-12 text-slate-200" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2 pr-4">
                       <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 text-[9px] font-black uppercase tracking-widest text-[#0073ea] shadow-sm">
                          {res.category}
                       </span>
                       <span className={`px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-100 text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 ${res.visibility === 'Internal' ? 'bg-indigo-50/90 text-indigo-600' : 'bg-emerald-50/90 text-emerald-600'}`}>
                          {res.visibility === 'Internal' ? <Shield size={10} /> : <Globe size={10} />}
                          {res.visibility}
                       </span>
                    </div>
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(res)}
                          className="p-2 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                          title="Edit"
                        >
                          <SettingsIcon size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(res.id)}
                          className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="px-2 pb-2 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[9px] font-black text-[#0073ea] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{res.projects?.name || "UMUM"}</span>
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-[#323338] group-hover:text-[#0073ea] transition-colors line-clamp-1 uppercase leading-tight">{res.title}</h3>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(res.created_at).toISOString().split('T')[0]}</div>
                         {res.size && <div className="flex items-center gap-1.5"><Layers className="w-3 h-3" /> {res.size}</div>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       {res.tags?.split(",").map((tag: string) => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-50 text-[9px] font-bold text-slate-500">#{tag.trim()}</span>
                       ))}
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                       {res.href || res.file_url ? (
                         <a 
                           href={res.href || res.file_url} 
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex-1 bg-[#0073ea] hover:bg-[#0060c5] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
                         >
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Luncurkan</span>
                         </a>
                       ) : (
                          <div className="flex-1 bg-slate-50 py-3.5 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">
                            No Link Available
                          </div>
                       )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {filteredResources.map((res, i) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-6 bg-white border border-[#e6e9ef] p-4 rounded-2xl hover:border-[#0073ea]/30 transition-all group"
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                    {res.category === "Interactive App" ? <Sparkles className="w-5 h-5 text-[#0073ea]" /> :
                     res.category === "Presentation" ? <Presentation className="w-5 h-5 text-[#0073ea]" /> : 
                     res.category === "Catalog" ? <BookOpen className="w-5 h-5 text-[#0073ea]" /> : 
                     <FileText className="w-5 h-5 text-[#0073ea]" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                       <h3 className="text-md font-bold text-[#323338] truncate group-hover:text-[#0073ea] transition-colors uppercase">{res.title}</h3>
                       <span className="text-[8px] font-black text-[#0073ea] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shrink-0">{res.projects?.name || "UMUM"}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{res.category} &bull; {res.type} &bull; {res.size || "Live"}</span>
                       <div className="h-2 w-px bg-slate-100" />
                       <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${res.visibility === 'Internal' ? 'text-indigo-500' : 'text-emerald-500'}`}>
                          {res.visibility === 'Internal' ? <Shield size={10} /> : <Globe size={10} />}
                          {res.visibility}
                       </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pr-2">
                     {isAdmin && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => handleOpenEdit(res)}
                            className="p-2.5 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white"
                          >
                            <SettingsIcon size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(res.id)}
                            className="p-2.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                     )}
                     {res.href || res.file_url ? (
                       <a 
                         href={res.href || res.file_url} 
                         target="_blank"
                         rel="noopener noreferrer"
                         className="px-5 py-2.5 bg-[#0073ea] hover:bg-[#0060c5] rounded-lg transition-all flex items-center gap-2"
                       >
                          <span className="text-[9px] font-black uppercase tracking-widest text-white">Buka</span>
                       </a>
                     ) : (
                       <button className="p-2.5 bg-slate-50 text-slate-300 rounded-lg cursor-not-allowed">
                          <Download className="w-4 h-4" />
                       </button>
                     )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 pb-12">
           <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                Akses Terbatas &bull; {session?.isInternal ? "INTERNAL STAFF MODE" : "EXTERNAL ACCESS"}
              </p>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">&copy; 2026 EPL Connect Portal</p>
        </footer>
      </div>

      {/* Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-[#323338]/60 backdrop-blur-md" 
               onClick={() => setIsModalOpen(false)} 
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 custom-scrollbar"
             >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-[#323338] tracking-tight uppercase">
                      {editId ? "Edit Database" : "Add New Database"}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Database Management</p>
                  </div>
                  <button onClick={() => { setIsModalOpen(false); setEditId(null); }} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"><CloseIcon size={20}/></button>
                </div>

                <form onSubmit={handleCreate} className="space-y-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Name</label>
                     <input 
                       type="text" required value={formData.title} 
                       onChange={e => setFormData({...formData, title: e.target.value})} 
                       placeholder="e.g. Catalog VRV-X 2026"
                       className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" 
                     />
                   </div>

                   
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specific Account Access</label>
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                           type="text" 
                           placeholder="Search account name to grant access..." 
                           value={userSearch}
                           onChange={e => setUserSearch(e.target.value)}
                           className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-[#0073ea] transition-all"
                        />
                     </div>
                     {userSearch && (
                        <div className="mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2 z-50 relative">
                           {allUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()))
                              .slice(0, 10)
                              .map(u => (
                                 <button 
                                    key={u.id}
                                    type="button"
                                    onClick={() => {
                                       const current = formData.allowed_users ? formData.allowed_users.split(",") : [];
                                       if (!current.includes(u.id.toString())) {
                                          setFormData({...formData, allowed_users: [...current, u.id.toString()].filter(Boolean).join(",")});
                                       }
                                       setUserSearch("");
                                    }}
                                    className="w-full text-left p-3 hover:bg-blue-50 rounded-xl flex items-center justify-between group transition-colors"
                                 >
                                    <div>
                                       <p className="font-bold text-sm text-slate-700">{u.name}</p>
                                       <p className="text-[9px] text-slate-400 uppercase font-black">{u.roles?.[0] || 'User'}</p>
                                    </div>
                                    <Plus size={14} className="text-slate-300 group-hover:text-[#0073ea]" />
                                 </button>
                              ))
                           }
                           {allUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                              <p className="p-4 text-center text-xs text-slate-400 font-bold italic">No accounts found matching your search.</p>
                           )}
                        </div>
                     )}
                     <div className="flex flex-wrap gap-2 mt-3">
                        {formData.allowed_users?.split(",").filter(Boolean).map(uid => {
                           const u = allUsers.find(user => user.id.toString() === uid);
                           return (
                              <span key={uid} className="px-3 py-1.5 bg-blue-50 text-[#0073ea] rounded-full text-[10px] font-black flex items-center gap-2 border border-blue-100 animate-in zoom-in-95 duration-200">
                                 {u?.name || `ID: ${uid}`}
                                 <button 
                                    type="button" 
                                    onClick={() => {
                                       const next = formData.allowed_users.split(",").filter(id => id !== uid).join(",");
                                       setFormData({...formData, allowed_users: next});
                                    }}
                                    className="hover:text-rose-500 transition-colors"
                                 >
                                    <CloseIcon size={12} />
                                 </button>
                              </span>
                           )
                        })}
                        {(!formData.allowed_users || formData.allowed_users === "") && (
                           <p className="text-[10px] text-slate-400 font-bold italic ml-1">No specific accounts selected (Inherit visibility scope).</p>
                        )}
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <select 
                          value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all"
                        >
                          {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">File Type</label>
                        <select 
                          value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all"
                        >
                          <option value="PDF">PDF Document</option>
                          <option value="PPTX">PowerPoint</option>
                          <option value="APP">Interactive Tool</option>
                          <option value="SPREADSHEET">Excel/Spreadsheet</option>
                        </select>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visibility</label>
                        <select 
                          value={formData.visibility} onChange={e => setFormData({...formData, visibility: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all"
                        >
                          <option value="Internal">Internal Staff Only</option>
                          <option value="Public">Public / General</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Association</label>
                        <select 
                          value={formData.project_id} onChange={e => setFormData({...formData, project_id: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all"
                        >
                          <option value="General">UMUM (General Resource)</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset URL (File or Link)</label>
                     <input 
                       type="text" value={formData.file_url} 
                       onChange={e => setFormData({...formData, file_url: e.target.value, href: e.target.value})} 
                       placeholder="https://..."
                       className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" 
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thumbnail Image URL</label>
                        <input 
                          type="text" value={formData.thumbnail} 
                          onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tags (Comma separated)</label>
                        <input 
                          type="text" value={formData.tags} 
                          onChange={e => setFormData({...formData, tags: e.target.value})} 
                          placeholder="tag1, tag2, tag3"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" 
                        />
                      </div>
                   </div>

                   <div className="pt-8 flex justify-end gap-4">
                      <button type="button" onClick={() => { setIsModalOpen(false); setEditId(null); }} className="px-8 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-10 py-4 rounded-2xl bg-[#0073ea] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#0060c5] shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (editId ? <SettingsIcon size={16} /> : <Plus size={16} />)}
                        {editId ? "Update Asset" : "Save Asset"}
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
