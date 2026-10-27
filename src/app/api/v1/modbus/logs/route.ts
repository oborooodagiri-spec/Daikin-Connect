import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gatewayId = searchParams.get("gateway_id");
    
    if (!gatewayId) {
      return NextResponse.json({ error: "gateway_id is required" }, { status: 400 });
    }

    const startDateStr = searchParams.get("start_date");
    const endDateStr = searchParams.get("end_date");

    let dateFilter: any;
    if (startDateStr) {
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      const end = endDateStr ? new Date(endDateStr) : new Date(startDateStr);
      end.setHours(23, 59, 59, 999);
      dateFilter = {
        gte: start,
        lte: end,
      };
    } else {
      // Default to last 7 days for performance
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: sevenDaysAgo };
    }

    const logs = await prisma.modbus_logs.findMany({
      where: {
        gateway_id: parseInt(gatewayId),
        recorded_at: dateFilter,
      },
      include: {
        register: {
          select: {
            name: true,
            unit: true,
            register_address: true,
            category: true,
            sub_category: true,
            scale_factor: true,
          },
        },
      },
      orderBy: {
        recorded_at: "asc",
      },
      take: 20000, // Safe upper boundary to protect memory
    });

    // Convert BigInt to string so it can be serialized to JSON
    const serializedLogs = logs.map((log: any) => ({
      ...log,
      id: log.id.toString(),
    }));

    return NextResponse.json({ logs: serializedLogs, count: serializedLogs.length });
  } catch (error: any) {
    console.error("Error fetching modbus logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
