const fs = require('fs');
let file = 'src/app/admin/live-data/SectorPipelineModal.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  '<div style={{ flex: 1, overflow: "auto", padding: 32, background: "#ffffff" }}>',
  '<div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 32, gap: 32, background: "#ffffff" }}>'
);
text = text.replace(
  '<div style={{ marginBottom: 32, padding: 24, background: "#f8fafc", borderRadius: 20, border: "1px solid #e2e8f0" }}>',
  '<div style={{ flex: "none", padding: 24, background: "#f8fafc", borderRadius: 20, border: "1px solid #e2e8f0" }}>'
);
text = text.replace(
  '<div style={{ background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>',
  '<div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>'
);
text = text.replace(
  '<div style={{ overflow: "auto", maxHeight: "65vh" }}>',
  '<div style={{ flex: 1, overflow: "auto" }}>'
);

fs.writeFileSync(file, text);
console.log("Updated!");
