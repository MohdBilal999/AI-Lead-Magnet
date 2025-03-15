/*
  Warnings:

  - You are about to drop the column `razorpayCurrentPeriodEnd` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `razorpaySubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Subscription_razorpayCustomerId_key";

-- DropIndex
DROP INDEX "Subscription_razorpaySubscriptionId_key";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "razorpayCurrentPeriodEnd",
DROP COLUMN "razorpayCustomerId",
DROP COLUMN "razorpaySubscriptionId",
ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
