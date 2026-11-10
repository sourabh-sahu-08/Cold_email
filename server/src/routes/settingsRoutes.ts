import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  testGeminiKey,
} from '../controllers/settingsController.js';

const router = Router();

router.get('/', getSettings);
router.post('/', updateSettings);
router.post('/test-gemini', testGeminiKey);

export default router;
