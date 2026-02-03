export const AUTH_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
  INVALID_GOOGLE_ACCOUNT:
    'Invalid Google account, access restricted to passerellesnumeriques.org',
  SUCCESSFUL_GOOGLE_AUTHENTICATION:
    'User authenticated successfully with Google',
  SUCCESSFUL_EMAIL_AUTHENTICATION:
    'User authenticated successfully with Email',
  USER_REGISTERED_SUCCESSFULLY: 'User registered successfully',
  USER_SIGNED_OUT_SUCCESSFULLY: 'User signed out successfully',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token has expired',
  SESSION_EXPIRED_PLEASE_SIGN_IN_AGAIN: 'Session expired, please sign in again',
  USER_PROFILE_RETRIEVED_SUCCESSFULLY: 'User profile retrieved successfully',
} as const;
