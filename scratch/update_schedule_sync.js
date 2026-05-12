const fs = require('fs');
const path = 'src/app/admin/schedule/ScheduleClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add imports
if (!content.includes('import { getAllUsers }')) {
    content = content.replace('import { saveVesSchedule, getVesSchedule } from "@/app/actions/ves_schedule";', 
                             'import { saveVesSchedule, getVesSchedule } from "@/app/actions/ves_schedule";\nimport { getAllUsers } from "@/app/actions/users";\nimport { Search } from "lucide-react";');
}

// Add states
content = content.replace('const [isExportOptionsOpen, setIsExportOptionsOpen] = useState(false);', 
                         'const [isExportOptionsOpen, setIsExportOptionsOpen] = useState(false);\n  const [userSearch, setUserSearch] = useState("");\n  const [availableUsers, setAvailableUsers] = useState<any[]>([]);');

// Update useEffect to load users
content = content.replace('const rosterRes = await getVesSchedule("4", viewDate.getFullYear(), viewDate.getMonth());', 
                         'const [rosterRes, usersRes] = await Promise.all([\n        getVesSchedule("4", viewDate.getFullYear(), viewDate.getMonth()),\n        getAllUsers()\n      ]);');
content = content.replace('if (rosterRes.success && rosterRes.data) {', 
                         'if (usersRes.success) setAvailableUsers(usersRes.data);\n      if (rosterRes.success && rosterRes.data) {');

// Update the Add Personnel UI
const searchUI = `
                             <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                   <button 
                                    onClick={() => setPeople([...people, { id: Date.now().toString(), name: "New RE", role: "Resident Engineer" }])}
                                    className="flex items-center gap-2 text-[#003366] font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-all"
                                   >
                                      <Plus className="w-3 h-3" /> Manual RE
                                   </button>
                                   <button 
                                    onClick={() => setPeople([...people, { id: Date.now().toString(), name: "New STE", role: "STE" }])}
                                    className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest hover:bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl transition-all"
                                   >
                                      <Plus className="w-3 h-3" /> Manual STE
                                   </button>
                                </div>
                                <div className="relative">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                   <input 
                                      type="text" 
                                      placeholder="Cari & Tambah dari Akun..."
                                      value={userSearch}
                                      onChange={e => setUserSearch(e.target.value)}
                                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-[#003366] transition-all"
                                   />
                                   {userSearch && (
                                      <div className="absolute bottom-full mb-2 left-0 w-64 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-[100] max-h-48 overflow-y-auto p-3 flex flex-col gap-1 border-t-4 border-t-[#003366]">
                                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">Hasil Pencarian</p>
                                         {availableUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()))
                                            .slice(0, 10)
                                            .map(u => (
                                               <button 
                                                  key={u.id}
                                                  type="button"
                                                  onClick={() => {
                                                     if (!people.find(p => p.id === u.id.toString())) {
                                                        setPeople([...people, { id: u.id.toString(), name: u.name, role: "Resident Engineer" }]);
                                                     }
                                                     setUserSearch("");
                                                  }}
                                                  className="w-full text-left p-2.5 hover:bg-blue-50 rounded-xl flex items-center justify-between group transition-all"
                                               >
                                                  <div className="flex flex-col">
                                                     <span className="text-[11px] font-bold text-slate-700">{u.name}</span>
                                                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{u.roles?.[0] || 'Member'}</span>
                                                  </div>
                                                  <Plus size={12} className="text-slate-300 group-hover:text-[#003366]" />
                                               </button>
                                            ))
                                         }
                                         {availableUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                                            <p className="p-3 text-center text-[10px] text-slate-400 font-bold italic">Akun tidak ditemukan.</p>
                                         )}
                                      </div>
                                   )}
                                </div>
                             </div>
`;

content = content.replace(/<div className="flex gap-2">[\s\S]*?<\/div>/, searchUI);

fs.writeFileSync(path, content);
console.log('Successfully updated ScheduleClient.tsx with user search');
