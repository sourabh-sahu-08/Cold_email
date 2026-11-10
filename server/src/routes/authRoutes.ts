import { Router } from 'express';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  getAuthStatus,
  disconnectGoogle,
} from '../controllers/authController.js';

const router = Router();

router.get('/google/url', getGoogleAuthUrl);
router.get('/google/callback', handleGoogleCallback);
router.get('/status', getAuthStatus);
router.post('/disconnect', disconnectGoogle);

export default router;
