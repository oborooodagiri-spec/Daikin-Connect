
const fs = require("fs");
let content = fs.readFileSync("src/app/actions/users.ts", "utf8");
content += `\nexport async function togglePivesScannerStatus(userId: number, currentStatus: boolean) {
  try {
    await prisma.users.update({
      where: { id: userId },
      data: { pives_scanner_enabled: !currentStatus }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update scanner status" };
  }
}\n`;
fs.writeFileSync("src/app/actions/users.ts", content);

