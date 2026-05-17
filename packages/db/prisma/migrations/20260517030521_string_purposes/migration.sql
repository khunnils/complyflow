-- AlterTable
ALTER TABLE "organization_data_types" ALTER COLUMN "purposes" SET NOT NULL,
ALTER COLUMN "purposes" SET DEFAULT '',
ALTER COLUMN "purposes" SET DATA TYPE TEXT;
