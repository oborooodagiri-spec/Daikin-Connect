import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializePrisma } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  try {
    const records = await prisma.vendor_attendance.findMany({
      take: 10,
      orderBy: { check_in_time: "desc" },
      include: {
        projects: { select: { name: true } }
      }
    });

    return NextResponse.json(serializePrisma({
      success: true,
      data: records
    }));
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
