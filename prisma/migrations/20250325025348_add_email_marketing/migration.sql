/*
  Warnings:

  - You are about to drop the column `emailId` on the `EmailMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `EmailRecipient` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `EmailRecipient` table. All the data in the column will be lost.
  - You are about to drop the column `emailId` on the `EmailRecipient` table. All the data in the column will be lost.
  - The `status` column on the `EmailRecipient` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Email` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[campaignId]` on the table `EmailMetrics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[campaignId,leadId]` on the table `EmailRecipient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campaignId` to the `EmailMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EmailMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignId` to the `EmailRecipient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leadId` to the `EmailRecipient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmailMetrics" DROP CONSTRAINT "EmailMetrics_emailId_fkey";

-- DropForeignKey
ALTER TABLE "EmailRecipient" DROP CONSTRAINT "EmailRecipient_emailId_fkey";

-- DropIndex
DROP INDEX "EmailMetrics_emailId_key";

-- DropIndex
DROP INDEX "EmailRecipient_emailId_key";

-- AlterTable
ALTER TABLE "EmailMetrics" DROP COLUMN "emailId",
ADD COLUMN     "bounces" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "campaignId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sends" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EmailRecipient" DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "emailId",
ADD COLUMN     "campaignId" TEXT NOT NULL,
ADD COLUMN     "clickedAt" TIMESTAMP(3),
ADD COLUMN     "leadId" TEXT NOT NULL,
ADD COLUMN     "openedAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- DropTable
DROP TABLE "Email";

-- DropEnum
DROP TYPE "EmailStatus";

-- DropEnum
DROP TYPE "RecipientStatus";

-- CreateTable
CREATE TABLE "EmailCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailEvent" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "leadEmail" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "url" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailEvent_campaignId_idx" ON "EmailEvent"("campaignId");

-- CreateIndex
CREATE INDEX "EmailEvent_leadEmail_idx" ON "EmailEvent"("leadEmail");

-- CreateIndex
CREATE INDEX "EmailEvent_eventType_idx" ON "EmailEvent"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMetrics_campaignId_key" ON "EmailMetrics"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailRecipient_campaignId_leadId_key" ON "EmailRecipient"("campaignId", "leadId");

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMetrics" ADD CONSTRAINT "EmailMetrics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
