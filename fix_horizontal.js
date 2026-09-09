
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
  
  // Previously we removed overflow-hidden/overflow-auto from the table container, but made it `overflow: visible`
  // We need the table to scroll HORIZONTALLY, but NOT VERTICALLY.
  // The vertical scroll happens on the main modal body.
  // So the table container should be `overflowX: "auto", overflowY: "visible"`
  // Let us find the table container.

  // In Category, Sector, Status:
  // <div style={{ flex: 1, minHeight: 400, display: "flex", flexDirection: "column", background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "visible", marginBottom: 32, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
  content = content.replace(/overflow: "visible"/g, `overflowX: "auto", overflowY: "visible"`);
  
  // In ProjectByStatus and BookingForecast:
  // <div style={{ flex: 1, borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
  // Let us make sure they also have overflowX: auto
  content = content.replace(/flex: 1, borderRadius: 12, border/g, `flex: 1, overflowX: "auto", overflowY: "visible", borderRadius: 12, border`);

  fs.writeFileSync(file, content);
});
console.log("Patched horizontal scroll container!");

