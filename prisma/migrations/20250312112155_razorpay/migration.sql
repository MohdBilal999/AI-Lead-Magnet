/*
  Warnings:

  - You are about to drop the column `stripeCurrentPeriodEnd` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[razorpayCustomerId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[razorpaySubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Subscription_stripeCustomerId_key";

-- DropIndex
DROP INDEX "Subscription_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripeCurrentPeriodEnd",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "razorpayCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "razorpayCustomerId" TEXT,
ADD COLUMN     "razorpaySubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_razorpayCustomerId_key" ON "Subscription"("razorpayCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_razorpaySubscriptionId_key" ON "Subscription"("razorpaySubscriptionId");
