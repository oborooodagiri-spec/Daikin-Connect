// Check the drawing relationships to understand image-to-cell mapping
const fs = require('fs');
const path = require('path');

const xlsxPath = 'C:\\Users\\D22AGRI-EPL\\Downloads\\Report Pengukuran day 1 - day 46 Plaza Indonesia.xlsx';
const buf = fs.readFileSync(xlsxPath);

// Find the end of central directory
let cdOffset = -1;
for (let i = buf.length - 22; i >= 0; i--) {
  if (buf[i] === 0x50 && buf[i+1] === 0x4B && buf[i+2] === 0x05 && buf[i+3] === 0x06) {
    cdOffset = buf.readUInt32LE(i + 16);
    break;
  }
}

const entries = [];
let pos = cdOffset;
while (pos < buf.length - 4) {
  if (buf[pos] === 0x50 && buf[pos+1] === 0x4B && buf[pos+2] === 0x01 && buf[pos+3] === 0x02) {
    const method = buf.readUInt16LE(pos + 10);
    const compressedSize = buf.readUInt32LE(pos + 20);
    const uncompressedSize = buf.readUInt32LE(pos + 24);
    const nameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const localHeaderOffset = buf.readUInt32LE(pos + 42);
    const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);
    
    entries.push({ name, compressedSize, uncompressedSize, localHeaderOffset, method });
    pos += 46 + nameLen + extraLen + commentLen;
  } else {
    break;
  }
}

// Find drawing relationship files
const drawingRels = entries.filter(e => e.name.includes('drawing') || e.name.includes('Drawing'));
console.log('Drawing-related files:');
drawingRels.forEach(e => console.log(`  ${e.name} (${(e.uncompressedSize/1024).toFixed(1)}KB)`));

// Also check worksheetRels
const wsRels = entries.filter(e => e.name.includes('worksheets/_rels'));
console.log('\nWorksheet relationship files:');
wsRels.forEach(e => console.log(`  ${e.name} (${(e.uncompressedSize/1024).toFixed(1)}KB)`));

// Count per sheet
const sheets = entries.filter(e => e.name.match(/xl\/worksheets\/sheet\d+\.xml$/));
console.log('\nWorksheet files:');
sheets.forEach(e => console.log(`  ${e.name} (${(e.uncompressedSize/1024).toFixed(1)}KB)`));
