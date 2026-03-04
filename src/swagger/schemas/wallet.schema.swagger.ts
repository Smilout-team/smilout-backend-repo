/**
 * @swagger
 * components:
 *   schemas:
 *     TopUpWalletRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           description: Amount to top-up
 *           minimum: 10000
 *           maximum: 5000000
 *           example: 100000
 *         paymentMethod:
 *           type: string
 *           enum: [BANK_TRANSFER, NAPAS_BANK_TRANSFER]
 *           description: SePay payment method
 *           example: "BANK_TRANSFER"
 *         description:
 *           type: string
 *           description: Optional order description
 *           maxLength: 255
 *           example: "Nap tien vi"
 *
 *     WalletBalanceResponse:
 *       type: object
 *       properties:
 *         walletId:
 *           type: string
 *           format: uuid
 *           description: Wallet unique identifier
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         balance:
 *           type: number
 *           description: Current wallet balance
 *           example: 1500000
 *         currency:
 *           type: string
 *           description: Currency code
 *           example: "VND"
 *         monthlyDeposit:
 *           type: number
 *           description: Total deposit amount in current month
 *           example: 500000
 *         monthlySpent:
 *           type: number
 *           description: Total spending amount in current month
 *           example: 250000
 *
 *     CreateTopUpCheckoutResponse:
 *       type: object
 *       properties:
 *         topUpRequestId:
 *           type: string
 *           format: uuid
 *           description: Top-up request unique identifier
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         invoiceNumber:
 *           type: string
 *           description: Unique invoice number used with SePay
 *           example: "TOPUP-1759134677-A1B2C3"
 *         amount:
 *           type: number
 *           description: Top-up amount
 *           example: 100000
 *         currency:
 *           type: string
 *           description: Currency code
 *           example: "VND"
 *         status:
 *           type: string
 *           enum: [PENDING]
 *           description: Initial top-up request status
 *           example: "PENDING"
 *         checkoutUrl:
 *           type: string
 *           description: SePay checkout URL to submit HTML form
 *           example: "https://pay-sandbox.sepay.vn/v1/checkout/init"
 *         checkoutFields:
 *           type: object
 *           description: Signed hidden fields to send to SePay checkout URL
 *           additionalProperties:
 *             oneOf:
 *               - type: string
 *               - type: number
 *         expiresInMinutes:
 *           type: number
 *           description: Suggested time window for checkout completion
 *           example: 30
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Top-up request creation timestamp
 *           example: "2026-03-02T10:30:00.000Z"

 *     TopUpStatusResponse:
 *       type: object
 *       properties:
 *         topUpRequestId:
 *           type: string
 *           format: uuid
 *         invoiceNumber:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, PAID, FAILED, CANCELLED]
 *         transactionId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         paidAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     TransactionHistoryItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Transaction unique identifier
 *           example: "660e8400-e29b-41d4-a716-446655440001"
 *         transactionType:
 *           type: string
 *           enum: [DEPOSIT, PURCHASE, REFUND, SUBSCRIPTION_PAYMENT]
 *           description: Type of transaction
 *           example: "DEPOSIT"
 *         amount:
 *           type: number
 *           description: Transaction amount
 *           example: 100000
 *         referenceId:
 *           type: string
 *           description: Reference ID for this transaction
 *           example: "TXN-20260302-001"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Transaction creation timestamp
 *           example: "2026-03-02T10:30:00.000Z"
 *
 *     TransactionHistoryResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/TransactionHistoryItem'
 *
 *     TransactionDetailResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Transaction unique identifier
 *           example: "660e8400-e29b-41d4-a716-446655440001"
 *         transactionType:
 *           type: string
 *           enum: [DEPOSIT, PURCHASE, REFUND, SUBSCRIPTION_PAYMENT]
 *           description: Type of transaction
 *           example: "DEPOSIT"
 *         amount:
 *           type: number
 *           description: Transaction amount
 *           example: 100000
 *         referenceId:
 *           type: string
 *           description: Reference ID for this transaction
 *           example: "TXN-20260302-001"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Transaction creation timestamp
 *           example: "2026-03-02T10:30:00.000Z"
 *         wallet:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: Wallet unique identifier
 *               example: "550e8400-e29b-41d4-a716-446655440000"
 *             balance:
 *               type: number
 *               description: Current wallet balance
 *               example: 1600000
 *             currency:
 *               type: string
 *               description: Currency code
 *               example: "VND"
 */

export {};
