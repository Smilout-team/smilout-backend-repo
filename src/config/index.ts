import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  dbUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  frontendUrlProd: process.env.FRONTEND_URL_PROD,
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  productionUrl: process.env.PRODUCTION_URL,
  digitalOcean: {
    dbCert: (process.env.DB_CA_CERT as string).replace(/\\n/g, '\n'),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirectUri: process.env.GOOGLE_REDIRECT_URI as string,
  },
  sepay: {
    env: (process.env.SEPAY_ENV as 'sandbox' | 'production') || 'sandbox',
    merchantId: process.env.SEPAY_MERCHANT_ID,
    secretKey: process.env.SEPAY_SECRET_KEY,
    checkoutUrl: process.env.SEPAY_CHECKOUT_URL,
    successUrl: process.env.SEPAY_SUCCESS_URL,
    errorUrl: process.env.SEPAY_ERROR_URL,
    cancelUrl: process.env.SEPAY_CANCEL_URL,
    frontendRedirectUrl: process.env.SEPAY_FRONTEND_REDIRECT_URL,
    ipnUrl: process.env.SEPAY_IPN_URL,
  },
};
