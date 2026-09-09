
const fs = require("fs");
const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
const lines = schema.split("\n");
let inside = false;
for (let line of lines) {
  if (line.includes("model pipeline_deals")) inside = true;
  if (inside) console.log(line);
  if (inside && line.trim() === "}") break;
}

