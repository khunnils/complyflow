-- AlterTable
ALTER TABLE "privacy_profiles" ADD COLUMN     "data_transfer_mechanisms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "do_not_sell_link" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dpo_email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dpo_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "eu_representative_address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "eu_representative_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sells_or_shares_data" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uses_automated_decision_making" BOOLEAN NOT NULL DEFAULT false;
