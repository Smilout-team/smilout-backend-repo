import { config } from '../config/index.js';

const option = {
  definition: {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'SMILOUT API Documentation',
      description: `
# SMILOUT Backend API

Welcome to the SMILOUT API documentation. This API provides comprehensive endpoints for managing users, authentication, stores, products, orders, and more.

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

Alternatively, tokens are automatically sent via HttpOnly cookies after successful authentication.

## Base URL

- **Development**: http://localhost:5001/api/v1
- **Production**: (configured in environment)

## Features

- **Authentication**: Email/password and Google OAuth
- **User Management**: Profile management and roles
- **Store Management**: Create and manage stores
- **Product Management**: Product catalog with categories
- **Order Management**: Order processing and tracking
- **Wallet & Transactions**: Digital wallet functionality
- **Notifications**: Real-time user notifications
- **Subscriptions**: Store subscription plans

## Token Lifecycle

- **Access Token**: Valid for 1 hour (sent as HttpOnly cookie)
- **Refresh Token**: Valid for 7 days (sent as HttpOnly cookie)
- Automatically refreshed when access token expires

## Error Codes

- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **422**: Validation Error - Input validation failed
- **500**: Internal Server Error

## Support

For issues or questions, contact the development team.
      `,
      contact: {
        name: 'SMILOUT Development Team',
        email: 'support@smilout.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? config.productionUrl
            : 'http://localhost:5001/api/v1',
        description:
          process.env.NODE_ENV === 'production'
            ? 'Production server'
            : 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'JWT token stored in HttpOnly cookie',
        },
      },
      schemas: {},
    },
    tags: [
      {
        name: 'Auth',
        description:
          'Authentication endpoints - Sign in, sign up, sign out, and OAuth',
      },
      {
        name: 'Users',
        description: 'User profile and account management',
      },
      {
        name: 'Stores',
        description: 'Store management and operations',
      },
      {
        name: 'Products',
        description: 'Product catalog and inventory management',
      },
      {
        name: 'Orders',
        description: 'Order processing and tracking',
      },
      {
        name: 'Wallet',
        description: 'Digital wallet and transaction management',
      },
      {
        name: 'Notifications',
        description: 'User notification management',
      },
      {
        name: 'Subscriptions',
        description: 'Store subscription plans and management',
      },
    ],
    security: [{ BearerAuth: [] }, { CookieAuth: [] }],
  },
  apis: ['src/**/*.swagger.ts'],
};
export default option;
