
const fs = require("fs");
let content = fs.readFileSync("src/lib/excelExport.ts", "utf8");

// ==========================================
// 1. Fix exportCategoryMatrix (Pipeline)
// ==========================================
const catWriteNodeOld = `    Object.values(node.children).sort((a, b) => b.total - a.total).forEach(child => writeNode(child, level + 1));
  };

  const categories = ["EPL", "RC", "IAQ", "Control", "VES", "Others"].filter(c => root.children[c]);
  categories.forEach(cat => {
    writeNode(root.children[cat], 0);
  });
  Object.keys(root.children).forEach(cat => {
    if (!categories.includes(cat)) {
      writeNode(root.children[cat], 0);
    }
  });`;

const catWriteNodeNew = `    Object.values(node.children).sort((a, b) => {
      if (level === 0) {
        return a.name.localeCompare(b.name);
      } else if (level === 1) {
        const order = ["EPL", "RC", "IAQ", "Control", "VES", "Others"];
        const idxA = order.indexOf(a.name);
        const idxB = order.indexOf(b.name);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.name.localeCompare(b.name);
      }
      return b.total - a.total;
    }).forEach(child => writeNode(child, level + 1));
  };

  const statuses = Object.keys(root.children).sort();
  statuses.forEach(st => {
    writeNode(root.children[st], 0);
  });`;

content = content.replace(catWriteNodeOld, catWriteNodeNew);

// ==========================================
// 2. Fix exportSectorMatrix (Industry/Commercial)
// ==========================================
const secWriteNodeOld = `    Object.values(node.children).sort((a, b) => b.total - a.total).forEach(child => writeNode(child, level + 1));
  };

  const sectors = Object.keys(root.children).sort();
  sectors.forEach(sec => {
    writeNode(root.children[sec], 0);
  });`;

const secWriteNodeNew = `    Object.values(node.children).sort((a, b) => {
      if (level === 0) {
        return a.name.localeCompare(b.name);
      } else if (level === 1) {
        const order = ["EPL", "RC", "IAQ", "Control", "VES", "Others"];
        const idxA = order.indexOf(a.name);
        const idxB = order.indexOf(b.name);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.name.localeCompare(b.name);
      }
      return b.total - a.total;
    }).forEach(child => writeNode(child, level + 1));
  };

  const statuses = Object.keys(root.children).sort();
  statuses.forEach(st => {
    writeNode(root.children[st], 0);
  });`;

content = content.replace(secWriteNodeOld, secWriteNodeNew);

fs.writeFileSync("src/lib/excelExport.ts", content);
console.log("Sort updated.");

