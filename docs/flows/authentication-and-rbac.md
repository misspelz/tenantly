# Authentication and role-based access

Tenantly authenticates users in the Hono API. The admin app uses the API session cookie for requests; hiding a control in the UI is only a usability measure, not an access-control boundary.

## Development owner

There is no public registration or invitation flow. Create a local owner using the development seed described in [API and database](./api-and-database.md). The seed is disabled when `NODE_ENV=production`; production owner provisioning is not implemented and must be solved before deployment.

User emails are trimmed and lowercased before sign-in and seed insertion. Passwords are hashed with Node.js `scrypt`; the plaintext password is never stored.

## Sessions and cookies

`POST /auth/login` validates credentials and creates a cryptographically random session token. Only its SHA-256 hash is stored in PostgreSQL. `GET /auth/me` resolves the current user from the unexpired session; `POST /auth/logout` deletes that session.

Sessions expire after seven days. The `tenantly_session` cookie is `HttpOnly`, `SameSite=Lax`, scoped to `/`, and `Secure` in production. The browser sends it with `credentials: "include"`; JavaScript cannot read the token. Deploy the admin app and API on the same site so the `SameSite=Lax` cookie is sent; cross-site deployments need an explicit CSRF and cookie-policy design.

The API allows credentialed CORS requests only from `ADMIN_ORIGIN`. In production, set `ADMIN_ORIGIN` to the exact admin app origin. State-changing browser requests with an `Origin` header are rejected unless it matches that configured origin. `NEXT_PUBLIC_API_URL` configures the admin app's API URL; it defaults to `http://localhost:4000` for local development.

## Roles and current permissions

| Role               | Properties      | Future resources                                      |
| ------------------ | --------------- | ----------------------------------------------------- |
| `owner`            | View and create | Full access                                           |
| `property_manager` | View and create | Manage units, tenants, leases and maintenance         |
| `accountant`       | View only       | View property, tenant and lease data; manage payments |

The API currently enforces authentication on property routes, allows all three roles to list properties, and allows only owners and property managers to create them. The accountant's payment permission will be enforced when payment routes are added. New API routes must define and enforce their role policy; UI visibility alone is not sufficient.

## Endpoints

| Method | Path           | Access                  | Purpose                                           |
| ------ | -------------- | ----------------------- | ------------------------------------------------- |
| `POST` | `/auth/login`  | Public                  | Validate email and password; set session cookie   |
| `GET`  | `/auth/me`     | Authenticated           | Return the current user's id, email and role      |
| `POST` | `/auth/logout` | Public                  | Revoke the presented session and clear the cookie |
| `GET`  | `/properties`  | All roles               | List properties                                   |
| `POST` | `/properties`  | Owner, property manager | Create a property                                 |

Invalid credentials return the same generic response regardless of whether an email exists. Unauthenticated requests return `UNAUTHENTICATED`; authenticated requests without permission return `FORBIDDEN`.

## Local workflow

1. Configure `DEV_OWNER_EMAIL`, `DEV_OWNER_PASSWORD`, and `ADMIN_ORIGIN` in the root `.env`. Quote the password if it contains `#` or whitespace.
2. Apply pending database migrations and run `pnpm --filter @tenantly/api db:seed`.
3. Start the API with `pnpm --filter @tenantly/api dev` and the admin with `pnpm --filter @tenantly/admin dev`.
4. Sign in at `http://localhost:3001/login`.
