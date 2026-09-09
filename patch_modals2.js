
const fs = require("fs");
const files = [
  "src/app/admin/live-data/CategoryPipelineModal.tsx",
  "src/app/admin/live-data/SectorPipelineModal.tsx",
  "src/app/admin/live-data/StatusPipelineModal.tsx",
];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // Replace the specific exact match
  content = content.replace(
    /<div style={{ flex: 1, overflow: "auto" }}>/g,
    `<div style={{ flex: 1, overflow: "auto", maxHeight: "60vh" }}>`
  );

  fs.writeFileSync(file, content);
});
console.log("Patched the other 3 modals!");

