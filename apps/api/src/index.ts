import {
  ApiErrorSchema,
  CreatePropertySchema,
  PaginationQuerySchema,
  PropertySchema,
  PropertiesListResponseSchema,
} from "@tenantly/contracts";
import { serve } from "@hono/node-server";
import { count, desc, sql } from "drizzle-orm";
import { Hono } from "hono";

import { env } from "./config/env.js";
import { db } from "./db/index.js";
import { properties } from "./db/schema.js";

const app = new Hono();

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

app.get("/properties", async (c) => {
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
});

app.post("/properties", async (c) => {
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
});

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
