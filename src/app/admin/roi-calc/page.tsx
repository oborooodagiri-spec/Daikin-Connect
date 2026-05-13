import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import RoiCalculatorClient from "./RoiCalculatorClient";

export const metadata = {
  title: "ROI Calculator | Daikin Connect",
  description: "Financial analysis and energy saving potential for VES Tier 3.",
};

export default async function RoiCalculatorPage() {
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
      <RoiCalculatorClient />
    </main>
  );
}
