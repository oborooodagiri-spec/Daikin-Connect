import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { getShoppingList } from "@/app/actions/rate_card";
import { getRateCardSettings } from "@/app/actions/rate_card_settings";
import { getAllProjects } from "@/app/actions/projects";
import { getAllUsers } from "@/app/actions/users";
import WorkOrderClient from "./WorkOrderClient";

export const metadata = {
  title: "Buat Work Order | Daikin Connect",
  description: "Buat dan simulasikan penawaran Surat Perintah Kerja (Work Order) HVAC.",
};

export default async function WorkOrderPage() {
  const session = await getSession();

  // Access validation (Admin/Management/Sales Engineer can access)
  const isAuthorized = session?.roles?.some((role: string) => 
    ["admin", "super", "administrator", "management", "sales engineer"].some(keyword => role.toLowerCase().includes(keyword))
  );

  if (!isAuthorized) {
    redirect("/dashboard");
  }

  // Fetch initial data on the server
  const [itemsRes, settingsRes, projectsRes, usersRes] = await Promise.all([
    getShoppingList(),
    getRateCardSettings(),
    getAllProjects(),
    getAllUsers()
  ]);

  const items = itemsRes.success ? itemsRes.data : [];
  const settings = settingsRes.success ? settingsRes.data : {
    vendors: [],
    period_year: new Date().getFullYear().toString(),
    selected_vendor: "",
    vendor_prices: {},
    allowed_users: [],
    categories: [],
    work_types: [],
    capacity_units: []
  };
  const projects = projectsRes?.success ? projectsRes.data : [];
  const users = usersRes?.success ? usersRes.data : [];

  return (
    <WorkOrderClient 
      initialItems={items} 
      initialSettings={settings} 
      projects={projects}
      users={users}
    />
  );
}
