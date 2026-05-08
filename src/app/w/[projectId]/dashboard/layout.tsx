import React from "react";
import Link from "next/link";
import { getSession, logout } from "@/app/actions/auth";
import { 
  Menu,
  ChevronRight,
  Building2,
  Calendar,
  FileText,
  Package
} from "lucide-react";
import { getUserAssignedProjects } from "@/app/actions/complaints";
import DashboardSidebarClient from "./DashboardSidebarClient";
import NotificationCenter from "@/components/NotificationCenter";
import NotificationManager from "@/components/dashboard/NotificationManager";
import AppViewWrapper from "@/components/dashboard/AppViewWrapper";
import SessionGuardian from "@/components/security/SessionGuardian";
import MainContentWrapper from "./MainContentWrapper";
import { Suspense } from "react";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await getSession();
  const assignedProjects = await getUserAssignedProjects();
  
  let monitoringFocus = "UNIT";
  let customerId = "";
  if (projectId && projectId !== "empty") {
    try {
      const proj = await (prisma as any).projects.findUnique({
        where: { id: BigInt(projectId) },
        select: { monitoring_focus: true, customer_id: true }
      });
      if (proj) {
        monitoringFocus = proj.monitoring_focus;
        customerId = proj.customer_id.toString();
      }
    } catch (e) {
      console.error("Layout Config Error:", e);
    }
  }
  let dashboardHref = `/w/${projectId}/dashboard`;
  if (session && !session.isInternal && assignedProjects.length > 0) {
    dashboardHref = `/w/${projectId}/dashboard?tab=inventory`;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#00a1e4] border-t-transparent rounded-full animate-spin"></div></div>}>
      <SessionGuardian />
      <AppViewWrapper>
        <div className="min-h-screen bg-white flex font-sans overflow-x-hidden">
          
          {/* Client Sidebar (Handles its own mobile state) */}
          <DashboardSidebarClient 
            session={session} 
            dashboardHref={dashboardHref} 
            logout={logout} 
            monitoringFocus={monitoringFocus}
            customerId={customerId}
          />

          <MainContentWrapper>
            <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-[#f0f3f7] px-4 md:px-8 flex items-center justify-between sticky top-0 z-[90]">
              <div className="w-10 h-10 md:hidden" />

              <div className="flex items-center gap-6">
                
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00c875] animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">System Online</span>
                </div>
                

                <div className="flex items-center gap-4">
                  <NotificationCenter />
                </div>
              </div>
            </header>

            {children}
          </MainContentWrapper>
          <NotificationManager />
        </div>
      </AppViewWrapper>
    </Suspense>
  );
}
