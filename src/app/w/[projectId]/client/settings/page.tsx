"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Globe, Check, 
  User, Shield, Bell,
  ChevronRight, ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { Language, t } from "@/lib/i18n";
import { getSession } from "@/app/actions/auth";
import FaceProfileClient from "@/components/attendance/FaceProfileClient";

export default function ClientSettingsPage() {
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("Preferences");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
    const saved = localStorage.getItem("daikin_lang") as Language;
    if (saved) setLang(saved);
  }, []);

  const fetchProfile = async () => {
    const res = await getSession();
    if (res) {
       // Since getSession might not return face_reference_url, 
       // let's fetch full user data if needed or update getSession
       setUserProfile(res);
    }
  };

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("daikin_lang", newLang);
    // Reload to apply language everywhere
    window.location.reload();
  };

  if (!mounted) return null;

  const LANGUAGES = [
    { code: "en", name: "English", native: "English" },
    { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
    { code: "ja", name: "Japanese", native: "日本語" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-[#003366] mb-3">
            <Settings className="w-3.5 h-3.5" />
            <span>Account Configuration</span>
        </div>
        <h1 className="text-4xl font-black text-[#003366] tracking-tighter">
          {t("Settings", lang)}
        </h1>
        <p className="text-slate-500 text-sm font-bold mt-2">
          Manage your interface preferences and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav (Internal to page) */}
        <div className="space-y-2">
             { label: "Preferences", icon: Settings },
             { label: "Security", icon: Shield },
             { label: "Profile Info", icon: User, disabled: true },
             { label: "Notifications", icon: Bell, disabled: true },
           ].map((item, i) => (
             <button 
               key={i}
               disabled={item.disabled}
               onClick={() => !item.disabled && setActiveTab(item.label)}
               className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                 activeTab === item.label ? "bg-[#003366] text-white shadow-xl shadow-blue-900/10" : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
               } ${item.disabled ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
             >
               <item.icon size={16} />
               {item.label}
             </button>
           ))}
        </        {/* Content */}
        <div className="md:col-span-2 space-y-6">
           <AnimatePresence mode="wait">
             {activeTab === "Preferences" && (
                <motion.div 
                  key="prefs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden p-8 sm:p-10 space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003366] border border-blue-100">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[#003366] tracking-tight">Display Language</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Choose your preferred system language</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {LANGUAGES.map((l) => (
                            <button 
                              key={l.code}
                              onClick={() => changeLanguage(l.code as Language)}
                              className={`w-full flex items-center justify-between px-6 py-5 rounded-3xl border-2 transition-all group ${
                                lang === l.code 
                                ? "border-[#003366] bg-blue-50/50" 
                                : "border-slate-50 bg-slate-50/30 hover:border-slate-200"
                              }`}
                            >
                              <div className="flex items-center gap-4 text-left">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] tracking-tighter transition-all ${
                                    lang === l.code ? "bg-[#003366] text-white" : "bg-white text-slate-400 border border-slate-100"
                                  }`}>
                                    {l.code.toUpperCase()}
                                  </div>
                                  <div>
                                    <p className={`text-sm font-black tracking-tight ${lang === l.code ? "text-[#003366]" : "text-slate-600"}`}>
                                        {l.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {l.native}
                                    </p>
                                  </div>
                              </div>
                              
                              {lang === l.code && (
                                <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center shadow-lg shadow-blue-900/20 animate-in zoom-in duration-300">
                                    <Check size={16} strokeWidth={4} />
                                </div>
                              )}
                            </button>
                        ))}
                      </div>

                      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                        <p className="text-[10px] leading-relaxed font-bold text-amber-700 uppercase tracking-widest">
                            Updating the display language will refresh the portal to apply changes across all technical reports and modules.
                        </p>
                      </div>
                  </div>
                </motion.div>
             )}

             {activeTab === "Security" && (
                <motion.div 
                  key="sec"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                   <FaceProfileClient initialFaceUrl={userProfile?.face_reference_url} />
                </motion.div>
             )}
           </AnimatePresence>
        </div>
/div>
      </div>
    </div>
  );
}
