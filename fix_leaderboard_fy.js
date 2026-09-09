const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

const regex = /let isCurrentFY = false;\s*const rawDate = d\.target_po_date \|\| d\.est_booking_month;\s*if \(rawDate\) \{\s*const dt = new Date\(rawDate\);\s*if \(!isNaN\(dt\.getTime\(\)\)\) \{\s*const m = dt\.getMonth\(\) \+ 1;\s*const y = dt\.getFullYear\(\);\s*const fy = m >= 4 \? y - 2000 : y - 1 - 2000;\s*if \(fy === selectedFY\) isCurrentFY = true;\s*\}\s*\}/g;

const replacement = `let isCurrentFY = getDealFYStr(d) === "FY" + selectedFY;`;

if (regex.test(text)) {
  text = text.replace(regex, replacement);
  fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', text);
  console.log('Replaced successfully');
} else {
  console.log('Regex did not match!');
}
