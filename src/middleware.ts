import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { INTRO_COOKIE } from "@/lib/intro/constants";
import { isAdminSession, verifySessionEdge } from "@/lib/auth/session-edge";

const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX = 120;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local"
  );
}

function hasAccess(req: NextRequest): boolean {
  if (req.cookies.get(SESSION_COOKIE)?.value) return true;
  if (req.cookies.get("ef_guest_ok")?.value === "1") return true;
  return false;
}

function hasSeenIntro(req: NextRequest): boolean {
  return req.cookies.get(INTRO_COOKIE)?.value === "1";
}

async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const payload = await verifySessionEdge(token);
  return isAdminSession(payload);
}

const DEFAULT_ALLOWED_ORIGINS = ["https://localhost", "http://localhost:3000"];

function allowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS;
  return env ? env.split(",").map((o) => o.trim()).filter(Boolean) : DEFAULT_ALLOWED_ORIGINS;
}

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin");
  if (!origin || !allowedOrigins().includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function withCors(req: NextRequest, res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(corsHeaders(req))) res.headers.set(k, v);
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return withCors(request, new NextResponse(null, { status: 204 }));
    }

    const ip = clientIp(request);
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now > entry.reset) {
      hits.set(ip, { count: 1, reset: now + WINDOW_MS });
      return withCors(request, NextResponse.next());
    }

    entry.count += 1;
    if (entry.count > MAX) {
      return withCors(request, NextResponse.json({ error: "Rate limit aşıldı" }, { status: 429 }));
    }
    return withCors(request, NextResponse.next());
  }

  if (pathname === "/demo" || pathname.startsWith("/admin")) {
    const admin = await isAdminRequest(request);
    if (!admin) {
      const url = new URL("/welcome", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const access = hasAccess(request);

  if (!access && pathname === "/intro") {
    return NextResponse.next();
  }

  if (!access && !hasSeenIntro(request)) {
    const needsIntro =
      pathname === "/" ||
      pathname === "/welcome" ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/results");

    if (needsIntro) {
      const url = new URL("/intro", request.url);
      if (pathname !== "/" && pathname !== "/welcome") {
        url.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/") {
    if (!access) {
      return NextResponse.redirect(new URL("/welcome", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/onboarding") || pathname.startsWith("/results")) {
    if (!access) {
      const url = new URL("/welcome", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/** Yalnizca sayfa rotalari — _next/static CSS/JS asla middleware'e girmez */
export const config = {
  matcher: [
    "/",
    "/intro",
    "/welcome",
    "/plans",
    "/account",
    "/admin",
    "/admin/:path*",
    "/demo",
    "/journey",
    "/onboarding/:path*",
    "/results/:path*",
    "/api/:path*",
  ],
};
