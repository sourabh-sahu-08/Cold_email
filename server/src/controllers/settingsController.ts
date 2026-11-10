import { Request, Response, NextFunction } from 'express';
import { AccountConfig } from '../models/AccountConfig.js';
import { ENV } from '../config/env.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let config = await AccountConfig.findOne({ key: 'primary' });
    if (!config) {
      config = await AccountConfig.create({ key: 'primary' });
    }

    const effectiveGeminiKey = config.geminiApiKey || ENV.GEMINI_API_KEY;
    const effectiveClientId = config.googleClientId || ENV.GOOGLE_CLIENT_ID;
    const effectiveClientSecret = config.googleClientSecret || ENV.GOOGLE_CLIENT_SECRET;

    // Mask secret keys for safe display
    const maskKey = (key?: string) => {
      if (!key || key.length < 8) return key ? '••••••••' : '';
      return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
    };

    res.json({
      success: true,
      data: {
        geminiApiKeyMasked: maskKey(effectiveGeminiKey),
        hasGeminiApiKey: Boolean(effectiveGeminiKey?.trim()),
        googleClientId: effectiveClientId ? `${effectiveClientId.slice(0, 12)}...` : '',
        hasGoogleClientId: Boolean(effectiveClientId?.trim()),
        hasGoogleClientSecret: Boolean(effectiveClientSecret?.trim()),
        redirectUri: ENV.GOOGLE_REDIRECT_URI,
        dailySendLimit: config.dailySendLimit || 50,
        connectedAccount: config.connectedAccount?.email ? config.connectedAccount : null,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { geminiApiKey, googleClientId, googleClientSecret, dailySendLimit } = req.body;

    let config = await AccountConfig.findOne({ key: 'primary' });
    if (!config) {
      config = new AccountConfig({ key: 'primary' });
    }

    if (geminiApiKey !== undefined && geminiApiKey !== null && geminiApiKey.trim()) {
      config.geminiApiKey = geminiApiKey.trim();
    }

    if (googleClientId !== undefined && googleClientId !== null && googleClientId.trim()) {
      config.googleClientId = googleClientId.trim();
    }

    if (googleClientSecret !== undefined && googleClientSecret !== null && googleClientSecret.trim()) {
      config.googleClientSecret = googleClientSecret.trim();
    }

    if (dailySendLimit && Number(dailySendLimit) > 0) {
      config.dailySendLimit = Number(dailySendLimit);
    }

    await config.save();

    res.json({
      success: true,
      message: 'Settings updated successfully.',
    });
  } catch (error: any) {
    next(error);
  }
};

export const testGeminiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { apiKey } = req.body;

    let keyToTest = apiKey?.trim();
    if (!keyToTest) {
      const config = await AccountConfig.findOne({ key: 'primary' });
      keyToTest = config?.geminiApiKey?.trim() || ENV.GEMINI_API_KEY;
    }

    if (!keyToTest) {
      res.status(400).json({
        success: false,
        message: 'No API key provided to test.',
      });
      return;
    }

    // Check if OpenRouter key
    if (keyToTest.startsWith('sk-or-') || keyToTest.startsWith('sk-')) {
      const resOpenRouter = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyToTest}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'ColdMail',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: 50,
          messages: [{ role: 'user', content: 'Say "OpenRouter connection verified"' }],
        }),
      });

      if (!resOpenRouter.ok) {
        const errorText = await resOpenRouter.text();
        res.status(400).json({
          success: false,
          message: `OpenRouter verification error (${resOpenRouter.status}): ${errorText}`,
        });
        return;
      }

      const openRouterJson: any = await resOpenRouter.json();
      const text = openRouterJson?.choices?.[0]?.message?.content || 'Verified';

      res.json({
        success: true,
        message: 'OpenRouter API key is valid and connected to Google Gemini 2.5 Flash!',
        response: text.trim(),
      });
      return;
    }

    // Native Google Gemini SDK
    const genAI = new GoogleGenerativeAI(keyToTest);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const testResult = await model.generateContent('Say "Gemini connection verified"');
    const text = testResult.response.text();

    res.json({
      success: true,
      message: 'Gemini API key is valid and working!',
      response: text.trim(),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: `AI verification failed: ${error.message || 'Invalid API key or network error'}`,
    });
  }
};
