import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import ShoppingListClient from "./ShoppingListClient";

export const metadata = {
  title: "Shopping List Manager | Daikin Connect",
  description: "Manage maintenance service prices and work lists for all unit categories.",
};

export default async function ShoppingListPage() {
  const session = await getSession();

  // Strict Admin Role Check
  const isAdmin = session?.roles?.some((role: string) => 
    ["admin", "super", "administrator"].some(keyword => role.toLowerCase().includes(keyword))
  );

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <ShoppingListClient />;
}
