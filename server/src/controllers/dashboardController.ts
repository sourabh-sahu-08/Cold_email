import { Request, Response, NextFunction } from 'express';
import { SentEmail } from '../models/SentEmail.js';
import { Contact } from '../models/Contact.js';
import { Profile } from '../models/Profile.js';
import { getGmailConnectionStatus } from '../services/gmailService.js';

export const getDashboardMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalSentEmails,
      distinctRecipients,
      totalContacts,
      recentSentEmails,
      profile,
      gmailStatus,
    ] = await Promise.all([
      SentEmail.countDocuments({ status: 'Sent' }),
      SentEmail.distinct('recipientEmail', { status: 'Sent' }),
      Contact.countDocuments(),
      SentEmail.find().sort({ sentAt: -1 }).limit(5),
      Profile.findOne(),
      getGmailConnectionStatus(),
    ]);

    // Calculate unique recruiters contacted
    const totalRecruitersContacted = distinctRecipients.length;

    // Check profile completion items
    const profileConfigured = Boolean(
      profile &&
      profile.fullName &&
      (profile.resumeUrl || profile.portfolioUrl || profile.linkedInUrl || profile.gitHubUrl)
    );

    res.json({
      success: true,
      data: {
        userName: profile?.fullName || 'Sourabh Sahu',
        userTitle: profile?.professionalTitle || 'Full Stack Developer',
        totalEmailsSent: totalSentEmails,
        totalRecruitersContacted,
        totalContactsSaved: totalContacts,
        recentEmails: recentSentEmails,
        gmailStatus,
        profileConfigured,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
