import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = pathSegments.join("/");
    const absolutePath = path.join(process.cwd(), "public", "uploads", filePath);

    // Security check: ensure the path is within the uploads directory
    const resolvedPath = path.resolve(absolutePath);
    const baseUploadsPath = path.resolve(path.join(process.cwd(), "public", "uploads"));

    if (!resolvedPath.startsWith(baseUploadsPath)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    let targetPath = resolvedPath;
    let found = fs.existsSync(targetPath);

    if (!found) {
      // Aggressive fallback: search recursively for the filename in public/uploads
      const fileName = path.basename(filePath);
      const fileNameLower = fileName.toLowerCase();
      
      const searchDirs = [
        path.join(process.cwd(), "public", "uploads"),
        path.join(process.cwd(), "uploads"), // Check root uploads too just in case
      ];

      function findRecursive(dir: string): string | null {
        if (!fs.existsSync(dir)) return null;
        try {
          const items = fs.readdirSync(dir);
          for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              const result = findRecursive(fullPath);
              if (result) return result;
            } else if (item.toLowerCase() === fileNameLower) {
              return fullPath;
            }
          }
        } catch (e) {
          console.error(`Error searching in ${dir}:`, e);
        }
        return null;
      }

      for (const baseDir of searchDirs) {
        const result = findRecursive(baseDir);
        if (result) {
          targetPath = result;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetPath);
    const finalExt = path.extname(targetPath).toLowerCase();
    const finalFileName = path.basename(targetPath);
    
    let contentType = "application/octet-stream";
    if (finalExt === ".jpg" || finalExt === ".jpeg") contentType = "image/jpeg";
    else if (finalExt === ".png") contentType = "image/png";
    else if (finalExt === ".gif") contentType = "image/gif";
    else if (finalExt === ".webp") contentType = "image/webp";
    else if (finalExt === ".pdf") contentType = "application/pdf";
    else if (finalExt === ".svg") contentType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${finalFileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Asset-Resolved": "true",
        "X-Asset-Path": targetPath.includes("uploads") ? targetPath.split("uploads")[1] : targetPath,
      },
    });
  } catch (error) {
    console.error("Asset Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
