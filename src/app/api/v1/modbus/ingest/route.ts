import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/v1/modbus/ingest
// Receives Modbus data from local agent and stores it in the database
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 });
    }

    // Validate API key against registered gateways
    const gateway = await prisma.modbus_gateways.findUnique({
      where: { api_key: apiKey },
      include: { registers: { where: { is_active: true } } },
    });

    if (!gateway || !gateway.is_active) {
      return NextResponse.json({ error: "Invalid or inactive gateway" }, { status: 403 });
    }

    const body = await req.json();
    const { readings } = body;

    if (!readings || !Array.isArray(readings)) {
      return NextResponse.json({ error: "Invalid payload: 'readings' array required" }, { status: 400 });
    }

    // Update last_seen_at timestamp
    await prisma.modbus_gateways.update({
      where: { id: gateway.id },
      data: { last_seen_at: new Date() },
    });

    // Build log entries
    const logEntries = [];
    const now = new Date();

    for (const reading of readings) {
      const { register_address, raw_value } = reading;
      
      // Find matching register config
      const register = gateway.registers.find(
        (r) => r.register_address === register_address
      );

      if (!register) continue;

      const scaledValue = raw_value * register.scale_factor;

      logEntries.push({
        gateway_id: gateway.id,
        register_id: register.id,
        raw_value: raw_value,
        scaled_value: scaledValue,
        recorded_at: now,
      });
    }

    // Bulk insert logs
    if (logEntries.length > 0) {
      await prisma.modbus_logs.createMany({ data: logEntries });
    }

    return NextResponse.json({
      success: true,
      gateway_name: gateway.name,
      readings_received: readings.length,
      readings_stored: logEntries.length,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("[Modbus Ingest Error]", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/v1/modbus/ingest
// Returns latest values for a gateway (used by dashboard)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gatewayId = searchParams.get("gateway_id");
    const hours = parseInt(searchParams.get("hours") || "1");

    if (!gatewayId) {
      return NextResponse.json({ error: "gateway_id required" }, { status: 400 });
    }

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await prisma.modbus_logs.findMany({
      where: {
        gateway_id: parseInt(gatewayId),
        recorded_at: { gte: since },
      },
      include: {
        register: {
          select: {
            name: true,
            category: true,
            sub_category: true,
            unit: true,
            register_address: true,
          },
        },
      },
      orderBy: { recorded_at: "desc" },
    });

    // Group by register and get latest + history
    const grouped: Record<string, any> = {};

    for (const log of logs) {
      const key = `${log.register.category}::${log.register.name}`;
      if (!grouped[key]) {
        grouped[key] = {
          name: log.register.name,
          category: log.register.category,
          sub_category: log.register.sub_category,
          unit: log.register.unit,
          register_address: log.register.register_address,
          latest: {
            value: log.scaled_value,
            raw: log.raw_value,
            at: log.recorded_at,
          },
          history: [],
        };
      }
      grouped[key].history.push({
        value: log.scaled_value,
        at: log.recorded_at,
      });
    }

    return NextResponse.json({
      gateway_id: parseInt(gatewayId),
      hours,
      data: Object.values(grouped),
    });
  } catch (error: any) {
    console.error("[Modbus GET Error]", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
