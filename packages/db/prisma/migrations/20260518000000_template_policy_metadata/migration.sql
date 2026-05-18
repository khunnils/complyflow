ALTER TABLE "templates"
  ADD COLUMN "policy_effective_date" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "policy_last_reviewed_date" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "policy_version" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "policy_owner" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "policy_approver" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "policy_review_cadence" TEXT NOT NULL DEFAULT '';
