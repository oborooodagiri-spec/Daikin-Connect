import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import QuotationClient from "./QuotationClient";
import { getShoppingList } from "@/app/actions/rate_card";
import { getRateCardSettings } from "@/app/actions/rate_card_settings";
import { getAllUsers } from "@/app/actions/users";
import { getAllProjects } from "@/app/actions/projects";

export const metadata = {
  title: "Quotation Generator | EPL CONNECT",
  description: "Buat Surat Penawaran Harga (SPH) resmi untuk Customer dengan input margin interaktif.",
};

export default async function QuotationPage() {
  const session = await getSession();

  // Strict Admin Role Check
  const isAdmin = session?.roles?.some((role: string) => 
    ["admin", "super", "administrator"].some(keyword => role.toLowerCase().includes(keyword))
  );

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Pre-fetch initial data to pass for fast client startup
  const [itemsRes, settingsRes, usersRes, projectsRes] = await Promise.all([
    getShoppingList(),
    getRateCardSettings(),
    getAllUsers(),
    getAllProjects()
  ]);

  return (
    <QuotationClient 
      initialItems={itemsRes && 'success' in itemsRes && itemsRes.success ? (itemsRes as any).data : []}
      initialSettings={settingsRes && 'success' in settingsRes && settingsRes.success ? (settingsRes as any).data : {
        vendors: [],
        period_year: new Date().getFullYear().toString(),
        selected_vendor: "",
        vendor_prices: {},
        allowed_users: [],
        categories: [],
        work_types: [],
        capacity_units: []
      }}
      users={usersRes && 'success' in usersRes && usersRes.success ? (usersRes as any).data : []}
      projects={projectsRes && 'success' in projectsRes && projectsRes.success ? (projectsRes as any).data : []}
    />
  );
}
