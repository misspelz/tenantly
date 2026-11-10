import { PropertySchema } from "@tenantly/contracts";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.post("/properties/validate", async (c) => {
  const body: unknown = await c.req.json();
  const result = PropertySchema.safeParse(body);

  if (!result.success) {
    return c.json({ errors: result.error.issues }, 400);
  }

  return c.json(result.data);
});

// `process.env` has an index signature, so `noPropertyAccessFromIndexSignature`
// requires bracket access: a reminder that the variable may not be set.
const port = Number(process.env["PORT"] ?? 4000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
