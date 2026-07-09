-- AlterTable
ALTER TABLE "agent_profiles" ADD COLUMN     "id_card_image_url" TEXT,
ADD COLUMN     "id_number" TEXT,
ALTER COLUMN "rejected_reason" DROP NOT NULL;
