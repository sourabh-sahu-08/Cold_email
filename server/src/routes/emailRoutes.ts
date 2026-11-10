import { Router } from 'express';
import {
  sendEmail,
  getSentHistory,
  getSentEmailById,
} from '../controllers/emailController.js';

const router = Router();

router.post('/send', sendEmail);
router.get('/history', getSentHistory);
router.get('/:id', getSentEmailById);

export default router;
