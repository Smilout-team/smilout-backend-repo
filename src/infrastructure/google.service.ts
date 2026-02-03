import { googleClient } from '@/config/google.js';
import type { GoogleUserInfo } from '@/infrastructure/interfaces/googleUser.type.js';

const googleService = {
  getUserInfo: async (authCode: string) => {
    const { tokens } = await googleClient.getToken({ code: authCode });
    googleClient.setCredentials(tokens);
    const userInfoResponse: GoogleUserInfo = (
      await googleClient.request<GoogleUserInfo>({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      })
    ).data;
    return userInfoResponse;
  },
};

export default googleService;
