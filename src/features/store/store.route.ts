import { Router } from 'express';
import { validate } from '@/middlewares/validate.middleware.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { scanStoreSchema } from './schemas/scanStore.schema.js';
import { storeScanController } from './store.controller.js';
const storeScanRoutes = Router();

storeScanRoutes.post(
  '/scan',
  authMiddleware,
  validate(scanStoreSchema),
  storeScanController.scanStore
);

export default storeScanRoutes;
