
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/live-data/ProjectByStatusModal.tsx", "utf8");

content = content.replace(
  `<div style={{ flex: 1, overflow: "auto", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>`,
  `<div style={{ flex: 1, overflow: "auto", maxHeight: "60vh", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>`
);

fs.writeFileSync("src/app/admin/live-data/ProjectByStatusModal.tsx", content);

