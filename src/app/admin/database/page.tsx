import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import DatabaseClient from "./DatabaseClient";

export const metadata = {
  title: "Resource Database | Daikin Connect",
  description: "Internal repository for presentation materials, catalogs, and technical documents.",
};

export default async function ResourceDatabasePage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <DatabaseClient />;
}
