# Database Package Architecture

`@complyflow/db` owns Prisma and database mapping.

The database stores persistent Google-backed users, organizations, and organization memberships. Membership roles are `owner` and `member`; both can edit workspace data in the current product surface. Company attributes are flattened onto the `organizations` table, infrastructure/data handling/access sections use one-to-one profile tables, organization data categories live in `organization_data_types`, and vendor inventory is relational so vendors can be added, edited, and removed independently. `vendor_data_types` links each vendor to the organization data categories it processes. Editable template copies live in `templates` and retain their source system template slug for traceability. Generated markdown documents live in `documents` and keep a source hash for stale-state detection. API-facing payloads remain nested and are validated at API boundaries with shared Zod schemas.
