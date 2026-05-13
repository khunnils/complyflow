-- CreateTable
CREATE TABLE "organization_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "source_system_template_slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_templates_organization_id_slug_key" ON "organization_templates"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "idx_organization_templates_organization_id" ON "organization_templates"("organization_id");

-- CreateIndex
CREATE INDEX "idx_organization_templates_source_system_template_slug" ON "organization_templates"("source_system_template_slug");

-- AddForeignKey
ALTER TABLE "organization_templates" ADD CONSTRAINT "organization_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
