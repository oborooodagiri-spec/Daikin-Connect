
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
  
  // 1. Change padding: "0 32px 32px 32px" to padding: "0 32px 0 32px" on the modal-content
  content = content.replace(/padding: "0 32px 32px 32px"/g, `padding: "0 32px 0 32px"`);
  
  // 2. Add margin-bottom to the Table Section container.
  
  // For ProjectByStatus and BookingForecast, the Table Section is preceded by:
  // {/* Table Section */}
  // <div>
  content = content.replace(/\{\/\* Table Section \*\/\}\n\s*<div>/g, `{/* Table Section */}\n            <div style={{ marginBottom: 32 }}>`);
  
  // For Category, Sector, Status, the Table Section is:
  // <div style={{ flex: 1, minHeight: 400, display: "flex", flexDirection: "column", background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "visible", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
  // We can add marginBottom: 32 here.
  content = content.replace(/border: "1px solid #e2e8f0", overflow: "visible", boxShadow:/g, `border: "1px solid #e2e8f0", overflow: "visible", marginBottom: 32, boxShadow:`);
  
  fs.writeFileSync(file, content);
});
console.log("Patched bottom padding to fix gap below sticky footer!");

