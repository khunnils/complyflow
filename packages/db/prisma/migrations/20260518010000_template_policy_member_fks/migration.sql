ALTER TABLE "templates"
  DROP COLUMN "policy_owner",
  DROP COLUMN "policy_approver",
  ADD COLUMN "policy_owner_user_id" TEXT,
  ADD COLUMN "policy_approver_user_id" TEXT;

CREATE INDEX "idx_templates_policy_owner_user_id" ON "templates"("policy_owner_user_id");

CREATE INDEX "idx_templates_policy_approver_user_id" ON "templates"("policy_approver_user_id");

ALTER TABLE "templates" ADD CONSTRAINT "templates_policy_owner_user_id_fkey" FOREIGN KEY ("policy_owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "templates" ADD CONSTRAINT "templates_policy_approver_user_id_fkey" FOREIGN KEY ("policy_approver_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
