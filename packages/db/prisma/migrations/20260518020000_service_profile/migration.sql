CREATE TABLE "service_profiles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL DEFAULT '',
    "service_description" TEXT NOT NULL DEFAULT '',
    "service_url" TEXT NOT NULL DEFAULT '',
    "audiences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "user_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customer_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availability_regions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "children_directed" BOOLEAN NOT NULL DEFAULT false,
    "minimum_user_age" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_profiles_organization_id_key" ON "service_profiles"("organization_id");

ALTER TABLE "service_profiles" ADD CONSTRAINT "service_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
