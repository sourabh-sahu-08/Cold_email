import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Contact } from '../models/Contact.js';

const contactSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().email('Invalid email address format').trim().toLowerCase(),
  company: z.string().trim().optional(),
  designation: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { name: regex },
          { email: regex },
          { company: regex },
          { designation: regex },
          { notes: regex },
        ],
      };
    }

    const contacts = await Contact.find(query).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = contactSchema.parse(req.body);

    const existing = await Contact.findOne({ email: validatedData.email });
    if (existing) {
      res.status(409).json({
        success: false,
        message: `Contact with email '${validatedData.email}' already exists.`,
      });
      return;
    }

    const contact = await Contact.create(validatedData);

    res.status(201).json({
      success: true,
      message: 'Contact created successfully.',
      data: contact,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Validation error',
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};

export const updateContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = contactSchema.parse(req.body);

    // If email is changed, ensure no other contact uses this email
    const duplicate = await Contact.findOne({
      email: validatedData.email,
      _id: { $ne: id },
    });

    if (duplicate) {
      res.status(409).json({
        success: false,
        message: `Another contact already exists with email '${validatedData.email}'.`,
      });
      return;
    }

    const contact = await Contact.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });

    if (!contact) {
      res.status(404).json({
        success: false,
        message: 'Contact not found.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Contact updated successfully.',
      data: contact,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Validation error',
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};

export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      res.status(404).json({
        success: false,
        message: 'Contact not found.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully.',
    });
  } catch (error: any) {
    next(error);
  }
};
