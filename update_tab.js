const fs = require('fs');
let code = fs.readFileSync('temp_tab.txt', 'utf8');

// Update lucide-react imports
code = code.replace(/import \{.*?\} from "lucide-react";/, 'import { Plus, CheckCircle2, AlertCircle, Clock, Settings, RefreshCw, Key, Users, Copy, Check, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";');

// Add wa-subscribers actions
code = code.replace(/import \{.*?\} from "@\/app\/actions\/outstanding";/, 'import { getOutstandingCases, addOutstandingCase, resolveOutstandingCase, getProjectWaTargets, updateProjectWaTargets } from "@/app/actions/outstanding";\nimport { getProjectWaSubscribers, generateProjectInviteCode, approveSubscriber, rejectSubscriber, revokeSubscriber } from "@/app/actions/wa-subscribers";');

// Add state for subscribers
code = code.replace(/const \[savingSettings, setSavingSettings\] = useState\(false\);/, `const [savingSettings, setSavingSettings] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);`);

// Add loadSubscribers
code = code.replace(/const loadSettings = async \(\) => \{/, `const loadSubscribers = async () => {
    setLoadingSubs(true);
    const res = await getProjectWaSubscribers(projectId);
    if (res.success && res.data) {
      setSubscribers(res.data);
      setInviteCode(res.inviteCode);
    }
    setLoadingSubs(false);
  };

  const loadSettings = async () => {`);

// Add loadSubscribers to the load hook
code = code.replace(/loadSettings\(\);/, 'loadSettings();\n      loadSubscribers();');

// Add Subscriber handlers
code = code.replace(/const handleSaveSettings = async/, `
  const handleGenerateCode = async () => {
    if (!confirm("Are you sure? Old invitation code will become invalid.")) return;
    const res = await generateProjectInviteCode(projectId);
    if (res.success) setInviteCode(res.code);
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubAction = async (id: string, action: "approve"|"reject"|"revoke") => {
    if (!confirm(\`Are you sure you want to \${action} this subscriber?\`)) return;
    let res;
    if (action === "approve") res = await approveSubscriber(id, projectId);
    else if (action === "reject") res = await rejectSubscriber(id, projectId);
    else res = await revokeSubscriber(id, projectId);
    
    if (res.success) {
      await loadSubscribers();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleSaveSettings = async`);

// Inject the UI for Subscribers and Invite Code
const uiInjection = `
            {/* INVITATION CODE */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-4">
                <Key size={14} /> WhatsApp Registration Code
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 font-mono text-lg font-bold text-center tracking-widest">
                  {inviteCode || "Not Generated"}
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={handleCopyCode} disabled={!inviteCode} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-700 disabled:opacity-50">
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={handleGenerateCode} className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50">
                    <RefreshCw size={12} /> Regenerate
                  </button>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-3 text-center">Share this code with technicians or clients so they can register via WhatsApp Bot.</p>
            </div>

            {/* SUBSCRIBERS LIST */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-4">
                <Users size={14} /> Registered Subscribers
              </h4>
              
              {loadingSubs ? (
                <div className="animate-pulse bg-slate-100 h-24 rounded-xl"></div>
              ) : subscribers.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold text-center py-6 bg-slate-50 rounded-xl">No subscribers registered yet.</p>
              ) : (
                <div className="space-y-3">
                  {subscribers.map((sub: any) => (
                    <div key={sub.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-slate-800 truncate">{sub.name}</h5>
                          {sub.status === "Approved" && sub.registered ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={10} /> Active</span>
                          ) : sub.status === "Pending" ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> Pending</span>
                          ) : !sub.registered ? (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><ShieldAlert size={10} /> Inactive</span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1 truncate">{sub.company} • {sub.phone}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {sub.status === "Pending" && (
                          <>
                            <button onClick={() => handleSubAction(sub.id, "approve")} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Approve">
                              <Check size={16} />
                            </button>
                            <button onClick={() => handleSubAction(sub.id, "reject")} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="Reject">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {sub.status === "Approved" && sub.registered && (
                          <button onClick={() => handleSubAction(sub.id, "revoke")} className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase hover:bg-rose-100">
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
`;

code = code.replace(/<div className="space-y-6">/, '<div className="space-y-6">\n' + uiInjection);

fs.writeFileSync('src/app/w/[projectId]/client/dashboard/OutstandingTab.tsx', code);
