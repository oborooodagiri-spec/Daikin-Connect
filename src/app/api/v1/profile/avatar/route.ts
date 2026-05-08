import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP are allowed" }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 2MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if not exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `avatar_${Date.now()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/avatars/${filename}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
