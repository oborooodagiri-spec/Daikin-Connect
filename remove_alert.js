
const fs = require("fs");
let content = fs.readFileSync("src/app/reports/[type]/[id]/page.tsx", "utf8");

const oldAlert = `console.error("Download error:", err);
      alert("Failed to generate PDF. Please try again.");`;

const newAlert = `console.error("Download error:", err);
      if (typeof window !== "undefined" && !window.location.search.includes("autoDownload=true")) {
        alert("Failed to generate PDF. Please try again.");
      }`;

if (content.includes(oldAlert)) {
  content = content.replace(oldAlert, newAlert);
  fs.writeFileSync("src/app/reports/[type]/[id]/page.tsx", content);
  console.log("Alert removed successfully");
} else {
  console.log("Alert not found");
}

