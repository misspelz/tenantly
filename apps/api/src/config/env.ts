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

const isProduction = process.env["NODE_ENV"] === "production";
const configuredAdminOrigin =
  process.env["ADMIN_ORIGIN"] ?? (isProduction ? undefined : "http://localhost:3001");

if (!configuredAdminOrigin) {
  throw new Error("ADMIN_ORIGIN is required in production.");
}

let adminOrigin: string;

try {
  const parsedOrigin = new URL(configuredAdminOrigin);

  if (
    !["http:", "https:"].includes(parsedOrigin.protocol) ||
    parsedOrigin.origin !== configuredAdminOrigin
  ) {
    throw new Error();
  }

  if (isProduction && parsedOrigin.protocol !== "https:") {
    throw new Error("ADMIN_ORIGIN must use HTTPS in production.");
  }

  adminOrigin = parsedOrigin.origin;
} catch {
  throw new Error(
    isProduction
      ? "ADMIN_ORIGIN must be an HTTPS origin without a path."
      : "ADMIN_ORIGIN must be an HTTP(S) origin without a path.",
  );
}

export const env = {
  databaseUrl,
  adminOrigin,
  isProduction,
  port,
};
