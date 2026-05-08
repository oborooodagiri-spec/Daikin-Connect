import React from "react";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import AttendanceDashboard from "@/components/attendance/AttendanceDashboard";
import { redirect } from "next/navigation";

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Get project assigned to user to pass to AttendanceDashboard
  const userAccess = await prisma.user_project_access.findFirst({
    where: { user_id: parseInt(session.userId) },
    include: { projects: true }
  });

  const projectId = userAccess?.project_id ? String(userAccess.project_id) : "empty";

  return <AttendanceDashboard projectId={projectId} />;
}
