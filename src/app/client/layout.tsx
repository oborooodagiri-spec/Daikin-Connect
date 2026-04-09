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
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Client Sidebar */}
      <aside className="w-72 bg-[#003366] text-white flex flex-col fixed inset-y-0 z-50 shadow-2xl transition-all duration-500">
        <div className="p-8 border-b border-white/10 flex flex-col items-center">
          <img src="/daikin_logo.png" className="h-6 brightness-0 invert mb-6" alt="Daikin" />
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300 opacity-60">CLIENT PORTAL</p>
            <p className="text-sm font-bold mt-1 text-white truncate max-w-[200px]">{session?.name}</p>
            <span className="text-[10px] px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/20 mt-2 inline-block">
              Project Partner
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link 
            href="/client/dashboard" 
            className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/10 group transition-all duration-300"
          >
            <LayoutDashboard className="w-5 h-5 text-blue-300 group-hover:text-white" />
            <span className="text-sm font-bold tracking-wide">Overview</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
          </Link>

          <Link 
            href="/client/inventory" 
            className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/10 group transition-all duration-300"
          >
            <Package className="w-5 h-5 text-blue-300 group-hover:text-white" />
            <span className="text-sm font-bold tracking-wide">My Assets</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
          </Link>

          <Link 
            href="/client/schedules" 
            className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/10 group transition-all duration-300"
          >
            <Calendar className="w-5 h-5 text-blue-300 group-hover:text-white" />
            <span className="text-sm font-bold tracking-wide">Work Plan</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
          </Link>

          <Link 
            href="/client/reports" 
            className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/10 group transition-all duration-300"
          >
            <FileText className="w-5 h-5 text-blue-300 group-hover:text-white" />
            <span className="text-sm font-bold tracking-wide">Reports</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
          </Link>
        </nav>

        <div className="p-4 mt-auto">
          <form action={logout}>
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all duration-500 group">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">Exit Portal</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-72">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Project Monitor</span>
           </div>
           <div className="flex items-center gap-4">
             <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Connected as</p>
               <p className="text-xs font-bold text-slate-800 tracking-tight">{session?.email}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-[#003366]">
               {session?.name?.charAt(0)}
             </div>
           </div>
        </header>
        <main className="p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
