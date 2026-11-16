import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({ path: fileURLToPath(new URL("../../../../.env", import.meta.url)) });

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it in the repository root .env file.");
}

const port = Number(process.env["PORT"] ?? 4000);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

export const env = {
  databaseUrl,
  port,
};
