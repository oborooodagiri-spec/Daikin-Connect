const fs = require('fs');

async function downloadXlsx() {
  const url = "https://docs.google.com/spreadsheets/d/1hnd6GRkMyEi5ydXfheUAmH2ISVornPKiLLz0ln_asbE/export?format=xlsx";
  console.log("Downloading XLSX from Google Sheets...");
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    fs.writeFileSync('scratch/plaza_full_report.xlsx', Buffer.from(buffer));
    console.log("Successfully downloaded XLSX. Size:", buffer.byteLength, "bytes");
  } catch (error) {
    console.error("Error downloading XLSX:", error);
  }
}

downloadXlsx();
