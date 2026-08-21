import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "@/app/lib/session";

export async function POST() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return resposta;
}