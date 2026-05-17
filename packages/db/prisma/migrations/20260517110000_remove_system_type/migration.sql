/*
  Warnings:

  - You are about to drop the column `system_type` on the `organization_providers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_organization_providers_system_type";

-- DropIndex
DROP INDEX "organization_providers_org_system_provider_key";

-- AlterTable
ALTER TABLE "organization_providers" DROP COLUMN "system_type";
