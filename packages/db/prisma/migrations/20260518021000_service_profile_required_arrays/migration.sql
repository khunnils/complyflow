UPDATE "service_profiles" SET "audiences" = ARRAY[]::TEXT[] WHERE "audiences" IS NULL;
UPDATE "service_profiles" SET "user_types" = ARRAY[]::TEXT[] WHERE "user_types" IS NULL;
UPDATE "service_profiles" SET "customer_types" = ARRAY[]::TEXT[] WHERE "customer_types" IS NULL;
UPDATE "service_profiles" SET "availability_regions" = ARRAY[]::TEXT[] WHERE "availability_regions" IS NULL;

ALTER TABLE "service_profiles" ALTER COLUMN "audiences" SET NOT NULL;
ALTER TABLE "service_profiles" ALTER COLUMN "user_types" SET NOT NULL;
ALTER TABLE "service_profiles" ALTER COLUMN "customer_types" SET NOT NULL;
ALTER TABLE "service_profiles" ALTER COLUMN "availability_regions" SET NOT NULL;
