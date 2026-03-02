import { OAuth2Client } from 'google-auth-library';
import { config } from './index.js';

const googleClient = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

export { googleClient };
