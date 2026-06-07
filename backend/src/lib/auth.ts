import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { AUTH_SECRET, JWT_EXPIRATION, COOKIE_NAME } from "./env.js";

const encoder = new TextEncoder();

export async function signSession(payload: Record<string, any>) {
  const alg = "HS256";
  const jwtBuilder = new SignJWT({ ...payload });
  if (payload.userId) jwtBuilder.setSubject(String(payload.userId));
  const jwt = await jwtBuilder
    .setProtectedHeader({ alg })
    .setIssuedAt()
    // .setExpirationTime(Math.floor(Date.now() / 1000) + JWT_EXPIRATION)
    .sign(encoder.encode(AUTH_SECRET));

  return jwt;
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, encoder.encode(AUTH_SECRET));
  return payload as JWTPayload;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: JWT_EXPIRATION * 1000,
    path: "/",
  };
}

export { COOKIE_NAME };
