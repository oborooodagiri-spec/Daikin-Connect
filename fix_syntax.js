const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/DealFormModal.tsx', 'utf8');

text = text.replace('target_po_reason: "",
              closed_period: deal?.closed_period || "",', 'target_po_reason: "",\n            closed_period: deal?.closed_period || "",');
text = text.replace('area: formData.area || null,
          closed_period: formData.closed_period || null', 'area: formData.area || null,\n          closed_period: formData.closed_period || null');

fs.writeFileSync('src/app/admin/live-data/DealFormModal.tsx', text);
