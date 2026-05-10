/**
 * Normalizes photo URLs from the database to ensure they work in both local and production.
 * Handles:
 * 1. Absolute URLs (http...)
 * 2. Already proxied URLs (/api/assets/...)
 * 3. Legacy upload paths (/uploads/...)
 * 4. Naked filenames (image.jpg)
 */
export function getPhotoUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // 1. If it's already a full URL or starts with /, but contains /uploads/
  // We want to force it through our proxy
  if (url.includes("/uploads/")) {
    const segments = url.split("/uploads/");
    const filePath = segments[segments.length - 1];
    return `/api/assets/${filePath}`;
  }

  // 2. If it starts with /api/assets/, it's already using the proxy
  if (url.startsWith("/api/assets/")) return url;
  
  // 3. If it's a full external URL (without /uploads/), return as is
  if (url.startsWith("http")) return url;
  
  // 4. If it's a naked filename (no leading slash and no path), prepend proxy path
  if (!url.startsWith("/") && !url.includes("/")) {
    return `/api/assets/${url}`;
  }
  
  return url;
}
