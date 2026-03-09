/**
 * @swagger
 * /payment/delivery-addresses:
 *   get:
 *     tags: [Payment]
 *     summary: Lấy danh sách địa chỉ giao hàng có sẵn
 *     description: |
 *       Lấy danh sách các địa chỉ giao hàng gợi ý bao gồm:
 *       - Vị trí hiện tại (từ tọa độ GPS)
 *       - Địa chỉ hồ sơ người dùng
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userLatitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Vĩ độ hiện tại
 *         example: 16.0544
 *       - in: query
 *         name: userLongitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Kinh độ hiện tại
 *         example: 108.2022
 *     responses:
 *       200:
 *         description: Danh sách địa chỉ giao hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: coordinate-default
 *                       label:
 *                         type: string
 *                         example: Vị trí hiện tại
 *                       address:
 *                         type: string
 *                       fullAddress:
 *                         type: string
 *                       source:
 *                         type: string
 *                         enum: [COORDINATE, PROFILE]
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                       isDefault:
 *                         type: boolean
 *       401:
 *         description: Unauthorized
 *
 * /payment/delivery-addresses/search:
 *   get:
 *     tags: [Payment]
 *     summary: Tìm kiếm địa chỉ giao hàng
 *     description: |
 *       Tìm kiếm địa chỉ giao hàng bằng từ khóa sử dụng Goong API.
 *       Trả về danh sách địa chỉ gợi ý với tọa độ.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *         example: Nguyễn Văn Linh
 *       - in: query
 *         name: userLatitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Vĩ độ hiện tại để ưu tiên kết quả gần
 *         example: 16.0544
 *       - in: query
 *         name: userLongitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Kinh độ hiện tại để ưu tiên kết quả gần
 *         example: 108.2022
 *     responses:
 *       200:
 *         description: Danh sách địa chỉ tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       label:
 *                         type: string
 *                       address:
 *                         type: string
 *                       fullAddress:
 *                         type: string
 *                       source:
 *                         type: string
 *                         enum: [GOONG]
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                       isDefault:
 *                         type: boolean
 *       400:
 *         description: Lỗi khi tìm kiếm địa chỉ
 *       401:
 *         description: Unauthorized
 *
 * /payment:
 *   post:
 *     tags: [Payment]
 *     summary: Thanh toán giỏ hàng hiện tại bằng ví Smilout
 *     description: |
 *       Thanh toán cho phiên mua hàng đang hoạt động của người dùng.
 *       Endpoint chỉ chấp nhận `orderId` của cart đang `PENDING`.
 *       Với đơn `DELIVERY`, hỗ trợ chọn địa chỉ giao hàng và hình thức giao (`ASAP`/`SCHEDULED`).
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
 *               - deliveryAddress
 *               - deliveryOption
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 example: 84d3f367-1549-407f-8b31-8d3612dd6d01
 *               deliveryAddress:
 *                 type: string
 *                 example: 123 Nguyen Van Linh, Da Nang
 *               deliveryOption:
 *                 type: string
 *                 enum: [ASAP, SCHEDULED]
 *               scheduledDeliveryAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-03-09T16:30:00.000Z
 *               userLatitude:
 *                 type: number
 *                 example: 16.0544
 *               userLongitude:
 *                 type: number
 *                 example: 108.2022
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
 *                       enum: [PREPARING]
 *                     deliveryAddress:
 *                       type: string
 *                     deliveryOption:
 *                       type: string
 *                       enum: [ASAP, SCHEDULED]
 *                     scheduledDeliveryAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     totalAmount:
 *                       type: number
 *       400:
 *         description: Cart không hợp lệ, trống, hoặc số dư ví không đủ
 *       401:
 *         description: Unauthorized
 */
