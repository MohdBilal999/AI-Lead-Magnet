-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ALTER COLUMN "updatedAt" DROP DEFAULT;
