-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "company" JSONB NOT NULL,
    "infrastructure" JSONB NOT NULL,
    "dataHandling" JSONB NOT NULL,
    "access" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "hasSubprocessors" BOOLEAN NOT NULL,
    "dataProcessed" TEXT[],
    "dpaStatus" TEXT NOT NULL,
    "dataRegions" TEXT[],
    "criticality" TEXT NOT NULL,
    "owner" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vendor_organizationId_idx" ON "Vendor"("organizationId");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
