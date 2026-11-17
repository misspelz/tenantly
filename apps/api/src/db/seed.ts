import { SignInSchema } from "@tenantly/contracts";

import { hashPassword } from "../auth/password.js";
import { db, pool } from "./index.js";
import { properties, users } from "./schema.js";

try {
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("The development seed cannot run in production.");
  }

  const configuredEmail = process.env["DEV_OWNER_EMAIL"];
  const password = process.env["DEV_OWNER_PASSWORD"];

  if (!configuredEmail || !password) {
    throw new Error(
      "DEV_OWNER_EMAIL and DEV_OWNER_PASSWORD are required to seed the development owner.",
    );
  }

  const email = SignInSchema.shape.email.safeParse(configuredEmail);

  if (!email.success) {
    throw new Error("DEV_OWNER_EMAIL must be a valid email address.");
  }

  if (password.length < 12) {
    throw new Error("DEV_OWNER_PASSWORD must be at least 12 characters long.");
  }

  if (password.length > 1024) {
    throw new Error("DEV_OWNER_PASSWORD must be no more than 1024 characters long.");
  }

  await db
    .insert(properties)
    .values({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Example property",
      address: "1 Example Street, Lagos",
    })
    .onConflictDoNothing();

  await db
    .insert(users)
    .values({
      email: email.data,
      passwordHash: await hashPassword(password),
      role: "owner",
    })
    .onConflictDoNothing({ target: users.email });

  console.info("Development property and owner seeds are ready.");
} finally {
  await pool.end();
}
