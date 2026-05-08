import { getSession } from "@/app/actions/auth";
import { getLogsheetTemplates } from "@/app/actions/logsheets";
import LogsheetDashboard from "@/components/logsheet/LogsheetDashboard";
import { redirect } from "next/navigation";

export default async function LogsheetsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const templatesResult = await getLogsheetTemplates(projectId);
  const templates = templatesResult.success ? templatesResult.data : [];

  return (
    <div className="w-full min-h-screen bg-slate-50/50">
      <LogsheetDashboard 
        projectId={projectId} 
        session={session} 
        initialTemplates={templates} 
      />
    </div>
  );
}
