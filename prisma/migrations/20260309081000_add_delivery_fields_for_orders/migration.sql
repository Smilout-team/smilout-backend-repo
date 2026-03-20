-- CreateEnum
CREATE TYPE "DeliveryOption" AS ENUM ('ASAP', 'SCHEDULED');

-- AlterTable
ALTER TABLE "orders"
ADD COLUMN "delivery_address" VARCHAR(255),
ADD COLUMN "delivery_option" "DeliveryOption",
ADD COLUMN "scheduled_delivery_at" TIMESTAMP(6);
