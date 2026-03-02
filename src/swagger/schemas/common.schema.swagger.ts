/**
 * @swagger
 * components:
 *   schemas:
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of items
 *           example: 100
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Items per page
 *           example: 10
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 10
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there is a next page
 *           example: true
 *         hasPreviousPage:
 *           type: boolean
 *           description: Whether there is a previous page
 *           example: false
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *           example: 200
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Operation successful"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-02-03T02:02:05.816Z"
 *         data:
 *           type: object
 *           description: Response data
 *
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Data retrieved successfully"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-02-03T02:02:05.816Z"
 *         data:
 *           type: object
 *           properties:
 *             items:
 *               type: array
 *               items: {}
 *             meta:
 *               $ref: '#/components/schemas/PaginationMeta'
 */
