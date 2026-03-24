/*
  Warnings:

  - The values [SUBSCRIPTION_PAYMENT] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `store_subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('DEPOSIT', 'PURCHASE', 'REFUND');
ALTER TABLE "wallet_transactions" ALTER COLUMN "transactionType" TYPE "TransactionType_new" USING ("transactionType"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "store_subscriptions" DROP CONSTRAINT "store_subscriptions_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "store_subscriptions" DROP CONSTRAINT "store_subscriptions_store_id_fkey";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "store_subscriptions";

-- DropTable
DROP TABLE "subscription_plans";

-- DropEnum
DROP TYPE "SubscriptionPlanName";

-- DropEnum
DROP TYPE "SubscriptionStatus";
