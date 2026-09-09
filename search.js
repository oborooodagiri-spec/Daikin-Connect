
const fs = require("fs");
const path = require("path");
function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) search(p);
    else if (p.endsWith(".tsx")) {
      const content = fs.readFileSync(p, "utf8");
      if (content.includes("Riwayat Logsheet")) console.log(p);
    }
  }
}
search("src/app");

