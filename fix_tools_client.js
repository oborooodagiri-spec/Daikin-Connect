
const fs = require("fs");
let content = fs.readFileSync("src/app/tools/ToolsClient.tsx", "utf8");

content = content.replace(
  `export default function ToolsClient() {`,
  `export default function ToolsClient({ pivesScannerEnabled = false }: { pivesScannerEnabled?: boolean }) {`
);

content = content.replace(
  `import { useRouter } from "next/navigation";`,
  `import { useRouter } from "next/navigation";\nimport { QrCode } from "lucide-react";`
);

const oldTools = `const TOOLS: Tool[] = [`;
const newTools = `const TOOLS: Tool[] = [
  {
    id: "pives-scanner",
    name: "PIVES Scanner",
    description: "Scan barcode unit tanpa kamera bawaan (Plaza Indonesia VES)",
    icon: <QrCode size={24} />,
    gradient: "linear-gradient(135deg, #a25ddc 0%, #c48eff 100%)",
    href: "/tools/pives-scanner",
    active: true,
  },`;

content = content.replace(oldTools, newTools);

content = content.replace(
  `{TOOLS.map((tool, i) => (`,
  `{TOOLS.filter(t => t.id !== "pives-scanner" || pivesScannerEnabled).map((tool, i) => (`
);

fs.writeFileSync("src/app/tools/ToolsClient.tsx", content);

