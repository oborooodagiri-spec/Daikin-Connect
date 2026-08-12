const fs = require('fs');
const files = [
  'src/app/admin/live-data/CategoryPipelineModal.tsx',
  'src/app/admin/live-data/SectorPipelineModal.tsx',
  'src/app/admin/live-data/StatusPipelineModal.tsx',
  'src/app/admin/live-data/ProjectByStatusModal.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /subtitle:\s*d\.project_name\s*\|\|\s*"Unknown Project"/g,
    'subtitle: (d.is_closed ? "🔴 [CLOSED] " : "") + (d.project_name || "Unknown Project")'
  );
  fs.writeFileSync(file, content, 'utf8');
});
