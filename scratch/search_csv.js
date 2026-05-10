const fs = require('fs');
const readline = require('readline');

async function processCSV() {
  const fileStream = fs.createReadStream('scratch/plaza_report.csv');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let rowNum = 0;
  for await (const line of rl) {
    rowNum++;
    if (line.includes("HOUSE OF ULTIMA")) {
      console.log(`Row ${rowNum}: ${line}`);
    }
  }
}

processCSV();
