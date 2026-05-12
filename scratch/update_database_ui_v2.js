const fs = require('fs');
const path = 'src/app/admin/database/DatabaseClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add imports
if (!content.includes('import { getAllUsers }')) {
    content = content.replace('import { getResources, createResource, deleteResource, updateResource } from "@/app/actions/database";', 
                             'import { getResources, createResource, deleteResource, updateResource } from "@/app/actions/database";\nimport { getAllUsers } from "@/app/actions/users";');
}

// Update formData state
content = content.replace(/visibility: "Internal", project_id: ""/g, 'visibility: "Internal", allowed_users: "", project_id: ""');

// Add user states
content = content.replace('const [formData, setFormData] = useState({', 'const [allUsers, setAllUsers] = useState<any[]>([]);\n  const [userSearch, setUserSearch] = useState("");\n  const [formData, setFormData] = useState({');

// Update fetchData
content = content.replace('const [resData, sessData, projData] = await Promise.all([', 'const [resData, sessData, projData, usersData] = await Promise.all([');
content = content.replace('getAllProjects()', 'getAllProjects(),\n      getAllUsers()');
content = content.replace('if (projData.success) setProjects(projData.data);', 'if (projData.success) setProjects(projData.data);\n    if (usersData?.success) setAllUsers(usersData.data);');

// Update handleOpenEdit
content = content.replace('visibility: res.visibility,', 'visibility: res.visibility,\n      allowed_users: res.allowed_users || "",');

// Update handleCreate reset
content = content.replace('visibility: "Internal", project_id: ""', 'visibility: "Internal", allowed_users: "", project_id: ""');

// Text replacements in the modal
content = content.replace(/{editId \? "Edit Resource" : "Add New Resource"}/g, '{editId ? "Edit Database" : "Add New Database"}');
content = content.replace(/Asset Title/g, 'Data Name');
content = content.replace(/Visibility Scope/g, 'Visibility');

// Add the user access UI in the modal
const userAccessUI = `
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
                                 {u?.name || \`ID: \${uid}\`}
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
`;

// Insert the UI before the Tags field or similar
content = content.replace('<div className="grid grid-cols-2 gap-6">', userAccessUI + '\n                   <div className="grid grid-cols-2 gap-6">');

fs.writeFileSync(path, content);
console.log('Successfully updated DatabaseClient.tsx UI');
