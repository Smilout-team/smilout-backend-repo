/**
 * @swagger
 * /orders/scan-product:
 *   post:
 *     summary: Scan product by barcode and add to cart
 *     description: Scan a product using barcode and add/update it in the user's active cart
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
 *                 description: Product barcode
 *                 example: "8936073025048"
 *             required:
 *               - barcode
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 productId:
 *                   type: string
 *                 quantity:
 *                   type: number
 *       400:
 *         description: Bad request - No active cart, product not found, or out of stock
 *       401:
 *         description: Unauthorized
 *
 * /orders/{orderId}/items:
 *   get:
 *     summary: Get all items in cart
 *     description: Retrieve all items in a specific order/cart with full product details
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order/Cart ID
 *     responses:
 *       200:
 *         description: Cart items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   productId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   quantity:
 *                     type: number
 *                   imageUrls:
 *                     type: array
 *                     items:
 *                       type: string
 *                   description:
 *                     type: string
 *                   stockQuantity:
 *                     type: number
 *                   expiryDate:
 *                     type: string
 *                     format: date-time
 *                   category:
 *                     type: string
 *       400:
 *         description: Bad request - No active cart
 *       401:
 *         description: Unauthorized
 *
 * /orders/{orderId}/items/{itemId}:
 *   delete:
 *     summary: Delete item from cart
 *     description: Remove an item from cart and restore the stock quantity
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order/Cart ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Item not found
 *       401:
 *         description: Unauthorized
 *
 *   patch:
 *     summary: Update item quantity in cart
 *     description: Update the quantity of an item in cart with stock validation
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order/Cart ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: New quantity value (must be > 0)
 *                 example: 2
 *             required:
 *               - quantity
 *     responses:
 *       200:
 *         description: Item quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedItem:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *       400:
 *         description: Bad request - Item not found, invalid quantity, or exceed stock
 *       401:
 *         description: Unauthorized
 */
