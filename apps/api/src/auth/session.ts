import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lte } from "drizzle-orm";
import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import type { AuthUser } from "@tenantly/contracts";

import { env } from "../config/env.js";
import { db } from "../db/index.js";
import { sessions, users } from "../db/schema.js";

export const authCookieName = "tenantly_session";
export const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

export interface AuthEnvironment {
  Variables: {
    authenticatedUser: AuthUser;
  };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function setSessionCookie(c: Context, token: string, expiresAt: Date): void {
  setCookie(c, authCookieName, token, {
    expires: expiresAt,
    httpOnly: true,
    maxAge: Math.floor(sessionDurationMs / 1000),
    path: "/",
    sameSite: "Lax",
    secure: env.isProduction,
  });
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, authCookieName, {
    path: "/",
    sameSite: "Lax",
    secure: env.isProduction,
  });
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  await db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  return { token, expiresAt };
}

export async function revokeSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

export const requireSession: MiddlewareHandler<AuthEnvironment> = async (c, next) => {
  const token = getCookie(c, authCookieName);

  if (!token) {
    return c.json({ error: { code: "UNAUTHENTICATED", message: "Sign in to continue." } }, 401);
  }

  const [session] = await db
    .select({
      user: {
        id: users.id,
        email: users.email,
        role: users.role,
      },
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!session) {
    clearSessionCookie(c);
    return c.json({ error: { code: "UNAUTHENTICATED", message: "Sign in to continue." } }, 401);
  }
  c.set("authenticatedUser", session.user);
  await next();
};
