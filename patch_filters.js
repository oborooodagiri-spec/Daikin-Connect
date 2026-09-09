
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/live-data/LiveDataClient.tsx", "utf8");

// 1. Add picRoleFilter state
content = content.replace(
  `const [picFilter, setPicFilter] = useState("All");`,
  `const [picFilter, setPicFilter] = useState("All");\n  const [picRoleFilter, setPicRoleFilter] = useState("All Roles");`
);

// 2. Update uniquePics
const oldUniquePics = `const uniquePics = useMemo(() => [...new Set(deals.map(d => d.pic?.trim().toUpperCase()).filter(Boolean))].sort(), [deals]);`;
const newUniquePics = `const uniquePics = useMemo(() => {
    const pics = new Set<string>();
    deals.forEach(d => {
      if (d.pic) pics.add(d.pic.trim().toUpperCase());
      if (d.sales_planner) {
        d.sales_planner.split(",").forEach(sp => {
          if (sp.trim()) pics.add(sp.trim().toUpperCase());
        });
      }
    });
    return Array.from(pics).sort();
  }, [deals]);`;
content = content.replace(oldUniquePics, newUniquePics);

// 3. Update matchPic logic
const oldMatchPic = `const matchPic = picFilter === "All" || d.pic?.trim().toUpperCase() === picFilter;`;
const newMatchPic = `let matchPic = true;
      const isMain = d.pic?.trim().toUpperCase() === picFilter;
      const isPartner = d.sales_planner ? d.sales_planner.toUpperCase().includes(picFilter) : false;

      if (picFilter !== "All") {
        if (picRoleFilter === "All Roles") matchPic = isMain || isPartner;
        else if (picRoleFilter === "Sales") matchPic = isMain;
        else if (picRoleFilter === "Partnership") matchPic = isPartner;
      } else {
        if (picRoleFilter === "Partnership") matchPic = !!d.sales_planner && d.sales_planner.trim() !== "";
      }`;
content = content.replace(oldMatchPic, newMatchPic);

// 4. Update Dropdowns
const oldDropdowns = `{ label: "FY", plural: "FYs", val: pipelineFYFilter, set: setPipelineFYFilter, opts: uniqueFYs as string[] },
            { label: "PIC", plural: "PICs", val: picFilter, set: setPicFilter, opts: uniquePics as string[] },`;
const newDropdowns = `{ label: "FY", plural: "FYs", val: pipelineFYFilter, set: setPipelineFYFilter, opts: uniqueFYs as string[] },
            { label: "PIC Role", plural: "Roles", val: picRoleFilter, set: setPicRoleFilter, opts: ["Sales", "Partnership"] },
            { label: "PIC", plural: "PICs", val: picFilter, set: setPicFilter, opts: uniquePics as string[] },`;
content = content.replace(oldDropdowns, newDropdowns);

fs.writeFileSync("src/app/admin/live-data/LiveDataClient.tsx", content);
console.log("Patched successfully!");

