import {
  ApiErrorSchema,
  AuthUserSchema,
  CreatePropertySchema,
  PaginationQuerySchema,
  PropertySchema,
  PropertiesListResponseSchema,
  SignInSchema,
  type UserRole,
} from "@tenantly/contracts";
import { serve } from "@hono/node-server";
import { count, desc, sql } from "drizzle-orm";
import { Hono, type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { getCookie } from "hono/cookie";

import { hashPassword, verifyPassword } from "./auth/password.js";
import {
  authCookieName,
  type AuthEnvironment,
  createSession,
  clearSessionCookie,
  requireSession,
  revokeSession,
  setSessionCookie,
} from "./auth/session.js";
import { env } from "./config/env.js";
import { db } from "./db/index.js";
import { properties, users } from "./db/schema.js";

const app = new Hono<AuthEnvironment>();
const dummyPasswordHash = hashPassword("invalid-user-password");

app.use(
  "*",
  cors({
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    maxAge: 600,
    origin: env.adminOrigin,
  }),
);

function toPropertyResponse(property: typeof properties.$inferSelect) {
  return {
    ...property,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
  };
}

function apiError(code: string, message: string, details?: unknown[]) {
  return ApiErrorSchema.parse({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

const requireTrustedOrigin: MiddlewareHandler<AuthEnvironment> = async (c, next) => {
  const origin = c.req.header("origin");

  if (origin && origin !== env.adminOrigin) {
    return c.json(apiError("FORBIDDEN", "Requests from this origin are not allowed."), 403);
  }

  await next();
};

app.onError((error, c) => {
  if (error instanceof SyntaxError) {
    return c.json(apiError("INVALID_JSON", "Request body must be valid JSON."), 400);
  }

  console.error("Unhandled API error:", error);
  return c.json(apiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred."), 500);
});

app.notFound((c) => c.json(apiError("NOT_FOUND", "The requested resource was not found."), 404));

app.get("/health", async (c) => {
  await db.execute(sql`select 1`);
  return c.json({ status: "ok", database: "ok" });
});

app.post("/auth/login", requireTrustedOrigin, async (c) => {
  const body: unknown = await c.req.json();
  const input = SignInSchema.safeParse(body);

  if (!input.success) {
    return c.json(
      apiError("VALIDATION_ERROR", "Request validation failed.", input.error.issues),
      400,
    );
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      role: users.role,
    })
    .from(users)
    .where(sql`lower(${users.email}) = ${input.data.email}`)
    .limit(1);
  const passwordMatches = user
    ? await verifyPassword(input.data.password, user.passwordHash)
    : await verifyPassword(input.data.password, await dummyPasswordHash);

  if (!user || !passwordMatches) {
    return c.json(apiError("INVALID_CREDENTIALS", "Email or password is incorrect."), 401);
  }

  const session = await createSession(user.id);
  setSessionCookie(c, session.token, session.expiresAt);

  return c.json(
    AuthUserSchema.parse({
      id: user.id,
      email: user.email,
      role: user.role,
    }),
  );
});

app.post("/auth/logout", requireTrustedOrigin, async (c) => {
  const token = getCookie(c, authCookieName);

  if (token) {
    await revokeSession(token);
  }

  clearSessionCookie(c);
  return c.json({ status: "ok" });
});

app.get("/auth/me", requireSession, (c) =>
  c.json(AuthUserSchema.parse(c.get("authenticatedUser"))),
);

function requireRoles(...allowedRoles: UserRole[]): MiddlewareHandler<AuthEnvironment> {
  return async (c, next) => {
    if (!allowedRoles.includes(c.get("authenticatedUser").role)) {
      return c.json(
        apiError("FORBIDDEN", "You do not have permission to perform this action."),
        403,
      );
    }

    await next();
  };
}

app.get(
  "/properties",
  requireSession,
  requireRoles("owner", "property_manager", "accountant"),
  async (c) => {
    const query = PaginationQuerySchema.safeParse(c.req.query());

    if (!query.success) {
      return c.json(
        apiError("VALIDATION_ERROR", "Request validation failed.", query.error.issues),
        400,
      );
    }

    const { page, pageSize } = query.data;
    const offset = (page - 1) * pageSize;
    const [data, countRows] = await Promise.all([
      db
        .select()
        .from(properties)
        .orderBy(desc(properties.createdAt), desc(properties.id))
        .limit(pageSize)
        .offset(offset),
      db.select({ totalItems: count() }).from(properties),
    ]);
    const countRow = countRows[0];

    if (!countRow) {
      throw new Error("Properties count query returned no result.");
    }

    const { totalItems } = countRow;
    const response = PropertiesListResponseSchema.parse({
      data: data.map(toPropertyResponse),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });

    return c.json(response);
  },
);

app.post(
  "/properties",
  requireTrustedOrigin,
  requireSession,
  requireRoles("owner", "property_manager"),
  async (c) => {
    const body: unknown = await c.req.json();
    const input = CreatePropertySchema.safeParse(body);

    if (!input.success) {
      return c.json(
        apiError("VALIDATION_ERROR", "Request validation failed.", input.error.issues),
        400,
      );
    }

    const [insertedProperty] = await db.insert(properties).values(input.data).returning();

    if (!insertedProperty) {
      throw new Error("Property insert returned no result.");
    }

    const property = PropertySchema.parse(toPropertyResponse(insertedProperty));
    return c.json(property, 201);
  },
);

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
