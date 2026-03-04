/**
 * @swagger
 * /orders/scan-product:
 *   post:
 *     summary: Scan product and add to cart
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               barcode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 */
