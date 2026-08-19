import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gatewayId = searchParams.get("gateway_id");
    
    if (!gatewayId) {
      return NextResponse.json({ error: "gateway_id is required" }, { status: 400 });
    }

    // Fetch the last 30 days of logs by default
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const logs = await prisma.modbus_logs.findMany({
      where: {
        gateway_id: parseInt(gatewayId),
        recorded_at: { gte: thirtyDaysAgo }
      },
      include: {
        register: {
          select: {
            name: true,
            unit: true,
            register_address: true
          }
        }
      },
      orderBy: {
        recorded_at: "asc"
      }
    });

    // Convert BigInt to string so it can be serialized to JSON
    const serializedLogs = logs.map((log: any) => ({
      ...log,
      id: log.id.toString(),
    }));

    return NextResponse.json({ logs: serializedLogs });
  } catch (error: any) {
    console.error("Error fetching modbus logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
