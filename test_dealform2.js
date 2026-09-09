
const fs = require("fs");
const content = fs.readFileSync("src/app/admin/live-data/DealFormModal.tsx", "utf8");
const lines = content.split("\n");
const idx = lines.findIndex(l => l.includes("name=\"sales_planner\""));
if (idx !== -1) {
    console.log(lines.slice(idx - 5, idx + 15).join("\n"));
}

