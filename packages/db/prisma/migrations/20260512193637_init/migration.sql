-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "employee_count" INTEGER NOT NULL,
    "industries" TEXT[],
    "regions" TEXT[],
    "handles_pii" BOOLEAN NOT NULL,
    "handles_sensitive_data" BOOLEAN NOT NULL,
    "compliance_goals" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infrastructure_profiles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "cloud_providers" TEXT[],
    "source_control_provider" TEXT,
    "auth_provider" TEXT,
    "password_manager" TEXT,
    "mfa_enabled" BOOLEAN NOT NULL,
    "encrypted_devices_required" BOOLEAN NOT NULL,
    "backups_enabled" BOOLEAN NOT NULL,
    "centralized_logging_enabled" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infrastructure_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_handling_profiles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "data_types_stored" JSONB NOT NULL,
    "stores_pii" BOOLEAN NOT NULL,
    "stores_healthcare_data" BOOLEAN NOT NULL,
    "encryption_at_rest" BOOLEAN NOT NULL,
    "encryption_in_transit" BOOLEAN NOT NULL,
    "production_data_in_development" BOOLEAN NOT NULL,
    "retention_policy_exists" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_handling_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_profiles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "mfa_required" BOOLEAN NOT NULL,
    "sso_enabled" BOOLEAN NOT NULL,
    "shared_accounts_exist" BOOLEAN NOT NULL,
    "offboarding_process_exists" BOOLEAN NOT NULL,
    "access_reviews_performed" BOOLEAN NOT NULL,
    "privileged_access_restricted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "has_subprocessors" BOOLEAN NOT NULL,
    "data_processed" TEXT[],
    "dpa_status" TEXT NOT NULL,
    "data_regions" TEXT[],
    "criticality" TEXT NOT NULL,
    "owner" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "infrastructure_profiles_organization_id_key" ON "infrastructure_profiles"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_handling_profiles_organization_id_key" ON "data_handling_profiles"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "access_profiles_organization_id_key" ON "access_profiles"("organization_id");

-- CreateIndex
CREATE INDEX "idx_vendors_organization_id" ON "vendors"("organization_id");

-- AddForeignKey
ALTER TABLE "infrastructure_profiles" ADD CONSTRAINT "infrastructure_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_handling_profiles" ADD CONSTRAINT "data_handling_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_profiles" ADD CONSTRAINT "access_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
