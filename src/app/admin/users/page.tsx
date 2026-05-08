"use client";

import { useEffect, useState, useTransition } from "react";
import { 
  Users, Search, ShieldCheck, Mail, ShieldAlert, 
  Trash2, ChevronRight, CheckCircle2, XCircle, X,
  UserCog, Filter, MoreVertical, Shield, Building2, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAllUsers, toggleUserStatus, updateUserRole, 
  deleteUser, getAllRoles, getAllAvailableProjects,
  getUserProjectAccess, updateUserProjectAccess, toggleUserAttendance
} from "@/app/actions/users";
import { useRouter } from "next/navigation";
import { getSession } from "@/app/actions/auth";

export default function UsersPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isPending, startTransition] = useTransition();

  // Selection for Modals
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [userRes, roleRes, projectRes] = await Promise.all([
      getAllUsers(),
      getAllRoles(),
      getAllAvailableProjects()
    ]);
    
    if (userRes && "success" in userRes && userRes.success) setUsers(userRes.data);
    if (roleRes && "success" in roleRes && roleRes.success) setRoles(roleRes.data);
    if (projectRes && "success" in projectRes && projectRes.success) setProjects(projectRes.data);
    setLoading(false);
  };

  useEffect(() => {
    const checkAccess = async () => {
      const s = await getSession();
      const userRoles = (s?.roles as string[] || []).map(r => r.toLowerCase());
      const isAdmin = userRoles.some(r => r.includes("admin") || r.includes("administrator"));
      
      if (!s || !isAdmin) {
        router.push("/home");
        return;
      }
      setSession(s);
      fetchData();
    };
    checkAccess();
  }, [router]);

  const handleToggleStatus = (user: any) => {
    const verb = user.is_active ? "Deactivate" : "Activate";
    if (!confirm(`Are you sure you want to ${verb} ${user.name}'s account?`)) return;

    startTransition(async () => {
      const res = await toggleUserStatus(user.id, user.is_active);
      if ("success" in res && res.success) {
        fetchData();
      } else if (res && "error" in res && res.error === "EXTERNAL_USER_NO_PROJECT") {
        alert("CRITICAL: This external user has no assigned projects. You MUST assign at least one project before activating this account.");
        setSelectedUser(user);
        handleOpenProjectModal(user.id);
      } else {
        alert((res as any).error);
      }
    });
  };

  const handleOpenProjectModal = async (userId: number) => {
    startTransition(async () => {
      const res = await getUserProjectAccess(userId);
      if ("success" in res && res.success) {
        setSelectedProjects(res.data.map((id: any) => id.toString()));
        setIsProjectModalOpen(true);
      }
    });
  };

  const handleProjectUpdate = async () => {
    if (!selectedUser) return;
    startTransition(async () => {
      const res = await updateUserProjectAccess(selectedUser.id, selectedProjects);
      if ("success" in res && res.success) {
        setIsProjectModalOpen(false);
        fetchData();
      } else {
        alert((res as any).error);
      }
    });
  };

  const handleDeleteUser = (user: any) => {
    if (!confirm(`CAUTION: Permanently delete ${user.name}? This cannot be undone.`)) return;

    startTransition(async () => {
      const res = await deleteUser(user.id);
      if ("success" in res && res.success) fetchData();
    });
  };

  const handleToggleAttendance = (user: any) => {
    const verb = user.attendance_enabled ? "Disable" : "Enable";
    if (!confirm(`Are you sure you want to ${verb} Live Attendance for ${user.name}?`)) return;

    startTransition(async () => {
      const res = await toggleUserAttendance(user.id, user.attendance_enabled);
      if ("success" in res && res.success) {
        fetchData();
      } else {
        alert((res as any).error);
      }
    });
  };

  const handleRoleUpdate = async (roleId: number) => {
    if (!selectedUser) return;
    
    startTransition(async () => {
      const res = await updateUserRole(selectedUser.id, roleId);
      if ("success" in res && res.success) {
        setIsRoleModalOpen(false);
        setSelectedUser(null);
        fetchData();
      }
    });
  };

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && u.is_active) || 
                         (statusFilter === 'inactive' && !u.is_active);
    return matchesSearch && matchesStatus;
  });

  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:p-20">
      <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-slate-100">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#003366] border border-[#004488] text-[10px] font-black uppercase tracking-widest text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Identity & Access Management</span>
            </div>
            <h1 className="text-5xl font-black text-[#003366] tracking-tight">
              User <span className="text-[#00a1e4]">Management</span>
            </h1>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.3em] italic">
              Control platform access, verify registrations, and assign security clearance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 lg:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-600" />
              <input 
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all placeholder:text-slate-400 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm cursor-pointer"
            >
              <option value="all">Display All</option>
              <option value="active">Active Only</option>
              <option value="inactive">Pending/Disabled</option>
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse isolate min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-10 py-6">User Identity</th>
                  <th className="px-10 py-6">Security Role</th>
                  <th className="px-10 py-6">Project Access</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-10 py-32 text-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
                          <div className="w-12 h-12 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin"></div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Records...</p>
                        </motion.div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-10 py-32 text-center">
                        <div className="bg-slate-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 border border-slate-100">
                          <Users size={40} />
                        </div>
                        <p className="text-xl font-black text-[#003366] tracking-tight">No Personnel Records Found</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">Adjust filters or verify user identity.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user: any, index: number) => {
                      const isExternal = user.roles.some((r: string) => ["customer", "vendor", "ste", "caps"].includes(r.toLowerCase()));
                      const needsProject = isExternal && user.projectCount === 0;

                      return (
                        <motion.tr 
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="group hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-10 py-6">
                              <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-[#003366] to-[#00a1e4] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/10 shrink-0">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-black text-[#003366] tracking-tight truncate">{user.name}</p>
                                    <div className="flex flex-col gap-1 mt-1.5">
                                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                        <Mail size={12} className="shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                      </div>
                                      {user.company_name && (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-[#00a1e4] uppercase tracking-wider">
                                          <Building2 size={12} className="shrink-0" />
                                          <span className="truncate">{user.company_name}</span>
                                        </div>
                                      )}
                                    </div>
                                </div>
                              </div>
                          </td>

                          <td className="px-10 py-6">
                              <div className="flex flex-wrap gap-2">
                              {user.roles.map((role: string, rid: number) => {
                                  const rl = role.toLowerCase();
                                  const badgeClass = rl.includes('admin') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                      rl === 'engineer' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                      rl === 'sales engineer' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                                      rl === 'management' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                      rl === 'vendor' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                      rl === 'ste' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                                      rl === 'caps' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                                      rl === 'customer' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                      'bg-slate-50 text-slate-600 border-slate-100';
                                  return (
                                  <span key={rid} className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${badgeClass}`}>
                                  <Shield size={10} />
                                  {role}
                                  </span>
                                  );
                              })}
                              </div>
                          </td>

                          <td className="px-10 py-6">
                              <div className="flex items-center gap-3">
                                  <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 ${
                                      user.projectCount > 0 ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-300 border-slate-100"
                                  }`}>
                                      <Building2 size={14} />
                                      {user.projectCount} Projects
                                  </div>
                                  <button 
                                      onClick={() => { setSelectedUser(user); handleOpenProjectModal(user.id); }}
                                      className="p-2 text-slate-300 hover:text-[#00a1e4] hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                  >
                                      <ChevronRight size={18} />
                                  </button>
                              </div>
                          </td>

                          <td className="px-10 py-6">
                              <span className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-[1.25rem] border ${
                              user.is_active 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                  : needsProject ? 'bg-amber-50 text-amber-600 border-amber-200 border-dashed animate-pulse' : 'bg-slate-50 text-slate-300 border-slate-100'
                              }`}>
                              {user.is_active ? <CheckCircle2 size={14} /> : needsProject ? <ShieldAlert size={14} /> : <XCircle size={14} />}
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                  {user.is_active ? "Active Clearance" : needsProject ? "Setup required" : "Inactive"}
                              </span>
                              </span>
                              {user.attendance_enabled && (
                                  <div className="mt-3 flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-blue-500 border border-blue-100 rounded-lg w-fit">
                                      <Calendar size={12} />
                                      <span className="text-[9px] font-black uppercase tracking-tight">Live Attendance</span>
                                  </div>
                              )}
                          </td>

                          <td className="px-10 py-6 text-right">
                              <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              
                              <button 
                                  onClick={() => { setSelectedUser(user); setIsRoleModalOpen(true); }}
                                  className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm"
                                  title="Assign Role"
                              >
                                  <UserCog size={18} />
                              </button>

                              <button 
                                  onClick={() => handleToggleStatus(user)}
                                  className={`p-3 bg-white border rounded-2xl transition-all shadow-sm ${
                                  user.is_active 
                                      ? "border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50" 
                                      : needsProject 
                                          ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                          : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                  }`}
                                  title={user.is_active ? "Suspend Account" : "Approve Account"}
                              >
                                {user.is_active ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                              </button>

                              <button 
                                  onClick={() => handleToggleAttendance(user)}
                                  className={`p-3 bg-white border rounded-2xl transition-all shadow-sm ${
                                    user.attendance_enabled 
                                      ? "border-blue-100 text-[#00a1e4] hover:bg-blue-50" 
                                      : "border-slate-100 text-slate-400 hover:text-[#00a1e4] hover:border-blue-100 hover:bg-blue-50"
                                  }`}
                                  title={user.attendance_enabled ? "Disable Attendance" : "Enable Attendance"}
                              >
                                  <Calendar size={18} />
                              </button>

                              <div className="w-[1px] h-8 bg-slate-100 mx-1" />

                              <button 
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 rounded-2xl transition-all shadow-sm"
                                  title="Delete Permanently"
                              >
                                  <Trash2 size={18} />
                              </button>
                              </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center justify-center gap-3">
               <ShieldCheck size={14} /> IMMUTABLE AUDIT TRAIL • IDENTITY PROTOCOL V2.0 ENFORCED
             </p>
          </div>
        </div>

        {/* Role Assignment Modal */}
        <AnimatePresence>
          {isRoleModalOpen && (() => {
            const ROLE_META: Record<string, { category: "internal" | "external"; desc: string; color: string; bg: string; border: string }> = {
              admin:           { category: "internal", desc: "Full system control",           color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200" },
              engineer:        { category: "internal", desc: "Technical field operations",     color: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-200" },
              "sales engineer":{ category: "internal", desc: "Technical sales \u0026 advisory",   color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200" },
              management:      { category: "internal", desc: "System monitoring \u0026 strategy", color: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-200" },
              customer:        { category: "external", desc: "External asset monitoring",     color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
              vendor:          { category: "external", desc: "Third-party service provider",   color: "text-amber-600",   bg: "bg-amber-50",  border: "border-amber-200" },
              ste:             { category: "external", desc: "Site Technical Specialist",      color: "text-teal-600",    bg: "bg-teal-50",    border: "border-teal-200" },
              caps:            { category: "external", desc: "Commissioning Specialist",      color: "text-cyan-600",    bg: "bg-cyan-50",    border: "border-cyan-200" },
            };
            const getMeta = (name: string) => ROLE_META[name.toLowerCase()] || { category: "external" as const, desc: "Custom configuration", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
            const internalRoles = roles.filter((r: any) => getMeta(r.role_name).category === "internal");
            const externalRoles = roles.filter((r: any) => getMeta(r.role_name).category === "external");

            const currentUserRoles = selectedUser?.roles?.map((r: string) => r.toLowerCase()) || [];

            return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#003366]/60 backdrop-blur-md"
                onClick={() => setIsRoleModalOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="p-10 border-b border-slate-100 flex items-center gap-6 bg-slate-50/50 shrink-0">
                  <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-[1.5rem] flex items-center justify-center border border-indigo-200 shrink-0 shadow-lg shadow-indigo-600/10">
                    <UserCog size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-black text-[#003366] tracking-tight">Security Clearance</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 italic">Modify system permission levels</p>
                  </div>
                  <button onClick={() => setIsRoleModalOpen(false)} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 shrink-0 shadow-sm">
                    <X size={20} />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar-sidebar">
                  {/* User Profile Summary */}
                  <div className="p-6 bg-[#003366] rounded-[2rem] border border-[#004488] flex items-center gap-5 shadow-xl shadow-blue-900/20">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-white text-[#003366] flex items-center justify-center font-black text-2xl shrink-0">
                      {selectedUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-black text-white tracking-tight">{selectedUser?.name}</p>
                      <p className="text-xs font-bold text-blue-300 tracking-wide mt-0.5">{selectedUser?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Internal Group */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 ml-2">
                        <Shield size={14} className="text-indigo-400" />
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Internal Staff</label>
                      </div>
                      <div className="space-y-3">
                        {internalRoles.map((role: any) => {
                          const meta = getMeta(role.role_name);
                          const isActive = currentUserRoles.includes(role.role_name.toLowerCase());
                          return (
                            <button
                              key={role.id}
                              onClick={() => handleRoleUpdate(role.id)}
                              disabled={isPending}
                              className={`relative w-full flex flex-col items-start p-5 rounded-[1.5rem] border-2 transition-all text-left group ${
                                isActive 
                                  ? `${meta.bg} ${meta.border} ring-4 ring-indigo-50` 
                                  : `bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50`
                              } disabled:opacity-50`}
                            >
                              {isActive && (
                                <div className="absolute top-4 right-4">
                                  <CheckCircle2 size={16} className={meta.color} />
                                </div>
                              )}
                              <p className={`text-sm font-black ${isActive ? meta.color : 'text-slate-800'} tracking-tight`}>{role.role_name}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-relaxed">{meta.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* External Group */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 ml-2">
                        <Building2 size={14} className="text-amber-400" />
                        <label className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">External Partners</label>
                      </div>
                      <div className="space-y-3">
                        {externalRoles.map((role: any) => {
                          const meta = getMeta(role.role_name);
                          const isActive = currentUserRoles.includes(role.role_name.toLowerCase());
                          return (
                            <button
                              key={role.id}
                              onClick={() => handleRoleUpdate(role.id)}
                              disabled={isPending}
                              className={`relative w-full flex flex-col items-start p-5 rounded-[1.5rem] border-2 transition-all text-left group ${
                                isActive 
                                  ? `${meta.bg} ${meta.border} ring-4 ring-amber-50` 
                                  : `bg-white border-slate-100 hover:border-amber-200 hover:bg-amber-50/50`
                              } disabled:opacity-50`}
                            >
                              {isActive && (
                                <div className="absolute top-4 right-4">
                                  <CheckCircle2 size={16} className={meta.color} />
                                </div>
                              )}
                              <p className={`text-sm font-black ${isActive ? meta.color : 'text-slate-800'} tracking-tight`}>{role.role_name}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-relaxed">{meta.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                  <button 
                    onClick={() => setIsRoleModalOpen(false)}
                    className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </div>
            );
          })()}
        </AnimatePresence>

        {/* Project Access Modal */}
        <AnimatePresence>
          {isProjectModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#003366]/60 backdrop-blur-md"
                onClick={() => setIsProjectModalOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl relative z-10 w-full max-w-xl overflow-hidden"
              >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-[1.5rem] flex items-center justify-center border border-blue-200 shadow-lg shadow-blue-600/10">
                      <Building2 size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#003366] tracking-tight">Project Assignment</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 italic">Define workspace visibility</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 max-h-[500px] overflow-y-auto custom-scrollbar-sidebar space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-6">Select workspaces this personnel can monitor:</p>
                  {projects.map((project: any) => {
                    const isSelected = selectedProjects.includes(project.id.toString());
                    return (
                      <button
                        key={project.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedProjects(selectedProjects.filter(id => id !== project.id.toString()));
                          } else {
                            setSelectedProjects([...selectedProjects, project.id.toString()]);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-5 rounded-[1.75rem] border-2 transition-all group ${
                          isSelected ? "bg-blue-50 border-[#00a1e4] shadow-xl shadow-blue-500/10" : "bg-white border-slate-100 hover:border-blue-100 hover:bg-blue-50/30"
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-10 h-10 rounded-[0.75rem] flex items-center justify-center transition-colors ${isSelected ? "bg-[#00a1e4] text-white shadow-lg shadow-blue-500/30" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                            <Building2 size={20} />
                          </div>
                          <div className="text-left">
                            <p className={`text-base font-black tracking-tight ${isSelected ? "text-[#003366]" : "text-slate-700"}`}>{project.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{project.code || "SECURE WORKSPACE"}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={22} className="text-[#00a1e4]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-6">
                  <button 
                    onClick={() => setIsProjectModalOpen(false)}
                    className="flex-1 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-200 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={handleProjectUpdate}
                    disabled={isPending}
                    className="flex-[1.5] px-10 py-4 bg-[#00a1e4] hover:bg-[#003366] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-50"
                  >
                    {isPending ? "Updating System..." : "Apply Access Settings"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
