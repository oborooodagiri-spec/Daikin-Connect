"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, Users, LogOut, Settings, Menu, X,
  ChevronRight, Building2, Calendar, FileText, Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardSidebarClient({ 
  session, 
  dashboardHref, 
  logout 
}: { 
  session: any, 
  dashboardHref: string, 
  logout: () => void 
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Diagnostic log to catch inconsistencies in production/local sessions
  console.log("DEBUG Sidebar Session:", { 
    name: session?.name, 
    roles: session?.roles, 
    isInternal: session?.isInternal 
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { 
      href: dashboardHref, 
      label: session?.isInternal ? "Command Center" : "My Inventory", 
      icon: session?.isInternal ? LayoutDashboard : Package,
      show: true 
    },
    { 
      href: "/dashboard/customers", 
      label: "Customers", 
      icon: Building2, 
      show: session?.isInternal 
    },
    { 
      href: "/dashboard/users", 
      label: "User Management", 
      icon: Users, 
      show: (session?.roles || []).some((r: string) => 
        r.toLowerCase().trim().includes("admin") || 
        r.toLowerCase().trim().includes("super")
      ) || String(session?.role || "").toLowerCase().includes("admin")
    },
    { 
      href: "/dashboard/reports", 
      label: "Reports", 
      icon: FileText, 
      show: true 
    },
    { 
      href: "/dashboard/settings", 
      label: "Settings", 
      icon: Settings, 
      show: true,
      disabled: true 
    }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[60] p-2 bg-[#003366] text-white rounded-xl shadow-lg md:hidden hover:scale-110 active:scale-95 transition-all"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-[55] w-72 bg-[#003366] text-white flex flex-col shadow-2xl transition-transform duration-500 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        <div className="p-8 border-b border-white/10 flex flex-col items-center shrink-0">
          <img src="/logo_epl_connect_1.png" className="h-10 lg:h-12 w-auto brightness-0 invert mb-6 object-contain" alt="EPL Connect" />
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300 opacity-60">EPL Connect</p>
            <p className="text-sm font-bold mt-1 text-white truncate max-w-[200px]">{session?.name}</p>
            <span className="text-[10px] px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/20 mt-2 inline-block">
              {session?.roles?.[0] || "User"}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar-sidebar">
          {menuItems.filter(item => item.show).map((item, idx) => (
            <Link 
              key={idx}
              href={item.disabled ? "#" : item.href} 
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/10 group transition-all duration-300 ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <item.icon className="w-5 h-5 text-blue-300 group-hover:text-white" />
              <span className="text-sm font-bold tracking-wide">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 duration-300" />
            </Link>
          ))}

          <div className="pt-8 mt-8 border-t border-white/5 opacity-40 px-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Maintenance</p>
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button 
            onClick={() => { logout(); setIsOpen(false); }}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all duration-500 group"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

    </>
  );
}
