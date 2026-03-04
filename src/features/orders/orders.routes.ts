import { Router } from 'express';
import { scanProduct } from './orders.controller.js';
import { validate } from '@/middlewares/validate.middleware.js';
import { scanProductSchema } from './schemas/index.js';

const router = Router();

router.post('/scan-product', validate(scanProductSchema), scanProduct);

export default router;
