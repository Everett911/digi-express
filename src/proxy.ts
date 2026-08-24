import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
