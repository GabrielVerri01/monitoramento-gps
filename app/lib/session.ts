import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "gps_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

type SessionPayload = {
  userId: number;
  usuario: string;
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET deve ter pelo menos 32 caracteres");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createSessionValue(user: { id: number; usuario: string }): string {
  const payload = Buffer.from(
    JSON.stringify({
      userId: user.id,
      usuario: user.usuario,
      exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value: string | undefined): SessionPayload | null {
  if (!value) return null;

  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  try {
    const expectedSignature = sign(payload);
    if (
      signature.length !== expectedSignature.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as SessionPayload;

    if (
      !Number.isInteger(session.userId) ||
      typeof session.usuario !== "string" ||
      !Number.isInteger(session.exp) ||
      session.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}