import { Request, Response, NextFunction } from 'express';
import { Profile } from '../models/Profile.js';
import { z } from 'zod';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  professionalTitle: z.string().min(1, 'Professional title is required').trim(),
  resumeUrl: z.string().trim().optional().or(z.literal('')),
  portfolioUrl: z.string().trim().optional().or(z.literal('')),
  linkedInUrl: z.string().trim().optional().or(z.literal('')),
  gitHubUrl: z.string().trim().optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid contact email format').or(z.literal('')).optional(),
  skillsSummary: z.string().trim().optional(),
});

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        fullName: 'Sourabh Sahu',
        professionalTitle: 'Full Stack Developer',
        resumeUrl: '',
        portfolioUrl: '',
        linkedInUrl: '',
        gitHubUrl: '',
        contactEmail: '',
        skillsSummary: 'Proficient in React, Node.js, TypeScript, Next.js, REST APIs, and MongoDB.',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = profileSchema.parse(req.body);

    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile(validatedData);
    } else {
      Object.assign(profile, validatedData);
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile,
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
