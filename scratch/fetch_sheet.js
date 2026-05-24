const fs = require('fs');

async function run() {
  const url = 'https://docs.google.com/spreadsheets/d/1Gjj68KTSnTKErBaMfMaJmDc5cv1F4y1Y/export?format=csv';
  try {
    console.log("Fetching CSV...");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const text = await res.text();
    fs.writeFileSync('scratch/spreadsheet.csv', text);
    console.log("CSV saved to scratch/spreadsheet.csv. Length:", text.length);
    console.log("First 1000 characters of CSV:");
    console.log(text.substring(0, 1000));
  } catch (err) {
    console.error("Error fetching CSV:", err);
  }
}

run();
