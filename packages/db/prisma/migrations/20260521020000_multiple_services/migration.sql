-- Allow organizations to own multiple service profiles.
DROP INDEX IF EXISTS "service_profiles_organization_id_key";

CREATE INDEX IF NOT EXISTS "idx_service_profiles_organization_id" ON "service_profiles"("organization_id");

-- Vendor inventory rows belong to a service. Organization-level operational
-- provider selections keep this column null.
ALTER TABLE "organization_providers" ADD COLUMN "service_id" TEXT;

UPDATE "organization_providers" AS provider
SET "service_id" = (
  SELECT "id"
  FROM "service_profiles"
  WHERE "organization_id" = provider."organization_id"
  ORDER BY "created_at" ASC
  LIMIT 1
)
WHERE provider."system_type" IS NULL;

ALTER TABLE "organization_providers"
  ADD CONSTRAINT "organization_providers_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES "service_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_organization_providers_service_id" ON "organization_providers"("service_id");
