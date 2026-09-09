const fs = require("fs");
let file = "ecosystem.config.js";
let text = fs.readFileSync(file, "utf8");
text = text.replace(/PORT: 3001/g, "PORT: 3000");
fs.writeFileSync(file, text);
console.log("Changed port to 3000");
