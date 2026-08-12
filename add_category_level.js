const fs = require('fs');

const filesToUpdate = [
  'src/app/admin/live-data/ProjectByStatusModal.tsx',
  'src/app/admin/live-data/BookingForecastModal.tsx',
  'src/app/admin/live-data/StatusPipelineModal.tsx',
  'src/app/admin/live-data/SectorPipelineModal.tsx'
];

filesToUpdate.forEach(f => {
  let data = fs.readFileSync(f, 'utf8');
  // Replaces the line containing "key: d.id.toString()," inside the path array
  data = data.replace(
    /\{\s*key:\s*d\.id\.toString\(\)/g,
    '{ key: d.category || "Uncategorized", name: d.category || "Uncategorized" },\n        { key: d.id.toString()'
  );
  fs.writeFileSync(f, data);
});

// Update Pipeline card to use StatusPipelineModal in LiveDataClient.tsx
let liveData = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');
liveData = liveData.replace(
  /onClick:\s*\(\)\s*=>\s*setCategoryModalState\(\{\s*isOpen:\s*true,\s*categoryName:\s*"Pipeline",\s*color:\s*"#f59e0b",\s*deals:\s*pipelineModalDeals\s*\}\)/g,
  'onClick: () => setStatusModalState({ isOpen: true, statusName: "Pipeline", color: "#f59e0b", deals: pipelineModalDeals })'
);
fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', liveData);

console.log("Updated categories successfully!");
