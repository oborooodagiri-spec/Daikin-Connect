const fs = require('fs');

async function downloadCSV() {
  const url = "https://docs.google.com/spreadsheets/d/1hnd6GRkMyEi5ydXfheUAmH2ISVornPKiLLz0ln_asbE/export?format=csv";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    fs.writeFileSync('scratch/plaza_report.csv', text);
    console.log("Successfully downloaded CSV. First 5 lines:");
    console.log(text.split('\n').slice(0, 5).join('\n'));
  } catch (error) {
    console.error("Error downloading CSV:", error);
  }
}

downloadCSV();
