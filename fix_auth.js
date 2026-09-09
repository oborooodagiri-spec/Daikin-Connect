
const fs = require("fs");
let content = fs.readFileSync("src/app/actions/auth.ts", "utf8");

content = content.replace(
  `attendance_enabled: user.attendance_enabled`,
  `attendance_enabled: user.attendance_enabled,
      pives_scanner_enabled: user.pives_scanner_enabled`
);

fs.writeFileSync("src/app/actions/auth.ts", content);

