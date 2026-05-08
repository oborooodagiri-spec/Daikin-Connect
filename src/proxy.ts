import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * EPL Connect — Edge Proxy Security Layer (Next.js 16)
 * 
 * Provides:
 * 1. Session-based route protection
 * 2. IP-based rate limiting for API & auth routes
 * 3. Suspicious query parameter blocking (SQLi, XSS)
 * 4. Malicious bot user-agent blocking
 */

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "daikin-connect-secret-key-change-in-production"
);

// ─── In-Memory Rate Limiter (Edge-compatible) ───────────────────────────

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const AUTH_RATE_LIMIT = 10;     // 10 attempts per window for auth endpoints
const API_RATE_LIMIT = 60;      // 60 requests per window for general API
const RATE_WINDOW_MS = 60_000;  // 1 minute window

function checkIpRateLimit(ip: string, limit: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // Periodically prune expired entries
  if (Math.random() < 0.01) {
    for (const [key, val] of rateLimitStore) {
      if (val.resetTime < now) rateLimitStore.delete(key);
    }
  }

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count++;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - entry.count };
}

// ─── Suspicious Query Parameter Detection ───────────────────────────────

const SUSPICIOUS_PATTERNS = [
  /(union\s+select|drop\s+table|insert\s+into|delete\s+from)/i,
  /(<script|javascript:|on\w+\s*=)/i,
  /(\/etc\/passwd|\/proc\/self|cmd\.exe)/i,
];

function isSuspiciousQuery(search: string): boolean {
  if (!search) return false;
  try {
    const decoded = decodeURIComponent(search);
    return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(decoded));
  } catch {
    return false;
  }
}

// ─── Malicious Bot Detection ────────────────────────────────────────────

const BLOCKED_BOTS = [
  /zgrab/i, /masscan/i, /nuclei/i, /nikto/i, /sqlmap/i,
  /nmap/i, /dirbuster/i, /gobuster/i, /wpscan/i, /hydra/i,
];

function isMaliciousBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BLOCKED_BOTS.some(bot => bot.test(userAgent));
}

// ─── Main Proxy Handler ────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const userAgent = request.headers.get("user-agent");

  // 1. Block Malicious Bots
  if (isMaliciousBot(userAgent)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Block Suspicious Query Parameters
  if (isSuspiciousQuery(request.nextUrl.search)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // 3. Rate Limit: Auth Endpoints (strict — 10 req/min)
  if (pathname.startsWith("/api/v1/auth") || pathname === "/api/auth") {
    const key = `auth:${ip}`;
    const { allowed, remaining } = checkIpRateLimit(key, AUTH_RATE_LIMIT);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many authentication attempts. Please wait 1 minute." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": AUTH_RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": "0",
          }
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", AUTH_RATE_LIMIT.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  // 4. Rate Limit: General API Endpoints (60 req/min)
  if (pathname.startsWith("/api/")) {
    const key = `api:${ip}`;
    const { allowed, remaining } = checkIpRateLimit(key, API_RATE_LIMIT);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please slow down." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", API_RATE_LIMIT.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  // 5. Protected Routes: Require Session
  if ((pathname.startsWith("/w/") || pathname.startsWith("/dashboard") || pathname.startsWith("/home")) && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 6. If logged in and on login page, redirect to home
  if (pathname === "/" && session) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // 7. Validate session for protected user management routes
  if (pathname.startsWith("/dashboard/users") && session) {
    try {
      await jwtVerify(session, JWT_SECRET);
    } catch (e) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/home",
    "/api/:path*",
    "/w/:path*",
    "/dashboard/:path*",
    "/client/:path*",
  ],
};
