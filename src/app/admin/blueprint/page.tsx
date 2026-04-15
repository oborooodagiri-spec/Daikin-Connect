import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import BlueprintClient from "./BlueprintClient";

export const metadata = {
  title: "The Blueprint | Daikin Connect Executive Showcase",
  description: "Executive strategic presentation for Daikin Connect - Private Admin Access",
};

export default async function BlueprintPage() {
  const session = await getSession();

  // Admin Security Check
  if (!session) {
    redirect("/");
  }

  const isAdmin = session.roles.some((r: string) => 
    ["admin", "super", "administrator", "management"].some(keyword => 
      r.toLowerCase().includes(keyword)
    )
  );

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <main className="bg-[#040814] min-h-screen text-white overflow-hidden">
      <BlueprintClient />
    </main>
  );
}
