
import React from "react";
import { renderToString } from "react-dom/server";
import TargetProgressModal from "./src/app/admin/live-data/TargetProgressModal";

const fakeDeals = [
  {
    id: 1,
    sales_planner: "David Imanuel, Budi Santoso",
    pic: "Danis",
    source: "Partnership",
    status: "A",
    is_closed: true,
    updated_at: new Date().toISOString(),
    quotation: 5000000
  }
];

try {
  const html = renderToString(
    <TargetProgressModal 
      isOpen={true} 
      onClose={() => {}} 
      formatRp={(v: any) => v.toString()}
      deals={fakeDeals as any}
      partnershipPICs={["David Imanuel", "Budi Santoso"]}
      sessionName="Danis" 
      isAdmin={true} 
    />
  );
  console.log("Render TargetProgressModal successful! Length:", html.length);
} catch (e) {
  console.error("Render failed:", e);
}

