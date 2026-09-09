
const fs = require("fs");
const file = "src/app/admin/live-data/BookingForecastModal.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(/padding: "32px", overflow: "auto"/g, `padding: "0 32px 32px 32px", overflow: "auto"`);
content = content.replace(/\{\/\* Infographic Chart \*\/\}\n\s*<div>/g, `{/* Infographic Chart */}\n            <div style={{ marginTop: 32 }}>`);

fs.writeFileSync(file, content);
console.log("Fixed BookingForecastModal");

