
const fs = require("fs");
const lines = fs.readFileSync("src/app/admin/live-data/TargetProgressModal.tsx", "utf8").split("\n");
const idx = lines.findIndex(l => l.includes("sales_planner"));
if (idx !== -1) {
    console.log(lines.slice(idx - 5, idx + 25).join("\n"));
}

