const fs = require('fs');

const files = [
  'src/app/admin/live-data/SectorPipelineModal.tsx',
  'src/app/admin/live-data/CategoryPipelineModal.tsx'
];

files.forEach(file => {
  let text = fs.readFileSync(file, 'utf8');

  // Container
  text = text.replace(
    '<div style={{ overflowX: "auto" }}>',
    '<div style={{ overflow: "auto", maxHeight: "65vh" }}>'
  );

  // Thead (Note: SectorPipelineModal has {viewMode === "status" ? "Status" : "Category"} inside the th, CategoryPipelineModal has Category)
  // We can just replace the opening th tag because they all match exactly.
  text = text.replace(
    '<th style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontSize: 13, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", position: "sticky", left: 0, zIndex: 10 }}>',
    '<th style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontSize: 13, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", position: "sticky", top: 0, left: 0, zIndex: 30, borderRight: "1px solid #e2e8f0" }}>'
  );
  text = text.replace(
    '<th key={col.key} style={{ padding: "16px 12px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 120 }}>',
    '<th key={col.key} style={{ position: "sticky", top: 0, zIndex: 20, padding: "16px 12px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 120 }}>'
  );
  text = text.replace(
    '<th style={{ padding: "16px 24px", background: "#f1f5f9", borderBottom: "2px solid #e2e8f0", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>',
    '<th style={{ padding: "16px 24px", background: "#f1f5f9", borderBottom: "2px solid #e2e8f0", textAlign: "right", fontSize: 13, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", position: "sticky", top: 0, right: 0, zIndex: 30, borderLeft: "1px solid #e2e8f0" }}>'
  );

  // Tfoot
  text = text.replace(
    '<td style={{ padding: "20px 24px", background: "#0f172a", color: "white", fontWeight: 800, position: "sticky", left: 0, zIndex: 10, borderRadius: "0 0 0 20px" }}>',
    '<td style={{ padding: "20px 24px", background: "#0f172a", color: "white", fontWeight: 800, position: "sticky", bottom: 0, left: 0, zIndex: 30, borderRadius: "0 0 0 20px", borderTop: "2px solid #334155", borderRight: "1px solid #334155" }}>'
  );
  text = text.replace(
    '<td key={col.key} style={{ padding: "20px 12px", background: "#0f172a", color: "white", textAlign: "right", fontWeight: 700, fontSize: 13 }}>',
    '<td key={col.key} style={{ position: "sticky", bottom: 0, zIndex: 25, padding: "20px 12px", background: "#0f172a", color: "white", textAlign: "right", fontWeight: 700, fontSize: 13, borderTop: "2px solid #334155" }}>'
  );
  text = text.replace(
    '<td style={{ padding: "20px 24px", background: color, color: "white", textAlign: "right", fontWeight: 800, fontSize: 15, borderRadius: "0 0 20px 0" }}>',
    '<td style={{ position: "sticky", bottom: 0, right: 0, zIndex: 30, padding: "20px 24px", background: color, color: "white", textAlign: "right", fontWeight: 800, fontSize: 15, borderRadius: "0 0 20px 0", borderTop: "2px solid rgba(0,0,0,0.1)", borderLeft: "1px solid rgba(0,0,0,0.1)" }}>'
  );

  // renderTree Row td Left
  text = text.replace(
    '<td style={{ padding: "10px 16px", fontSize: 13, fontWeight: node.level < 3 ? 800 : 500, color: node.level < 3 ? "#323338" : "#475569", borderRight: "1px solid #f1f5f9" }}>',
    '<td style={{ position: "sticky", left: 0, zIndex: 10, background: node.level % 2 === 1 ? "#ffffff" : "#fafafa", padding: "10px 16px", fontSize: 13, fontWeight: node.level < 3 ? 800 : 500, color: node.level < 3 ? "#323338" : "#475569", borderRight: "1px solid #e2e8f0" }}>'
  );

  // renderTree Row td Right
  text = text.replace(
    '<td style={{ padding: "10px 24px", fontSize: 13, fontWeight: 900, color: "#0f172a", textAlign: "right", background: "#f8fafc" }}>',
    '<td style={{ position: "sticky", right: 0, zIndex: 10, padding: "10px 24px", fontSize: 13, fontWeight: 900, color: "#0f172a", textAlign: "right", background: "#f8fafc", borderLeft: "1px solid #e2e8f0" }}>'
  );

  fs.writeFileSync(file, text);
  console.log("Updated " + file);
});
