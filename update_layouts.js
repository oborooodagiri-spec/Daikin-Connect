const fs = require('fs');

// --- 1. ProjectByStatusModal.tsx ---
let file = 'src/app/admin/live-data/ProjectByStatusModal.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  '<div style={{ padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 40 }}>',
  '<div style={{ padding: "32px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 40 }}>'
);
text = text.replace(
  '              {/* Chart Section */}\n              <div>',
  '              {/* Chart Section */}\n              <div style={{ flex: "none" }}>'
);
text = text.replace(
  '              {/* Table Section */}\n              <div>',
  '              {/* Table Section */}\n              <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>'
);
text = text.replace(
  '<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>',
  '<div style={{ display: "flex", flex: "none", alignItems: "center", gap: 8, marginBottom: 16 }}>'
);
text = text.replace(
  '<div style={{ overflow: "auto", maxHeight: "65vh", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>',
  '<div style={{ flex: 1, overflow: "auto", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>'
);
fs.writeFileSync(file, text);

// --- 2. BookingForecastModal.tsx ---
file = 'src/app/admin/live-data/BookingForecastModal.tsx';
text = fs.readFileSync(file, 'utf8');

text = text.replace(
  '<div style={{ padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 40 }}>',
  '<div style={{ padding: "32px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 40 }}>'
);
text = text.replace(
  '              {/* Chart Section */}\n              <div>',
  '              {/* Chart Section */}\n              <div style={{ flex: "none" }}>'
);
text = text.replace(
  '              {/* Pivot Table */}\n              <div>',
  '              {/* Pivot Table */}\n              <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>'
);
text = text.replace(
  '<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>',
  '<div style={{ display: "flex", flex: "none", alignItems: "center", gap: 8, marginBottom: 16 }}>'
);
text = text.replace(
  '<div style={{ overflow: "auto", maxHeight: "65vh", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>',
  '<div style={{ flex: 1, overflow: "auto", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>'
);
fs.writeFileSync(file, text);

// --- 3. CategoryPipelineModal.tsx and StatusPipelineModal.tsx ---
const layoutFiles = ['src/app/admin/live-data/CategoryPipelineModal.tsx', 'src/app/admin/live-data/StatusPipelineModal.tsx'];
layoutFiles.forEach(f => {
  let t = fs.readFileSync(f, 'utf8');
  t = t.replace(
    '<div style={{ flex: 1, overflow: "auto", padding: 32, background: "#ffffff" }}>',
    '<div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 32, gap: 32, background: "#ffffff" }}>'
  );
  t = t.replace(
    '<div style={{ marginBottom: 32, padding: 24, background: "#f8fafc", borderRadius: 20, border: "1px solid #e2e8f0" }}>',
    '<div style={{ flex: "none", padding: 24, background: "#f8fafc", borderRadius: 20, border: "1px solid #e2e8f0" }}>'
  );
  t = t.replace(
    '<div style={{ background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>',
    '<div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "white", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>'
  );
  t = t.replace(
    '<div style={{ overflow: "auto", maxHeight: "65vh" }}>',
    '<div style={{ flex: 1, overflow: "auto" }}>'
  );
  fs.writeFileSync(f, t);
});

console.log("Updated all layouts!");
