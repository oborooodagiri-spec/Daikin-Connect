import { google } from "googleapis";
import { Readable } from "stream";

/**
 * GOOGLE DRIVE SERVICE (STORAGE & SYNC)
 * Handles automatic documentation backup using a Service Account.
 */

const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private drive: any;

  private constructor() {
    this.initialize();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new GoogleDriveService();
    }
    return this.instance;
  }

  private initialize() {
    if (!clientEmail || !privateKey) {
      console.warn("Google Service Account credentials missing. GDrive sync disabled.");
      return;
    }

    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.metadata"]
    );

    this.drive = google.drive({ version: "v3", auth });
  }

  /**
   * Uploads a file to Google Drive.
   * Returns the File ID if successful.
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string) {
    if (!this.drive) return null;

    try {
      const folder = folderId || "root";
      
      const fileMetadata = {
        name: fileName,
        parents: [folder],
      };

      const media = {
        mimeType: mimeType,
        body: Readable.from(fileBuffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink",
      });

      // Optional: Set permissions so anyone with the link can view (for embedding)
      // Note: For tighter security, you'd proxy these through your API.
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      return response.data.id;
    } catch (e) {
      console.error("GDrive Upload Error:", e);
      return null;
    }
  }

  /**
   * Generates a direct stream/view link for embedding.
   */
  getEmbedLink(fileId: string) {
    return `https://drive.google.com/get_video_info?docid=${fileId}`; // For Video Player
    // For general iframe: `https://drive.google.com/file/d/${fileId}/preview`
  }
}

export const gdrive = GoogleDriveService.getInstance();
