const AdmZip = require('adm-zip');
const filePath = 'C:\\Users\\D22AGRI-EPL\\Downloads\\daily_sync.xlsx';
const zip = new AdmZip(filePath);

['xl/worksheets/_rels/sheet1.xml.rels', 'xl/worksheets/_rels/sheet2.xml.rels'].forEach(path => {
    const entry = zip.getEntry(path);
    if (entry) {
        console.log(`\n${path}:`);
        console.log(entry.getData().toString('utf8'));
    }
});
