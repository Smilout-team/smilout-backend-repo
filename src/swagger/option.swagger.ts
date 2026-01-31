import { config } from '../config/index.js';

const option = {
  definition: {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'API Documentation',
      description: 'This is the API documentation for SMILOUT.',
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
            : 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['src/**/*.swagger.ts'],
};
export default option;
