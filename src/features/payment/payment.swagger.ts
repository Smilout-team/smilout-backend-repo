/**
 * @swagger
 * /payment:
 *   post:
 *     tags: [Payment]
 *     summary: Thanh toán giỏ hàng hiện tại bằng ví Smilout
 *     description: |
 *       Thanh toán cho phiên mua hàng đang hoạt động của người dùng.
 *       Endpoint chỉ chấp nhận `orderId` của cart đang `PENDING`.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 example: 84d3f367-1549-407f-8b31-8d3612dd6d01
 *     responses:
 *       200:
 *         description: Thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Thanh toán đơn hàng thành công!
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     storeId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PAID]
 *                     totalAmount:
 *                       type: number
 *       400:
 *         description: Cart không hợp lệ, trống, hoặc số dư ví không đủ
 *       401:
 *         description: Unauthorized
 */
