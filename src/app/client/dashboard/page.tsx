import { redirect } from "next/navigation";

export default function ClientGlobalRedirect() {
  redirect("/dashboard"); // This will hit the global root dashboard redirect which routes to /w/[projectId]/client/dashboard
}
