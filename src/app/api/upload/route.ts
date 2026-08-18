import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'misc';
    
    console.log(`[UPLOAD_API] Incoming file: ${file?.name}, Folder: ${folder}`);

    if (!file) {
      return NextResponse.json({ error: 'No files received.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    try {
      // Setup Google Drive Auth
      const keyPath = path.join(process.cwd(), '.gcp-service-account.json');
      if (fs.existsSync(keyPath)) {
        console.log("[UPLOAD_API] Google Drive credentials found. Uploading to Drive...");
        const auth = new google.auth.GoogleAuth({
          keyFile: keyPath,
          scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        
        const drive = google.drive({ version: 'v3', auth });
        
        // Convert buffer to stream
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        
        // Upload to Drive
        const response = await drive.files.create({
          requestBody: {
            name: fileName,
            mimeType: file.type,
            parents: ['1xbkEwELx9pmDXsufokqENm2mhf-___DO'] // User's DSSI > Database folder
          },
          media: {
            mimeType: file.type,
            body: stream,
          },
          fields: 'id',
          supportsAllDrives: true,
        });
        
        const fileId = response.data.id;
        
        if (fileId) {
          console.log(`[UPLOAD_API] File uploaded to GDrive. ID: ${fileId}. Making public...`);
          // Make public
          await drive.permissions.create({
            fileId: fileId,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
          });
          
          // Format for direct embedding
          const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
          console.log(`[UPLOAD_API] GDrive upload successful. URL: ${publicUrl}`);
          return NextResponse.json({ url: publicUrl, success: true });
        }
      } else {
        console.log("[UPLOAD_API] No GCP credentials found. Falling back to local upload.");
      }
    } catch (gdriveError) {
      console.error("GDrive Upload Error, falling back to local:", gdriveError);
    }
    
    // Fallback to local upload
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ url: `/api/assets/${folder}/${fileName}`, success: true });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
