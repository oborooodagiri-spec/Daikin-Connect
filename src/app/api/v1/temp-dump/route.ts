import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveAttendance } from "@/app/actions/attendance";
import { getSession } from "@/app/actions/auth";
import { serializePrisma } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const activeRes = await getActiveAttendance("empty");
    const rawActive = await prisma.vendor_attendance.findFirst({
      where: {
        user_id: session?.userId ? parseInt(session.userId) : 10,
        OR: [
          { check_out_photo: null },
          { check_out_photo: "" }
        ]
      },
      include: {
        projects: { select: { name: true } }
      },
      orderBy: { check_in_time: "desc" }
    });

    return NextResponse.json(serializePrisma({
      success: true,
      session,
      activeRes,
      rawActive
    }));
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
