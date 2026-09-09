const fs = require('fs');

const files = [
  'src/app/admin/live-data/SectorPipelineModal.tsx',
  'src/app/admin/live-data/StatusPipelineModal.tsx',
  'src/app/admin/live-data/CategoryPipelineModal.tsx',
  'src/app/admin/live-data/BookingForecastModal.tsx',
  'src/app/admin/live-data/ProjectByStatusModal.tsx'
];

files.forEach(f => {
  let t = fs.readFileSync(f, 'utf8');

  // Fix Modal Body
  t = t.replace(
    'flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 32, gap: 32, background: "#ffffff"',
    'flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: 32, gap: 32, background: "#ffffff"'
  );
  t = t.replace(
    'padding: "32px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 40',
    'padding: "32px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 40'
  );

  // Fix Table Wrapper minHeight
  t = t.replace(
    'flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "white", borderRadius: 20',
    'flex: 1, minHeight: 400, display: "flex", flexDirection: "column", background: "white", borderRadius: 20'
  );
  t = t.replace(
    'flex: 1, minHeight: 0, display: "flex", flexDirection: "column"',
    'flex: 1, minHeight: 400, display: "flex", flexDirection: "column"'
  );

  fs.writeFileSync(f, t);
  console.log("Updated " + f);
});
