import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

// `process.env` has an index signature, so `noPropertyAccessFromIndexSignature`
// requires bracket access: a reminder that the variable may not be set.
const port = Number(process.env["PORT"] ?? 4000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
