
const fs = require("fs");
let tp = fs.readFileSync("src/app/admin/live-data/TargetProgressModal.tsx", "utf8");

tp = tp.replace(
  /if \(salesPlanner !== "" && salesPlanner !== pic\) {\s+if \(!backlogByPartner\[salesPlanner\]\) backlogByPartner\[salesPlanner\] = { value: 0, count: 0 };\s+backlogByPartner\[salesPlanner\]\.value \+= val;\s+backlogByPartner\[salesPlanner\]\.count\+\+;\s+}/g,
  `salesPlanners.forEach(sp => {
          if (sp !== pic) {
            if (!backlogByPartner[sp]) backlogByPartner[sp] = { value: 0, count: 0 };
            backlogByPartner[sp].value += val;
            backlogByPartner[sp].count++;
          }
        });`
);

fs.writeFileSync("src/app/admin/live-data/TargetProgressModal.tsx", tp);
console.log("Fixed backlog salesPlanner issue!");

