import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerOptions from './option.swagger.js';
import type { Application } from 'express';

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(main: Application) {
  main.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
