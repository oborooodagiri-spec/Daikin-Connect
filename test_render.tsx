
import React from "react";
import { renderToString } from "react-dom/server";
import DealFormModal from "./src/app/admin/live-data/DealFormModal";

const fakeDeal = {
  id: 1,
  sales_planner: "David Imanuel, Budi Santoso",
  pic: "Danis",
  source: "Partnership",
  status: "A"
};

try {
  const html = renderToString(
    <DealFormModal 
      isOpen={true} 
      onClose={() => {}} 
      onSuccess={() => {}} 
      deal={fakeDeal} 
      sessionName="Danis" 
      isAdmin={true} 
    />
  );
  console.log("Render successful! Length:", html.length);
} catch (e) {
  console.error("Render failed:", e);
}

