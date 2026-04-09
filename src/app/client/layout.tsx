import React from "react";
import Link from "next/link";
import { getSession, logout } from "../actions/auth";
import { 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  ChevronRight,
  Package,
  Calendar,
  FileText
} from "lucide-react";
import { redirect } from "next/navigation";
import ClientSidebarClient from "./ClientSidebarClient";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect("/");
  }

  // Double check that it's actually an external user
  if (session.isInternal) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-x-hidden">
      <ClientSidebarClient session={session} logout={logout} />

      {/* Main Content Area */}
      <div className="flex-1 transition-all duration-500 ml-0 md:ml-72 min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-[90]">
           {/* Mobile Menu Spacer */}
           <div className="w-10 h-10 md:hidden shrink-0" />

           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Project Monitor</span>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="hidden sm:text-right sm:block">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Connected as</p>
               <p className="text-xs font-bold text-slate-800 tracking-tight">{session?.email}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-[#003366]">
               {session?.name?.charAt(0)}
             </div>
           </div>
        </header>
        <main className="p-4 sm:p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
