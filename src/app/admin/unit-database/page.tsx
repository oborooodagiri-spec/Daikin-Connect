import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import UnitDatabaseClient from "./UnitDatabaseClient";

export const metadata = {
  title: "Unit Database | Daikin Connect",
  description: "Kelola kategori tipe unit, katalog, dan data penunjang HVAC.",
};

export default async function UnitDatabasePage() {
  const session = await getSession();

  if (!session || !session.isInternal) {
    redirect("/");
  }

  return <UnitDatabaseClient />;
}
