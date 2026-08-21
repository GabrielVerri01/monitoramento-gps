import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionValue,
} from "@/app/lib/session";

const PUBLIC_API_PATHS = new Set([
  "/api/login",
  "/api/cadastrar",
  "/api/logout",
]);

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (PUBLIC_API_PATHS.has(pathname)) return NextResponse.next();

  const session = verifySessionValue(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const loginUrl = new URL("/", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/paginas/mapa/:path*", "/api/:path*"],
};