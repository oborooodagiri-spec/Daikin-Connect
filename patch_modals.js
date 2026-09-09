
const fs = require("fs");
const files = [
  "src/app/admin/live-data/BookingForecastModal.tsx",
  "src/app/admin/live-data/CategoryPipelineModal.tsx",
  "src/app/admin/live-data/ProjectByStatusModal.tsx", // Note: I just patched this one partially above, let me undo and use a stable regex
  "src/app/admin/live-data/SectorPipelineModal.tsx",
  "src/app/admin/live-data/StatusPipelineModal.tsx",
];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // Clean up any previous test patch if it exists
  content = content.replace(/maxHeight: "60vh", /g, "");

  // Apply to the specific table wrapper
  content = content.replace(
    /flex: 1, overflow: "auto", /g,
    `flex: 1, overflow: "auto", maxHeight: "60vh", `
  );

  fs.writeFileSync(file, content);
});
console.log("Patched all 5 modals!");

