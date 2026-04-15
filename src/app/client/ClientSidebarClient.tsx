"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  LogOut, 
  ChevronRight,
  Package,
  Calendar,
  FileText,
  Menu,
  X,
  Settings,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t, Language } from "@/lib/i18n";

export default function ClientSidebarClient({ 
  session, 
  logout 
}: { 
  session: any, 
  logout: () => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const isVendor = session?.roles?.some((r: any) => 
    /vendor|partner|service/i.test(typeof r === 'string' ? r : r.role_name)
  );

  const lang = (typeof window !== 'undefined' ? localStorage.getItem('daikin_lang') : 'en') as Language || 'en';

  const menuItems = [
    { 
      href: "/client/dashboard", 
      label: t("Overview", lang), 
      icon: LayoutDashboard 
    },
    { 
      href: "/client/inventory", 
      label: t("My Assets", lang), 
      icon: Package 
    },
    { 
      href: "/client/schedules", 
      label: t("Work Plan", lang), 
      icon: Calendar 
    },
    { 
      href: "/client/reports", 
      label: t("Reports", lang), 
      icon: FileText 
    },
    { 
      href: "/dashboard/profile", 
      label: t("Profile & Security", lang), 
      icon: ShieldCheck 
    },
    { 
      href: "/client/settings", 
      label: t("Settings", lang), 
      icon: Settings 
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[100] p-2 bg-[#003366] text-white rounded-xl shadow-lg md:hidden hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-[95] w-72 bg-[#003366] text-white flex flex-col shadow-2xl transition-transform duration-500 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        <div className="p-8 border-b border-white/10 flex flex-col items-center shrink-0">
          <div className="relative h-10 w-48 mb-6">
            <img src="/logo_epl_connect_1.png" className="h-10 brightness-0 invert" alt="EPL Connect" />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 opacity-60">
              {isVendor ? t("PARTNER PORTAL", lang) : t("CLIENT PORTAL", lang)}
            </p>
            <p className="text-sm font-bold mt-1 text-white truncate max-w-[200px]">{session?.name}</p>
            <span className="text-[10px] px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/20 mt-2 inline-block font-black uppercase tracking-widest">
              {isVendor ? t("Service Partner", lang) : t("Project Partner", lang)}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={idx}
                href={item.href} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-white/15 text-white shadow-lg shadow-black/10" 
                    : "text-blue-100/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-blue-300" : "text-blue-300/60 group-hover:text-white"}`} />
                <span className="text-sm font-bold tracking-wide">{item.label}</span>
                <ChevronRight className={`w-4 h-4 ml-auto transition-all ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0"}`} />
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button 
            onClick={() => { 
                localStorage.removeItem("daikin_last_project");
              logout(); 
              setIsOpen(false); 
            }}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all duration-500 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-sm font-black uppercase tracking-widest">{t("Exit Portal", lang)}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
