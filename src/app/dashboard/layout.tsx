import React from "react";
import Link from "next/link";
import { getSession, logout } from "../actions/auth";
import { 
  Menu,
  ChevronRight,
  Building2,
  Calendar,
  FileText,
  Package
} from "lucide-react";
import { getUserAssignedProjects } from "../actions/complaints";
import DashboardSidebarClient from "./DashboardSidebarClient";
import ProblemNotificationCenter from "@/components/ProblemNotificationCenter";
import NotificationManager from "@/components/dashboard/NotificationManager";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const assignedProjects = await getUserAssignedProjects();
  
  let dashboardHref = "/dashboard";
  if (session && !session.isInternal && assignedProjects.length > 0) {
    const p = assignedProjects[0];
    dashboardHref = `/dashboard/customers/${p.customer_id}/projects/${p.id}/units`;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-x-hidden">
      
      {/* Client Sidebar (Handles its own mobile state) */}
      <DashboardSidebarClient 
        session={session} 
        dashboardHref={dashboardHref} 
        logout={logout} 
      />

      {/* Main Content Area */}
      <div className="flex-1 transition-all duration-500 ml-0 md:ml-72 min-w-0">
        
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-[90]">
           <div className="w-10 h-10 md:hidden" />

           <div className="flex items-center gap-2 md:gap-6">
             
             <div className="hidden sm:block text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">SYSTEM CONNECTED</p>
               <p className="text-xs font-bold text-[#00a1e4] tracking-tight">{new Date().getFullYear()} DAIKIN CONNECT ONLINE</p>
             </div>
             
             <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

             <div className="flex items-center gap-3">
               <ProblemNotificationCenter />
               <NotificationManager />
               <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Logged in as</p>
                 <p className="text-xs font-bold text-slate-800 tracking-tight max-w-[120px] truncate uppercase">{session?.name}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#003366] to-blue-600 border border-white/20 flex items-center justify-center font-black text-white shadow-lg shadow-blue-900/10">
                 {session?.name?.charAt(0)}
               </div>
             </div>
           </div>
        </header>

        <main className="p-4 md:p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
