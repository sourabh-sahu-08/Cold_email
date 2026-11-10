import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Profile } from '../models/Profile.js';
import { generateEmailWithAI } from '../services/geminiService.js';

const generateEmailSchema = z.object({
  recruiterName: z.string().trim().optional(),
  recruiterEmail: z.string().email('Valid recipient email address is required').trim(),
  companyName: z.string().trim().optional(),
  jobRole: z.string().trim().optional(),
  purpose: z.string().min(1, 'Email purpose is required'),
  additionalNotes: z.string().trim().optional(),
});

export const generateEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = generateEmailSchema.parse(req.body);

    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        fullName: 'Sourabh Sahu',
        professionalTitle: 'Full Stack Developer',
      });
    }

    const result = await generateEmailWithAI({
      ...validatedData,
      profile,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Invalid parameters',
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};
