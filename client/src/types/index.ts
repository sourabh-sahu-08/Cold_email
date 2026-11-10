export interface Profile {
  _id?: string;
  fullName: string;
  professionalTitle: string;
  resumeUrl: string;
  portfolioUrl: string;
  linkedInUrl: string;
  gitHubUrl: string;
  contactEmail: string;
  skillsSummary?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contact {
  _id: string;
  name?: string;
  email: string;
  company?: string;
  designation?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SentEmail {
  _id: string;
  recipientEmail: string;
  recipientName?: string;
  company?: string;
  jobRole?: string;
  purpose: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  status: 'Sent' | 'Failed';
  messageId?: string;
  threadId?: string;
  errorMessage?: string;
  sentAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GmailStatus {
  hasCredentialsConfigured: boolean;
  isConnected: boolean;
  connectedAccount?: {
    email?: string;
    name?: string;
    picture?: string;
    connectedAt?: string;
  } | null;
  tokensExpiryDate?: number;
}

export interface DashboardMetrics {
  userName: string;
  userTitle: string;
  totalEmailsSent: number;
  totalRecruitersContacted: number;
  totalContactsSaved: number;
  recentEmails: SentEmail[];
  gmailStatus: GmailStatus;
  profileConfigured: boolean;
}

export interface SettingsData {
  geminiApiKeyMasked: string;
  hasGeminiApiKey: boolean;
  googleClientId: string;
  hasGoogleClientId: boolean;
  hasGoogleClientSecret: boolean;
  redirectUri: string;
  dailySendLimit: number;
  connectedAccount: {
    email?: string;
    name?: string;
    picture?: string;
  } | null;
}

export type EmailPurpose =
  | 'Internship Application'
  | 'Full-Time Job Application'
  | 'Referral Request'
  | 'General Job Opportunity'
  | 'Follow-up Email';

export interface GenerateEmailRequest {
  recruiterName?: string;
  recruiterEmail: string;
  companyName?: string;
  jobRole?: string;
  purpose: EmailPurpose;
  additionalNotes?: string;
}

export interface GeneratedEmailResponse {
  subject: string;
  bodyText: string;
  bodyHtml: string;
  provider: 'gemini' | 'smart-template';
  modelUsed?: string;
}

export interface SendEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  company?: string;
  jobRole?: string;
  purpose: EmailPurpose;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  saveContact?: boolean;
}
