import {
  generateAccessToken,
  generateRefreshToken,
} from '@/utils/token.util.js';
import userRepository from '@/shared/repositories/user.repository.js';
import refreshTokenRepository from '@/shared/repositories/refreshToken.repository.js';
import googleService from '@/infrastructure/google.service.js';
import type {
  AuthRequestDto,
  GoogleAuthRequestDto,
} from './authRequest.dto.js';
import { BadRequestError, UnauthorizedError } from '@/core/apiError.js';
import { AUTH_MESSAGES } from './auth.messages.js';
import bcrypt from 'bcryptjs';

const generateAndStoreTokens = async (
  userId: string,
  ipAddress: string,
  userAgent: string
) => {
  await refreshTokenRepository.deleteAllUserRefreshTokens(userId);

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken();

  await refreshTokenRepository.create({
    userId,
    token: refreshToken,
    ipAddress,
    userAgent,
  });
  return { accessToken, refreshToken };
};
const authService = {
  signUpWithEmail: async (data: AuthRequestDto) => {
    const existingUser = await userRepository.findByEmail(data.email);

    const existingPhoneNumberUser = await userRepository.findByPhoneNumber(
      data.phoneNumber
    );

    if (existingPhoneNumberUser) {
      throw new BadRequestError(AUTH_MESSAGES.PHONE_NUMBER_ALREADY_EXISTS);
    }

    if (existingUser) {
      throw new BadRequestError(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await userRepository.create({
      name: data.name!,
      email: data.email,
      phoneNumber: data.phoneNumber,
      passwordHash: hashedPassword,
    });

    return user;
  },

  signInWithEmail: async (payload: AuthRequestDto) => {
    const { email, password } = payload;

    const user = await userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new BadRequestError(AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestError(AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD);
    }

    const { accessToken, refreshToken } = await generateAndStoreTokens(
      user.id,
      payload.ipAddress || 'unknown',
      payload.userAgent || 'unknown'
    );

    return { accessToken, refreshToken };
  },

  googleAuth: async (googleAuthRequestDto: GoogleAuthRequestDto) => {
    const userInfoResponse = await googleService.getUserInfo(
      googleAuthRequestDto.authCode
    );

    const user = await userRepository.upsertWithGoogleAuth(userInfoResponse);

    const { accessToken, refreshToken } = await generateAndStoreTokens(
      user.id,
      googleAuthRequestDto.ipAddress,
      googleAuthRequestDto.userAgent
    );

    return { accessToken, refreshToken };
  },

  signOut: async (userId: string): Promise<void> => {
    await refreshTokenRepository.deleteAllUserRefreshTokens(userId);
  },

  getProfile: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};

export default authService;
