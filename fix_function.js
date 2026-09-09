
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/users/page.tsx", "utf8");

const pivesFunction = `
  const handleTogglePives = (user: any) => {
    const verb = user.pives_scanner_enabled ? "Disable" : "Enable";
    if (!confirm(\`Are you sure you want to \${verb} PIVES Scanner for \${user.name}?\`)) return;

    startTransition(async () => {
      const res = await togglePivesScannerStatus(user.id, user.pives_scanner_enabled);
      if (res.success) {
        fetchData();
      } else {
        alert(res.error || "Failed to update scanner access");
      }
    });
  };

`;

content = content.replace("  const handleToggleAttendance = (user: any) => {", pivesFunction + "  const handleToggleAttendance = (user: any) => {");

fs.writeFileSync("src/app/admin/users/page.tsx", content);

