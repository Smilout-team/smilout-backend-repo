/**
 * @swagger
 * components:
 *   schemas:
 *     GoogleAuthRequest:
 *       type: object
 *       required:
 *         - authCode
 *       properties:
 *         authCode:
 *           type: string
 *           description: Authorization code from Google OAuth flow
 *           example: "4/0AX4XfWh..."
 *
 *     SignUpRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - passwordConfirmation
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the user
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: User's password (minimum 8 characters)
 *           example: "SecurePass123!"
 *         passwordConfirmation:
 *           type: string
 *           format: password
 *           description: Password confirmation (must match password)
 *           example: "SecurePass123!"
 *
 *     SignInRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: User's password
 *           example: "SecurePass123!"
 *
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email address to receive OTP code
 *           example: "john.doe@example.com"
 *
 *     VerifyOtpRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email address used to receive OTP
 *           example: "john.doe@example.com"
 *         otp:
 *           type: string
 *           description: One-time password code sent to email
 *           example: "123456"
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *         - newPassword
 *         - passwordConfirmation
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *           example: "john.doe@example.com"
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: New password (minimum 8 characters)
 *           example: "NewSecurePass123!"
 *         passwordConfirmation:
 *           type: string
 *           format: password
 *           description: Password confirmation (must match newPassword)
 *           example: "NewSecurePass123!"
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: User's unique identifier
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         name:
 *           type: string
 *           description: Full name of the user
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         phoneNumber:
 *           type: string
 *           nullable: true
 *           description: User's phone number
 *           example: "+84901234567"
 *         avatarUrl:
 *           type: string
 *           nullable: true
 *           description: URL to user's avatar image
 *           example: "https://example.com/avatar.jpg"
 *         address:
 *           type: string
 *           nullable: true
 *           description: User's address
 *           example: "123 Main St, City"
 *         socialProvider:
 *           type: string
 *           enum: [GOOGLE]
 *           nullable: true
 *           description: Social authentication provider
 *           example: "GOOGLE"
 *         socialId:
 *           type: string
 *           nullable: true
 *           description: Social provider user ID
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *             enum: [CONSUMER, STORE_STAFF, STORE_OWNER, SYSTEM_ADMIN]
 *           description: User's roles in the system
 *           example: ["CONSUMER"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *           example: "2026-02-03T01:23:45.447Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2026-02-03T01:23:45.447Z"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "User authenticated successfully"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-02-03T02:02:05.816Z"
 *       description: Authentication tokens are set as HttpOnly cookies (accessToken and refreshToken)
 *
 *     GenericSuccessResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-02-03T02:02:05.816Z"
 *
 *     SignUpResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 201
 *         message:
 *           type: string
 *           example: "User registered successfully"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-02-03T02:02:05.816Z"
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               example: "84d3f367-1549-407f-8b31-8d3612dd6d01"
 *             email:
 *               type: string
 *               format: email
 *               example: "john.doe@example.com"
 *             name:
 *               type: string
 *               example: "John Doe"
 *
 *     SignOutResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Signed out successfully"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-02-03T02:02:05.816Z"
 *
 *     UserProfileResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "User profile retrieved successfully"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-02-03T02:02:05.816Z"
 *         data:
 *           $ref: '#/components/schemas/User'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *           example: 400
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Invalid request parameters"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-02-03T02:02:05.816Z"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "email"
 *               message:
 *                 type: string
 *                 example: "Invalid email format"
 *
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 401
 *         message:
 *           type: string
 *           example: "Unauthorized access"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-02-03T02:02:05.816Z"
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 422
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-02-03T02:02:05.816Z"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "password"
 *               message:
 *                 type: string
 *                 example: "Password must be at least 8 characters"
 */
