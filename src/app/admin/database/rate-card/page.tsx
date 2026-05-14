import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import RateCardClient from "./RateCardClient";

export const metadata = {
  title: "Rate Card Manager | Daikin Connect",
  description: "Kelola Buku Tarif Satuan (Rate Card) pemeliharaan dan kontrak unit price.",
};

export default async function RateCardPage() {
  const session = await getSession();

  // Strict Admin Role Check
  const isAdmin = session?.roles?.some((role: string) => 
    ["admin", "super", "administrator"].some(keyword => role.toLowerCase().includes(keyword))
  );

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <RateCardClient />;
}
