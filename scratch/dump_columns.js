const fs = require('fs');

function run() {
  const content = fs.readFileSync('scratch/spreadsheet.csv', 'utf8');
  const lines = content.split('\n');
  
  // The sheet seems to have 4 logical pages. Let's trace how many columns each page has, or how they are separated.
  // Let's print out rows and look at row content.
  console.log("Analyzing spreadsheet columns...");
  lines.forEach((line, idx) => {
    const parts = [];
    let currentPart = "";
    let insideQuotes = false;
    for (let char of line) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        parts.push(currentPart.trim());
        currentPart = "";
      } else {
        currentPart += char;
      }
    }
    parts.push(currentPart.trim());

    if (parts.some(Boolean)) {
      console.log(`Row ${String(idx+1).padStart(2)}: len=${parts.length} | ${parts.slice(0, 10).map(p => p || '-').join(' | ')}`);
    }
  });
}

run();
