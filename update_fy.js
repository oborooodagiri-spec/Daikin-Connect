const fs = require('fs');
let file = 'src/app/admin/live-data/LiveDataClient.tsx';
let text = fs.readFileSync(file, 'utf8');

// 1. Fix projectByStatusDeals
text = text.replace(
  /const projectByStatusDeals = useMemo\(\(\) => \{[\s\S]*?return t >= fyStart && t <= fyEnd;\s*\}\);\s*\}, \[deals, selectedFY\]\);/,
  `const projectByStatusDeals = useMemo(() => {
    return deals.filter(d => {
      if (!['A', 'B', 'C', 'D', 'E', 'T', 'H'].includes(d.status)) return false;
      if (d.status === 'T' && !showPipelineTender) return false;
      if (d.status === 'H' && !showPipelineHold) return false;
      
      const dealFY = getDealFYStr(d);
      const targetFY = "FY" + selectedFY;
      
      if (!d.is_closed) {
        return dealFY <= targetFY; // Open projects carry over to current and future FYs
      } else {
        return dealFY === targetFY; // Closed projects belong STRICTLY to their override/actual FY
      }
    });
  }, [deals, selectedFY, showPipelineTender, showPipelineHold]);`
);

// 2. Fix filteredDeals (Sales Pipeline)
text = text.replace(
  'const matchFY = pipelineFYFilter === "All" || getDealFYStr(d) === pipelineFYFilter;',
  'const matchFY = pipelineFYFilter === "All" || (d.is_closed ? getDealFYStr(d) === pipelineFYFilter : getDealFYStr(d) <= pipelineFYFilter);'
);

// 3. Fix Dashboard Cards (renderDashboard)
text = text.replace(
  /const fyStartYear = 2000 \+ currentFY;[\s\S]*?const fyEndTime = new Date\(fyStartYear \+ 1, 2, 31, 23, 59, 59, 999\)\.getTime\(\);/,
  ''
);

// Replace bookingFcDeals
text = text.replace(
  /const bookingFcDeals = activeDeals\.filter\(d => \{[\s\S]*?return dt >= fyStartTime && dt <= fyEndTime;\s*\}\);/,
  `const bookingFcDeals = activeDeals.filter(d => {
      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return false;
      return getDealFYStr(d) <= "FY" + currentFY;
    });`
);

// Replace closedFYDeals
text = text.replace(
  /const closedFYDeals = deals\.filter\(d => \{[\s\S]*?return ut >= fyStartTime && ut <= fyEndTime;\s*\}\);/,
  `const closedFYDeals = deals.filter(d => {
      if (!d.is_closed) return false;
      return getDealFYStr(d) === "FY" + currentFY;
    });`
);

// Replace industryFYDeals
text = text.replace(
  /const industryFYDeals = pipelineModalDeals\.filter\(d => \{[\s\S]*?return dt >= fyStartTime && dt <= fyEndTime;\s*\}\);/,
  `const industryFYDeals = pipelineModalDeals.filter(d => {
      if (d.sector !== "Industri" && d.sector !== "Heavy Industri") return false;
      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return false;
      return getDealFYStr(d) <= "FY" + currentFY;
    });`
);

// Replace commercialFYDeals
text = text.replace(
  /const commercialFYDeals = pipelineModalDeals\.filter\(d => \{[\s\S]*?return dt >= fyStartTime && dt <= fyEndTime;\s*\}\);/,
  `const commercialFYDeals = pipelineModalDeals.filter(d => {
      if (d.sector !== "Commercial") return false;
      const rawDate = d.target_po_date || d.est_booking_month;
      if (!rawDate) return false;
      return getDealFYStr(d) <= "FY" + currentFY;
    });`
);

fs.writeFileSync(file, text);
console.log("Updated LiveDataClient");
