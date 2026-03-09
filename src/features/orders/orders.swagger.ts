/**
 * @swagger
 * /orders/me:
 *   get:
 *     summary: Get my order history
 *     description: Retrieve all paid and preparing orders for the current user
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Order history retrieved successfully
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
 *                       orderType:
 *                         type: string
 *                         enum: [INSTORE, DELIVERY]
 *                       status:
 *                         type: string
 *                         enum: [PAID, PREPARING]
 *                       deliveryAddress:
 *                         type: string
 *                         nullable: true
 *                       deliveryOption:
 *                         type: string
 *                         enum: [ASAP, SCHEDULED]
 *                         nullable: true
 *                       scheduledDeliveryAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       totalAmount:
 *                         type: number
 *                       store:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           storeName:
 *                             type: string
 *                           address:
 *                             type: string
 *                       totalItems:
 *                         type: number
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productName:
 *                               type: string
 *                             quantity:
 *                               type: number
 *                             priceAtPurchase:
 *                               type: number
 *       401:
 *         description: Unauthorized
 *
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
 * /orders/repurchase:
 *   post:
 *     summary: Repurchase order - Get store recommendations
 *     description: |
 *       Find stores that have similar products from a previous order.
 *       Returns a list of stores with availability, pricing, and distance scoring.
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
 *               orderId:
 *                 type: string
 *                 description: Original order ID to repurchase
 *                 example: "84d3f367-1549-407f-8b31-8d3612dd6d01"
 *               userLatitude:
 *                 type: number
 *                 description: Current user latitude for distance calculation
 *                 example: 16.0544
 *               userLongitude:
 *                 type: number
 *                 description: Current user longitude for distance calculation
 *                 example: 108.2022
 *             required:
 *               - orderId
 *     responses:
 *       200:
 *         description: Store recommendations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     originalStoreName:
 *                       type: string
 *                     productCount:
 *                       type: number
 *                     storeRecommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           storeId:
 *                             type: string
 *                           storeName:
 *                             type: string
 *                           address:
 *                             type: string
 *                           distance:
 *                             type: number
 *                             nullable: true
 *                           totalPrice:
 *                             type: number
 *                           totalOriginalPrice:
 *                             type: number
 *                           availableProducts:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 productName:
 *                                   type: string
 *                                 originalPrice:
 *                                   type: number
 *                                 discountedPrice:
 *                                   type: number
 *                                 available:
 *                                   type: boolean
 *                                 stockQuantity:
 *                                   type: number
 *                           unavailableProducts:
 *                             type: array
 *                             items:
 *                               type: string
 *                           availabilityRate:
 *                             type: number
 *                           recommendation:
 *                             type: string
 *                             enum: [best, good, alternative]
 *       400:
 *         description: Order not found or invalid
 *       401:
 *         description: Unauthorized
 *
 * /orders/repurchase-to-cart:
 *   post:
 *     summary: Repurchase to cart - Add items to cart
 *     description: |
 *       Add items from a previous order to current cart at a selected store.
 *       Creates a new cart or uses existing pending cart for the target store.
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
 *               sourceOrderId:
 *                 type: string
 *                 description: Original order ID to copy items from
 *                 example: "84d3f367-1549-407f-8b31-8d3612dd6d01"
 *               targetStoreId:
 *                 type: string
 *                 description: Store ID where items will be added to cart
 *                 example: "store123"
 *             required:
 *               - sourceOrderId
 *               - targetStoreId
 *     responses:
 *       200:
 *         description: Items added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       description: Cart order ID
 *                     storeId:
 *                       type: string
 *                     addedItemsCount:
 *                       type: number
 *                     skippedItems:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of product names that couldn't be added
 *       400:
 *         description: Order not found, store not found, or invalid request
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
