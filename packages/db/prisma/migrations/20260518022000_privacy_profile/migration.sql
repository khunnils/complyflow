CREATE TABLE "privacy_profiles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "supported_rights" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "request_methods" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "response_timeline_days" INTEGER NOT NULL DEFAULT 0,
    "identity_verification_required" BOOLEAN NOT NULL DEFAULT false,
    "authorized_agent_supported" BOOLEAN NOT NULL DEFAULT false,
    "appeal_process_exists" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privacy_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "privacy_profiles_organization_id_key" ON "privacy_profiles"("organization_id");

ALTER TABLE "privacy_profiles" ADD CONSTRAINT "privacy_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
