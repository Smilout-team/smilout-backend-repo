/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     tags: [Wallet]
 *     summary: Get wallet balance
 *     description: Get the current balance of the authenticated user's wallet. If no wallet exists, one will be created automatically.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Wallet balance retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/WalletBalanceResponse'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /wallet/top-up:
 *   post:
 *     tags: [Wallet]
 *     summary: Create SePay top-up checkout
 *     description: |
 *       Create a SePay checkout payload for wallet top-up.
 *       This endpoint does NOT increase balance immediately. Wallet balance is credited only after IPN `ORDER_PAID` is received and validated.
 *
 *       **Important Notes:**
 *       - Requires SePay env vars (`SEPAY_MERCHANT_ID`, `SEPAY_SECRET_KEY`)
 *       - Use returned `checkoutUrl` and `checkoutFields` to submit an HTML form from frontend
 *       - Callback and IPN are handled by backend endpoints
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopUpWalletRequest'
 *           examples:
 *             topUp1:
 *               summary: Create top-up 100,000 VND via bank transfer
 *               value:
 *                 amount: 100000
 *                 paymentMethod: "BANK_TRANSFER"
 *                 description: "Nap tien vi"
 *             topUp2:
 *               summary: Create top-up 500,000 VND via NAPAS
 *               value:
 *                 amount: 500000
 *                 paymentMethod: "NAPAS_BANK_TRANSFER"
 *                 description: "Nap tien vi qua NAPAS"
 *     responses:
 *       200:
 *         description: Checkout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Khởi tạo yêu cầu nạp tiền thành công"
 *                 data:
 *                   $ref: '#/components/schemas/CreateTopUpCheckoutResponse'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - invalid payload or missing SePay config
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /wallet/top-up/{invoiceNumber}:
 *   get:
 *     tags: [Wallet]
 *     summary: Get top-up request status
 *     description: Get status of a SePay top-up request by invoice number.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: SePay invoice number returned from create top-up checkout API
 *     responses:
 *       200:
 *         description: Top-up status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Lấy trạng thái nạp tiền thành công"
 *                 data:
 *                   $ref: '#/components/schemas/TopUpStatusResponse'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Top-up request not found
 */

/**
 * @swagger
 * /wallet/sepay/ipn:
 *   post:
 *     tags: [Wallet]
 *     summary: SePay IPN endpoint
 *     description: Public endpoint for SePay to notify payment status. Verify `X-Secret-Key` header against `SEPAY_SECRET_KEY`.
 *     parameters:
 *       - in: header
 *         name: X-Secret-Key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: IPN processed and acknowledged
 *       401:
 *         description: Invalid secret key
 */

/**
 * @swagger
 * /wallet/top-up/callback/success:
 *   get:
 *     tags: [Wallet]
 *     summary: SePay success callback
 *     description: Callback URL for successful checkout redirect from SePay.
 *
 * /wallet/top-up/callback/error:
 *   get:
 *     tags: [Wallet]
 *     summary: SePay error callback
 *     description: Callback URL for failed checkout redirect from SePay.
 *
 * /wallet/top-up/callback/cancel:
 *   get:
 *     tags: [Wallet]
 *     summary: SePay cancel callback
 *     description: Callback URL for canceled checkout redirect from SePay.
 */

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Get transaction history
 *     description: Get paginated transaction history for the authenticated user's wallet. Can filter by transaction type.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *           enum: [DEPOSIT, PURCHASE, REFUND, SUBSCRIPTION_PAYMENT]
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Transaction history retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TransactionHistoryResponse'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       description: Number of items per page
 *                       example: 10
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of transactions
 *                       example: 45
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                       example: 5
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /wallet/transactions/{transactionId}:
 *   get:
 *     tags: [Wallet]
 *     summary: Get transaction details
 *     description: Get detailed information about a specific transaction
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Transaction details retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TransactionDetailResponse'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export {};
