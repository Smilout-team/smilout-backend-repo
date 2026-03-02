import { Router } from 'express';
import { validate } from '@/middlewares/validate.middleware.js';
import { googleAuthSchema } from '@/features/auth/schemas/googleAuth.schema.js';
import { signInWithEmailSchema } from './schemas/signInWithEmail.schema.js';
import { signUpWithEmailSchema } from './schemas/signUpWithEmail.schema.js';
import { authController } from './auth.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';

const authRoutes = Router();

authRoutes.post(
  '/google',
  validate(googleAuthSchema),
  authController.googleAuth
);

authRoutes.post(
  '/sign-in',
  validate(signInWithEmailSchema),
  authController.signInWithEmail
);

authRoutes.post(
  '/sign-up',
  validate(signUpWithEmailSchema),
  authController.signUpWithEmail
);

authRoutes.get('/sign-out', authMiddleware, authController.signOut);

authRoutes.get('/me', authMiddleware, authController.getProfile);

export default authRoutes;
