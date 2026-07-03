import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import ProductLineupClient from "./ProductLineupClient";

export const metadata = {
  title: "Product Lineup | DSSI Connect",
  description: "Daikin equipment product lineup and specifications",
};

export default async function ProductLineupPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <ProductLineupClient session={session} />;
}
