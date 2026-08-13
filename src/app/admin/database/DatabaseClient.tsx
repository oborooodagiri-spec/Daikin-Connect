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
  Sparkles,
  Info,
  Shield,
  Globe,
  Trash2,
  Loader2,
  Settings as SettingsIcon,
  Plus,
  X as CloseIcon,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getResources, createResource, deleteResource, updateResource } from "@/app/actions/database";
import { getAllUsers } from "@/app/actions/users";
import { getSession } from "@/app/actions/auth";
import { getAllProjects } from "@/app/actions/projects";

const CATEGORIES = ["All", "Strategy", "Juklak", "Juknis", "Rate Card", "Logsheet", "Interactive App", "Presentation", "Catalog", "Technical", "Marketing"];

export default function KnowledgeCenterPage() {
  const router = useRouter();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  // View mode is always list
  const [session, setSession] = useState<any>(null);
  
  const [viewingResource, setViewingResource] = useState<any>(null);
  
  // Admin Specific
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [formData, setFormData] = useState({
    title: "", category: "Presentation", type: "PPTX",
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

    if ('success' in resData && resData.success && 'data' in resData) {
      setResources(resData.data);
    }
    if (sessData) setSession(sessData);
    if ('success' in projData && projData.success && 'data' in projData) setProjects(projData.data);
    if (usersData && 'success' in usersData && usersData.success && 'data' in usersData) setAllUsers(usersData.data);
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
        title: "", category: "Presentation", type: "PPTX",
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

  const handleResourceClick = (res: any) => {
    if (res.type === "PPTX" || res.type === "PDF" || res.category === "Presentation") {
      setViewingResource(res);
    } else {
      if (res.type === "DATABASE") {
        router.push(res.href || res.file_url || "#");
      } else {
        window.open(res.href || res.file_url || "#", "_blank");
      }
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("1drv.ms") || url.includes("sharepoint.com") || url.includes("onedrive.live.com")) {
      if (url.includes("action=embedview")) return url;
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}action=embedview&wdbipreview=true`;
    }
    if (url.includes("drive.google.com")) {
      return url.replace("/view", "/preview");
    }
    if (url.toLowerCase().endsWith(".pdf")) {
      return url; 
    }
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  };


  const renderFolderCard = (title: string, onClick: () => void) => (
    <div 
      key={title}
      onClick={onClick}
      className="flex flex-col bg-white border border-[#e6e9ef] p-6 rounded-[1.5rem] hover:border-[#0073ea] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer items-center justify-center gap-4"
    >
      <Folder className="w-16 h-16 text-[#0073ea] fill-blue-50" strokeWidth={1} />
      <h3 className="text-sm font-bold text-[#323338] text-center leading-tight">{title}</h3>
    </div>
  );

  const renderResourceCard = (res: any, i: number) => (
    <motion.div
      key={res.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="flex flex-col bg-white border border-[#e6e9ef] p-4 rounded-[1.5rem] hover:border-[#0073ea] hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative"
      onClick={() => handleResourceClick(res)}
    >
      <div className="w-full aspect-[4/3] rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 mb-4 overflow-hidden relative">
        {res.thumbnail ? (
          <img src={res.thumbnail} alt={res.title} className="w-full h-full object-cover" />
        ) : (
           res.id === "internal-rate-card" ? <Briefcase className="w-12 h-12 text-[#0073ea]" strokeWidth={1} /> :
           res.category === "Interactive App" ? <Sparkles className="w-12 h-12 text-emerald-500" strokeWidth={1} /> :
           (res.type === "PPTX" || res.category === "Presentation") ? <Presentation className="w-12 h-12 text-orange-500" strokeWidth={1} /> : 
           res.category === "Catalog" ? <BookOpen className="w-12 h-12 text-indigo-500" strokeWidth={1} /> : 
           <FileText className="w-12 h-12 text-slate-400" strokeWidth={1} />
        )}
        
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm border border-slate-200">
          <span className="text-[8px] font-black uppercase text-slate-500">{res.type}</span>
        </div>
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-[#323338] line-clamp-2 leading-tight group-hover:text-[#0073ea] transition-colors mb-2 text-center">{res.title}</h3>
        
        <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
           {res.projects?.name && (
             <span className="text-[8px] font-black text-[#0073ea] bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100 shrink-0 truncate max-w-[80px]">{res.projects.name}</span>
           )}
           <span className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${res.visibility === 'Internal' ? 'text-indigo-500' : 'text-emerald-500'}`}>
              {res.visibility === 'Internal' ? <Shield size={8} /> : <Globe size={8} />}
              {res.visibility}
           </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white text-[#323338] p-6 md:p-12 selection:bg-blue-100">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase text-[#323338]">
              Data<span className="text-slate-400">base</span>
            </h1>
          </div>

          <div className="flex items-center gap-3"></div>
        </header>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-2">
           <div className="flex items-center gap-4">
             {currentPath.length > 0 && (
               <button 
                 onClick={() => setCurrentPath(currentPath.slice(0, -1))}
                 className="w-12 h-12 bg-slate-50 border border-slate-200 hover:border-[#0073ea] hover:bg-blue-50 text-slate-500 hover:text-[#0073ea] rounded-full flex items-center justify-center transition-all shadow-sm"
                 title="Back"
               >
                 <ChevronRight className="rotate-180 w-6 h-6" />
               </button>
             )}
           </div>

           <div className="flex items-center gap-4 text-right">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {currentPath.length === 0 ? "Root" : currentPath.join(" / ")}
              </span>
              <div className="h-4 w-px bg-slate-100" />
              <span className="text-sm font-bold text-[#0073ea]">
                Directory
              </span>
           </div>
        </div>

        {/* Assets Grid/List */}
        <AnimatePresence mode="wait">
          {searchQuery ? (
            // Search Mode: Show files directly
            filteredResources.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/60 p-8 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-[#323338] mb-2 uppercase tracking-tight">Tidak Ada Hasil</h3>
                <p className="text-sm font-bold text-slate-400 max-w-md mx-auto leading-relaxed">
                  Pencarian Anda tidak menemukan dokumen yang cocok.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="search-grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
              >
                {filteredResources.map((res: any, i: number) => renderResourceCard(res, i))}
              </motion.div>
            )
          ) : (
            // Directory Mode
            <motion.div 
              key="dir-grid"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
            >
              {currentPath.length === 0 && (
                <>
                  {renderFolderCard("Reports", () => setCurrentPath(["Reports"]))}
                  {renderFolderCard("Schedule", () => setCurrentPath(["Schedule"]))}
                </>
              )}
              {currentPath.length === 1 && currentPath[0] === "Reports" && (
                <>
                  {renderFolderCard("Preventive Maintenance", () => setCurrentPath(["Reports", "Preventive Maintenance"]))}
                  {renderFolderCard("Corrective Maintenance", () => setCurrentPath(["Reports", "Corrective Maintenance"]))}
                  {renderFolderCard("MCI", () => setCurrentPath(["Reports", "MCI"]))}
                  {renderFolderCard("Audit", () => setCurrentPath(["Reports", "Audit"]))}
                  {renderFolderCard("Logsheet", () => setCurrentPath(["Reports", "Logsheet"]))}
                </>
              )}
              {/* Files based on path */}
              {(() => {
                 let pathFiltered: any[] = [];
                 if (currentPath.length === 1 && currentPath[0] === "Schedule") {
                   pathFiltered = resources.filter((res: any) => res.title.toLowerCase().includes("schedule"));
                 } else if (currentPath.length === 2 && currentPath[0] === "Reports" && currentPath[1] === "Logsheet") {
                   pathFiltered = resources.filter((res: any) => res.title.toLowerCase().includes("logsheet"));
                 }
                 
                 return pathFiltered.map((res: any, i: number) => renderResourceCard(res, i));
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 pb-12">
           <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                Akses Terbatas - {session?.isInternal ? "Internal" : "External"}
              </p>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">&copy; 2026 Daikin Service & Solutions Indonesia Portal</p>
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
                          <option value="DATABASE">Internal Database</option>
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
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                       <span>Asset URL (OneDrive Share Link, Google Drive, or Direct Link)</span>
                       <span className="text-[#0073ea]">TIPS: OneDrive & Google Drive supported!</span>
                     </label>
                     <input 
                       type="text" value={formData.file_url} 
                       onChange={e => setFormData({...formData, file_url: e.target.value, href: e.target.value})} 
                       placeholder="https://company-my.sharepoint.com/... or https://1drv.ms/..."
                       className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0073ea] transition-all" 
                     />
                     <p className="text-[9px] text-slate-400 ml-1 mt-1 font-bold">
                       Untuk presentasi (PPT), cukup *paste* link Share dari OneDrive (Anyone with the link can view). Sistem akan otomatis membuat <i>live presentation viewer</i> di dalam website.
                     </p>
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

                   
                   {/* Access Summary Preview */}
                   <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-inner">
                      <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500">
                               <Shield size={18} />
                            </div>
                            <div>
                               <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Live Access Preview</h3>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Real-time visibility summary</p>
                            </div>
                         </div>
                         <div className="px-3 py-1 bg-[#0073ea]/10 rounded-full border border-[#0073ea]/20">
                            <span className="text-[9px] font-black text-[#0073ea] uppercase tracking-widest">Active Policies</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  Account Access
                               </p>
                               <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                                  {formData.allowed_users ? (
                                     formData.allowed_users.split(",").filter(Boolean).map((uid, i, arr) => {
                                        const u = allUsers.find(user => user.id.toString() === uid);
                                        return (
                                           <React.Fragment key={uid}>
                                              <span className="text-xs font-bold text-slate-700">{u?.name || uid}</span>
                                              {i < arr.length - 1 && <span className="text-slate-300 font-black">/</span>}
                                           </React.Fragment>
                                        );
                                     })
                                  ) : (
                                     <span className="text-xs font-bold text-slate-400 italic">No specific accounts restricted.</span>
                                  )}
                               </div>
                            </div>

                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Project Group
                               </p>
                               <p className="text-xs font-bold text-slate-700">
                                  {formData.project_id && formData.project_id !== "General" ? (
                                     <span className="text-emerald-600">All members assigned to &quot;{projects.find(p => p.id.toString() === formData.project_id)?.name}&quot;</span>
                                  ) : (
                                     <span className="text-slate-400 italic">No specific project association.</span>
                                  )}
                                </p>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  Global Scope
                               </p>
                               <div className="flex items-center gap-3">
                                  {formData.visibility === "Internal" ? (
                                     <>
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                           <Shield size={14} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 leading-tight">Internal Staff, Engineers, and Management Only.</p>
                                     </>
                                  ) : (
                                     <>
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                           <Globe size={14} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 leading-tight">Public / Open Access for all authenticated users.</p>
                                     </>
                                  )}
                               </div>
                            </div>
                            <div className="pt-2">
                               <p className="text-[10px] font-bold text-[#0073ea] flex items-center gap-2 bg-blue-50 px-4 py-3 rounded-2xl border border-blue-100">
                                  <Info size={14} />
                                  <span>Admins and Super Admins always have full access.</span>
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 flex justify-end gap-4">
                      <button type="button" onClick={() => { setIsModalOpen(false); setEditId(null); }} className="px-8 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-10 py-4 rounded-2xl bg-[#0073ea] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#0060c5] shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
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

      {/* Presentation Viewer Modal */}
      <AnimatePresence>
        {viewingResource && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }} 
            className="fixed inset-0 z-[300] flex flex-col bg-[#1e1f22] text-white"
          >
            <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-[#2b2d31]">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                   <Presentation size={20} />
                 </div>
                 <div className="min-w-0 pr-4">
                   <h2 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{viewingResource.title}</h2>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate">{viewingResource.category} • {viewingResource.visibility}</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                 <a href={viewingResource.file_url || viewingResource.href} target="_blank" className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all">
                   <ExternalLink size={14} /> Buka di Tab Baru
                 </a>
                 <button onClick={() => setViewingResource(null)} className="w-10 h-10 rounded-lg bg-rose-500 hover:bg-rose-600 flex items-center justify-center transition-all">
                   <CloseIcon size={18} />
                 </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-[#1e1f22] relative">
              {!getEmbedUrl(viewingResource.file_url || viewingResource.href) ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <ShieldAlert size={48} className="mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">Preview Tidak Tersedia</h3>
                    <p className="text-sm max-w-md">URL file ini tidak mendukung *live preview*. Silakan buka menggunakan tombol di kanan atas.</p>
                 </div>
              ) : (
                <iframe 
                   src={getEmbedUrl(viewingResource.file_url || viewingResource.href)}
                   className="w-full h-full border-none bg-white"
                   title={viewingResource.title}
                   allowFullScreen
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RelativeTime({ date }: { date: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
