
const fs = require("fs");
const content = fs.readFileSync("src/app/admin/live-data/ProjectModal.tsx", "utf8");
const lines = content.split("\n");
const idx = lines.findIndex(l => l.includes("Partnership PIC"));
if (idx !== -1) {
    console.log(lines.slice(idx - 10, idx + 10).join("\n"));
}

