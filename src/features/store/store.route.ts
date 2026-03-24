import { Router } from 'express';
import { validate } from '@/middlewares/validate.middleware.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { scanStoreSchema } from './schemas/scanStore.schema.js';
import { storeDetailSchema } from './schemas/storeDetail.schema.js';
import { nearbyStoresSchema } from './schemas/nearbyStores.schema.js';
import { storeScanController } from './store.controller.js';
const storeScanRoutes = Router();

storeScanRoutes.post(
  '/scan',
  authMiddleware,
  validate(scanStoreSchema),
  storeScanController.scanStore
);

storeScanRoutes.get(
  '/nearby',
  authMiddleware,
  validate(nearbyStoresSchema),
  storeScanController.getNearbyStores
);

storeScanRoutes.get(
  '/:storeId/products',
  authMiddleware,
  storeScanController.getStoreProducts
);

storeScanRoutes.get(
  '/:storeId',
  authMiddleware,
  validate(storeDetailSchema),
  storeScanController.getStoreDetail
);

storeScanRoutes.post('/exit', authMiddleware, storeScanController.exitStore);

storeScanRoutes.get(
  '/:storeId/consumers-in-store',
  authMiddleware,
  validate(storeDetailSchema),
  storeScanController.getConsumersInStore
);

export default storeScanRoutes;
