import { getSession } from "@/app/actions/auth";
import { getUserAssignedProjects } from "@/app/actions/complaints";
import { redirect } from "next/navigation";

export default async function GlobalDashboardRedirect() {
  redirect("/home");
}
