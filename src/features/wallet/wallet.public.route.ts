import { Router } from 'express';
import { walletController } from './wallet.controller.js';

const walletPublicRoutes = Router();

walletPublicRoutes.post('/sepay/ipn', walletController.handleTopUpIpn);
walletPublicRoutes.post('/top-up/ipn', walletController.handleTopUpIpn);
walletPublicRoutes.get(
  '/top-up/callback/success',
  walletController.topUpSuccessCallback
);
walletPublicRoutes.get(
  '/top-up/callback/error',
  walletController.topUpErrorCallback
);
walletPublicRoutes.get(
  '/top-up/callback/cancel',
  walletController.topUpCancelCallback
);

export default walletPublicRoutes;
