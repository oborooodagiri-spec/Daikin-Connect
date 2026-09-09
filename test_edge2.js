
const fs = require("fs");

function processGroup1(file) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(
    `<div style={{ flex: 1, minWidth: "max-content", overflow: "visible", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>`,
    `<div style={{ flex: 1, minWidth: "max-content", overflow: "visible", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>`
  );
  fs.writeFileSync(file, content);
}

processGroup1("src/app/admin/live-data/ProjectByStatusModal.tsx");
processGroup1("src/app/admin/live-data/BookingForecastModal.tsx");
console.log("Done");

