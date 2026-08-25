import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const authUrl = new URL("/api/auth/get-session", request.url);

  try {
    const res = await fetch(authUrl, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    const session = await res.json();

    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    console.error("Middleware Auth Verification Error:", error);
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
