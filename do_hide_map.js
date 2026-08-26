const fs = require('fs');
let code = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

const targetStr = `<div style={{ position: "relative", width: "100%", height: 600, borderRadius: 24, overflow: "hidden", background: "#c8e6f5" }}>`;
const replacement = `<div className="hidden md:block" style={{ position: "relative", width: "100%", height: 600, borderRadius: 24, overflow: "hidden", background: "#c8e6f5" }}>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', code, 'utf8');
  console.log("Replaced successfully!");
} else {
  console.log("Target string not found.");
}
