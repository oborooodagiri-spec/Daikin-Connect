
const fs = require("fs");

const files = [
  "src/app/admin/live-data/CategoryPipelineModal.tsx",
  "src/app/admin/live-data/SectorPipelineModal.tsx",
  "src/app/admin/live-data/StatusPipelineModal.tsx",
  "src/app/admin/live-data/BookingForecastModal.tsx",
  "src/app/admin/live-data/ProjectByStatusModal.tsx"
];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // 1. Change padding: "32px" to padding: "0 32px 32px 32px" on the modal-content
  content = content.replace(/padding: "32px", flex: 1, overflow: "auto"/g, `padding: "0 32px 32px 32px", flex: 1, overflow: "auto"`);
  content = content.replace(/padding: 32, gap: 32, background: "#ffffff"/g, `padding: "0 32px 32px 32px", gap: 32, background: "#ffffff"`);
  
  // 2. Add padding-top to the first child (which is the chart or container)
  // In ProjectByStatus and BookingForecast, it is:
  // {/* Chart Section */}
  // <div>
  content = content.replace(/\{\/\* Chart Section \*\/\}\n\s*<div>/g, `{/* Chart Section */}\n            <div style={{ marginTop: 32 }}>`);
  
  // In Category, Sector, Status, it is:
  // {/* Infographic Chart */}
  // <div style={{ flex: "none", padding: 24, background: "#f8fafc"
  content = content.replace(/\{\/\* Infographic Chart \*\/\}\n\s*<div style={{ flex: "none", padding: 24/g, `{/* Infographic Chart */}\n            <div style={{ marginTop: 32, flex: "none", padding: 24`);

  // Wait, I should also check if the background is transparent or has a gap in the headers.
  // We want to make sure the headers look completely solid.
  // In Category/Sector/Status, the headers are:
  // <th style={{ padding: "16px 24px", background: "#f8fafc", ... position: "sticky", top: 0
  // They are solid.
  
  fs.writeFileSync(file, content);
});
console.log("Patched padding to fix gap above sticky header!");

