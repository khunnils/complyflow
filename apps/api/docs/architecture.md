# API Architecture

Google OAuth authentication is required for workspace access, while multi-tenant membership remains intentionally deferred. Routes operate on the single current organization profile after an encrypted HTTP-only session cookie identifies the signed-in Google user. External inputs are validated with `@complyflow/shared` Zod schemas, and route handlers return structured JSON errors.

API code is organized by feature area under `src/features`:

- `features/organizations` owns the current organization profile route and the single-organization repository contract used by other features.
- `features/vendors` owns vendor CRUD routes, the provider catalog route, and vendor persistence. Vendor data-type validation reads the current organization data types through the organization repository.
- `features/documents` owns template routes, generated document routes, document persistence, and document-generation orchestration.

`src/app.ts` is the composition root. It configures Fastify, CORS, the central error handler, `/health`, OAuth/session auth, feature repositories, and feature route registration. Public auth paths are `/auth/google`, `/auth/google/callback`, `/auth/me`, and `/auth/logout`; workspace paths remain flat for Sprint 1: `/security-profile`, `/vendors`, `/providers`, `/templates`, and `/documents`.

The templates endpoint combines system templates read from versioned markdown files in `apps/api/data/templates` with organization-owned template copies from the repository. System template files use a simple metadata header followed by markdown content with Jinja-style placeholders. Adding a system template creates an editable organization template; the API does not mutate system template files at runtime.

Document generation builds a normalized context from the current organization profile and vendors, renders template markdown with Nunjucks, stores the generated markdown in `documents`, and computes a source hash from template content plus normalized context so stale documents can be detected.
