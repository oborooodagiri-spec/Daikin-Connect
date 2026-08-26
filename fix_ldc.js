const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

const search1 = '        let isCurrentFY = false;\r\n        const rawDate = d.target_po_date || d.est_booking_month;\r\n        if (rawDate) {\r\n          const dt = new Date(rawDate);\r\n          if (!isNaN(dt.getTime())) {\r\n            const m = dt.getMonth() + 1;\r\n            const y = dt.getFullYear();\r\n            const fy = m >= 4 ? y - 2000 : y - 1 - 2000;\r\n            if (fy === selectedFY) isCurrentFY = true;\r\n          }\r\n        }';

const replace1 = '        let isCurrentFY = false;\r\n        if (d.closed_period) {\r\n          if (d.closed_period === FY) isCurrentFY = true;\r\n        } else {\r\n          const rawDate = d.target_po_date || d.est_booking_month;\r\n          if (rawDate) {\r\n            const dt = new Date(rawDate);\r\n            if (!isNaN(dt.getTime())) {\r\n              const m = dt.getMonth() + 1;\r\n              const y = dt.getFullYear();\r\n              const fy = m >= 4 ? y - 2000 : y - 1 - 2000;\r\n              if (fy === selectedFY) isCurrentFY = true;\r\n            }\r\n          }\r\n        }';

const search1_lf = search1.replace(/\r\n/g, '\n');
const replace1_lf = replace1.replace(/\r\n/g, '\n');

if (text.includes(search1)) {
  text = text.replace(search1, replace1);
} else if (text.includes(search1_lf)) {
  text = text.replace(search1_lf, replace1_lf);
}

const search2 = '                      {(() => {\r\n                        const rawDate = deal.target_po_date || deal.est_booking_month;\r\n                        if (!rawDate) return null;\r\n                        const dt = new Date(rawDate);\r\n                        if (isNaN(dt.getTime())) return null;\r\n                        const m = dt.getMonth() + 1;\r\n                        const y = dt.getFullYear();\r\n                        const fy = m >= 4 ? y - 2000 : y - 1 - 2000;\r\n                        return (\r\n                          <div style={{ marginTop: 6, fontSize: 10, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.05em' }}>\r\n                            FY{fy}\r\n                          </div>\r\n                        );\r\n                      })()}';

const replace2 = '                      {(() => {\r\n                        let fyDisplay = deal.closed_period;\r\n                        if (!fyDisplay) {\r\n                          const rawDate = deal.target_po_date || deal.est_booking_month;\r\n                          if (!rawDate) return null;\r\n                          const dt = new Date(rawDate);\r\n                          if (isNaN(dt.getTime())) return null;\r\n                          const m = dt.getMonth() + 1;\r\n                          const y = dt.getFullYear();\r\n                          const fy = m >= 4 ? y - 2000 : y - 1 - 2000;\r\n                          fyDisplay = FY;\r\n                        }\r\n                        return (\r\n                          <div style={{ marginTop: 6, fontSize: 10, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.05em' }}>\r\n                            {fyDisplay}\r\n                          </div>\r\n                        );\r\n                      })()}';

const search2_lf = search2.replace(/\r\n/g, '\n');
const replace2_lf = replace2.replace(/\r\n/g, '\n');

if (text.includes(search2)) {
  text = text.replace(search2, replace2);
} else if (text.includes(search2_lf)) {
  text = text.replace(search2_lf, replace2_lf);
}

fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', text);

