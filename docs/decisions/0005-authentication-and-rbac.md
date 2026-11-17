# 0005: Authentication and role-based access

## Context

The API and admin app need a shared authentication flow with server-enforced roles. The project has PostgreSQL and Drizzle, but no account or invitation service. This is a portfolio project, so the first implementation should demonstrate real session security without introducing public registration or email delivery.

## Decision

- Use email and password, hashing passwords with Node.js `scrypt`.
- Use random opaque session tokens in an `HttpOnly`, `SameSite=Lax` cookie. Store only SHA-256 token hashes in PostgreSQL and expire sessions after seven days.
- Keep authorization in the API; the admin app only hides controls that the user's role cannot use.
- Define `owner`, `property_manager`, and `accountant` roles. Owners have full access; property managers manage properties and operational records; accountants view property/tenant/lease data and manage payments.
- Seed a development owner from local environment variables and disable the seed in production. Do not provide public sign-up or invitations in this milestone.
- Allow credentialed browser requests only from the configured admin origin, and validate `Origin` on state-changing browser requests.

## Alternatives

- Stateless signed sessions were not chosen because immediate revocation and logout would be harder.
- Public owner registration was not chosen because it would allow arbitrary account creation.
- Invitation-only registration was deferred because it requires invitation and email-delivery flows outside this milestone.

## Consequences

- Session validation requires a database lookup, while logout and revocation take effect immediately.
- Production must use HTTPS and configure the exact `ADMIN_ORIGIN`.
- A secure production first-owner provisioning process is still required before deployment; the development seed is not that process.
- Every new API route must explicitly enforce its role policy. Role permissions for resources not yet implemented are documented and must be applied as those routes are added.
