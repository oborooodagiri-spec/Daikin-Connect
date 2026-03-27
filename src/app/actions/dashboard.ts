"use server";

import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();

export async function getDashboardData(locationFilter: string) {
  // We use raw queries here as the exact schema wasn't introspected yet.
  // Wait for `npx prisma db pull` and `npx prisma generate` to be run by you!
  // If tables are named exactly 'corrective', 'preventive', and 'audit':
  try {
    const data = await prisma.$transaction([
      prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM corrective ${locationFilter !== "All" ? 'WHERE location = "' + locationFilter + '"' : ''}`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM preventive ${locationFilter !== "All" ? 'WHERE location = "' + locationFilter + '"' : ''}`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM audit ${locationFilter !== "All" ? 'WHERE location = "' + locationFilter + '"' : ''}`)
    ]);

    const correctiveCount = Number((data[0] as any)[0]?.count || 0);
    const preventiveCount = Number((data[1] as any)[0]?.count || 0);
    const auditCount = Number((data[2] as any)[0]?.count || 0);

    const totalAssets = correctiveCount + preventiveCount + auditCount;

    return {
      corrective: correctiveCount,
      preventive: preventiveCount,
      audit: auditCount,
      databaseAssets: totalAssets,
      totalCustomers: 2, // Dummy config
      activeSites: 1, // Dummy config
    };
  } catch (err) {
    console.error("Please run `npx prisma db pull` and ensure table structure matches query: ", err);
    return {
      corrective: 0,
      preventive: 0,
      audit: 0,
      databaseAssets: 0,
      totalCustomers: 0,
      activeSites: 0,
    };
  }
}

export async function getTrendChartData(locationFilter: string) {
  // Returns dummy formatted data matching "Jan", "Feb" ... "Dec"
  // Assuming the user implements `CREATED_AT` parsing in actual SQL table
  return [
    { name: "Jan", audit: 0, preventive: 0, corrective: 0 },
    { name: "Feb", audit: 0, preventive: 0, corrective: 0 },
    { name: "Mar", audit: 18, preventive: 18, corrective: 4 },
    { name: "Apr", audit: 0, preventive: 0, corrective: 0 },
    { name: "May", audit: 0, preventive: 0, corrective: 0 },
    { name: "Jun", audit: 0, preventive: 0, corrective: 0 },
    { name: "Jul", audit: 0, preventive: 0, corrective: 0 },
    { name: "Aug", audit: 0, preventive: 0, corrective: 0 },
    { name: "Sep", audit: 0, preventive: 0, corrective: 0 },
    { name: "Oct", audit: 0, preventive: 0, corrective: 0 },
    { name: "Nov", audit: 0, preventive: 0, corrective: 0 },
    { name: "Dec", audit: 0, preventive: 0, corrective: 0 }
  ];
}
