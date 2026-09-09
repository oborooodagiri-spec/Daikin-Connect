
const fs = require("fs");
let tp = fs.readFileSync("src/app/admin/live-data/TargetProgressModal.tsx", "utf8");
let df = fs.readFileSync("src/app/admin/live-data/DealFormModal.tsx", "utf8");

tp = tp.replace(
  `const salesPlanners = d.sales_planner ? d.sales_planner.split(",").map(s => s.trim().toUpperCase()).filter(s => s) : [];`,
  `const salesPlanners = d.sales_planner ? String(d.sales_planner).split(",").map(s => s.trim().toUpperCase()).filter(s => s) : [];`
);

df = df.replace(
  `const selectedPartners = formData.sales_planner ? formData.sales_planner.split(",").map(s => s.trim()).filter(s => s) : [];`,
  `const selectedPartners = formData.sales_planner ? String(formData.sales_planner).split(",").map(s => s.trim()).filter(s => s) : [];`
);

fs.writeFileSync("src/app/admin/live-data/TargetProgressModal.tsx", tp);
fs.writeFileSync("src/app/admin/live-data/DealFormModal.tsx", df);
console.log("Fixed!");

