import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT,
  dbUrl: process.env.DATABASE_URL,
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
};
