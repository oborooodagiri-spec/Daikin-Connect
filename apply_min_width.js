
const fs = require("fs");

const files = [
  "src/app/admin/live-data/ProjectByStatusModal.tsx",
  "src/app/admin/live-data/BookingForecastModal.tsx"
];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // For ProjectByStatus and BookingForecast:
  // <div style={{ flex: 1, overflow: "visible", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
  content = content.replace(/<div style=\{\{ flex: 1, overflow: "visible", borderRadius: 12, border: "1px solid #e5e7eb"/g, `<div style={{ flex: 1, minWidth: "max-content", overflow: "visible", borderRadius: 12, border: "1px solid #e5e7eb"`);
  
  fs.writeFileSync(file, content);
});

const files2 = [
  "src/app/admin/live-data/CategoryPipelineModal.tsx",
  "src/app/admin/live-data/SectorPipelineModal.tsx",
  "src/app/admin/live-data/StatusPipelineModal.tsx"
];

files2.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // For Category, Sector, Status:
  // <div style={{ flex: 1, minHeight: 400, display: "flex", flexDirection: "column", background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "visible", marginBottom: 32, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
  content = content.replace(/<div style=\{\{ flex: 1, minHeight: 400, display: "flex", flexDirection: "column", background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "visible"/g, `<div style={{ flex: 1, minWidth: "max-content", minHeight: 400, display: "flex", flexDirection: "column", background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "visible"`);
  
  fs.writeFileSync(file, content);
});

console.log("Applied minWidth: max-content");

