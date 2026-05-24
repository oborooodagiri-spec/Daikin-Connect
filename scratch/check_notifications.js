const { PrismaClient } = require("../src/generated/client_v3");
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching notifications for Dede Yusuf Iskandar (user_id = 4 or other users)...");
  
  // Find user by email or name
  const users = await prisma.users.findMany({
    where: { name: { contains: "Dede" } }
  });
  console.log("Found users matching 'Dede':", users.map(u => ({ id: u.id, name: u.name, email: u.email })));

  if (users.length === 0) {
    console.log("No Dede user found.");
    return;
  }

  const dede = users[0];
  const allNotifications = await prisma.notifications.findMany({
    where: { user_id: dede.id },
    orderBy: { created_at: "desc" },
    take: 15
  });

  console.log("\nRecent Notifications for", dede.name, "(ID:", dede.id, "):");
  allNotifications.forEach(n => {
    console.log(`- ID: ${n.id} | Title: "${n.title}" | link: "${n.link}" | project_id: ${n.project_id}`);
  });

  // Let's test the filtering logic we have in the backend!
  const projectIdsToTest = ["5", "4", "empty", undefined];
  
  for (const pId of projectIdsToTest) {
    console.log(`\n--- TESTING WITH projectId = ${pId} (type: ${typeof pId}) ---`);
    let filtered = allNotifications;
    const isFiltered = pId !== undefined;
    
    if (isFiltered) {
      filtered = allNotifications.filter((n) => {
        // 1. Check database column project_id
        if (n.project_id !== null && n.project_id !== undefined) {
          return n.project_id.toString() === pId;
        }

        // 2. Fallback: Parse from link
        if (n.link) {
          const match = n.link.match(/\/w\/(\d+)\//);
          if (match) {
            const linkProjectId = match[1];
            return linkProjectId === pId;
          }
        }

        // 3. Keep global notifications (no project context in link nor database)
        return true;
      });
    }

    console.log(`Returned ${filtered.length} notifications:`);
    filtered.forEach(n => {
      console.log(`  * [OK] ID: ${n.id} | Title: "${n.title}" | link: "${n.link}" | project_id: ${n.project_id}`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
