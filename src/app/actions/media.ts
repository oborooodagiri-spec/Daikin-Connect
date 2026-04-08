"use server";

import { prisma } from "@/lib/prisma";
import { serializePrisma } from "@/lib/serialize";
import { getSession } from "./auth";

/**
 * Fetches all media (photos and videos) for a specific unit,
 * grouped by date with metadata about who uploaded it and why.
 */
export async function getUnitMediaHistory(unitId: number) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const media = await prisma.activity_photos.findMany({
      where: {
        service_activities: {
          unit_id: unitId
        }
      },
      include: {
        service_activities: {
          select: {
            service_date: true,
            inspector_name: true,
            type: true,
            id: true
          }
        }
      },
      orderBy: {
        service_activities: {
          service_date: 'desc'
        }
      }
    });

    // Grouping logic by date
    const groupedMedia: Record<string, any[]> = {};

    media.forEach((m: any) => {
      const date = m.service_activities?.service_date 
        ? new Date(m.service_activities.service_date).toISOString().split('T')[0]
        : 'Unknown Date';
      
      if (!groupedMedia[date]) {
        groupedMedia[date] = [];
      }

      groupedMedia[date].push({
        id: m.id,
        url: m.photo_url,
        type: m.media_type || 'image',
        description: m.description || m.caption || "",
        inspector: m.service_activities?.inspector_name || "Unknown",
        reportType: m.service_activities?.type || "Activity",
        reportId: m.service_activities?.id
      });
    });

    return serializePrisma({ 
      success: true, 
      data: Object.entries(groupedMedia).map(([date, items]) => ({
        date,
        items
      }))
    });
  } catch (error: any) {
    console.error("Fetch media history error:", error);
    return { error: "Failed to fetch media history." };
  }
}
