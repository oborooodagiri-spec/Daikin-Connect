import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// GET /api/v1/modbus/gateways — List all gateways
export async function GET() {
  try {
    const gateways = await prisma.modbus_gateways.findMany({
      include: {
        registers: { orderBy: [{ category: "asc" }, { sort_order: "asc" }] },
        projects: { select: { id: true, name: true } },
        _count: { select: { logs: true } },
      },
      orderBy: { created_at: "desc" },
    });

    // Calculate dynamic status based on last_seen_at
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const enriched = gateways.map((gw) => ({
      ...gw,
      status: gw.last_seen_at && gw.last_seen_at > fiveMinAgo ? "active" : "inactive",
    }));

    return NextResponse.json({ gateways: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/v1/modbus/gateways — Create a new gateway
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, ip_address, port, slave_id, poll_interval, project_id } = body;

    if (!name || !ip_address) {
      return NextResponse.json({ error: "name and ip_address required" }, { status: 400 });
    }

    // Generate a secure API key
    const apiKey = crypto.randomBytes(32).toString("hex");

    const gateway = await prisma.modbus_gateways.create({
      data: {
        name,
        description: description || null,
        ip_address,
        port: port || 502,
        slave_id: slave_id || 1,
        poll_interval: poll_interval || 60,
        api_key: apiKey,
        project_id: project_id ? BigInt(project_id) : null,
      },
    });

    return NextResponse.json({
      success: true,
      gateway: {
        id: gateway.id,
        name: gateway.name,
        api_key: apiKey,
        ip_address: gateway.ip_address,
        port: gateway.port,
      },
      message: "Gateway created. Use the api_key in the local agent config.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/v1/modbus/gateways — Update a gateway
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.api_key;
    delete updateData.created_at;

    if (updateData.project_id) {
      updateData.project_id = BigInt(updateData.project_id);
    }

    const gateway = await prisma.modbus_gateways.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, gateway });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
