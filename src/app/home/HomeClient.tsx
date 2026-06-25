"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Building2, Shield, ChevronRight,
  Camera, X, Check, Search, LogOut, Settings, Clock,
  FileText, Calendar, Upload, Download, Activity, Edit3,
  LayoutDashboard, ExternalLink, Database, Users, Briefcase, BookOpen, Wrench, Package
} from "lucide-react";
import StaticLogo from "@/components/ui/StaticLogo";
import { updateProfile, saveAvatarUrl } from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import { getAllCustomers } from "@/app/actions/customers";
import { createProject } from "@/app/actions/projects";

interface Project {
  id: string; name: string; code: string | null;
  customer: string; unitCount: number; status: string;
  salesPlanner?: string;
  salesEngineer?: string;
  engineer?: string;
  pic?: string;
}
interface ActivityItem {
  id: string; action: string; description: string;
  icon: string; link: string | null; createdAt: string | Date | null;
}
interface Profile {
  id: number; name: string; email: string; phone: string | null;
  company: string | null; avatarUrl: string | null; bio: string | null;
  roles: string[]; isAdmin: boolean; isInternal: boolean;
  twoFactorEnabled: boolean; attendanceEnabled: boolean; projects: Project[];
}


function timeAgo(dateIn: any): string {
  if (!dateIn) return "-";
  const dateObj = typeof dateIn === 'string' ? new Date(dateIn) : dateIn;
  const diff = Date.now() - dateObj.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lalu`;
  return dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function RelativeTime({ date }: { date: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{timeAgo(date)}</>;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  login: <LogOut size={16} />, shield: <Shield size={16} />,
  user: <User size={16} />, file: <FileText size={16} />,
  calendar: <Calendar size={16} />, upload: <Upload size={16} />,
  download: <Download size={16} />, activity: <Activity size={16} />,
};

const PROJECT_COLORS = [
  "#0073ea", "#00c875", "#e44258", "#fdab3d", "#579bfc",
  "#a25ddc", "#037f4c", "#66ccff", "#ff5ac4", "#ff642e",
];

export default function HomeClient({ profile, recentActivity }: { profile: Profile; recentActivity: ActivityItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const [editName, setEditName] = useState(profile.name);
  const [editPhone, setEditPhone] = useState(profile.phone || "");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [greeting, setGreeting] = useState("Selamat Datang");
  
  // New Project State
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectCustomer, setNewProjectCustomer] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (h >= 5 && h < 12) setGreeting("Selamat Pagi");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    else if (h >= 12 && h < 15) setGreeting("Selamat Siang");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    else if (h >= 15 && h < 18) setGreeting("Selamat Sore");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    else setGreeting("Selamat Malam");
  }, []);

  const filtered = profile.projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.customer.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({ name: editName, phone: editPhone });
    setSaving(false);
    setEditOpen(false);
    router.refresh();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/v1/profile/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        await saveAvatarUrl(data.url);
        router.refresh();
      }
    } catch (err) { console.error(err); }
    setAvatarUploading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleCardHover = (e: React.MouseEvent<HTMLElement>, isEnter: boolean) => {
    const el = e.currentTarget;
    if (isEnter) {
      el.style.borderColor = "#0073ea";
      el.style.boxShadow = "0 8px 24px rgba(0,115,234,0.12)";
    } else {
      el.style.borderColor = "#e6e9ef";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
    }
  };

  const navigateProject = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/w/${p.id}/dashboard`);
  };

  const openProjectModal = (p: Project) => {
    setSelectedProject(p);
    setProjectModalOpen(true);
  };

  const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const handleOpenCreateProject = async () => {
    setCreateProjectOpen(true);
    const res = await getAllCustomers();
    if (res && res.success && res.data) {
      setCustomersList(res.data);
    }
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !newProjectCustomer) {
      alert("Nama Project dan Customer wajib diisi.");
      return;
    }
    setCreatingProject(true);
    const res = await createProject(newProjectCustomer, { name: newProjectName });
    setCreatingProject(false);
    if (res && res.success) {
      setCreateProjectOpen(false);
      setNewProjectName("");
      setNewProjectCustomer("");
      alert("Project berhasil dibuat. Silakan refresh halaman jika project tidak langsung muncul.");
      router.refresh();
      // Optional: Refresh local state if you have a fetch
      window.location.reload();
    } else {
      alert((res as unknown as { error?: string })?.error || "Gagal membuat project.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Top Bar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #e6e9ef", background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
        <StaticLogo size={32} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {profile.isAdmin && (
            <button onClick={() => router.push("/admin")} style={{ ...btnGhost, fontSize: 13 }}>
              <Settings size={16} /> Admin
            </button>
          )}
          <button onClick={handleLogout} style={{ ...btnGhost, color: "#e44258", fontSize: 13 }}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 64px" }}>
        {/* Profile Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {/* Avatar */}
            <label style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: profile.avatarUrl ? `url(${profile.avatarUrl}) center/cover` : "linear-gradient(135deg, #0073ea, #579bfc)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 700, border: "3px solid #e6e9ef" }}>
                {!profile.avatarUrl && initials}
              </div>
              <div style={{ position: "absolute", bottom: 0, right: 0, background: "#0073ea", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                {avatarUploading ? <div style={{ width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> : <Camera size={14} color="#fff" />}
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
            </label>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 14, color: "#676879", marginBottom: 2 }}>{greeting},</p>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#323338", margin: 0, lineHeight: 1.2 }}>{profile.name}</h1>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8, fontSize: 13, color: "#676879" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={14} /> {profile.email}</span>
                {profile.company && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Building2 size={14} /> {profile.company}</span>}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {profile.roles.map(r => (
                  <span key={r} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: "#f0f3ff", color: "#0073ea", fontWeight: 600 }}>{r}</span>
                ))}
              </div>
            </div>

            {/* Edit Button */}
            <button onClick={() => setEditOpen(true)} style={{ ...btnOutline, flexShrink: 0 }}>
              <Edit3 size={15} /> Edit Profil
            </button>
          </div>
        </motion.section>

        {/* Admin Section - Only for Authorized Roles */}
        {profile.isAdmin && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.05 }} 
            style={{ marginBottom: 40 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ padding: "6px 12px", background: "#323338", color: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Admin Console
              </div>
            </div>
            
            <div className="app-grid">
              <div 
                className="app-item"
                onClick={() => router.push("/admin/attendance")}
              >
                 <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #e44258 0%, #ff6b81 100%)" }}>
                    <Calendar size={22} />
                 </div>
                 <span className="app-label">Kehadiran</span>
              </div>

              <div 
                className="app-item"
                onClick={() => router.push("/admin/security")}
              >
                 <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #00c875 0%, #00e68a 100%)" }}>
                    <Shield size={22} />
                 </div>
                 <span className="app-label">Keamanan</span>
              </div>

              <div 
                className="app-item"
                onClick={() => router.push("/admin/users")}
              >
                 <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #fdab3d 0%, #ffc107 100%)" }}>
                    <Users size={22} />
                 </div>
                 <span className="app-label">Kelola User</span>
              </div>

              <div 
                className="app-item"
                onClick={() => {
                  const pid = profile.projects[0]?.id || "empty";
                  router.push(`/w/${pid}/dashboard/customers`);
                }}
              >
                 <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #a25ddc 0%, #c084fc 100%)" }}>
                    <Briefcase size={22} />
                 </div>
                 <span className="app-label">Proyek</span>
              </div>

              <div 
                className="app-item"
                onClick={() => router.push("/admin/settings")}
              >
                 <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #676879 0%, #323338 100%)" }}>
                    <Settings size={22} />
                 </div>
                 <span className="app-label">Pengaturan</span>
              </div>

              <div 
                className="app-item"
                onClick={() => router.push("/admin/unit-database")}
              >
                 <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #0073ea 0%, #66ccff 100%)" }}>
                    <Package size={22} />
                 </div>
                 <span className="app-label">Unit Database</span>
              </div>



              <div 
                className="app-item"
                onClick={() => router.push("/admin/quotation")}
              >
                 <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #5a189a 0%, #7b2cbf 100%)" }}>
                    <BookOpen size={22} />
                 </div>
                 <span className="app-label">Quotation</span>
              </div>
            </div>
          </motion.section>
        )}

        {/* Self Service Section - For Everyone */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.08 }} 
          style={{ marginBottom: 40 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ padding: "6px 12px", background: "#0073ea", color: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              EPL FEATURE
            </div>
          </div>
          
          <div className="app-grid-self">
            {profile.attendanceEnabled && (
              <div 
                className="app-item"
                onClick={() => router.push("/home/attendance")}
              >
                 <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #00c875 0%, #00e68a 100%)" }}>
                    <Calendar size={22} />
                 </div>
                 <span className="app-label">Absensi</span>
              </div>
            )}

            <div 
              className="app-item"
              onClick={() => window.open("/admin/database", "_blank")}
            >
               <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #0073ea 0%, #00a1e4 100%)" }}>
                  <Database size={22} />
               </div>
               <span className="app-label">Database</span>
            </div>

            <div 
              className="app-item"
              onClick={() => window.open("/tools", "_blank")}
            >
               <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #fdab3d 0%, #ffc107 100%)" }}>
                  <Wrench size={22} />
               </div>
               <span className="app-label">Tools</span>
            </div>

            {profile.isAdmin && (
              <div 
                className="app-item"
                onClick={() => router.push("/home/knowledge")}
              >
                 <div className="app-icon-container" style={{ background: "linear-gradient(135deg, #0073ea 0%, #579bfc 100%)" }}>
                    <BookOpen size={22} />
                 </div>
                 <span className="app-label">Pusat Ilmu</span>
              </div>
            )}
          </div>
        </motion.section>

        {/* Projects Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#323338", margin: 0 }}>
              Project Anda <span style={{ color: "#676879", fontWeight: 400, fontSize: 14 }}>({filtered.length})</span>
            </h2>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#c3c6d4" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari project..." style={{ padding: "8px 12px 8px 34px", border: "1px solid #e6e9ef", borderRadius: 8, fontSize: 13, outline: "none", width: 220, background: "#f7f8fa" }} />
              </div>
              {profile.isAdmin && (
                <button
                  onClick={handleOpenCreateProject}
                  style={{
                    background: "#0073ea",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  + Tambah Project Baru
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#c3c6d4", background: "#f7f8fa", borderRadius: 12 }}>
              <LayoutDashboard size={40} style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14 }}>Belum ada project yang ditugaskan</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => openProjectModal(p)}
                  style={{ background: "#fff", border: "1px solid #e6e9ef", borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#0073ea"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,115,234,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e6e9ef"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: PROJECT_COLORS[i % PROJECT_COLORS.length] }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: PROJECT_COLORS[i % PROJECT_COLORS.length] + "18", display: "flex", alignItems: "center", justifyContent: "center", color: PROJECT_COLORS[i % PROJECT_COLORS.length], fontWeight: 700, fontSize: 16 }}>
                      {p.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#323338", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</h3>
                      <p style={{ fontSize: 12, color: "#676879", margin: 0 }}>{p.customer}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: "#676879", fontWeight: 500 }}>{p.unitCount} Unit</span>
                    <button 
                      onClick={(e) => navigateProject(p, e)}
                      style={{ 
                        background: "#0073ea", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "20px", 
                        padding: "6px 14px", 
                        fontSize: 12, 
                        fontWeight: 700, 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 4,
                        transition: "all 0.2s",
                        boxShadow: "0 4px 12px rgba(0,115,234,0.2)"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#005bb5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#0073ea"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      Masuk <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Activity Timeline */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#323338", marginBottom: 16 }}>Aktivitas Terakhir</h2>
          {recentActivity.length === 0 ? (
            <p style={{ fontSize: 13, color: "#c3c6d4", textAlign: "center", padding: 32, background: "#f7f8fa", borderRadius: 12 }}>Belum ada aktivitas tercatat</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {recentActivity.map((a, i) => (
                <div key={a.id}
                  onClick={() => a.link && router.push(a.link)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, cursor: a.link ? "pointer" : "default", transition: "background 0.15s", borderBottom: i < recentActivity.length - 1 ? "1px solid #f0f1f3" : "none" }}
                  onMouseEnter={e => { if (a.link) (e.currentTarget as HTMLElement).style.background = "#f7f8fa"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0f3ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#0073ea", flexShrink: 0 }}>
                    {ICON_MAP[a.icon] || <Activity size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "#323338", margin: 0, fontWeight: 500 }}>{a.description}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: "#c3c6d4", whiteSpace: "nowrap" }}>
                      <RelativeTime date={a.createdAt} />
                    </span>
                    {a.link && <ExternalLink size={12} color="#c3c6d4" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </main>

      {/* Project Info Modal */}
      <AnimatePresence>
        {projectModalOpen && selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProjectModalOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 500, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                   <h3 style={{ fontSize: 20, fontWeight: 800, color: "#323338", margin: 0 }}>Informasi Project</h3>
                   <p style={{ fontSize: 12, color: "#676879", margin: 0 }}>{selectedProject.name}</p>
                </div>
                <button onClick={() => setProjectModalOpen(false)} style={{ background: "#f4f5f7", border: "none", cursor: "pointer", color: "#676879", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>Sales Planner</label>
                  <input 
                    defaultValue={selectedProject.salesPlanner} 
                    placeholder="Nama Sales Planner" 
                    style={{ ...inputStyle, background: !profile.isAdmin ? "#f8fafc" : "#fff", cursor: !profile.isAdmin ? "not-allowed" : "text" }} 
                    readOnly={!profile.isAdmin}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Sales Engineer</label>
                  <input 
                    defaultValue={selectedProject.salesEngineer} 
                    placeholder="Nama Sales Engineer" 
                    style={{ ...inputStyle, background: !profile.isAdmin ? "#f8fafc" : "#fff", cursor: !profile.isAdmin ? "not-allowed" : "text" }} 
                    readOnly={!profile.isAdmin}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Engineer</label>
                  <input 
                    defaultValue={selectedProject.engineer} 
                    placeholder="Nama Engineer" 
                    style={{ ...inputStyle, background: !profile.isAdmin ? "#f8fafc" : "#fff", cursor: !profile.isAdmin ? "not-allowed" : "text" }} 
                    readOnly={!profile.isAdmin}
                  />
                </div>
                <div>
                  <label style={labelStyle}>PIC / Customer</label>
                  <input 
                    defaultValue={selectedProject.pic} 
                    placeholder="Nama PIC" 
                    style={{ ...inputStyle, background: !profile.isAdmin ? "#f8fafc" : "#fff", cursor: !profile.isAdmin ? "not-allowed" : "text" }} 
                    readOnly={!profile.isAdmin}
                  />
                </div>
              </div>

              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 24, border: "1px solid #e2e8f0" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Detail Teknis</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", background: "#e2e8f0", borderRadius: 6, color: "#475569", fontWeight: 700 }}>{selectedProject.unitCount} Units</span>
                 </div>
                 <div style={{ display: "flex", gap: 24 }}>
                    <div>
                       <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px 0" }}>Customer</p>
                       <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>{selectedProject.customer}</p>
                    </div>
                    <div>
                       <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px 0" }}>Status</p>
                       <p style={{ fontSize: 13, fontWeight: 600, color: "#0073ea", margin: 0 }}>{selectedProject.status}</p>
                    </div>
                 </div>
              </div>

              {profile.isAdmin ? (
                <button onClick={() => setProjectModalOpen(false)} style={{ ...btnPrimary, width: "100%", justifyContent: "center", borderRadius: 12, padding: "14px" }}>
                  <Check size={18} /> Simpan Perubahan
                </button>
              ) : (
                <button onClick={() => setProjectModalOpen(false)} style={{ ...btnOutline, width: "100%", justifyContent: "center", borderRadius: 12, padding: "14px" }}>
                  Tutup Informasi
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#323338", margin: 0 }}>Edit Profil</h3>
                <button onClick={() => setEditOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#676879" }}><X size={20} /></button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Nama</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Nomor HP</label>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+62..." style={inputStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Email</label>
                <input value={profile.email} disabled style={{ ...inputStyle, background: "#f7f8fa", color: "#c3c6d4", cursor: "not-allowed" }} />
                <p style={{ fontSize: 11, color: "#c3c6d4", marginTop: 4 }}>Email hanya dapat diubah oleh Admin</p>
              </div>
              <button onClick={handleSaveProfile} disabled={saving} style={{ ...btnPrimary, width: "100%", justifyContent: "center" }}>
                {saving ? "Menyimpan..." : <><Check size={16} /> Simpan</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Tambah Project Baru */}
      <AnimatePresence>
        {createProjectOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreateProjectOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 500, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#323338", margin: 0 }}>Tambah Project Baru</h3>
                <button onClick={() => setCreateProjectOpen(false)} style={{ background: "#f4f5f7", border: "none", cursor: "pointer", color: "#676879", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
              </div>
              <form onSubmit={handleCreateProjectSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#323338", marginBottom: 6 }}>Nama Project</label>
                  <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required placeholder="Masukkan nama project..." style={{ width: "100%", padding: "10px 14px", border: "1px solid #e6e9ef", borderRadius: 8, fontSize: 14, outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#323338", marginBottom: 6 }}>Customer</label>
                  <select value={newProjectCustomer} onChange={e => setNewProjectCustomer(e.target.value)} required style={{ width: "100%", padding: "10px 14px", border: "1px solid #e6e9ef", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
                    <option value="" disabled>-- Pilih Customer --</option>
                    {customersList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={creatingProject} style={{ marginTop: 8, background: "#0073ea", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700, cursor: creatingProject ? "not-allowed" : "pointer", opacity: creatingProject ? 0.7 : 1 }}>
                  {creatingProject ? "Menyimpan..." : "Simpan Project"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .app-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          width: 100%;
        }
        
        @media (min-width: 640px) {
          .app-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 20px;
          }
        }
        
        .app-grid-self {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;
        }
        
        @media (min-width: 640px) {
          .app-grid-self {
            gap: 20px;
          }
        }
        
        .app-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          background: #ffffff;
          border: 1px solid #e6e9ef;
          border-radius: 16px;
          padding: 16px 8px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          user-select: none;
          flex: 1;
          min-width: 80px;
        }

        .app-grid .app-item {
          flex: none;
        }
        
        .app-grid-self .app-item {
          flex: 0 0 calc(33.333% - 8px);
          max-width: calc(33.333% - 8px);
        }

        @media (min-width: 480px) {
          .app-grid-self .app-item {
            flex: 0 0 110px;
            max-width: 110px;
          }
        }

        .app-item:hover {
          border-color: #0073ea;
          box-shadow: 0 10px 15px -3px rgba(0, 73, 234, 0.08), 0 4px 6px -2px rgba(0, 73, 234, 0.04);
          transform: translateY(-2px);
        }
        
        .app-item:active {
          transform: translateY(0) scale(0.97);
        }
        
        .app-icon-container {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-bottom: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .app-item:hover .app-icon-container {
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }
        
        .app-label {
          font-size: 11px;
          font-weight: 600;
          color: #323338;
          line-height: 1.3;
          max-width: 90px;
          word-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        @media (min-width: 640px) {
          .app-icon-container {
            width: 52px;
            height: 52px;
            border-radius: 14px;
          }
          .app-label {
            font-size: 12px;
            font-weight: 600;
          }
        }

        /* Responsive spacing for top components */
        @media (max-width: 640px) {
          header {
            padding: 12px 16px !important;
          }
          main {
            padding: 20px 16px 48px !important;
          }
        }
      `}</style>
    </div>
  );
}

const btnGhost: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#676879", padding: "6px 12px", borderRadius: 8, fontWeight: 500, transition: "background 0.15s" };
const btnOutline: React.CSSProperties = { background: "#fff", border: "1px solid #e6e9ef", borderRadius: 8, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#323338", transition: "all 0.15s" };
const btnPrimary: React.CSSProperties = { background: "#0073ea", border: "none", borderRadius: 8, padding: "10px 20px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#323338", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid #e6e9ef", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" };

const adminCardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e6e9ef", borderRadius: 12, padding: "16px 20px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" };
const adminCardTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: "#323338", margin: 0 };
const adminIconBox: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", flexShrink: 0 };
