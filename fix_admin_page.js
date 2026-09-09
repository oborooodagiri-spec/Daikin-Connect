
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/users/page.tsx", "utf8");

content = content.replace(
  `import { getAllUsers, toggleUserStatus, updateUserRole, toggleAttendance, updateUserProjects } from "@/app/actions/users";`,
  `import { getAllUsers, toggleUserStatus, updateUserRole, toggleAttendance, updateUserProjects, togglePivesScannerStatus } from "@/app/actions/users";`
);

content = content.replace(
  `  const handleToggleAttendance = async (user: any) => {`,
  `  const handleTogglePives = async (user: any) => {
    try {
      const res = await togglePivesScannerStatus(user.id, user.pives_scanner_enabled);
      if (res.success) {
        setUsers(users.map(u => u.id === user.id ? { ...u, pives_scanner_enabled: !u.pives_scanner_enabled } : u));
      } else {
        alert(res.error || "Failed to update scanner access");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleAttendance = async (user: any) => {`
);

const oldButtons = `                              <button 
                                  onClick={() => handleToggleAttendance(user)}
                                  className={\`p-3 bg-white border rounded-2xl transition-all shadow-sm \${
                                    user.attendance_enabled 
                                      ? "border-blue-100 text-blue-600 hover:text-slate-400 hover:border-slate-100 hover:bg-slate-50" 
                                      : "border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50"
                                  }\`}
                                  title={user.attendance_enabled ? "Disable Live Attendance" : "Enable Live Attendance"}
                              >
                                  <Calendar size={18} />
                              </button>
                              </div>
                          </td>`;

const newButtons = `                              <button 
                                  onClick={() => handleToggleAttendance(user)}
                                  className={\`p-3 bg-white border rounded-2xl transition-all shadow-sm \${
                                    user.attendance_enabled 
                                      ? "border-blue-100 text-blue-600 hover:text-slate-400 hover:border-slate-100 hover:bg-slate-50" 
                                      : "border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50"
                                  }\`}
                                  title={user.attendance_enabled ? "Disable Live Attendance" : "Enable Live Attendance"}
                              >
                                  <Calendar size={18} />
                              </button>
                              
                              <button 
                                  onClick={() => handleTogglePives(user)}
                                  className={\`p-3 bg-white border rounded-2xl transition-all shadow-sm \${
                                    user.pives_scanner_enabled 
                                      ? "border-emerald-100 text-emerald-600 hover:text-slate-400 hover:border-slate-100 hover:bg-slate-50" 
                                      : "border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50"
                                  }\`}
                                  title={user.pives_scanner_enabled ? "Disable PIVES Scanner" : "Enable PIVES Scanner"}
                              >
                                  <QrCode size={18} />
                              </button>
                              </div>
                          </td>`;
                          
content = content.replace(oldButtons, newButtons);
content = content.replace(
  `import { 
  Users, Search, ShieldCheck, Mail, ShieldAlert, 
  Building2, ChevronRight, XCircle, CheckCircle2, UserCog,
  Calendar, Check
} from "lucide-react";`,
  `import { 
  Users, Search, ShieldCheck, Mail, ShieldAlert, 
  Building2, ChevronRight, XCircle, CheckCircle2, UserCog,
  Calendar, Check, QrCode
} from "lucide-react";`
);

const oldBadges = `{user.attendance_enabled && (
                                  <div className="mt-3 flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-blue-500 border border-blue-100 rounded-lg w-fit">
                                      <Calendar size={12} />
                                      <span className="text-[9px] font-black uppercase tracking-tight">Live Attendance</span>
                                  </div>
                              )}`;
                              
const newBadges = `{user.attendance_enabled && (
                                  <div className="mt-3 flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-blue-500 border border-blue-100 rounded-lg w-fit">
                                      <Calendar size={12} />
                                      <span className="text-[9px] font-black uppercase tracking-tight">Live Attendance</span>
                                  </div>
                              )}
                              {user.pives_scanner_enabled && (
                                  <div className="mt-2 flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg w-fit">
                                      <QrCode size={12} />
                                      <span className="text-[9px] font-black uppercase tracking-tight">PIVES Scanner</span>
                                  </div>
                              )}`;
content = content.replace(oldBadges, newBadges);

fs.writeFileSync("src/app/admin/users/page.tsx", content);

