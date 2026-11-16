import { db, pool } from "./index.js";
import { properties } from "./schema.js";

try {
  await db
    .insert(properties)
    .values({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Example property",
      address: "1 Example Street, Lagos",
    })
    .onConflictDoNothing();

  console.info("Development property seed is ready.");
} finally {
  await pool.end();
}
