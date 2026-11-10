import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SentEmail } from '../models/SentEmail.js';
import { Profile } from '../models/Profile.js';
import { Contact } from '../models/Contact.js';
import { AccountConfig } from '../models/AccountConfig.js';
import { sendEmailViaGmail, getGmailConnectionStatus } from '../services/gmailService.js';

const sendEmailSchema = z.object({
  recipientEmail: z.string().email('Valid recipient email address is required').trim().toLowerCase(),
  recipientName: z.string().trim().optional(),
  company: z.string().trim().optional(),
  jobRole: z.string().trim().optional(),
  purpose: z.string().min(1, 'Email purpose is required'),
  subject: z.string().min(1, 'Subject cannot be empty').trim(),
  bodyText: z.string().min(1, 'Email body cannot be empty'),
  bodyHtml: z.string().optional(),
  saveContact: z.boolean().optional(),
});

export const sendEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = sendEmailSchema.parse(req.body);

    // 1. Verify Gmail connection status
    const authStatus = await getGmailConnectionStatus();
    if (!authStatus.isConnected) {
      res.status(400).json({
        success: false,
        message: 'Your Gmail account is not connected. Please connect Gmail in Settings before sending.',
        needsAuth: true,
      });
      return;
    }

    // 2. Prevent accidental duplicate sends within 60 seconds
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    const recentDuplicate = await SentEmail.findOne({
      recipientEmail: validatedData.recipientEmail,
      subject: validatedData.subject,
      status: 'Sent',
      sentAt: { $gte: sixtySecondsAgo },
    });

    if (recentDuplicate) {
      res.status(429).json({
        success: false,
        message: 'A duplicate email with the same subject was sent to this recipient less than a minute ago. Please wait before re-sending.',
      });
      return;
    }

    // 3. Check daily send limit (default 50)
    const config = await AccountConfig.findOne({ key: 'primary' });
    const dailyLimit = config?.dailySendLimit || 50;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await SentEmail.countDocuments({
      status: 'Sent',
      sentAt: { $gte: startOfDay },
    });

    if (todayCount >= dailyLimit) {
      res.status(429).json({
        success: false,
        message: `Daily sending limit reached (${todayCount}/${dailyLimit} emails sent today). You can increase the limit in Settings.`,
      });
      return;
    }

    // 4. Retrieve Profile for sender name
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        fullName: 'Sourabh Sahu',
        professionalTitle: 'Full Stack Developer',
      });
    }

    // Prepare HTML body if not provided
    const bodyHtml =
      validatedData.bodyHtml ||
      `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b;">
        ${validatedData.bodyText
          .split('\n\n')
          .map(p => `<p style="margin: 0 0 16px 0;">${p.replace(/\n/g, '<br>')}</p>`)
          .join('')}
      </div>`;

    // 5. Send email via Gmail API
    let sendResult;
    try {
      sendResult = await sendEmailViaGmail({
        recipientEmail: validatedData.recipientEmail,
        subject: validatedData.subject,
        bodyText: validatedData.bodyText,
        bodyHtml,
        profile,
      });
    } catch (sendError: any) {
      // Record failed attempt in database
      await SentEmail.create({
        recipientEmail: validatedData.recipientEmail,
        recipientName: validatedData.recipientName || '',
        company: validatedData.company || '',
        jobRole: validatedData.jobRole || '',
        purpose: validatedData.purpose,
        subject: validatedData.subject,
        bodyText: validatedData.bodyText,
        bodyHtml,
        status: 'Failed',
        errorMessage: sendError.message || 'Failed sending via Gmail API',
        sentAt: new Date(),
      });

      res.status(502).json({
        success: false,
        message: `Gmail API Error: ${sendError.message || 'Failed to send email'}`,
      });
      return;
    }

    // 6. Record successful send in database
    const sentRecord = await SentEmail.create({
      recipientEmail: validatedData.recipientEmail,
      recipientName: validatedData.recipientName || '',
      company: validatedData.company || '',
      jobRole: validatedData.jobRole || '',
      purpose: validatedData.purpose,
      subject: validatedData.subject,
      bodyText: validatedData.bodyText,
      bodyHtml,
      status: 'Sent',
      messageId: sendResult.messageId,
      threadId: sendResult.threadId,
      sentAt: new Date(),
    });

    // 7. Auto-save contact if requested or if not exists
    if (validatedData.saveContact !== false) {
      const existingContact = await Contact.findOne({ email: validatedData.recipientEmail });
      if (!existingContact) {
        await Contact.create({
          name: validatedData.recipientName || '',
          email: validatedData.recipientEmail,
          company: validatedData.company || '',
          designation: validatedData.jobRole || '',
          notes: `Sent ${validatedData.purpose} on ${new Date().toLocaleDateString()}`,
        });
      }
    }

    res.json({
      success: true,
      message: `Email successfully sent to ${validatedData.recipientEmail}!`,
      data: sentRecord,
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

export const getSentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, company, purpose, status, page = 1, limit = 50 } = req.query;

    const query: any = {};

    if (company && typeof company === 'string' && company.trim()) {
      query.company = new RegExp(company.trim(), 'i');
    }

    if (purpose && typeof purpose === 'string' && purpose.trim()) {
      query.purpose = purpose.trim();
    }

    if (status && typeof status === 'string' && status.trim()) {
      query.status = status.trim();
    }

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { recipientEmail: regex },
        { recipientName: regex },
        { company: regex },
        { jobRole: regex },
        { subject: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [emails, total] = await Promise.all([
      SentEmail.find(query).sort({ sentAt: -1 }).skip(skip).limit(limitNum),
      SentEmail.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: emails,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getSentEmailById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const email = await SentEmail.findById(id);

    if (!email) {
      res.status(404).json({
        success: false,
        message: 'Email record not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: email,
    });
  } catch (error: any) {
    next(error);
  }
};
