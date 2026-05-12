-- CreateTable
CREATE TABLE "organization_data_types" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_sensitive" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_data_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_data_types" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "organization_data_type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_data_types_pkey" PRIMARY KEY ("id")
);

-- Migrate organization data types from the former JSON payload.
INSERT INTO "organization_data_types" (
    "id",
    "organization_id",
    "name",
    "is_sensitive",
    "description",
    "created_at",
    "updated_at"
)
SELECT DISTINCT ON (source."organization_id", source."name")
    'odt_' || substr(md5(source."organization_id" || ':' || source."name"), 1, 24),
    source."organization_id",
    source."name",
    source."is_sensitive",
    source."description",
    source."created_at",
    source."updated_at"
FROM (
    SELECT
        "organization_id",
        trim(coalesce(data_type->>'name', data_type->>'type')) AS "name",
        coalesce((data_type->>'isSensitive')::boolean, false) AS "is_sensitive",
        coalesce(data_type->>'description', '') AS "description",
        "created_at",
        "updated_at"
    FROM "data_handling_profiles"
    CROSS JOIN LATERAL jsonb_array_elements("data_types_stored") AS data_type
    WHERE trim(coalesce(data_type->>'name', data_type->>'type', '')) <> ''
) AS source
ORDER BY source."organization_id", source."name", source."created_at";

-- CreateIndex
CREATE UNIQUE INDEX "organization_data_types_organization_id_name_key" ON "organization_data_types"("organization_id", "name");

-- Preserve vendor processed-data values by linking them to organization data types.
INSERT INTO "organization_data_types" (
    "id",
    "organization_id",
    "name",
    "is_sensitive",
    "description",
    "created_at",
    "updated_at"
)
SELECT DISTINCT ON (source."organization_id", source."name")
    'odt_' || substr(md5(source."organization_id" || ':' || source."name"), 1, 24),
    source."organization_id",
    source."name",
    false,
    '',
    source."created_at",
    source."updated_at"
FROM (
    SELECT
        "organization_id",
        trim(data_type) AS "name",
        "created_at",
        "updated_at"
    FROM "vendors"
    CROSS JOIN LATERAL unnest("data_processed") AS data_type
    WHERE trim(data_type) <> ''
) AS source
ON CONFLICT ("organization_id", "name") DO NOTHING;

INSERT INTO "vendor_data_types" (
    "id",
    "vendor_id",
    "organization_data_type_id",
    "created_at",
    "updated_at"
)
SELECT DISTINCT ON (vendor."id", organization_data_type."id")
    'vdt_' || substr(md5(vendor."id" || ':' || organization_data_type."id"), 1, 24),
    vendor."id",
    organization_data_type."id",
    vendor."created_at",
    vendor."updated_at"
FROM "vendors" AS vendor
CROSS JOIN LATERAL unnest(vendor."data_processed") AS data_type
JOIN "organization_data_types" AS organization_data_type
  ON organization_data_type."organization_id" = vendor."organization_id"
 AND organization_data_type."name" = trim(data_type)
WHERE trim(data_type) <> '';

-- CreateIndex
CREATE INDEX "idx_organization_data_types_organization_id" ON "organization_data_types"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_data_types_vendor_id_organization_data_type_id_key" ON "vendor_data_types"("vendor_id", "organization_data_type_id");

-- CreateIndex
CREATE INDEX "idx_vendor_data_types_vendor_id" ON "vendor_data_types"("vendor_id");

-- CreateIndex
CREATE INDEX "idx_vendor_data_types_organization_data_type_id" ON "vendor_data_types"("organization_data_type_id");

-- AddForeignKey
ALTER TABLE "organization_data_types" ADD CONSTRAINT "organization_data_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_data_types" ADD CONSTRAINT "vendor_data_types_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_data_types" ADD CONSTRAINT "vendor_data_types_organization_data_type_id_fkey" FOREIGN KEY ("organization_data_type_id") REFERENCES "organization_data_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old denormalized columns after data has been copied.
ALTER TABLE "data_handling_profiles" DROP COLUMN "data_types_stored";
ALTER TABLE "vendors" DROP COLUMN "data_processed";
