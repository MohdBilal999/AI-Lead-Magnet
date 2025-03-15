/*
  Warnings:

  - Added the required column `planId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Made the column `razorpayCurrentPeriodEnd` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "planId" TEXT NOT NULL,
ALTER COLUMN "razorpayCurrentPeriodEnd" SET NOT NULL;
