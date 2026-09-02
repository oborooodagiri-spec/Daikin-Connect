import ExcelJS from 'exceljs';

const getFYMonths = (fy: number) => {
  const months = [];
  const startYear = 2000 + fy;
  for (let i = 3; i < 15; i++) {
    const d = new Date(startYear, i, 1);
    const mYear = d.getFullYear();
    const mStr = d.toLocaleString('default', { month: 'short' }).toUpperCase();
    months.push({
      key: `${mYear}-${String(d.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`,
      label: `${mStr} ${mYear}`
    });
  }
  return months;
};

const getExcelColName = (colIndex: number) => {
  let name = '';
  let index = colIndex;
  while (index > 0) {
    let mod = (index - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    index = Math.floor((index - mod) / 26);
  }
  return name;
};

const setupMatrixSheet = (worksheet: ExcelJS.Worksheet, title: string, columns: any[]) => {
  worksheet.views = [{ state: 'frozen', ySplit: 5 }];
  
  const lastColName = getExcelColName(columns.length + 2);
  
  worksheet.mergeCells(`A1:${lastColName}1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title.toUpperCase();
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF000000' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  worksheet.mergeCells(`A2:${lastColName}2`);
  const dateCell = worksheet.getCell('A2');
  const now = new Date();
  dateCell.value = `Generated on: ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB')}`;
  dateCell.font = { size: 10, italic: true, color: { argb: 'FF666666' } };
  dateCell.alignment = { vertical: 'middle', horizontal: 'left' };

  worksheet.addRow([]);
  
  const headerRow = worksheet.addRow(['ROW LABELS', ...columns.map(c => c.label), 'TOTAL']);
  headerRow.height = 30;
  
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FF334155' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center' };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
    worksheet.getColumn(colNumber).width = colNumber === 1 ? 40 : 20;
  });
};

const downloadBuffer = async (workbook: ExcelJS.Workbook, filename: string) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

export const exportProjectByStatusMatrix = async (deals: any[], fy: number, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Project By Status');
  
  let minTime = Infinity;
  let maxTime = -Infinity;
  const validDeals = deals.filter(d => {
    if (['L', 'H', 'T'].includes(d.status)) return false;
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    if (!rawDate) return false;
    const dt = new Date(rawDate);
    if (isNaN(dt.getTime())) return false;
    return true;
  });

  validDeals.forEach(d => {
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    const dt = new Date(rawDate);
    const t = dt.getTime();
    if (t < minTime) minTime = t;
    if (t > maxTime) maxTime = t;
  });

  if (minTime === Infinity) {
    minTime = new Date().getTime();
    maxTime = new Date().getTime();
  }

  const columns: { key: string; label: string }[] = [];
  const minDate = new Date(minTime);
  const maxDate = new Date(maxTime);

  let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  let safetyCounter = 0;
  while (current <= end && safetyCounter < 72) { // up to 6 years range safety
    const mYear = current.getFullYear();
    const mStr = current.toLocaleString('default', { month: 'short' }).toUpperCase();
    const key = `${mYear}-${String(current.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
    columns.push({ key, label: `${mStr} ${mYear}` });
    current.setMonth(current.getMonth() + 1);
    safetyCounter++;
  }

  setupMatrixSheet(worksheet, `Project By Status Analytics - FY${fy}`, columns);

  type TreeNode = {
    name: string;
    values: Record<string, number>;
    total: number;
    children: Record<string, TreeNode>;
  };

  const root: TreeNode = { name: "Root", values: {}, total: 0, children: {} };

  validDeals.forEach(d => {
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    const dt = new Date(rawDate);
    const mYear = dt.getFullYear();
    const mStr = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
    const sortKey = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
    
    if (!columns.find(c => c.key === sortKey)) return;
    
    const val = Number(d.quotation || 0);

    const path = [
      d.status || "Unknown Status",
      d.pic || "Unassigned",
      d.category || "Uncategorized",
      `${d.client_name || "Unknown Customer"} \n(${d.project_name || "Unknown Project"})`
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
      color: { argb: level === 0 ? 'FF0F172A' : level === 1 ? 'FF334155' : 'FF64748B' },
      size: level === 3 ? 9 : 10
    };

    if (level === 3) {
      row.getCell(1).alignment = { wrapText: true, vertical: 'middle' };
      row.getCell(1).value = `      - ${node.name}`;
    } else {
      row.getCell(1).alignment = { vertical: 'middle' };
      row.getCell(1).value = "   ".repeat(level) + (level > 0 ? (level === 1 ? "\u25BE " : "  ") : "") + node.name;
    }

    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (cell.value === 0) { cell.value = level === 3 ? '' : '-'; cell.alignment = { horizontal: 'center' }; }
      }
      cell.border = { bottom: { style: level === 3 ? 'dotted' : 'thin', color: { argb: 'FFF1F5F9' } } };
    });

    Object.values(node.children).sort((a, b) => b.total - a.total).forEach(child => writeNode(child, level + 1));
  };

  const relevantStatuses = ["A", "B", "C", "D", "E"];
  relevantStatuses.forEach(s => {
    if (root.children[s]) {
      writeNode(root.children[s], 0);
    }
  });

  const totalValues = ['GRAND TOTAL'];
  let gTotal = 0;
  columns.forEach(col => {
    const sum = relevantStatuses.reduce((acc, s) => acc + (root.children[s]?.values[col.key] || 0), 0);
    totalValues.push(sum as any);
    gTotal += sum;
  });
  totalValues.push(gTotal as any);
  const tRow = worksheet.addRow(totalValues);
  tRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    if (colNumber > 1) {
      cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      if (cell.value === 0) { cell.value = '-'; cell.alignment = { horizontal: 'center' }; }
    }
  });

  await downloadBuffer(workbook, filename);
};

export const exportCategoryMatrix = async (deals: any[], fy: number, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Pipeline By Category');
  const columns = getFYMonths(fy);
  setupMatrixSheet(worksheet, `Pipeline By Category - FY${fy}`, columns);

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
    const mStr = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
    const sortKey = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
    
    if (!columns.find(c => c.key === sortKey)) return;
    
    const val = Number(d.quotation || 0);

    const allowedStatuses = ["C", "D", "E"];
    if (!allowedStatuses.includes(d.status)) return;

    const path = [
      d.status || "Unknown Status",
      d.pic || "Unassigned",
      d.category || "Others",
      `   - ${d.client_name || "Unknown Customer"} \n(${d.project_name || "Unknown Project"})`
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
      color: { argb: level === 0 ? 'FF0F172A' : level === 1 ? 'FF334155' : 'FF64748B' },
      size: level === 3 ? 9 : 10
    };

    if (level === 3) {
      row.getCell(1).alignment = { wrapText: true, vertical: 'middle' };
      row.getCell(1).value = node.name; // name already has the spacing
    } else {
      row.getCell(1).alignment = { vertical: 'middle' };
      row.getCell(1).value = "   ".repeat(level) + (level > 0 ? (level === 1 ? "\u25BE " : "  ") : "") + node.name;
    }

    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (cell.value === 0) { cell.value = level === 3 ? '' : '-'; cell.alignment = { horizontal: 'center' }; }
      }
      cell.border = { bottom: { style: level === 3 ? 'dotted' : 'thin', color: { argb: 'FFF1F5F9' } } };
    });

    Object.values(node.children).sort((a, b) => {
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
  });

  const totalValues = ['GRAND TOTAL'];
  let gTotal = 0;
  columns.forEach(col => {
    const sum = Object.keys(root.children).reduce((acc, cat) => acc + (root.children[cat]?.values[col.key] || 0), 0);
    totalValues.push(sum as any);
    gTotal += sum;
  });
  totalValues.push(gTotal as any);
  
  const tRow = worksheet.addRow(totalValues);
  tRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    if (colNumber > 1) {
      cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      if (cell.value === 0) { cell.value = '-'; cell.alignment = { horizontal: 'center' }; }
    }
  });

  await downloadBuffer(workbook, filename);
};


export const exportSectorMatrix = async (deals: any[], fy: number, sectorName: string, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Pipeline By ${sectorName}`);
  const columns = getFYMonths(fy);
  setupMatrixSheet(worksheet, `Pipeline By ${sectorName} - FY${fy}`, columns);

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
    const sortKey = `${mYear}-${String(dt.getMonth() + 1).padStart(2, "0")} ${mStr} ${mYear}`;
    
    if (!columns.find(c => c.key === sortKey)) return;
    
    const val = Number(d.quotation || 0);

    const allowedStatuses = ["A", "B", "C", "D", "E"];
    if (!allowedStatuses.includes(d.status)) return;

    const path = [
      d.status || "Unknown Status",
      d.pic || "Unassigned",
      d.category || "Others",
      `   - ${d.client_name || "Unknown Customer"} \n(${d.project_name || "Unknown Project"})`
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
      row.getCell(1).value = "   ".repeat(level) + (level > 0 ? (level === 1 ? "\u25BE " : "  ") : "") + node.name;
    }

    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = "_(\"Rp\"* #,##0_);_(\"Rp\"* \\(#,##0\\);_(\"Rp\"* \"-\"_);_(@_)";
        cell.alignment = { horizontal: "right", vertical: "middle" };
        if (cell.value === 0) { cell.value = level === 3 ? "" : "-"; cell.alignment = { horizontal: "center" }; }
      }
      cell.border = { bottom: { style: level === 3 ? "dotted" : "thin", color: { argb: "FFF1F5F9" } } };
    });

    Object.values(node.children).sort((a, b) => {
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
  });

  const totalValues = ["GRAND TOTAL"];
  let gTotal = 0;
  columns.forEach(col => {
    const sum = statuses.reduce((acc, sec) => acc + (root.children[sec]?.values[col.key] || 0), 0);
    totalValues.push(sum as any);
    gTotal += sum;
  });
  totalValues.push(gTotal as any);
  
  const tRow = worksheet.addRow(totalValues);
  tRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    if (colNumber > 1) {
      cell.numFmt = "_(\"Rp\"* #,##0_);_(\"Rp\"* \\(#,##0\\);_(\"Rp\"* \"-\"_);_(@_)";
      cell.alignment = { horizontal: "right", vertical: "middle" };
      if (cell.value === 0) { cell.value = "-"; cell.alignment = { horizontal: "center" }; }
    }
  });

  await downloadBuffer(workbook, filename);
};

export const exportHierarchyTree = async (deals: any[], title: string, filename: string, isAchievement = false) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tree Report');
  worksheet.views = [{ state: 'frozen', ySplit: 5 }];

  worksheet.mergeCells(`A1:D1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title.toUpperCase();
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF000000' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  worksheet.mergeCells(`A2:D2`);
  const dateCell = worksheet.getCell('A2');
  const now = new Date();
  dateCell.value = `Generated on: ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB')}`;
  dateCell.font = { size: 10, italic: true, color: { argb: 'FF666666' } };
  dateCell.alignment = { vertical: 'middle', horizontal: 'left' };

  worksheet.addRow([]);
  
  const headerRow = worksheet.addRow(['HIERARCHY', 'PROJECT / CLIENT', isAchievement ? 'PO DATE' : 'TARGET MONTH', 'QUOTATION']);
  headerRow.height = 30;
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FF334155' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    cell.alignment = { vertical: 'middle', horizontal: colNumber === 4 ? 'right' : 'left' };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
  });

  worksheet.getColumn(1).width = 30;
  worksheet.getColumn(2).width = 45;
  worksheet.getColumn(3).width = 20;
  worksheet.getColumn(4).width = 25;

  const regionMap: Record<string, Record<string, any[]>> = {};
  deals.forEach(d => {
    const region = d.region || 'Unknown Region';
    const pic = d.pic || 'Unassigned';
    if (!regionMap[region]) regionMap[region] = {};
    if (!regionMap[region][pic]) regionMap[region][pic] = [];
    regionMap[region][pic].push(d);
  });

  let grandTotal = 0;
  Object.keys(regionMap).sort().forEach(region => {
    const regionDeals = Object.values(regionMap[region]).flat();
    const regionTotal = regionDeals.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);
    grandTotal += regionTotal;

    const rRow = worksheet.addRow([region, '', '', regionTotal]);
    rRow.getCell(1).font = { bold: true, size: 12 };
    rRow.getCell(4).font = { bold: true, size: 12 };
    rRow.getCell(4).numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
    rRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

    Object.keys(regionMap[region]).sort().forEach(pic => {
      const picDeals = regionMap[region][pic];
      const picTotal = picDeals.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);

      const pRow = worksheet.addRow([`  \u21B3 ${pic}`, "", "", picTotal]);
      pRow.getCell(1).font = { bold: true, color: { argb: 'FF334155' } };
      pRow.getCell(4).font = { bold: true };
      pRow.getCell(4).numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
      pRow.outlineLevel = 1;

      picDeals.forEach(d => {
        const dRow = worksheet.addRow([
          '', 
          `${d.client_name || '-'} \n(${d.project_name || '-'})`, 
          isAchievement ? (d.target_po_date || '-') : (d.est_booking_month || '-'), 
          Number(d.quotation || 0)
        ]);
        dRow.getCell(2).alignment = { wrapText: true, vertical: 'middle' };
        dRow.getCell(4).numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
        dRow.outlineLevel = 2;
        dRow.eachCell((cell, c) => {
          if (c > 1) {
            cell.border = { bottom: { style: 'dotted', color: { argb: 'FFF1F5F9' } } };
          }
        })
      });
    });
  });

  const tRow = worksheet.addRow(['GRAND TOTAL', '', '', grandTotal]);
  tRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, size: 12 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    if (colNumber === 4) {
      cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
    }
  });

  await downloadBuffer(workbook, filename);
};


export const exportBookingForecastMatrix = async (deals: any[], fy: number, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Booking Forecast');
  
  let minTime = Infinity;
  let maxTime = -Infinity;
  const validDeals = deals.filter(d => {
    if (d.status !== 'B') return false;
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    if (!rawDate) return false;
    const dt = new Date(rawDate);
    if (isNaN(dt.getTime())) return false;
    return true;
  });

  validDeals.forEach(d => {
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    const dt = new Date(rawDate);
    const t = dt.getTime();
    if (t < minTime) minTime = t;
    if (t > maxTime) maxTime = t;
  });

  if (minTime === Infinity) {
    minTime = new Date().getTime();
    maxTime = new Date().getTime();
  }

  const columns: { key: string; label: string }[] = [];
  const minDate = new Date(minTime);
  const maxDate = new Date(maxTime);

  let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  let safetyCounter = 0;
  while (current <= end && safetyCounter < 72) {
    const mYear = current.getFullYear();
    const mStr = current.toLocaleString('default', { month: 'short' }).toUpperCase();
    const key = `${mYear}-${String(current.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
    columns.push({ key, label: `${mStr} ${mYear}` });
    current.setMonth(current.getMonth() + 1);
    safetyCounter++;
  }

  setupMatrixSheet(worksheet, `Booking Forecast (Status B) Analytics - FY${fy}`, columns);

  type TreeNode = {
    name: string;
    values: Record<string, number>;
    total: number;
    children: Record<string, TreeNode>;
  };

  const root: TreeNode = { name: "Root", values: {}, total: 0, children: {} };

  validDeals.forEach(d => {
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    const dt = new Date(rawDate);
    const mYear = dt.getFullYear();
    const mStr = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
    const sortKey = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
    
    if (!columns.find(c => c.key === sortKey)) return;
    
    const val = Number(d.quotation || 0);

    const path = [
      d.region || "Uncategorized Region",
      d.pic || "Unassigned PIC",
      d.category || "Uncategorized",
      `${d.client_name || "Unknown Customer"} \n(${d.project_name || "Unknown Project"})`
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
      color: { argb: level === 0 ? 'FF0F172A' : level === 1 ? 'FF334155' : 'FF64748B' },
      size: level === 3 ? 9 : 10
    };

    if (level === 3) {
      row.getCell(1).alignment = { wrapText: true, vertical: 'middle' };
      row.getCell(1).value = `      - ${node.name}`;
    } else {
      row.getCell(1).alignment = { vertical: 'middle' };
      row.getCell(1).value = "   ".repeat(level) + (level > 0 ? (level === 1 ? "\u25BE " : "  ") : "") + node.name;
    }

    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (cell.value === 0) { cell.value = level === 3 ? '' : '-'; cell.alignment = { horizontal: 'center' }; }
      }
      cell.border = { bottom: { style: level === 3 ? 'dotted' : 'thin', color: { argb: 'FFF1F5F9' } } };
    });

    Object.values(node.children).sort((a, b) => b.total - a.total).forEach(child => writeNode(child, level + 1));
  };

  const regions = Object.keys(root.children).sort();
  regions.forEach(r => {
    writeNode(root.children[r], 0);
  });

  const totalValues = ['GRAND TOTAL'];
  let gTotal = 0;
  columns.forEach(col => {
    const sum = regions.reduce((acc, r) => acc + (root.children[r]?.values[col.key] || 0), 0);
    totalValues.push(sum as any);
    gTotal += sum;
  });
  totalValues.push(gTotal as any);
  const tRow = worksheet.addRow(totalValues);
  tRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    if (colNumber > 1) {
      cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      if (cell.value === 0) { cell.value = '-'; cell.alignment = { horizontal: 'center' }; }
    }
  });

  await downloadBuffer(workbook, filename);
};


