"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, LogOut, Settings, Menu, X,
  ChevronRight, Building2, Calendar, FileText, Sparkles, ShieldCheck, ClipboardList, Target,
  Database, Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardSidebarClient({ 
  session, 
  dashboardHref, 
  logout,
  monitoringFocus = "UNIT",
  customerId = ""
}: { 
  session: any, 
  dashboardHref: string, 
  logout: () => void,
  monitoringFocus?: string,
  customerId?: string
}) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params?.projectId as string || "empty";

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hide sidebar on customer list page and unit details
  const isCustomerPage = pathname?.includes("/customers");
  const isUnitPage = pathname?.includes("/units/");
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) return <div className="fixed inset-y-0 left-0 z-[95] w-72 bg-[#003366] invisible md:visible opacity-0" />;
  if (isCustomerPage || isUnitPage) return null;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      href: "/home",
      label: "Home",
      icon: LayoutDashboard,
      show: true,
      accent: "text-[#0073ea]"
    },
    { 
      href: dashboardHref, 
      label: "Dashboard", 
      icon: Target,
      show: true 
    },
    { 
      href: `/w/${projectId}/dashboard/reports`, 
      label: "Reports", 
      icon: FileText, 
      show: true 
    },
    { 
      href: `/w/${projectId}/dashboard/unit-requests`, 
      label: "Unit Requests", 
      icon: ClipboardList, 
      show: session?.isInternal
    }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[100] p-2 bg-white text-[#323338] border border-[#e6e9ef] rounded-xl shadow-md md:hidden hover:bg-[#f7f8fa] transition-all"
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
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-[95] w-72 bg-white border-r border-[#e6e9ef] text-[#323338] flex flex-col transition-transform duration-500 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        <div className="p-8 border-b border-[#f7f8fa] flex flex-col items-center shrink-0">
          <div className="relative h-10 lg:h-12 w-48 mb-6">
            <Image 
              src="/logo_epl_connect_1.png" 
              alt="EPL Connect" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#323338] truncate max-w-[200px]">{session?.name}</p>
            <span className="text-[10px] px-2.5 py-0.5 bg-slate-50 text-slate-400 rounded-full border border-slate-100 mt-2 inline-block font-black uppercase tracking-widest">
              {session?.roles?.[0] || "User"}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.filter(item => item.show).map((item, idx) => (
            <Link 
              key={idx}
              href={item.disabled ? "#" : item.href} 
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl hover:bg-[#f7f8fa] group transition-all duration-200 ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <item.icon className={`w-5 h-5 ${item.accent || "text-[#676879] group-hover:text-[#0073ea]"} transition-colors`} />
              <span className={`text-sm font-bold tracking-tight ${item.accent ? item.accent : "text-[#323338]"}`}>{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#c3c6d4] opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-[#f7f8fa]">
          <button 
            onClick={() => { 
              localStorage.removeItem("daikin_last_project");
              logout(); 
              setIsOpen(false); 
            }}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-rose-50 text-[#e44258] hover:bg-[#e44258] hover:text-white transition-all duration-300 font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
