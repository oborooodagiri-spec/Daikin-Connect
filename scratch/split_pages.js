const fs = require('fs');

function run() {
  const content = fs.readFileSync('scratch/spreadsheet.csv', 'utf8');
  const lines = content.split('\n');

  // Let's parse each line into columns properly handling quotes
  const rows = lines.map(line => {
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
    return parts;
  });

  // We have 4 pages. Let's look at their column spans.
  // Let's print out what is inside columns for each page
  console.log("=== PAGE 1 (Chiller, CHWP, Main Line) ===");
  for (let i = 0; i < 48; i++) {
    const r = rows[i];
    if (!r) continue;
    // Page 1 is roughly columns 0 to 13
    const p1 = r.slice(0, 14).map(p => p || '-').join(' | ');
    if (p1.replace(/[|\-\s]/g, '').length > 0) {
      console.log(`Row ${i+1}: ${p1}`);
    }
  }

  console.log("\n=== PAGE 2 (AHU Simulator) ===");
  for (let i = 0; i < 48; i++) {
    const r = rows[i];
    if (!r) continue;
    // Page 2 is roughly columns 14 to 25
    const p2 = r.slice(14, 26).map(p => p || '-').join(' | ');
    if (p2.replace(/[|\-\s]/g, '').length > 0) {
      console.log(`Row ${i+1}: ${p2}`);
    }
  }

  console.log("\n=== PAGE 3 (AHU Corridor, CRAC, Genset, PLN) ===");
  for (let i = 0; i < 48; i++) {
    const r = rows[i];
    if (!r) continue;
    // Page 3 is roughly columns 26 to 37
    const p3 = r.slice(26, 38).map(p => p || '-').join(' | ');
    if (p3.replace(/[|\-\s]/g, '').length > 0) {
      console.log(`Row ${i+1}: ${p3}`);
    }
  }

  console.log("\n=== PAGE 4 (FCU GF & 1st Floor) ===");
  for (let i = 0; i < 59; i++) {
    const r = rows[i];
    if (!r) continue;
    // Page 4 is roughly columns 38 onwards
    const p4 = r.slice(38).map(p => p || '-').join(' | ');
    if (p4.replace(/[|\-\s]/g, '').length > 0) {
      console.log(`Row ${i+1}: ${p4}`);
    }
  }
}

run();
