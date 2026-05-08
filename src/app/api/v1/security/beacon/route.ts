import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
       return new Response('Unauthorized', { status: 401 });
    }

    // Capture the signal even if the connection closes quickly
    await prisma.audit_logs.create({
      data: {
        user_id: parseInt(session.userId),
        action: "SESSION_END_BEACON",
        details: "Auto-detected tab close or browser exit",
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
        user_agent: req.headers.get('user-agent') || 'Unknown'
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return new Response('Error', { status: 500 });
  }
}
