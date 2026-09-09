
const fs = require("fs");

function processGroup1(file) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(/padding: "0 32px 0 32px"/g, `padding: 0`);
  content = content.replace(/<div style=\{\{ marginTop: 32 \}\}>/g, `<div style={{ marginTop: 32, padding: "0 32px" }}>`);
  content = content.replace(/<div style=\{\{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 \}\}>/g, `<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "0 32px" }}>`);
  content = content.replace(/<div style=\{\{ flex: 1, minWidth: "max-content", overflow: "visible", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba\\(0,0,0,0\\.03\\)" \}\}>/g, `<div style={{ flex: 1, minWidth: "max-content", overflow: "visible", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>`);
  fs.writeFileSync(file, content);
}

function processGroup2(file) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(/padding: "0 32px 0 32px"/g, `padding: 0`);
  content = content.replace(/<div style=\{\{ marginTop: 32, flex: "none", padding: 24, background: "#f8fafc", borderRadius: 20, border: "1px solid #e2e8f0" \}\}>/g, `<div style={{ margin: "32px 32px 0 32px", flex: "none", padding: 24, background: "#f8fafc", borderRadius: 20, border: "1px solid #e2e8f0" }}>`);
  content = content.replace(/<div style=\{\{ flex: 1, minWidth: "max-content", minHeight: 400, display: "flex", flexDirection: "column", background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "visible", marginBottom: 32, boxShadow: "0 4px 6px -1px rgba\\(0,0,0,0\\.05\\)" \}\}>/g, `<div style={{ flex: 1, minWidth: "max-content", minHeight: 400, display: "flex", flexDirection: "column", background: "white", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", overflow: "visible", marginBottom: 32 }}>`);
  content = content.replace(/borderRadius: "0 0 0 20px", /g, ``);
  content = content.replace(/borderRadius: "0 0 20px 0", /g, ``);
  fs.writeFileSync(file, content);
}

processGroup1("src/app/admin/live-data/ProjectByStatusModal.tsx");
processGroup1("src/app/admin/live-data/BookingForecastModal.tsx");
processGroup2("src/app/admin/live-data/CategoryPipelineModal.tsx");
processGroup2("src/app/admin/live-data/SectorPipelineModal.tsx");
processGroup2("src/app/admin/live-data/StatusPipelineModal.tsx");
console.log("Done");

