import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "daikin-connect-secret-key-change-in-production"
);

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // 1. If trying to access dashboard without session, redirect to login
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. If logged in and trying to access login page, redirect to dashboard
  if (pathname === "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Role-based protection for User Management
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
  matcher: ["/", "/dashboard/:path*", "/client/:path*"],
};
