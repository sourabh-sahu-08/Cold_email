import { Router } from 'express';
import { generateEmail } from '../controllers/aiController.js';

const router = Router();

router.post('/generate-email', generateEmail);

export default router;
