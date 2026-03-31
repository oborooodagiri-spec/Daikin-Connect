"use client";

import { useEffect, useState, useTransition } from "react";
import { 
  getAllUsers, toggleUserStatus, deleteUser, getAvailableRoles, assignUserRole,
  getAvailableProjects, getUserAssignedProjects, assignUserProjects 
} from "@/app/actions/users";
import { 
  UserCheck, UserX, Trash2, Shield, Circle, MoreVertical, Search, Filter,
  CheckCircle2, Activity, UserCog, Mail, Building2, X, AlertTriangle, ArrowRight, BookOpen, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUserId, setModalUserId] = useState<string | null>(null);
  const [modalUserName, setModalUserName] = useState<string>("");
  const [assignedProjectIds, setAssignedProjectIds] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [userRes, roleRes, projRes] = await Promise.all([
      getAllUsers(),
      getAvailableRoles(),
      getAvailableProjects()
    ]);

    if (userRes.error) {
      setError(userRes.error);
    } else {
      setUsers(userRes.users || []);
      setRoles(roleRes || []);
      setProjects(projRes || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleUserStatus(userId, currentStatus);
      if (result.success) {
        fetchData();
      } else {
        // Show validation or auth error
        alert(result.error || "Failed to update user status.");
      }
    });
  };

  const handleRoleChange = (userId: string, roleId: string) => {
    if (!roleId) return;
    startTransition(async () => {
      const result = await assignUserRole(userId, roleId);
      if (result.success) {
        fetchData();
      } else {
        alert(result.error);
      }
    });
  };

  const handleDelete = (userId: string) => {
    if (!confirm("Remove this user permanently? This action cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.success) fetchData();
    });
  };

  // --- Project Modal Functions ---
  const openProjectModal = async (uId: string, uName: string) => {
    setModalUserId(uId);
    setModalUserName(uName);
    setIsModalOpen(true);
    setLoadingProjects(true);
    
    const assigned = await getUserAssignedProjects(uId);
    setAssignedProjectIds(assigned);
    setLoadingProjects(false);
  };

  const closeProjectModal = () => {
    setIsModalOpen(false);
    setModalUserId(null);
    setAssignedProjectIds([]);
  };

  const toggleProjectSelection = (pid: string) => {
    setAssignedProjectIds(prev => 
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const saveProjectAssignments = () => {
    if (!modalUserId) return;
    startTransition(async () => {
      const result = await assignUserProjects(modalUserId, assignedProjectIds);
      if (result.success) {
        closeProjectModal();
      } else {
        alert(result.error);
      }
    });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeStyle = (roleName: string) => {
    const r = roleName.toLowerCase();
    if (["super_admin", "admin", "administrator"].includes(r))
      return "bg-rose-50 text-rose-600 border-rose-200";
    if (["management", "manager"].includes(r))
      return "bg-purple-50 text-purple-600 border-purple-200";
    if (["engineer", "sales engineer", "internal"].includes(r))
      return "bg-blue-50 text-blue-600 border-blue-200";
    if (["customer", "vendor", "client"].includes(r))
      return "bg-amber-50 text-amber-600 border-amber-200";
    return "bg-slate-50 text-slate-500 border-slate-200";
  };

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
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-blue-600">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Privileges</span>
          </div>
          <h1 className="text-4xl font-black text-[#003366] tracking-tight">
            User <span className="text-[#00a1e4]">Directory</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-3 mt-4">
            Total {users.length} Active System Profiles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-72 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-600" />
            <input 
              type="text"
              placeholder="Search personnel..."
              className="w-full pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all w-full sm:w-auto flex justify-center items-center shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse isolate min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personnel / Contact</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Clearance Level</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Modifiers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
                        <div className="relative w-10 h-10">
                          <div className="absolute inset-0 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Database...</p>
                      </motion.div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center">
                      <p className="text-sm font-bold text-slate-400 mb-2">No matching profiles found.</p>
                      <p className="text-xs text-slate-400 font-medium">Try adjusting your search query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const currentRoleId = user.user_roles[0]?.role_id || "";
                    const currentRoleName = user.user_roles[0]?.role_name || "Unassigned";
                    const isExternal = ["customer", "vendor", "client"].includes(currentRoleName.toLowerCase());
                    const isProjectStaff = ["engineer", "sales engineer"].includes(currentRoleName.toLowerCase());
                    
                    return (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-[#003366] font-black text-lg border border-blue-200/50 shrink-0">
                               {user.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 tracking-tight mb-0.5">{user.name}</p>
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Mail className="w-3 h-3" />
                                <p className="text-xs font-semibold">{user.email}</p>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3 w-64">
                            <div className="relative flex-1">
                              <select
                                value={currentRoleId}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                disabled={isPending}
                                className="appearance-none w-full bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-xl pl-4 pr-8 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all cursor-pointer disabled:opacity-50 hover:bg-slate-50 shadow-sm"
                              >
                                <option value="" disabled>Modify Assignment...</option>
                                {roles.map(role => (
                                  <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                                <MoreVertical size={14} />
                              </div>
                            </div>
                            <div className={`shrink-0 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getRoleBadgeStyle(currentRoleName)}`}>
                              {currentRoleName.substring(0, 3)}
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${user.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                            {user.is_active ? 
                              <CheckCircle2 size={14} className="text-emerald-500" /> : 
                              <Activity size={14} className="text-rose-500" />
                            }
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {user.is_active ? "Active" : "Suspended"}
                            </span>
                          </div>
                        </td>

                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 isolate">
                            
                            {/* External Project Assignment Button */}
                            <AnimatePresence>
                              {(isExternal || isProjectStaff) && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  onClick={() => openProjectModal(user.id, user.name)}
                                  className="p-2 text-amber-600 border border-amber-100 bg-amber-50 hover:bg-amber-100 hover:border-amber-200 rounded-xl transition-all shadow-sm group/btn flex items-center gap-2 px-3"
                                  title="Manage Assigned Projects"
                                >
                                  <Building2 size={16} />
                                  <span className="text-[10px] font-bold uppercase tracking-wider hidden xl:block">Projects</span>
                                </motion.button>
                              )}
                            </AnimatePresence>

                            <div className="w-[1px] h-6 bg-slate-200 hidden lg:block mx-2"></div>

                            <button 
                              onClick={() => handleToggleStatus(user.id, user.is_active)}
                              disabled={isPending}
                              title={user.is_active ? "Suspend Account" : "Activate Account"}
                              className={`p-2 rounded-xl transition-all border ${
                                user.is_active 
                                  ? "text-slate-400 border-transparent hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50" 
                                  : "text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-100"
                              }`}
                            >
                              {user.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                            </button>
                            
                            <button 
                              onClick={() => handleDelete(user.id)}
                              disabled={isPending}
                              title="Permanently Delete"
                              className="p-2 text-slate-400 border border-transparent hover:border-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-1"
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
      </div>

      {/* --- Project Assignment Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={closeProjectModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-3xl shadow-2xl relative z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#003366] tracking-tight">Project Permissions</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Assigning • {modalUserName}</p>
                  </div>
                </div>
                <button onClick={closeProjectModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-white">
                {loadingProjects ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <div className="w-8 h-8 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Loading Records...</span>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-amber-400 opacity-50" />
                    <p className="text-sm font-bold">No active projects found in the database.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {projects.map(proj => {
                      const isSelected = assignedProjectIds.includes(proj.id);
                      return (
                        <div 
                          key={proj.id}
                          onClick={() => toggleProjectSelection(proj.id)}
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none
                            ${isSelected ? 'bg-amber-50/50 border-amber-400 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                          <div className={`mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors
                            ${isSelected ? 'bg-amber-500 border-amber-600' : 'bg-white border-slate-300'}`}>
                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <div>
                            <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                               {proj.name}
                            </p>
                            {proj.code && (
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{proj.code}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={closeProjectModal}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProjectAssignments}
                  disabled={isPending || loadingProjects}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPending ? "Applying..." : "Confirm Access"}
                  {!isPending && <ArrowRight size={14} />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
