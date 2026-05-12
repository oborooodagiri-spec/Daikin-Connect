import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    // Clean up path segments to remove redundant 'public', 'uploads', 'api', or 'assets'
    const cleanSegments = pathSegments.filter(s => 
      s.toLowerCase() !== "public" && 
      s.toLowerCase() !== "uploads" && 
      s.toLowerCase() !== "api" && 
      s.toLowerCase() !== "assets"
    );

    // VPS Path Normalization: Check common deployment roots
    const cwd = process.cwd();
    const possibleRoots = [
      cwd,
      path.join(cwd, ".."), // parent dir (for some pm2/next deployments)
      "/home/daikin-connect/public_html", // common shared hosting path
      "/var/www/html"
    ];

    let targetPath = "";
    let found = false;

    // Direct path construction
    const relativePath = path.join("public", "uploads", ...cleanSegments);
    
    for (const root of possibleRoots) {
      const fullPath = path.join(root, relativePath);
      if (fs.existsSync(fullPath)) {
        targetPath = fullPath;
        found = true;
        break;
      }
    }

    if (!found) {
      // Aggressive fallback: search recursively for the filename in public/uploads
      const fileName = cleanSegments[cleanSegments.length - 1] || "";
      const fileNameLower = fileName.toLowerCase();
      
      const searchDirs = [
        path.join(process.cwd(), "public", "uploads"),
        path.join(process.cwd(), "public"),
        path.join(process.cwd(), "uploads"),
        process.cwd(), // Last resort: search entire project root (be careful, but it's restricted by fileName match)
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
      // PRO-TIP: If we are on localhost and the file isn't here, try to redirect to production
      const isLocal = req.headers.get("host")?.includes("localhost");
      if (isLocal) {
        const prodUrl = `https://daikin-connect.com/api/assets/${cleanSegments.join("/")}`;
        return NextResponse.redirect(prodUrl);
      }
      
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetPath);
    let finalExt = path.extname(targetPath).toLowerCase();
    const finalFileName = path.basename(targetPath);
    
    let contentType = "application/octet-stream";
    
    // Sniff content type from buffer if extension is missing or generic
    if (!finalExt || finalExt === "" || finalExt === ".blob") {
      // Magic numbers check
      if (fileBuffer.length > 4) {
        const hex = fileBuffer.slice(0, 4).toString('hex').toUpperCase();
        if (hex.startsWith("FFD8FF")) contentType = "image/jpeg";
        else if (hex === "89504E47") contentType = "image/png";
        else if (hex === "47494638") contentType = "image/gif";
        else if (fileBuffer.slice(0, 12).toString().includes("RIFF") && fileBuffer.slice(0, 12).toString().includes("WEBP")) contentType = "image/webp";
        else if (fileBuffer.slice(0, 4).toString() === "%PDF") contentType = "application/pdf";
      }
      
      // Fallback: if it's in a photos or preventive directory and still unknown, assume image/jpeg
      if (contentType === "application/octet-stream") {
        if (targetPath.includes("photos") || targetPath.includes("preventive") || targetPath.includes("corrective") || targetPath.includes("-blob")) {
          contentType = "image/jpeg";
        }
      }
    } else {
      if (finalExt === ".jpg" || finalExt === ".jpeg") contentType = "image/jpeg";
      else if (finalExt === ".png") contentType = "image/png";
      else if (finalExt === ".gif") contentType = "image/gif";
      else if (finalExt === ".webp") contentType = "image/webp";
      else if (finalExt === ".pdf") contentType = "application/pdf";
      else if (finalExt === ".svg") contentType = "image/svg+xml";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${finalFileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Asset-Resolved": "true",
        "X-Asset-Path": targetPath.includes("uploads") ? targetPath.split("uploads")[1] : targetPath,
        "X-Content-Type-Source": finalExt ? "extension" : "buffer-sniffing"
      },
    });
  } catch (error) {
    console.error("Asset Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
