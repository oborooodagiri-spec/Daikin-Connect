import { getSession } from "@/app/actions/auth";
import { getResources } from "@/app/actions/database";
import { getAllProjects } from "@/app/actions/projects";
import { getAllUsers } from "@/app/actions/users";
import { redirect } from "next/navigation";
import DatabaseClient from "./DatabaseClient";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Resource Database | DSSI Connect",
  description: "Internal repository for presentation materials, catalogs, and technical documents.",
};

export default async function ResourceDatabasePage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const [resData, projData, usersData] = await Promise.all([
    getResources(),
    getAllProjects(),
    getAllUsers()
  ]);

  const initialResources = ('success' in resData && resData.success && 'data' in resData) ? resData.data : [];
  const initialProjects = ('success' in projData && projData.success && 'data' in projData) ? projData.data : [];
  const initialUsers = (usersData && 'success' in usersData && usersData.success && 'data' in usersData) ? usersData.data : [];

  console.log("[DATABASE PAGE] initialResources count:", initialResources.length, "presentations:", initialResources.filter((r: any) => r.category === 'Presentation').length);

  return (
    <DatabaseClient 
      initialResources={initialResources} 
      initialSession={session} 
      initialProjects={initialProjects} 
      initialUsers={initialUsers} 
    />
  );
}
