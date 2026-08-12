const fs = require('fs');
let c = fs.readFileSync('src/lib/excelExport.ts', 'utf8');

const oldFunc = \export const exportProjectByStatusMatrix = async (deals: any[], fy: number, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Project By Status');
  const columns = getFYMonths(fy);
  setupMatrixSheet(worksheet, \\\Project By Status Analytics - FY\\\\, columns);

  const monthMap: Record<string, Record<string, number>> = {};
  const projectMap: Record<string, any[]> = {};

  deals.forEach(d => {
    if (['L', 'H', 'T'].includes(d.status)) return;
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    if (!rawDate) return;
    const dt = new Date(rawDate);
    if (isNaN(dt.getTime())) return;
    const mYear = dt.getFullYear();
    const mStr = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
    const sortKey = \\\\-\ \ \\\\;
    
    if (!monthMap[d.status]) monthMap[d.status] = {};
    if (!projectMap[d.status]) projectMap[d.status] = [];
    
    const val = Number(d.quotation || 0);
    monthMap[d.status][sortKey] = (monthMap[d.status][sortKey] || 0) + val;
    projectMap[d.status].push({ ...d, sortKey, val });
  });\;

const newFunc = \export const exportProjectByStatusMatrix = async (deals: any[], fy: number, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Project By Status');
  const fyMonths = getFYMonths(fy);
  const columns = [
    { key: 'previous_fy', label: '< APR ' + (2000 + fy) },
    ...fyMonths,
    { key: 'future_fy', label: '> MAR ' + (2000 + fy + 1) }
  ];
  setupMatrixSheet(worksheet, \\\Project By Status Analytics - FY\\\\, columns);

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
      sortKey = \\\\-\ \ \\\\;
    }
    
    if (!monthMap[d.status]) monthMap[d.status] = {};
    if (!projectMap[d.status]) projectMap[d.status] = [];
    
    const val = Number(d.quotation || 0);
    monthMap[d.status][sortKey] = (monthMap[d.status][sortKey] || 0) + val;
    projectMap[d.status].push({ ...d, sortKey, val });
  });\;

if (c.includes(oldFunc)) {
  c = c.replace(oldFunc, newFunc);
  fs.writeFileSync('src/lib/excelExport.ts', c);
  console.log('Replaced successfully');
} else {
  console.log('Could not find oldFunc');
}
