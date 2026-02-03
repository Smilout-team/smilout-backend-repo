import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '@/config/index.js';
import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/shared/constants/cookieOption.js';

const generateRefreshToken = () => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  return refreshToken;
};

const generateAccessToken = (id: string) => {
  if (!config.jwt.secret) {
    throw new Error('JWT secret is not configured');
  }

  return jwt.sign(
    {
      id: id,
    },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
};

const setTokenCookie = (
  res: Response,
  token: { accessToken: string; refreshToken: string }
) => {
  res.cookie('accessToken', token.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
  res.cookie('refreshToken', token.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  return res;
};

export { generateRefreshToken, generateAccessToken, setTokenCookie };
