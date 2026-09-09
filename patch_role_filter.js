
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/live-data/LiveDataClient.tsx", "utf8");

content = content.replace(
  `if (picRoleFilter === "All Roles") matchPic = isMain || isPartner;`,
  `if (picRoleFilter === "All" || picRoleFilter === "All Roles") matchPic = isMain || isPartner;`
);

content = content.replace(
  `const [picRoleFilter, setPicRoleFilter] = useState("All Roles");`,
  `const [picRoleFilter, setPicRoleFilter] = useState("All");`
);

fs.writeFileSync("src/app/admin/live-data/LiveDataClient.tsx", content);
console.log("Patched picRoleFilter bug!");

