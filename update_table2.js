const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/BookingForecastModal.tsx', 'utf8');

// 1. Rename Title
text = text.replace(
  '<h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Hierarchical Booking Forecast Matrix</h3>',
  '<h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Forecast Matrix</h3>'
);

text = text.replace(
  '<h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Hierarchical Booking Forecast \r\nMatrix</h3>',
  '<h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Forecast Matrix</h3>'
);
text = text.replace(
  '<h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Hierarchical Booking Forecast\nMatrix</h3>',
  '<h3 style={{ fontSize: 16, fontWeight: 800, color: "#323338" }}>Forecast Matrix</h3>'
);

// 2. Container overflow & maxHeight
text = text.replace(
  '<div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>',
  '<div style={{ overflow: "auto", maxHeight: "65vh", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>'
);

// 3. Thead th
text = text.replace(
  '<th style={{ padding: "16px", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 800, textTransform: "uppercase", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>',
  '<th style={{ position: "sticky", top: 0, left: 0, zIndex: 30, padding: "16px", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 800, textTransform: "uppercase", textAlign: "left", borderBottom: "2px solid #cbd5e1", borderRight: "1px solid #cbd5e1" }}>'
);
text = text.replace(
  '<th key={col.key} style={{ padding: "16px", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 800, textTransform: "uppercase", textAlign: "right", borderBottom: "2px solid #cbd5e1", minWidth: 120 }}>',
  '<th key={col.key} style={{ position: "sticky", top: 0, zIndex: 20, padding: "16px", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 800, textTransform: "uppercase", textAlign: "right", borderBottom: "2px solid #cbd5e1", minWidth: 120 }}>'
);
text = text.replace(
  '<th style={{ padding: "16px", background: "#f1f5f9", color: "#0f172a", fontSize: 12, fontWeight: 900, textTransform: "uppercase", textAlign: "right", borderBottom: "2px solid #94a3b8" }}>',
  '<th style={{ position: "sticky", top: 0, right: 0, zIndex: 30, padding: "16px", background: "#f1f5f9", color: "#0f172a", fontSize: 12, fontWeight: 900, textTransform: "uppercase", textAlign: "right", borderBottom: "2px solid #94a3b8", borderLeft: "1px solid #94a3b8" }}>'
);

// 4. Tfoot (Grand Total row)
text = text.replace(
  '<tr style={{ background: "#e2e8f0" }}>',
  '<tr style={{ position: "sticky", bottom: 0, zIndex: 25, background: "#e2e8f0" }}>'
);
text = text.replace(
  '<td style={{ padding: "16px", fontSize: 13, fontWeight: 900, color: "#0f172a", borderTop: "2px solid #cbd5e1" }}>',
  '<td style={{ position: "sticky", left: 0, zIndex: 30, background: "#e2e8f0", padding: "16px", fontSize: 13, fontWeight: 900, color: "#0f172a", borderTop: "2px solid #cbd5e1", borderRight: "1px solid #cbd5e1" }}>'
);
text = text.replace(
  '<td style={{ padding: "16px", fontSize: 14, fontWeight: 900, color: "#0f172a", textAlign: "right", borderTop: "2px solid #94a3b8", background: "#cbd5e1", fontVariantNumeric: "tabular-nums" }}>',
  '<td style={{ position: "sticky", right: 0, zIndex: 30, padding: "16px", fontSize: 14, fontWeight: 900, color: "#0f172a", textAlign: "right", borderTop: "2px solid #94a3b8", background: "#cbd5e1", fontVariantNumeric: "tabular-nums", borderLeft: "1px solid #94a3b8" }}>'
);

// 5. renderTree rows
text = text.replace(
  '<td style={{ padding: "10px 16px", fontSize: 13, fontWeight: node.level < 3 ? 800 : 700, color: node.level < 3 ? "#323338" : "#475569" }}>',
  '<td style={{ position: "sticky", left: 0, zIndex: 10, background: node.level % 2 === 1 ? "#ffffff" : "#fafafa", padding: "10px 16px", fontSize: 13, fontWeight: node.level < 3 ? 800 : 700, color: node.level < 3 ? "#323338" : "#475569", borderRight: "1px solid #cbd5e1" }}>'
);
text = text.replace(
  '<td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 900, color: "#0f172a", textAlign: "right", background: "#f8fafc", fontVariantNumeric: "tabular-nums" }}>',
  '<td style={{ position: "sticky", right: 0, zIndex: 10, padding: "10px 16px", fontSize: 13, fontWeight: 900, color: "#0f172a", textAlign: "right", background: "#f8fafc", fontVariantNumeric: "tabular-nums", borderLeft: "1px solid #cbd5e1" }}>'
);

fs.writeFileSync('src/app/admin/live-data/BookingForecastModal.tsx', text);
console.log("Updated!");
