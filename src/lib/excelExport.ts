import ExcelJS from 'exceljs';

export interface ExcelColumnDef {
  header: string;
  key: string;
  width?: number;
  isCurrency?: boolean;
}

export const exportToExcel = async (
  title: string,
  data: any[],
  columns: ExcelColumnDef[],
  filename: string
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Daikin Connect';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Report', {
    views: [{ state: 'frozen', ySplit: 4 }] // Freeze the first 4 rows (title, date, space, header)
  });

  // 1. Add Title Row
  worksheet.mergeCells(`A1:${String.fromCharCode(65 + columns.length - 1)}1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title.toUpperCase();
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF000000' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // 2. Add Export Date Row
  worksheet.mergeCells(`A2:${String.fromCharCode(65 + columns.length - 1)}2`);
  const dateCell = worksheet.getCell('A2');
  const now = new Date();
  dateCell.value = `Generated on: ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB')}`;
  dateCell.font = { size: 10, italic: true, color: { argb: 'FF666666' } };
  dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // 3. Add Empty Row
  worksheet.addRow([]);

  // 4. Add Header Row
  const headerRow = worksheet.addRow(columns.map(col => col.header));
  headerRow.height = 25;
  
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0073ea' } // Blue background
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
    };
    
    // Set column width
    worksheet.getColumn(index + 1).width = col.width || 20;
  });

  // 5. Add Data Rows
  data.forEach((row, rowIndex) => {
    const dataRow = worksheet.addRow(columns.map(col => row[col.key]));
    
    columns.forEach((col, colIndex) => {
      const cell = dataRow.getCell(colIndex + 1);
      
      // Formatting
      if (col.isCurrency) {
        // Accounting format for Rupiah (Rp)
        cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { vertical: 'middle', wrapText: true };
      }

      // Borders
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
      };

      // Striped background
      if (rowIndex % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        };
      }
    });
  });

  // 6. Add Total Row (if there are currency columns)
  const hasCurrency = columns.some(c => c.isCurrency);
  if (hasCurrency && data.length > 0) {
    const totalRow = worksheet.addRow([]);
    totalRow.getCell(1).value = 'TOTAL';
    totalRow.getCell(1).font = { bold: true };
    
    columns.forEach((col, index) => {
      const cell = totalRow.getCell(index + 1);
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' }
      };
      
      if (col.isCurrency) {
        const sum = data.reduce((acc, row) => acc + (Number(row[col.key]) || 0), 0);
        cell.value = sum;
        cell.numFmt = '_("Rp"* #,##0_);_("Rp"* \\(#,##0\\);_("Rp"* "-"_);_(@_)';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });
  }

  // Generate and download
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
