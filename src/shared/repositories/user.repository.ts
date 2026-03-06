import type { GoogleUserInfo } from '@/infrastructure/interfaces/googleUser.type.js';
import type {
  CreateUserParams,
  UpdateUserParams,
} from '@/shared/dtos/repositories/user.repository.dto.js';
import { prisma } from '@/utils/prisma.js';
import type { Prisma } from '../../../generated/prisma/index.js';

const userRepository = {
  findByEmail: async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  findById: async (id: string) => {
    return await prisma.user.findUnique({ where: { id, deletedAt: null } });
  },

  findByPhoneNumber: async (phoneNumber: string) => {
    return await prisma.user.findFirst({
      where: { phoneNumber, deletedAt: null },
    });
  },

  create: async (data: CreateUserParams) => {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash: data.passwordHash,
      },
    });
  },

  updateById: async (id: string, data: Partial<UpdateUserParams>) => {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  updateWithGoogleAuth: async (
    userId: string,
    userInfoResponse: GoogleUserInfo,
    tx?: Prisma.TransactionClient
  ) => {
    const client = (tx || prisma) as Prisma.TransactionClient;
    return await client.user.update({
      where: { id: userId },
      data: {
        name: userInfoResponse.name || userInfoResponse.email.split('@')[0],
        email: userInfoResponse.email,
        avatarUrl: userInfoResponse.picture || null,
      },
    });
  },

  upsertWithGoogleAuth: async (
    userInfoResponse: GoogleUserInfo,
    tx?: Prisma.TransactionClient
  ) => {
    const client = (tx || prisma) as Prisma.TransactionClient;
    return await client.user.upsert({
      where: { email: userInfoResponse.email },
      update: {
        name: userInfoResponse.name || userInfoResponse.email.split('@')[0],
        avatarUrl: userInfoResponse.picture || null,
      },
      create: {
        name: userInfoResponse.name || userInfoResponse.email.split('@')[0],
        email: userInfoResponse.email,
        avatarUrl: userInfoResponse.picture || null,
      },
    });
  },
};

export default userRepository;
