const fs = require('fs');

function run() {
  const content = fs.readFileSync('scratch/spreadsheet.csv', 'utf8');
  const lines = content.split('\n');
  console.log("Total Lines:", lines.length);

  // Let's print the first 50 lines to inspect row headers
  for (let i = 0; i < Math.min(80, lines.length); i++) {
    const cols = lines[i].split(',').map(c => c.trim()).filter(Boolean);
    if (cols.length > 0) {
      console.log(`Line ${i+1}:`, cols.slice(0, 8).join(' | '));
    }
  }
}

run();
