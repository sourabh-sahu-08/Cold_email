import { google } from 'googleapis';
import { ENV } from '../config/env.js';
import { AccountConfig, IAccountConfig } from '../models/AccountConfig.js';
import { IProfile } from '../models/Profile.js';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export interface GoogleConfigCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Retrieves Google OAuth credentials from database or environment.
 */
export const getGoogleCredentials = async (): Promise<GoogleConfigCredentials> => {
  let clientId = ENV.GOOGLE_CLIENT_ID;
  let clientSecret = ENV.GOOGLE_CLIENT_SECRET;
  const redirectUri = ENV.GOOGLE_REDIRECT_URI;

  try {
    const config = await AccountConfig.findOne({ key: 'primary' });
    if (config?.googleClientId?.trim()) {
      clientId = config.googleClientId.trim();
    }
    if (config?.googleClientSecret?.trim()) {
      clientSecret = config.googleClientSecret.trim();
    }
  } catch {
    // fallback to ENV
  }

  return { clientId, clientSecret, redirectUri };
};

/**
 * Creates an OAuth2 client.
 */
export const createOAuth2Client = async () => {
  const { clientId, clientSecret, redirectUri } = await getGoogleCredentials();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

/**
 * Generates the Google OAuth authorization URL.
 */
export const getAuthUrl = async (): Promise<string> => {
  const oauth2Client = await createOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  return authUrl;
};

/**
 * Exchanges authorization code for tokens and saves to AccountConfig.
 */
export const handleOAuthCallback = async (code: string): Promise<IAccountConfig> => {
  const oauth2Client = await createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  // Fetch connected user's info
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();

  let config = await AccountConfig.findOne({ key: 'primary' });
  if (!config) {
    config = new AccountConfig({ key: 'primary' });
  }

  config.gmailTokens = {
    accessToken: tokens.access_token || config.gmailTokens?.accessToken || '',
    refreshToken: tokens.refresh_token || config.gmailTokens?.refreshToken || '',
    expiryDate: tokens.expiry_date || 0,
    tokenType: tokens.token_type || 'Bearer',
    scope: tokens.scope || '',
  };

  config.connectedAccount = {
    email: userInfo.data.email || '',
    name: userInfo.data.name || '',
    picture: userInfo.data.picture || '',
    connectedAt: new Date(),
  };

  await config.save();
  return config;
};

/**
 * Gets an authenticated OAuth2 client with auto-refreshing tokens.
 */
export const getAuthenticatedClient = async () => {
  const config = await AccountConfig.findOne({ key: 'primary' });
  if (!config || !config.gmailTokens?.refreshToken) {
    throw new Error('Gmail account is not connected. Please connect your Gmail account via OAuth first.');
  }

  const oauth2Client = await createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: config.gmailTokens.accessToken,
    refresh_token: config.gmailTokens.refreshToken,
    expiry_date: config.gmailTokens.expiryDate,
  });

  // Listen for refresh tokens and persist
  oauth2Client.on('tokens', async newTokens => {
    try {
      const conf = await AccountConfig.findOne({ key: 'primary' });
      if (conf && conf.gmailTokens) {
        if (newTokens.access_token) conf.gmailTokens.accessToken = newTokens.access_token;
        if (newTokens.refresh_token) conf.gmailTokens.refreshToken = newTokens.refresh_token;
        if (newTokens.expiry_date) conf.gmailTokens.expiryDate = newTokens.expiry_date;
        await conf.save();
      }
    } catch (err) {
      console.error('[GmailService] Failed saving refreshed tokens:', err);
    }
  });

  return { oauth2Client, connectedEmail: config.connectedAccount?.email || '' };
};

/**
 * Checks Gmail connection status.
 */
export const getGmailConnectionStatus = async () => {
  const { clientId, clientSecret } = await getGoogleCredentials();
  const config = await AccountConfig.findOne({ key: 'primary' });

  const hasCredentialsConfigured = Boolean(clientId?.trim() && clientSecret?.trim());
  const isConnected = Boolean(config?.gmailTokens?.refreshToken && config?.connectedAccount?.email);

  return {
    hasCredentialsConfigured,
    isConnected,
    connectedAccount: isConnected ? config?.connectedAccount : null,
    tokensExpiryDate: config?.gmailTokens?.expiryDate,
  };
};

/**
 * Disconnects the Gmail account and clears tokens.
 */
export const disconnectGmail = async (): Promise<void> => {
  const config = await AccountConfig.findOne({ key: 'primary' });
  if (!config) return;

  if (config.gmailTokens?.accessToken) {
    try {
      const oauth2Client = await createOAuth2Client();
      await oauth2Client.revokeToken(config.gmailTokens.accessToken);
    } catch (err) {
      console.warn('[GmailService] Error revoking token with Google:', err);
    }
  }

  config.gmailTokens = {
    accessToken: '',
    refreshToken: '',
    expiryDate: 0,
    tokenType: '',
    scope: '',
  };

  config.connectedAccount = {
    email: '',
    name: '',
    picture: '',
  };

  await config.save();
};

/**
 * Builds an RFC 2822 compliant MIME message string.
 */
export const createMimeMessage = (options: {
  fromName: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
}): string => {
  const boundary = `====boundary_${Date.now()}_coldmail====`;

  // Encode subject in RFC 2047 format for non-ASCII characters
  const encodedSubject = `=?UTF-8?B?${Buffer.from(options.subject, 'utf-8').toString('base64')}?=`;

  const mimeLines = [
    `From: "${options.fromName.replace(/"/g, '')}" <${options.fromEmail}>`,
    `To: <${options.toEmail}>`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    options.bodyText,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    options.bodyHtml,
    '',
    `--${boundary}--`,
  ];

  const rawMessage = mimeLines.join('\r\n');

  // Convert to URL-safe Base64
  return Buffer.from(rawMessage, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Sends an email using Gmail API.
 */
export const sendEmailViaGmail = async (options: {
  recipientEmail: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  profile: IProfile;
}): Promise<{ messageId: string; threadId: string; senderEmail: string }> => {
  const { oauth2Client, connectedEmail } = await getAuthenticatedClient();

  if (!connectedEmail) {
    throw new Error('Connected email address not found in credentials.');
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const raw = createMimeMessage({
    fromName: options.profile.fullName || 'Sourabh Sahu',
    fromEmail: connectedEmail,
    toEmail: options.recipientEmail,
    subject: options.subject,
    bodyText: options.bodyText,
    bodyHtml: options.bodyHtml,
  });

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw,
    },
  });

  return {
    messageId: response.data.id || '',
    threadId: response.data.threadId || '',
    senderEmail: connectedEmail,
  };
};
