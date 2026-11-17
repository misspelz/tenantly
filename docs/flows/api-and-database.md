# API and database

How the Hono API connects to PostgreSQL, how schema changes are applied, and the shared request/response conventions.

## Local PostgreSQL

The root `compose.yaml` runs PostgreSQL 17 in Docker and binds port 5432 to `127.0.0.1` only. A named volume keeps database files when the container stops. Root `.env.example` contains local development settings; copy it to the ignored root `.env` before starting Compose:

```sh
cp .env.example .env
docker compose up -d
docker compose ps
```

Wait for the database health check to report `healthy`. Stop it with `docker compose stop`; restart it with `docker compose start`. `docker compose down` removes the container but keeps the named volume. Avoid `docker compose down -v` unless you intend to delete local database data.

`DATABASE_URL` is loaded from the repository root `.env` by the API environment module and Drizzle config. It is required; the API fails at startup with a clear message if it is missing. Do not commit `.env` or use the local example credentials outside development.

## Schema and migrations

Drizzle's PostgreSQL schema lives in `apps/api/src/db/schema.ts`. The initial `properties` table has a generated UUID primary key, required name and address, and timezone-aware creation and update timestamps. A database trigger updates `updated_at` on every row update.

After changing the schema, generate and review a migration:

```sh
pnpm --filter @tenantly/api db:generate
```

Generated SQL is stored under `apps/api/drizzle/`. Apply pending migrations to the configured database with:

```sh
pnpm --filter @tenantly/api db:migrate
```

Do not edit an already-applied migration. Create a new migration for subsequent schema changes.

## Seed data

After applying migrations, add a unique development owner email and a password of 12 to 1024 characters to the repository root `.env` as `DEV_OWNER_EMAIL` and `DEV_OWNER_PASSWORD`. Do not reuse a real password. Quote the password value if it contains `#` or whitespace so dotenv does not treat it as a comment or trim it. The seed refuses to run when `NODE_ENV=production`; these credentials are for local development only.

Run the seed to create the deterministic example property and development owner:

```sh
pnpm --filter @tenantly/api db:seed
```

The fixed property UUID and `ON CONFLICT DO NOTHING` make the seed repeatable. The owner email is trimmed and lowercased before insertion; an existing owner with that email is left unchanged.

## API conventions

`GET /health` checks the database connection and returns `{ "status": "ok", "database": "ok" }` when available.

`POST /properties` validates its request using `CreatePropertySchema` from `@tenantly/contracts`, inserts the property, and returns it with HTTP 201. `GET /properties` accepts `page` (default 1) and `pageSize` (default 20, maximum 100). Its response shape is:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

Errors use one envelope: `{ "error": { "code": "...", "message": "...", "details": [] } }`. `details` is included for validation failures. Malformed JSON returns `INVALID_JSON` with HTTP 400; schema and pagination failures return `VALIDATION_ERROR` with HTTP 400; unknown routes return `NOT_FOUND` with HTTP 404. Unexpected errors are logged server-side and return a generic `INTERNAL_SERVER_ERROR` with HTTP 500.

## Useful commands

| Command                                         | Does                                                 |
| ----------------------------------------------- | ---------------------------------------------------- |
| `pnpm --filter @tenantly/api dev`               | Run the API on port 4000                             |
| `pnpm --filter @tenantly/api db:generate`       | Generate a migration from the Drizzle schema         |
| `pnpm --filter @tenantly/api db:migrate`        | Apply pending migrations                             |
| `pnpm --filter @tenantly/api db:seed`           | Insert the repeatable development property and owner |
| `pnpm build` / `pnpm lint` / `pnpm check-types` | Validate the workspace and dependent packages        |
