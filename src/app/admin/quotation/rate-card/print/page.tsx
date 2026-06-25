import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { getShoppingList } from "@/app/actions/rate_card";
import { getRateCardSettings } from "@/app/actions/rate_card_settings";
import PrintRateCardClient from "./PrintRateCardClient";

export const metadata = {
  title: "Cetak Kontrak Payung | Daikin Connect",
  description: "Cetak dan kustomisasi kesepakatan kontrak payung tarif harga satuan pemeliharaan.",
};

export default async function PrintRateCardPage() {
  const session = await getSession();

  // Strict Admin Role Check
  const isAdmin = session?.roles?.some((role: string) => 
    ["admin", "super", "administrator"].some(keyword => role.toLowerCase().includes(keyword))
  );

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Fetch initial data on the server
  const [itemsRes, settingsRes] = await Promise.all([
    getShoppingList(),
    getRateCardSettings()
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

  return <PrintRateCardClient initialItems={items} initialSettings={settings} />;
}
