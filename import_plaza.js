const ExcelJS = require('exceljs');
const { PrismaClient } = require('./src/generated/client_v3');
const path = require('path');

const prisma = new PrismaClient();

async function run() {
  const filePath = 'C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\Plaza Indonesia\\2026\\Agustus\\Audit\\4.Report Pengukuran day 64 - day 107 Plaza Indonesia.xlsx';
  console.log(`Starting import from: ${filePath}`);
  
  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, { worksheets: 'emit', sharedStrings: 'cache' });

  let count = 0;
  for await (const worksheetReader of workbookReader) {
    if (worksheetReader.name === 'Report Plaza Indonesia') {
      console.log('Found sheet, parsing rows...');
      let isHeaderPassed = false;

      for await (const row of worksheetReader) {
        // Skip until we hit the row with NO = 1
        if (!isHeaderPassed) {
          if (row.values[1] === 1 || row.values[1] === '1') {
            isHeaderPassed = true;
          } else {
            continue;
          }
        }

        const vals = row.values;
        if (!vals[1]) continue; // if NO is empty, skip

        let auditDate = new Date();
        if (typeof vals[3] === 'number') {
            auditDate = new Date(Math.round((vals[3] - 25569) * 86400 * 1000));
        } else if (vals[3] instanceof Date) {
            auditDate = vals[3];
        } else if (vals[3]) {
            auditDate = new Date(vals[3]);
        }

        const data = {
          unit_tag: vals[5] ? String(vals[5]).substring(0, 100) : null,
          location: `Plaza Indonesia - ${vals[7] || ''} - ${vals[11] || ''}`,
          audit_date: auditDate,
          prepared_by: 'System Import',
          design_airflow: typeof vals[22] === 'number' ? vals[22] : null,
          design_cooling_capacity: typeof vals[24] === 'number' ? vals[24] : null,
          entering_db: typeof vals[12] === 'number' ? vals[12] : null,
          leaving_db: typeof vals[14] === 'number' ? vals[14] : null,
          entering_wb: typeof vals[13] === 'number' ? vals[13] : null,
          leaving_wb: typeof vals[15] === 'number' ? vals[15] : null,
          chws_temp: typeof vals[30] === 'number' ? vals[30] : null,
          chwr_temp: typeof vals[31] === 'number' ? vals[31] : null,
          visual_notes: vals[35] ? String(vals[35]) : null,
          recommendation: vals[36] ? String(vals[36]) : null,
        };

        try {
          await prisma.ahu_audits.create({ data });
          count++;
          if (count % 50 === 0) console.log(`Inserted ${count} records...`);
        } catch (e) {
          console.error(`Error inserting row ${vals[1]}:`, e);
        }
      }
      break;
    }
  }
  console.log(`Finished! Inserted ${count} records.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
