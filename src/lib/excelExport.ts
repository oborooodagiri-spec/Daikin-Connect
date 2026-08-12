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

const setupMatrixSheet = (worksheet: ExcelJS.Worksheet, title: string, columns: any[]) => {
  worksheet.views = [{ state: 'frozen', ySplit: 5 }];
  worksheet.mergeCells(`A1:${String.fromCharCode(65 + columns.length)}1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title.toUpperCase();
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF000000' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  worksheet.mergeCells(`A2:${String.fromCharCode(65 + columns.length)}2`);
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
  const fyMonths = getFYMonths(fy);
  const columns = [
    { key: 'previous_fy', label: '< APR ' + (2000 + fy) },
    ...fyMonths,
    { key: 'future_fy', label: '> MAR ' + (2000 + fy + 1) }
  ];
  setupMatrixSheet(worksheet, `Project By Status Analytics - FY${fy}`, columns);

  const monthMap: Record<string, Record<string, number>> = {};
  const projectMap: Record<string, any[]> = {};

  const fyStart = new Date(2000 + fy, 3, 1).getTime();
  const fyEnd = new Date(2000 + fy + 1, 2, 31, 23, 59, 59, 999).getTime();

  deals.forEach(d => {
    if (['L', 'H', 'T'].includes(d.status)) return;
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    if (!rawDate) return;
    const dt = new Date(rawDate);
    if (isNaN(dt.getTime())) return;
    
    let sortKey = '';
    if (dt.getTime() < fyStart) {
      sortKey = 'previous_fy';
    } else if (dt.getTime() > fyEnd) {
      sortKey = 'future_fy';
    } else {
      const mYear = dt.getFullYear();
      const mStr = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
      sortKey = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
    }
    
    if (!monthMap[d.status]) monthMap[d.status] = {};
    if (!projectMap[d.status]) projectMap[d.status] = [];
    
    const val = Number(d.quotation || 0);
    monthMap[d.status][sortKey] = (monthMap[d.status][sortKey] || 0) + val;
    projectMap[d.status].push({ ...d, sortKey, val });
  });

  const statuses = ["A", "B", "C", "D", "E"].filter(s => monthMap[s]);
  statuses.forEach(status => {
    const rowValues = [status];
    let rowTotal = 0;
    columns.forEach(col => {
      const val = monthMap[status][col.key] || 0;
      rowValues.push(val as any);
      rowTotal += val;
    });
    rowValues.push(rowTotal as any);
    const row = worksheet.addRow(rowValues);
    row.getCell(1).font = { bold: true, color: { argb: 'FF0F172A' } };
    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (cell.value === 0) { cell.value = '-'; cell.alignment = { horizontal: 'center' }; }
      }
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } } };
    });

    const projects = projectMap[status] || [];
    projects.forEach(p => {
      const projValues = Array(columns.length + 2).fill(0);
      projValues[0] = `   - ${p.project_name || 'Unknown Project'} (${p.pic || 'Unassigned'})`;
      const colIndex = columns.findIndex(c => c.key === p.sortKey);
      if (colIndex >= 0) projValues[colIndex + 1] = p.val;
      projValues[columns.length + 1] = p.val;
      const pRow = worksheet.addRow(projValues);
      pRow.getCell(1).font = { color: { argb: 'FF64748B' }, size: 9 };
      pRow.outlineLevel = 1;
      pRow.eachCell((cell, colNumber) => {
        if (colNumber > 1) {
          cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          if (cell.value === 0) { cell.value = ''; }
        }
        cell.border = { bottom: { style: 'dotted', color: { argb: 'FFF1F5F9' } } };
      });
    });
  });

  const totalValues = ['GRAND TOTAL'];
  columns.forEach(col => {
    const sum = statuses.reduce((acc, s) => acc + (monthMap[s][col.key] || 0), 0);
    totalValues.push(sum as any);
  });
  totalValues.push(statuses.reduce((acc, s) => acc + columns.reduce((a, c) => a + (monthMap[s][c.key] || 0), 0), 0) as any);
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

  const monthMap: Record<string, Record<string, number>> = {};
  const projectMap: Record<string, any[]> = {};

  deals.forEach(d => {
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    if (!rawDate) return;
    const dt = new Date(rawDate);
    if (isNaN(dt.getTime())) return;
    const mYear = dt.getFullYear();
    const mStr = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
    const sortKey = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
    const cat = d.category || 'Others';
    if (!monthMap[cat]) monthMap[cat] = {};
    if (!projectMap[cat]) projectMap[cat] = [];
    const val = Number(d.quotation || 0);
    monthMap[cat][sortKey] = (monthMap[cat][sortKey] || 0) + val;
    projectMap[cat].push({ ...d, sortKey, val });
  });

  const categories = ["EPL", "RC", "IAQ", "Control", "VES", "Others"].filter(c => monthMap[c]);
  categories.forEach(cat => {
    const rowValues = [cat];
    let rowTotal = 0;
    columns.forEach(col => {
      const val = monthMap[cat][col.key] || 0;
      rowValues.push(val as any);
      rowTotal += val;
    });
    rowValues.push(rowTotal as any);
    const row = worksheet.addRow(rowValues);
    row.getCell(1).font = { bold: true, color: { argb: 'FF0F172A' } };
    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (cell.value === 0) { cell.value = '-'; cell.alignment = { horizontal: 'center' }; }
      }
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } } };
    });

    const projects = projectMap[cat] || [];
    projects.forEach(p => {
      const projValues = Array(columns.length + 2).fill(0);
      projValues[0] = `   - ${p.project_name || 'Unknown Project'} [Status: ${p.status}]`;
      const colIndex = columns.findIndex(c => c.key === p.sortKey);
      if (colIndex >= 0) projValues[colIndex + 1] = p.val;
      projValues[columns.length + 1] = p.val;
      const pRow = worksheet.addRow(projValues);
      pRow.getCell(1).font = { color: { argb: 'FF64748B' }, size: 9 };
      pRow.outlineLevel = 1;
      pRow.eachCell((cell, colNumber) => {
        if (colNumber > 1) {
          cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          if (cell.value === 0) { cell.value = ''; }
        }
        cell.border = { bottom: { style: 'dotted', color: { argb: 'FFF1F5F9' } } };
      });
    });
  });

  const totalValues = ['GRAND TOTAL'];
  columns.forEach(col => {
    const sum = categories.reduce((acc, s) => acc + (monthMap[s][col.key] || 0), 0);
    totalValues.push(sum as any);
  });
  totalValues.push(categories.reduce((acc, s) => acc + columns.reduce((a, c) => a + (monthMap[s][c.key] || 0), 0), 0) as any);
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

  const monthMap: Record<string, Record<string, number>> = {};
  const projectMap: Record<string, any[]> = {};

  deals.forEach(d => {
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    if (!rawDate) return;
    const dt = new Date(rawDate);
    if (isNaN(dt.getTime())) return;
    const mYear = dt.getFullYear();
    const mStr = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
    const sortKey = `${mYear}-${String(dt.getMonth() + 1).padStart(2, '0')} ${mStr} ${mYear}`;
    const sec = d.sector || 'Others';
    if (!monthMap[sec]) monthMap[sec] = {};
    if (!projectMap[sec]) projectMap[sec] = [];
    const val = Number(d.quotation || 0);
    monthMap[sec][sortKey] = (monthMap[sec][sortKey] || 0) + val;
    projectMap[sec].push({ ...d, sortKey, val });
  });

  const sectors = Object.keys(monthMap).sort();
  sectors.forEach(sec => {
    const rowValues = [sec];
    let rowTotal = 0;
    columns.forEach(col => {
      const val = monthMap[sec][col.key] || 0;
      rowValues.push(val as any);
      rowTotal += val;
    });
    rowValues.push(rowTotal as any);
    const row = worksheet.addRow(rowValues);
    row.getCell(1).font = { bold: true, color: { argb: 'FF0F172A' } };
    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (cell.value === 0) { cell.value = '-'; cell.alignment = { horizontal: 'center' }; }
      }
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } } };
    });

    const projects = projectMap[sec] || [];
    projects.forEach(p => {
      const projValues = Array(columns.length + 2).fill(0);
      projValues[0] = `   - ${p.project_name || 'Unknown Project'} [Status: ${p.status}]`;
      const colIndex = columns.findIndex(c => c.key === p.sortKey);
      if (colIndex >= 0) projValues[colIndex + 1] = p.val;
      projValues[columns.length + 1] = p.val;
      const pRow = worksheet.addRow(projValues);
      pRow.getCell(1).font = { color: { argb: 'FF64748B' }, size: 9 };
      pRow.outlineLevel = 1;
      pRow.eachCell((cell, colNumber) => {
        if (colNumber > 1) {
          cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          if (cell.value === 0) { cell.value = ''; }
        }
        cell.border = { bottom: { style: 'dotted', color: { argb: 'FFF1F5F9' } } };
      });
    });
  });
  
  const totalValues = ['GRAND TOTAL'];
  columns.forEach(col => {
    const sum = sectors.reduce((acc, s) => acc + (monthMap[s][col.key] || 0), 0);
    totalValues.push(sum as any);
  });
  totalValues.push(sectors.reduce((acc, s) => acc + columns.reduce((a, c) => a + (monthMap[s][c.key] || 0), 0), 0) as any);
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

      const pRow = worksheet.addRow([`  ↳ ${pic}`, '', '', picTotal]);
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

