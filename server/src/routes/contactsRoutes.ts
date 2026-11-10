import { Router } from 'express';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactsController.js';

const router = Router();

router.get('/', getContacts);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
