import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/v1/modbus/registers?gateway_id=X — List registers for a gateway
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gatewayId = searchParams.get("gateway_id");

    if (!gatewayId) {
      return NextResponse.json({ error: "gateway_id required" }, { status: 400 });
    }

    const registers = await prisma.modbus_registers.findMany({
      where: { gateway_id: parseInt(gatewayId) },
      orderBy: [{ category: "asc" }, { sort_order: "asc" }, { register_address: "asc" }],
    });

    return NextResponse.json({ registers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/v1/modbus/registers — Create or bulk-create registers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gateway_id, registers } = body;

    if (!gateway_id) {
      return NextResponse.json({ error: "gateway_id required" }, { status: 400 });
    }

    // Support single or bulk creation
    const items = Array.isArray(registers) ? registers : [body];

    const created = [];
    for (const item of items) {
      const register = await prisma.modbus_registers.create({
        data: {
          gateway_id: parseInt(gateway_id),
          name: item.name,
          description: item.description || null,
          category: item.category || "General",
          sub_category: item.sub_category || null,
          register_address: item.register_address,
          register_type: item.register_type || "holding",
          data_type: item.data_type || "INT16",
          scale_factor: item.scale_factor || 1,
          unit: item.unit || null,
          is_active: item.is_active !== false,
          sort_order: item.sort_order || 0,
        },
      });
      created.push(register);
    }

    return NextResponse.json({
      success: true,
      count: created.length,
      registers: created,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/v1/modbus/registers — Update a register
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    delete updateData.created_at;

    const register = await prisma.modbus_registers.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, register });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/v1/modbus/registers — Delete a register
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await prisma.modbus_registers.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
