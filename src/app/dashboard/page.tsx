import { getSession } from "@/app/actions/auth";
import { getUserAssignedProjects } from "@/app/actions/complaints";
import { redirect } from "next/navigation";

export default async function GlobalDashboardRedirect() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const assignedProjects = await getUserAssignedProjects();
  if (assignedProjects && assignedProjects.length > 0) {
    // Redirect to the first assigned project's workspace
    const firstProject = assignedProjects[0];
    if (session.isInternal) {
      redirect(`/w/${firstProject.id}/dashboard`);
    } else {
      redirect(`/w/${firstProject.id}/client/dashboard`);
    }
  } else {
    // If no projects assigned, redirect to an empty dashboard
    if (session.isInternal) {
      redirect(`/w/empty/dashboard`);
    } else {
      redirect(`/w/empty/client/dashboard`);
    }
  }
}
