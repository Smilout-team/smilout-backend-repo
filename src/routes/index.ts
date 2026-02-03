import { Router } from 'express';
import authRoutes from '@/features/auth/auth.route.js';

const authRoute = Router();

authRoute.use('/', authRoutes);

const protectedRoute = Router();

export { authRoute, protectedRoute };
