import type { Request, Response } from 'express';
import { catchAsync } from '@/utils/catchAsync.js';
import authService from './auth.service.js';
import { ApiResponse } from '@/core/apiResponse.js';
import { setTokenCookie } from '@/utils/token.util.js';
import { AUTH_MESSAGES } from './auth.messages.js';

export const authController = {
  signUpWithEmail: catchAsync(async (req: Request, res: Response) => {
    const user = await authService.signUpWithEmail(req.body);
    const response = ApiResponse.created(
      AUTH_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
      { id: user.id, email: user.email, name: user.name }
    );
    return res.status(response.statusCode).json(response);
  }),

  signInWithEmail: catchAsync(async (req: Request, res: Response) => {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const tokens = await authService.signInWithEmail({
      ...req.body,
      ipAddress,
      userAgent,
    });

    setTokenCookie(res, tokens);

    const response = ApiResponse.success(
      AUTH_MESSAGES.SUCCESSFUL_EMAIL_AUTHENTICATION
    );
    return res.status(response.statusCode).json(response);
  }),

  googleAuth: catchAsync(async (req: Request, res: Response) => {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const tokens = await authService.googleAuth({
      authCode: req.body.authCode,
      ipAddress,
      userAgent,
    });

    setTokenCookie(res, tokens);
    const response = ApiResponse.success(
      AUTH_MESSAGES.SUCCESSFUL_GOOGLE_AUTHENTICATION
    );
    return res.status(response.statusCode).json(response);
  }),

  forgotPassword: catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    const response = ApiResponse.success(
      AUTH_MESSAGES.OTP_SENT_IF_EMAIL_EXISTS
    );
    return res.status(response.statusCode).json(response);
  }),

  verifyResetOtp: catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    await authService.verifyResetOtp(email, otp);

    const response = ApiResponse.success(
      AUTH_MESSAGES.OTP_VERIFIED_SUCCESSFULLY
    );
    return res.status(response.statusCode).json(response);
  }),

  resetPassword: catchAsync(async (req: Request, res: Response) => {
    const { email, newPassword } = req.body;

    await authService.resetPassword(email, newPassword);

    const response = ApiResponse.success(
      AUTH_MESSAGES.PASSWORD_RESET_SUCCESSFULLY
    );
    return res.status(response.statusCode).json(response);
  }),

  signOut: catchAsync(async (req: Request, res: Response) => {
    await authService.signOut(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const apiResponse = ApiResponse.success(
      AUTH_MESSAGES.USER_SIGNED_OUT_SUCCESSFULLY
    );
    return res.status(apiResponse.statusCode).json(apiResponse);
  }),

  getProfile: catchAsync(async (req: Request, res: Response) => {
    const user = await authService.getProfile(req.user.id);
    const response = ApiResponse.success(
      AUTH_MESSAGES.USER_PROFILE_RETRIEVED_SUCCESSFULLY,
      user
    );
    return res.status(response.statusCode).json(response);
  }),
};
