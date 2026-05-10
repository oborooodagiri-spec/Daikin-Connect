import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client_v3";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("project_id") || "1";

    const activities = await prisma.service_activities.findMany({
      where: {
        units: { project_ref_id: BigInt(projectId) },
        deleted_at: null,
      },
      include: {
        units: { select: { room_tenant: true, tag_number: true } },
        activity_photos: { select: { photo_url: true } }
      },
      orderBy: { service_date: 'desc' }
    });

    const data = activities.map((a: any) => {
      const photos = a.activity_photos?.map((p: any) => p.photo_url) || [];
      // Also include the main photo_url if it's not in the activity_photos list
      if (a.photo_url && !photos.includes(a.photo_url)) {
        photos.unshift(a.photo_url);
      }

      return {
        id: a.id,
        date: a.service_date ? new Date(a.service_date).toISOString().split('T')[0] : null,
        tenant: a.units?.room_tenant || "",
        unit_tag: a.units?.tag_number || "",
        photos: photos.slice(0, 3) // Return up to 3 photos as requested by spreadsheet format
      };
    }).filter((a: any) => a.photos.length > 0);

    return NextResponse.json({
      success: true,
      count: data.length,
      data: data
    });

  } catch (error) {
    console.error("Photos Sync API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
