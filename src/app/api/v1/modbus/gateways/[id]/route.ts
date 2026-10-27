import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gateway = await prisma.modbus_gateways.findUnique({
      where: { id: parseInt(id) },
      include: {
        registers: true,
        projects: { select: { id: true, name: true } },
      },
    });
    if (!gateway) return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    return NextResponse.json({ gateway });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.modbus_gateways.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
