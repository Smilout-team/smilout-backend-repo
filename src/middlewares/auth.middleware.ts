import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '@/core/apiError.js';
import jwt from 'jsonwebtoken';
import { prisma } from '@/utils/prisma.js';
import { config } from '@/config/index.js';
import { AUTH_MESSAGES } from '@/features/auth/auth.messages.js';
import { generateAccessToken, setTokenCookie } from '@/utils/token.util.js';
import refreshTokenRepository from '@/shared/repositories/refreshToken.repository.js';

interface JwtPayload {
  id: string;
}

const verifyTokenAndGetUser = async (token: string) => {
  const decoded: JwtPayload = jwt.verify(
    token,
    config.jwt.secret!
  ) as JwtPayload;
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || user.deletedAt) {
    return null;
  }

  return user;
};

const validateUserSession = async (userId: string) => {
  const hasValidRefreshToken = await prisma.refreshToken.findFirst({
    where: { userId, deletedAt: null },
  });

  return !!hasValidRefreshToken;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenFromCookie = req.cookies?.accessToken;
    const tokenFromHeader = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : undefined;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return next(new UnauthorizedError());
    }

    const user = await verifyTokenAndGetUser(token);

    if (!user) {
      return next(new UnauthorizedError());
    }

    const isSessionValid = await validateUserSession(user.id);

    if (!isSessionValid) {
      return next(
        new UnauthorizedError(
          AUTH_MESSAGES.SESSION_EXPIRED_PLEASE_SIGN_IN_AGAIN
        )
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError(AUTH_MESSAGES.INVALID_TOKEN));
    }

    if (error instanceof jwt.TokenExpiredError) {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return next(new UnauthorizedError(AUTH_MESSAGES.TOKEN_EXPIRED));
      }

      try {
        const user = await verifyTokenAndGetUser(refreshToken);

        if (!user) {
          return next(new UnauthorizedError(AUTH_MESSAGES.TOKEN_EXPIRED));
        }

        const tokenRecord =
          await refreshTokenRepository.findValidRefreshToken(refreshToken);

        if (!tokenRecord) {
          return next(new UnauthorizedError(AUTH_MESSAGES.TOKEN_EXPIRED));
        }

        const newAccessToken = generateAccessToken(user.id);
        setTokenCookie(res, { accessToken: newAccessToken, refreshToken });

        req.user = user;
        next();
      } catch (_refreshError) {
        return next(new UnauthorizedError(AUTH_MESSAGES.TOKEN_EXPIRED));
      }
    }
    next(error);
  }
};
