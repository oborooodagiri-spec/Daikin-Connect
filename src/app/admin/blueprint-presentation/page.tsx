import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import BlueprintPresentationClient from "./BlueprintPresentationClient";

export const metadata = {
  title: "Master Blueprint V2 Presentation | Daikin Connect",
  description: "Internal presentation for VES National Operational Guidelines Tier 1, 2, and 3.",
};

export default async function BlueprintPresentationPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/");
  }

  const isAdmin = session.roles.some((r: string) => 
    ["admin", "super", "administrator", "management"].some(keyword => 
      r.toLowerCase().includes(keyword)
    )
  );

  if (!isAdmin) {
    redirect("/home");
  }

  return (
    <main className="bg-[#040814] min-h-screen">
      <BlueprintPresentationClient />
    </main>
  );
}
