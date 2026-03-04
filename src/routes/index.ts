import { Router } from 'express';
import authRoutes from '@/features/auth/auth.route.js';
import walletRoutes from '@/features/wallet/wallet.route.js';
import walletPublicRoutes from '@/features/wallet/wallet.public.route.js';
import storeRoutes from '@/features/store/store.route.js';

const publicRoute = Router();

publicRoute.use('/auth', authRoutes);
publicRoute.use('/wallet', walletPublicRoutes);

const protectedRoute = Router();

protectedRoute.use('/stores', storeRoutes);

protectedRoute.use('/wallet', walletRoutes);

export { publicRoute, protectedRoute };
