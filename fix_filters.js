const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

if (!text.includes('function getDealFYStr')) {
  // Add getDealFYStr near the top or before LiveDataClient component
  text = text.replace('export default function LiveDataClient', 'function getDealFYStr(deal) {\n  if (deal.closed_period) return deal.closed_period;\n  const rawDate = deal.target_po_date || deal.est_booking_month;\n  if (!rawDate) return "N/A";\n  const dt = new Date(rawDate);\n  if (isNaN(dt.getTime())) return "N/A";\n  const m = dt.getMonth() + 1;\n  const y = dt.getFullYear();\n  const fy = m >= 4 ? y - 2000 : y - 1 - 2000;\n  return `FY${fy}`;\n}\n\nexport default function LiveDataClient');
}

if (!text.includes('const [pipelineFYFilter, setPipelineFYFilter] = useState("All");')) {
  text = text.replace('const [projectStateFilter, setProjectStateFilter] = useState("All");', 'const [projectStateFilter, setProjectStateFilter] = useState("All");\n  const [pipelineFYFilter, setPipelineFYFilter] = useState("All");');
}

// Add matchFY to filteredDeals
if (!text.includes('const matchFY = pipelineFYFilter === "All"')) {
  text = text.replace('const matchProjectState = projectStateFilter === "All"', 'const matchFY = pipelineFYFilter === "All" || getDealFYStr(d) === pipelineFYFilter;\n        const matchProjectState = projectStateFilter === "All"');
  text = text.replace('return matchSearch && matchStatus && matchCategory && matchSector && matchPic && matchSource && matchProjectState;', 'return matchSearch && matchStatus && matchCategory && matchSector && matchPic && matchSource && matchProjectState && matchFY;');
}

// Use getDealFYStr in the badge JSX
const badgeMatch = '                      {(() => {\r\n                        let fyDisplay = deal.closed_period;\r\n                        if (!fyDisplay) {\r\n                          const rawDate = deal.target_po_date || deal.est_booking_month;\r\n                          if (!rawDate) return null;\r\n                          const dt = new Date(rawDate);\r\n                          if (isNaN(dt.getTime())) return null;\r\n                          const m = dt.getMonth() + 1;\r\n                          const y = dt.getFullYear();\r\n                          const fy = m >= 4 ? y - 2000 : y - 1 - 2000;\r\n                          fyDisplay = `FY${fy}`;\r\n                        }\r\n                        return (\r\n                          <div style={{ marginTop: 6, fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>\r\n                            {fyDisplay}\r\n                          </div>\r\n                        );\r\n                      })()}';
const badgeMatchLF = badgeMatch.replace(/\r\n/g, '\n');

const newBadge = `                      {(() => {
                        const fyDisplay = getDealFYStr(deal);
                        if (fyDisplay === "N/A") return null;
                        return (
                          <div style={{ marginTop: 6, fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>
                            {fyDisplay}
                          </div>
                        );
                      })()}`;

if (text.includes(badgeMatch)) {
  text = text.replace(badgeMatch, newBadge);
} else if (text.includes(badgeMatchLF)) {
  text = text.replace(badgeMatchLF, newBadge);
}

// Add the FY select dropdown to the mapping
const mapMatch = '{ label: "Sector", plural: "Sectors", val: sectorFilter, set: setSectorFilter, opts: uniqueSectors as string[] },';
if (!text.includes('label: "FY"')) {
  // we also need uniqueFYs!
  if (!text.includes('const uniqueFYs')) {
    text = text.replace('const uniqueSources = Array.from(new Set(deals.map(d => d.source?.trim() || "EPL"))).sort();', 'const uniqueSources = Array.from(new Set(deals.map(d => d.source?.trim() || "EPL"))).sort();\n  const uniqueFYs = Array.from(new Set(deals.map(d => getDealFYStr(d)).filter(f => f !== "N/A"))).sort().reverse();');
  }
  
  text = text.replace(mapMatch, mapMatch + '\n              { label: "FY", plural: "FYs", val: pipelineFYFilter, set: setPipelineFYFilter, opts: uniqueFYs as string[] },');
}

fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', text);
