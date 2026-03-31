import DashboardWrapper from "./DashboardWrapper";
import { getSession } from "../actions/auth";
import { getUserAssignedProjects } from "../actions/complaints";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  // If not internal (Customer or Vendor), redirect to their unit list
  if (session && !session.isInternal) {
    const assignedProjects = await getUserAssignedProjects();
    
    if (assignedProjects.length > 0) {
      redirect(`/client/dashboard`);
    } else {
      // If no projects assigned, show a restricted access message or empty state
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
             <img src="/daikin_logo.png" className="w-12 opacity-20 grayscale" alt="Daikin" />
          </div>
          <h1 className="text-2xl font-black text-[#003366] mb-2 uppercase tracking-tight">Access Restricted</h1>
          <p className="text-slate-500 font-bold max-w-md mx-auto text-sm leading-relaxed">
            Your account is not currently assigned to any active projects. Please contact your administrator to gain access to unit monitoring.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="w-full">
      <DashboardWrapper />
    </div>
  );
}
