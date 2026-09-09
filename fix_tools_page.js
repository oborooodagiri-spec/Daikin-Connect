
const fs = require("fs");
let content = fs.readFileSync("src/app/tools/page.tsx", "utf8");

content = content.replace(
  `return <ToolsClient />;`,
  `return <ToolsClient pivesScannerEnabled={session.pives_scanner_enabled} />;`
);

fs.writeFileSync("src/app/tools/page.tsx", content);

