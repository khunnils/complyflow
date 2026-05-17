-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "legal_entity_name" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "contact_email" TEXT NOT NULL DEFAULT '',
    "security_contact_email" TEXT NOT NULL DEFAULT '',
    "privacy_contact_email" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
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
CREATE TABLE "countries" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "system_code_sets" (
    "id" TEXT NOT NULL,
    "airtable_record_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_code_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_codes" (
    "id" TEXT NOT NULL,
    "code_set_id" TEXT NOT NULL,
    "airtable_record_id" TEXT NOT NULL,
    "code_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_code_sets" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "system_code_set_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_code_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_codes" (
    "id" TEXT NOT NULL,
    "organization_code_set_id" TEXT NOT NULL,
    "system_code_id" TEXT,
    "code_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "google_subject" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infrastructure_profiles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
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
CREATE TABLE "organization_data_types" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "purposes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "collection_methods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "legal_basis" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "retention_days" INTEGER NOT NULL DEFAULT 0,
    "is_sensitive" BOOLEAN NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "shared_with_third_parties" BOOLEAN NOT NULL DEFAULT false,
    "third_parties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_data_types_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "organization_providers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "provider_id" TEXT,
    "system_type" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "country_of_registration" TEXT NOT NULL DEFAULT '',
    "has_subprocessors" BOOLEAN NOT NULL,
    "data_processing_level" TEXT NOT NULL DEFAULT 'limited',
    "dpa_status" TEXT NOT NULL,
    "data_regions" TEXT[],
    "criticality" TEXT NOT NULL,
    "owner" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "source_system_template_slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rendered_content" TEXT NOT NULL,
    "pdf_object_path" TEXT,
    "source_hash" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "system_code_sets_airtable_record_id_key" ON "system_code_sets"("airtable_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_codes_airtable_record_id_key" ON "system_codes"("airtable_record_id");

-- CreateIndex
CREATE INDEX "idx_system_codes_code_set_id" ON "system_codes"("code_set_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_codes_code_set_id_code_id_key" ON "system_codes"("code_set_id", "code_id");

-- CreateIndex
CREATE INDEX "idx_organization_code_sets_organization_id" ON "organization_code_sets"("organization_id");

-- CreateIndex
CREATE INDEX "idx_organization_code_sets_system_code_set_id" ON "organization_code_sets"("system_code_set_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_code_sets_organization_id_system_code_set_id_key" ON "organization_code_sets"("organization_id", "system_code_set_id");

-- CreateIndex
CREATE INDEX "idx_organization_codes_organization_code_set_id" ON "organization_codes"("organization_code_set_id");

-- CreateIndex
CREATE INDEX "idx_organization_codes_system_code_id" ON "organization_codes"("system_code_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_codes_code_set_id_code_id_key" ON "organization_codes"("organization_code_set_id", "code_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_subject_key" ON "users"("google_subject");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_organization_memberships_user_id" ON "organization_memberships"("user_id");

-- CreateIndex
CREATE INDEX "idx_organization_memberships_organization_id" ON "organization_memberships"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_memberships_user_id_organization_id_key" ON "organization_memberships"("user_id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "infrastructure_profiles_organization_id_key" ON "infrastructure_profiles"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_handling_profiles_organization_id_key" ON "data_handling_profiles"("organization_id");

-- CreateIndex
CREATE INDEX "idx_organization_data_types_organization_id" ON "organization_data_types"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_data_types_organization_id_name_key" ON "organization_data_types"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "access_profiles_organization_id_key" ON "access_profiles"("organization_id");

-- CreateIndex
CREATE INDEX "idx_organization_providers_organization_id" ON "organization_providers"("organization_id");

-- CreateIndex
CREATE INDEX "idx_organization_providers_provider_id" ON "organization_providers"("provider_id");

-- CreateIndex
CREATE INDEX "idx_organization_providers_system_type" ON "organization_providers"("system_type");

-- CreateIndex
CREATE UNIQUE INDEX "organization_providers_org_system_provider_key" ON "organization_providers"("organization_id", "system_type", "provider_id");

-- CreateIndex
CREATE INDEX "idx_templates_organization_id" ON "templates"("organization_id");

-- CreateIndex
CREATE INDEX "idx_templates_source_system_template_slug" ON "templates"("source_system_template_slug");

-- CreateIndex
CREATE UNIQUE INDEX "templates_organization_id_slug_key" ON "templates"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "idx_documents_organization_id" ON "documents"("organization_id");

-- CreateIndex
CREATE INDEX "idx_documents_template_id" ON "documents"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "documents_organization_id_template_id_key" ON "documents"("organization_id", "template_id");

-- CreateIndex
CREATE INDEX "idx_vendor_data_types_vendor_id" ON "vendor_data_types"("vendor_id");

-- CreateIndex
CREATE INDEX "idx_vendor_data_types_organization_data_type_id" ON "vendor_data_types"("organization_data_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_data_types_vendor_id_organization_data_type_id_key" ON "vendor_data_types"("vendor_id", "organization_data_type_id");

-- AddForeignKey
ALTER TABLE "system_codes" ADD CONSTRAINT "system_codes_code_set_id_fkey" FOREIGN KEY ("code_set_id") REFERENCES "system_code_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_code_sets" ADD CONSTRAINT "organization_code_sets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_code_sets" ADD CONSTRAINT "organization_code_sets_system_code_set_id_fkey" FOREIGN KEY ("system_code_set_id") REFERENCES "system_code_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_codes" ADD CONSTRAINT "organization_codes_organization_code_set_id_fkey" FOREIGN KEY ("organization_code_set_id") REFERENCES "organization_code_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infrastructure_profiles" ADD CONSTRAINT "infrastructure_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_handling_profiles" ADD CONSTRAINT "data_handling_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_data_types" ADD CONSTRAINT "organization_data_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_profiles" ADD CONSTRAINT "access_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_providers" ADD CONSTRAINT "vendors_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_data_types" ADD CONSTRAINT "vendor_data_types_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "organization_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_data_types" ADD CONSTRAINT "vendor_data_types_organization_data_type_id_fkey" FOREIGN KEY ("organization_data_type_id") REFERENCES "organization_data_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
