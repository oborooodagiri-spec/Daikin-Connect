
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/users/page.tsx", "utf8");

const targetPoint = `<div className="w-[1px] h-8 bg-slate-100 mx-1" />`;
const newButton = `
                              <button 
                                  onClick={() => handleTogglePives(user)}
                                  className={\`p-3 bg-white border rounded-2xl transition-all shadow-sm \${
                                    user.pives_scanner_enabled 
                                      ? "border-emerald-100 text-[#00c875] hover:bg-emerald-50" 
                                      : "border-slate-100 text-slate-400 hover:text-[#00c875] hover:border-emerald-100 hover:bg-emerald-50"
                                  }\`}
                                  title={user.pives_scanner_enabled ? "Disable PIVES Scanner" : "Enable PIVES Scanner"}
                              >
                                  <QrCode size={18} />
                              </button>

                              <div className="w-[1px] h-8 bg-slate-100 mx-1" />`;

content = content.replace(targetPoint, newButton);
fs.writeFileSync("src/app/admin/users/page.tsx", content);

