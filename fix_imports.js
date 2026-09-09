
const fs = require("fs");
let content = fs.readFileSync("src/app/admin/users/page.tsx", "utf8");

content = content.replace(
  `toggleUserAttendance\n} from "@/app/actions/users";`,
  `toggleUserAttendance, togglePivesScannerStatus\n} from "@/app/actions/users";`
);

content = content.replace(
  `Calendar\n} from "lucide-react";`,
  `Calendar, QrCode\n} from "lucide-react";`
);

fs.writeFileSync("src/app/admin/users/page.tsx", content);

