# 0004: Database foundation

## Context

The API needs a PostgreSQL setup that works locally and can later use the planned Neon-hosted database. Schema changes must be reviewable and repeatable, and database types should align with the shared Zod contracts.

## Decision

Use PostgreSQL 17 with Drizzle ORM and the `pg` Node driver. Run PostgreSQL locally through Docker Compose with a named data volume and a localhost-only port binding. Read the connection string from the repository root `.env`; keep the example values in `.env.example`.

Define database tables in the API's Drizzle schema, generate SQL migrations with Drizzle Kit, and apply them with its migration runner. Use database defaults for UUIDs and timestamps, plus a trigger to maintain `updated_at`. Keep Zod request/response schemas in the shared contracts package.

## Alternatives

- Use SQLite locally: rejected because production is planned for PostgreSQL, and SQL behaviour and types should match between local development and hosted environments.
- Use an ORM that generates migrations implicitly: rejected in favour of explicit SQL migrations that can be reviewed and applied reproducibly.
- Rely on application code to update `updated_at`: rejected because direct SQL writes would bypass the timestamp behaviour.

## Consequences

- Local and hosted environments use PostgreSQL-compatible schema and driver behaviour.
- Migrations are explicit SQL and must be reviewed before application.
- Docker and a local `.env` are required for database development.
- Owner relationships are deferred until user accounts and authentication exist.
