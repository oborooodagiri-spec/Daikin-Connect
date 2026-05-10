// Extract embedded images from XLSX using Node.js built-in zlib
const fs = require('fs');
const path = require('path');

const xlsxPath = 'C:\\Users\\D22AGRI-EPL\\Downloads\\Report Pengukuran day 1 - day 46 Plaza Indonesia.xlsx';
const buf = fs.readFileSync(xlsxPath);

// XLSX is a ZIP file. Find the local file headers to count media files
// ZIP local file header signature: 0x04034b50 (PK\x03\x04)
let offset = 0;
const mediaFiles = [];

// Quick scan of central directory for media entries
// Central directory file header: PK\x01\x02 = 0x02014b50
let cdOffset = -1;
for (let i = buf.length - 22; i >= 0; i--) {
  // End of central directory signature: PK\x05\x06
  if (buf[i] === 0x50 && buf[i+1] === 0x4B && buf[i+2] === 0x05 && buf[i+3] === 0x06) {
    cdOffset = buf.readUInt32LE(i + 16);
    break;
  }
}

if (cdOffset >= 0) {
  let pos = cdOffset;
  while (pos < buf.length - 4) {
    if (buf[pos] === 0x50 && buf[pos+1] === 0x4B && buf[pos+2] === 0x01 && buf[pos+3] === 0x02) {
      const compressedSize = buf.readUInt32LE(pos + 20);
      const uncompressedSize = buf.readUInt32LE(pos + 24);
      const nameLen = buf.readUInt16LE(pos + 28);
      const extraLen = buf.readUInt16LE(pos + 30);
      const commentLen = buf.readUInt16LE(pos + 32);
      const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);
      
      if (name.startsWith('xl/media/')) {
        mediaFiles.push({
          name,
          size: uncompressedSize,
          sizeKB: (uncompressedSize / 1024).toFixed(1)
        });
      }
      
      pos += 46 + nameLen + extraLen + commentLen;
    } else {
      break;
    }
  }
}

console.log(`Total embedded media files: ${mediaFiles.length}`);
let totalSizeKB = 0;
mediaFiles.forEach((f, i) => {
  if (i < 30) console.log(`  ${f.name} - ${f.sizeKB}KB`);
  totalSizeKB += parseFloat(f.sizeKB);
});
if (mediaFiles.length > 30) console.log(`  ... and ${mediaFiles.length - 30} more`);
console.log(`\nTotal media size: ${(totalSizeKB/1024).toFixed(1)}MB`);

// Count by extension
const exts = {};
mediaFiles.forEach(f => {
  const ext = path.extname(f.name).toLowerCase();
  exts[ext] = (exts[ext] || 0) + 1;
});
console.log('File types:', JSON.stringify(exts));
