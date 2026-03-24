/**
 * @swagger
 * /store-scan:
 *   post:
 *     tags: [Store Scan]
 *     summary: Scan a store to start an in-store order
 *     description: |
 *       Allows an authenticated consumer to scan a store and create a new in-store order session.
 *       The user must not have an active order before scanning.
 *
 *       Requires a valid authentication token.
 *
 *       **Client Implementation (withCredentials: true required if using cookies):**
 *
 *       Fetch API:
 *       ```javascript
 *       fetch('/api/v1/store-scan', {
 *         method: 'POST',
 *         headers: {
 *           'Content-Type': 'application/json',
 *           'Authorization': 'Bearer <access_token>'
 *         },
 *         credentials: 'include',
 *         body: JSON.stringify({ storeId: 'store-uuid' })
 *       })
 *       ```
 *
 *       Axios:
 *       ```javascript
 *       const api = axios.create({
 *         baseURL: 'http://localhost:5001/api/v1',
 *         withCredentials: true
 *       });
 *
 *       api.post('/scan', {
 *         storeId: 'store-uuid'
 *       }, {
 *         headers: {
 *           Authorization: 'Bearer <access_token>'
 *         }
 *       });
 *       ```
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScanStoreRequest'
 *
 * /stores/exit:
 *   post:
 *     tags: [Store Scan]
 *     summary: Thoát khỏi cửa hàng (kết thúc phiên mua tại cửa hàng)
 *     description: |
 *       Kết thúc phiên mua tại cửa hàng, cập nhật trạng thái đơn hàng là exited.
 *       Yêu cầu truyền orderId trong body.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Mã đơn hàng cần thoát
 *             required:
 *               - orderId
 *     responses:
 *       200:
 *         description: Thoát cửa hàng thành công
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
 *                   example: "Thoát cửa hàng thành công"
 *       400:
 *         description: Đơn hàng không hợp lệ hoặc đã thoát
 *       401:
 *         description: Unauthorized
 *           examples:
 *             scanExample:
 *               summary: Scan store to create order
 *               value:
 *                 storeId: "84d3f367-1549-407f-8b31-8d3612dd6d01"
 *     responses:
 *       201:
 *         description: Store scanned successfully. A new order session has been created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScanStoreResponse'
 *             example:
 *               statusCode: 201
 *               message: "Scan store successfully"
 *               data:
 *                 orderId: "a7c3f367-1549-407f-8b31-8d3612dd6abc"
 *                 storeId: "84d3f367-1549-407f-8b31-8d3612dd6d01"
 *                 status: "PENDING"
 *                 totalAmount: 0
 *       400:
 *         description: User already has an active order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               message: "You already have an active order"
 *               timestamp: "2026-02-03T02:02:05.816Z"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *             example:
 *               statusCode: 401
 *               message: "Unauthorized access"
 *               timestamp: "2026-02-03T02:02:05.816Z"
 *       404:
 *         description: Store not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               message: "Store not found"
 *               timestamp: "2026-02-03T02:02:05.816Z"
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
