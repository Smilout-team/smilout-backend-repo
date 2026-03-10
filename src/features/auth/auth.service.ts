import {
  generateAccessToken,
  generateRefreshToken,
} from '@/utils/token.util.js';
import userRepository from '@/shared/repositories/user.repository.js';
import refreshTokenRepository from '@/shared/repositories/refreshToken.repository.js';
import googleService from '@/infrastructure/google.service.js';
import mailService from '@/infrastructure/services/mail.service.js';
import redis from '@/shared/utils/redis.util.js';

import type {
  AuthRequestDto,
  GoogleAuthRequestDto,
} from './authRequest.dto.js';

import { BadRequestError } from '@/core/apiError.js';
import { AUTH_MESSAGES } from './auth.messages.js';
import bcrypt from 'bcryptjs';

const OTP_TTL = 300;
const COOLDOWN_TTL = 60;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

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

  forgotPassword: async (email: string) => {
    const user = await userRepository.findByEmail(email);

    if (!user) return;

    const cooldownKey = `fp:cooldown:${email}`;
    const otpKey = `fp:otp:${email}`;

    const isCooling = await redis.get(cooldownKey);
    if (isCooling) {
      throw new BadRequestError(AUTH_MESSAGES.OTP_REQUEST_TOO_FREQUENTLY);
    }

    const otp = generateOtp();

    await redis.setex(otpKey, OTP_TTL, otp);
    await redis.setex(cooldownKey, COOLDOWN_TTL, '1');

    await mailService.sendResetPasswordOtp(email, otp);
  },

  verifyResetOtp: async (email: string, otp: string) => {
    const otpKey = `fp:otp:${email}`;
    const savedOtp = await redis.get(otpKey);

    if (!savedOtp || savedOtp !== otp) {
      throw new BadRequestError(AUTH_MESSAGES.INVALID_OTP);
    }

    await redis.del(otpKey);
  },

  resetPassword: async (email: string, newPassword: string) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestError(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userRepository.updateById(user.id, {
      passwordHash: hashedPassword,
    });
  },

  signOut: async (userId: string): Promise<void> => {
    await refreshTokenRepository.deleteAllUserRefreshTokens(userId);
  },

  getProfile: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }
    const { _passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};

export default authService;
