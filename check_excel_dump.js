const fs = require('fs');

async function checkExcelDump() {
  const data = JSON.parse(fs.readFileSync('./excel_dump.json', 'utf8'));
  
  const INDUSTRY_SECTORS = ["Industri", "Heavy Industri"];
  
  let totalIndustry = 0n;
  let totalCommercial = 0n;
  const COMMERCIAL_SECTORS = ["Komersial", "Government", "Hospital"];

  const industryDeals = [];

  for (const sheetName in data) {
    const rows = data[sheetName];
    rows.forEach((r, idx) => {
      // Assuming keys are like 'sector', 'quotation', 'status'
      // Try to find the keys
      const keys = Object.keys(r);
      const sectorKey = keys.find(k => k.toLowerCase().includes('sector'));
      const statusKey = keys.find(k => k.toLowerCase().includes('status'));
      const quotationKey = keys.find(k => k.toLowerCase().includes('quotation') || k.toLowerCase().includes('amount') || k.toLowerCase().includes('value'));
      const nameKey = keys.find(k => k.toLowerCase().includes('client') || k.toLowerCase().includes('project'));

      if (sectorKey && quotationKey && statusKey) {
        const sector = r[sectorKey];
        const status = r[statusKey];
        let quotation = r[quotationKey];
        
        if (typeof quotation === 'string') {
           quotation = quotation.replace(/[^0-9.-]+/g,"");
        }
        
        if (!quotation) quotation = 0;
        
        const qVal = BigInt(Math.floor(Number(quotation)));

        if (status !== 'L' && status !== 'H' && status !== 'T' && status !== 'Lost' && status !== 'Hold' && status !== 'Tender') {
          if (INDUSTRY_SECTORS.includes(sector)) {
            totalIndustry += qVal;
            industryDeals.push({ name: r[nameKey], amount: qVal, status });
          } else if (COMMERCIAL_SECTORS.includes(sector)) {
            totalCommercial += qVal;
          }
        }
      }
    });
  }

  console.log(`Excel Dump Total Industry (excl T,H,L): ${totalIndustry.toString()}`);
  console.log(`Excel Dump Total Commercial (excl T,H,L): ${totalCommercial.toString()}`);
  
  // Also check if any deal is 500M difference
  industryDeals.forEach(d => {
    if (d.amount % 1000000000n === 500000000n) {
      console.log(`Found ending in 500M: ${d.name} - ${d.amount}`);
    }
  });
}

checkExcelDump().catch(console.error);
