-- CreateEnum
CREATE TYPE "TopUpStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "wallet_top_up_requests" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "invoice_number" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "payment_method" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "status" "TopUpStatus" NOT NULL DEFAULT 'PENDING',
    "sepay_order_id" VARCHAR(100),
    "sepay_transaction_id" VARCHAR(100),
    "paid_at" TIMESTAMP(6),
    "raw_ipn" JSON,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "wallet_top_up_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_top_up_requests_invoice_number_key" ON "wallet_top_up_requests"("invoice_number");

-- AddForeignKey
ALTER TABLE "wallet_top_up_requests" ADD CONSTRAINT "wallet_top_up_requests_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
