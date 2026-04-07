import fs from "fs/promises";
import path from "path";
import { gdrive } from "./googleDrive";
import { prisma } from "./prisma";

/**
 * MEDIA SYNC HELPER
 * Orchestrates local file reading and Google Drive cloud backup.
 */

export async function syncMediaToOneDrive(mediaId: number, table: "activity_photos" | "corrective" | "complaints") {
  try {
    // 1. Fetch record from DB
    let record: any;
    if (table === "activity_photos") {
      record = await prisma.activity_photos.findUnique({ where: { id: mediaId } });
    } else if (table === "corrective") {
      record = await (prisma.corrective as any).findUnique({ where: { id: mediaId } });
    } else if (table === "complaints") {
      record = await (prisma.complaints as any).findUnique({ where: { id: mediaId } });
    }

    if (!record || !record.photo_url) return;

    // 2. Resolve local path
    const relativePath = record.photo_url.startsWith("/") ? record.photo_url.substring(1) : record.photo_url;
    const absolutePath = path.join(process.cwd(), "public", relativePath);

    // 3. Read file & detect mime
    const fileBuffer = await fs.readFile(absolutePath);
    const fileName = path.basename(absolutePath);
    const isVideo = fileName.match(/\.(mp4|mov|avi)$/i);
    const mimeType = isVideo ? "video/mp4" : "image/jpeg";

    // 4. Upload to Google Drive
    const driveFileId = await gdrive.uploadFile(fileBuffer, fileName, mimeType);

    if (driveFileId) {
      // 5. Update DB
      const updateData = { onedrive_id: driveFileId }; // We reuse onedrive_id field to avoid another migration
      if (table === "activity_photos") {
        await prisma.activity_photos.update({ where: { id: mediaId }, data: updateData });
      } else if (table === "corrective") {
        await (prisma.corrective as any).update({ where: { id: mediaId }, data: updateData });
      } else if (table === "complaints") {
        await (prisma.complaints as any).update({ where: { id: mediaId }, data: updateData });
      }
      console.log(`Successfully synced ${fileName} to GDrive ID: ${driveFileId}`);
    }
  } catch (e) {
    console.error(`Media Sync Error for ID ${mediaId}:`, e);
  }
}
