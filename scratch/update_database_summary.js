const fs = require('fs');
const path = 'src/app/admin/database/DatabaseClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Summary Component
const accessSummaryUI = `
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
                                     <span className="text-emerald-600">All members assigned to "{projects.find(p => p.id.toString() === formData.project_id)?.name}"</span>
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
`;

// Insert the summary before the Save/Cancel buttons
content = content.replace('<div className="pt-8 flex justify-end gap-4">', accessSummaryUI + '\n                   <div className="pt-8 flex justify-end gap-4">');

fs.writeFileSync(path, content);
console.log('Successfully updated DatabaseClient.tsx with access summary');
