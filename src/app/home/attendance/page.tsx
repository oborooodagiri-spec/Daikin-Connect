import React from "react";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import AttendanceDashboard from "@/components/attendance/AttendanceDashboard";
import { redirect } from "next/navigation";

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Get all projects assigned to user to pass to AttendanceDashboard
  const userAccess = await prisma.user_project_access.findMany({
    where: { user_id: parseInt(session.userId) },
    include: { projects: { select: { id: true, name: true } } }
  });

  const projects = userAccess.map(ua => ({
    id: ua.project_id.toString(),
    name: ua.projects?.name || 'Unknown Project'
  }));

  return <AttendanceDashboard projects={projects} />;
}
