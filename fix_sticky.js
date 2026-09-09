
const fs = require("fs");

const patternA = [
  "src/app/admin/live-data/CategoryPipelineModal.tsx",
  "src/app/admin/live-data/SectorPipelineModal.tsx",
  "src/app/admin/live-data/StatusPipelineModal.tsx"
];

const patternB = [
  "src/app/admin/live-data/BookingForecastModal.tsx",
  "src/app/admin/live-data/ProjectByStatusModal.tsx"
];

patternA.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(/overflowY: "auto"/g, `overflow: "auto"`);
  content = content.replace(/, overflow: "hidden", boxShadow:/g, `, overflow: "visible", boxShadow:`);
  content = content.replace(/<div style={{ flex: 1, overflow: "auto", maxHeight: "60vh" }}>/g, `<div style={{ flex: 1 }}>`);
  fs.writeFileSync(file, content);
});

patternB.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(/overflowY: "auto"/g, `overflow: "auto"`);
  content = content.replace(/<div style={{ flex: 1, overflow: "auto", maxHeight: "60vh", borderRadius/g, `<div style={{ flex: 1, borderRadius`);
  fs.writeFileSync(file, content);
});

console.log("Patched all 5 modals to stick to main scroll!");

