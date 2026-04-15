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
  // ... rest of state
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
        router.push("/dashboard");
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

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-[#00a1e4] mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-4xl font-black text-[#003366] tracking-tight">
            User Management
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Manage system access, approve new registrations, and assign security roles.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-72 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-600" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Pending/Disabled</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse isolate min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User Identity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Role</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Project Access</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 border-4 border-slate-100 border-t-[#00a1e4] rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Databases...</p>
                      </motion.div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Users size={32} />
                      </div>
                      <p className="text-base font-black text-slate-800 tracking-tight">No Users Found</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 px-12">Adjust your filters or verify user existence.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user: any, index: number) => {
                    const isExternal = user.roles.some((r: string) => ["customer", "vendor", "ste", "caps"].includes(r.toLowerCase()));
                    const needsProject = isExternal && user.projectCount === 0;

                    return (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-blue-50/20 transition-colors"
                      >
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#003366] to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-900/10 shrink-0">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-[#003366] tracking-tight truncate">{user.name}</p>
                                <div className="flex flex-col gap-0.5 mt-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                    <Mail size={10} className="shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                  </div>
                                  {user.company_name && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-[#00a1e4] uppercase tracking-wider">
                                      <Building2 size={10} className="shrink-0" />
                                      <span className="truncate">{user.company_name}</span>
                                    </div>
                                  )}
                                </div>
                            </div>
                            </div>
                        </td>

                        <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-1.5">
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
                                <span key={rid} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badgeClass}`}>
                                <Shield size={10} />
                                {role}
                                </span>
                                );
                            })}
                            </div>
                        </td>

                        <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                                <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                    user.projectCount > 0 ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                }`}>
                                    <Building2 size={12} />
                                    {user.projectCount} Projects
                                </div>
                                <button 
                                    onClick={() => { setSelectedUser(user); handleOpenProjectModal(user.id); }}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </td>

                        <td className="px-8 py-6">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                            user.is_active 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : needsProject ? 'bg-amber-50 text-amber-600 border-amber-200 border-dashed animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>
                            {user.is_active ? <CheckCircle2 size={12} /> : needsProject ? <ShieldAlert size={12} /> : <XCircle size={12} />}
                            <span className="text-[9px] font-black uppercase tracking-widest">
                                {user.is_active ? "Active" : needsProject ? "Setup required" : "Inactive"}
                            </span>
                            </span>
                            {user.attendance_enabled && (
                                <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-500 border border-blue-100 rounded-md w-fit">
                                    <Calendar size={10} />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Attendance ON</span>
                                </div>
                            )}
                        </td>

                        <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                            
                            <button 
                                onClick={() => { setSelectedUser(user); setIsRoleModalOpen(true); }}
                                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"
                                title="Assign Role"
                            >
                                <UserCog size={16} />
                            </button>

                            <button 
                                onClick={() => handleToggleStatus(user)}
                                className={`p-2.5 bg-white border rounded-xl transition-all shadow-sm ${
                                user.is_active 
                                    ? "border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50" 
                                    : needsProject 
                                        ? "border-amber-300 text-amber-600 hover:bg-amber-50"
                                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                }`}
                                title={user.is_active ? "Suspend Account" : "Approve Account"}
                            >
                              {user.is_active ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                            </button>

                            <button 
                                onClick={() => handleToggleAttendance(user)}
                                className={`p-2.5 bg-white border rounded-xl transition-all shadow-sm ${
                                  user.attendance_enabled 
                                    ? "border-blue-200 text-blue-600 hover:bg-blue-50" 
                                    : "border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                                title={user.attendance_enabled ? "Disable Attendance" : "Enable Attendance"}
                            >
                                <Calendar size={16} />
                            </button>

                            <div className="w-[1px] h-6 bg-slate-100 mx-1" />

                            <button 
                                onClick={() => handleDeleteUser(user)}
                                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-400 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
                                title="Delete Permanently"
                            >
                                <Trash2 size={16} />
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
      </div>

      {/* Role Assignment Modal */}
      <AnimatePresence>
        {isRoleModalOpen && (() => {
          const ROLE_META: Record<string, { category: "internal" | "external"; desc: string; color: string; bg: string; border: string }> = {
            admin:           { category: "internal", desc: "Full system access",           color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200" },
            engineer:        { category: "internal", desc: "Field service operations",     color: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-200" },
            "sales engineer":{ category: "internal", desc: "Sales & technical advisory",   color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200" },
            management:      { category: "internal", desc: "Overview & reporting",         color: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-200" },
            customer:        { category: "external", desc: "Unit monitoring & complaints", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
            vendor:          { category: "external", desc: "External service partner",     color: "text-amber-600",   bg: "bg-amber-50",  border: "border-amber-200" },
            ste:             { category: "external", desc: "Site Technical Engineer",      color: "text-teal-600",    bg: "bg-teal-50",    border: "border-teal-200" },
            caps:            { category: "external", desc: "Commissioning & Project Svc",  color: "text-cyan-600",    bg: "bg-cyan-50",    border: "border-cyan-200" },
          };
          const getMeta = (name: string) => ROLE_META[name.toLowerCase()] || { category: "external" as const, desc: "Custom role", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
          const internalRoles = roles.filter((r: any) => getMeta(r.role_name).category === "internal");
          const externalRoles = roles.filter((r: any) => getMeta(r.role_name).category === "external");

          const currentUserRoles = selectedUser?.roles?.map((r: string) => r.toLowerCase()) || [];

          return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#003366]/40 backdrop-blur-md"
              onClick={() => setIsRoleModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50 shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center border border-indigo-200 shrink-0">
                  <UserCog size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-black text-[#003366] tracking-tight">Security Access</h3>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-0.5">Assign User Role</p>
                </div>
                <button onClick={() => setIsRoleModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600 shrink-0">
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar-sidebar">
                {/* User Info Card */}
                <div className="p-3 sm:p-4 bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-100 flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-blue-200 flex items-center justify-center font-black text-blue-600 text-sm shrink-0">
                    {selectedUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#003366] truncate">{selectedUser?.name}</p>
                    <p className="text-[11px] font-bold text-blue-400 truncate">{selectedUser?.email}</p>
                  </div>
                </div>

                {/* Internal Roles Group */}
                {internalRoles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 ml-1">
                      <Shield size={12} className="text-indigo-400" />
                      <label className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest">Internal</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {internalRoles.map((role: any) => {
                        const meta = getMeta(role.role_name);
                        const isActive = currentUserRoles.includes(role.role_name.toLowerCase());
                        return (
                          <button
                            key={role.id}
                            onClick={() => handleRoleUpdate(role.id)}
                            disabled={isPending}
                            className={`relative flex flex-col items-start p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all text-left group ${
                              isActive 
                                ? `${meta.bg} ${meta.border} ring-2 ring-offset-1 ring-indigo-300` 
                                : `bg-white border-slate-100 hover:${meta.border} hover:${meta.bg}`
                            } disabled:opacity-50`}
                          >
                            {isActive && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle2 size={14} className={meta.color} />
                              </div>
                            )}
                            <p className={`text-xs sm:text-sm font-black ${isActive ? meta.color : 'text-slate-800'} tracking-tight`}>{role.role_name}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-tight">{meta.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* External Roles Group */}
                {externalRoles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 ml-1">
                      <Building2 size={12} className="text-amber-400" />
                      <label className="text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-widest">External · Partner</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {externalRoles.map((role: any) => {
                        const meta = getMeta(role.role_name);
                        const isActive = currentUserRoles.includes(role.role_name.toLowerCase());
                        return (
                          <button
                            key={role.id}
                            onClick={() => handleRoleUpdate(role.id)}
                            disabled={isPending}
                            className={`relative flex flex-col items-start p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all text-left group ${
                              isActive 
                                ? `${meta.bg} ${meta.border} ring-2 ring-offset-1 ring-amber-300` 
                                : `bg-white border-slate-100 hover:${meta.border} hover:${meta.bg}`
                            } disabled:opacity-50`}
                          >
                            {isActive && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle2 size={14} className={meta.color} />
                              </div>
                            )}
                            <p className={`text-xs sm:text-sm font-black ${isActive ? meta.color : 'text-slate-800'} tracking-tight`}>{role.role_name}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-tight">{meta.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                <button 
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  Close
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
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#003366]/40 backdrop-blur-md"
              onClick={() => setIsProjectModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-md overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-200">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#003366] tracking-tight">Project Access</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Manage Visibility</p>
                  </div>
                </div>
              </div>

              <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar-sidebar space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 italic">Select projects this user can monitor:</p>
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
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isSelected ? "bg-blue-50 border-blue-400 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"}`}>
                          <Building2 size={16} />
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-black ${isSelected ? "text-blue-900" : "text-slate-700"}`}>{project.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{project.code || "No Code"}</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={18} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProjectUpdate}
                  disabled={isPending}
                  className="px-10 py-3 bg-[#00a1e4] hover:bg-[#0081b8] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Access"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
