import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "nvt_session";
const MAX_AGE_S = 60 * 60 * 24 * 7;

/** HMAC key for the admin session. SESSION_SECRET is preferred; falling back to
 *  the admin password means changing the password also logs out every session. */
function secret(): string | null {
  return process.env.SESSION_SECRET || process.env.NVT_ADMIN_PASSWORD || null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Token format: "<expiresAtUnixSeconds>.<hmac>". */
export function createSessionToken(nowMs = Date.now()): string | null {
  const key = secret();
  if (!key) return null;
  const exp = String(Math.floor(nowMs / 1000) + MAX_AGE_S);
  return `${exp}.${sign(exp, key)}`;
}

export function verifySessionToken(token: string | undefined, nowMs = Date.now()): boolean {
  const key = secret();
  if (!key || !token) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac || !/^\d+$/.test(exp)) return false;
  if (Number(exp) * 1000 < nowMs) return false;
  return safeEqual(mac, sign(exp, key));
}

/** Constant-time credential check. Refuses when the env vars are missing, so an
 *  unconfigured deployment can never be logged into with empty credentials. */
export function checkCredentials(username: unknown, password: unknown): boolean {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.NVT_ADMIN_PASSWORD;
  if (!u || !p || typeof username !== "string" || typeof password !== "string") return false;
  return safeEqual(username, u) && safeEqual(password, p);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function setSession(): Promise<boolean> {
  const token = createSessionToken();
  if (!token) return false;
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_S,
    path: "/",
  });
  return true;
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
