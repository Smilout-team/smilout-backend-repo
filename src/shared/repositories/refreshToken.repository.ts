import type { CreateRefreshTokenParams } from '@/shared/dtos/repositories/refreshToken.repository.dto.js';
import { prisma } from '@/utils/prisma.js';
import crypto from 'crypto';

const refreshTokenRepository = {
  hashToken: (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  create: async (createRefreshTokenParams: CreateRefreshTokenParams) => {
    const tokenHash = refreshTokenRepository.hashToken(
      createRefreshTokenParams.token
    );
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    return await prisma.refreshToken.create({
      data: {
        userId: createRefreshTokenParams.userId,
        tokenHash,
        expiryDate,
        ipAddress: createRefreshTokenParams.ipAddress,
        userAgent: createRefreshTokenParams.userAgent,
      },
    });
  },

  findValidRefreshToken: async (token: string) => {
    const tokenHash = refreshTokenRepository.hashToken(token);

    return await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        expiryDate: {
          gt: new Date(),
        },
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });
  },

  delete: async (token: string) => {
    const tokenHash = refreshTokenRepository.hashToken(token);

    return await prisma.refreshToken.updateMany({
      where: {
        tokenHash: tokenHash,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  },

  deleteAllUserRefreshTokens: async (userId: string) => {
    return await prisma.refreshToken.updateMany({
      where: {
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  },
};

export default refreshTokenRepository;
