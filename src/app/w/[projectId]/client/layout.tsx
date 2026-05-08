import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await getSession();
  
  if (!session) {
    redirect("/");
  }

  // Redirect to the unified dashboard
  redirect(`/w/${projectId}/dashboard`);
}
