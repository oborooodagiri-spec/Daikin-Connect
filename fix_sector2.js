const fs = require('fs');
const newExportSectorMatrix = \export const exportSectorMatrix = async (deals: any[], fy: number, sectorName: string, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(\\\Pipeline By \\\\);
  const columns = getFYMonths(fy);
  setupMatrixSheet(worksheet, \\\Pipeline By \ - FY\\\\, columns);

  type TreeNode = {
    name: string;
    values: Record<string, number>;
    total: number;
    children: Record<string, TreeNode>;
  };

  const root: TreeNode = { name: "Root", values: {}, total: 0, children: {} };

  deals.forEach(d => {
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    if (!rawDate) return;
    const dt = new Date(rawDate);
    if (isNaN(dt.getTime())) return;
    const mYear = dt.getFullYear();
    const mStr = dt.toLocaleString("default", { month: "short" }).toUpperCase();
    const sortKey = \\\\-\ \ \\\\;
    
    if (!columns.find(c => c.key === sortKey)) return;
    
    const val = Number(d.quotation || 0);

    const path = [
      d.sector || "Others",
      d.pic || "Unassigned",
      d.status || "Unknown Status",
      \\\   - \ \\\\n(\)\\\
    ];

    let currentLevel = root.children;
    path.forEach((p, idx) => {
      if (!currentLevel[p]) {
        currentLevel[p] = { name: p, values: {}, total: 0, children: {} };
      }
      currentLevel[p].values[sortKey] = (currentLevel[p].values[sortKey] || 0) + val;
      currentLevel[p].total += val;
      if (idx < path.length - 1) {
        currentLevel = currentLevel[p].children;
      }
    });
  });

  const writeNode = (node: TreeNode, level: number) => {
    const rowValues = [node.name];
    let rowTotal = 0;
    columns.forEach(col => {
      const val = node.values[col.key] || 0;
      rowValues.push(val as any);
      rowTotal += val;
    });
    rowValues.push(rowTotal as any);

    const row = worksheet.addRow(rowValues);
    row.outlineLevel = level;
    
    row.getCell(1).font = { 
      bold: level < 3, 
      color: { argb: level === 0 ? "FF0F172A" : level === 1 ? "FF334155" : "FF64748B" },
      size: level === 3 ? 9 : 10
    };

    if (level === 3) {
      row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
      row.getCell(1).value = node.name;
    } else {
      row.getCell(1).alignment = { vertical: "middle" };
      row.getCell(1).value = "   ".repeat(level) + (level > 0 ? (level === 1 ? "? " : "  ") : "") + node.name;
    }

    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\\\(#,##0\\\\);_("Rp"* "-"_);_(@_)';
        cell.alignment = { horizontal: "right", vertical: "middle" };
        if (cell.value === 0) { cell.value = level === 3 ? "" : "-"; cell.alignment = { horizontal: "center" }; }
      }
      cell.border = { bottom: { style: level === 3 ? "dotted" : "thin", color: { argb: "FFF1F5F9" } } };
    });

    Object.values(node.children).sort((a, b) => b.total - a.total).forEach(child => writeNode(child, level + 1));
  };

  const sectors = Object.keys(root.children).sort();
  sectors.forEach(sec => {
    writeNode(root.children[sec], 0);
  });

  const totalValues = ["GRAND TOTAL"];
  let gTotal = 0;
  columns.forEach(col => {
    const sum = sectors.reduce((acc, sec) => acc + (root.children[sec]?.values[col.key] || 0), 0);
    totalValues.push(sum as any);
    gTotal += sum;
  });
  totalValues.push(gTotal as any);
  
  const tRow = worksheet.addRow(totalValues);
  tRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    if (colNumber > 1) {
      cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\\\(#,##0\\\\);_("Rp"* "-"_);_(@_)';
      cell.alignment = { horizontal: "right", vertical: "middle" };
      if (cell.value === 0) { cell.value = "-"; cell.alignment = { horizontal: "center" }; }
    }
  });

  await downloadBuffer(workbook, filename);
};\;

const content = fs.readFileSync('src/lib/excelExport.ts', 'utf8');
const startStr = 'export const exportSectorMatrix = async';
const endStr = 'export const exportHierarchyTree';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newContent = content.substring(0, startIdx) + newExportSectorMatrix + '\\n\\n' + content.substring(endIdx);
  fs.writeFileSync('src/lib/excelExport.ts', newContent);
  console.log('Success!');
} else {
  console.log('Failed to find markers.');
}
