/**
 * @swagger
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in with Google OAuth
 *     description: |
 *       Authenticate users using their Google account. Returns user information and sets HttpOnly cookies for access and refresh tokens.
 *
 *       **Client Implementation (withCredentials: true required):**
 *
 *       Fetch API:
 *       ```javascript
 *       fetch('/api/v1/auth/google', {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/json' },
 *         credentials: 'include', // Important: sends/receives cookies
 *         body: JSON.stringify({ authCode: '...' })
 *       })
 *       ```
 *
 *       Axios:
 *       ```javascript
 *       axios.create({
 *         baseURL: 'http://localhost:5001/api/v1',
 *         withCredentials: true // Important: sends/receives cookies
 *       })
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleAuthRequest'
 *           examples:
 *             googleAuth:
 *               summary: Google OAuth code
 *               value:
 *                 authCode: "4/0AX4XfWh..."
 *     responses:
 *       200:
 *         description: User signed in with Google successfully. Access and refresh tokens are set as HttpOnly cookies.
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly cookies for accessToken (1h) and refreshToken (7d)
 *             schema:
 *               type: string
 *               example: accessToken=jwt_token_here; Path=/; HttpOnly; SameSite=Strict; Secure; refreshToken=jwt_token_here; Path=/; HttpOnly; SameSite=Strict; Secure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               statusCode: 200
 *               message: "User authenticated successfully with Google"
 *               timestamp: "2026-02-03T02:02:05.816Z"
 *       400:
 *         description: Invalid authorization code
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
 * /auth/sign-up:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user with email and password
 *     description: Create a new user account with email and password. Password must be at least 8 characters and match the confirmation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpRequest'
 *           examples:
 *             newUser:
 *               summary: New user registration
 *               value:
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *                 password: "SecurePass123!"
 *                 passwordConfirmation: "SecurePass123!"
 *     responses:
 *       201:
 *         description: User registered successfully. Returns basic user information (id, email, name).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignUpResponse'
 *             example:
 *               status: 201
 *               message: "User registered successfully"
 *               data:
 *                 id: "84d3f367-1549-407f-8b31-8d3612dd6d01"
 *                 email: "john.doe@example.com"
 *                 name: "John Doe"
 *       400:
 *         description: Email already exists or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               emailExists:
 *                 summary: Email already registered
 *                 value:
 *                   status: 400
 *                   message: "Email already registered"
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               passwordMismatch:
 *                 summary: Passwords don't match
 *                 value:
 *                   status: 422
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "passwordConfirmation"
 *                       message: "Passwords do not match"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in with email and password
 *     description: |
 *       Authenticate user with email and password. Returns user information and sets HttpOnly cookies for access and refresh tokens.
 *
 *       **Client Implementation (withCredentials: true required):**
 *
 *       Fetch API:
 *       ```javascript
 *       fetch('/api/v1/auth/sign-in', {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/json' },
 *         credentials: 'include', // Important: sends/receives cookies
 *         body: JSON.stringify({ email: '...', password: '...' })
 *       })
 *       ```
 *
 *       Axios:
 *       ```javascript
 *       axios.create({
 *         baseURL: 'http://localhost:5001/api/v1',
 *         withCredentials: true // Important: sends/receives cookies
 *       })
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignInRequest'
 *           examples:
 *             existingUser:
 *               summary: Existing user login
 *               value:
 *                 email: "john.doe@example.com"
 *                 password: "SecurePass123!"
 *     responses:
 *       200:
 *         description: User signed in successfully. Access and refresh tokens are set as HttpOnly cookies.
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly cookies for accessToken (1h) and refreshToken (7d)
 *             schema:
 *               type: string
 *               example: accessToken=jwt_token_here; Path=/; HttpOnly; SameSite=Strict; Secure; refreshToken=jwt_token_here; Path=/; HttpOnly; SameSite=Strict; Secure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCredentials:
 *                 summary: Wrong email or password
 *                 value:
 *                   statusCode: 400
 *                   message: "Invalid email or password"
 *                   timestamp: "2026-02-03T02:02:05.816Z"
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
 * /auth/sign-out:
 *   get:
 *     tags: [Auth]
 *     summary: Sign out the authenticated user
 *     description: |
 *       Sign out the current user by invalidating their refresh token and clearing authentication cookies. Requires authentication.
 *
 *       **Client Implementation (withCredentials: true required):**
 *
 *       Fetch API:
 *       ```javascript
 *       fetch('/api/v1/auth/sign-out', {
 *         method: 'GET',
 *         credentials: 'include' // Important: sends cookies with token
 *       })
 *       ```
 *
 *       Axios:
 *       ```javascript
 *       const api = axios.create({
 *         baseURL: 'http://localhost:5001/api/v1',
 *         withCredentials: true // Important: sends cookies
 *       });
 *       api.get('/auth/sign-out')
 *       ```
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User signed out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignOutResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *             examples:
 *               noToken:
 *                 summary: No authentication token provided
 *                 value:
 *                   statusCode: 401
 *                   message: "Unauthorized access"
 *                   timestamp: "2026-02-03T02:02:05.816Z"
 *               invalidToken:
 *                 summary: Invalid or expired token
 *                 value:
 *                   statusCode: 401
 *                   message: "Invalid token"
 *                   timestamp: "2026-02-03T02:02:05.816Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     description: |
 *       Retrieve the profile information of the currently authenticated user. Requires a valid authentication token.
 *
 *       **Client Implementation (withCredentials: true required):**
 *
 *       Fetch API:
 *       ```javascript
 *       fetch('/api/v1/auth/me', {
 *         method: 'GET',
 *         credentials: 'include' // Important: sends cookies with token
 *       })
 *       ```
 *
 *       Axios:
 *       ```javascript
 *       const api = axios.create({
 *         baseURL: 'http://localhost:5001/api/v1',
 *         withCredentials: true // Important: sends cookies
 *       });
 *       api.get('/auth/me')
 *       ```
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *             example:
 *               statusCode: 200
 *               message: "User profile retrieved successfully"
 *               data:
 *                 id: "84d3f367-1549-407f-8b31-8d3612dd6d01"
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *                 phoneNumber: null
 *                 avatarUrl: null
 *                 address: null
 *                 coordinate: null
 *                 socialProvider: null
 *                 socialId: null
 *                 roles: ["CONSUMER"]
 *                 createdAt: "2026-02-03T02:02:05.816Z"
 *                 updatedAt: "2026-02-03T02:02:05.816Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *             examples:
 *               noToken:
 *                 summary: No authentication token provided
 *                 value:
 *                   statusCode: 401
 *                   message: "Unauthorized access"
 *                   timestamp: "2026-02-03T02:02:05.816Z"
 *               invalidToken:
 *                 summary: Invalid or expired token
 *                 value:
 *                   statusCode: 401
 *                   message: "Invalid token"
 *                   timestamp: "2026-02-03T02:02:05.816Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
