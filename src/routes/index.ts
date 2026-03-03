import { Router } from 'express';
import authRoutes from '@/features/auth/auth.route.js';
import walletRoutes from '@/features/wallet/wallet.route.js';
import walletPublicRoutes from '@/features/wallet/wallet.public.route.js';
import storeRoutes from '@/features/store/store.route.js';
import ordersRoutes from '@/features/orders/orders.routes.js';
import checkoutRoutes from '@/features/checkout/checkout.route.js';

const publicRoute = Router();

publicRoute.use('/auth', authRoutes);
publicRoute.use('/wallet', walletPublicRoutes);

const protectedRoute = Router();

protectedRoute.use('/orders', ordersRoutes);

protectedRoute.use('/stores', storeRoutes);

protectedRoute.use('/wallet', walletRoutes);

protectedRoute.use('/checkout', checkoutRoutes);

export { publicRoute, protectedRoute };
