
const fs = require("fs");

const files = [
  "src/app/admin/live-data/ProjectByStatusModal.tsx",
  "src/app/admin/live-data/CategoryPipelineModal.tsx",
  "src/app/admin/live-data/SectorPipelineModal.tsx",
  "src/app/admin/live-data/StatusPipelineModal.tsx",
  "src/app/admin/live-data/BookingForecastModal.tsx"
];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // Remove the user-added overflowX: "auto", overflowY: "visible" from table wrappers
  content = content.replace(/overflowX: "auto", overflowY: "visible", /g, `overflow: "visible", `);
  
  // Also just in case, ensure .modal-content has overflow: "auto" and padding: "0 32px 0 32px"
  // Wait, for BookingForecastModal, I might have messed up the padding string earlier. Let us ensure it is clean.
  
  fs.writeFileSync(file, content);
});

console.log("Reverted user overflowX break.");

