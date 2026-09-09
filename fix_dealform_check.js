
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/live-data/DealFormModal.tsx", "utf8");
content = content.replace(/<span>\?<\/span>/g, "<span>&#10003;</span>");
fs.writeFileSync("src/app/admin/live-data/DealFormModal.tsx", content);

