import { Request, Response, NextFunction } from 'express';
import {
  getAuthUrl,
  handleOAuthCallback,
  getGmailConnectionStatus,
  disconnectGmail,
} from '../services/gmailService.js';
import { ENV } from '../config/env.js';

export const getGoogleAuthUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authUrl = await getAuthUrl();
    res.json({ success: true, authUrl });
  } catch (error: any) {
    next(error);
  }
};

export const handleGoogleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error('[OAuth] Google error response:', error);
      res.redirect(`${ENV.CLIENT_URL}/settings?error=${encodeURIComponent(String(error))}`);
      return;
    }

    if (!code || typeof code !== 'string') {
      res.redirect(`${ENV.CLIENT_URL}/settings?error=missing_code`);
      return;
    }

    await handleOAuthCallback(code);
    res.redirect(`${ENV.CLIENT_URL}/settings?connected=true`);
  } catch (error: any) {
    console.error('[OAuth] Callback error:', error);
    res.redirect(`${ENV.CLIENT_URL}/settings?error=${encodeURIComponent(error.message || 'auth_failed')}`);
  }
};

export const getAuthStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const status = await getGmailConnectionStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    next(error);
  }
};

export const disconnectGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await disconnectGmail();
    res.json({
      success: true,
      message: 'Gmail disconnected successfully.',
    });
  } catch (error: any) {
    next(error);
  }
};
