const AdmZip = require('adm-zip');
const filePath = 'C:\\Users\\D22AGRI-EPL\\Downloads\\daily_sync.xlsx';
const zip = new AdmZip(filePath);
const entries = zip.getEntries();

console.log('Drawing files:');
entries.forEach(e => {
    if (e.entryName.startsWith('xl/drawings/')) {
        console.log(e.entryName);
    }
});

console.log('\nSheet relationships:');
const workbookRels = zip.getEntry('xl/_rels/workbook.xml.rels');
if (workbookRels) {
    console.log(workbookRels.getData().toString('utf8'));
}

const sheets = zip.getEntry('xl/workbook.xml');
if (sheets) {
    console.log('\nSheets:');
    console.log(sheets.getData().toString('utf8'));
}
